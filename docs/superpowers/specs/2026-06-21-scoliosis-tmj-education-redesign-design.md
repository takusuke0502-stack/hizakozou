# Scoliosis And TMJ Education Redesign

## Scope

Edit only:

- `symptoms/scoliosis.html`
- `symptoms/tmj.html`

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
5. Medical or dental referral guidance
6. Whole-body assessment
7. Three-step clinic approach
8. LINE consultation CTA
9. Individualized visit-frequency explanation

## Scoliosis Copy Direction

- Do not promise to straighten the spine or change the structural curve.
- Explain that load can become uneven across the ribs, back, pelvis, hips, and
  daily movements.
- Emphasize breathing, movement, fatigue, pain, and function rather than visual
  symmetry alone.
- Direct rapid changes during growth, trauma, progressive weakness or numbness,
  bowel or bladder changes, fever, and persistent night pain to a medical
  institution.

## TMJ Copy Direction

- Do not present posture as the sole cause of temporomandibular symptoms.
- Explain clenching, chewing habits, mouth opening, neck and upper-back posture,
  stress, and breathing as possible contributing factors.
- Clearly state that dental problems, bite concerns, trauma, locking, marked
  swelling, and difficulty eating require dental or medical evaluation.
- Describe the clinic's role as checking neck, shoulder, breathing, and
  whole-body movement without forcefully manipulating the jaw.

## Visual And Responsive System

- Match the approved lower-back, shoulder-stiffness, and plantar-fasciitis
  education sections.
- Use white and light cream bands, dark green accents, dark gray text, thin
  rules, and minimal shadows.
- Use page-scoped `.scoliosis-*` and `.tmj-*` classes.
- Reuse existing local illustrations and the movement-assessment photograph.
- Desktop uses two-column layouts, two-by-two factor grids, four-step horizontal
  flows, and three horizontal approach steps.
- At 767px and below, layouts become one column and flows become vertical
  timelines with full-width LINE buttons.

## Verification

- Add marker-boundary, structure, copy-guardrail, responsive CSS, image, and LINE
  link tests before implementation.
- Run focused tests, the full `npm test` suite, `git diff --check`, and desktop
  and mobile browser QA for both pages.
