# Nine Knee Symptom Education Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild nine knee-related symptom education sections with one patient-friendly structure and symptom-specific copy while preserving all existing navigation, conversion links, flow, FAQ, related content, and footer behavior.

**Architecture:** Each target HTML page receives a page-scoped education block between its existing `troubles-check` section and treatment-flow section. The blocks share the lower-back page's visual and responsive structure, but every page uses a unique class prefix, marker pair, headings, medical-referral list, and copy. `tests/lp.test.mjs` uses a configuration table to verify the shared contract and page-specific requirements; `scripts/build-blog.mjs` remains unchanged because its generated marker ranges sit outside the new education blocks.

**Tech Stack:** Static HTML, scoped CSS, self-hosted Lucide icons, Node.js test runner, CSS Grid/Flexbox.

---

### Task 1: Add The Nine-Page Regression Contract

**Files:**
- Modify: `tests/lp.test.mjs`
- Test: `tests/lp.test.mjs`

- [ ] **Step 1: Add a page configuration table**

Add a `kneeDetailEducationPages` table containing each HTML file, marker name, CSS prefix, and the nine expected headings. Include required symptom-specific phrases such as `急な強い腫れ`, `膝が動かないほどのロック`, and `脚の見た目を無理に変えるのではなく`.

- [ ] **Step 2: Add the shared structure test**

Add a test that extracts each marker-scoped education block and verifies:

```js
assert.equal((section.match(new RegExp(`class="${prefix}-factor"`, "g")) ?? []).length, 4);
assert.equal((section.match(new RegExp(`class="${prefix}-symptom-flow__step"`, "g")) ?? []).length, 4);
assert.equal((section.match(new RegExp(`class="${prefix}-approach-step"`, "g")) ?? []).length, 3);
assert.equal((section.match(new RegExp(`class="${prefix}-medical-note__item"`, "g")) ?? []).length, 6);
assert.match(section, /href="https:\/\/lin\.ee\/X01F2mP"/);
assert.match(section, /通院頻度について/);
assert.doesNotMatch(section, /最初の1〜2ヶ月|週1〜2回|frequency__phases|frequency__phase/);
```

- [ ] **Step 3: Add the responsive CSS test**

For each page, extract its style marker and assert two-column factors, four-column flow, three-column approach, the 767px one-column switches, and a 44px LINE target. Assert that the style block does not target `body`, `html`, `.site-header`, or `.mobile-cta`.

- [ ] **Step 4: Add the boundary and preserved-feature test**

Verify the redesign starts after `troubles-check`, ends before `<section id="flow"`, and that each full page still contains:

```js
assert.match(pageHtml, /<section id="flow" class="flow-slider"/);
assert.match(pageHtml, /FAQPage/);
assert.match(pageHtml, /<!-- RELATED_SYMPTOMS_NAV_START -->/);
assert.match(pageHtml, /<!-- BLOG_RELATED_ARTICLES_START -->/);
assert.match(pageHtml, /href="tel:0471143274"/);
assert.match(pageHtml, /href="https:\/\/lin\.ee\/X01F2mP"/);
```

- [ ] **Step 5: Run the focused test and verify RED**

Run:

```powershell
node --test --test-name-pattern="nine knee symptom education" tests/lp.test.mjs
```

Expected: FAIL because the new education markers and headings do not exist.

### Task 2: Build The Shared Page Generator And Content Data

**Files:**
- Create temporarily: `scripts/tmp-apply-nine-knee-education.mjs`
- Reference: `symptoms/lower-back-pain.html`
- Modify: the nine target HTML files

- [ ] **Step 1: Define page data**

Create one object per page with:

```js
{
  file,
  marker,
  prefix,
  symptomName,
  causeTitle,
  factorTitle,
  flowTitle,
  returnTitle,
  assessmentTitle,
  approachTitle,
  consultTitle,
  consultButton,
  image,
  imageAlt,
  causeParagraphs,
  factors,
  flowSteps,
  returnParagraphs,
  cycleSteps,
  medicalIntro,
  medicalItems,
  assessmentParagraphs,
  assessmentItems,
  approachLead,
  approachSteps
}
```

Use the exact symptom directions in `docs/superpowers/specs/2026-06-22-nine-knee-symptom-education-redesign-design.md`.

- [ ] **Step 2: Reuse the approved lower-back CSS structure**

Read the block between:

```text
/* LOWER_BACK_EDUCATION_STYLES_START */
/* LOWER_BACK_EDUCATION_STYLES_END */
```

For each page, replace the marker and `lb-` class prefix with the page's own marker and prefix. Insert the resulting style block before the final `</style>` in `<head>`.

- [ ] **Step 3: Render the common education HTML**

Render nine sections in this order:

```text
cause
four factors
four-step symptom flow
temporary-relief cycle
medical referral
whole-body assessment
three-step approach
LINE consultation CTA
individualized visit frequency
```

Use existing images under `image/イラスト/膝/`, `image/写真/症状/`, and `image/flow-movement-assessment-768.webp`. Do not add external or generated images.

- [ ] **Step 4: Replace only the approved page range**

For each page:

1. Locate `<section id="troubles" class="troubles-check">`.
2. Locate its following `</section>`.
3. Locate the next `<section id="flow"`.
4. Replace only the content between those two boundaries.
5. Preserve the upper page and treatment flow onward byte-for-byte.

- [ ] **Step 5: Run the temporary generator**

Run:

```powershell
node scripts/tmp-apply-nine-knee-education.mjs
```

Expected: reports nine updated pages and no missing boundaries or images.

- [ ] **Step 6: Remove the temporary generator**

Delete `scripts/tmp-apply-nine-knee-education.mjs` after successful generation so the repository retains only the source HTML, tests, spec, and plan.

### Task 3: Verify GREEN And Generator Stability

**Files:**
- Modify if required: `tests/lp.test.mjs`
- Verify: `scripts/build-blog.mjs`
- Verify: all nine target HTML files

- [ ] **Step 1: Run the focused test and verify GREEN**

Run:

```powershell
node --test --test-name-pattern="nine knee symptom education" tests/lp.test.mjs
```

Expected: all matching tests PASS.

- [ ] **Step 2: Verify blog generation does not remove education blocks**

Record SHA-256 hashes for the nine marker-scoped blocks, run:

```powershell
npm run build:blog
```

Then compare hashes. Expected: all nine education hashes remain unchanged.

- [ ] **Step 3: Verify generated regions still exist**

Confirm each page still has one treatment flow, one FAQ section, one related-symptom marker pair, and one related-article marker pair.

- [ ] **Step 4: Run the full suite**

Run:

```powershell
npm test
git diff --check
```

Expected: all tests PASS and `git diff --check` exits 0.

### Task 4: Responsive Browser QA

**Files:**
- Modify if required: the nine target HTML files
- Update: `design-qa.md`

- [ ] **Step 1: Start a local static server**

Run a local server on an available port and open representative pages for:

- fluid/medical state: `knee-effusion.html`
- pain-location state: `knee-lateral-pain.html`
- movement/shape state: `bowlegs-knee-pain.html`
- mechanical state: `ankle-stiffness-knee-pain.html`

- [ ] **Step 2: Check required viewport widths**

Inspect 375px, 390px, 768px, 1024px, and 1440px. Verify no education-section overflow, no fixed-CTA overlap, readable headings, correctly stacked flow/approach timelines, intrinsic image sizing, and 44px tap targets.

- [ ] **Step 3: Check browser errors**

Confirm zero JavaScript errors and zero missing local image requests on the representative pages.

- [ ] **Step 4: Record design QA**

Update `design-qa.md` with reference page, representative screenshots, checked viewports, findings, and final result. Fix all P0, P1, and P2 issues before marking `final result: passed`.

### Task 5: Final Scope Review

**Files:**
- Review: all changed files

- [ ] **Step 1: Run GitNexus change detection**

Run `detect_changes({ scope: "compare", base_ref: "main" })`. Review any HIGH or CRITICAL affected processes before committing.

- [ ] **Step 2: Review the final diff**

Confirm only the nine symptom pages, `tests/lp.test.mjs`, `design-qa.md`, and the approved spec/plan changed. Ensure no temporary scripts or browser artifacts remain.

- [ ] **Step 3: Run final verification**

Run fresh:

```powershell
npm test
git diff --check
git status --short --branch
```

Expected: tests pass, whitespace check passes, and the working tree contains only intended changes.
