declare global {
    interface Window {
        __UNIVER_PANEL_URL__?: string
    }
}

const importMeta: any = typeof import.meta !== 'undefined' ? import.meta : undefined
const envPanel = importMeta?.env?.VITE_PANEL_BASE_URL
const windowPanel = typeof window !== 'undefined' ? window.__UNIVER_PANEL_URL__ : undefined
const DEFAULT_PANEL = 'http://localhost:8787'
const PANEL_ORIGIN_RAW = (envPanel || windowPanel || DEFAULT_PANEL) as string
const PANEL_ORIGIN = PANEL_ORIGIN_RAW.replace(/\/$/, '')
const CHAT_ENDPOINT = `${PANEL_ORIGIN}/api/chat`

function createAssistantUI() {
    const style = document.createElement('style')
    style.textContent = `
    #univer-assistant-toggle {
      position: fixed;
      right: 18px;
      bottom: 18px;
      z-index: 9999;
      padding: 10px 16px;
      border-radius: 999px;
      border: none;
      background: #2563eb;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 6px 18px rgba(37, 99, 235, 0.35);
    }
    #univer-assistant-panel {
      position: fixed;
      right: 18px;
      bottom: 70px;
      width: min(360px, 90vw);
      max-height: min(520px, 80vh);
      display: none;
      flex-direction: column;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 18px 38px rgba(15, 23, 42, 0.25);
      border: 1px solid #e5e7eb;
      z-index: 9999;
      overflow: hidden;
      font-family: -apple-system, system-ui, 'Segoe UI', sans-serif;
    }
    #univer-assistant-panel.open {
      display: flex;
    }
    #univer-assistant-panel header {
      padding: 12px 16px;
      border-bottom: 1px solid #f1f5f9;
      font-weight: 600;
      font-size: 14px;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    #univer-assistant-panel header span {
      flex: 1;
    }
    #univer-assistant-panel header input[type="text"] {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 8px;
      border: 1px solid #cbd5f5;
      background: #fff;
      color: #1f2937;
      min-width: 170px;
    }
    #univer-assistant-panel .conversation {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #f9fafb;
    }
    #univer-assistant-panel .message {
      max-width: 80%;
      padding: 10px 12px;
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.4;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    #univer-assistant-panel .message.user {
      margin-left: auto;
      background: #2563eb;
      color: #fff;
    }
    #univer-assistant-panel .message.assistant {
      margin-right: auto;
      background: #fff;
      border: 1px solid #e2e8f0;
      color: #0f172a;
    }
    #univer-assistant-panel .message.tool {
      margin-right: auto;
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      color: #334155;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
      font-size: 12px;
    }
    #univer-assistant-panel form {
      border-top: 1px solid #f1f5f9;
      padding: 12px;
      display: grid;
      gap: 8px;
      background: #fff;
    }
    #univer-assistant-panel textarea {
      resize: none;
      border: 1px solid #cbd5f5;
      border-radius: 10px;
      padding: 10px;
      min-height: 60px;
      font-family: inherit;
      font-size: 13px;
      outline: none;
    }
    #univer-assistant-panel textarea:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.25);
    }
    #univer-assistant-panel button.send {
      justify-self: end;
      padding: 8px 16px;
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
    }
    #univer-assistant-panel button.send[disabled] {
      opacity: 0.6;
      cursor: default;
    }
    `
    document.head.appendChild(style)

    const toggle = document.createElement('button')
    toggle.id = 'univer-assistant-toggle'
    toggle.type = 'button'
    toggle.textContent = 'Assistant'

    const panel = document.createElement('div')
    panel.id = 'univer-assistant-panel'
    panel.innerHTML = `
      <header>
        <span>Spreadsheet Assistant</span>
        <input id="univer-assistant-model" type="text" list="univer-assistant-models" placeholder="Model name" />
        <datalist id="univer-assistant-models"></datalist>
      </header>
      <div class="conversation" id="univer-assistant-convo"></div>
      <form id="univer-assistant-form">
        <textarea id="univer-assistant-input" placeholder="Ask me to update cells, summarize data, etc."></textarea>
        <button class="send" type="submit">Send</button>
      </form>
    `

    document.body.appendChild(toggle)
    document.body.appendChild(panel)

    const convo = panel.querySelector('#univer-assistant-convo') as HTMLDivElement
    const form = panel.querySelector('#univer-assistant-form') as HTMLFormElement
    const input = panel.querySelector('#univer-assistant-input') as HTMLTextAreaElement
    const sendBtn = panel.querySelector('button.send') as HTMLButtonElement
    const modelInput = panel.querySelector('#univer-assistant-model') as HTMLInputElement
    const modelList = panel.querySelector('#univer-assistant-models') as HTMLDataListElement

    const MODEL_STORAGE_KEY = 'univer-assistant-model-choice'
    let selectedModel = localStorage.getItem(MODEL_STORAGE_KEY) || ''
    const MODEL_NAME_PLACEHOLDER = selectedModel || 'x-ai/grok-4-fast:free'

    const messages: Array<{ role: string; content: string; tool_call_id?: string; name?: string; tool_calls?: any }> = []

    function render() {
        convo.innerHTML = ''
        for (const msg of messages) {
            if (!msg.content) continue
            const div = document.createElement('div')
            const roleClass = msg.role === 'tool' ? 'tool' : msg.role === 'assistant' ? 'assistant' : 'user'
            div.className = `message ${roleClass}`
            div.textContent = msg.content
            convo.appendChild(div)
        }
        convo.scrollTop = convo.scrollHeight
    }

    function setModel(model: string) {
        const trimmed = model.trim()
        if (!trimmed) return
        selectedModel = trimmed
        localStorage.setItem(MODEL_STORAGE_KEY, selectedModel)
        if (modelInput && modelInput.value.trim() !== trimmed) {
            modelInput.value = trimmed
        }
    }

    async function loadModels() {
        try {
            const data = await fetch(`${PANEL_ORIGIN}/api/models`).then((r) => r.json())
            const models: string[] = Array.isArray(data?.models) ? data.models.filter((m) => typeof m === 'string') : []
            modelList.innerHTML = ''
            for (const name of models) {
                const option = document.createElement('option')
                option.value = name
                modelList.appendChild(option)
            }
            const current = selectedModel || ''
            if (current) {
                setModel(current)
                if (!models.includes(current)) {
                    const option = document.createElement('option')
                    option.value = current
                    modelList.appendChild(option)
                }
            } else {
                const fallback = typeof data?.default === 'string' ? data.default : models[0]
                if (fallback) {
                    setModel(fallback)
                } else {
                    setModel(MODEL_NAME_PLACEHOLDER)
                }
            }
        } catch (error) {
            console.warn('[assistant] failed to load models', error)
            if (!selectedModel) {
                setModel(MODEL_NAME_PLACEHOLDER)
            } else {
                modelInput.value = selectedModel
            }
        }
    }

    modelInput.addEventListener('change', () => {
        const value = modelInput.value.trim()
        if (value) {
            setModel(value)
            const exists = Array.from(modelList.options).some((opt) => opt.value === value)
            if (!exists) {
                const option = document.createElement('option')
                option.value = value
                modelList.appendChild(option)
            }
        }
    })

    modelInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            const value = modelInput.value.trim()
            if (value) {
                setModel(value)
                const exists = Array.from(modelList.options).some((opt) => opt.value === value)
                if (!exists) {
                    const option = document.createElement('option')
                    option.value = value
                    modelList.appendChild(option)
                }
                form.dispatchEvent(new Event('submit'))
            }
        }
    })

    loadModels().catch(() => {
        setModel(selectedModel || MODEL_NAME_PLACEHOLDER)
    })

    async function sendMessage(text: string) {
        const trimmed = text.trim()
        if (!trimmed) return
        const currentInputModel = modelInput.value.trim()
        if (currentInputModel && currentInputModel !== selectedModel) {
            setModel(currentInputModel)
        }
        messages.push({ role: 'user', content: trimmed })
        render()
        input.value = ''
        input.style.height = 'auto'
        sendBtn.disabled = true
        toggle.disabled = true
        try {
            const response = await fetch(CHAT_ENDPOINT, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ messages, model: selectedModel }),
            })
            const data = await response.json()
            if (!response.ok || data.error) {
                messages.push({ role: 'assistant', content: `⚠️ ${data.error || response.statusText}` })
            } else if (Array.isArray(data.messages)) {
                messages.length = 0
                for (const msg of data.messages) {
                    messages.push({
                        role: msg.role,
                        content: msg.content ?? '',
                        tool_call_id: msg.tool_call_id,
                        name: msg.name,
                        tool_calls: msg.tool_calls,
                    })
                }
                if (typeof data.model === 'string') {
                    setModel(data.model)
                }
            } else {
                messages.push({ role: 'assistant', content: data.reply || '(No reply)' })
            }
       } catch (error) {
            messages.push({ role: 'assistant', content: `⚠️ ${String(error)}` })
        } finally {
            render()
            sendBtn.disabled = false
            toggle.disabled = false
        }
    }

    toggle.addEventListener('click', () => {
        panel.classList.toggle('open')
        if (panel.classList.contains('open')) {
            render()
            input.focus()
        }
    })

    form.addEventListener('submit', (event) => {
        event.preventDefault()
        sendMessage(input.value)
    })

    input.addEventListener('input', () => {
        input.style.height = 'auto'
        input.style.height = `${Math.min(160, input.scrollHeight)}px`
    })

    // greet
    messages.push({ role: 'assistant', content: 'Hi! Ask me to inspect or update the sheet and I will use Univer MCP tools for you.' })
    render()
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createAssistantUI)
} else {
    createAssistantUI()
}
