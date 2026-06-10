import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const voicesHtml = readFileSync(new URL("../voices.html", import.meta.url), "utf8");
const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const mainJs = readFileSync(new URL("../scripts/main.js", import.meta.url), "utf8");
const mainCss = readFileSync(new URL("../styles/main.css", import.meta.url), "utf8");
const buildBlogScript = readFileSync(new URL("../scripts/build-blog.mjs", import.meta.url), "utf8");
const generateBlogScript = readFileSync(new URL("../scripts/generate-blog.mjs", import.meta.url), "utf8");
const trackingConfigPath = path.join(repoRoot, "scripts", "tracking-config.js");
const trackingJsPath = path.join(repoRoot, "scripts", "tracking.js");
const trackingConfig = existsSync(trackingConfigPath) ? readFileSync(trackingConfigPath, "utf8") : "";
const trackingJs = existsSync(trackingJsPath) ? readFileSync(trackingJsPath, "utf8") : "";
const siteTitle =
  "柏市の足腰専門整体院｜腰痛・坐骨神経痛・股関節痛・膝痛に｜整体院ひざこぞう";
const broadenedMetaDescription =
  "柏駅西口徒歩8分。腰痛・坐骨神経痛・脊柱管狭窄症・股関節痛・膝の痛みなど、足腰の慢性的な痛みに対応する整体院です。国家資格者が身体の状態と動き方を丁寧に確認し、無理のない施術とセルフケアでサポートします。";
const localBusinessDescription =
  "整体院ひざこぞうは、柏駅西口徒歩8分の足腰専門整体院です。腰痛、坐骨神経痛、股関節痛、膝の痛みなど、足腰の慢性的な不調に対して、国家資格者が身体の状態と動き方を丁寧に確認します。";
const footerSymptomsText =
  "腰痛／ぎっくり腰／坐骨神経痛／脊柱管狭窄症／椎間板ヘルニア／股関節痛／変形性股関節症／膝の痛み／変形性膝関節症／足首・足裏の不調";

function readPageIfExists(fileName) {
  const pagePath = path.join(repoRoot, fileName);
  return existsSync(pagePath) ? readFileSync(pagePath, "utf8") : "";
}

function walkFiles(dir, predicate, files = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === ".git" || entry === "node_modules") continue;

    const filePath = path.join(dir, entry);
    const stats = statSync(filePath);

    if (stats.isDirectory()) {
      walkFiles(filePath, predicate, files);
      continue;
    }

    if (predicate(filePath)) {
      files.push(filePath);
    }
  }

  return files;
}

function toRepoPath(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, "/");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getJsonLdBlocks(type) {
  const matches = [...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)];

  return matches
    .map((match) => JSON.parse(match[1]))
    .filter((block) => {
      const blockType = block["@type"];
      return Array.isArray(blockType) ? blockType.includes(type) : blockType === type;
    });
}

function getSectionSlice(startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  const end = endMarker ? html.indexOf(endMarker) : html.length;

  assert.ok(start > -1, `missing start marker: ${startMarker}`);
  assert.ok(end > start, `missing end marker after ${startMarker}`);

  return html.slice(start, end);
}

function getElementSlice(startMarker, closeMarker = "</nav>") {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(closeMarker, start);

  assert.ok(start > -1, `missing start marker: ${startMarker}`);
  assert.ok(end > start, `missing close marker after ${startMarker}`);

  return html.slice(start, end + closeMarker.length);
}

function getFooterBlocks(pageHtml) {
  return [...pageHtml.matchAll(/<footer class="hk-footer-section">[\s\S]*?<\/footer>/g)].map((match) => match[0]);
}

function getTopLevelSectionSlice(sectionId) {
  const startMarker = `<section id="${sectionId}"`;
  const start = html.indexOf(startMarker);
  const nextSection = html.indexOf('\n    <section id="', start + startMarker.length);

  assert.ok(start > -1, `missing section: ${sectionId}`);

  return html.slice(start, nextSection > -1 ? nextSection : html.length);
}

function getCssRule(selector) {
  const pattern = new RegExp(`${escapeRegExp(selector)}\\s*\\{([\\s\\S]*?)\\n\\s*\\}`, "m");
  const match = mainCss.match(pattern);
  assert.ok(match, `missing CSS rule: ${selector}`);
  return match[1];
}

function getLocalImageReferences() {
  const refs = new Set();

  for (const match of html.matchAll(/\b(?:src|href)=["'](?!https?:\/\/|data:|\/)([^"'?#>]+\.(?:svg|png|jpe?g|webp))["']/gi)) {
    refs.add(match[1]);
  }

  for (const match of html.matchAll(/\bsrcset=["']([^"']+)["']/gi)) {
    const candidates = match[1]
      .split(",")
      .map((entry) => entry.trim().split(/\s+/)[0])
      .filter((entry) => entry && !entry.startsWith("http") && !entry.startsWith("data:") && !entry.startsWith("/"));

    for (const candidate of candidates) {
      if (/\.(svg|png|jpe?g|webp)$/i.test(candidate)) {
        refs.add(candidate);
      }
    }
  }

  return [...refs].sort();
}

test("LP follows the new section order for the knee-pain explanation flow", () => {
  const markers = [
    '<section class="pt-28 pb-16 md:pt-40 md:pb-24 bg-white overflow-hidden relative hero-fixed hz-hero">',
    'id="troubles"',
    'id="knee-msm-reasons"',
    'id="msm-method"',
    'id="flow"',
    'id="first-visit-policy"',
    'id="profile"',
    'id="voice"',
    'id="price"',
    'id="faq"',
    'id="access"'
  ];

  const positions = markers.map((marker) => html.indexOf(marker));
  positions.forEach((position, index) => {
    assert.ok(position > -1, `marker should exist: ${markers[index]}`);
  });

  for (let index = 1; index < positions.length; index += 1) {
    assert.ok(
      positions[index - 1] < positions[index],
      `${markers[index - 1]} should appear before ${markers[index]}`
    );
  }
});

test("LP removes the long-knee-pain accordion guide block", () => {
  assert.doesNotMatch(html, /id="seo-guide"/);
  assert.doesNotMatch(html, /なぜ膝の痛みが長引くのか？/);
  assert.doesNotMatch(html, /湿布・注射を続けているのに、なぜ繰り返すのか/);
  assert.doesNotMatch(html, /膝をかばう動きが、別の負担を増やすことがある/);
  assert.doesNotMatch(html, /「動くとまた痛いかも」という不安も積み重なる/);
});

test("LP troubles section speaks to foot, low-back, hip pain and numbness without changing CTAs", () => {
  const troubles = getTopLevelSectionSlice("troubles");

  for (const concern of [
    "朝起きると腰が重く、すぐに動き出せない",
    "長く座っていると腰やお尻がつらくなる",
    "歩いていると足にしびれが出て、休みたくなる",
    "階段の上り下りが不安になってきた",
    "股関節や足の付け根がつまって歩きづらい",
    "病院では「年齢のせい」「様子を見ましょう」と言われた",
    "薬や湿布だけでは、"
  ]) {
    assert.match(troubles, new RegExp(escapeRegExp(concern)));
  }

  assert.match(troubles, /この先が不安/);
  assert.match(troubles, /alt="足腰の痛みやしびれに悩む方"/);
  assert.doesNotMatch(troubles, /歩き始めや立ち上がりで、膝にズキッとした痛みが出る/);
  assert.doesNotMatch(troubles, /膝をかばって歩いているうちに/);
  assert.doesNotMatch(troubles, /正座やしゃがむ動作がしづらく/);
  assert.doesNotMatch(troubles, /LINEで|電話で|無料相談|予約/);
});

test("LP adds a diagram-backed three-reason block before the MSM method", () => {
  const reasons = getTopLevelSectionSlice("knee-msm-reasons");
  const expectedDiagrams = [
    ["images/msm/reason-muscle-balance.webp", "サボり筋と過労筋の対比図"],
    ["images/msm/msm-flow-body.webp", "足首から膝と腰へねじれが波及する図解"],
    ["images/msm/reason-brain-nerve-loop.webp", "悪い動きから神経の過敏化まで続く悪循環の図解"]
  ];

  assert.match(reasons, /<section id="knee-msm-reasons" class="knee-msm-reasons" aria-labelledby="knee-msm-reasons-title">/);
  assert.match(reasons, /痛みが戻る仕組み/);
  assert.match(reasons, /あなたの[\s\S]*足腰の痛み・しびれ[\s\S]*が戻ってしまう、本当の理由/);
  assert.match(reasons, /痛みは一生戻り続けます。/);
  assert.match(reasons, /MSMメソッドが解き明かす「痛み・しびれの根本原因」/);
  assert.match(reasons, /こんなお悩み、ありませんか/);
  assert.match(reasons, /揉んでもらうとその場は楽になるけれど、翌朝にはまた痛い/);
  assert.match(reasons, /何度もぶり返すのは、痛みが出ている場所が「被害者」に過ぎないからです。/);
  assert.match(reasons, /痛みがぶり返す「3つの原因」/);
  assert.match(reasons, /サボり筋[\s\S]*を放置して、[\s\S]*頑張りすぎな筋肉[\s\S]*だけを揉んでいるから/);
  assert.match(reasons, /腰や膝はただの被害者。真犯人は「[\s\S]*足首のゆがみ[\s\S]*」にあるから/);
  assert.match(reasons, /毎日の「間違った動き」を、脳と神経が記憶してしまっているから/);
  assert.match(reasons, /断ち切るべきループ/);
  assert.match(reasons, /悪い動き[\s\S]*特定箇所への負担[\s\S]*その場しのぎの治療[\s\S]*脳が痛みを記憶[\s\S]*神経の過敏化/);
  assert.match(reasons, /この悪循環を脳・神経レベルからリセットします/);
  assert.match(reasons, /運動療法（スタビリティワーク）/);
  assert.match(reasons, /サボり筋を狙って刺激/);
  assert.match(reasons, /認知行動療法的アプローチ/);
  assert.match(reasons, /「悪い動き方」の記憶をリセット/);
  assert.match(reasons, /この2つを組み合わせるのがMSMメソッド独自の視点/);
  assert.doesNotMatch(reasons, /メインビジュアル画像/);
  assert.doesNotMatch(reasons, /class="knee-msm-hero__visual"/);
  assert.equal((reasons.match(/class="knee-msm-reason__diagram"/g) || []).length, 3);
  assert.equal((reasons.match(/class="knee-msm-reason__diagram-image"/g) || []).length, 3);
  for (const [src, alt] of expectedDiagrams) {
    assert.match(reasons, new RegExp(`<img[^>]+src="${escapeRegExp(src)}"[^>]+alt="${escapeRegExp(alt)}"[^>]+class="knee-msm-reason__diagram-image"`));
  }
  assert.equal((reasons.match(/実装時は実際の写真に差し替え/g) || []).length, 0);
  assert.doesNotMatch(reasons, /サボり筋[\s\S]*イメージ画像/);
  assert.doesNotMatch(reasons, /関節連鎖[\s\S]*イメージ画像/);
  assert.doesNotMatch(reasons, /動作指導・[\s\S]*歩行分析の[\s\S]*イメージ画像/);
});

test("LP highlights the new foot-low-back and nerve keywords with a soft underline", () => {
  const reasons = getTopLevelSectionSlice("knee-msm-reasons");

  assert.equal((reasons.match(/class="knee-msm-highlight"/g) || []).length, 6);
  assert.match(reasons, /<span class="knee-msm-highlight">足腰の痛み・しびれ<\/span>/);
  assert.match(reasons, /<span class="knee-msm-highlight">土台の崩れ<\/span>/);
  assert.match(reasons, /<span class="knee-msm-highlight">脳の記憶<\/span>/);
  assert.match(reasons, /<span class="knee-msm-highlight">サボり筋<\/span>/);
  assert.match(reasons, /<span class="knee-msm-highlight">頑張りすぎな筋肉<\/span>/);
  assert.match(reasons, /<span class="knee-msm-highlight">足首のゆがみ<\/span>/);
  assert.match(mainCss, /\.knee-msm-highlight\s*{[\s\S]*background:\s*linear-gradient\(transparent 62%, rgba\(248,\s*164,\s*93,\s*0\.34\) 62%\);[\s\S]*box-decoration-break:\s*clone;/);
});

test("LP uses the mock-style MSM three-step CTA without duplicating the old method block", () => {
  const method = getTopLevelSectionSlice("features");

  assert.match(method, /<section id="features" class="knee-msm-steps" aria-labelledby="knee-msm-steps-title">/);
  assert.match(method, /id="msm-method"/);
  assert.match(method, /MSMメソッド 3ステップ/);
  assert.match(method, /痛みが戻らない体を、一緒に作ります。/);
  assert.match(method, /STEP\s*<strong>01<\/strong>/);
  assert.match(method, /STEP 01 — Mobility（緩める）/);
  assert.match(method, /「真犯人」の可動域を解放する/);
  assert.match(method, /STEP\s*<strong>02<\/strong>/);
  assert.match(method, /STEP 02 — Stability（鍛える）/);
  assert.match(method, /眠った「サボり筋」を目覚めさせる/);
  assert.match(method, /STEP\s*<strong>03<\/strong>/);
  assert.match(method, /STEP 03 — Movement（使える）/);
  assert.match(method, /再発しない「体の使い方」を身につける/);
  assert.match(method, /Mobilityアプローチの施術イメージ/);
  assert.match(method, /Stabilityトレーニングのイメージ/);
  assert.match(method, /Movement動作指導のイメージ/);
  assert.match(method, /繰り返しに、終止符を/);
  assert.match(method, /無料相談・ご予約はこちら/);
  assert.match(method, /href="https:\/\/lin\.ee\/X01F2mP"/);
  assert.equal((method.match(/実装時は実際の写真に差し替え/g) || []).length, 0);
  assert.doesNotMatch(method, /CTAビジュアル画像/);
  assert.doesNotMatch(method, /knee-msm-cta__visual/);
  assert.doesNotMatch(method, /<picture/);
  assert.doesNotMatch(html, /id="method-features"/);
});

test("LP MSM step cards use existing illustrations in unified contain frames", () => {
  const method = getTopLevelSectionSlice("features");
  const expectedImages = [
    ["images/msm/msm-step1-relax-illustration.webp", "Mobilityアプローチの施術イメージ"],
    ["images/msm/msm-step2-activate-illustration.webp", "Stabilityトレーニングのイメージ"],
    ["images/msm/msm-step3-movement-illustration.webp", "Movement動作指導のイメージ"]
  ];

  assert.equal((method.match(/class="knee-msm-step__image"/g) || []).length, 3);
  for (const [src, alt] of expectedImages) {
    assert.match(method, new RegExp(`<img[^>]+src="${escapeRegExp(src)}"[^>]+alt="${escapeRegExp(alt)}"[^>]+class="knee-msm-step__image"`));
  }
  assert.doesNotMatch(method, /Mobilityアプローチの施術イメージ<\/span>/);
  assert.match(method, /<div class="knee-msm-steps-container">\s*<div class="knee-msm-step-list knee-msm-step-grid"/);
  assert.match(mainCss, /\.knee-msm-steps-container\s*{[\s\S]*max-width:\s*1120px;[\s\S]*margin:\s*34px auto 0;[\s\S]*padding:\s*0 24px;/);
  assert.match(mainCss, /\.knee-msm-step-list\s*{[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(300px,\s*1fr\)\);[\s\S]*gap:\s*24px;[\s\S]*margin-top:\s*0;/);
  assert.match(mainCss, /\.knee-msm-step\s*{[\s\S]*display:\s*flex;[\s\S]*flex-direction:\s*column;[\s\S]*min-width:\s*0;/);
  assert.match(mainCss, /\.knee-msm-step h3\s*{[\s\S]*writing-mode:\s*horizontal-tb;[\s\S]*word-break:\s*normal;[\s\S]*overflow-wrap:\s*break-word;/);
  assert.match(mainCss, /\.knee-msm-step__visual\s*{[\s\S]*height:\s*126px;[\s\S]*border-radius:\s*14px;[\s\S]*margin-top:\s*auto;[\s\S]*background:\s*#fff;/);
  assert.match(mainCss, /\.knee-msm-step__image\s*{[\s\S]*width:\s*100%;[\s\S]*height:\s*100%;[\s\S]*object-fit:\s*contain;/);
  assert.match(mainCss, /@media\s*\(max-width:\s*1023px\)\s*{[\s\S]*\.knee-msm-steps-container\s*{[\s\S]*max-width:\s*680px;[\s\S]*\.knee-msm-step-list\s*{[\s\S]*grid-template-columns:\s*1fr;/);
});

test("LP reason and MSM mock CSS keeps diagrams wide and responsive", () => {
  assert.match(mainCss, /\.knee-msm-reasons__inner\s*{[\s\S]*max-width:\s*960px;[\s\S]*margin:\s*0 auto;/);
  assert.match(mainCss, /\.knee-msm-hero,[\s\S]*\.knee-msm-empathy,[\s\S]*\.knee-msm-intro\s*{[\s\S]*max-width:\s*680px;[\s\S]*margin-left:\s*auto;[\s\S]*margin-right:\s*auto;/);
  assert.doesNotMatch(mainCss, /\.knee-msm-hero__visual/);
  assert.match(mainCss, /\.knee-msm-reason\s*{[\s\S]*display:\s*block;[\s\S]*border-left:\s*6px solid #e96a42;/);
  assert.doesNotMatch(mainCss, /\.knee-msm-reason\s*{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\) 140px;/);
  assert.match(mainCss, /\.knee-msm-reason__diagram\s*{[\s\S]*margin-top:\s*24px;[\s\S]*width:\s*100%;[\s\S]*border-radius:\s*24px;[\s\S]*background:\s*#fffaf3;[\s\S]*overflow:\s*hidden;/);
  assert.match(mainCss, /\.knee-msm-reason__diagram-image\s*{[\s\S]*display:\s*block;[\s\S]*width:\s*100%;[\s\S]*height:\s*auto;[\s\S]*object-fit:\s*contain;/);
  assert.match(mainCss, /\.knee-msm-cycle\s*{[\s\S]*background:\s*#fff3e8;[\s\S]*border:\s*1px solid #e96a42;/);
  assert.match(mainCss, /\.knee-msm-approaches\s*{[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(mainCss, /\.knee-msm-steps__inner\s*{[\s\S]*max-width:\s*680px;[\s\S]*margin:\s*0 auto;/);
  assert.match(mainCss, /\.knee-msm-step__visual\s*{[\s\S]*height:\s*126px;[\s\S]*background:\s*#fff;/);
  assert.doesNotMatch(mainCss, /knee-msm-cta__visual/);
  assert.match(mainCss, /@media\s*\(max-width:\s*640px\)\s*{[\s\S]*\.knee-msm-reason__diagram\s*{[\s\S]*margin-top:\s*20px;[\s\S]*padding:\s*8px;[\s\S]*\.knee-msm-approaches\s*{[\s\S]*grid-template-columns:\s*1fr;/);
});

test("LP MSM CTA uses soft LP colors instead of a dark brown block", () => {
  const method = getTopLevelSectionSlice("features");

  assert.doesNotMatch(method, /CTAビジュアル画像/);
  assert.match(mainCss, /\.knee-msm-cta\s*{[\s\S]*background:\s*linear-gradient\(135deg,\s*#fffaf4 0%,\s*#fff3e8 55%,\s*#eef7ef 100%\);[\s\S]*color:\s*#30261f;[\s\S]*border:\s*1px solid #ead7c3;/);
  assert.match(mainCss, /\.knee-msm-cta__label\s*{[\s\S]*color:\s*#e96a42;/);
  assert.match(mainCss, /\.knee-msm-cta h3\s*{[\s\S]*color:\s*#3b2518;/);
  assert.match(mainCss, /\.knee-msm-cta p:not\(\.knee-msm-cta__label\)\s*{[\s\S]*color:\s*#54483e;/);
  assert.match(mainCss, /\.knee-msm-cta__button\s*{[\s\S]*background:\s*#e96a42;[\s\S]*color:\s*#fff;/);
  assert.doesNotMatch(mainCss, /\.knee-msm-cta\s*{[\s\S]*background:\s*#3b2518;/);
});

test("LP uses large readable Gothic headings for older visitors", () => {
  assert.match(html, /family=BIZ\+UDPGothic:wght@400;700&display=swap/);
  assert.doesNotMatch(html, /Noto\+Serif\+JP/);
  assert.match(mainCss, /--font-readable:\s*"BIZ UDPGothic", "Yu Gothic", "Hiragino Kaku Gothic ProN", sans-serif;/);
  assert.match(mainCss, /body\s*{[^}]*font-family:\s*var\(--font-readable\);/);
  assert.doesNotMatch(mainCss, /Noto Serif JP|Yu Mincho|Hiragino Mincho ProN/);
  assert.match(mainCss, /\.section-title\s*{[\s\S]*font-size:\s*2rem;[\s\S]*font-family:\s*var\(--font-heading\);/);
  assert.match(mainCss, /@media\s*\(min-width:\s*768px\)\s*{\s*\.section-title\s*{\s*font-size:\s*3rem;/);
  assert.match(mainCss, /\.knee-msm-hero__title\s*{[\s\S]*font-size:\s*2\.35rem;/);
  assert.match(mainCss, /\.knee-msm-reason h3\s*{[\s\S]*font-family:\s*var\(--font-heading\);[\s\S]*font-size:\s*1\.5rem;/);
  assert.match(mainCss, /\.knee-msm-step h3\s*{[\s\S]*font-family:\s*var\(--font-heading\);[\s\S]*font-size:\s*1\.5rem;/);
  assert.match(mainCss, /\.flow-slider__title\s*{[\s\S]*font-size:\s*2\.15rem;/);
  assert.match(mainCss, /\.flow-slide__title\s*{[\s\S]*font-size:\s*2rem;/);
  assert.match(mainCss, /@media\s*\(max-width:\s*640px\)\s*{[\s\S]*\.flow-slider__title\s*{[\s\S]*font-size:\s*1\.75rem;[\s\S]*\.flow-slide__title\s*{[\s\S]*font-size:\s*1\.55rem;/);
});

test("LP replaces the treatment flow with an accessible 6-step photo slider after the MSM method", () => {
  const flow = getTopLevelSectionSlice("flow");
  const steps = [
    [
      "問診票記入",
      "いつから痛いのか、どんな動きでつらいのか、病院で言われたことなどを問診票にご記入いただきます。",
      "image/flow-medical-interview-form-768.webp",
      "初回時に問診票を記入する様子"
    ],
    [
      "カウンセリング",
      "問診票をもとに、歩き始め、階段、立ち上がり、買い物など、日常のどの場面で膝が不安なのかを伺います。",
      "image/consultation-scene-768.webp",
      "足腰の状態を丁寧に確認するカウンセリングの様子"
    ],
    [
      "身体の状態チェック",
      "膝だけでなく、股関節・足首・姿勢・歩き方も確認し、どこに負担が集まりやすいかを見ていきます。",
      "image/flow-movement-assessment-768.webp",
      "股関節や膝の動きを確認している様子"
    ],
    [
      "状態説明、施術方針の説明",
      "なぜ痛みが出やすいのか、これから何を目指すのかを、専門用語を使いすぎず分かりやすくお伝えします。",
      "image/consultation-scene-768.webp",
      "施術方針をわかりやすく説明している様子"
    ],
    [
      "施術開始",
      "やさしく身体を整えながら、立つ・歩く・階段などの動きにつながるように運動療法も行います。",
      "image/flow-treatment-session-768.webp",
      "膝や股関節まわりへの施術の様子"
    ],
    [
      "セルフケアと施術後の説明",
      "ご自宅で気をつけることや簡単なセルフケア、施術後の状態と今後の目安をご案内します。",
      "image/treatment-stretch-768.webp",
      "自宅でできるセルフケアを説明する様子"
    ]
  ];

  assert.match(flow, /<section id="flow" class="flow-slider" aria-labelledby="flow-title" data-flow-slider>/);
  assert.match(flow, /<h2 id="flow-title"[^>]*>当院での施術の流れ<\/h2>/);
  assert.match(flow, /写真は左右にスライドできます/);
  assert.match(flow, /<p class="flow-swipe-hint">写真は左右にスライドできます<span class="flow-swipe-arrow" aria-hidden="true">&gt;<\/span><\/p>/);
  assert.doesNotMatch(flow, /flow-section-wrap|flow-list|flow-item__/);
  assert.doesNotMatch(flow, /院内・受付写真|受付・ご来院/);
  assert.doesNotMatch(flow, /実装時は実際の写真に差し替え/);

  assert.equal([...flow.matchAll(/\bdata-flow-slide\b/g)].length, 6);
  assert.equal([...flow.matchAll(/\bdata-flow-dot\b/g)].length, 6);
  assert.equal((flow.match(/class="flow-slider__image"/g) || []).length, 6);
  assert.match(flow, /data-flow-prev[^>]*aria-label="前のステップを見る"/);
  assert.match(flow, /data-flow-next[^>]*aria-label="次のステップを見る"/);
  assert.match(flow, /data-flow-current[^>]*>01<\/span>\s*\/\s*<span[^>]*data-flow-total[^>]*>06<\/span>/);
  assert.match(flow, /role="tablist"[^>]*aria-label="施術の流れのステップ"/);

  steps.forEach(([title, body, src, alt], index) => {
    assert.match(flow, new RegExp(`data-flow-index="${index}"`), `${title} should have a slide index`);
    assert.match(flow, new RegExp(escapeRegExp(title)), `${title} should be visible`);
    assert.match(flow, new RegExp(escapeRegExp(body)), `${title} should include its body copy`);
    assert.match(flow, new RegExp(`<img[^>]+src="${escapeRegExp(src)}"[^>]+alt="${escapeRegExp(alt)}"[^>]+class="flow-slider__image"`), `${title} should include its photo`);
    assert.match(flow, new RegExp(`aria-label="${index + 1}番目のステップを表示"`), `${title} should have a dot label`);
  });
});

test("LP flow slider CSS keeps the mock layout responsive without hiding no-js content", () => {
  assert.match(mainCss, /\.flow-slider\s*{[\s\S]*background:\s*#fff;[\s\S]*overflow:\s*hidden;/);
  assert.match(mainCss, /\.flow-slider\s*{[\s\S]*overflow-anchor:\s*none;/);
  assert.match(mainCss, /\.flow-slider__inner\s*{[\s\S]*max-width:\s*760px;[\s\S]*margin:\s*0 auto;/);
  assert.match(mainCss, /\.flow-slider__heading-band\s*{[\s\S]*border-left:\s*7px solid #e96a42;[\s\S]*background:\s*#fdebdc;/);
  assert.match(mainCss, /\.flow-slider__media\s*{[\s\S]*aspect-ratio:\s*4\s*\/\s*3;[\s\S]*overflow:\s*hidden;/);
  assert.match(mainCss, /\.flow-slider__image\s*{[\s\S]*width:\s*100%;[\s\S]*height:\s*100%;[\s\S]*object-fit:\s*cover;[\s\S]*object-position:\s*center;/);
  assert.match(mainCss, /\.flow-slider__arrow\s*{[\s\S]*width:\s*56px;[\s\S]*height:\s*56px;[\s\S]*background:\s*#f2653f;/);
  assert.match(mainCss, /\.flow-swipe-hint\s*\{[\s\S]*text-align:\s*center;[\s\S]*font-size:\s*0\.9rem;[\s\S]*margin-top:\s*12px;[\s\S]*color:\s*#1f5f4a;/);
  assert.match(mainCss, /\.flow-swipe-arrow\s*\{[\s\S]*display:\s*inline-block;[\s\S]*margin-left:\s*8px;[\s\S]*animation:\s*swipeArrow 1\.2s ease-in-out infinite;/);
  assert.match(mainCss, /@keyframes swipeArrow\s*\{[\s\S]*0%\s*\{\s*transform:\s*translateX\(0\);\s*opacity:\s*0\.5;\s*\}[\s\S]*50%\s*\{\s*transform:\s*translateX\(8px\);\s*opacity:\s*1;\s*\}[\s\S]*100%\s*\{\s*transform:\s*translateX\(0\);\s*opacity:\s*0\.5;\s*\}/);
  assert.doesNotMatch(mainCss, /flow-slider__hint/);
  assert.match(mainCss, /\.flow-slider\.is-enhanced\s+\.flow-slide:not\(\.is-active\)\s*{[\s\S]*display:\s*none;/);
  assert.match(mainCss, /\.flow-slider__dot\.is-active\s*{[\s\S]*background:\s*#f2653f;/);
  assert.match(mainCss, /@media\s*\(max-width:\s*640px\)\s*{[\s\S]*\.flow-slider__arrow\s*{[\s\S]*width:\s*44px;[\s\S]*height:\s*44px;/);
});

test("LP flow slider JavaScript uses scoped controls, dots, and counters without autoplay", () => {
  assert.match(mainJs, /function setupFlowSlider\(\)/);
  assert.match(mainJs, /document\.querySelectorAll\('\[data-flow-slider\]'\)/);
  assert.match(mainJs, /slider\.classList\.add\('is-enhanced'\)/);
  assert.match(mainJs, /querySelectorAll\('\[data-flow-slide\]'\)/);
  assert.match(mainJs, /querySelector\('\[data-flow-current\]'\)/);
  assert.match(mainJs, /querySelectorAll\('\[data-flow-dot\]'\)/);
  assert.match(mainJs, /aria-hidden/);
  assert.match(mainJs, /aria-selected/);
  assert.match(mainJs, /\.hidden\s*=/);
  assert.match(mainJs, /setupFlowSlider\(\);/);
  assert.doesNotMatch(mainJs, /setInterval|setTimeout\([^)]*setupFlowSlider/);
});

test("LP canonicalizes direct index.html visits to the root URL", () => {
  assert.match(html, new RegExp(`<title>${escapeRegExp(siteTitle)}<\\/title>`));
  assert.match(html, new RegExp(`<meta property="og:title" content="${escapeRegExp(siteTitle)}">`));
  assert.match(html, new RegExp(`<meta name="twitter:title" content="${escapeRegExp(siteTitle)}">`));
  assert.match(html, /<meta property="og:image:alt" content="整体院ひざこぞう｜柏市で足腰の痛みやシビレの相談ができる整体院LP">/);
  assert.doesNotMatch(html, /【柏市の膝痛整体】/);
  assert.doesNotMatch(html, /整体院ひざこぞう｜柏市で膝痛を中心に慢性痛の相談ができる整体院LP/);
  assert.match(html, /<link rel="canonical" href="https:\/\/hizakozou\.jp\/">/);
  assert.match(html, /\^https\?:\$.*window\.location\.protocol/);
  assert.match(html, /window\.location\.pathname\.endsWith\("\/index\.html"\)/);
  assert.match(html, /window\.location\.replace\(canonicalPath \+ window\.location\.search \+ window\.location\.hash\)/);
});

test("shared brand labels no longer present the site as knee-pain-only", () => {
  const symptomPages = walkFiles(
    path.join(repoRoot, "symptoms"),
    (filePath) => filePath.endsWith(".html")
  );
  const pages = [
    path.join(repoRoot, "index.html"),
    path.join(repoRoot, "staff.html"),
    ...symptomPages
  ];

    for (const pagePath of pages) {
      const pageHtml = readFileSync(pagePath, "utf8");
      const repoPath = toRepoPath(pagePath);

      assert.doesNotMatch(pageHtml, /膝痛専門整体院 ひざこぞう/, `${repoPath} should not use the old footer specialty`);
      assert.doesNotMatch(pageHtml, /千葉県柏市｜膝痛・慢性痛専門/, `${repoPath} should not use the old footer subtitle`);
      assert.match(pageHtml, /柏市の足腰専門整体院 整体院ひざこぞう/, `${repoPath} should use the broadened footer specialty`);
      assert.match(pageHtml, /千葉県柏市｜腰痛・坐骨神経痛・股関節痛・膝痛など足腰の慢性痛相談/, `${repoPath} should use the broadened footer subtitle`);
    }
  });

test("site footers use the foot-waist symptom list consistently", () => {
  const requiredFooterPages = [
    "index.html",
    "faq.html",
    "voices.html",
    "access.html",
    "staff.html",
    ...readdirSync(path.join(repoRoot, "symptoms"))
      .filter((name) => name.endsWith(".html"))
      .map((name) => `symptoms/${name}`)
  ];
    const oldFooterTerms = /O脚|膝の水|半月板の不安|膝の引っかかり|肩こり|首の痛み|五十肩|顎関節症|足のシビレ|足腰のしびれ|歩き始めの痛み|階段の痛み/;

  for (const repoPath of requiredFooterPages) {
    const pageHtml = readFileSync(path.join(repoRoot, repoPath), "utf8");
    const footerBlocks = getFooterBlocks(pageHtml);

    assert.ok(footerBlocks.length > 0, `${repoPath} should include the shared footer`);
    for (const footerBlock of footerBlocks) {
      assert.match(footerBlock, new RegExp(escapeRegExp(footerSymptomsText)), `${repoPath} should use the new footer symptom list`);
      assert.doesNotMatch(footerBlock, oldFooterTerms, `${repoPath} should not keep old footer symptom wording`);
    }
  }

  const htmlFiles = walkFiles(repoRoot, (filePath) => filePath.endsWith(".html"));
  for (const pagePath of htmlFiles) {
    const pageHtml = readFileSync(pagePath, "utf8");
    const repoPath = toRepoPath(pagePath);
    for (const footerBlock of getFooterBlocks(pageHtml)) {
      assert.match(footerBlock, new RegExp(escapeRegExp(footerSymptomsText)), `${repoPath} should use the unified footer symptom list`);
      assert.doesNotMatch(footerBlock, oldFooterTerms, `${repoPath} should not keep old footer symptom wording`);
    }
  }

  assert.match(buildBlogScript, new RegExp(escapeRegExp(footerSymptomsText)), "blog/symptom generation should keep the footer symptom list in sync");
  assert.doesNotMatch(buildBlogScript, /膝の痛み／変形性膝関節症／O脚／膝の水／半月板の不安／膝の引っかかり／腰痛／股関節痛／坐骨神経痛／足のシビレ/);
});

test("desktop header groups access/contact and exposes keyboard-friendly real dropdowns", () => {
  const desktopNav = getSectionSlice('<nav class="site-nav"', '<nav class="site-mobile-nav hidden"');
  const mobileNav = getElementSlice('<nav class="site-mobile-nav hidden"');
  const aboutLinks = [
    ["staff.html", "代表紹介"],
    ["#knee-msm-reasons", "当院の特徴"],
    ["#msm-method", "MSMメソッドとは？"]
  ];
  const symptomLinks = [
    ["symptoms/lower-back-pain.html", "腰痛"],
    ["symptoms/sciatica.html", "坐骨神経痛"],
    ["symptoms/spinal-stenosis.html", "脊柱管狭窄症"],
    ["symptoms/lumbar-disc-herniation.html", "椎間板ヘルニア"],
    ["symptoms/hip-osteoarthritis.html", "股関節痛"],
    ["symptoms/knee-osteoarthritis.html", "膝痛"],
    ["symptoms/index.html", "その他の慢性症状"]
  ];
  const removedKneeHeaderLinks = [
    "symptoms/pes-anserine-bursitis.html",
    "symptoms/knee-effusion.html",
    "symptoms/meniscus-knee-pain.html",
    "symptoms/knee-front-pain.html",
    "symptoms/knee-posterior-pain.html",
    "symptoms/knee-lateral-pain.html"
  ];

  assert.match(html, /<span class="site-brand__eyebrow">柏市の足腰専門整体院<\/span>/);
  assert.doesNotMatch(html, /<span class="site-brand__eyebrow">柏市の膝痛専門整体院<\/span>/);
  assert.match(desktopNav, /当院について/);
  assert.match(desktopNav, /ABOUT/);
  assert.match(desktopNav, /aria-controls="site-about-menu"/);
  assert.match(desktopNav, /aria-label="当院について"/);
  assert.doesNotMatch(desktopNav, /<a href="#features" class="site-nav__item">/);
  assert.match(desktopNav, /症状別/);
  assert.match(desktopNav, /SYMPTOMS/);
  assert.match(desktopNav, /aria-haspopup="true"/);
  assert.match(desktopNav, /aria-controls="site-symptoms-menu"/);
  assert.match(desktopNav, /aria-expanded="false"/);
  assert.match(desktopNav, /aria-label="症状別ページ"/);
  assert.match(desktopNav, /アクセス・予約/);
  assert.match(desktopNav, /ACCESS \/ CONTACT/);
  assert.match(desktopNav, /href="#access"/);
  assert.match(desktopNav, /href="blog\/"/);
  assert.match(desktopNav, /コラム/);
  assert.match(desktopNav, /COLUMN/);

  assert.doesNotMatch(desktopNav, /院情報・アクセス/);
  assert.doesNotMatch(desktopNav, /INFO \/ ACCESS/);
  assert.doesNotMatch(desktopNav, /ご予約・お問合せ/);

  for (const [href, label] of aboutLinks) {
    assert.match(desktopNav, new RegExp(`href="${escapeRegExp(href)}"`), `${label} should be linked in the about dropdown`);
    assert.match(desktopNav, new RegExp(escapeRegExp(label)), `${label} should be visible in the about dropdown`);
    assert.match(mobileNav, new RegExp(`href="${escapeRegExp(href)}"`), `${label} should be linked in mobile about nav`);
    assert.match(mobileNav, new RegExp(escapeRegExp(label)), `${label} should be visible in mobile about nav`);
  }
  assert.match(mobileNav, /site-mobile-nav__heading">当院について/);
  assert.doesNotMatch(mobileNav, /href="#features" class="site-mobile-nav__item">特徴/);

  for (const [href, label] of symptomLinks) {
    assert.match(desktopNav, new RegExp(`href="${escapeRegExp(href)}"`), `${label} should be linked`);
    assert.match(desktopNav, new RegExp(escapeRegExp(label)), `${label} should be visible`);
    assert.match(mobileNav, new RegExp(`href="${escapeRegExp(href)}"`), `${label} should be linked in mobile nav`);
    assert.match(mobileNav, new RegExp(escapeRegExp(label)), `${label} should be visible in mobile nav`);
    assert.equal(existsSync(path.join(repoRoot, href)), true, `${href} should exist`);
  }

  assert.ok(
    symptomLinks.every(([href], index) => {
      const next = symptomLinks[index + 1]?.[0];
      return !next || desktopNav.indexOf(href) < desktopNav.indexOf(next);
    }),
    "desktop symptom dropdown should follow the requested order"
  );
  assert.ok(
    symptomLinks.every(([href], index) => {
      const next = symptomLinks[index + 1]?.[0];
      return !next || mobileNav.indexOf(href) < mobileNav.indexOf(next);
    }),
    "mobile symptom links should follow the requested order"
  );
  for (const href of removedKneeHeaderLinks) {
    assert.doesNotMatch(desktopNav, new RegExp(`href="${escapeRegExp(href)}"`), `${href} should be removed from desktop header`);
    assert.doesNotMatch(mobileNav, new RegExp(`href="${escapeRegExp(href)}"`), `${href} should be removed from mobile header`);
  }
  assert.doesNotMatch(desktopNav, /脊柱菅/);
  assert.doesNotMatch(mobileNav, /脊柱菅/);
  assert.doesNotMatch(desktopNav, /変形性膝関節症|膝の内側の痛み|膝に水がたまる|半月板の違和感|膝の前側の痛み|膝の裏側の痛み|膝の外側の痛み/);
  assert.doesNotMatch(mobileNav, /変形性膝関節症|膝の内側の痛み|膝に水がたまる|半月板の違和感|膝の前側の痛み|膝の裏側の痛み|膝の外側の痛み/);

  assert.doesNotMatch(mobileNav, /site-nav__dropdown/);
  assert.match(mobileNav, /site-mobile-nav__group/);
  assert.match(mobileNav, /site-mobile-nav__heading">症状別/);
  assert.match(mobileNav, /site-mobile-nav__subitem/);
  assert.match(mobileNav, /href="access\.html" class="site-mobile-nav__item">アクセス/);
  assert.doesNotMatch(mobileNav, /アクセス詳細/);
  assert.match(mobileNav, /href="#contact"/);
  assert.match(mobileNav, /href="blog\/"/);
  assert.match(mobileNav, /コラム/);
  assert.match(html, /id="menuBtn"/);
  assert.match(html, /aria-controls="mobileNav"/);
  assert.match(html, /<nav class="site-mobile-nav hidden" id="mobileNav"/);
  assert.doesNotMatch(html, /class="site-mobile-call"/);
  assert.doesNotMatch(html, /site-mobile-call__number/);

  assert.match(mainCss, /\.site-nav__item--has-dropdown:hover\s+\.site-nav__dropdown/);
  assert.match(mainCss, /\.site-nav__item--has-dropdown:focus-within\s+\.site-nav__dropdown/);
  assert.match(mainCss, /\.site-nav__item--has-dropdown\.is-open\s+\.site-nav__dropdown/);
  assert.match(mainCss, /\.site-nav__dropdown-link:focus-visible/);
  assert.match(mainCss, /\.site-menu-toggle/);
  assert.match(mainCss, /\.site-mobile-nav\.hidden\s*\{[\s\S]*display:\s*none/);
  assert.match(mainCss, /\.site-mobile-nav\s*\{[\s\S]*position:\s*fixed/);
  assert.match(mainCss, /\.site-mobile-nav__group\s*\{/);
  assert.match(mainCss, /\.site-mobile-nav__subitem\s*\{/);

  assert.match(mainJs, /setupHeaderSymptomDropdown/);
  assert.match(mainJs, /aria-expanded/);
  assert.match(mainJs, /is-open/);
});

test("LP keeps only the navigation bar sticky and leaves the header information static", () => {
  const siteHeaderRule = getCssRule(".site-header");
  const headerUpperRule = getCssRule(".site-header__upper");
  const headerLowerRule = getCssRule(".site-header__lower");
  const dropdownRule = getCssRule(".site-nav__dropdown");

  assert.match(siteHeaderRule, /position:\s*static;/);
  assert.doesNotMatch(siteHeaderRule, /position:\s*fixed;/);
  assert.match(headerUpperRule, /position:\s*static;/);
  assert.match(headerLowerRule, /position:\s*sticky;/);
  assert.match(headerLowerRule, /top:\s*0;/);
  assert.match(headerLowerRule, /z-index:\s*1000;/);
  assert.match(dropdownRule, /z-index:\s*1010;/);
  assert.match(mainCss, /section\[id\],[\s\S]*main \[id\]\s*{[\s\S]*scroll-margin-top:\s*calc\(var\(--header-h\) \+ 16px\);/);
  assert.match(mainJs, /const stickyHeader = document\.querySelector\('\.site-header__lower'\);/);
  assert.match(mainJs, /stickyHeader\?\.offsetHeight \|\| 58/);
  assert.doesNotMatch(mainCss, /\.hz-hero\s*{[\s\S]*padding-top:\s*calc\(var\(--header-h\)/);
});

test("LP places the sticky navigation outside the static header container", () => {
  const headerOpen = html.indexOf('<header id="header" class="site-header">');
  const headerClose = html.indexOf("</header>", headerOpen);
  const stickyNav = html.indexOf('<div class="site-header__lower">');

  assert.ok(headerOpen > -1, "header should exist");
  assert.ok(headerClose > headerOpen, "header should close before the sticky nav");
  assert.ok(stickyNav > headerClose, "sticky nav should be outside the static header container");
});

test("LP exposes an accessible scroll-to-top button without conflicting with fixed CTAs", () => {
  assert.match(html, /<button type="button" class="page-top-button" aria-label="ページ上部へ戻る"/);
  assert.match(html, /<span aria-hidden="true">↑<\/span>/);
  assert.match(html, /TOP/);
  assert.match(mainCss, /\.page-top-button\s*{[\s\S]*position:\s*fixed;[\s\S]*right:\s*24px;[\s\S]*bottom:\s*24px;[\s\S]*z-index:\s*60;/);
  assert.match(mainCss, /\.page-top-button\.is-visible\s*{[\s\S]*opacity:\s*1;[\s\S]*pointer-events:\s*auto;/);
  assert.match(mainCss, /\.page-top-button:hover,[\s\S]*\.page-top-button:focus-visible\s*{/);
  assert.match(mainCss, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.page-top-button\s*{[\s\S]*bottom:\s*94px;[\s\S]*right:\s*16px;/);
  assert.match(mainJs, /setupPageTopButton/);
  assert.match(mainJs, /window\.scrollY > 300/);
  assert.match(mainJs, /window\.scrollTo\(\{\s*top:\s*0,\s*behavior:\s*'smooth'\s*\}\)/);
});

test("LP mobile pricing layout prevents the first-visit label from overlapping the price", () => {
  assert.match(mainCss, /@media\s*\(max-width:\s*480px\)\s*{[\s\S]*\.hk-pricing-offer\s*{[\s\S]*grid-template-columns:\s*1fr;[\s\S]*gap:\s*10px;/);
  assert.match(mainCss, /@media\s*\(max-width:\s*480px\)\s*{[\s\S]*\.hk-pricing-labels\s*{[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(mainCss, /@media\s*\(max-width:\s*480px\)\s*{[\s\S]*\.hk-pricing-price__num\s*{[\s\S]*font-size:\s*clamp\(3\.6rem,\s*19vw,\s*4\.8rem\);/);
});

test("sitewide Google tracking scripts load from the head on every HTML page", () => {
  const htmlFiles = walkFiles(repoRoot, (filePath) => filePath.endsWith(".html"));
  const missing = [];
  const headPattern = /<head>[\s\S]*<script src="\/scripts\/tracking-config\.js"(?: defer)?><\/script>\s*<script src="\/scripts\/tracking\.js"(?: defer)?><\/script>[\s\S]*<\/head>/;

  for (const filePath of htmlFiles) {
    const pageHtml = readFileSync(filePath, "utf8");
    if (!headPattern.test(pageHtml)) {
      missing.push(toRepoPath(filePath));
    }
  }

  assert.deepEqual(missing, [], "every HTML page should load the shared tracking scripts from head");
});

test("tracking config is ready for GA4 and the live Google Ads ID", () => {
  assert.equal(existsSync(trackingConfigPath), true, "tracking-config.js should exist");
  assert.match(trackingConfig, /window\.HK_TRACKING_CONFIG/);
  assert.match(trackingConfig, /ga4MeasurementId:\s*""/);
  assert.match(trackingConfig, /googleAdsConversionId:\s*"AW-18109043080"/);
  assert.match(trackingConfig, /line:\s*""/);
  assert.match(trackingConfig, /phone:\s*""/);
  assert.match(trackingConfig, /form:\s*""/);
  assert.match(trackingConfig, /reservation:\s*""/);
  assert.match(trackingConfig, /thanks:\s*""/);
  assert.doesNotMatch(trackingConfig, /G-[A-Z0-9]{5,}/);
});

test("tracking runtime wires GA4 page views and Google Ads conversion events", () => {
  assert.equal(existsSync(trackingJsPath), true, "tracking.js should exist");
  assert.match(trackingJs, /googletagmanager\.com\/gtag\/js/);
  assert.match(trackingJs, /gtag\("config", ga4MeasurementId/);
  assert.match(trackingJs, /gtag\("config", googleAdsConversionId/);
  assert.match(trackingJs, /line_consult_click/);
  assert.match(trackingJs, /phone_click/);
  assert.match(trackingJs, /form_submit/);
  assert.match(trackingJs, /generate_lead/);
  assert.match(trackingJs, /conversionLabels\.reservation/);
  assert.match(trackingJs, /send_to/);
  assert.match(trackingJs, /window\.hkTrackConversion/);
});

test("thanks page exists as a noindex conversion completion page", () => {
  const thanksPath = path.join(repoRoot, "thanks.html");
  const thanksHtml = existsSync(thanksPath) ? readFileSync(thanksPath, "utf8") : "";

  assert.equal(existsSync(thanksPath), true, "thanks.html should exist");
  assert.match(thanksHtml, /<meta name="robots" content="noindex,follow">/);
  assert.match(thanksHtml, /<script src="\/scripts\/tracking-config\.js"><\/script>/);
  assert.match(thanksHtml, /<script src="\/scripts\/tracking\.js"><\/script>/);
  assert.match(thanksHtml, /Event snippet for 予約 conversion page/);
  assert.match(thanksHtml, /function gtag_report_conversion\(url\)/);
  assert.match(thanksHtml, /gtag\('event', 'conversion', \{/);
  assert.match(thanksHtml, /'send_to': 'AW-18109043080\/zShOCLee9LIcEIijiLtD'/);
  assert.match(thanksHtml, /'event_callback': callback/);
  assert.match(thanksHtml, /お問い合わせありがとうございました/);
  assert.match(thanksHtml, /24時間以内にご返信します/);
});

test("reservation conversion event snippet is only on the thanks page", () => {
  const htmlFiles = walkFiles(repoRoot, (filePath) => filePath.endsWith(".html"));
  const pagesWithReservationSnippet = htmlFiles
    .filter((filePath) => readFileSync(filePath, "utf8").includes("AW-18109043080/zShOCLee9LIcEIijiLtD"))
    .map(toRepoPath);

  assert.deepEqual(pagesWithReservationSnippet, ["thanks.html"]);
});

test("contact form tracks successful submissions before redirecting to thanks", () => {
  assert.match(mainJs, /hkTrackConversion\("form_submit"/);
  assert.match(mainJs, /window\.location\.assign\("\/thanks\.html"\)/);
});

test("LP local image assets resolve to existing files", () => {
  const localRefs = getLocalImageReferences();

  assert.ok(localRefs.length > 0, "should find local image references in the LP");

  for (const ref of localRefs) {
    const absolutePath = path.join(repoRoot, ref.replace(/\//g, path.sep));

    assert.equal(existsSync(absolutePath), true, `missing local image asset: ${ref}`);
  }
});

test("LP image infrastructure uses unified WebP paths", () => {
  const localRefs = getLocalImageReferences();
  const legacyImagesRefs = localRefs.filter((ref) => ref.startsWith("images/") && !ref.startsWith("images/msm/"));

  assert.deepEqual(legacyImagesRefs, [], "LP should not reference the legacy images directory outside the MSM asset set");

  for (const ref of localRefs) {
    if (ref.endsWith(".svg")) continue;
    assert.match(ref, /^(?:image\/.+|images\/msm\/.+)\.webp$/i, `local raster images should be WebP under image/ or the approved MSM asset directory: ${ref}`);
  }
});

test("LP exposes LocalBusiness, MedicalClinic, and FAQPage structured data", () => {
  const localBusinessBlocks = getJsonLdBlocks("LocalBusiness");
  const medicalClinicBlocks = getJsonLdBlocks("MedicalClinic");
  const faqBlocks = getJsonLdBlocks("FAQPage");

  assert.equal(localBusinessBlocks.length, 1, "LP should include one LocalBusiness schema block");
  assert.equal(medicalClinicBlocks.length, 1, "LP should include one MedicalClinic schema block");
  assert.equal(faqBlocks.length, 1, "LP should include one FAQPage schema block");
  assert.equal(localBusinessBlocks[0].hasMap.includes("output=embed"), true, "map URL should be embeddable");
});

test("LP metadata broadens SEO target from female knee pain to chronic pain", () => {
  const hero = getSectionSlice(
    '<section class="pt-28 pb-16 md:pt-40 md:pb-24 bg-white overflow-hidden relative hero-fixed hz-hero">',
    'id="troubles"'
  );
  const localBusinessBlocks = getJsonLdBlocks("LocalBusiness");

  assert.match(html, new RegExp(`<meta name="description" content="${escapeRegExp(broadenedMetaDescription)}">`));
  assert.match(html, new RegExp(`<meta property="og:description" content="${escapeRegExp(broadenedMetaDescription)}">`));
  assert.match(html, new RegExp(`<meta name="twitter:description" content="${escapeRegExp(broadenedMetaDescription)}">`));
  assert.equal(localBusinessBlocks[0].description, localBusinessDescription);
  assert.doesNotMatch(getSectionSlice("<head>", "</head>"), /お悩みの女性へ/);
  assert.match(hero, /それは慣れたのではなく、諦めているだけかもしれない。/);
  assert.match(hero, /もう一度、自分の体と向き合う時間をつくりませんか。/);
});

test("LP and symptom patient voices include approved assets and symptom-only additions", () => {
  const pages = [
    ["index.html", html],
    ["symptoms/knee-osteoarthritis.html", readFileSync(new URL("../symptoms/knee-osteoarthritis.html", import.meta.url), "utf8")],
    ["symptoms/lower-back-pain.html", readFileSync(new URL("../symptoms/lower-back-pain.html", import.meta.url), "utf8")],
    ["symptoms/hip-osteoarthritis.html", readFileSync(new URL("../symptoms/hip-osteoarthritis.html", import.meta.url), "utf8")],
    ["symptoms/shoulder-stiffness.html", readFileSync(new URL("../symptoms/shoulder-stiffness.html", import.meta.url), "utf8")],
    ["symptoms/sciatica.html", readFileSync(new URL("../symptoms/sciatica.html", import.meta.url), "utf8")]
  ];

  assert.equal(existsSync(path.join(repoRoot, "image", "patient-voice-kt.webp")), true);
  assert.equal(existsSync(path.join(repoRoot, "image", "patient-voice-yn.webp")), true);
  assert.equal(existsSync(path.join(repoRoot, "image", "patient-voice-kk-anonymized.webp")), true);
  assert.equal(existsSync(path.join(repoRoot, "image", "patient-voice-numajiri.webp")), true);
  assert.equal(existsSync(path.join(repoRoot, "image", "patient-voice-yo-knee.png")), true);
  assert.equal(existsSync(path.join(repoRoot, "image", "patient-voice-ym-hip.png")), true);
  assert.equal(existsSync(path.join(repoRoot, "image", "voice-kajitani.webp")), true);
  assert.equal(existsSync(path.join(repoRoot, "image", "voice-kk.webp")), true);
  assert.equal(existsSync(path.join(repoRoot, "image", "voice-numajiri.webp")), true);
  assert.equal(existsSync(path.join(repoRoot, "image", "voice-yo.webp")), true);
  assert.equal(existsSync(path.join(repoRoot, "image", "voice-result-banner.webp")), true);
  assert.match(html, /image\/patient-voice-kt\.webp/);
  assert.match(html, /image\/patient-voice-yn\.webp/);
  assert.match(html, /image\/patient-voice-kk-anonymized\.webp/);
  assert.match(html, /image\/patient-voice-numajiri\.webp/);
  assert.match(html, /<p class="voice-trust__label">VOICE<\/p>/);
  assert.match(html, /患者様の声/);
  assert.match(html, /image\/voice-kajitani\.webp/);
  assert.match(html, /image\/voice-kk\.webp/);
  assert.match(html, /image\/voice-numajiri\.webp/);
  assert.match(html, /image\/voice-yo\.webp/);
  assert.match(html, /image\/voice-result-banner\.webp/);
  assert.match(html, /voices\.html#voice-4/);
  assert.doesNotMatch(html, /patient-voice-yo-knee\.png/);
  assert.doesNotMatch(html, /patient-voice-ym-hip\.png/);
  assert.match(html, /K\.T/);
  assert.match(html, /Y\.N/);
  assert.match(html, /K\.K/);
  assert.match(html, /N\.H/);
  assert.match(html, /Y\.O様/);
  assert.doesNotMatch(html, /Y\.M様/);
  assert.ok(html.indexOf("K.K様") < html.indexOf("K.T様"), "LP should list K.K before K.T");
  assert.ok(html.indexOf("K.T様") < html.indexOf("Y.N様"), "LP should list K.T before Y.N");
  assert.ok(html.indexOf("Y.N様") < html.indexOf("N.H様"), "LP should list Y.N before N.H");

  const lowerBackHtml = pages.find(([pageName]) => pageName === "symptoms/lower-back-pain.html")[1];
  assert.match(lowerBackHtml, /patient-voice-kt\.webp/);
  assert.match(lowerBackHtml, /patient-voice-yn\.webp/);
  assert.match(lowerBackHtml, /patient-voice-kk-anonymized\.webp/);
  assert.match(lowerBackHtml, /patient-voice-numajiri\.webp/);

  const kneeHtml = pages.find(([pageName]) => pageName === "symptoms/knee-osteoarthritis.html")[1];
  assert.match(kneeHtml, /patient-voice-kt\.webp/);
  assert.match(kneeHtml, /patient-voice-kk-anonymized\.webp/);
  assert.match(kneeHtml, /patient-voice-yo-knee\.png/);
  assert.match(kneeHtml, /Y\.Oさん 膝痛・膝関節痛で来院された患者様の声/);
  assert.doesNotMatch(kneeHtml, /patient-voice-ym-hip\.png/);

  const hipHtml = pages.find(([pageName]) => pageName === "symptoms/hip-osteoarthritis.html")[1];
  assert.match(hipHtml, /patient-voice-yn\.webp/);
  assert.match(hipHtml, /patient-voice-ym-hip\.png/);
  assert.match(hipHtml, /Y\.Mさん そけい部・前大腿部付近の痛みで来院された患者様の声/);
  assert.doesNotMatch(hipHtml, /patient-voice-yo-knee\.png/);

  const shoulderHtml = pages.find(([pageName]) => pageName === "symptoms/shoulder-stiffness.html")[1];
  assert.match(shoulderHtml, /patient-voice-yn\.webp/);
  assert.match(shoulderHtml, /patient-voice-numajiri\.webp/);

  const sciaticaHtml = pages.find(([pageName]) => pageName === "symptoms/sciatica.html")[1];
  assert.match(sciaticaHtml, /patient-voice-kk-anonymized\.webp/);

  for (const [pageName, pageHtml] of pages) {
    assert.doesNotMatch(pageHtml, /Y\.K/, `${pageName} should not show the wrong initials`);
  }
});

test("LP voice teaser links to a dedicated voices page with anchored cards", () => {
  assert.match(html, /<section class="voice-trust"/);
  assert.match(html, /<p class="voice-trust__label">VOICE<\/p>/);
  assert.match(html, /<h2 id="voice-trust-title" class="voice-trust__title">\s*患者様の声\s*<\/h2>/);
  assert.doesNotMatch(html, /VOICE &amp; RESULT/);
  assert.match(html, /class="voice-trust__assurance"/);
  assert.match(html, /ご相談に来られた方のお声があります/);
  assert.equal((html.match(/class="voice-trust-card"/g) || []).length, 4);
  assert.match(html, /voices\.html#voice-1/);
  assert.match(html, /voices\.html#voice-2/);
  assert.match(html, /voices\.html#voice-3/);
  assert.match(html, /voices\.html#voice-4/);
  assert.match(html, /voices\.html" class="voice-trust__button"/);
  assert.match(mainCss, /@media \(max-width: 640px\)[\s\S]*\.voice-trust\s*\{[\s\S]*padding:\s*44px 14px 50px/);
  assert.match(mainCss, /@media \(max-width: 640px\)[\s\S]*\.voice-trust__assurance\s*\{[\s\S]*display:\s*none/);
  assert.match(mainCss, /@media \(max-width: 640px\)[\s\S]*\.voice-trust__cards\s*\{[\s\S]*gap:\s*28px/);
  assert.match(mainCss, /@media \(max-width: 640px\)[\s\S]*\.voice-trust-card\s*\{[\s\S]*grid-template-columns:\s*clamp\(96px,\s*28vw,\s*116px\)\s+minmax\(0,\s*1fr\)/);
  assert.match(mainCss, /@media \(max-width: 640px\)[\s\S]*\.voice-trust-card\s*\{[\s\S]*padding:\s*16px/);
  assert.match(mainCss, /@media \(max-width: 640px\)[\s\S]*\.voice-trust-card__image\s*\{[\s\S]*height:\s*clamp\(96px,\s*28vw,\s*116px\)/);
  assert.match(mainCss, /@media \(max-width: 640px\)[\s\S]*\.voice-trust-card__body\s*\{[\s\S]*display:\s*contents/);
  assert.match(mainCss, /@media \(max-width: 640px\)[\s\S]*\.voice-trust-card__text\s*\{[\s\S]*grid-column:\s*1\s*\/\s*-1/);
  assert.match(mainCss, /@media \(max-width: 640px\)[\s\S]*\.voice-trust-card__link\s*\{[\s\S]*background:\s*transparent/);
  assert.match(mainCss, /@media \(max-width: 640px\)[\s\S]*\.voice-trust-card__link\s*\{[\s\S]*width:\s*auto/);

  assert.match(voicesHtml, /<title>お客様の声｜整体院ひざこぞう<\/title>/);
  assert.equal((voicesHtml.match(/class="voices-page-card"/g) || []).length, 6);
  for (const id of ["voice-1", "voice-2", "voice-3", "voice-4", "voice-5", "voice-6"]) {
    assert.match(voicesHtml, new RegExp(`id="${id}"`));
  }
  for (const image of ["patient-voice-kt.webp", "patient-voice-kk-anonymized.webp", "patient-voice-numajiri.webp", "patient-voice-yo-knee.png", "patient-voice-yn.webp", "patient-voice-ym-hip.png"]) {
    assert.match(voicesHtml, new RegExp(`image/${escapeRegExp(image)}`));
  }
  assert.equal((voicesHtml.match(/class="voices-page-card__sheet"/g) || []).length, 6);
  assert.match(voicesHtml, /お悩みの症状/);
  assert.match(voicesHtml, /股関節痛、膝痛/);
  assert.match(voicesHtml, /腰痛、肩こり、腹部の痛み/);
  assert.match(voicesHtml, /そけい部・前大腿部付近の痛み、膝痛、足裏痛/);
  assert.match(voicesHtml, /痛みがスッキリと取れます。/);
  assert.match(voicesHtml, /身体の動きがよくなり軽くなりました。/);
  assert.match(voicesHtml, /即痛みが消える、または軽くなる、気にならなくなりました。/);
  assert.doesNotMatch(voicesHtml, /写真の内容を要約したお声です/);
  assert.doesNotMatch(voicesHtml, /しているようです/);
  assert.match(voicesHtml, /MRIをすすめてくれた川上先生に感謝しています。/);
  assert.match(voicesHtml, /お客様個人の感想であり、効果を保証するものではありません。/);
  assert.match(voicesHtml, /LINEで予約・相談する/);
  assert.match(voicesHtml, /scrollToHashTarget/);
  assert.match(html, /id="voice" class="py-20 voice-list-section" hidden aria-hidden="true"/);
});

test("voices page uses yellow-green accent colors", () => {
  assert.match(getCssRule(".voices-page-card"), /border:\s*1px solid #d9ec8c/);
  assert.match(getCssRule(".voices-page-card"), /box-shadow:\s*0 18px 42px rgba\(87,\s*116,\s*24,\s*0\.12\)/);
  assert.match(getCssRule(".voices-page-card__sheet"), /border-right:\s*1px solid #d9ec8c/);
  assert.match(getCssRule(".voices-page-card__sheet"), /background:\s*#f7ffe7/);
  assert.match(getCssRule(".voices-page-card__meta"), /color:\s*#7aa21d/);
  assert.match(getCssRule(".voices-page-card__rows strong"), /color:\s*#6f9718/);
  assert.match(getCssRule(".voices-page-cta"), /background:\s*linear-gradient\(135deg,\s*#f7ffe7 0%,\s*#eef7ef 100%\)/);
  assert.doesNotMatch(voicesHtml, /voices-page-header|voices-page-footer/);
  assert.match(mainCss, /@media \(max-width: 760px\)[\s\S]*\.voices-page-card__sheet\s*\{[\s\S]*border-bottom:\s*1px solid #d9ec8c/);
});

test("voices and FAQ pages use the shared top-page header and footer chrome", () => {
  const pages = [
    ["voices.html", voicesHtml],
    ["faq.html", readPageIfExists("faq.html")]
  ];
  const headerLinks = [
    ["index.html#top", "ホーム"],
    ["staff.html", "代表紹介"],
    ["index.html#knee-msm-reasons", "当院の特徴"],
    ["index.html#msm-method", "MSMメソッドとは？"],
    ["symptoms/lower-back-pain.html", "腰痛"],
    ["symptoms/sciatica.html", "坐骨神経痛"],
    ["symptoms/spinal-stenosis.html", "脊柱管狭窄症"],
    ["symptoms/lumbar-disc-herniation.html", "椎間板ヘルニア"],
    ["symptoms/hip-osteoarthritis.html", "股関節痛"],
    ["symptoms/knee-osteoarthritis.html", "膝痛"],
    ["symptoms/index.html", "その他の慢性症状"],
    ["index.html#flow", "施術の流れ"],
    ["index.html#price", "料金"],
    ["blog/", "コラム"],
    ["index.html#access", "アクセス・予約"]
  ];
  const footerLinks = [
    ["index.html#top", "ホーム"],
    ["index.html#troubles", "お悩み"],
    ["index.html#seo-guide", "当院の考え方"],
    ["index.html#flow", "施術の流れ"],
    ["staff.html", "院長紹介"],
    ["index.html#price", "料金"],
    ["blog/", "コラム"],
    ["faq.html", "よくある質問"],
    ["access.html", "アクセス"],
    ["index.html#contact", "ご予約・お問合せ"]
  ];

  for (const [pageName, pageHtml] of pages) {
    const bodyOpen = pageHtml.indexOf("<body");
    const mainOpen = pageHtml.indexOf("<main", bodyOpen);
    const headerBlock = pageHtml.slice(bodyOpen, mainOpen);
    const footerStart = pageHtml.indexOf('<footer class="hk-footer-section">');
    const footerEnd = pageHtml.indexOf("</footer>", footerStart);
    const footerBlock = footerStart >= 0 && footerEnd >= 0
      ? pageHtml.slice(footerStart, footerEnd + "</footer>".length)
      : "";

    assert.match(pageHtml, /pb-24 md:pb-0/, `${pageName} should reserve space for the shared mobile fixed CTA`);
    assert.match(headerBlock, /<header id="header" class="site-header">/, `${pageName} should include the shared header`);
    assert.match(headerBlock, /class="site-header__upper"/, `${pageName} should include the top-page upper header`);
    assert.match(headerBlock, /class="site-brand"/, `${pageName} should include the shared brand`);
    assert.match(headerBlock, /class="site-header-badges"/, `${pageName} should include the shared badges`);
    assert.match(headerBlock, /href="tel:0471143274"/, `${pageName} should include the shared phone CTA`);
    assert.match(headerBlock, /id="menuBtn" class="site-menu-toggle"/, `${pageName} should include the shared hamburger button`);
    assert.match(headerBlock, /<nav class="site-nav" aria-label="メインナビゲーション">/, `${pageName} should include the desktop nav`);
    assert.match(headerBlock, /<nav class="site-mobile-nav hidden" id="mobileNav"/, `${pageName} should include the mobile nav`);
    assert.match(headerBlock, /site-mobile-nav__group/, `${pageName} should keep grouped mobile nav links`);
    assert.doesNotMatch(headerBlock, /detail-header|detail-nav|voices-page-header|voices-page-brand|voices-page-header__cta/, `${pageName} should not use a page-specific header`);
    assert.doesNotMatch(headerBlock, /href="#(?:top|flow|price|access|contact|knee-msm-reasons|msm-method)"/, `${pageName} should not point chrome links to missing same-page anchors`);

    for (const [href, label] of headerLinks) {
      assert.match(headerBlock, new RegExp(`href="${escapeRegExp(href)}"`), `${pageName} should link ${label}`);
      assert.match(headerBlock, new RegExp(escapeRegExp(label)), `${pageName} should show ${label}`);
    }

    assert.ok(footerBlock, `${pageName} should include the shared footer`);
    assert.match(footerBlock, /class="hk-footer-brand"/, `${pageName} should include the shared footer brand`);
    assert.match(footerBlock, /class="hk-footer-nav"/, `${pageName} should include the shared footer navigation`);
    assert.match(footerBlock, /class="hk-footer-symptoms"/, `${pageName} should include the shared symptom summary`);
    assert.doesNotMatch(footerBlock, /voices-page-footer|detail-footer/, `${pageName} should not use a page-specific footer`);
    for (const [href, label] of footerLinks) {
      assert.match(footerBlock, new RegExp(`href="${escapeRegExp(href)}"`), `${pageName} footer should link ${label}`);
      assert.match(footerBlock, new RegExp(escapeRegExp(label)), `${pageName} footer should show ${label}`);
    }

    assert.match(pageHtml, /<span id="top" class="page-top-anchor" aria-hidden="true"><\/span>/, `${pageName} should expose the shared page-top anchor`);
    assert.match(pageHtml, /<button type="button" class="page-top-button" aria-label="ページ上部へ戻る">/, `${pageName} should include the shared page-top button`);
    assert.match(pageHtml, /class="mobile-fixed-cta[^"]*"/, `${pageName} should include the shared mobile LINE CTA`);
    assert.match(pageHtml, /<script src="scripts\/main\.js" defer><\/script>/, `${pageName} should use the shared header behavior script`);
  }

  assert.match(mainJs, /menuBtn\?\.addEventListener\('click'/);
  assert.match(mainJs, /setupMobileMenuLinks\(\);/);
  assert.match(mainJs, /setupHeaderSymptomDropdown\(\);/);
});

test("patient voice summaries read like direct content summaries", () => {
  const pages = [
    ["index.html", html],
    ["symptoms/knee-osteoarthritis.html", readFileSync(new URL("../symptoms/knee-osteoarthritis.html", import.meta.url), "utf8")],
    ["symptoms/lower-back-pain.html", readFileSync(new URL("../symptoms/lower-back-pain.html", import.meta.url), "utf8")],
    ["symptoms/hip-osteoarthritis.html", readFileSync(new URL("../symptoms/hip-osteoarthritis.html", import.meta.url), "utf8")],
    ["symptoms/shoulder-stiffness.html", readFileSync(new URL("../symptoms/shoulder-stiffness.html", import.meta.url), "utf8")],
    ["symptoms/sciatica.html", readFileSync(new URL("../symptoms/sciatica.html", import.meta.url), "utf8")]
  ];
  const voiceCopyPattern = /class="(?:text-sm md:text-base font-bold text-slate-700 leading-relaxed|text-base font-bold text-slate-700 leading-relaxed|symptom-voice-card__value)"[^>]*>([^<]+)/g;
  const thirdPartyPhrases = /(伝わります|記載されています|お声です|方針が伝わる|変化が記載)/;

  for (const [pageName, pageHtml] of pages) {
    const summaries = [...pageHtml.matchAll(voiceCopyPattern)].map((match) => match[1]);
    assert.ok(summaries.length > 0, `${pageName} should have patient voice summaries`);
    for (const summary of summaries) {
      assert.doesNotMatch(summary, thirdPartyPhrases, `${pageName} has third-party summary wording: ${summary}`);
    }
  }
});

test("patient voice cards use the three-line concern change comment format", () => {
  const pages = [
    ["index.html", html],
    ["symptoms/knee-osteoarthritis.html", readFileSync(new URL("../symptoms/knee-osteoarthritis.html", import.meta.url), "utf8")],
    ["symptoms/lower-back-pain.html", readFileSync(new URL("../symptoms/lower-back-pain.html", import.meta.url), "utf8")],
    ["symptoms/hip-osteoarthritis.html", readFileSync(new URL("../symptoms/hip-osteoarthritis.html", import.meta.url), "utf8")],
    ["symptoms/shoulder-stiffness.html", readFileSync(new URL("../symptoms/shoulder-stiffness.html", import.meta.url), "utf8")],
    ["symptoms/sciatica.html", readFileSync(new URL("../symptoms/sciatica.html", import.meta.url), "utf8")]
  ];
  const expectedCopy = [
    "お悩み",
    "変化",
    "ひとこと",
    "腰痛・肩こり・腹部の痛み",
    "施術と自宅でできるストレッチに取り組むことで、身体の動きが軽くなってきました。",
    "丁寧に説明しながら進めてくれるので、不安がやわらぎ、安心して通えました。",
    "強い腰痛と長年の膝痛",
    "施術とセルフトレーニングを続けることで、歩くつらさや刺すような膝の痛みが軽くなりました。",
    "穏やかで相談しやすい先生なので、身体の悩みを気軽に話せました。",
    "坐骨神経痛・膝の痛み・腰の痛み",
    "施術後は身体が軽くなり、痛みのポイントを丁寧に見てもらえる安心感がありました。",
    "誠実で信頼できる先生です。日々勉強されている姿勢にも安心できます。",
    "ねんざ後の全身の痛みや不調",
    "腰・足・首肩の状態を整えることで、日常のつらさが軽くなりました。",
    "原因がわからない痛みや疲れを感じたら、自分の身体と向き合うことが大事だと思いました。"
  ];

  for (const copy of expectedCopy) {
    assert.match(html, new RegExp(escapeRegExp(copy)), `LP should include ${copy}`);
  }

  for (const [pageName, pageHtml] of pages) {
    if (!pageHtml.includes("patient-voice-")) continue;
    assert.match(pageHtml, />お悩み</, `${pageName} should render concern label`);
    assert.match(pageHtml, />変化</, `${pageName} should render change label`);
    assert.match(pageHtml, />ひとこと</, `${pageName} should render comment label`);
    assert.doesNotMatch(pageHtml, /「(?:2〜3週間ほどで楽に歩けるまで回復しました|施術後は体が軽くなります|体と向き合うことが大事だと思います|少しずつ筋肉のコリがなくなって、身体の動きがよくなりました)」/);
  }
});

test("LP has an overflow-safe mobile hero title", () => {
  assert.match(html, /<h1 class="[^"]*\bhero-title\b[^"]*"/, "hero title should keep the hero-title hook");
  assert.match(html, /\.hero-fixed \.hero-title\s*\{[\s\S]*overflow-wrap:\s*anywhere/i);
  assert.match(html, /\.hero-fixed \.hero-title\s*\{[\s\S]*font-size:\s*clamp\(/i);
});

test("LP hero uses optimized real WebP assets for the replaced hero visual", () => {
  const hero = getSectionSlice(
    '<section class="pt-28 pb-16 md:pt-40 md:pb-24 bg-white overflow-hidden relative hero-fixed hz-hero">',
    '<section id="troubles"'
  );

  assert.match(html, /<link rel="preload" as="image" href="image\/hero-sp\.webp"/);
  assert.match(html, /<link rel="preload" as="image" href="image\/hero-pc\.webp"/);
  assert.match(hero, /<source srcset="image\/hero-sp\.webp" media="\(max-width: 768px\)">/);
  assert.match(hero, /<img src="image\/hero-pc\.webp"/);

  for (const asset of ["image/hero-pc.webp", "image/hero-sp.webp"]) {
    const assetPath = path.join(repoRoot, asset);
    const bytes = readFileSync(assetPath);
    const riff = bytes.subarray(0, 4).toString("ascii");
    const webp = bytes.subarray(8, 12).toString("ascii");

    assert.equal(riff, "RIFF", `${asset} should be encoded as WebP, not only renamed`);
    assert.equal(webp, "WEBP", `${asset} should use the WebP container`);
    assert.ok(statSync(assetPath).size < 420_000, `${asset} should stay lightweight after replacement`);
  }
});

test("LP mobile hero visual does not reserve a tall blank portrait frame", () => {
  assert.doesNotMatch(mainCss, /\.hero-photo-frame\s*\{\s*aspect-ratio:\s*862\s*\/\s*1825\s*;/);
  assert.match(mainCss, /@media \(max-width:\s*768px\)[\s\S]*\.hero-photo-frame\s*\{[\s\S]*aspect-ratio:\s*1536\s*\/\s*1024\s*;/);
  assert.match(html, /@media \(max-width:\s*768px\)[\s\S]*\.hero-fixed \.hero-photo-frame\s*\{[\s\S]*aspect-ratio:\s*1536\s*\/\s*1024\s*!important;/);
  assert.match(html, /@media \(max-width:\s*768px\)[\s\S]*\.hero-fixed \.hero-photo\s*\{[\s\S]*height:\s*100%\s*!important;/);
  assert.match(html, /@media \(max-width:\s*768px\)[\s\S]*\.hero-fixed \.hero-photo\s*\{[\s\S]*object-fit:\s*cover\s*!important;/);
});

test("LP mobile hero title and fixed CTA stay compact on narrow screens", () => {
  assert.match(html, /font-size:\s*clamp\(1\.42rem,\s*6vw,\s*3\.6rem\)\s*!important;/);
  assert.doesNotMatch(html, /font-size:\s*clamp\(2rem,\s*8\.6vw,\s*4rem\)/);
  assert.match(html, /<span class="mobile-fixed-cta__label">LINEで空き状況を確認<\/span>/);
  assert.doesNotMatch(getSectionSlice('class="fixed bottom-0', '<script src="scripts/main.js"'), /tel:0471143274/);
  assert.doesNotMatch(getSectionSlice('class="fixed bottom-0', '<script src="scripts/main.js"'), /LINEで予約する/);
});

test("LP hero first-visit guide matches the flyer-style first-visit CTA", () => {
  const hero = getSectionSlice(
    '<section class="pt-28 pb-16 md:pt-40 md:pb-24 bg-white overflow-hidden relative hero-fixed hz-hero">',
    '<section id="troubles"'
  );
  const topHeroCta = getSectionSlice(
    'class="hero-cta-grid hero-cta-grid--top"',
    '<section class="hero-safe-band'
  );

  assert.match(hero, /class="hero-safe-band__ribbon"/);
  assert.match(hero, /初回限定のご案内/);
  assert.match(hero, /初回カウンセリング＋全身整体コース/);
  assert.match(hero, /<span class="hero-safe-band__first">初回<\/span>/);
  assert.match(hero, /hero-safe-band__normal-label">通常<\/span>[\s\S]*hero-safe-band__normal-price">10,000円<\/span>/);
  assert.match(hero, /1,980<small>円<\/small>/);
  assert.match(hero, /カウンセリング・状態確認込み/);
  assert.match(hero, /まずは相談だけでも大丈夫です。/);
  assert.match(hero, /class="hero-safe-band__included-ribbon"/);
  for (const item of ["カウンセリング", "姿勢・歩き方の確認", "膝に負担がかかる原因の説明", "全身整体", "セルフケアのご提案"]) {
    assert.match(hero, new RegExp(escapeRegExp(item)));
  }
  assert.match(hero, /class="hero-safe-band__line"/);
  assert.match(topHeroCta, /LINEで相談・予約する/);
  assert.doesNotMatch(topHeroCta, /LINEで膝痛を相談する/);
  assert.match(hero, /LINEで初回予約する/);
  assert.match(hero, /無理な勧誘はありません。ご相談だけでも大丈夫です。/);
  assert.doesNotMatch(hero, /class="hero-safe-band__hours"/);
  assert.doesNotMatch(hero, /class="hero-safe-band__info"/);

  assert.match(html, /\.hero-fixed \.hero-safe-band__flyer\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1\.18fr\)\s*minmax\(320px,\s*0\.82fr\);/);
  assert.match(html, /\.hero-fixed \.hero-safe-band__ribbon::before,[\s\S]*\.hero-fixed \.hero-safe-band__ribbon::after\s*\{/);
  assert.match(html, /\.hero-fixed \.hero-safe-band__line\s*\{[\s\S]*background:\s*linear-gradient\(180deg,\s*#ff9f20,\s*#ff5c00\);/);
});

test("LP Step 2 uses Japanese labels, removes the comparison section, and keeps a single mobile LINE CTA", () => {
  const approach = getSectionSlice('id="msm-method"', 'id="flow"');
  const fixedCta = getSectionSlice('class="fixed bottom-0', '<script src="scripts/main.js"');

  assert.doesNotMatch(html, /CLINICAL VIEW|HIZAKOZOU METHOD|FIRST VISIT/);
  assert.match(approach, /STEP\s*<strong>0?1<\/strong>/);
  assert.match(approach, /STEP\s*<strong>0?2<\/strong>/);
  assert.match(approach, /STEP\s*<strong>0?3<\/strong>/);
  assert.match(html, /膝痛を見立てる視点/);
  assert.match(html, /初回の進め方/);
  assert.match(html, /ひざこぞう式MSMメソッド/);
  assert.equal(html.includes('id="method-features"'), false, "duplicated feature section should be integrated into the method section");
  assert.doesNotMatch(html, /id="comparison"/);
  assert.doesNotMatch(html, /選び方の目安/);
  assert.doesNotMatch(html, /整形外科・一般的な整体・当院の違い/);
  assert.match(html, /@media \(min-width: 380px\) and \(max-width: 767px\)/);
  assert.equal((fixedCta.match(/<a /g) ?? []).length, 1, "mobile fixed CTA should be one button");
  assert.match(fixedCta, /LINEで空き状況を確認/);
});

test("LP Step 3 adds conversion copy, review proof, flyer-style price CTA, and toast form handling", () => {
  const hero = getSectionSlice('<main>', '<section id="knee-msm-reasons"');
  const price = getSectionSlice('id="price"', 'id="faq"');
  const contact = getSectionSlice('id="contact"', 'id="lightbox"');

  assert.match(hero, /痛みに慣れようとしている[\s\S]*自分に、/);
  assert.match(hero, /気づいていますか。/);
  assert.match(hero, /それは慣れたのではなく、諦めているだけかもしれない。/);
  assert.match(hero, /もう一度、自分の体と向き合う時間をつくりませんか。/);
  assert.doesNotMatch(hero, /また旅行に行けた。孫と公園を歩けた。/);
  assert.match(price, /「先生に出会えて良かった。」<br>「もっと早く来ていれば良かった」と/);
  assert.match(price, /多くの方から感謝の声を頂いています。まずは一度試してください。/);
  assert.match(price, /足腰のつらさを一緒に整理し、動きやすい身体づくりをサポートします。/);
  assert.match(price, /初回限定/);
  assert.match(price, /特別価格/);
  assert.match(price, /痛みの原因を/);
  assert.match(price, /徹底解明/);
  assert.match(price, /動き全体を/);
  assert.match(price, /プロが解析/);
  assert.match(price, /初回施術費/);
  assert.match(price, /全額返金保証/);
  assert.match(price, /1,980/);
  assert.match(price, /data-deadline/);
  assert.match(price, /data-total="6"/);
  assert.match(price, /data-remaining/);
  assert.match(price, /お電話でのご予約はこちら/);
  assert.match(price, /LINEで1分かんたん仮予約/);
  assert.match(price, /会員登録不要/);
  assert.match(price, /予約完了ではありません/);
  assert.match(mainJs, /WEEKS_CONFIG/);
  assert.match(mainJs, /残り\$\{config\.remaining\}名様/);
  const forbiddenAutoUpdateLabel = ["毎週月曜日", "に自動更新"].join("");
  assert.ok(!`${html}\n${mainJs}\n${mainCss}`.includes(forbiddenAutoUpdateLabel));
  assert.match(html, /id="toast"/);
  assert.match(contact, /<form id="contactForm"/);
  assert.match(contact, /name="name"/);
  assert.match(contact, /name="phone"/);
  assert.match(contact, /name="message"/);
  assert.match(contact, /name="preferredDate"/);
  assert.match(contact, /LINEで相談する/);
  assert.match(contact, /class="contact-line-pop"/);
  assert.match(contact, /id="successMessage"[^>]*tabindex="-1"/);
  assert.match(contact, /アクセスを確認する/);
  assert.match(mainJs, /function showToast\(/);
  assert.match(mainJs, /showToast\('入力内容をご確認ください。', 'error'\)/);
  assert.match(mainJs, /showToast\('送信が完了しました。24時間以内に折り返しご連絡いたします。'\)/);
  assert.match(mainJs, /showToast\('送信に失敗しました。LINE予約・お電話もご利用ください。', 'error'\)/);
});

test("LP exposes a real contact anchor for generated blog CTAs", () => {
  assert.match(html, /id="contact"/, "LP should expose a contact anchor");
  assert.match(buildBlogScript, /CONTACT_PATH: "\/#access"/, "blog CTAs should continue to use the access reservation block");
  assert.match(buildBlogScript, /href="\.\.\/index\.html#contact"/, "generated symptom footers may link to the real LP contact anchor");
});

test("LP runtime blog preview keeps compact cards and avoids speculative image variants", () => {
  assert.match(mainJs, /class="blog-b-card group/, "runtime blog cards should use the compact LP card class");
  assert.doesNotMatch(mainJs, /-480\$\{ext\}/, "runtime blog images should not assume a 480px variant exists");
  assert.doesNotMatch(mainJs, /-768\$\{ext\}/, "runtime blog images should not assume a 768px variant exists");
});

test("LP runtime blog preview escapes post data before injecting HTML", () => {
  assert.match(mainJs, /function escapeHtml\(/, "runtime blog rendering should define an HTML escaper");
  assert.match(mainJs, /const title = escapeHtml\(post\.title \|\| ''\)/);
  assert.match(mainJs, /const description = escapeHtml\(post\.description \|\| ''\)/);
  assert.doesNotMatch(mainJs, /\$\{post\.title\}/, "raw titles should not be interpolated into card HTML");
  assert.doesNotMatch(mainJs, /\$\{post\.description \|\| ''\}/, "raw descriptions should not be interpolated into card HTML");
});

test("LP avoids strong medical promise wording in visible conversion copy", () => {
  const strongPhrases = [
    "根本から改善する",
    "原因から改善する",
    "絶対に無駄にしません",
    "世界の医療が証明",
    "手術は最後の手段"
  ];

  for (const phrase of strongPhrases) {
    assert.equal(html.includes(phrase), false, `LP should avoid strong phrase: ${phrase}`);
  }
});

test("blog generation keeps region data and emits BlogPosting schema", () => {
  assert.match(generateBlogScript, /region:\s*parsed\.region/, "generated blog post data should preserve region");
  assert.match(buildBlogScript, /"@type":\s*"BlogPosting"/, "blog article schema should use BlogPosting");
  assert.match(buildBlogScript, /"@id":\s*absoluteUrl\(site\.url,\s*"#medicalbusiness"\)/, "blog article schema should link back to the clinic entity");
});

test("knee osteoarthritis page is a diagnosis-specific reservation LP", () => {
  const kneeHtml = readFileSync(new URL("../symptoms/knee-osteoarthritis.html", import.meta.url), "utf8");
  const expectedDescription = "柏市で変形性膝関節症と言われ、歩き始め・階段・立ち上がりの膝痛に悩む方へ。整体院ひざこぞうは膝だけでなく股関節・足首・歩き方を確認し、病院と併用しながら膝への負担を減らす体づくりをサポートします。柏駅西口徒歩8分。";
  const expectedFaqs = [
    "変形性膝関節症と言われましたが相談できますか？",
    "病院に通いながらでも大丈夫ですか？",
    "注射を受けていても相談できますか？",
    "手術を勧められた場合でも相談できますか？",
    "歩くと痛いのですが、運動しても大丈夫ですか？",
    "どれくらい通う必要がありますか？"
  ];
  const requiredCopy = [
    "柏市で変形性膝関節症と言われた方へ｜階段・歩き始めの膝痛相談",
    "整体でできること・できないこと",
    "病院と併用しながら相談できます",
    "当院は医療機関ではありません",
    "膝や歩き方のお悩みでご相談いただいた方の声",
    "初回の流れ",
    "初回限定",
    "1,980",
    "柏駅西口徒歩8分",
    "今の膝の状態を送って相談する"
  ];
  const forbiddenPatterns = [
    /治る/,
    /完治/,
    /必ず改善/,
    /根本改善/,
    /手術回避できます/,
    /手術を避けられる/,
    /変形を治す/,
    /軟骨を戻す/
  ];

  assert.match(kneeHtml, /<title>柏市で変形性膝関節症の整体相談｜歩き始め・階段の膝痛｜整体院ひざこぞう<\/title>/);
  assert.match(kneeHtml, new RegExp(`<meta name="description" content="${escapeRegExp(expectedDescription)}">`));
  assert.equal((kneeHtml.match(/<h1\b/g) ?? []).length, 1, "knee osteoarthritis LP should have one h1");

  for (const copy of requiredCopy) {
    assert.match(kneeHtml, new RegExp(escapeRegExp(copy)), `knee osteoarthritis LP should include: ${copy}`);
  }

  for (const question of expectedFaqs) {
    assert.match(kneeHtml, new RegExp(escapeRegExp(question)), `FAQ should include: ${question}`);
  }

  assert.match(kneeHtml, /href="https:\/\/lin\.ee\/X01F2mP"/);
  assert.match(kneeHtml, /href="tel:0471143274"/);
  assert.match(kneeHtml, /href="\/#price"/);
  assert.match(kneeHtml, /href="\/#access"/);
  assert.match(kneeHtml, /href="\/#contact"/);

  for (const pattern of forbiddenPatterns) {
    assert.doesNotMatch(kneeHtml, pattern, `knee osteoarthritis LP should avoid ${pattern}`);
  }
});

test("symptom pages avoid strong medical guarantee wording", () => {
  const symptomDir = path.join(repoRoot, "symptoms");
  const strongPatterns = [
    /根本改善/,
    /唯一の方法/,
    /確実に楽/,
    /再貯留を防ぎます/,
    /再発を防ぎます/,
    /排液を促します/,
    /効く理由/
  ];

  for (const fileName of readdirSync(symptomDir).filter((name) => name.endsWith(".html"))) {
    const symptomHtml = readFileSync(path.join(symptomDir, fileName), "utf8");
    for (const pattern of strongPatterns) {
      assert.doesNotMatch(symptomHtml, pattern, `${fileName} should avoid ${pattern}`);
    }
  }
});

test("symptom pages self-host lucide instead of loading it from a third-party CDN", () => {
  const symptomDir = path.join(repoRoot, "symptoms");

  assert.equal(existsSync(path.join(repoRoot, "scripts", "vendor", "lucide.min.js")), true);

  for (const fileName of readdirSync(symptomDir).filter((name) => name.endsWith(".html"))) {
    const symptomHtml = readFileSync(path.join(symptomDir, fileName), "utf8");

    assert.doesNotMatch(symptomHtml, /https:\/\/unpkg\.com\/lucide/i, `${fileName} should not load lucide from unpkg`);
    assert.match(
      symptomHtml,
      /<script src="\.\.\/scripts\/vendor\/lucide\.min\.js"><\/script>/,
      `${fileName} should use the self-hosted lucide bundle`
    );
  }
});

test("all symptom pages use the transplanted top-page header and mobile hamburger menu", () => {
  const symptomDir = path.join(repoRoot, "symptoms");
  const symptomPages = readdirSync(symptomDir).filter((name) => name.endsWith(".html"));
  const desktopLinks = [
    ["../index.html#top", "ホーム"],
    ["../index.html#flow", "施術の流れ"],
    ["../index.html#price", "料金"],
    ["../blog/", "コラム"],
    ["../index.html#access", "アクセス・予約"]
  ];
  const aboutLinks = [
    ["../staff.html", "代表紹介"],
    ["../index.html#knee-msm-reasons", "当院の特徴"],
    ["../index.html#msm-method", "MSMメソッドとは？"]
  ];
  const symptomLinks = [
    ["lower-back-pain.html", "腰痛"],
    ["sciatica.html", "坐骨神経痛"],
    ["spinal-stenosis.html", "脊柱管狭窄症"],
    ["lumbar-disc-herniation.html", "椎間板ヘルニア"],
    ["hip-osteoarthritis.html", "股関節痛"],
    ["knee-osteoarthritis.html", "膝痛"],
    ["index.html", "その他の足腰の症状"]
  ];

  for (const fileName of symptomPages) {
    const symptomHtml = readFileSync(path.join(symptomDir, fileName), "utf8");
    const bodyOpen = symptomHtml.indexOf("<body>");
    const mainOpen = symptomHtml.indexOf("  <main", bodyOpen);
    const headerBlock = symptomHtml.slice(bodyOpen, mainOpen);

    assert.match(headerBlock, /<header id="header" class="site-header">/, `${fileName} should include the top-page header`);
    assert.match(headerBlock, /class="site-brand"/, `${fileName} should include the top-page brand structure`);
    assert.match(headerBlock, /src="\.\.\/image\/hizakozou-logo-option2-mark\.webp"/, `${fileName} should use the relative logo path`);
    assert.match(headerBlock, /class="site-header-badges"/, `${fileName} should include the top-page header badges`);
    assert.match(headerBlock, /<nav class="site-nav" aria-label="メインナビゲーション">/, `${fileName} should include desktop nav`);
    assert.match(headerBlock, /id="menuBtn" class="site-menu-toggle"/, `${fileName} should include the top-page hamburger button`);
    assert.match(headerBlock, /<nav class="site-mobile-nav hidden" id="mobileNav"/, `${fileName} should include mobile nav`);
    assert.match(symptomHtml, /<link rel="stylesheet" href="site-header\.css">/, `${fileName} should include copied top-page header styles`);
    assert.match(symptomHtml, /<script src="site-header\.js"><\/script>/, `${fileName} should include header behavior`);
    assert.match(headerBlock, /aria-controls="site-about-menu"/, `${fileName} should expose the about dropdown`);
    assert.match(headerBlock, /<span class="site-nav__jp">当院について<\/span>/, `${fileName} should rename feature nav to about`);
    assert.match(headerBlock, /<span class="site-nav__en">ABOUT<\/span>/, `${fileName} should use the about nav label`);
    assert.match(headerBlock, /aria-controls="site-symptoms-menu"/, `${fileName} should expose the symptom dropdown`);
    assert.match(headerBlock, /aria-expanded="false"/, `${fileName} should start menu controls collapsed`);
    assert.doesNotMatch(headerBlock, /symptom-taskbar|symptom-nav/, `${fileName} should not use the old custom symptom taskbar`);
    assert.doesNotMatch(headerBlock, /<a href="\.\.\/index\.html#features" class="site-nav__item">/, `${fileName} should not keep feature as a standalone desktop nav item`);
    assert.doesNotMatch(headerBlock, /href="\.\.\/index\.html#features" class="site-mobile-nav__item">特徴/, `${fileName} should not keep feature as a standalone mobile nav item`);

    for (const [href, label] of desktopLinks) {
      assert.match(headerBlock, new RegExp(`href="${escapeRegExp(href)}"`), `${fileName} should link ${label}`);
      assert.match(headerBlock, new RegExp(escapeRegExp(label)), `${fileName} should show ${label}`);
    }
    for (const [href, label] of aboutLinks) {
      assert.match(headerBlock, new RegExp(`href="${escapeRegExp(href)}"`), `${fileName} should link ${label}`);
      assert.match(headerBlock, new RegExp(escapeRegExp(label)), `${fileName} should show ${label}`);
    }
    for (const [href, label] of symptomLinks) {
      assert.match(headerBlock, new RegExp(`href="\\./${escapeRegExp(href)}"`), `${fileName} should link ${label}`);
      assert.match(headerBlock, new RegExp(escapeRegExp(label)), `${fileName} should show ${label}`);
    }

    const orderedLabels = symptomLinks.map(([, label]) => label);
    const positions = orderedLabels.map((label) => headerBlock.indexOf(label));
    assert.ok(positions.every((position) => position >= 0), `${fileName} should include every symptom dropdown label`);
    assert.deepStrictEqual([...positions].sort((a, b) => a - b), positions, `${fileName} should keep the requested symptom order`);
  }

  const headerCss = readFileSync(path.join(symptomDir, "site-header.css"), "utf8");
  const headerJs = readFileSync(path.join(symptomDir, "site-header.js"), "utf8");
  assert.match(headerCss, /Copied from \.\.\/styles\/main\.css top-page header styles/);
  assert.match(headerCss, /\.site-header\s*\{/);
  assert.match(headerCss, /\.site-nav__dropdown\s*\{[^}]*top:\s*100%/s);
  assert.doesNotMatch(headerCss, /symptom-taskbar/);
  assert.match(headerCss, /\.site-mobile-nav\.hidden\s*\{/);
  assert.match(headerCss, /\.site-header \+ \.site-header__lower \+ main \.breadcrumb/);
  assert.match(headerJs, /Copied from \.\.\/scripts\/main\.js header and page-top behavior/);
  assert.match(headerJs, /menuBtn\.addEventListener\('click'/);
  assert.match(headerJs, /mobileNav\.classList\.toggle\('hidden'/);
});

test("all symptom pages use the transplanted top-page footer and scroll-to-top button", () => {
  const symptomDir = path.join(repoRoot, "symptoms");
  const symptomPages = readdirSync(symptomDir).filter((name) => name.endsWith(".html"));
  const footerLinks = [
    ["../index.html#top", "ホーム"],
    ["../index.html#troubles", "お悩み"],
    ["../index.html#seo-guide", "当院の考え方"],
    ["../index.html#flow", "施術の流れ"],
    ["../index.html#profile", "院長紹介"],
    ["../index.html#price", "料金"],
    ["../blog/", "コラム"],
    ["../faq.html", "よくある質問"],
    ["../access.html", "アクセス"],
    ["../index.html#contact", "ご予約・お問合せ"]
  ];

  for (const fileName of symptomPages) {
    const symptomHtml = readFileSync(path.join(symptomDir, fileName), "utf8");
    const footerStart = symptomHtml.indexOf('<footer class="hk-footer-section">');
    const footerEnd = symptomHtml.indexOf("</footer>", footerStart);
    const footerBlock = footerStart >= 0 && footerEnd >= 0
      ? symptomHtml.slice(footerStart, footerEnd + "</footer>".length)
      : "";

    assert.ok(footerBlock, `${fileName} should include the top-page footer`);
    assert.match(symptomHtml, /<link rel="stylesheet" href="site-footer\.css">/, `${fileName} should include copied top-page footer styles`);
    assert.match(symptomHtml, /<span id="top" class="page-top-anchor" aria-hidden="true"><\/span>/, `${fileName} should expose a page top anchor`);
    assert.match(symptomHtml, /<button type="button" class="page-top-button" aria-label="ページ上部へ戻る">/, `${fileName} should include the top-page scroll button`);
    assert.match(symptomHtml, /<span aria-hidden="true">↑<\/span>\s*TOP/, `${fileName} should show the same TOP button label`);
    assert.doesNotMatch(footerBlock, /symptom-footer/, `${fileName} should not render the old symptom footer`);
    assert.match(footerBlock, /src="\.\.\/image\/hizakozou-logo-option2-mark\.webp"/, `${fileName} should use the relative footer logo path`);
    assert.match(footerBlock, /href="\.\.\/index\.html#top" class="hk-footer-brand"/, `${fileName} should link the footer brand to the top page`);

    for (const [href, label] of footerLinks) {
      assert.match(footerBlock, new RegExp(`href="${escapeRegExp(href)}"`), `${fileName} should link ${label}`);
      assert.match(footerBlock, new RegExp(escapeRegExp(label)), `${fileName} should show ${label}`);
    }
  }

  const footerCss = readFileSync(path.join(symptomDir, "site-footer.css"), "utf8");
  const headerCss = readFileSync(path.join(symptomDir, "site-header.css"), "utf8");
  const headerJs = readFileSync(path.join(symptomDir, "site-header.js"), "utf8");
  assert.match(footerCss, /Copied from \.\.\/styles\/main\.css top-page footer styles/);
  assert.match(footerCss, /\.hk-footer-section\s*\{/);
  assert.match(footerCss, /\.hk-footer-nav a\s*\{/);
  assert.match(footerCss, /@media \(max-width: 767px\)\s*\{[\s\S]*\.hk-footer-inner/);
  assert.match(headerCss, /\.page-top-button\s*\{[\s\S]*position:\s*fixed;[\s\S]*right:\s*24px;[\s\S]*bottom:\s*24px;/);
  assert.match(headerCss, /\.page-top-button\.is-visible\s*\{[\s\S]*opacity:\s*1;[\s\S]*pointer-events:\s*auto;/);
  assert.match(headerJs, /setupPageTopButton/);
  assert.match(headerJs, /window\.scrollY > 300/);
  assert.match(headerJs, /window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\)/);
});

test("symptom pages replace the visual guide cards with the top-page flow slider", () => {
  const symptomDir = path.join(repoRoot, "symptoms");
  const symptomPages = readdirSync(symptomDir).filter((name) => name.endsWith(".html"));
  const pagesWithFlow = [];
  const expectedImages = [
    "../image/flow-medical-interview-form-768.webp",
    "../image/consultation-scene-768.webp",
    "../image/flow-movement-assessment-768.webp",
    "../image/consultation-scene-768.webp",
    "../image/flow-treatment-session-768.webp",
    "../image/treatment-stretch-768.webp"
  ];

  for (const fileName of symptomPages) {
    const symptomHtml = readFileSync(path.join(symptomDir, fileName), "utf8");
    assert.doesNotMatch(symptomHtml, /ご相談から施術までの(?:<br>)?イメージ/, `${fileName} should remove the old visual guide heading`);
    assert.doesNotMatch(symptomHtml, /<section class="visual-guide">/, `${fileName} should remove the old visual guide section`);
    assert.match(symptomHtml, /<link rel="stylesheet" href="site-flow\.css">/, `${fileName} should include copied top-page flow styles`);

    const flowStart = symptomHtml.indexOf('<section id="flow" class="flow-slider"');
    if (flowStart < 0) continue;
    pagesWithFlow.push(fileName);

    const flowEnd = symptomHtml.indexOf("</section>", flowStart);
    const flowBlock = symptomHtml.slice(flowStart, flowEnd + "</section>".length);
    assert.match(flowBlock, /aria-labelledby="flow-title" data-flow-slider>/, `${fileName} should use the top-page flow slider structure`);
    assert.match(flowBlock, /<h2 id="flow-title" class="flow-slider__title">当院での施術の流れ<\/h2>/, `${fileName} should use the top-page flow title`);
    assert.match(flowBlock, /写真は左右にスライドできます/, `${fileName} should include the mobile slide hint`);
    assert.match(flowBlock, /<p class="flow-swipe-hint">写真は左右にスライドできます<span class="flow-swipe-arrow" aria-hidden="true">&gt;<\/span><\/p>/, `${fileName} should include the unified swipe hint arrow`);
    assert.equal([...flowBlock.matchAll(/\bdata-flow-slide\b/g)].length, 6, `${fileName} should include six flow slides`);
    assert.equal([...flowBlock.matchAll(/\bdata-flow-dot\b/g)].length, 6, `${fileName} should include six flow dots`);
    assert.match(flowBlock, /data-flow-prev[^>]*aria-label="前のステップを見る"/, `${fileName} should include the previous button`);
    assert.match(flowBlock, /data-flow-next[^>]*aria-label="次のステップを見る"/, `${fileName} should include the next button`);

    for (const src of expectedImages) {
      assert.match(flowBlock, new RegExp(`src="${escapeRegExp(src)}"`), `${fileName} should use relative image path ${src}`);
    }
  }

  assert.equal(pagesWithFlow.length, 24, "all symptom detail pages should receive the flow slider");

  const flowCss = readFileSync(path.join(symptomDir, "site-flow.css"), "utf8");
  const headerJs = readFileSync(path.join(symptomDir, "site-header.js"), "utf8");
  assert.match(flowCss, /Copied from \.\.\/styles\/main\.css top-page flow slider styles/);
  assert.match(flowCss, /\.flow-slider\s*\{[\s\S]*padding:\s*72px 16px 84px;[\s\S]*overflow:\s*hidden;/);
  assert.match(flowCss, /\.flow-slider__media\s*\{[\s\S]*aspect-ratio:\s*4\s*\/\s*3;[\s\S]*overflow:\s*hidden;/);
  assert.match(flowCss, /\.flow-slider\.is-enhanced \.flow-slide:not\(\.is-active\)\s*\{[\s\S]*display:\s*none;/);
  assert.match(flowCss, /@media \(max-width: 640px\)\s*\{[\s\S]*\.flow-slider__arrow\s*\{[\s\S]*width:\s*44px;[\s\S]*height:\s*44px;/);
  assert.match(flowCss, /\.flow-swipe-hint\s*\{[\s\S]*text-align:\s*center;[\s\S]*font-size:\s*0\.9rem;[\s\S]*margin-top:\s*12px;[\s\S]*color:\s*#1f5f4a;/);
  assert.match(flowCss, /\.flow-swipe-arrow\s*\{[\s\S]*display:\s*inline-block;[\s\S]*margin-left:\s*8px;[\s\S]*animation:\s*swipeArrow 1\.2s ease-in-out infinite;/);
  assert.match(flowCss, /@keyframes swipeArrow\s*\{[\s\S]*0%\s*\{\s*transform:\s*translateX\(0\);\s*opacity:\s*0\.5;\s*\}[\s\S]*50%\s*\{\s*transform:\s*translateX\(8px\);\s*opacity:\s*1;\s*\}[\s\S]*100%\s*\{\s*transform:\s*translateX\(0\);\s*opacity:\s*0\.5;\s*\}/);
  assert.doesNotMatch(flowCss, /flow-slider__hint/);
  assert.match(headerJs, /const setupFlowSlider = \(\) =>/);
  assert.match(headerJs, /document\.querySelectorAll\('\[data-flow-slider\]'\)/);
  assert.match(headerJs, /slider\.classList\.add\('is-enhanced'\)/);
  assert.match(headerJs, /event\.key === 'ArrowLeft'/);
  assert.match(headerJs, /event\.key === 'ArrowRight'/);
  assert.match(headerJs, /setupFlowSlider\(\);/);
});

test("symptom related cards show an absolute arrow affordance without extra CTA text", () => {
  const symptomDir = path.join(repoRoot, "symptoms");
  const arrowPattern = /<span class="related-symptom-card__arrow" aria-hidden="true">›<\/span>/g;

  assert.match(buildBlogScript, /\.related-symptom-card\{[^}]*position:relative[^}]*padding:1rem 3\.25rem 1rem 1rem/);
  assert.match(buildBlogScript, /\.related-symptom-card__arrow\{[^}]*position:absolute[^}]*right:1rem[^}]*top:50%/);
  assert.match(buildBlogScript, /\.related-symptom-card:hover \.related-symptom-card__arrow,/);
  assert.match(buildBlogScript, /@media\(max-width:640px\)\{\.related-symptom-card\{padding-right:3rem\}\.related-symptom-card__arrow\{right:\.85rem;width:30px;height:30px;font-size:20px\}\}/);

  for (const fileName of readdirSync(symptomDir).filter((name) => name.endsWith(".html"))) {
    const symptomHtml = readFileSync(path.join(symptomDir, fileName), "utf8");
    const relatedSection = symptomHtml.match(/<section class="related-symptoms">[\s\S]*?<\/section>/)?.[0] ?? "";
    const cardCount = (relatedSection.match(/class="related-symptom-card"/g) ?? []).length;
    const arrowCount = (relatedSection.match(arrowPattern) ?? []).length;

    assert.ok(cardCount > 0, `${fileName} should render related symptom cards`);
    assert.equal(arrowCount, cardCount, `${fileName} should add one arrow to each related symptom card`);
    assert.doesNotMatch(relatedSection, />詳しく見る<|>症状ページを見る</, `${fileName} should not add CTA text`);
  }
});

test("blog sources and generated posts avoid strong medical guarantee wording", () => {
  const checkedFiles = [
    ...readdirSync(path.join(repoRoot, "content", "source"))
      .filter((name) => name.endsWith(".md"))
      .map((name) => path.join(repoRoot, "content", "source", name)),
    path.join(repoRoot, "data", "blog-posts.json")
  ];
  const strongPatterns = [
    /根本改善/,
    /唯一の方法/,
    /確実に楽/,
    /再貯留を防ぎます/,
    /再発を防ぎます/,
    /排液を促します/,
    /効く理由/
  ];

  for (const filePath of checkedFiles) {
    const text = readFileSync(filePath, "utf8");
    for (const pattern of strongPatterns) {
      assert.doesNotMatch(text, pattern, `${path.relative(repoRoot, filePath)} should avoid ${pattern}`);
    }
  }
});

test("LP removes the mid-page helpful information blog preview", () => {
  assert.doesNotMatch(html, /id="blog-section"/);
  assert.doesNotMatch(html, /お役立ち情報・ブログ/);
  assert.doesNotMatch(html, /id="blog-preview-container"/);
  assert.doesNotMatch(html, /class="blog-b-card group"/);
});

test("LP keeps only one first-visit policy section and removes the duplicate article block", () => {
  const firstVisitHeadingCount = html.match(/初回で行うこと \/ 行わないこと/g)?.length ?? 0;

  assert.equal(firstVisitHeadingCount, 1, "first-visit reassurance should appear only once");
  assert.equal(html.includes('class="initial-visit-guide"'), false, "duplicate first-visit image section should be removed");
  assert.equal(html.includes("来院前に確認されやすいこと"), false, "mid-page article detour should be removed");
});

test("LP places the first-visit policy directly after the flow section after removing comparison", () => {
  const flowIndex = html.indexOf('id="flow"');
  const firstVisitIndex = html.indexOf('id="first-visit-policy"');
  const profileIndex = html.indexOf('id="profile"');
  const flowToFirstVisit = html.slice(flowIndex, firstVisitIndex);

  assert.ok(flowIndex > -1, "flow section should exist");
  assert.ok(firstVisitIndex > -1, "first-visit policy section should exist");
  assert.ok(profileIndex > -1, "profile section should exist");
  assert.ok(flowIndex < firstVisitIndex, "first-visit policy should appear after flow");
  assert.ok(firstVisitIndex < profileIndex, "first-visit policy should appear before profile");
  assert.doesNotMatch(flowToFirstVisit, /id="comparison"|選び方の目安|整形外科・一般的な整体・当院の違い/);
  assert.match(html, /#first-visit-policy,\s*#profile\s*{[\s\S]*background:\s*#fff !important;[\s\S]*background-image:\s*none !important;/);
});

test("LP first-visit policy uses the PNG icon set accessibly", () => {
  const firstVisit = getTopLevelSectionSlice("first-visit-policy");
  const informativeIcons = [
    ["/img/first-visit/illust-check.png", "お悩みと生活動作を確認する問診票のイラスト"],
    ["/img/first-visit/illust-posture.png", "姿勢や歩き方、関節の動きを確認するイラスト"],
    ["/img/first-visit/illust-plan.png", "施術方針を説明する書類のイラスト"],
    ["/img/first-visit/illust-no-force.png", "説明なしに強い施術をしないことを表すイラスト"],
    ["/img/first-visit/illust-no-exercise.png", "無理な運動を押しつけないことを表すイラスト"],
    ["/img/first-visit/illust-no-contract.png", "その場で長期契約を迫らないことを表すイラスト"]
  ];
  const decorativeIcons = [
    "/img/first-visit/icon-leaf-heart.png",
    "/img/first-visit/icon-leaf.png",
    "/img/first-visit/leaf-left.png",
    "/img/first-visit/leaf-right.png"
  ];

  assert.doesNotMatch(firstVisit, /image\/initial-visit-what-we-do\.webp/);

  for (const [src, alt] of informativeIcons) {
    const imgTag = firstVisit.match(new RegExp(`<img\\b(?=[^>]*\\bsrc="${escapeRegExp(src)}")[^>]*>`, "i"))?.[0];

    assert.ok(imgTag, `${src} should be rendered in the first-visit policy section`);
    assert.match(imgTag, new RegExp(`\\balt="${escapeRegExp(alt)}"`));
    assert.match(imgTag, /\bloading="lazy"/);
    assert.ok(existsSync(path.join(repoRoot, src.slice(1))), `${src} should exist in the repo`);
  }

  for (const src of decorativeIcons) {
    const imgTag = firstVisit.match(new RegExp(`<img\\b(?=[^>]*\\bsrc="${escapeRegExp(src)}")[^>]*>`, "i"))?.[0];

    assert.ok(imgTag, `${src} should be rendered as a decorative image`);
    assert.match(imgTag, /\balt=""/);
    assert.match(imgTag, /\baria-hidden="true"/);
    assert.ok(existsSync(path.join(repoRoot, src.slice(1))), `${src} should exist in the repo`);
  }
});

test("LP first-visit policy keeps six detailed item rows", () => {
  const firstVisit = getTopLevelSectionSlice("first-visit-policy");
  const doCard = firstVisit.slice(firstVisit.indexOf('class="card card-do"'), firstVisit.indexOf('class="card card-dont"'));
  const dontCard = firstVisit.slice(firstVisit.indexOf('class="card card-dont"'));
  const expectedRows = [
    ["1", "お悩みと<br>生活動作の確認", "いつから、どこが、どんな時につらいのかを丁寧にお伺いします。", "/img/first-visit/illust-check.png"],
    ["2", "姿勢・歩き方・<br>関節の動きの確認", "お体の状態を検査し、原因を見つけていきます。", "/img/first-visit/illust-posture.png"],
    ["3", "施術方針の説明", "検査結果をもとに、わかりやすく今後の方針や見通しをご説明します。", "/img/first-visit/illust-plan.png"],
    ["1", "説明なしに<br>強い施術をしない", "お体の状態を確認し、同意を得てから施術を行います。", "/img/first-visit/illust-no-force.png"],
    ["2", "無理な運動を<br>押しつけない", "お一人おひとりの状態に合わせて、できることからご提案します。", "/img/first-visit/illust-no-exercise.png"],
    ["3", "その場で長期契約を<br>迫らない", "必要な方に必要なご提案をします。ご納得いただいてからご検討ください。", "/img/first-visit/illust-no-contract.png"]
  ];

  assert.doesNotMatch(firstVisit, /first-visit-icons/);
  assert.match(firstVisit, /class="columns"/);
  assert.match(firstVisit, /<span class="card-title">初回で行うこと<\/span>/);
  assert.match(firstVisit, /<span class="card-title">当院がしないこと<\/span>/);
  assert.equal((firstVisit.match(/class="item"/g) ?? []).length, 6, "first-visit policy should render six item rows");
  assert.equal((doCard.match(/class="item"/g) ?? []).length, 3, "left card should render three item rows");
  assert.equal((dontCard.match(/class="item"/g) ?? []).length, 3, "right card should render three item rows");

  for (const [number, title, description, src] of expectedRows) {
    const pattern = new RegExp(
      `<div class="item">\\s*<span class="item-num">${number}<\\/span>\\s*<div class="item-body">\\s*<p class="item-title">${escapeRegExp(title)}<\\/p>\\s*<p class="item-desc">${escapeRegExp(description)}<\\/p>\\s*<\\/div>\\s*<div class="item-img">\\s*<img\\b(?=[^>]*\\bsrc="${escapeRegExp(src)}")[^>]*\\bloading="lazy"[^>]*>\\s*<\\/div>\\s*<\\/div>`,
      "i"
    );

    assert.match(firstVisit, pattern, `${src} should be paired with its own numbered item`);
  }
});

test("LP first-visit icon CSS preserves desktop and mobile layout", () => {
  assert.match(mainCss, /\.columns\s*{[\s\S]*display:\s*grid;[\s\S]*grid-template-columns:\s*1fr 1fr;[\s\S]*gap:\s*16px;/);
  assert.match(mainCss, /\.card\s*{[\s\S]*border-radius:\s*16px;[\s\S]*padding:\s*20px 20px 16px;/);
  assert.match(mainCss, /\.item\s*{[\s\S]*display:\s*flex;[\s\S]*align-items:\s*flex-start;[\s\S]*gap:\s*12px;[\s\S]*padding:\s*12px 0;[\s\S]*border-bottom:\s*1px solid;/);
  assert.match(mainCss, /\.item-num\s*{[\s\S]*width:\s*28px;[\s\S]*height:\s*28px;[\s\S]*border-radius:\s*50%;[\s\S]*font-size:\s*14px;[\s\S]*font-weight:\s*700;[\s\S]*display:\s*flex;[\s\S]*align-items:\s*center;[\s\S]*justify-content:\s*center;[\s\S]*flex-shrink:\s*0;[\s\S]*margin-top:\s*2px;/);
  assert.match(mainCss, /\.item-body\s*{[\s\S]*flex:\s*1;[\s\S]*min-width:\s*0;/);
  assert.match(mainCss, /\.item-title\s*{[\s\S]*font-size:\s*15px;[\s\S]*font-weight:\s*700;[\s\S]*line-height:\s*1\.5;[\s\S]*margin-bottom:\s*4px;/);
  assert.match(mainCss, /\.item-desc\s*{[\s\S]*font-size:\s*12px;[\s\S]*line-height:\s*1\.7;/);
  assert.match(mainCss, /\.item-img\s*{[\s\S]*width:\s*64px;[\s\S]*height:\s*64px;[\s\S]*flex-shrink:\s*0;[\s\S]*display:\s*flex;[\s\S]*align-items:\s*center;[\s\S]*justify-content:\s*center;/);
  assert.match(mainCss, /\.item-img img\s*{[\s\S]*width:\s*100%;[\s\S]*height:\s*100%;[\s\S]*object-fit:\s*contain;[\s\S]*display:\s*block;/);
  assert.match(mainCss, /\.leaf-deco img\s*{[\s\S]*width:\s*32px;[\s\S]*height:\s*auto;[\s\S]*object-fit:\s*contain;/);
  assert.match(mainCss, /\.footer-icon\s*{[\s\S]*width:\s*28px;[\s\S]*height:\s*28px;[\s\S]*flex-shrink:\s*0;/);
  assert.match(mainCss, /\.footer-icon img\s*{[\s\S]*width:\s*100%;[\s\S]*height:\s*100%;[\s\S]*object-fit:\s*contain;[\s\S]*display:\s*block;/);
  assert.match(mainCss, /@media\s*\(max-width:\s*600px\)\s*{[\s\S]*\.columns\s*{[\s\S]*grid-template-columns:\s*1fr;[\s\S]*\.item-img\s*{[\s\S]*width:\s*56px;[\s\S]*height:\s*56px;[\s\S]*\.leaf-deco img\s*{[\s\S]*width:\s*24px;/);
});

test("LP keeps the knee-pain specialty axis and presents the updated three-step method", () => {
  const hero = getSectionSlice(
    '<section class="pt-28 pb-16 md:pt-40 md:pb-24 bg-white overflow-hidden relative hero-fixed hz-hero">',
    'id="troubles"'
  );
  const metaDescription = broadenedMetaDescription;

  assert.match(html, new RegExp(`<title>${escapeRegExp(siteTitle)}<\\/title>`));
  assert.match(html, new RegExp(`<meta name="description" content="${metaDescription}">`));
  assert.match(html, new RegExp(escapeRegExp(siteTitle)));
  assert.match(hero, /痛みに慣れようとしている[\s\S]*自分に、/);
  assert.match(hero, /気づいていますか。/);
  assert.match(hero, /それは慣れたのではなく、諦めているだけかもしれない。/);
  assert.match(hero, /もう一度、自分の体と向き合う時間をつくりませんか。/);
  assert.match(html, /膝の痛みは、痛む場所だけを見ても分からないことがあります/);
  assert.match(html, /膝だけを揉んで終わるのではなく/);
  assert.match(html, /痛みがぶり返す「3つの原因」/);
  assert.equal(html.includes('id="three-step-care"'), false, "standalone three-step section should be removed");
  assert.equal(
    html.includes("当院が提供する「3つの柱」の正しい順序"),
    false,
    "duplicate three-pillar ordering block should be removed"
  );
  assert.match(html, /痛みが戻らない体を、一緒に作ります。/);
  assert.match(html, /「真犯人」の可動域を解放する/);
  assert.match(html, /眠った「サボり筋」を目覚めさせる/);
  assert.match(html, /再発しない「体の使い方」を身につける/);
  assert.match(html, /繰り返しに、終止符を/);
  assert.match(html, /無料相談・ご予約はこちら/);
  assert.doesNotMatch(html, /原因を整理する3ステップ/);
  assert.doesNotMatch(html, /image\/step1_swirl\.webp/);
  assert.doesNotMatch(html, /image\/step2_dumbbell\.webp/);
  assert.doesNotMatch(html, /image\/step3_footprint\.webp/);
});

test("LP removes the requested hero copy and top gallery explanation cards", () => {
  const hero = getSectionSlice(
    '<section class="pt-28 pb-16 md:pt-40 md:pb-24 bg-white overflow-hidden relative hero-fixed hz-hero">',
    'id="troubles"'
  );
  const gallery = getTopLevelSectionSlice("gallery");

  assert.doesNotMatch(hero, /階段の上り下り、歩き始め、立ち上がり、長く歩いた後の膝の痛み。/);
  assert.doesNotMatch(hero, /膝だけを揉むのではなく、硬さを緩め、必要な筋力を育て/);
  assert.doesNotMatch(hero, /柏市で膝痛にお悩みの方は、今の状態とこれからの歩みを一緒に整理していきましょう。/);
  assert.doesNotMatch(hero, /階段の上り下りがつらい/);
  assert.doesNotMatch(hero, /歩き始めに膝が痛む/);
  assert.doesNotMatch(hero, /膝に水が溜まる/);
  assert.doesNotMatch(hero, /膝をかばって腰や股関節も気になる/);
  assert.match(gallery, /院内の雰囲気/);
  assert.match(gallery, /aria-label="院内ギャラリー"/);
  assert.match(gallery, /image\/clinic-exterior-wide-768\.webp/);
  assert.doesNotMatch(gallery, /相談しやすさと落ち着いた雰囲気が伝わるよう/);
  assert.doesNotMatch(gallery, /まずはお話を丁寧にうかがいます/);
  assert.doesNotMatch(gallery, /状態を見ながら分かりやすくご説明します/);
});

test("LP keeps price section after the gallery when the symptom finder is removed", () => {
  const galleryIndex = html.indexOf('id="gallery"');
  const priceIndex = html.indexOf('id="price"');

  assert.ok(galleryIndex > -1, "gallery section should exist");
  assert.ok(priceIndex > -1, "price section should exist");
  assert.ok(galleryIndex < priceIndex, "price section should appear after the gallery");
  assert.doesNotMatch(html, /href="blog\/posts\/knee-pain-stairs-guide\/"/);
  assert.doesNotMatch(html, /href="blog\/posts\/walking-start-knee-pain-cause\/"/);
});

test("LP removes the knee symptom finder section", () => {
  assert.doesNotMatch(html, /id="knee-type-nav"/);
  assert.doesNotMatch(html, /症状から探す/);
  assert.doesNotMatch(html, /膝の痛み・不調を探す/);
  assert.doesNotMatch(html, /症状の出方や場所から、あなたに合った情報ページをすぐに見つけられます。/);
  assert.doesNotMatch(html, /id="symptoms"/);
});

test("LP splits CTA roles between mid-page consultation and final reservation", () => {
  const priceSection = getSectionSlice('id="price"', 'id="faq"');
  const accessSection = getSectionSlice('id="access"', "<footer");

  assert.match(priceSection, /お電話でのご予約はこちら/);
  assert.match(priceSection, /LINEで1分かんたん仮予約/);
  assert.match(priceSection, /会員登録不要/);
  assert.match(priceSection, /現金/);
  assert.match(priceSection, /各種クレジットカード/);
  assert.match(priceSection, /PayPay/);
  assert.doesNotMatch(priceSection, /LINEで予約する/);
  assert.match(accessSection, /柏駅西口から徒歩約8分/);
  assert.match(accessSection, /院名/);
  assert.match(accessSection, /整体院ひざこぞう/);
  assert.match(accessSection, /千葉県柏市あけぼの4-4-3 BoaSorte柏305/);
  assert.match(accessSection, /マンション内の完全予約制整体院/);
  assert.match(accessSection, /04-7114-3274/);
  assert.match(accessSection, /9:00〜19:00/);
  assert.match(accessSection, /受付時間/);
  assert.match(accessSection, /月/);
  assert.match(accessSection, /土/);
  assert.match(accessSection, /日曜/);
  assert.match(accessSection, /詳しいアクセスを見る/);
  assert.match(accessSection, /href="access\.html"/);
  assert.match(accessSection, /<form id="contactForm"/);
  assert.match(accessSection, /メールフォームを送信する/);
  assert.match(accessSection, /LINEで相談する/);
  assert.match(accessSection, /予約完了ではありません/);
  assert.equal((accessSection.match(/<article\b/g) ?? []).length, 0, "LP access should not split simple access into multiple cards");
  assert.equal((accessSection.match(/data-access-summary-card/g) ?? []).length, 1, "LP access should use one simple access block");
  assert.match(mainCss, /\.lp-access-summary\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*minmax\(320px,\s*0\.92fr\);/);
  assert.match(mainCss, /\.lp-access-info__row::before\s*\{[\s\S]*content:\s*"\/";/);
  assert.match(mainCss, /\.lp-access-hours\s*\{[\s\S]*background:\s*#f5f5f6;/);
  assert.doesNotMatch(accessSection, /<iframe/);
  assert.doesNotMatch(accessSection, /access-step1-480\.webp/);
});

test("LP gives FAQ and access enough breathing room before the final contact flow", () => {
  const faqIndex = html.indexOf('id="faq"');
  const accessIndex = html.indexOf('id="access"');

  assert.ok(faqIndex > -1, "FAQ section should exist");
  assert.ok(accessIndex > faqIndex, "access should still follow FAQ");
  assert.match(mainCss, /#faq\s*\{[\s\S]*padding-bottom:\s*clamp\(4\.75rem,\s*8vw,\s*7rem\)\s*!important;/);
  assert.match(mainCss, /#faq\s*\{[\s\S]*margin-bottom:\s*clamp\(1\.25rem,\s*3vw,\s*2\.5rem\)\s*!important;/);
  assert.match(mainCss, /#access\s*\{[\s\S]*padding-top:\s*clamp\(4\.75rem,\s*8vw,\s*7rem\)\s*!important;/);
  assert.match(mainCss, /@media \(max-width:\s*640px\)\s*\{[\s\S]*#faq\s*\{[\s\S]*padding-bottom:\s*4rem\s*!important;[\s\S]*#access\s*\{[\s\S]*padding-top:\s*4rem\s*!important;/);
});

test("LP renders Google review slider from provided real review data", () => {
  const voiceIndex = html.indexOf('class="voice-trust"');
  const googleIndex = html.indexOf('class="google-reviews"');
  const reasonsIndex = html.indexOf('id="knee-msm-reasons"');
  const reviewSection = getSectionSlice('class="google-reviews"', 'id="knee-msm-reasons"');
  const expectedNames = ["梶谷武志様", "K様", "平川智江美様", "Kyoko T", "F.M.様", "Rit K様", "K.K.様", "NAO FUCHI様"];

  assert.ok(voiceIndex > -1, "patient voice section should exist");
  assert.ok(googleIndex > voiceIndex, "Google review strip should be directly after patient voices");
  assert.ok(googleIndex < reasonsIndex, "Google review strip should stay before the next content section");
  assert.doesNotMatch(reviewSection, /GOOGLE REVIEW/);
  assert.doesNotMatch(reviewSection, /Google口コミでもご評価いただいています/);
  assert.doesNotMatch(reviewSection, /実際にご来院いただいた方からのお声の一部をご紹介します。/);
  assert.match(reviewSection, /data-google-review-list/);
  assert.match(reviewSection, /data-google-review-track/);
  assert.match(reviewSection, /data-google-review-prev/);
  assert.match(reviewSection, /data-google-review-next/);
  assert.match(reviewSection, /href="https:\/\/g\.page\/r\/CblTNpd2gz_7EBM"/);
  assert.doesNotMatch(reviewSection, /<article class="google-review-card"/, "cards should be generated by JavaScript");
  assert.doesNotMatch(reviewSection, /投稿日|2026|2025|2024|2023/);
  assert.doesNotMatch(reviewSection, /必ず改善|治る|完治/);
  assert.equal((mainJs.match(/name:\s*"/g) ?? []).filter(Boolean).length >= expectedNames.length, true);
  for (const name of expectedNames) {
    assert.match(mainJs, new RegExp(escapeRegExp(`name: "${name}"`)), `googleReviews should include ${name}`);
  }
  assert.match(mainJs, /name:\s*"NAO FUCHI様",\s*rating:\s*4/);
  assert.match(mainJs, /const googleReviews = \[/);
  assert.match(mainJs, /renderGoogleReviewCard/);
  assert.match(mainJs, /renderGoogleStars/);
  assert.match(mainJs, /続きを読む/);
  assert.match(mainJs, /閉じる/);
  assert.match(mainJs, /data-google-review-toggle/);
  assert.match(mainJs, /aria-expanded="false"/);
  assert.match(mainJs, /classList\.toggle\('is-expanded'\)/);
  assert.doesNotMatch(mainJs, /google-review-card__link/);
  assert.match(mainJs, /Google口コミ/);
  assert.match(mainCss, /\.google-reviews__track\s*\{[\s\S]*overflow-x:\s*auto;/);
  assert.match(mainCss, /\.google-reviews__track\s*\{[\s\S]*scroll-snap-type:\s*inline mandatory;/);
  assert.match(mainCss, /\.google-review-card__text\s*\{[\s\S]*-webkit-line-clamp:\s*5;/);
  assert.match(mainCss, /\.google-review-card\.is-expanded\s+\.google-review-card__text\s*\{[\s\S]*-webkit-line-clamp:\s*unset;/);
  assert.match(mainCss, /\.google-review-card__toggle\s*\{/);
  assert.match(mainJs, /setupGoogleReviewScroller\(\)/);
});

test("LP FAQ keeps six lightweight reservation questions and links to the detail page", () => {
  const expectedQuestions = [
    "初回はどのくらい時間がかかりますか？",
    "痛い施術ですか？",
    "病院に通いながらでも大丈夫ですか？",
    "どのくらいのペースで通えばいいですか？",
    "どんな服装で行けばいいですか？",
    "回数券を無理にすすめられることはありますか？"
  ];
  const expectedAnswers = [
    "初回は約90分を目安に、カウンセリング・状態確認・施術・今後のご説明を行います。お身体の状態を丁寧に確認するため、少し長めにお時間をいただいています。",
    "強く揉んだり、無理に動かしたりする施術ではありません。状態を確認しながら、安心して受けていただける範囲で進めます。",
    "はい、大丈夫です。病院での検査や治療を否定せず、併用しながらできることを一緒に考えていきます。",
    "症状の強さや生活での負担によって変わります。初回で状態を確認したうえで、無理のない通院ペースをご提案します。必要以上に通わせるようなご案内はしません。",
    "膝や股関節まわりを動かしやすい服装がおすすめです。スカートや硬いジーンズより、ゆとりのあるズボンや動きやすい服装だと確認しやすくなります。",
    "無理なご提案や押し売りはしません。必要な通院の目安はお伝えしますが、通い方はご本人の希望やご都合を確認しながら決めていきます。"
  ];
  const faqSection = getTopLevelSectionSlice("faq");

  const renderedQuestions = [...faqSection.matchAll(/<dt>\s*<span>Q\.<\/span>\s*([^<]+)\s*<\/dt>/g)].map(
    (match) => match[1].trim()
  );

  assert.deepEqual(renderedQuestions, expectedQuestions, "LP FAQ should contain the six requested questions in order");
  for (const answer of expectedAnswers) {
    assert.match(faqSection, new RegExp(escapeRegExp(answer)));
  }
  assert.match(faqSection, /その他のよくある質問を見る/);
  assert.match(faqSection, /href="faq\.html"/);
  assert.equal((faqSection.match(/<details\b/g) ?? []).length, 0, "LP FAQ should not use heavy one-question cards");
  assert.equal((faqSection.match(/<dt>/g) ?? []).length, 6, "LP FAQ should render exactly six lightweight list questions");
  assert.equal((faqSection.match(/class="lp-faq-item"/g) ?? []).length, 6, "LP FAQ items should use compact custom spacing");
  assert.match(mainCss, /#faq dt\s*\{[\s\S]*color:\s*#15803d/);
  assert.match(mainCss, /#faq dt\s*\{[\s\S]*font-size:\s*1\.12rem/);
  assert.match(mainCss, /#faq dt span\s*\{[\s\S]*color:\s*#2563eb/);
  assert.match(mainCss, /#faq dd\s*\{[\s\S]*color:\s*#111827/);
  assert.match(mainCss, /#faq dd span\s*\{[\s\S]*color:\s*#dc2626/);
  assert.match(mainCss, /#faq \.lp-faq-item\s*\{[\s\S]*padding:\s*0\.9rem 0/);
  assert.match(mainCss, /@media \(max-width:\s*640px\)\s*\{[\s\S]*#faq \.lp-faq-item\s*\{[\s\S]*padding:\s*0\.78rem 0/);

  const faqSchema = getJsonLdBlocks("FAQPage")[0];

  assert.ok(faqSchema, "FAQ schema should exist");
  assert.deepEqual(
    faqSchema.mainEntity.map((entry) => entry.name),
    expectedQuestions,
    "FAQ schema should stay aligned with the rendered FAQ questions"
  );
  assert.deepEqual(
    faqSchema.mainEntity.map((entry) => entry.acceptedAnswer.text),
    expectedAnswers,
    "FAQ schema answers should stay aligned with the rendered FAQ answers"
  );
  assert.doesNotMatch(faqSection, /予約はLINEでできますか？|公式LINEからご予約いただけます|変形性膝関節症と言われても受けられますか？|健康保険は使えますか？|駐車場はありますか？|予約のキャンセル・変更はできますか？/);
  assert.match(html, /LINEからご希望日時を送ってください。空き状況を確認して、こちらから返信いたします。/);
});

test("LP director profile is compact on mobile and groups personal notes after the career", () => {
  const profile = getTopLevelSectionSlice("profile");
  const careerIndex = profile.indexOf("経歴・資格");
  const privateIndex = profile.indexOf("院長のこと、もう少し");
  const combinedStoryIndex = profile.indexOf("私が痛みの専門家を目指したわけと施術への想い");

  assert.ok(careerIndex > -1, "career section should exist");
  assert.ok(privateIndex > careerIndex, "personal notes should be directly after the career block");
  assert.ok(combinedStoryIndex > privateIndex, "story and treatment policy should follow personal notes as one section");
  assert.equal((profile.match(/director-profile__section-title">施術への想い/g) ?? []).length, 0, "treatment policy should not be a separate section title");
  assert.match(profile, /学生時代の膝痛との闘い/);
  assert.match(profile, /20歳でのクローン病経験/);
  assert.match(profile, /不安ゼロの空間を大切にしています/);

  assert.match(mainCss, /@media \(max-width:\s*600px\)\s*\{[\s\S]*\.director-profile__career li\s*\{[\s\S]*grid-template-columns:\s*5\.25rem minmax\(0,\s*1fr\);[\s\S]*gap:\s*0\.6rem;[\s\S]*padding:\s*0\.55rem 0;/);
  assert.match(mainCss, /@media \(max-width:\s*600px\)\s*\{[\s\S]*\.director-profile__section \+ \.director-profile__section\s*\{[\s\S]*margin-top:\s*1\.45rem;/);
});

test("FAQ and access detail pages exist with SEO, detail links, and LINE reservation CTAs", () => {
  const faqHtml = readPageIfExists("faq.html");
  const accessHtml = readPageIfExists("access.html");
  const symptomsIndexHtml = readPageIfExists("symptoms/index.html");

  assert.equal(existsSync(path.join(repoRoot, "faq.html")), true, "faq.html should exist");
  assert.equal(existsSync(path.join(repoRoot, "access.html")), true, "access.html should exist");
  assert.equal(existsSync(path.join(repoRoot, "symptoms/index.html")), true, "symptoms/index.html should exist");

    assert.match(faqHtml, /<title>よくある質問｜柏市の足腰専門整体院ひざこぞう<\/title>/);
    assert.match(faqHtml, /<meta property="og:title" content="よくある質問｜柏市の足腰専門整体院ひざこぞう">/);
  assert.doesNotMatch(faqHtml, /柏市の膝痛専門整体院/);
  assert.match(faqHtml, /<meta name="description" content="整体院ひざこぞうによくいただくご質問をまとめました。初回の流れ、服装、施術内容、通院回数、料金、予約方法、アクセスについてご確認いただけます。">/);
  assert.match(faqHtml, /<link rel="canonical" href="https:\/\/hizakozou\.jp\/faq\.html">/);
  assert.match(faqHtml, /"@type": "FAQPage"/);
    for (const category of ["初めての方へ", "施術について", "足腰の痛み・症状について", "通院回数・料金について", "予約・キャンセルについて", "アクセス・設備について"]) {
      assert.match(faqHtml, new RegExp(escapeRegExp(category)));
    }
  assert.doesNotMatch(faqHtml, /膝痛・症状について/);
  assert.match(faqHtml, /\.faq-card summary\s*\{[\s\S]*font-size:\s*clamp\(1\.16rem,\s*2\.4vw,\s*1\.45rem\)/);
  assert.match(faqHtml, /\.faq-card summary\s*\{[\s\S]*color:\s*#15803d/);
  assert.match(faqHtml, /\.faq-card summary b\s*\{[\s\S]*font-size:\s*1\.15em/);
  assert.match(faqHtml, /\.faq-card summary b\s*\{[\s\S]*color:\s*#2563eb/);
  assert.match(faqHtml, /\.faq-card summary i\s*\{[\s\S]*color:\s*#15803d/);
  assert.match(faqHtml, /\.faq-card p\s*\{[\s\S]*color:\s*#111827/);
  for (const movedQuestion of ["健康保険は使えますか？", "駐車場はありますか？", "予約のキャンセル・変更はできますか？", "階段の下りで膝が痛いのはなぜですか？"]) {
    assert.match(faqHtml, new RegExp(escapeRegExp(movedQuestion)));
  }
  assert.match(faqHtml, /href="https:\/\/lin\.ee\/X01F2mP"/);

  assert.match(accessHtml, /<title>アクセス・道順｜柏駅西口徒歩約8分 整体院ひざこぞう<\/title>/);
  assert.match(accessHtml, /<meta name="description" content="柏駅西口から整体院ひざこぞうまでのアクセス・道順をご案内します。建物入口、エレベーター、駐車場、近隣コインパーキングについてもご確認いただけます。">/);
  assert.match(accessHtml, /<link rel="canonical" href="https:\/\/hizakozou\.jp\/access\.html">/);
  assert.match(accessHtml, /<header id="header" class="site-header">/);
  assert.match(accessHtml, /<nav class="site-nav" aria-label="メインナビゲーション">/);
  assert.match(accessHtml, /<button id="menuBtn" class="site-menu-toggle"/);
  assert.match(accessHtml, /<nav class="site-mobile-nav hidden" id="mobileNav"/);
  assert.doesNotMatch(accessHtml, /class="detail-header"/);
  assert.match(accessHtml, /href="index\.html#top"[\s\S]*ホーム/);
  assert.match(accessHtml, /href="blog\/"[\s\S]*コラム/);
  assert.match(accessHtml, /href="index\.html#access"[\s\S]*アクセス・予約/);
  for (const requiredCopy of ["店舗情報", "04-7114-3274", "9:00〜19:00", "日曜", "柏駅西口からの道順", "Googleマップ", "大きな地図で見る", "建物外観", "建物入口", "エレベーター", "305号室", "駐車場", "自転車", "迷った場合"]) {
    assert.match(accessHtml, new RegExp(escapeRegExp(requiredCopy)));
  }
  for (const alt of ["柏駅西口の写真", "駅から院までの道順写真", "柏駅西口から当院までの簡易マップ", "BoaSorte柏の建物玄関", "BoaSorte柏の建物外観", "305号室前の通路写真"]) {
    assert.match(accessHtml, new RegExp(`alt="${escapeRegExp(alt)}"`));
  }
  for (const imagePath of ["image/access-step2.webp", "image/access-step3.webp", "image/access-step4.webp", "image/access-step5.webp", "image/access-simple-map.webp", "image/access-entrance.webp", "image/access-exterior2.webp", "image/access-exterior3.webp"]) {
    assert.match(accessHtml, new RegExp(escapeRegExp(imagePath)));
  }
  assert.match(accessHtml, /class="access-route-scroller"/);
  assert.match(accessHtml, /class="access-card__body route-track"/);
  assert.match(accessHtml, /data-access-route-track/);
  assert.match(accessHtml, /data-access-route-prev[^>]*aria-label="前の道順写真を見る"/);
  assert.match(accessHtml, /data-access-route-next[^>]*aria-label="次の道順写真を見る"/);
  assert.match(accessHtml, /\.access-route-controls\s*\{[\s\S]*display:\s*flex/);
  assert.match(accessHtml, /\.access-route-arrow\s*\{[\s\S]*border-radius:\s*999px/);
  assert.match(accessHtml, /\.route-track\s*\{[\s\S]*overflow-x:\s*auto/);
  assert.match(accessHtml, /\.route-track\s*\{[\s\S]*scroll-snap-type:\s*x mandatory/);
  assert.match(accessHtml, /\.route-card\s*\{[\s\S]*flex:\s*0 0 min\(82vw,\s*440px\)/);
  assert.match(accessHtml, /\.route-card img[\s\S]*object-fit:\s*contain/);
  assert.match(accessHtml, /querySelector\('\[data-access-route-track\]'\)/);
  assert.match(accessHtml, /scrollBy\(\{\s*left:\s*direction \* scrollAmount,\s*behavior:\s*'smooth'\s*\}\)/);
  assert.match(accessHtml, /こちらがBoaSorte柏の建物玄関です/);
  assert.match(accessHtml, /href="https:\/\/lin\.ee\/X01F2mP"/);
  assert.match(accessHtml, /LINEで1分かんたん仮予約/);
  assert.match(accessHtml, /会員登録不要/);
  assert.match(accessHtml, /電話で確認する/);
  assert.match(accessHtml, /href="tel:0471143274"/);
  assert.match(accessHtml, /<iframe[\s\S]*整体院ひざこぞうへのアクセスマップ/);

  assert.match(symptomsIndexHtml, /<title>足腰の症状別ページ｜整体院ひざこぞう<\/title>/);
  assert.match(symptomsIndexHtml, /<h1 id="page-title">足腰の症状別ページ<\/h1>/);
  assert.match(symptomsIndexHtml, /<link rel="canonical" href="https:\/\/hizakozou\.jp\/symptoms\/">/);
    for (const [href, label] of [
      ["lower-back-pain.html", "腰痛"],
      ["sciatica.html", "坐骨神経痛"],
      ["spinal-stenosis.html", "脊柱管狭窄症"],
      ["lumbar-disc-herniation.html", "腰椎椎間板ヘルニア"],
      ["hip-osteoarthritis.html", "変形性股関節症"],
      ["plantar-fasciitis.html", "足底筋膜炎"]
    ]) {
      assert.match(symptomsIndexHtml, new RegExp(`href="${escapeRegExp(href)}"`));
      assert.match(symptomsIndexHtml, new RegExp(escapeRegExp(label)));
      assert.equal(existsSync(path.join(repoRoot, "symptoms", href)), true, `${href} should exist`);
    }
    for (const offAxis of ["frozen-shoulder.html", "shoulder-stiffness.html", "tmj.html"]) {
      assert.doesNotMatch(symptomsIndexHtml, new RegExp(`href="${escapeRegExp(offAxis)}"`));
      assert.match(readFileSync(path.join(repoRoot, "symptoms", offAxis), "utf8"), /<meta name="robots" content="noindex,follow">/);
    }
  });

test("staff profile page uses transplanted chrome and editable staff sections", () => {
  const staffHtml = readPageIfExists("staff.html");

  assert.equal(existsSync(path.join(repoRoot, "staff.html")), true, "staff.html should exist");
  assert.match(staffHtml, /<title>代表紹介｜整体院ひざこぞう<\/title>/);
  assert.match(staffHtml, /<link rel="canonical" href="https:\/\/hizakozou\.jp\/staff\.html">/);
  assert.match(staffHtml, /<header id="header" class="site-header">/);
  assert.match(staffHtml, /<nav class="site-nav" aria-label="メインナビゲーション">/);
  assert.match(staffHtml, /id="menuBtn" class="site-menu-toggle"/);
  assert.match(staffHtml, /<nav class="site-mobile-nav hidden" id="mobileNav"/);
  assert.match(staffHtml, /<footer class="hk-footer-section">/);
  assert.match(staffHtml, /<button type="button" class="page-top-button" aria-label="ページ上部へ戻る">/);
  assert.match(staffHtml, /<script src="scripts\/main\.js" defer><\/script>/);
  assert.match(staffHtml, /<script src="\/scripts\/tracking-config\.js" defer><\/script>/);
  assert.match(staffHtml, /<script src="\/scripts\/tracking\.js" defer><\/script>/);

  for (const [href, label] of [
    ["staff.html", "代表紹介"],
    ["index.html#knee-msm-reasons", "当院の特徴"],
    ["index.html#msm-method", "MSMメソッドとは？"],
    ["index.html#flow", "施術の流れ"],
    ["index.html#price", "料金"],
    ["index.html#access", "アクセス・予約"]
  ]) {
    assert.match(staffHtml, new RegExp(`href="${escapeRegExp(href)}"`), `staff page should link ${label}`);
    assert.match(staffHtml, new RegExp(escapeRegExp(label)), `staff page should show ${label}`);
  }

  for (const heading of [
    "代表紹介",
    "ごあいさつ",
    "院名「ひざこぞう」に込めた想い",
    "私が足腰の施術を大切にしている理由",
    "これまでの歩み・経歴",
    "施術で大切にしていること",
    "初めての方へ",
    "プロフィール",
    "ご予約・ご相談"
  ]) {
    assert.match(staffHtml, new RegExp(escapeRegExp(heading)), `staff page should include ${heading}`);
  }
  assert.doesNotMatch(staffHtml, /メディア実績や取り組みなど/);
  assert.doesNotMatch(staffHtml, /staff-note-grid|staff-note-card/);
  assert.doesNotMatch(staffHtml, /staff-profile__|staff-quote-list|staff-photo--portrait|staff-profile-simple__inner|staff-profile-simple__photo/);

  for (const phrase of [
    "整体院ひざこぞうで施術を担当している、川上卓哉です。",
    "どんな人が施術するのか",
    "子どもの頃の“ひざこぞう”",
    "膝・腰・股関節・足首",
    "腰痛や坐骨神経痛",
    "学生時代にサッカーで膝を痛め",
    "20歳の頃にはクローン病",
    "優しく、わかりやすく、無理に押しつけない",
    "この痛みとずっと付き合うしかない"
  ]) {
    assert.match(staffHtml, new RegExp(escapeRegExp(phrase)), `staff page should include human copy: ${phrase}`);
  }

  const greetingIndex = staffHtml.indexOf('id="staff-greeting-title"');
  const profileIndex = staffHtml.indexOf('class="staff-profile-simple staff-section"');
  const nameOriginIndex = staffHtml.indexOf('id="staff-name-title"');
  assert.ok(greetingIndex !== -1 && profileIndex !== -1 && nameOriginIndex !== -1);
  assert.ok(greetingIndex < profileIndex, "staff simple profile should follow the greeting section");
  assert.ok(profileIndex < nameOriginIndex, "staff simple profile should appear before the name-origin section");

  for (const label of ["名前：", "出身：", "資格・修了：", "施術歴：", "大切にしていること：", "好きなこと：", "得意なアドバイス内容：", "健康習慣："]) {
    assert.match(staffHtml, new RegExp(`<dt>${escapeRegExp(label)}<\\/dt>`), `staff page should include profile row ${label}`);
  }
  assert.match(staffHtml, /<section class="staff-profile-simple staff-section" aria-labelledby="staff-profile-title">/);
  assert.match(staffHtml, /class="staff-profile-layout"/);
  assert.match(staffHtml, /class="staff-profile-photo"/);
  assert.match(staffHtml, /class="staff-profile-list"/);
  assert.match(staffHtml, /class="staff-profile-row"/);
  assert.match(staffHtml, /src="image\/director-kawakami-profile-768\.webp"/);
  assert.match(staffHtml, /<dd>柔道整復師（国家資格）／MSMメソッド修了<\/dd>/);
  assert.match(staffHtml, /<dd>サッカー観戦、映画鑑賞、水族館、動物園<br>自然がいっぱいあるところに行くこと<\/dd>/);
  assert.match(staffHtml, /<dd>日常生活の中から原因を見つけること。<br>動きの癖を見つけ、痛みの大元を見つけること。<br>その方に合ったセルフケアを見つけること。<\/dd>/);
  assert.match(staffHtml, /<dd>自炊で栄養管理をすること。<br>定期的に温泉に入り、心も体もリフレッシュすること。<br>1〜2リットルの水を飲むこと。<br>普段、患者様にお伝えしているセルフケアを自分でも行っています。そのため調子がいいです（笑）<\/dd>/);
  assert.doesNotMatch(staffHtml, /<dt>対応症状：?<\/dt>|<dt>施術方針：?<\/dt>/);
  const profileSection = staffHtml.slice(profileIndex, nameOriginIndex);
  assert.doesNotMatch(profileSection, /対応症状|施術方針/);
  const profileCssBlocks = [...staffHtml.matchAll(/\.(?:staff-profile-simple|staff-profile-layout|staff-profile-photo|staff-profile-list|staff-profile-row)[^{]*\{[^}]*\}/g)].map((match) => match[0]).join("\n");
  assert.match(profileCssBlocks, /\.staff-profile-simple \{/);
  assert.match(profileCssBlocks, /\.staff-profile-layout \{[\s\S]*grid-template-columns: minmax\(180px, 240px\) 1fr/);
  assert.match(profileCssBlocks, /\.staff-profile-row \{[\s\S]*border-bottom: 1px solid rgba\(47, 79, 63, 0\.16\)/);
  assert.match(profileCssBlocks, /\.staff-profile-row dt \{[\s\S]*color: #0f6b4b/);
  assert.doesNotMatch(profileSection, /健康に気をつけていること/);
  assert.doesNotMatch(profileSection, /box-shadow|border-radius/);
  assert.doesNotMatch(profileCssBlocks, /box-shadow\s*:/);
  assert.doesNotMatch(profileCssBlocks, /border-radius\s*:/);

  for (const concern of ["階段を降りるのが怖い。", "歩き始めに痛む。", "買い物や旅行に行くのが不安。", "正座やしゃがむ動作がつらい。"]) {
    assert.match(staffHtml, new RegExp(`<p>${escapeRegExp(concern)}<\\/p>`), `concern should be plain paragraph: ${concern}`);
    assert.doesNotMatch(staffHtml, new RegExp(`<[^>]+class="[^"]*staff-text-(?:marker|red|underline)[^"]*"[^>]*>${escapeRegExp(concern)}`));
  }

  for (const emphasized of ["痛む場所だけを見て終わりにしない", "足腰の不調は、生活の自由さに関わる", "もう一度、安心して歩ける身体へ", "優しく、わかりやすく、無理に押しつけない", "痛みが戻りにくい身体づくり"]) {
    assert.match(staffHtml, new RegExp(`<span class="staff-text-(?:marker|red|underline)">${escapeRegExp(emphasized)}<\\/span>`));
  }

  assert.match(staffHtml, /href="https:\/\/lin\.ee\/X01F2mP"[\s\S]*LINEで相談・予約する/);
  assert.match(staffHtml, /href="tel:0471143274"[\s\S]*電話で相談する/);
  assert.match(staffHtml, /<!-- 編集: ごあいさつ本文。段落を増減しても大丈夫です。 -->/);
  assert.match(staffHtml, /<!-- 編集: プロフィール項目。dtが項目名、ddが内容です。 -->/);
  assert.match(staffHtml, /<!-- 編集: CTA前の締め文。予約前に背中を押す文章です。 -->/);
  assert.match(staffHtml, /src="image\/staff-greeting-treatment\.jpeg"/);
  assert.equal(existsSync(path.join(repoRoot, "image", "staff-greeting-treatment.jpeg")), true);
  assert.equal(existsSync(path.join(repoRoot, "image", "director-kawakami-profile-768.webp")), true);
  assert.doesNotMatch(staffHtml, /必ず治る|治る|完治|改善率が高い|必ず改善/);
});

test("Navigation exposes FAQ and access detail pages without replacing reservation anchors", () => {
  const footerNav = getElementSlice('<nav class="hk-footer-nav"', "</nav>");
  const mobileNav = getElementSlice('<nav class="site-mobile-nav hidden"');

  assert.match(footerNav, /href="faq\.html">よくある質問/);
  assert.match(footerNav, /href="access\.html">アクセス/);
  assert.match(footerNav, /href="blog\/">コラム/);
  assert.match(mobileNav, /href="faq\.html"/);
  assert.match(mobileNav, /href="access\.html"/);
  assert.match(mobileNav, /href="blog\/"/);
  assert.match(html, /href="#contact"/);
});
