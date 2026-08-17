# Design QA: Symptom Troubles Check Unification

## Comparison

- Reference: local temporary screenshot (not stored in the repository)
- Existing reference page: `symptoms/lower-back-pain.html`
- Representative implementation: `symptoms/frozen-shoulder.html`
- Additional mobile checks: `symptoms/plantar-fasciitis.html`, `symptoms/carpal-tunnel.html`
- Viewports checked: 390px, 521px, 768px, 1024px, 1440px
- Side-by-side evidence was reviewed during QA and removed with the temporary browser artifacts afterward.

## Findings

- The gray heading band, lower triangle, white list panel, border radius, and restrained shadow match the lower-back reference.
- Checkbox outlines, red check marks, red emphasized phrases, typography, and spacing remain consistent across the sampled pages.
- All sampled sections contain eight symptom-specific items and remain within their own width at every checked viewport.
- At 1024px, the existing lower-back page and sampled converted page both retain the same pre-existing 40px document overflow outside this section. The `#troubles` section itself does not overflow.
- No browser console warnings or errors were found.

## Result

Passed. No P0, P1, or P2 visual issues remain in the unified troubles sections.

---

# Design QA: Nine Knee Symptom Education Redesign

## Comparison

- Reference implementation: `symptoms/lower-back-pain.html`
- Representative redesigned pages:
  - `symptoms/knee-effusion.html`
  - `symptoms/knee-lateral-pain.html`
  - `symptoms/bowlegs-knee-pain.html`
  - `symptoms/ankle-stiffness-knee-pain.html`
- Viewports checked: 375px, 390px, 768px, 1024px, 1440px
- A same-viewport side-by-side comparison of the lower-back reference and knee-effusion implementation was reviewed during QA and removed with the temporary browser artifacts afterward.

## Findings

- All nine education blocks use the approved sequence of cause, four factors, four-step flow, recurring-load explanation, medical referral, assessment, three-step approach, LINE CTA, and individualized visit frequency.
- The new sections remain within their own viewport width at every checked breakpoint.
- At 375px and 390px, factors, symptom flow, assessment, and approach content stack into one readable column. The LINE CTA remains at least 69px high.
- At 768px and above, factor grids use two columns, symptom flows use four columns, and the approach uses three columns.
- Existing local illustrations and assessment photography resolve successfully. The assessment image uses native lazy loading, so it is not fetched until the reader approaches that section.
- No browser console errors or warnings were found.
- At 1024px, the existing shared `site-header-contact` block extends 55px beyond the document viewport. The same common-header behavior predates this redesign; each new education wrapper itself has matching client and scroll widths and does not add horizontal overflow.

## Result

Final result: passed. No P0, P1, or P2 issues were found in the redesigned education sections.
