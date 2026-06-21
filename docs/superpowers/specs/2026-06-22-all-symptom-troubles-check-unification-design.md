# All Symptom Troubles Check Unification

## Scope

Apply the existing `symptoms/lower-back-pain.html` troubles-check design to all
24 symptom detail pages under `symptoms/`.

Exclude:

- `symptoms/index.html`
- headers and navigation
- symptom heroes
- education sections
- treatment flow
- FAQ
- related symptoms and articles
- CTA and footer

## Visual Source

The source of truth is the current lower-back page and the supplied screenshot:

- centered gray heading band
- downward gray triangle
- white bordered list panel
- black outlined checkboxes with red check marks
- red emphasis text
- eight vertically stacked concern items
- compact single-column mobile layout

## Content

- Keep each page's concerns specific to that symptom.
- Preserve useful existing statements and expand shorter lists to eight items.
- Highlight only the key phrase in each relevant line with `<strong>`.
- Avoid guarantees, diagnosis claims, fear-based language, and claims that other
  care is ineffective.

## Implementation

- Keep the established inline, copied troubles-check CSS pattern used by the
  major symptom pages.
- Replace each legacy `<section class="concerns">` block with one
  `<section id="troubles" class="troubles-check">`.
- Use an accessible page-specific `aria-label`.
- Ensure exactly eight `<li>` items on every symptom detail page.

## Verification

- Add a failing broad regression test that enumerates every symptom detail page.
- Verify one section, eight items, exact heading, page-specific aria label,
  copied CSS, mobile CSS, and removal of legacy concerns markup.
- Check representative upper-body, lower-body, and nerve pages in desktop and
  mobile browser widths.
- Run the full test suite and `git diff --check`.
