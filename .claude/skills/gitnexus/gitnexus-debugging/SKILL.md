---
name: gitnexus-debugging
description: Trace runtime failures through GitNexus execution flows. Use when a bug requires understanding calls or data flow across code.
---

# Trace a Runtime Failure

Use [AGENTS.md](../../../../AGENTS.md) for edit boundaries and graph availability. Anchor the investigation to the observed failure and expected behavior.

Use `query({search_query: "<failure or behavior>", repo: "hizakozou"})` to locate an unfamiliar path, or `context({name: "<suspect>", repo: "hizakozou"})` for a known suspect. Read the actual implementation and failure evidence before deciding the cause.

Use `trace({from: "<caller>", to: "<callee>"})` when the question is specifically how two symbols connect. Read a returned process only if its full sequence matters. Custom `cypher` queries are optional for questions the simpler tools cannot answer; consult the guide/schema before writing them.

A missing graph path can indicate an indexing limit, dynamic dispatch, or an external boundary. It does not disprove the observed failure. Before modifying a function, run impact analysis; verify the repair against the original failure and affected behavior. Stop when the requested defect is resolved and verified, rather than expanding to unrelated cleanup.
