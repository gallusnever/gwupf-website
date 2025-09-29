import { setupUniver } from './setup-univer'
import './style.css'

const maybeEnv: any = typeof import.meta !== 'undefined' ? import.meta : undefined
const panelBase = maybeEnv?.env?.VITE_PANEL_BASE_URL
if (typeof window !== 'undefined' && panelBase) {
  window.__UNIVER_PANEL_URL__ = panelBase
}

import './mcp-assistant'

function main() {
  const univerAPI = setupUniver()

  // MCP Plugin use window.univerAPI to operate UniverSheet
  window.univerAPI = univerAPI
}

main()
