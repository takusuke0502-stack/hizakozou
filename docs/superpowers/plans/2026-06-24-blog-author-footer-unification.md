# Blog Author Footer Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 全コラム記事で、執筆者・内容確認日・参考情報を記事下部に統一表示する。

**Architecture:** ブログ詳細ページは `content/source/*.md` から `scripts/generate-blog.mjs` と `scripts/build-blog.mjs` で生成されるため、生成済みHTMLは直接編集しない。`buildPostContent()` で全記事に同じ下部ブロックを差し込み、CSSは `blog/assets/blog.css` の既存 `.article-trust-panel` を下部表示向けに調整する。

**Tech Stack:** Static HTML, Node.js blog generator, CSS, Node test runner.

---

## 仕様書

### 表示仕様

- 全ブログ詳細記事に「執筆者・内容確認」セクションを表示する。
- 表示位置は記事本文の下部とする。
- 具体的には、記事本文、FAQ、関連症状ページのあと、料金CTA・関連記事セクションより前に表示する。
- 記事上部には大きな執筆者カードを出さない。
- 参考情報が設定されている記事では、同じ下部セクション内に「参考情報」を表示する。
- 参考情報が設定されていない記事では、空の「参考情報」欄を表示しない。
- セクションはカード風にしすぎず、細い罫線と余白中心で表示する。
- スマートフォンでは1列で表示する。

### データ仕様

- 執筆者は既存定数 `ARTICLE_REVIEWER` を使用する。
- 内容確認日は `post.reviewedDate || post.updatedDate || post.date` を使用する。
- 参考情報は既存の `ARTICLE_REFERENCE_PRESETS[post.referencePreset]` を使用する。
- 既存の `BlogPosting` 構造化データにある `author` / `reviewedBy` / `citation` は維持する。

### 非対象

- 各記事本文の内容変更はしない。
- 生成済みの `blog/posts/*/index.html` は直接編集しない。
- 既存CTA、料金CTA、関連記事リンクのリンク先は変更しない。
- コラム一覧ページのカードデザインは今回の主対象にしない。

## 変更ファイル

- Modify: `scripts/build-blog.mjs`
  - `buildPostContent()` で `articleTrustHtml` を全記事に生成し、記事本文下部へ配置する。
  - `buildArticleTrustPanel()` で参考情報がない場合は参考欄を省略する。
- Modify: `blog/assets/blog.css`
  - `.article-trust-panel` を本文下部向けの軽い罫線デザインへ調整する。
  - スマホでは1列表示にする。
- Modify: `tests/build-blog.test.mjs`
  - 全記事共通で下部の執筆者情報が出ることを確認するテストを追加する。
  - `readable-v2` で執筆者情報が `INDEX` より上に出ないことを確認する。
- Generated: `blog/posts/*/index.html`, `data/blog-posts.json`, `sitemap.xml`, `content/seo/*`, `content/meo/*`
  - `npm run generate:blog` で更新する。

---

### Task 1: Add Generator Test Coverage

**Files:**
- Modify: `tests/build-blog.test.mjs`

- [ ] **Step 1: Add a test for default blog posts**

Add a test that calls `buildPostContent()` with a normal post that has no `layout` and no `referencePreset`.

Expected assertions:

```js
assert.match(html, /article-trust-panel/);
assert.match(html, /執筆者・確認日/);
assert.match(html, /内容確認日：/);
assert.doesNotMatch(html, /article-trust-panel__references/);
```

- [ ] **Step 2: Add a test for readable posts**

Add a test that calls `buildPostContent()` with `layout: "readable-v2"` and `referencePreset: "chronic-pain"`.

Expected assertions:

```js
assert.ok(html.indexOf("article-readable-overview") < html.indexOf("article-trust-panel"));
assert.ok(html.indexOf("article-section") < html.indexOf("article-trust-panel"));
assert.match(html, /article-trust-panel__references/);
```

- [ ] **Step 3: Run the targeted tests**

Run:

```bash
npm test
```

Expected: tests may fail before implementation because the normal post does not yet include `article-trust-panel`.

### Task 2: Move Author Information To The Article Footer For All Posts

**Files:**
- Modify: `scripts/build-blog.mjs`

- [ ] **Step 1: Check GitNexus impact**

Run:

```bash
node .gitnexus\run.cjs impact buildPostContent --direction upstream
```

Expected: LOW risk, or explain if higher.

- [ ] **Step 2: Update `buildPostContent()`**

Change `articleTrustHtml` from readable-only to all posts:

```js
const articleTrustHtml = buildArticleTrustPanel(site, post);
```

Place it after `symptomsHtml` inside `.article-content`, so the final body order is:

```html
lead / overview / toc / takeaways
sections
FAQ
related symptoms
article trust panel
```

- [ ] **Step 3: Update `buildArticleTrustPanel()`**

If `getArticleReferences(post)` returns an empty array, omit the references column entirely.

Use this shape:

```js
const referencesHtml = referenceItems
  ? `<div class="article-trust-panel__references">...</div>`
  : "";
```

### Task 3: Adjust Footer Author Styles

**Files:**
- Modify: `blog/assets/blog.css`

- [ ] **Step 1: Keep the block quiet**

Ensure `.article-trust-panel` uses:

```css
border-top: 1px solid #d8e6d7;
border-bottom: 1px solid #d8e6d7;
background: transparent;
box-shadow: none;
border-radius: 0;
```

- [ ] **Step 2: Support one-column fallback**

Add a modifier for no-reference posts:

```css
.article-trust-panel--simple {
  grid-template-columns: 1fr;
}
```

- [ ] **Step 3: Keep mobile readable**

Inside the existing mobile media query, keep `.article-trust-panel` at `grid-template-columns: 1fr`.

### Task 4: Regenerate And Verify

**Files:**
- Generated outputs from `npm run generate:blog`

- [ ] **Step 1: Generate blog**

Run:

```bash
npm run generate:blog
```

Expected: all static blog posts regenerate without errors.

- [ ] **Step 2: Run tests**

Run:

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 3: Check formatting**

Run:

```bash
git diff --check
```

Expected: no whitespace errors; CRLF warnings are acceptable in this repository.

- [ ] **Step 4: Browser QA**

Open:

```text
http://127.0.0.1:8771/blog/posts/chronic-pain-why-it-lasts/?author-footer=20260624
```

Check:

- PC: author block appears after article body, not near the top.
- Mobile: author block is one column.
- No horizontal scroll.
- No console errors.

- [ ] **Step 5: GitNexus change detection**

Run:

```bash
node .gitnexus\run.cjs detect-changes --scope unstaged
```

Expected: generator-related changes may report broader affected flows; confirm files are expected.

---

## Self-Review

- Spec coverage: all requirements are covered by Tasks 1-4.
- Placeholder scan: no TBD/TODO placeholders remain.
- Type consistency: function names match existing `buildPostContent`, `buildArticleTrustPanel`, `getArticleReferences`, and `ARTICLE_REVIEWER`.
