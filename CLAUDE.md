# CLAUDE.md

Use [AGENTS.md](/C:/Users/takus/Downloads/hizakozou-main/AGENTS.md) as the detailed source of truth for the blog workflow.

## Quick Rules

- Write or update article content in `content/source/*.md`.
- Do not hand-edit generated outputs such as `blog/`, `blog.html`, `blog-detail.html`, `data/blog-posts.json`, `content/seo/*`, `content/meo/*`, `sitemap.xml`, or generated related-article blocks in `symptoms/*.html`.
- After source changes, run `npm run generate:blog` or `npm run generate:blog:source -- --source content/source/YYYY-MM-slug.md`.
- If workflow rules change, update `AGENTS.md` first and keep this file as a short summary.

## See Also

- Main workflow and markdown contract: [AGENTS.md](/C:/Users/takus/Downloads/hizakozou-main/AGENTS.md)
- Blog output notes: [blog/README.md](/C:/Users/takus/Downloads/hizakozou-main/blog/README.md)
