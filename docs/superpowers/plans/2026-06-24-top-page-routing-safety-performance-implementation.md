# TOP Page Routing, Safety, and Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ヒーローを一切変更せず、TOPページへ主要症状導線、受診目安、GA4計測、軽量アイコン、タブレット対応、LocalBusiness構造化データを追加する。

**Architecture:** `index.html` にTOP専用の静的セクションを追加し、見た目は `styles/main.css` に閉じ込める。既存のクリック計測基盤 `scripts/tracking.js` を拡張し、フォーム開始・送信と受診目安表示は `scripts/main.js` から通知する。TOPだけ `scripts/top-icons.js` を読み込み、症状ページが使う全量Lucideには触れない。

**Tech Stack:** Static HTML, scoped CSS, vanilla JavaScript, Node.js test runner, GA4 gtag, JSON-LD

---

### Task 1: Contract and regression tests

**Files:**
- Modify: `tests/lp.test.mjs`

- [ ] **Step 1: Add failing tests**

Add tests that assert:

```js
test("TOP hero remains byte-for-byte unchanged", () => {
  const start = html.indexOf('<section class="pt-28');
  const end = html.indexOf('<section class="hero-safe-band', start);
  assert.equal(sha256(html.slice(start, end)), "bdc7d3ccea1fcd9069668bac02714ceef308cd30dfec2bbc79187a7c1e39e0e9");
});

test("TOP routes visitors to the six major symptoms before troubles", () => {
  const section = html.match(/<!-- TOP_SYMPTOM_GUIDE_START -->[\s\S]*?<!-- TOP_SYMPTOM_GUIDE_END -->/)?.[0] ?? "";
  for (const href of [
    "symptoms/lower-back-pain.html",
    "symptoms/sciatica.html",
    "symptoms/spinal-stenosis.html",
    "symptoms/lumbar-disc-herniation.html",
    "symptoms/hip-osteoarthritis.html",
    "symptoms/knee-osteoarthritis.html",
    "symptoms/index.html"
  ]) assert.match(section, new RegExp(`href="${escapeRegExp(href)}"`));
  assert.ok(html.indexOf("TOP_SYMPTOM_GUIDE_START") < html.indexOf('id="troubles"'));
});

test("TOP includes concise medical guidance", () => {
  assert.match(html, /急に力が入りにくくなった/);
  assert.match(html, /排尿・排便/);
  assert.match(html, /事故や転倒後/);
  assert.match(html, /発熱や強い体調不良/);
});
```

Add separate assertions for:

- `@media (max-width: 1079px)` in the header CSS
- `scripts/top-icons.js` replacing `scripts/vendor/lucide.min.js` in `index.html`
- `voice-result-banner.webp` using `loading="lazy"`
- GA4 ID `G-Z44VRQ2E61`
- the five new GA4 event names
- one `LocalBusiness`, no `MedicalClinic`, no `FAQPage`
- visible FAQ markup remaining

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```powershell
node --test --test-name-pattern="TOP hero|TOP routes|TOP includes|TOP uses|TOP tracking|TOP structured" tests/lp.test.mjs
```

Expected: the hero test passes and every new feature assertion fails because implementation is absent.

### Task 2: Symptom routing and medical guidance

**Files:**
- Modify: `index.html`
- Modify: `styles/main.css`
- Test: `tests/lp.test.mjs`

- [ ] **Step 1: Insert the scoped section**

Insert immediately after `</section>` for `.hero-safe-band`:

```html
<!-- TOP_SYMPTOM_GUIDE_START -->
<section class="top-symptom-guide" aria-labelledby="top-symptom-guide-title" data-tracking-section="top-symptom-guide">
  <div class="top-symptom-guide__inner">
    <div class="top-symptom-guide__heading">
      <p class="top-symptom-guide__eyebrow">SYMPTOM GUIDE</p>
      <h2 id="top-symptom-guide-title">気になる症状からご覧ください</h2>
      <p>痛む場所やつらい動作に近いページで、考えられる負担や受診の目安を確認できます。</p>
    </div>
    <div class="top-symptom-guide__grid">
      <!-- six real links with h3 title and one-line description -->
    </div>
    <a class="top-symptom-guide__all" href="symptoms/index.html" data-top-all-symptoms>すべての症状を見る <span aria-hidden="true">›</span></a>
    <aside class="top-medical-guidance" aria-labelledby="top-medical-guidance-title" data-top-medical-guidance>
      <h3 id="top-medical-guidance-title">このような場合は、まず医療機関へご相談ください</h3>
      <ul>
        <li>急に力が入りにくくなった</li>
        <li>排尿・排便に異常がある</li>
        <li>事故や転倒後から強い痛みが続く</li>
        <li>発熱や強い体調不良を伴う</li>
      </ul>
    </aside>
  </div>
</section>
<!-- TOP_SYMPTOM_GUIDE_END -->
```

Each symptom card uses `class="top-symptom-guide__card"`, `data-top-symptom-link`, and `data-symptom-slug`.

- [ ] **Step 2: Add responsive scoped styles**

Add `.top-symptom-guide*` rules only:

- 3 columns at 1080px and wider
- 2 columns from 768px to 1079px
- 1 column below 768px
- minimum link height 72px desktop and 64px mobile
- 44px minimum for the “all symptoms” link
- visible `:focus-visible`
- thin borders, white background, deep green text, cream guidance background

- [ ] **Step 3: Run focused tests**

Run the routing and guidance tests. Expected: PASS.

### Task 3: Header breakpoint and loading performance

**Files:**
- Modify: `styles/main.css`
- Modify: `index.html`
- Create: `scripts/top-icons.js`
- Test: `tests/lp.test.mjs`

- [ ] **Step 1: Change only the header breakpoint**

Change the first header media query from:

```css
@media (max-width: 1023px)
```

to:

```css
@media (max-width: 1079px)
```

Do not change the unrelated MSM media queries that also use 1023px.

- [ ] **Step 2: Create the lightweight icon runtime**

Create `scripts/top-icons.js` with:

```js
(() => {
  const icons = {
    // exact SVG child markup for the fourteen approved icons
  };

  function createIcons({ nodes } = {}) {
    const targets = nodes ? Array.from(nodes) : Array.from(document.querySelectorAll("[data-lucide]"));
    targets.forEach((target) => {
      const name = target.getAttribute("data-lucide");
      const body = icons[name];
      if (!body) return;
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      for (const attribute of target.attributes) {
        if (attribute.name !== "data-lucide") svg.setAttribute(attribute.name, attribute.value);
      }
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "2");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");
      svg.innerHTML = body;
      target.replaceWith(svg);
    });
  }

  window.lucide = { createIcons };
})();
```

Populate the map with exact path/circle/polyline markup extracted from the checked-in Lucide bundle for all icons listed in the design spec.

- [ ] **Step 3: Switch TOP script and lazy-load the voice banner**

Replace:

```html
<script src="scripts/vendor/lucide.min.js" defer></script>
```

with:

```html
<script src="scripts/top-icons.js" defer></script>
```

Change only `voice-result-banner.webp` from `loading="eager"` to `loading="lazy"`. Keep hero preload, `loading="eager"`, and `fetchpriority="high"` unchanged.

- [ ] **Step 4: Run focused tests**

Expected: breakpoint, icon runtime, lazy image, and hero hash tests PASS.

### Task 4: GA4 events and form instrumentation

**Files:**
- Modify: `scripts/tracking-config.js`
- Modify: `scripts/tracking.js`
- Modify: `scripts/main.js`
- Test: `tests/lp.test.mjs`

- [ ] **Step 1: Configure GA4**

Set:

```js
ga4MeasurementId: "G-Z44VRQ2E61"
```

- [ ] **Step 2: Track TOP links**

Extend `getExplorationEvent(link)`:

```js
if (link.matches("[data-top-symptom-link]")) return "top_symptom_link_click";
if (link.matches("[data-top-all-symptoms]")) return "top_all_symptoms_click";
```

Send `target_symptom_slug` from `data-symptom-slug` when present.

- [ ] **Step 3: Track guidance view once**

Use an `IntersectionObserver` with threshold `0.4` in `scripts/main.js`. When `[data-top-medical-guidance]` becomes visible, call:

```js
window.hkTrackEvent?.("top_medical_guidance_view", {
  content_group: "top_medical_guidance"
});
```

Disconnect after the first send.

- [ ] **Step 4: Track form start and submit**

On the first `input` or `focusin` inside `#contactForm`, send `top_contact_form_start` once. Immediately before `submitViaCors`, send `top_contact_form_submit` with `form_status: "attempt"`. Preserve the existing ad conversion and redirect handling.

- [ ] **Step 5: Run focused tracking tests**

Expected: GA4 configuration and all five event assertions PASS.

### Task 5: Structured data correction

**Files:**
- Modify: `index.html`
- Test: `tests/lp.test.mjs`

- [ ] **Step 1: Replace business type and add founder**

Change:

```json
"@type": ["MedicalClinic", "LocalBusiness"]
```

to:

```json
"@type": "LocalBusiness",
"founder": {
  "@type": "Person",
  "name": "川上卓哉",
  "jobTitle": "柔道整復師",
  "url": "https://hizakozou.jp/staff.html"
}
```

Remove `medicalSpecialty`. Preserve all other business facts.

- [ ] **Step 2: Remove only FAQ JSON-LD**

Delete the `<script type="application/ld+json">` block whose `@type` is `FAQPage`. Do not alter `#faq` visible markup.

- [ ] **Step 3: Run focused structured-data tests**

Expected: one LocalBusiness with founder, zero MedicalClinic, zero FAQPage, visible FAQ still present.

### Task 6: Full verification

**Files:**
- Verify all modified files

- [ ] **Step 1: Run full tests**

```powershell
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Run static checks**

```powershell
git diff --check
```

Check all seven symptom URLs and all local assets exist.

- [ ] **Step 3: Browser QA**

At 375, 390, 768, 1024, and 1440px verify:

- no horizontal overflow
- hero screenshot/DOM remains unchanged
- symptom grid changes 1/2/3 columns
- 1024px uses mobile header
- symptom link navigates correctly
- menu opens and closes
- flow next button advances counter
- no console errors
- `scripts/top-icons.js` renders all visible icons
- GA4 request uses `G-Z44VRQ2E61`

- [ ] **Step 4: GitNexus change detection**

Run:

```text
detect_changes({repo:"hizakozou", scope:"all"})
```

Review all affected processes before committing.
