# All Symptom Troubles Check Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every symptom detail page use the lower-back page's eight-item troubles-check design while retaining symptom-specific concerns.

**Architecture:** Keep the static page structure and copy the existing scoped troubles-check CSS into pages that do not have it. Replace only legacy concern blocks, leaving every surrounding section byte-for-byte unchanged where practical.

**Tech Stack:** Static HTML, inline responsive CSS, Node test runner.

---

### Task 1: Add all-page regression coverage

**Files:**
- Modify: `tests/lp.test.mjs`

- [ ] Enumerate every `symptoms/*.html` file except `index.html`.
- [ ] Assert one troubles-check section, exact heading, eight list items, an accessible aria label, copied desktop/mobile CSS, and no legacy concerns block.
- [ ] Run the focused test and confirm it fails on the 18 legacy pages.

### Task 2: Convert all legacy concern sections

**Files:**
- Modify: 18 legacy detail pages under `symptoms/`

- [ ] Preserve each page's existing concern themes.
- [ ] Expand each page to eight concise symptom-specific items.
- [ ] Add red emphasis with `<strong>` to important phrases.
- [ ] Replace only the old `<section class="concerns">` block.
- [ ] Insert the lower-back troubles-check CSS where absent.
- [ ] Run the focused regression test and confirm all 24 detail pages pass.

### Task 3: Visual and full regression verification

**Files:**
- Verify: all symptom detail pages
- Create: `design-qa.md`

- [ ] Compare the supplied screenshot and lower-back implementation with representative converted pages.
- [ ] Check 1440px and 390px layouts, plus overflow at 768px and 1024px.
- [ ] Verify checkbox geometry, heading triangle, red emphasis, eight-item rhythm, typography, and spacing.
- [ ] Run `npm test`.
- [ ] Run `git diff --check`.
- [ ] Record the comparison and final result in `design-qa.md`.
