# Univer Local Panel (MCP)

Minimal Express + static HTML UI to call Univer’s hosted MCP (HTTP) for your local Univer playground. Also exposes a `/api/chat` bridge so an LLM can reason about the sheet and invoke MCP tools automatically.

## Prereqs
- Node 20+, pnpm
- Univer API key (paste into `.env`)
- OpenAI-compatible endpoint & key (OpenRouter by default)

## Configure
Edit `.env` and provide:
```
UNIVER_API_KEY=...
UNIVER_SESSION_ID=default

# OpenRouter defaults (for x-ai/grok-4-fast:free)
MODEL_API_BASE=https://openrouter.ai/api/v1
MODEL_API_KEY=...
MODEL_NAME=x-ai/grok-4-fast:free
MODEL_REFERER=http://localhost:8787      # required by OpenRouter terms
MODEL_TITLE=Univer Local Panel           # appears in OpenRouter logs
OPENROUTER_MODELS=x-ai/grok-4-fast:free,x-ai/grok-1:free,google/gemini-flash-1.5
```
_Using a different API?_ Point `MODEL_API_BASE` to the provider, set `MODEL_API_KEY`, and adjust `MODEL_NAME` accordingly._

## Run
```
pnpm install
pnpm dev   # loads .env and starts on http://localhost:8787
```

## Verify
- Click **List Tools** → you should see an array of tools and their `inputSchema`.
- Pick a tool, craft **Args (JSON)** per schema, click **Call Tool**, then watch the sheet update.
- Use the in-sheet assistant bubble (bottom-right) to chat; it hits `/api/chat`, which forwards to your model and invokes MCP tools when needed.
- Pick a model from the dropdown or paste any OpenRouter model name—your choice is persisted locally.

## LAN access
- The server binds to `0.0.0.0`. On your phone/laptop: `http://<your-mac-ip>:8787`.

## Security
- The API key and model key stay server-side. Do not publish this server publicly without auth.
