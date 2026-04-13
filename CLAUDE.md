# CLAUDE.md

`AGENTS.md` is the shared source of truth for repository workflow. Keep both files aligned when the blog pipeline changes.

## What To Edit

- Primary authoring input: `content/source/*.md`
- Generated outputs: `data/blog-posts.json`, `content/seo/*`, `content/meo/*`, `blog/*`, `blog.html`, `blog-detail.html`, `sitemap.xml`, `symptoms/*.html`

Do not hand-edit generated outputs unless you are fixing the generator itself.

## Commands

```bash
npm run generate:blog
npm run generate:blog:source -- --source content/source/YYYY-MM-slug.md
```

## Source Markdown Contract

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

- Intro paragraphs before the first `##` become the lead.
- `## よくある質問` or `## FAQ` plus `###` questions become FAQ data.
- `draft: true` keeps the source file but removes the article from the published blog data.
- `replaceSlug` can be used when changing a published URL slug so the old entry is removed from generated data.

## Operational Notes

- After editing any source article, run the generator before finishing.
- If a new symptom label is added, verify that `scripts/generate-blog.mjs` maps it to the correct symptom page.
- Commit both source and generated files together so GitHub Pages stays in sync.
