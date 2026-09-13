---
name: gitnexus-exploring
description: Trace unfamiliar code execution flows and callers using GitNexus. Use for architecture or behavior questions that require dependency context.
---

# Explore Code with GitNexus

Use [AGENTS.md](../../../../AGENTS.md) for repository boundaries and unavailable-tool handling.

Start with `query({search_query: "<behavior>", repo: "hizakozou"})` when locating an unfamiliar execution flow. For a known symbol, use `context({name: "<symbol>", repo: "hizakozou"})` directly when callers or callees answer the question.

Read the returned source locations to confirm behavior. Open a returned `gitnexus://repo/hizakozou/process/{name}` only if a full trace is needed. Check index freshness when relying on graph coverage; do not load all clusters or enumerate repositories when this repository is already known.

Finish when the requested behavior is explained with source evidence and any graph limits. A known text or image-reference lookup does not need a graph workflow.
