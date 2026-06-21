# Shoulder Stiffness Education Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the outdated shoulder-stiffness education content with the approved patient-friendly, responsive sequence while preserving every surrounding section.

**Architecture:** Keep the static single-page structure and add one marker-bounded HTML block plus one marker-bounded inline CSS block. Use page-specific `.shoulder-*` classes so no other page or shared component changes.

**Tech Stack:** Static HTML, scoped CSS Grid/Flexbox, existing self-hosted Lucide icons, Node test runner.

---

### Task 1: Add structural regression coverage

**Files:**
- Modify: `tests/lp.test.mjs`
- Test: `tests/lp.test.mjs`

- [ ] Add a test that requires the nine approved headings in order.
- [ ] Require four factor items, four flow steps, three approach steps, six medical-warning items, the existing LINE URL, and the two approved existing images.
- [ ] Add a CSS test requiring desktop grids, mobile one-column timelines, a 44px minimum CTA target, and no global selectors.
- [ ] Run `node --test --test-name-pattern="shoulder stiffness education" tests/lp.test.mjs`.
- [ ] Confirm the tests fail because the new markers and classes do not exist.

### Task 2: Implement the scoped redesign

**Files:**
- Modify: `symptoms/shoulder-stiffness.html`
- Test: `tests/lp.test.mjs`

- [ ] Insert `SHOULDER_STIFFNESS_EDUCATION_STYLES` before the existing closing style tag.
- [ ] Replace the old cause, middle CTA, approach, and frequency markup with `SHOULDER_STIFFNESS_EDUCATION` markup.
- [ ] Use only existing image paths and preserve the existing LINE URL.
- [ ] Run the focused test and confirm it passes.

### Task 3: Verify regressions and responsive rendering

**Files:**
- Verify: `symptoms/shoulder-stiffness.html`
- Verify: `tests/lp.test.mjs`

- [ ] Run `npm test` and confirm zero failures.
- [ ] Run `git diff --check`.
- [ ] Inspect desktop and mobile layouts in the in-app browser.
- [ ] Confirm header, hero, concerns, voices, treatment flow, FAQ, related links,
  CTA, access, and footer remain present and usable.
