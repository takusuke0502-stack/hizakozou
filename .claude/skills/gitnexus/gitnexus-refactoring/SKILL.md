---
name: gitnexus-refactoring
description: Rename, move, extract, or split code symbols using GitNexus dependency context. Use for structural code changes, not prose rewording.
---

# Restructure Code

Follow [AGENTS.md](../../../../AGENTS.md) for impact analysis, risk reporting, and pre-commit checks. Preserve the requested behavior and change scope.

Before changing a function, class, or method, run upstream `impact` on the target. Use `context` only where its caller/callee detail changes the extraction or migration decision.

For a symbol rename, preview `rename({symbol_name: "oldName", new_name: "newName", dry_run: true})`. Inspect proposed edits, including textual/dynamic references, before applying `dry_run: false`. Use the actual tool schema if it differs. Do not rename by blind text substitution.

For extraction or splitting, identify the interface that callers must retain, then update the implementation and required references. The dependency direction determines the edit order; there is no universal interface-first sequence.

Review the resulting diff and affected behavior. Before committing, run `detect_changes` for the intended commit scope. If graph coverage is unavailable, disclose it and follow the bounded fallback in AGENTS.md; resolve material uncertainty rather than treating a missing result as safe.
