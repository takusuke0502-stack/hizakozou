# Blog Output Notes

This directory contains generated blog output. Treat it as build output, not as the authoring source.

## Generated Here

- `blog/index.html`
- `blog/posts/{slug}/index.html`

Related generated files also live at the repo root or in sibling folders:

- `blog.html`
- `blog-detail.html`
- `data/blog-posts.json`
- generated related-article blocks in `symptoms/*.html`

## Authoring Flow

Use [AGENTS.md](/C:/Users/takus/Downloads/hizakozou-main/AGENTS.md) for the full workflow. The short version is:

1. Edit `content/source/*.md`
2. Run `npm run generate:blog` or `npm run generate:blog:source -- --source content/source/YYYY-MM-slug.md`
3. Review the generated diff in this directory and related outputs

Do not hand-edit files in `blog/` unless you are changing the generator or shared blog styling itself.
