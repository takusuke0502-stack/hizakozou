# Shoulder Stiffness Education Redesign

## Scope

Edit only `symptoms/shoulder-stiffness.html`.

Preserve the existing header, navigation, hero, concerns section, patient voices,
treatment flow, FAQ, related symptoms, related articles, pricing CTA, access,
footer, tracking code, structured data, and fixed mobile CTA.

Replace the content from `肩こりはなぜ起こるのか` through the current
frequency section with one page-specific education block.

## Content Sequence

1. 肩こりはなぜ起こるのか？
2. 首・肩に負担が集まりやすくなる4つの要因
3. 肩こりが起きるまでの流れ
4. なぜマッサージを受けても戻ることがあるのか？
5. 医療機関への相談を優先する症状
6. 首・肩だけでなく全身の動きを確認する説明
7. 動かす・支える・使い方を整える3ステップ
8. LINE相談CTA
9. 個人差を前提にした通院頻度の説明

## Visual System

- White and very light cream section bands
- Existing site dark green as the primary accent
- Dark gray body copy
- Thin rules and open layouts instead of repeated cards
- Scoped `.shoulder-*` classes only
- Existing Lucide icon library
- Existing shoulder illustration and movement-assessment photograph

## Responsive Behavior

- Desktop uses two-column cause and assessment layouts.
- Four factors use a two-by-two ruled grid.
- Symptom flow uses four horizontal steps.
- The clinic approach uses three horizontal steps.
- At 767px and below, all major layouts become one column.
- Symptom flow and clinic approach become vertical timelines.
- The LINE button becomes full width and retains a minimum 44px tap target.
- No page-level horizontal overflow is introduced.

## Copy Guardrails

- Do not diagnose the cause of shoulder stiffness.
- Describe posture, breathing, shoulder-blade movement, and daily activity as
  possible contributing factors.
- Avoid `根本原因`, `完治`, `必ず改善`, `再発しない`, and unexplained muscle
  names.
- Clearly direct sudden severe symptoms, neurological changes, trauma, fever,
  chest symptoms, and persistent night pain to a medical institution.

## Verification

- Add structural tests for section order, counts, image paths, medical warnings,
  link preservation, scoped CSS, and mobile layout rules.
- Run the focused Node test, the full `npm test` suite, and `git diff --check`.
- Inspect the local page in the in-app browser at desktop and mobile widths.
