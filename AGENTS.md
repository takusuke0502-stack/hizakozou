# Blog Ops Guide

This repository is a static site for `https://hizakozou.jp`.

## Source Of Truth

- New blog drafts start in `content/source/*.md`.
- Do not hand-edit `blog/`, `blog.html`, `blog-detail.html`, `sitemap.xml`, or `data/blog-posts.json`.
- Generated support files in `content/seo/` and `content/meo/` are also derived outputs.

## Required Workflow

1. Add or update one Markdown file in `content/source/`.
2. Use UTF-8 frontmatter in this shape:

```yaml
---
title: 記事タイトル
slug: url-slug
date: YYYY-MM-DD
description: 120-140字程度の説明文
category: 膝の痛み
region: 柏市
tags: 膝痛,タグ2
symptoms: 変形性膝関節症,腰痛
heroImage: /image/example.webp
draft: false
replaceSlug: old-url-slug
---
```

3. Run one of these commands:
   - All source files: `npm run generate:blog`
   - One source file: `npm run generate:blog:source -- --source content/source/YYYY-MM-slug.md`
4. Review the generated diff.
5. Commit and push the branch.

## Markdown Rules

- Intro paragraphs before the first `##` become the article lead.
- `##` becomes a major section.
- `###` becomes a subsection.
- Bullet-only blocks under a heading become checklist sections.
- A `## よくある質問` or `## FAQ` section with `###` question headings becomes FAQ data.
- `draft: true` removes that post from `data/blog-posts.json` and keeps the draft source file only.
- `replaceSlug` is optional and removes an old slug when you rename an article URL.

## Agent Expectations

- Prefer editing `content/source/*.md` only for article content.
- After changing source files, always run the generator before finishing.
- If a new symptom label is introduced and the generated symptom link falls back to `/index.html#symptoms`, update `scripts/generate-blog.mjs` with a proper mapping.
- Keep `AGENTS.md` as the detailed source of truth. `CLAUDE.md` and `blog/README.md` should stay as short pointers back here.

## Publishing Notes

- `npm run generate:blog` updates:
  - `data/blog-posts.json`
  - `content/seo/*.md`
  - `content/meo/*.txt`
  - `blog/index.html`
  - `blog/posts/*/index.html`
  - `blog.html`
  - `blog-detail.html`
  - `sitemap.xml`
  - related article blocks inside `symptoms/*.html`

- GitHub Actions workflow: `.github/workflows/generate-blog-content.yml`
- Default branch: `main`

## Claude Code Integrations

| Name | Workflow | Trigger | Purpose |
|------|----------|---------|---------|
| superpowers:claude | `.github/workflows/claude.yml` | `@claude` mention in issue/PR | General-purpose coding with full tool access |
| Codereview | `.github/workflows/claude-code-review.yml` | PR opened/updated | Automatic Japanese code review |
| frontenddesign | `.github/workflows/claude-frontend-design.yml` | `@claude` + design keywords | Frontend/CSS/HTML assistance |
| conrext | `.claude/settings.json` | Session start | Context7 MCP for library docs; `npm install` hook |

All workflows require the `ANTHROPIC_API_KEY` repository secret to be set.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **hizakozou** (2028 symbols, 2466 relationships, 29 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/hizakozou/context` | Codebase overview, check index freshness |
| `gitnexus://repo/hizakozou/clusters` | All functional areas |
| `gitnexus://repo/hizakozou/processes` | All execution flows |
| `gitnexus://repo/hizakozou/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
