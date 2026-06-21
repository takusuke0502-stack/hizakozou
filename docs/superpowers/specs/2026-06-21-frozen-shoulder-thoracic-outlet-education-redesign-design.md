# Frozen Shoulder And Thoracic Outlet Education Redesign

## Scope

Edit only:

- `symptoms/frozen-shoulder.html`
- `symptoms/thoracic-outlet.html`

Preserve each page's header, navigation, hero, concerns section, treatment flow,
FAQ, related symptoms, related articles, final CTA, footer, tracking code,
structured data, and fixed mobile CTA.

Replace the old educational content immediately before the treatment-flow
section with a marker-bounded patient-friendly block.

## Shared Sequence

Each page uses this sequence:

1. Why symptoms or load may occur
2. Four contributing factors
3. A four-step symptom flow
4. Why local relief may not last
5. Medical referral guidance
6. Whole-body assessment
7. Three-step clinic approach
8. LINE consultation CTA
9. Individualized visit-frequency explanation

## Frozen Shoulder Copy Direction

- Do not state one structural fault as the true cause of frozen shoulder.
- Explain that pain, inflammation, protective stiffness, reduced shoulder-blade
  movement, and reduced daily use can interact differently for each person.
- Emphasize the need to match movement and exercise to the current pain and
  mobility stage instead of forcing the arm upward.
- Direct trauma, deformity, fever or swelling, progressive weakness or
  numbness, chest symptoms, and severe persistent rest pain to a medical
  institution.

## Thoracic Outlet Copy Direction

- Do not diagnose vascular or neurological compression from posture alone.
- Explain that arm position, prolonged desk work, shoulder-girdle load,
  breathing, and neck or upper-back movement may influence symptoms.
- Clearly state that sudden weakness, marked color or temperature change,
  swelling, chest symptoms, trauma, or progressive numbness require medical
  evaluation.
- Describe the clinic's role as checking symptom-provoking positions and
  whole-body movement after medical conditions have been considered.

## Visual And Responsive System

- Match the approved scoliosis and TMJ education sections.
- Use white and light cream bands, dark green accents, dark gray text, thin
  rules, and minimal shadows.
- Use page-scoped `.frozen-*` and `.thoracic-*` classes.
- Reuse existing local shoulder illustrations and the movement-assessment
  photograph.
- Desktop uses two-column layouts, two-by-two factor grids, four-step horizontal
  flows, and three horizontal approach steps.
- At 767px and below, layouts become one column and flows become vertical
  timelines with full-width LINE buttons.

## Verification

- Add marker-boundary, structure, copy-guardrail, responsive CSS, image, and LINE
  link tests before implementation.
- Run focused tests, the full `npm test` suite, `git diff --check`, and desktop,
  tablet, and mobile browser QA for both pages.
