# SEO Audit Report Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a practical SEO audit report for hizakozou.jp that prioritizes site-wide weaknesses, local SEO/MEO foundations, knee-pain search strategy, and next actions.

**Architecture:** The work is analysis-first and does not modify production site files. Gather facts from local static HTML, generated blog data, source Markdown, sitemap, robots.txt, and selected official Google references, then write one human-readable report under `docs/`.

**Tech Stack:** Static HTML, Markdown, JSON, Node.js/PowerShell inspection commands.

---

### Task 1: Gather Crawl And Metadata Facts

**Files:**
- Read: `index.html`
- Read: `symptoms/*.html`
- Read: `blog/posts/*/index.html`
- Read: `sitemap.xml`
- Read: `robots.txt`
- Read: `data/blog-posts.json`

- [ ] **Step 1: Count page groups**

Run: `Get-ChildItem -File symptoms -Filter *.html; Get-ChildItem -Directory blog/posts`

Expected: A count of symptom pages and blog post directories.

- [ ] **Step 2: Extract key SEO tags**

Run PowerShell `Select-String` over top, symptom, and blog pages for `title`, `meta description`, `canonical`, `h1`, and `application/ld+json`.

Expected: A list showing which page templates already contain core SEO tags and structured data.

- [ ] **Step 3: Check sitemap and robots**

Run: `Get-Content robots.txt` and `Get-Content sitemap.xml -TotalCount 120`

Expected: Confirmation that the site is crawlable and sitemap points to the public domain.

### Task 2: Audit Knee-Pain Page Architecture

**Files:**
- Read: `symptoms/knee-osteoarthritis.html`
- Read: `symptoms/knee-effusion.html`
- Read: `symptoms/knee-lateral-pain.html`
- Read: `symptoms/knee-posterior-pain.html`
- Read: `symptoms/pes-anserine-bursitis.html`
- Read: `content/source/*.md`
- Read: `data/blog-posts.json`

- [ ] **Step 1: Identify knee-related symptoms and articles**

Run PowerShell filters for Japanese knee terms and slug names in `content/source` and `data/blog-posts.json`.

Expected: A list of knee-related pages and articles that can be grouped into a knee SEO map.

- [ ] **Step 2: Assign search intent**

Classify pages into intent groups: general knee pain, diagnosis/symptom page, daily movement problem, self-care/education, and visit decision.

Expected: A map of search intent to the page that should own it.

### Task 3: Build Priority Findings

**Files:**
- Read: all files from Tasks 1 and 2
- Create: `docs/seo-audit-2026-04-20.md`

- [ ] **Step 1: Create P0 findings**

Write findings for access wording consistency, strong medical/therapy claims, LocalBusiness data consistency, and indexable URL hygiene.

Expected: P0 findings include affected page groups, why it matters, and concrete first action.

- [ ] **Step 2: Create P1 findings**

Write findings for knee-pain page hierarchy, internal links, content overlap, and local relevance.

Expected: P1 findings define which knee pages become hub pages and which posts support them.

- [ ] **Step 3: Create P2 and P3 findings**

Write findings for title/meta CTR opportunities, FAQ improvements, blog refreshes, and conversion path cleanup.

Expected: Lower-priority items are separated from urgent foundational work.

### Task 4: Write 30-Day Action Plan

**Files:**
- Modify: `docs/seo-audit-2026-04-20.md`

- [ ] **Step 1: Week 1 plan**

List immediate fixes for P0 items.

Expected: Week 1 focuses on consistency, trust, and local SEO foundations.

- [ ] **Step 2: Week 2-3 plan**

List knee-pain architecture and internal-link improvements.

Expected: Week 2-3 focuses on making knee-pain pages easier for Google and visitors to understand.

- [ ] **Step 3: Week 4 plan**

List content refresh and measurement setup recommendations.

Expected: Week 4 prepares for Search Console and Google Business Profile data-driven iteration.

### Task 5: Review And Verify

**Files:**
- Read: `docs/seo-audit-2026-04-20.md`

- [ ] **Step 1: Placeholder scan**

Search for `TODO`, `TBD`, `要確認`, and empty sections.

Expected: No placeholder text remains.

- [ ] **Step 2: Scope check**

Confirm the report follows the agreed priority order: D, C, A, B.

Expected: The report starts with site-wide weaknesses, then local SEO/MEO, search traffic, and conversion.

- [ ] **Step 3: Final status**

Run `git status --short`.

Expected: Only intended docs files are changed, plus any unrelated existing untracked files remain untouched.
