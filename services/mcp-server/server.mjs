import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = Number(process.env.PORT || 8787)
const HOST = process.env.HOST || '127.0.0.1'
const UNIVER_API_KEY = process.env.UNIVER_API_KEY
const UNIVER_SESSION_ID = process.env.UNIVER_SESSION_ID || 'default'
const UNIVER_MCP_BASE = (process.env.UNIVER_MCP_BASE || 'https://mcp.univer.ai/mcp/').replace(/\/*$/, '/')
const MODEL_API_BASE = (process.env.MODEL_API_BASE || '').replace(/\/*$/, '')
const MODEL_API_KEY = process.env.MODEL_API_KEY
const MODEL_NAME = process.env.MODEL_NAME || 'x-ai/grok-4-fast:free'
const MODEL_REFERER = process.env.MODEL_REFERER || 'http://localhost:8787'
const MODEL_TITLE = process.env.MODEL_TITLE || 'Univer Local Panel'
const OPENROUTER_MODELS = (process.env.OPENROUTER_MODELS || MODEL_NAME)
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean)
const AVAILABLE_MODELS = OPENROUTER_MODELS.length ? OPENROUTER_MODELS : [MODEL_NAME]

if (!UNIVER_API_KEY) {
  console.error('[FATAL] Set UNIVER_API_KEY in .env')
  process.exit(1)
}

const app = express()
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'content-type')
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  if (req.method === 'OPTIONS') {
    res.sendStatus(204)
    return
  }
  next()
})
app.use(express.json({ limit: '2mb' }))
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }))

async function rpc(method, params = {}) {
  const url = `${UNIVER_MCP_BASE}?univer_session_id=${encodeURIComponent(UNIVER_SESSION_ID)}`
  const body = { jsonrpc: '2.0', id: Math.floor(Math.random() * 1e9), method, params }
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      authorization: `Bearer ${UNIVER_API_KEY}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`MCP HTTP ${res.status}: ${text || res.statusText}`)
  }
  const contentType = res.headers.get('content-type') || ''
  let json
  if (contentType.includes('text/event-stream')) {
    const raw = await res.text()
    const candidates = []
    for (const block of raw.split(/\n\n+/)) {
      for (const line of block.split(/\n/)) {
        if (!line.startsWith('data:')) continue
        const slice = line.slice(5).trim()
        if (!slice || slice === '[DONE]') continue
        try {
          candidates.push(JSON.parse(slice))
        } catch (_) {
          // ignore partial chunks
        }
      }
    }
    if (!candidates.length) {
      throw new Error('Failed to parse SSE payload from MCP response')
    }
    json = candidates[candidates.length - 1]
  } else {
    json = await res.json()
  }
  if (json.error) {
    const { code, message, data } = json.error
    throw new Error(`MCP ${code}: ${message}${data ? ` — ${JSON.stringify(data)}` : ''}`)
  }
  return json
}

let cachedTools = []
let cachedAt = 0
async function getTools() {
  const now = Date.now()
  if (!cachedTools.length || now - cachedAt > 30_000) {
    const payload = await rpc('tools/list', {})
    cachedTools = payload.tools || payload.result?.tools || []
    cachedAt = now
  }
  return cachedTools
}

app.post('/api/list-tools', async (_req, res) => {
  try {
    const result = await rpc('tools/list', {})
    res.json(result)
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
})

app.post('/api/call-tool', async (req, res) => {
  try {
    const { name, args } = req.body || {}
    if (!name) return res.status(400).json({ error: 'Missing tool name' })
    const result = await rpc('tools/call', { name, arguments: args || {} })
    res.json(result)
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
})

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    session: UNIVER_SESSION_ID,
    mcpBase: UNIVER_MCP_BASE,
    port: PORT,
    host: HOST,
  })
})

app.get('/api/models', (_req, res) => {
  res.json({
    models: AVAILABLE_MODELS,
    default: MODEL_NAME,
  })
})

function normalizeMessages(messages = []) {
  return (messages || []).map((msg) => {
    const base = { role: msg.role, content: msg.content ?? '' }
    if (msg.role === 'assistant' && msg.tool_calls) {
      return { ...base, tool_calls: msg.tool_calls }
    }
    if (msg.role === 'tool') {
      return {
        role: 'tool',
        name: msg.name,
        tool_call_id: msg.tool_call_id,
        content: msg.content ?? '',
      }
    }
    return base
  })
}

function getCurrentModel(requested) {
  if (requested && typeof requested === 'string' && requested.trim()) {
    return requested.trim()
  }
  return MODEL_NAME
}

function buildToolSpec(tool) {
  const parameters = tool.inputSchema || { type: 'object' }
  return {
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description || '',
      parameters,
    },
  }
}

async function chatCompletion(messages, tools, model) {
  const url = `${MODEL_API_BASE}/chat/completions`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${MODEL_API_KEY}`,
      'HTTP-Referer': MODEL_REFERER,
      'X-Title': MODEL_TITLE,
    },
    body: JSON.stringify({
      model,
      messages,
      tools,
      tool_choice: 'auto',
    }),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Model HTTP ${response.status}: ${text || response.statusText}`)
  }
  return response.json()
}

app.post('/api/chat', async (req, res) => {
  try {
    if (!MODEL_API_BASE || !MODEL_API_KEY) {
      res.status(500).json({ error: 'MODEL_API_BASE and MODEL_API_KEY must be set in .env for chat support.' })
      return
    }

    const systemPrompt = {
      role: 'system',
      content: [
        {
          type: 'text',
          text: 'You are Univer Assistant. You control a spreadsheet via MCP tools. Focus on transforming accounting trial balances and similar tables. Always inspect the sheet with get_activity_status or get_range_data before major edits, ask for clarification when the user instruction is ambiguous, and summarize changes after each operation. Prefer set_range_data for batch updates. Never fabricate data—if required info is missing, ask the user.',
        },
      ],
    }
    let conversation = [systemPrompt, ...normalizeMessages(req.body?.messages ?? [])]
    const tools = (await getTools()).map(buildToolSpec)
    const chosenModel = getCurrentModel(typeof req.body?.model === 'string' ? req.body.model.trim() : '')

    const MAX_TOOL_LOOPS = Number(process.env.MAX_TOOL_LOOPS || 12)
    for (let step = 0; step < MAX_TOOL_LOOPS; step++) {
      const completion = await chatCompletion(conversation, tools, chosenModel)
      const choice = completion.choices?.[0]
      if (!choice) throw new Error('Model returned no choices')
      const assistantMsg = choice.message || { role: 'assistant', content: '' }
      const assistantRecord = {
        role: 'assistant',
        content: assistantMsg.content ?? '',
        tool_calls: assistantMsg.tool_calls,
      }
      conversation.push(assistantRecord)

      const toolCalls = assistantMsg.tool_calls || []
      if (!toolCalls.length) {
        res.json({ messages: conversation, raw: completion, model: chosenModel })
        return
      }

      for (const call of toolCalls) {
        const callId = call.id || `${call.function?.name || 'tool'}-${Date.now()}`
        let args = {}
        try {
          args = call.function?.arguments ? JSON.parse(call.function.arguments) : {}
        } catch (_) {
          args = {}
        }
        const toolResult = await rpc('tools/call', {
          name: call.function?.name,
          arguments: args,
        })
        conversation.push({
          role: 'tool',
          name: call.function?.name,
          tool_call_id: callId,
          content: JSON.stringify(toolResult, null, 2),
        })
      }
    }

    res.status(500).json({ error: `Tool loop exceeded ${MAX_TOOL_LOOPS} iterations` })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.listen(PORT, HOST, () => {
  console.log(`[univer-local-panel] http://${HOST}:${PORT}`)
  console.log(`Session: ${UNIVER_SESSION_ID}`)
})
