# Graphify

Knowledge-graph tooling for this repo: [graphifyy](https://pypi.org/project/graphifyy/) turns the code, docs and images into a queryable graph stored in `graphify-out/`. This file is the usage note for it — the app itself is described in [README.md](./README.md).

## What lives in `graphify-out/`

Only two files are tracked in git:

| File | Purpose |
| --- | --- |
| `graph.json` | The graph itself — nodes, edges, community names. Queryable by teammates right after cloning. |
| `manifest.json` | Content hashes from the last build, so `update` only re-extracts what changed. Portable across machines. |

Everything else (`graph.html`, `GRAPH_REPORT.md`, `cost.json`, the `.graphify_*` sidecars and `cache/`) is machine-local and gitignored — see the graphify docs on sharing a graph.

## Prerequisites

`graphifyy` is installed in the repo virtualenv; plain `python` is **not** on PATH on this machine, so call the venv directly:

```powershell
.venv\Scripts\graphify.exe --help
# or, without the console script:
.venv\Scripts\python.exe -m graphify --help
```

## Querying the graph

Run these from the repo root once `graphify-out/graph.json` exists. No rebuild is needed — the graph is read as-is.

```powershell
.venv\Scripts\graphify.exe query "how do payments flow"        # breadth-first context
.venv\Scripts\graphify.exe query "where is the locale routing" --dfs
.venv\Scripts\graphify.exe path "PaymentHeader()" "Product" --undirected  # shortest path between concepts
.venv\Scripts\graphify.exe explain "AppointmentCalendar()"     # one node + its neighbours
```

Add `--budget 1500` to cap a `query` answer in tokens. `path` follows edge direction by default; pass `--undirected` when the two concepts are only linked against the arrow direction.

## Keeping it current

```powershell
.venv\Scripts\graphify.exe update .     # re-extract changed code, AST only, no LLM
```

`update` is what to run after a normal feature branch: it rebuilds only new/changed files and rewrites `graph.json` + `manifest.json`. A full rebuild (needed when docs, images or the extraction prompt change) means running the skill again:

```
/graphify .
```

The full pipeline needs the agent to do the semantic pass for docs and images when no `GEMINI_API_KEY` is set; setting one lets graphify do it itself.

## Notes

- The Copilot skill is user-level, at `~/.copilot/skills/graphify`. If it reports a version mismatch with the installed package, refresh it with `.venv\Scripts\graphify.exe install --platform copilot`.
- Ignore scratch artifacts with a `.graphifyignore` at the repo root (same syntax as `.gitignore`). Screenshots such as `.tmp-*.png` currently get extracted as images and add noise to the graph:

  ```gitignore
  .tmp-*
  ```

- Rebuilds respect `.gitignore`, so nothing ignored here leaks into the corpus.
