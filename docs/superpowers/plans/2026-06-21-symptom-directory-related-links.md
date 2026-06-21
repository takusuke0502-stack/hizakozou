# Symptom Directory And Related Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize all symptom navigation into a complete body-area directory and page-specific related links.

**Architecture:** Keep symptom navigation data and rendering in `scripts/build-blog.mjs`, then regenerate marker-managed symptom sections and the directory page. Regression tests assert the complete directory inventory, related-link relevance, self-link exclusion, and preservation of article sliders.

**Tech Stack:** Static HTML, CSS, JavaScript, Node.js test runner.

---

### Task 1: Add navigation regression tests

**Files:**
- Modify: `tests/build-blog.test.mjs`
- Modify: `tests/lp.test.mjs`

- [ ] Add tests asserting six directory groups and all 24 symptom links.
- [ ] Add tests asserting each individual page has 3-4 related symptom links, no self-link, and a directory link.
- [ ] Run focused tests and confirm they fail because the current directory has six links and shared related lists.

### Task 2: Centralize symptom directory data

**Files:**
- Modify: `scripts/build-blog.mjs`

- [ ] Define all symptom entries once with file name, label, description, and body-area group.
- [ ] Define page-specific related-file mappings for all symptom pages.
- [ ] Render related cards from the mapping and append the directory link.
- [ ] Render the six-group directory using the same symptom entries.

### Task 3: Apply generated navigation

**Files:**
- Modify: `symptoms/index.html`
- Modify: `symptoms/*.html`
- Modify generated files only through `npm run generate:blog`

- [ ] Run `npm run generate:blog`.
- [ ] Inspect the generated diff to ensure article, CTA, analytics, and footer content remain unchanged outside owned sections.
- [ ] Run focused tests and confirm they pass.

### Task 4: Responsive and interaction QA

**Files:**
- Verify: `symptoms/index.html`
- Verify: representative pages from waist, knee, upper-body, and posture groups

- [ ] Verify desktop two-column directory layout.
- [ ] Verify mobile one-column layout and 44px link targets.
- [ ] Verify every rendered link resolves to an existing file.
- [ ] Verify no horizontal page overflow.

### Task 5: Final verification

**Files:**
- Verify: full repository

- [ ] Run `npm test`.
- [ ] Run `git diff --check`.
- [ ] Review `git diff --stat` and confirm only intended source, generated symptom navigation, tests, and design documents changed.
