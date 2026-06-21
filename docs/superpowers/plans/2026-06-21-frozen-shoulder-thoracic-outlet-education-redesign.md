# Frozen Shoulder And Thoracic Outlet Education Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the outdated frozen-shoulder and thoracic-outlet education content with the approved patient-friendly responsive sequence while preserving all surrounding sections.

**Architecture:** Add one marker-bounded HTML block and one marker-bounded inline CSS block per page. Use page-specific selectors, existing local images, and the existing Lucide icon runtime.

**Tech Stack:** Static HTML, scoped CSS Grid/Flexbox, self-hosted Lucide icons, Node test runner.

---

### Task 1: Add regression coverage

**Files:**
- Modify: `tests/lp.test.mjs`
- Test: `tests/lp.test.mjs`

- [ ] Load both pages as test fixtures.
- [ ] Protect markup before each redesign and from treatment flow onward with SHA-256 assertions.
- [ ] Require nine ordered headings, four factors, four flow steps, three approach steps, six referral items, existing LINE URLs, and approved images.
- [ ] Require desktop grids, mobile one-column timelines, and 44px CTA targets.
- [ ] Run the focused tests and confirm failure because the new markers and classes are absent.

### Task 2: Implement the frozen-shoulder redesign

**Files:**
- Modify: `symptoms/frozen-shoulder.html`
- Test: `tests/lp.test.mjs`

- [ ] Add scoped `FROZEN_SHOULDER_EDUCATION_STYLES`.
- [ ] Replace the old cause-through-frequency markup with the approved `FROZEN_SHOULDER_EDUCATION` sequence.
- [ ] Reuse the existing shoulder illustration and movement-assessment image.
- [ ] Run the frozen-shoulder-focused tests.

### Task 3: Implement the thoracic-outlet redesign

**Files:**
- Modify: `symptoms/thoracic-outlet.html`
- Test: `tests/lp.test.mjs`

- [ ] Add scoped `THORACIC_OUTLET_EDUCATION_STYLES`.
- [ ] Replace the old cause-through-frequency markup with the approved `THORACIC_OUTLET_EDUCATION` sequence.
- [ ] Reuse the existing arm-symptom illustration and movement-assessment image.
- [ ] Run the thoracic-outlet-focused tests.

### Task 4: Verify rendering and regressions

**Files:**
- Verify: `symptoms/frozen-shoulder.html`
- Verify: `symptoms/thoracic-outlet.html`
- Verify: `tests/lp.test.mjs`

- [ ] Run `npm test`.
- [ ] Run `git diff --check`.
- [ ] Inspect both pages at 1440px, 1024px, 768px, and 390px.
- [ ] Confirm image loading, no redesign-block horizontal overflow, keyboard focus, and no relevant console warnings.
- [ ] Confirm treatment flow, FAQ, related content, CTA, and footer remain present on both pages.
