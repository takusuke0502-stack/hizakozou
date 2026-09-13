---
name: gitnexus-impact-analysis
description: Assess callers and execution flows affected by a code symbol change using GitNexus. Use before changing functions, classes, or methods, or for dependency-risk reviews.
---

# Assess Code Impact

Follow [AGENTS.md](../../../../AGENTS.md) for required impact reporting, commit checks, and fallback when the graph is unavailable.

Run `impact({target: "<symbol>", direction: "upstream", repo: "hizakozou"})` before the edit. Resolve ambiguous targets from tool results. Review direct dependents first, then the affected processes relevant to the proposed behavior change. Fetch symbol or process details only when the result leaves a material uncertainty.

Report direct dependents, affected processes, and the tool's risk level. A direct dependency means it needs inspection; it does **not** mean it will break. Confidence describes an edge, not the probability of a regression. Check dynamic references and shared HTML/CSS through source reads because the graph may omit them.

For pre-commit review, use `detect_changes({scope: "staged"})` after selecting the intended changes, then inspect the staged diff. Use `scope: "compare", base_ref: "main"` for a requested branch review. Do not interpret an empty result as proof of safety or invent a risk score solely from dependency counts.

Choose validation from the changed contract and affected callers. A content-only or instruction-only edit needs a diff/reference check, not symbol tracing.
