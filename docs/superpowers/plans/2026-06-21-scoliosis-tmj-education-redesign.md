# Scoliosis And TMJ Education Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the outdated scoliosis and TMJ education content with the approved patient-friendly responsive sequence while preserving all surrounding sections.

**Architecture:** Add one marker-bounded HTML block and one marker-bounded inline CSS block per page. Use page-specific selectors, existing local images, and the existing Lucide icon runtime.

**Tech Stack:** Static HTML, scoped CSS Grid/Flexbox, self-hosted Lucide icons, Node test runner.

---

### Task 1: Add regression coverage

**Files:**
- Modify: `tests/lp.test.mjs`
- Test: `tests/lp.test.mjs`

- [ ] Load both pages as test fixtures.
- [ ] Protect markup before each redesign and from treatment flow onward with
  SHA-256 assertions.
- [ ] Require nine ordered headings, four factors, four flow steps, three
  approach steps, six referral items, existing LINE URLs, and approved images.
- [ ] Require desktop grids, mobile one-column timelines, and 44px CTA targets.
- [ ] Run the focused tests and confirm failure because the new markers and
  classes are absent.

### Task 2: Implement the scoliosis redesign

**Files:**
- Modify: `symptoms/scoliosis.html`
- Test: `tests/lp.test.mjs`

- [ ] Add scoped `SCOLIOSIS_EDUCATION_STYLES`.
- [ ] Replace the old cause-through-frequency markup with the approved
  `SCOLIOSIS_EDUCATION` sequence.
- [ ] Reuse the existing scoliosis illustration and movement-assessment image.
- [ ] Run the scoliosis-focused tests.

### Task 3: Implement the TMJ redesign

**Files:**
- Modify: `symptoms/tmj.html`
- Test: `tests/lp.test.mjs`

- [ ] Add scoped `TMJ_EDUCATION_STYLES`.
- [ ] Replace the old cause-through-frequency markup with the approved
  `TMJ_EDUCATION` sequence.
- [ ] Reuse the existing jaw-structure illustration and movement-assessment
  image.
- [ ] Run the TMJ-focused tests.

### Task 4: Verify rendering and regressions

**Files:**
- Verify: `symptoms/scoliosis.html`
- Verify: `symptoms/tmj.html`
- Verify: `tests/lp.test.mjs`

- [ ] Run `npm test`.
- [ ] Run `git diff --check`.
- [ ] Inspect both pages at 1440px and 390px.
- [ ] Confirm image loading, no horizontal overflow, keyboard focus, and no
  relevant console warnings.
- [ ] Confirm treatment flow, FAQ, related content, CTA, and footer remain
  present on both pages.
