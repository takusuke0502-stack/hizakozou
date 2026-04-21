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
