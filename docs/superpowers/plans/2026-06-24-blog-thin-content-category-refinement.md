# Blog Thin Content And Category Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 足腰専門サイトとして優先度の高いコラム記事を増量し、読者が「膝・腰・足・しびれ・セルフケア」から探しやすいカテゴリ構成へ整える。

**Architecture:** Markdown sourceを唯一の本文編集対象にし、カテゴリ定義はブログ生成スクリプトで補完して `data/blog-posts.json` に再生成する。生成物は `npm run generate:blog` の出力として更新し、静的HTMLへ直接手を入れない。

**Tech Stack:** Static HTML, Node.js ESM scripts, Markdown frontmatter, `node:test`.

---

### Task 1: Safe Category Definition

**Files:**
- Modify: `scripts/generate-blog.mjs`
- Modify: `scripts/build-blog.mjs`
- Test: `tests/build-blog.test.mjs`

- [ ] **Step 1: Confirm impact before function edits**

Run:

```powershell
node .gitnexus/run.cjs impact main --direction upstream
node .gitnexus/run.cjs impact buildCategoryLookup --direction upstream
node .gitnexus/run.cjs impact buildIndexContent --direction upstream
```

Expected: LOW risk. If HIGH or CRITICAL appears, stop and report before editing.

- [ ] **Step 2: Add generated category definitions**

Add `REQUIRED_BLOG_CATEGORIES` and `ensureBlogCategories(blogData)` to `scripts/generate-blog.mjs`, then call `ensureBlogCategories(blogData)` after site normalization and before building the category lookup.

The required visible order is:

```js
[
  "knee-pain",
  "lower-back-pain",
  "hip-pain",
  "foot-walking",
  "numbness",
  "exercise-therapy",
  "clinic-guidance",
  "neck-shoulder-hand"
]
```

- [ ] **Step 3: Expand category lookup aliases**

Map Japanese source frontmatter values to stable category slugs:

```js
lookup.set("足・歩き方", "foot-walking");
lookup.set("足裏・歩き方", "foot-walking");
lookup.set("受診目安・通院", "clinic-guidance");
lookup.set("通院・相談", "clinic-guidance");
```

- [ ] **Step 4: Improve blog index filter labels**

In `scripts/build-blog.mjs`, change the compact filter group from the old "ストレッチ" links to "目的から探す" links for:

```html
膝の痛み
腰の痛み
足・歩き方
セルフケア
```

- [ ] **Step 5: Update tests**

Update the in-memory category map in `tests/build-blog.test.mjs` to include `lower-back-pain` and `foot-walking`, then assert the new filter labels are present.

### Task 2: Expand Priority Foot-Waist Articles

**Files:**
- Modify: `content/source/2026-03-lower-back-pain-and-knee-link.md`
- Modify: `content/source/2026-04-plantar-fasciitis-arch-walking.md`
- Modify: `content/source/2026-03-knee-walking.md`
- Modify: `content/source/2026-03-exercise-therapy-first-step.md`

- [ ] **Step 1: Expand the knee-to-low-back article**

Structure:

```markdown
## 膝をかばうと腰までつらくなりやすい理由
## 膝と腰を一緒に見るためのチェック
## 自宅で見直したい歩き方と休み方
## 医療機関へ相談したい目安
## 当院で確認すること
## よくある質問
```

Avoid diagnostic certainty and treatment guarantees.

- [ ] **Step 2: Expand the plantar-fasciitis article**

Change category to `足・歩き方`. Add sections for morning first step, arch function, calf and hip relation, footwear/load adjustment, medical consultation signs, and FAQ.

- [ ] **Step 3: Expand the walking-with-knee-pain article**

Add sections for safe walking volume, pain diary, stairs/slopes, foot and hip checks, and medical consultation signs.

- [ ] **Step 4: Expand the first-step exercise-therapy article**

Add sections for fear of movement, tiny starting actions, stop signals, treatment integration, and FAQ. Keep it as a supportive article linked to foot-waist pain.

### Task 3: Generate And Verify

**Files:**
- Generated: `data/blog-posts.json`
- Generated: `content/seo/*.md`
- Generated: `content/meo/*.txt`
- Generated: `blog/index.html`
- Generated: `blog/posts/*/index.html`
- Generated: `sitemap.xml`
- Generated: related article blocks in `symptoms/*.html`

- [ ] **Step 1: Run generator**

```powershell
npm run generate:blog
```

Expected: exits 0 and lists updated source posts.

- [ ] **Step 2: Run test suite**

```powershell
npm test
```

Expected: exits 0.

- [ ] **Step 3: Check formatting and GitNexus change detection**

```powershell
git diff --check
node .gitnexus/run.cjs detect-changes --scope unstaged
```

Expected: no whitespace errors; detected changes are limited to expected blog source, generation scripts, generated blog outputs, tests, and this plan.

### Task 4: Commit And Push

**Files:**
- All intended changed files

- [ ] **Step 1: Review status**

```powershell
git status --short --branch
```

- [ ] **Step 2: Stage, commit, push**

```powershell
git add -A
git commit -m "Improve blog categories and priority foot-waist articles"
git push origin main
```

Expected: push succeeds to `origin/main`.
