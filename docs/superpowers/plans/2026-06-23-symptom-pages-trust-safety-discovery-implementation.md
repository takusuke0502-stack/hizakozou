# Symptom Pages Trust, Safety, and Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve all 24 symptom pages with safer copy, reviewer/source information, symptom-specific medical guidance, a redesigned three-entry symptom directory, and GA4 exploration tracking with a 28-day evaluation framework.

**Architecture:** Keep `scripts/build-blog.mjs` as the source of truth for generated symptom-page blocks. Add one file-keyed metadata map for medical guidance, references, and major-page positioning; generate marker-managed trust blocks and structured-data additions; redesign `symptoms/index.html` from the existing directory data; extend `scripts/tracking.js` with non-conversion exploration events. Preserve page-owned education sections, URLs, CTAs, header, footer, and existing patient voice content.

**Tech Stack:** Static HTML, scoped CSS, vanilla JavaScript, Node.js generation scripts, Node test runner, GA4 `gtag`, GitNexus.

---

### Task 1: Lock the New Symptom-Page Contract with Failing Tests

**Files:**
- Modify: `tests/lp.test.mjs`
- Modify: `tests/build-blog.test.mjs`

- [ ] **Step 1: Add failing tests for all-page safety and trust blocks**

Add tests that enumerate the 24 detail pages and require:

```js
assert.match(pageHtml, /<!-- SYMPTOM_TRUST_GUIDANCE_START -->/);
assert.match(pageHtml, /執筆・内容確認/);
assert.match(pageHtml, /川上卓哉/);
assert.match(pageHtml, /柔道整復師（国家資格）/);
assert.match(pageHtml, /2026年6月23日/);
assert.match(pageHtml, /早急に医療機関へ/);
assert.match(pageHtml, /早めに医療機関へ/);
assert.match(pageHtml, /整体での相談を検討できる状態/);
assert.match(pageHtml, /参考情報/);
```

- [ ] **Step 2: Add failing tests for patient-voice disclaimers and fixed-frequency removal**

Require every generated patient voice section to include:

```html
※効果には個人差があります
```

Reject:

```text
最初の1〜2ヶ月は週1〜2回
週1〜2回を1〜2ヶ月
```

- [ ] **Step 3: Add failing tests for the major six positioning guides**

Require a `data-major-symptom-guide` block on:

```text
lower-back-pain.html
sciatica.html
spinal-stenosis.html
lumbar-disc-herniation.html
hip-osteoarthritis.html
knee-osteoarthritis.html
```

Verify each page includes its own focus statement and does not reuse another major page's lead sentence.

- [ ] **Step 4: Add failing tests for the three-mode directory**

Require:

```html
role="tablist"
data-directory-mode="location"
data-directory-mode="movement"
data-directory-mode="diagnosis"
```

Verify location content remains present and readable without JavaScript and every directory link resolves to an existing file.

- [ ] **Step 5: Add failing tests for GA4 exploration events**

Require `scripts/tracking.js` to contain:

```text
symptom_directory_mode_select
symptom_directory_link_click
symptom_toc_click
related_symptom_click
related_article_click
medical_reference_click
staff_profile_click
```

Also verify exploration events do not call the Google Ads `conversion` event.

- [ ] **Step 6: Run the tests and confirm expected failures**

Run:

```powershell
npm test
```

Expected: failures identify missing trust blocks, directory modes, and exploration events.

### Task 2: Add Symptom Safety and Reference Data

**Files:**
- Modify: `scripts/build-blog.mjs`
- Test: `tests/build-blog.test.mjs`
- Test: `tests/lp.test.mjs`

- [ ] **Step 1: Run GitNexus impact analysis**

Run upstream impact checks for:

```text
updateSymptomPages
normalizeSymptomPageDesign
buildSymptomPatientVoicesSection
```

Stop and report before editing if a new HIGH or CRITICAL direct-caller risk appears beyond the known all-symptom generation process.

- [ ] **Step 2: Add a file-keyed `symptomTrustGuidance` map**

Each entry must define:

```js
{
  urgent: ["..."],
  prompt: ["..."],
  consult: ["..."],
  references: [
    { label: "...", url: "https://..." }
  ],
  majorGuide: {
    title: "...",
    lead: "...",
    boundaries: ["..."]
  }
}
```

The six major pages receive `majorGuide`; the other 18 do not.

- [ ] **Step 3: Implement marker-managed trust guidance generation**

Add:

```js
upsertSymptomTrustGuidance(html, config)
buildSymptomTrustGuidance(config)
```

Use markers:

```html
<!-- SYMPTOM_TRUST_GUIDANCE_START -->
<!-- SYMPTOM_TRUST_GUIDANCE_END -->
```

Insert the block after the page-owned education section and before patient voices or the treatment flow. Include:

- major-page positioning guide when configured
- three-level medical guidance
- author/reviewer profile linked to `../staff.html`
- fixed review date `2026年6月23日`
- reference links
- information-not-diagnosis note

- [ ] **Step 4: Add structured-data reviewer information**

Implement an idempotent helper that updates or inserts a dedicated JSON-LD block containing:

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "author": {
    "@type": "Person",
    "name": "川上卓哉",
    "jobTitle": "柔道整復師"
  },
  "reviewedBy": {
    "@type": "Person",
    "name": "川上卓哉"
  },
  "dateModified": "2026-06-23"
}
```

Ensure visible and structured data match.

- [ ] **Step 5: Run targeted tests**

Run:

```powershell
node tests/build-blog.test.mjs
node tests/lp.test.mjs
```

Expected: trust-block tests pass; directory and tracking tests may still fail.

### Task 3: Normalize Risky Copy and Visit-Frequency Language

**Files:**
- Modify: `scripts/build-blog.mjs`
- Modify: affected `content/source/*.md` only if a related article title requires correction
- Generated: `symptoms/*.html`
- Generated when blog source changes: `blog/`, `data/blog-posts.json`, `content/seo/`, `content/meo/`, `sitemap.xml`
- Test: `tests/lp.test.mjs`

- [ ] **Step 1: Add deterministic metadata replacements**

Use a file-keyed metadata override for at least:

```text
frozen-shoulder.html
hip-osteoarthritis.html
thoracic-outlet.html
tmj.html
lower-back-pain.html
```

Replace strong description text with wording about checking condition, movement, and reducing load.

- [ ] **Step 2: Add visible-copy normalization for known fixed-frequency passages**

Replace the exact known passages on:

```text
knee-lateral-pain.html
knee-posterior-pain.html
shoulder-stiffness.html
```

with the approved individualized-frequency paragraph.

- [ ] **Step 3: Correct known clinic-side assertion phrases**

Replace only exact audited phrases such as:

```text
根本原因となる
神経の通り道を広げます
アンバランスを解消し手術回避を目指します
再発しにくい体づくり
```

Do not blanket-replace patient questions or unrelated educational quotations.

- [ ] **Step 4: Preserve patient voice text and add the requested disclaimer**

Update `buildSymptomPatientVoicesSection()` so the note contains exactly:

```text
※効果には個人差があります
```

Keep existing voice cards, images, links, and text unchanged.

- [ ] **Step 5: Generate and verify copy rules**

Run:

```powershell
npm run build:blog
npm test
```

Expected: all safety, trust, and existing-regression tests pass except unfinished directory/tracking tests.

### Task 4: Build the A-Pattern Symptom Directory

**Files:**
- Modify: `scripts/build-blog.mjs`
- Generated: `symptoms/index.html`
- Test: `tests/lp.test.mjs`

- [ ] **Step 1: Add movement and diagnosis directory datasets**

Create explicit arrays of real links only.

Movement examples:

```text
朝の一歩目が痛い
立ち上がると腰や膝が痛い
階段で膝が痛い
長く歩くと脚がしびれる
腕を上げると肩が痛い
物を持つ・ひねると肘が痛い
口を開けると顎が痛い
```

Diagnosis examples:

```text
変形性膝関節症
変形性股関節症
腰椎椎間板ヘルニア
脊柱管狭窄症
頚椎症
五十肩
胸郭出口症候群
手根管症候群
側弯症
顎関節症
```

- [ ] **Step 2: Replace directory main generation**

Generate:

- an accessible three-tab control
- location panel visible by default
- movement and diagnosis panels hidden only after JavaScript enhancement
- existing location groups and links
- compact link rows with descriptions

- [ ] **Step 3: Add scoped responsive styles**

Update `symptomsDirectoryStyles` for:

- 44px tab targets
- visible selected icon/text treatment
- 1-column mobile panels
- 2-column desktop groups
- focus-visible outlines
- no page-level horizontal overflow

- [ ] **Step 4: Add lightweight directory behavior**

Generate a small inline or dedicated script that:

- applies `is-enhanced`
- switches panels
- updates `aria-selected` and `tabindex`
- supports Left/Right/Home/End keys
- preserves location content without JavaScript

- [ ] **Step 5: Run directory tests**

Run:

```powershell
npm run build:blog
node tests/lp.test.mjs
```

Expected: directory structure, links, no-JS fallback, and existing header/footer tests pass.

### Task 5: Add GA4 Exploration Tracking

**Files:**
- Modify: `scripts/tracking.js`
- Test: `tests/lp.test.mjs`

- [ ] **Step 1: Run GitNexus impact analysis**

Run upstream impact checks for:

```text
hkTrackConversion
getClickedLink
```

- [ ] **Step 2: Add a non-conversion event helper**

Implement:

```js
window.hkTrackEvent = function hkTrackEvent(eventName, params = {}) {
  if (!ga4MeasurementId || typeof window.gtag !== "function") return false;
  window.gtag("event", eventName, cleanParams({
    ...params,
    symptom_slug: getSymptomSlug(),
    page_location: window.location.href
  }));
  return true;
};
```

Do not send `send_to` or Google Ads `conversion` for these events.

- [ ] **Step 3: Classify exploration links and controls**

Track:

- directory mode buttons
- directory links
- symptom TOC links
- related symptom cards
- related article cards
- medical reference links
- reviewer profile links

Attach stable `data-tracking-*` attributes in generated HTML where class-based classification would be ambiguous.

- [ ] **Step 4: Run tracking tests**

Run:

```powershell
node tests/lp.test.mjs
```

Expected: existing conversion tests and new exploration-event tests pass.

### Task 6: Add the 28-Day Evaluation Template

**Files:**
- Create: `docs/analytics/symptom-pages-28-day-evaluation.md`
- Test: `tests/lp.test.mjs`

- [ ] **Step 1: Create the evaluation document**

Include:

- baseline date: `2026-06-23`
- publication date field
- pre/post 28-day date fields
- Search Console metrics table
- GA4 metrics table
- page-level major-six table
- query-cannibalization table
- keep/change/revert decision section
- note that credentials and exported personal data must not be committed

- [ ] **Step 2: Add a static contract test**

Verify the document contains the baseline date, Search Console, GA4, 28-day comparison, and six major page slugs.

- [ ] **Step 3: Run tests**

Run:

```powershell
npm test
```

Expected: all tests pass.

### Task 7: Full Generation and Browser Verification

**Files:**
- Verify all changed files

- [ ] **Step 1: Run a repeat-build idempotence check**

Run `npm run build:blog` twice and verify the second run does not change the diff hash.

- [ ] **Step 2: Run complete automated verification**

Run:

```powershell
npm test
git diff --check
```

- [ ] **Step 3: Verify assets and internal links**

Check that all local image, stylesheet, script, and symptom-directory link targets exist.

- [ ] **Step 4: Verify responsive behavior**

Use the in-app browser at:

```text
375x812
390x844
768x1024
1024x768
1440x900
```

Verify:

- directory tabs work with mouse, touch-sized controls, and keyboard
- location panel is the default
- no page-level horizontal scroll
- trust guidance is readable
- major-six guide appears only on the six intended pages
- existing sliders and CTAs still work
- no console errors

- [ ] **Step 5: Run GitNexus change detection**

Run:

```text
detect_changes(scope: "all")
```

Review all affected processes and report any HIGH risk as generated all-symptom scope rather than silently ignoring it.

