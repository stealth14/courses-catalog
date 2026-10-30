<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Graphify repository navigation

Use the existing Graphify graph when it can reduce repository exploration. See `GRAPHIFY.md` for usage. Start with focused queries instead of loading the full `graphify-out/graph.json` or scanning many files:

```powershell
.venv\Scripts\graphify.exe query "<focused question>" --budget 1500
.venv\Scripts\graphify.exe explain "<symbol>"
.venv\Scripts\graphify.exe path "<source symbol>" "<target symbol>" --undirected
```

Use results to identify relevant files and relationships, then verify current source before editing. Narrow truncated queries; use `rg` directly for exact text or when the graph is unhelpful. Treat the graph as a navigation aid that may be stale or contain inferred relationships. Refresh it with `.venv\Scripts\graphify.exe update .` when source changes make it stale; this uses AST extraction without an LLM. Keep query output focused to save context tokens.
