# Plantar Fasciitis Education Redesign

## Scope

Edit only `symptoms/plantar-fasciitis.html`.

Preserve the header, navigation, hero, concerns section, treatment flow, FAQ,
related symptoms, related articles, final CTA, footer, tracking code, structured
data, and fixed mobile CTA.

Replace the current cause, middle CTA, approach, director message, and fixed
visit-frequency content immediately before the treatment-flow section.

## Content Sequence

1. 足底筋膜炎・かかとの痛みはなぜ起こるのか？
2. 足裏に負担が集まりやすくなる4つの要因
3. かかとの痛みが起きるまでの流れ
4. なぜ休んだり足裏をほぐしても戻ることがあるのか？
5. 医療機関への相談を優先する症状
6. 足裏だけでなく全身の動きを確認する説明
7. 動かす・支える・使い方を整える3ステップ
8. LINE相談CTA
9. 個人差を前提にした通院頻度の説明

## Visual System

- Match the approved lower-back and shoulder-stiffness education sections.
- Use white and light cream bands, dark green accents, dark gray text, and thin
  rules.
- Avoid repeated large cards and strong shadows.
- Use only page-scoped `.plantar-*` classes.
- Reuse the existing foot-structure illustration and movement-assessment image.

## Copy Guardrails

- Treat 足底腱膜炎 and 足底筋膜炎 as commonly used names without diagnosing.
- Describe ankle movement, calf tension, foot support, standing, and walking as
  possible contributing factors.
- Avoid guarantees, fixed causes, `根本治療`, `完治`, `再発しない`, and
  unexplained specialist terminology.
- Direct severe trauma, inability to bear weight, marked swelling or heat,
  progressive numbness or weakness, fever, and persistent night pain to a
  medical institution.

## Responsive Behavior

- Desktop: two-column cause and assessment sections, two-by-two factor grid,
  four-step horizontal flow, and three horizontal approach steps.
- Mobile at 767px and below: one-column layouts, vertical symptom flow, vertical
  approach timeline, full-width LINE CTA, and no horizontal page overflow.

## Verification

- Add marker-boundary and structural tests before implementation.
- Verify image paths, LINE URL, warning count, responsive CSS, and prohibited
  wording.
- Run the focused test, full `npm test`, `git diff --check`, and desktop/mobile
  browser QA.
