# Plantar Fasciitis Education Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the outdated plantar-fasciitis education content with the approved responsive patient-friendly sequence while preserving all surrounding sections.

**Architecture:** Add one marker-bounded HTML block and one marker-bounded inline CSS block to the existing static page. Use page-specific `.plantar-*` selectors and existing images and Lucide icons.

**Tech Stack:** Static HTML, scoped CSS Grid/Flexbox, existing self-hosted Lucide icons, Node test runner.

---

### Task 1: Add structural regression tests

**Files:**
- Modify: `tests/lp.test.mjs`
- Test: `tests/lp.test.mjs`

- [ ] Load `symptoms/plantar-fasciitis.html` as a test fixture.
- [ ] Require the approved nine headings in order.
- [ ] Require four factors, four symptom-flow steps, three approach steps, six
  medical-warning items, the existing LINE URL, and the approved existing
  images.
- [ ] Protect the page markup before the redesign and from treatment flow onward
  with SHA-256 boundary assertions.
- [ ] Require desktop grids, mobile one-column timelines, and a 44px CTA target.
- [ ] Run the focused test and confirm failure because the new markers and
  classes are absent.

### Task 2: Implement the page-scoped redesign

**Files:**
- Modify: `symptoms/plantar-fasciitis.html`
- Test: `tests/lp.test.mjs`

- [ ] Add the scoped `PLANTAR_FASCIITIS_EDUCATION_STYLES` block before
  `</style>`.
- [ ] Replace the old cause-through-frequency markup with the approved
  `PLANTAR_FASCIITIS_EDUCATION` sequence.
- [ ] Keep the existing LINE URL and existing local image paths.
- [ ] Run the focused test and confirm it passes.

### Task 3: Verify rendering and regressions

**Files:**
- Verify: `symptoms/plantar-fasciitis.html`
- Verify: `tests/lp.test.mjs`

- [ ] Run `npm test`.
- [ ] Run `git diff --check`.
- [ ] Inspect desktop and 390px mobile layouts.
- [ ] Confirm image loading, no horizontal overflow, visible keyboard focus, and
  no relevant console warnings.
- [ ] Confirm treatment flow, FAQ, related content, CTA, and footer remain
  present.
