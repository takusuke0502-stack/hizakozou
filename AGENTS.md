# Project Guide

This repository is a static site for `https://hizakozou.jp`.

## Scope and Completion

- Check the current diff before editing; preserve existing work and keep unrelated changes out of commits, including when they share a file with your changes.
- Follow the user's current target and accepted design decisions. A request for proposals ends with proposals; an implementation request includes applying the change, checking the result, and fixing regressions caused by it. Do not pause after the first implementation just to ask whether to verify it.
- Publish when authorized by the current request or established session context. `1記事プッシュ` explicitly authorizes the workflow below; an ordinary preview or instruction-file review does not itself request a push.
- For page design, favor readability, cleanliness, and trust for patients and families. Preserve accepted images and sections outside the requested area. Verify that a photo matches the adjacent explanation; inspect candidate images rather than choosing by filename alone.
- Read task-specific guidance only when relevant: article authoring uses the contract below; readability refresh uses [the refresh guide](docs/symptom-column-refresh-prompt.md); code dependency work uses the GitNexus section. Historical task details are evidence, not standing instructions.

## Verification

- Choose checks by what changed. Instruction-only edits need reference/consistency checks and a diff review; they do not require blog regeneration or site tests.
- Blog content or generator changes require generation and review of all resulting outputs, even with the single-source command. Use `npm run check:blog-links` for blog-link validation; `npm test` covers blog generation, LP structure, symptom figures, and blog links.
- For layout changes, inspect the affected page at mobile, tablet, and desktop widths; check overflow, image readability, and affected menu/CTA behavior. Shared CSS or template changes also need representative affected pages checked.
- Rerun affected checks after a fix. Expand testing when the change scope or a failure warrants it. Report checks actually performed and unresolved limitations; do not equate a passing structural test with a visual check.

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
5. When publication is authorized, commit the selected changes and required generated outputs, then push the branch.

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

## Daily Readability Refresh Trigger

When the user says `1記事プッシュ`, treat it as an explicit request to select, improve, verify, commit, and push exactly one symptom page or column article. Follow `docs/symptom-column-refresh-prompt.md`.

- Do not modify the top page as part of this trigger.
- Prefer unfinished or high-density symptom pages before already-refreshed pages, unless the user names a target.
- A column article must be edited through `content/source/*.md` and regenerated through the required blog workflow above.
- Keep unrelated staged or uncommitted changes out of the commit.
- The word `プッシュ` authorizes committing the selected item and its required generated files, then pushing the current branch after verification.

## Claude Code Integrations

Workflow definitions in `.github/workflows/claude*.yml` and hooks in `.claude/settings.json` are authoritative for integration behavior. Read them when changing the integration; do not assume a session-start hook exists from an old summary.

<!-- gitnexus:start -->
## GitNexus — Code Dependencies

Repository name: `hizakozou`. Obtain current index status from the tool or `gitnexus://repo/hizakozou/context`; do not rely on hard-coded symbol counts.

- Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})`. Report direct dependents, affected processes, and risk; warn before proceeding on HIGH or CRITICAL findings. Dependencies are possible impact, not proof of breakage.
- Before committing, run `detect_changes()` with a scope matching the commit (normally `staged`). For a branch regression review use `detect_changes({scope: "compare", base_ref: "main"})`. Inspect the actual diff too: graph results do not cover all HTML, CSS, content, or dynamic references.
- For unfamiliar execution flows use `query({search_query: "concept"})`, then `context({name: "symbolName"})` when callers/callees are needed. For known text, Markdown, image references, or selectors, use targeted file reads/search instead of building a repository map.
- If tools are unavailable, the index is stale, or a symbol is missing, disclose that limit and use source references, the diff, and relevant checks for a bounded change. Missing graph results do not mean no impact. Resolve any remaining material uncertainty before changing a shared runtime path.
- Do not rebuild the index for a prose-only edit. For an index task, use the existing runner if present; see [CLI guidance](.claude/skills/gitnexus/gitnexus-cli/SKILL.md). Review instruction-file changes produced by re-indexing.
- For symbol renames, use GitNexus `rename` with a dry run when available and inspect its edits; do not use blind find-and-replace.

Read only the relevant skill:

| Task | Skill |
|------|-------|
| Understand an execution flow | [.claude/skills/gitnexus/gitnexus-exploring/SKILL.md](.claude/skills/gitnexus/gitnexus-exploring/SKILL.md) |
| Assess dependency impact | [.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md](.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md) |
| Trace a runtime bug | [.claude/skills/gitnexus/gitnexus-debugging/SKILL.md](.claude/skills/gitnexus/gitnexus-debugging/SKILL.md) |
| Rename or restructure code | [.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md](.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md) |
| Tool/schema reference | [.claude/skills/gitnexus/gitnexus-guide/SKILL.md](.claude/skills/gitnexus/gitnexus-guide/SKILL.md) |
<!-- gitnexus:end -->
