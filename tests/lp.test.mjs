import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles/main.css", import.meta.url), "utf8");

test("LP hero keeps the first support band directly after the hero", () => {
  const heroStart = html.indexOf("<main>");
  const heroBand = html.indexOf("<section class=\"py-10 bg-slate-50 border-y border-slate-200\">");

  assert.ok(heroStart > -1, "main section should exist");
  assert.ok(heroBand > -1, "hero support band should exist");
  assert.ok(heroStart < heroBand, "hero should be followed by the support band");
  assert.match(html, /href="#knee-type-nav"/);
  assert.match(html, /href="https:\/\/lin\.ee\/X01F2mP"/);
});
test("LP places first-visit reassurance before pricing", () => {
  const firstVisitIndex = html.indexOf('id="first-visit-policy"');
  const priceIndex = html.indexOf('id="price"');

  assert.ok(firstVisitIndex > -1, "first-visit policy section should exist");
  assert.ok(priceIndex > -1, "price section should exist");
  assert.ok(firstVisitIndex < priceIndex, "first-visit reassurance should appear before pricing");
});

test("LP adds knee-pain type navigation before the broad symptom list", () => {
  const typeNavIndex = html.indexOf('id="knee-type-nav"');
  const symptomsIndex = html.indexOf('id="symptoms"');

  assert.ok(typeNavIndex > -1, "knee-pain type navigation should exist");
  assert.ok(symptomsIndex > -1, "symptoms section should exist");
  assert.ok(typeNavIndex < symptomsIndex, "type navigation should guide users before the full symptom list");
  assert.match(html, /href="symptoms\/knee-osteoarthritis\.html"/);
  assert.match(html, /href="symptoms\/knee-posterior-pain\.html"/);
});

test("LP links lumbar disc herniation and scoliosis to their own symptom pages", () => {
  assert.ok(
    existsSync(new URL("../symptoms/lumbar-disc-herniation.html", import.meta.url)),
    "lumbar disc herniation symptom page should exist"
  );
  assert.ok(
    existsSync(new URL("../symptoms/scoliosis.html", import.meta.url)),
    "scoliosis symptom page should exist"
  );
  assert.match(html, /href="symptoms\/lumbar-disc-herniation\.html"/);
  assert.doesNotMatch(html, /href="symptoms\/spinal-stenosis\.html"[^>]*>閻ｰ讀取､朱俣譚ｿ繝倥Ν繝九い/);
  assert.match(html, /href="symptoms\/scoliosis\.html"/);
});

test("LP adds the responsive three-step improvement section after the first-visit policy", () => {
  const firstVisitIndex = html.indexOf('id="first-visit-policy"');
  const threeStepIndex = html.indexOf('id="three-step-care"');
  const troublesIndex = html.indexOf('id="troubles"');

  assert.ok(firstVisitIndex > -1, "first-visit policy section should exist");
  assert.ok(threeStepIndex > -1, "three-step section should exist");
  assert.ok(troublesIndex > -1, "troubles section should exist");
  assert.ok(firstVisitIndex < threeStepIndex, "three-step section should appear after first-visit policy");
  assert.ok(threeStepIndex < troublesIndex, "three-step section should appear before troubles");

  assert.ok(
    existsSync(new URL("../images/hizakozou-3step-pc.webp", import.meta.url)),
    "desktop three-step image should exist"
  );
  assert.ok(
    existsSync(new URL("../images/hizakozou-3step-sp-1.webp", import.meta.url)),
    "mobile step 1 image should exist"
  );
  assert.ok(
    existsSync(new URL("../images/hizakozou-3step-sp-2.webp", import.meta.url)),
    "mobile step 2 image should exist"
  );
  assert.ok(
    existsSync(new URL("../images/hizakozou-3step-sp-3.webp", import.meta.url)),
    "mobile step 3 image should exist"
  );

  assert.match(html, /aria-label="ひざこぞうの改善は3ステップ"/);
  assert.match(html, /src="images\/hizakozou-3step-pc\.webp"[\s\S]*alt="縺ｲ縺悶％縺槭≧縺ｮ謾ｹ蝟・・3繧ｹ繝・ャ繝励ｒ隱ｬ譏弱☆繧句峙隗｣"/);
  assert.match(html, /src="images\/hizakozou-3step-sp-1\.webp"[\s\S]*alt="縺ｲ縺悶％縺槭≧縺ｮ謾ｹ蝟・せ繝・ャ繝・ 謨ｴ縺医ｋ"/);
  assert.match(html, /src="images\/hizakozou-3step-sp-2\.webp"[\s\S]*alt="縺ｲ縺悶％縺槭≧縺ｮ謾ｹ蝟・せ繝・ャ繝・ 謾ｯ縺医ｋ"/);
  assert.match(html, /src="images\/hizakozou-3step-sp-3\.webp"[\s\S]*alt="縺ｲ縺悶％縺槭≧縺ｮ謾ｹ蝟・せ繝・ャ繝・ 蜍輔￠繧倶ｽ薙∈"/);
  assert.match(html, /<!-- 逕ｻ蜒丞ｷｮ縺玲崛縺・ PC逕ｨ 3繧ｹ繝・ャ繝怜峙隗｣ -->/);
  assert.match(html, /<!-- 逕ｻ蜒丞ｷｮ縺玲崛縺・ 繧ｹ繝槭・逕ｨ 繧ｹ繝・ャ繝・ -->/);
  assert.match(html, /class="three-step-mobile-copy"/);
  assert.match(html, /class="three-step-mobile-eyebrow"/);
  assert.match(html, /class="three-step-mobile-title"/);
  assert.match(html, /class="three-step-mobile-lead"/);
});

test("LP styles the three-step section for desktop and mobile image switching", () => {
  assert.match(css, /\.three-step-shell\s*{[^}]*max-width:\s*980px;/s);
  assert.match(css, /\.three-step-visual--desktop\s*{[^}]*display:\s*block;/s);
  assert.match(css, /\.three-step-visual--mobile\s*{[^}]*display:\s*none;/s);
  assert.match(css, /\.three-step-mobile-copy\s*{[^}]*display:\s*none;/s);
  assert.match(css, /\.three-step-image-frame--desktop\s*{[^}]*aspect-ratio:\s*3 \/ 2;/s);
  assert.match(css, /\.three-step-image-frame--mobile\s*{[^}]*aspect-ratio:\s*2 \/ 3;/s);
  assert.match(css, /@media \(max-width:\s*768px\)\s*{[\s\S]*?\.three-step-visual--desktop\s*{[^}]*display:\s*none;/s);
  assert.match(css, /@media \(max-width:\s*768px\)\s*{[\s\S]*?\.three-step-visual--mobile\s*{[^}]*display:\s*block;/s);
  assert.match(css, /@media \(max-width:\s*768px\)\s*{[\s\S]*?\.three-step-mobile-copy\s*{[^}]*display:\s*block;/s);
});
