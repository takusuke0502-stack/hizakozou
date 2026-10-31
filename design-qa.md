# Design QA: MEO予約希望・お問い合わせページ

## Comparison

- Source visual truth: `C:/Users/takus/Downloads/Codex 画像 2026年8月30日 20_00_23.png`
- Browser-rendered implementation: `C:/Users/takus/Downloads/hizakozou-main/tmp/reservation-desktop-v2.png`
- Mobile implementation: `C:/Users/takus/Downloads/hizakozou-main/tmp/reservation-mobile-v2.png`
- Updated mobile hero: `C:/Users/takus/Downloads/hizakozou-main/tmp/reservation-mobile-hero-v3.png`
- Updated mobile hero reference: `C:/Users/takus/AppData/Local/Temp/codex-clipboard-d5392c58-9186-4dd2-af0b-df0cbac0aaf9.png`
- Full-view comparison: `C:/Users/takus/Downloads/hizakozou-main/tmp/reservation-qa-full-v2.png`
- Focused hero comparison: `C:/Users/takus/Downloads/hizakozou-main/tmp/reservation-qa-hero-v2.png`
- Desktop viewport: 1440 × 1000 CSS px, device scale factor 1
- Mobile viewport: 390 × 844 CSS px, device scale factor 1
- Source pixels: 866 × 1815
- Desktop implementation pixels: 1425 × 2101（スクロールバーを除く全ページ）
- State: 初期表示、および未入力・返信方法・定休日の入力エラー表示

## Full-view comparison evidence

- ヘッダー、生成り色の2カラムヒーロー、緑を主色とした予約導線、確認事項、安心案内、フッターという情報構造を維持した。
- モックの外部予約システムカードは、実運用に合わせてページ内フォームへ置き換えた。LINEと電話は補助導線としてフォーム横に配置した。
- 実際の住所、電話番号、受付時間、定休日、初回時間・初回料金へ置き換えた。
- モックより全ページが長いのは、予約希望日時と連絡先をページ内で入力できるようにしたための意図的な差分である。

## Focused region comparison evidence

- ヒーローを同じ位置・同じ状態で比較し、左側の見出しと安心材料、右側の施術写真という構成、余白、生成り色と緑のバランスを確認した。
- モック内の人物写真を既存サイトの実写 `image/clinic-leg-treatment-hp.webp` に置き換え、引き伸ばしや不自然な切り抜きがないことを確認した。
- 見出しは既存サイトと同じ読みやすいゴシック系フォールバックを使用し、スマホで横方向にはみ出さないことを確認した。

## Findings and comparison history

- [P1 resolved] 初期版はフォームを最初から大きく表示し、モックの「3つの予約方法から選ぶ」構成と異なっていた。
  - Fix: Web・LINE・電話をモックに近い3段の選択カードへ変更し、Webフォームはボタンを押した後に開く構成へ変更した。
  - Post-fix evidence: `reservation-qa-full-v2.png` で、モックと実装のページ構成・密度・全体の長さが近づいたことを確認した。
- [P1 resolved] 初期版のヒーロー写真がスマホで画面の大部分を占めていた。
  - Fix: PCは写真を高さ360px、スマホは220pxに制限し、スマホでも左右の余白と角丸を残した。
  - Post-fix evidence: `reservation-mobile-v2.png` で、写真の直後に予約方法の見出しが自然に続き、横方向のはみ出しがないことを確認した。
- [P1 resolved] スマホ版で案内文と写真が縦に積まれ、参考画像よりヒーローが長く見えていた。
  - Fix: 680px以下では案内を左、写真を右に置くコンパクトな2カラムへ変更し、安心材料も3列に整理した。
  - Post-fix evidence: `reservation-mobile-hero-v3.png` で、ヒーロー全体237px、写真196px、水平オーバーフローなしを確認した。
- [P2 resolved] 電話番号が補足文と同じまとまりに見え、電話導線として目立ちにくかった。
  - Fix: 「受付 9:00〜19:00」を電話番号下から削除し、番号をPC 2.15rem、スマホ 1.82remへ拡大した。
  - Post-fix evidence: スマホ表示で電話番号の算出サイズ29.12px、表示文言が電話番号のみであることを確認した。
- [P2 resolved] メール返信を選択してもメールアドレスなしで進める状態だった。
  - Fix: メール返信選択時はメールアドレスを必須にし、該当欄へフォーカスするよう修正した。
  - Post-fix evidence: フォームを送信せず、エラーメッセージとフォーカス移動をブラウザで確認した。
- [P2 resolved] 定休日の日曜日を希望日に選択できた。
  - Fix: 日曜日を選んだ場合は送信を止め、月曜から土曜を案内するよう修正した。
  - Post-fix evidence: 2026-09-06を入力し、フォームが送信されずエラーになることを確認した。
- [P3] モックのイラスト付き相談枠は実在する代表写真へ変更した。ブランドの信頼性を優先した意図的な差分として許容する。

## Required fidelity surfaces

- Fonts and typography: 既存サイトのゴシック系フォント、太さ、行間を踏襲。PC・スマホとも見出しの折り返しに問題なし。
- Spacing and layout rhythm: PCは2カラム。スマホのヒーローは参考画像に合わせた2カラム、その他は1カラム。水平オーバーフローなし。フォームの入力間隔とタップ領域を確認済み。
- Colors and visual tokens: モックの深緑、生成り、白、電話のオレンジをCSS変数へ整理。文字コントラストを維持。
- Image quality and asset fidelity: 既存のWebP実写を原寸比のまま使用。ヒーローと代表写真に不自然な伸縮なし。
- Copy and content: 「予約確定」ではなく「予約希望」と明示。返信後に確定することを見出し下、送信ボタン下、確認事項に表示。

## Primary interactions tested

- 未入力送信時の必須エラーと先頭項目へのフォーカス
- メール返信選択時のメールアドレス必須化
- 日曜日選択時の定休日エラー
- LINE・電話リンクのURL・電話番号
- PC／スマホのレスポンシブ表示
- ブラウザコンソールエラーなし
- 外部送信先へテストデータは送信していない

## Remaining findings

- P0/P1/P2なし。外部送信の本番確認は、院へテスト通知を送ってよいタイミングで別途実施する。

final result: passed

---

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

---

## Additional QA: weekly discount capacity

# Discount banner design QA

final result: passed

## Target and evidence

Scope: the supplied discount-capacity banner adapted inside the existing hizakozou website. Source: `C:/Users/takus/AppData/Local/Temp/codex-clipboard-be137e49-bf26-44ba-b56a-d433153a0eb0.png` (998 x 148). The reference's 6 total / 2 remaining and November 10 deadline are replaced by the user's explicit weekly cap of 5 / remaining 3 and the current Sunday deadline of November 1. Those are intentional content changes.

The source and final screenshots were opened together in one comparison input, including the focused card and the surrounding page context. Final evidence in `C:/Users/takus/Downloads/hizakozou-main/output/new-article-20261031/`:

- `discount-proof-card.png`: final desktop campaign and price card, 1168 x 403, cropped from the actual in-app-browser screenshot using its recorded viewport coordinates.
- `discount-proof-full.png`: uncropped screenshot for that evidence.
- `discount-home-390-final.png`, `discount-home-768-final.png`, `discount-home-1440-final.png`.
- `discount-knee-390.png`, `discount-knee-768.png`, `discount-knee-1440.png`.
- `discount-home-booking-768.png`: narrow booking-column layout.

CSS viewports: 390/768/1440 x 1000. In-app capture includes the browser's scrollbar/frame scaling; the 1440 x 1000 view yielded 1425 x 990 pixels. The proof crop was scaled from the recorded geometry. Raw clip captures that did not honor the requested position were excluded from comparison.

## Findings and fixes

1. P1, fixed: existing home-page paragraph rules overrode the count's red color and type size. Scoped component rules now render the count in `rgb(213,43,21)` on both pages.
2. P2, fixed: the narrow tablet booking column broke the left-hand label into fragments. Booking columns use a vertical arrangement at narrow viewports. The extra “初回割引” prefix was moved into the explanatory note so “5名様限定” remains compact.
3. P2, fixed: the preview fragment originally targeted a hidden loading element. The homepage link now targets the always-present campaign section. The counter is shown only after usable display data is available.

## Required fidelity surfaces

- Fonts and typography: existing Japanese site fonts retained. Dark bold deadline and quota on the left, larger red remaining numeral on the right. Desktop uses an 82px numeral; mobile uses 46px in the main banner. Narrow booking-column adaptations preserve readability.
- Spacing and layout rhythm: reference's left details / centered arrow / right count retained in the main banner, with the site's existing card padding and a small explanatory line. No overflow at any checked width. Narrow booking fields stack intentionally.
- Colors and tokens: warm near-white panel, dark text, red count; surrounding green clinic style retained. No fabricated scarcity animation.
- Image quality and assets: existing clinic photos and pricing artwork unchanged. Arrow uses the licensed Lucide Static SVG instead of a custom drawing. The final screenshot crop is QA evidence only; the supplied reference was not edited.
- Copy and content: “5名様限定”, “残り3名様”, Sunday deadline, and the distinction between discount applications and subsequently arranged appointment dates are present. Numbers come from the shared week-specific configuration. Zero and unknown states have separate messages; unit tests cover them.

## Functional checks

All three placements show capacity 5 and remaining 3. No console errors. Existing LINE destinations remain intact; no reservation or message was submitted. The temporary responsive viewport override was reset. Thirteen date/availability tests pass; the complete suite has 201 passes, 100 pre-existing skips, and the same two pre-existing FAQ-navigation failures.

No P0/P1/P2 findings remain. Accepted P3 adaptation: the deadline may occupy two lines on mobile because the banner sits inside the existing clinic card. No publication was performed.


### Publication follow-up: remaining 2

User authorized publication and set remaining places to 2 on 2026-11-01. The shared configuration was updated from 3 to 2. All three rendered placements show capacity 5 and remaining 2. Screenshot: `C:/Users/takus/Downloads/hizakozou-main/output/new-article-20261031/discount-remaining-2-local.png`. The IAB confirmation API returned an unavailable error; the existing Playwright verification browser was used as the documented unavailable-browser fallback. Full suite: 201 passed, 100 skipped, same two pre-existing failures.

final result: passed
