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

---

# Design QA: Lower Back Home Guide

## Comparison

- Source visual truth: `C:\Users\takus\AppData\Local\Temp\codex-clipboard-967f13b8-db2e-4aa6-a5d6-e883bcd1c351.png`
- Implementation route: `http://127.0.0.1:8765/symptoms/lower-back-pain.html`
- Final desktop screenshot: `C:\Users\takus\AppData\Local\Temp\lower-back-desktop-section-final-3.png`
- Final mobile screenshot: `C:\Users\takus\AppData\Local\Temp\lower-back-mobile-section-final-3.png`
- Final side-by-side comparison: `C:\Users\takus\AppData\Local\Temp\lower-back-design-comparison-final.png`
- Desktop viewport: 1208 × 776 CSS px at device density 1.
- Source pixels: 1208 × 776. Implementation component pixels: 1193 × 735 because the browser scrollbar occupies 15 px and the implemented section is shorter than the source canvas. It was normalized to 1208 × 776 with white padding only; content was not stretched.
- Mobile viewport: 390 × 844 CSS px at device density 1. The content capture is 375 × 1122 px after excluding the browser scrollbar.
- State: default/resting state, with the consultation link visible and enabled.

## Full-view Comparison Evidence

- The final comparison shows the same hierarchy as the source: centered title and lead, green action column, orange caution column, dividing rules, and a pale consultation strip.
- Desktop content width, two-column balance, vertical rhythm, and footer placement now closely follow the source while retaining the site's existing font and color tokens.
- At 390 px the two columns stack in reading order, the title breaks at the intended phrase boundary, and there is no horizontal overflow.

## Focused Region Evidence

- A separate focused crop was not required because the entire source is one component and all headings, body copy, icons, rules, and the footer CTA remain legible at the native 1208 × 776 comparison size.
- The final mobile component crop was reviewed separately to verify wrapping, spacing, CTA visibility, and responsive stacking.

## Comparison History

### Iteration 1

- [P2] The first implementation used the existing 864 px content width, making the two columns and footer visibly narrower than the source.
- [P2] The first title and body typography were smaller, and the footer fell below the 776 px comparison frame.
- Fixes: widened only this component to a 1080 px container, increased the title/body/icon scale, shortened explanatory copy, and tuned group/item padding so the footer remains part of the same visual unit.
- Post-fix evidence: `C:\Users\takus\AppData\Local\Temp\lower-back-design-comparison-final.png` shows the corrected proportions and no remaining P0, P1, or P2 mismatch.

## Required Fidelity Surfaces

- Fonts and typography: the site's existing Japanese system font stack is retained; weight, size, line height, and hierarchy now match the source closely. Mobile wrapping is intentional and phrase-safe.
- Spacing and layout rhythm: desktop uses two balanced columns and mobile uses one column. Borders, section gaps, footer spacing, and outer padding were verified visually.
- Colors and visual tokens: existing dark green, caution orange, muted body text, white background, and pale green footer treatment are preserved with sufficient contrast.
- Image quality and asset fidelity: this component contains no photography. Icons come from the existing Lucide library and render sharply at both breakpoints; no placeholder, emoji, CSS drawing, or inline handcrafted SVG was introduced.
- Copy and content: four concise, medically cautious items replace the longer five-card list. Medical restrictions continue to defer to the physician's instructions.

## Interaction and Runtime Checks

- Consultation link resolves to `../#contact`, is visible, and is enabled.
- Desktop and mobile layouts have no horizontal overflow.
- Browser console errors: none.
- Full automated test suite: passed.

## Follow-up Polish

- [P3] The exact icon metaphors differ slightly from the illustration-style source because the implementation intentionally reuses the site's established Lucide icon set.

final result: passed
