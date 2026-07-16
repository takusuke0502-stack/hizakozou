import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const voicesHtml = readFileSync(new URL("../voices.html", import.meta.url), "utf8");
const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const mainJs = readFileSync(new URL("../scripts/main.js", import.meta.url), "utf8");
const mainCss = readFileSync(new URL("../styles/main.css", import.meta.url), "utf8");
const buildBlogScript = readFileSync(new URL("../scripts/build-blog.mjs", import.meta.url), "utf8");
const siteDiscoveryCss = readFileSync(new URL("../symptoms/site-discovery.css", import.meta.url), "utf8");
const sitePricingCss = readFileSync(new URL("../symptoms/site-pricing.css", import.meta.url), "utf8");
const generateBlogScript = readFileSync(new URL("../scripts/generate-blog.mjs", import.meta.url), "utf8");
const lowerBackHtml = readFileSync(new URL("../symptoms/lower-back-pain.html", import.meta.url), "utf8");
const sciaticaHtml = readFileSync(new URL("../symptoms/sciatica.html", import.meta.url), "utf8");
const spinalStenosisHtml = readFileSync(new URL("../symptoms/spinal-stenosis.html", import.meta.url), "utf8");
const kneeOsteoarthritisHtml = readFileSync(new URL("../symptoms/knee-osteoarthritis.html", import.meta.url), "utf8");
const hipOsteoarthritisHtml = readFileSync(new URL("../symptoms/hip-osteoarthritis.html", import.meta.url), "utf8");
const lumbarDiscHerniationHtml = readFileSync(new URL("../symptoms/lumbar-disc-herniation.html", import.meta.url), "utf8");
const shoulderStiffnessHtml = readFileSync(new URL("../symptoms/shoulder-stiffness.html", import.meta.url), "utf8");
const plantarFasciitisHtml = readFileSync(new URL("../symptoms/plantar-fasciitis.html", import.meta.url), "utf8");
const scoliosisHtml = readFileSync(new URL("../symptoms/scoliosis.html", import.meta.url), "utf8");
const tmjHtml = readFileSync(new URL("../symptoms/tmj.html", import.meta.url), "utf8");
const frozenShoulderHtml = readFileSync(new URL("../symptoms/frozen-shoulder.html", import.meta.url), "utf8");
const thoracicOutletHtml = readFileSync(new URL("../symptoms/thoracic-outlet.html", import.meta.url), "utf8");
const carpalTunnelHtml = readFileSync(new URL("../symptoms/carpal-tunnel.html", import.meta.url), "utf8");
const elbowTendinopathyHtml = readFileSync(new URL("../symptoms/elbow-tendinopathy.html", import.meta.url), "utf8");
const trackingConfigPath = path.join(repoRoot, "scripts", "tracking-config.js");
const trackingJsPath = path.join(repoRoot, "scripts", "tracking.js");
const topIconsPath = path.join(repoRoot, "scripts", "top-icons.js");
const trackingConfig = existsSync(trackingConfigPath) ? readFileSync(trackingConfigPath, "utf8") : "";
const trackingJs = existsSync(trackingJsPath) ? readFileSync(trackingJsPath, "utf8") : "";
const topIconsJs = existsSync(topIconsPath) ? readFileSync(topIconsPath, "utf8") : "";
const symptomDirectoryHtml = readFileSync(new URL("../symptoms/index.html", import.meta.url), "utf8");
const symptomEvaluationPath = path.join(repoRoot, "docs", "analytics", "symptom-pages-28-day-evaluation.md");
const symptomEvaluation = existsSync(symptomEvaluationPath) ? readFileSync(symptomEvaluationPath, "utf8") : "";
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

function stripHtmlTags(value) {
  return value.replace(/<[^>]*>/g, "");
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
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
    'class="voice-trust"',
    'class="google-reviews voice-trust__google"',
    'id="flow"',
    'id="clinic-tour-video"',
    'id="knee-msm-reasons"',
    'id="msm-method"',
    'id="clinic-reasons"',
    'id="first-visit-policy"',
    'id="profile"',
    'id="voice"',
    'id="price"',
    'id="access"',
    'id="faq"'
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

test("LP places the clinic tour video directly after the treatment flow", () => {
  const tourVideo = getTopLevelSectionSlice("clinic-tour-video");

  assert.match(tourVideo, /<section id="clinic-tour-video" class="clinic-tour-video" aria-labelledby="clinic-tour-video-title">/);
  assert.match(tourVideo, /<p class="clinic-tour-video__eyebrow">MOVIE<\/p>/);
  assert.match(tourVideo, /<h2 id="clinic-tour-video-title" class="clinic-tour-video__title">院内紹介動画<\/h2>/);
  assert.match(tourVideo, /<iframe[\s\S]*class="clinic-tour-video__iframe"[\s\S]*src="https:\/\/www\.youtube\.com\/embed\/cr1uFyrt4GA"[\s\S]*title="院内紹介動画"[\s\S]*loading="lazy"[\s\S]*allowfullscreen>/);
  assert.doesNotMatch(tourVideo, /ご予約・ご相談|LINEからお気軽に|院内の雰囲気をご覧ください/);
});

test("LP removes the long-knee-pain accordion guide block", () => {
  assert.doesNotMatch(html, /id="seo-guide"/);
  assert.doesNotMatch(html, /なぜ膝の痛みが長引くのか？/);
  assert.doesNotMatch(html, /湿布・注射を続けているのに、なぜ繰り返すのか/);
  assert.doesNotMatch(html, /膝をかばう動きが、別の負担を増やすことがある/);
  assert.doesNotMatch(html, /「動くとまた痛いかも」という不安も積み重なる/);
});

test("LP troubles section uses a compact checklist without changing CTAs", () => {
  const troubles = getSectionSlice('id="troubles"', 'class="voice-trust"');

  for (const concern of [
    "こんなお悩みを抱えていませんか？",
    "長い間、",
    "慢性的な腰痛",
    "歩き始めや長く歩くと",
    "足腰がつらい",
    "膝や股関節が痛い",
    "目が覚める",
    "とても憂鬱",
    "満足できなかった",
    "薬やブロック注射",
    "慢性痛",
    "諦めている"
  ]) {
    assert.match(troubles, new RegExp(escapeRegExp(concern)));
  }

  assert.match(troubles, /class="troubles-check__heading"/);
  assert.match(troubles, /class="troubles-check__list"/);
  assert.equal((troubles.match(/<li>/g) || []).length, 8);
  assert.equal((troubles.match(/<strong>/g) || []).length, 9);
  assert.doesNotMatch(troubles, /<img\b/);
  assert.doesNotMatch(troubles, /alt="足腰の痛みやしびれに悩む方"/);
  assert.doesNotMatch(troubles, /歩き始めや立ち上がりで、膝にズキッとした痛みが出る/);
  assert.doesNotMatch(troubles, /膝をかばって歩いているうちに/);
  assert.doesNotMatch(troubles, /正座やしゃがむ動作がしづらく/);
  assert.doesNotMatch(troubles, /LINEで|電話で|無料相談|予約/);
  assert.match(mainCss, /\.troubles-check__heading\s*{[\s\S]*background:\s*linear-gradient\(180deg,\s*#eeeeee 0%,\s*#e4e4e4 100%\);/);
  assert.match(mainCss, /\.troubles-check__heading::after\s*{[\s\S]*border-top:\s*18px solid #e4e4e4;/);
  assert.match(mainCss, /\.troubles-check__list\s*{[\s\S]*background:\s*#fff;/);
  assert.match(mainCss, /\.troubles-check__list li::before\s*{[\s\S]*border:\s*2px solid #222;/);
  assert.match(mainCss, /\.troubles-check__list li::after\s*{[\s\S]*border-left:\s*4px solid #e3342f;[\s\S]*border-bottom:\s*4px solid #e3342f;/);
  assert.match(mainCss, /\.troubles-check__list strong\s*{[\s\S]*color:\s*#c53632;[\s\S]*font-weight:\s*900;/);
});

test("LP adds a diagram-backed three-reason block before the MSM method", () => {
  const reasons = getTopLevelSectionSlice("knee-msm-reasons");
  const expectedDiagrams = [
    ["images/msm/reason-muscle-balance.webp", "サボり筋と過労筋の対比図"],
    ["images/msm/msm-flow-body.webp", "足首から膝と腰へねじれが波及する図解"],
    ["images/msm/reason-brain-nerve-loop.webp", "悪い動きから神経の過敏化まで続く悪循環の図解"]
  ];

  assert.match(reasons, /<section id="knee-msm-reasons" class="knee-msm-reasons" aria-labelledby="knee-msm-reasons-title">/);
  assert.doesNotMatch(reasons, /痛みが戻る仕組み/);
  assert.doesNotMatch(reasons, /あなたの[\s\S]*足腰の痛み・しびれ[\s\S]*が戻ってしまう、本当の理由/);
  assert.doesNotMatch(reasons, /痛みは一生戻り続けます。/);
  assert.doesNotMatch(reasons, /MSMメソッドが解き明かす「痛み・しびれの根本原因」/);
  assert.doesNotMatch(reasons, /こんなお悩み、ありませんか/);
  assert.doesNotMatch(reasons, /揉んでもらうとその場は楽になるけれど、翌朝にはまた痛い/);
  assert.doesNotMatch(reasons, /注射や薬を続けても、結局同じことの繰り返し/);
  assert.doesNotMatch(reasons, /何度もぶり返すのは、痛みが出ている場所が「被害者」に過ぎないからです。/);
  assert.match(reasons, /痛みがぶり返す「3つの原因」/);
  assert.match(reasons, /<h3 id="knee-msm-reasons-title">痛みがぶり返す「3つの原因」<\/h3>/);
  assert.match(reasons, /サボり筋[\s\S]*を放置して、[\s\S]*頑張りすぎな筋肉[\s\S]*だけを揉んでいるから/);
  assert.match(reasons, /腰や膝はただの被害者。真犯人は「[\s\S]*足首のゆがみ[\s\S]*」にあるから/);
  assert.match(reasons, /毎日の「間違った動き」を、脳と神経が記憶してしまっているから/);
  assert.doesNotMatch(reasons, /断ち切るべきループ|knee-msm-cycle|特定箇所への負担|その場しのぎの治療/);
  assert.doesNotMatch(reasons, /運動療法（スタビリティワーク）/);
  assert.doesNotMatch(reasons, /サボり筋を狙って刺激/);
  assert.doesNotMatch(reasons, /認知行動療法的アプローチ/);
  assert.doesNotMatch(reasons, /「悪い動き方」の記憶をリセット/);
  assert.doesNotMatch(reasons, /この2つを組み合わせるのがMSMメソッド独自の視点/);
  assert.doesNotMatch(reasons, /STRUCTURE & NEUROLOGICAL APPROACH/);
  assert.doesNotMatch(reasons, /class="knee-msm-approach-box"/);
  assert.doesNotMatch(reasons, /メインビジュアル画像/);
  assert.doesNotMatch(reasons, /class="knee-msm-hero__visual"/);
  assert.equal((reasons.match(/class="knee-msm-reason__diagram"/g) || []).length, 3);
  assert.equal((reasons.match(/class="knee-msm-reason__diagram-image"/g) || []).length, 3);
  for (const [src, alt] of expectedDiagrams) {
    assert.match(reasons, new RegExp(`<img[^>]+src="${escapeRegExp(src)}"[^>]+alt="${escapeRegExp(alt)}"[^>]+class="knee-msm-reason__diagram-image"`));
  }
  for (const [src] of expectedDiagrams) {
    const imageIndex = reasons.indexOf(`src="${src}"`);
    const articleStart = reasons.lastIndexOf('<article class="knee-msm-reason', imageIndex);
    const articleEnd = reasons.indexOf("</article>", imageIndex);
    const article = reasons.slice(articleStart, articleEnd);
    const headingEnd = article.indexOf("</h3>");
    const textIndex = article.indexOf("<p>", headingEnd);

    assert.ok(imageIndex > articleStart, `${src} should be inside a reason article`);
    assert.ok(article.indexOf(`src="${src}"`) > headingEnd, `${src} should appear after the reason heading`);
    assert.ok(textIndex > article.indexOf(`src="${src}"`), `${src} should appear before the explanation text`);
  }
  assert.equal((reasons.match(/実装時は実際の写真に差し替え/g) || []).length, 0);
  assert.doesNotMatch(reasons, /サボり筋[\s\S]*イメージ画像/);
  assert.doesNotMatch(reasons, /関節連鎖[\s\S]*イメージ画像/);
  assert.doesNotMatch(reasons, /動作指導・[\s\S]*歩行分析の[\s\S]*イメージ画像/);
});

test("LP highlights the new foot-low-back and nerve keywords with a soft underline", () => {
  const reasons = getTopLevelSectionSlice("knee-msm-reasons");

  assert.equal((reasons.match(/class="knee-msm-highlight"/g) || []).length, 3);
  assert.doesNotMatch(reasons, /<span class="knee-msm-highlight">足腰の痛み・しびれ<\/span>/);
  assert.doesNotMatch(reasons, /<span class="knee-msm-highlight">土台の崩れ<\/span>/);
  assert.doesNotMatch(reasons, /<span class="knee-msm-highlight">脳の記憶<\/span>/);
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
  assert.match(method, /硬くなった筋肉をゆるめ、動きを広げる/);
  assert.match(method, /日々の悪い動作の繰り返しで使いすぎているガンバリ筋を緩めて、サボり筋が働くための土台をつくります。/);
  assert.doesNotMatch(method, /日々の不良動作で使いすぎている過労筋を緩めて、サボり筋が働くための土台をつくります。/);
  assert.doesNotMatch(method, /膝に負担をかけている足首・股関節まわりの硬くなった筋肉を整え、関節が動きやすい状態に戻します。/);
  assert.match(method, /STEP\s*<strong>02<\/strong>/);
  assert.match(method, /STEP 02 — Stability（鍛える）/);
  assert.match(method, /サボり筋を1つずつ目覚めさせる/);
  assert.match(method, /正しい動作に必要なサボり筋を、1つずつ使えるようにします。ただ鍛えるのではなく、歩く・立つ・階段動作につなげる準備を行います。/);
  assert.doesNotMatch(method, /正しい動作に必要な「サボり筋」を、1つずつ使えるようにしていきます。/);
  assert.match(method, /STEP\s*<strong>03<\/strong>/);
  assert.match(method, /STEP 03 — Movement（使える）/);
  assert.match(method, /痛みに戻らない動きを身につける/);
  assert.match(method, /使えるようになった筋肉を、歩き方・立ち上がり・階段動作に落とし込みます。足腰に負担をかけにくい体の使い方を身につけます。/);
  assert.doesNotMatch(method, /使えるようになった筋肉を、歩き方・立ち上がり・階段動作などに落とし込みます。/);
  assert.match(method, /Mobilityアプローチの施術イメージ/);
  assert.match(method, /Stabilityトレーニングのイメージ/);
  assert.match(method, /Movement動作指導のイメージ/);
  assert.match(method, /繰り返しに、終止符を/);
  assert.match(method, /無料相談・ご予約はこちら/);
  assert.match(method, /href="https:\/\/lin\.ee\/X01F2mP"/);
  assert.equal((method.match(/class="knee-msm-step__icon"/g) || []).length, 0);
  assert.doesNotMatch(method, /<span class="knee-msm-step__icon" aria-hidden="true">[MS]<\/span>/);
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
    const imageIndex = method.indexOf(`src="${src}"`);
    const articleStart = method.lastIndexOf('<article class="knee-msm-step', imageIndex);
    const articleEnd = method.indexOf("</article>", imageIndex);
    const article = method.slice(articleStart, articleEnd);
    const headingEnd = article.indexOf("</h3>");
    const textIndex = article.indexOf("<p>", headingEnd);

    assert.ok(article.indexOf(`src="${src}"`) > headingEnd, `${src} should appear after the step heading`);
    assert.ok(textIndex > article.indexOf(`src="${src}"`), `${src} should appear before the step explanation`);
  }
  assert.doesNotMatch(method, /Mobilityアプローチの施術イメージ<\/span>/);
  assert.match(method, /<div class="knee-msm-steps-container">\s*<div class="knee-msm-step-list knee-msm-step-grid"/);
  assert.match(mainCss, /\.knee-msm-steps-container\s*{[\s\S]*max-width:\s*1120px;[\s\S]*margin:\s*34px auto 0;[\s\S]*padding:\s*0 24px;/);
  assert.match(mainCss, /\.knee-msm-step-list\s*{[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(300px,\s*1fr\)\);[\s\S]*gap:\s*24px;[\s\S]*margin-top:\s*0;/);
  assert.match(mainCss, /\.knee-msm-step\s*{[\s\S]*display:\s*flex;[\s\S]*flex-direction:\s*column;[\s\S]*min-width:\s*0;/);
  assert.match(mainCss, /\.knee-msm-step__head\s*{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\);[\s\S]*min-height:\s*clamp\(7\.6rem,\s*11vw,\s*8\.8rem\);/);
  assert.match(mainCss, /\.knee-msm-step h3\s*{[\s\S]*writing-mode:\s*horizontal-tb;[\s\S]*word-break:\s*normal;[\s\S]*overflow-wrap:\s*break-word;/);
  assert.match(mainCss, /\.knee-msm-step__visual\s*{[^}]*height:\s*126px;[^}]*border-radius:\s*14px;[^}]*margin-top:\s*16px;[^}]*background:\s*#fff;/);
  assert.doesNotMatch(mainCss, /\.knee-msm-step__visual\s*{[^}]*margin-top:\s*auto;/);
  assert.match(mainCss, /\.knee-msm-step__image\s*{[\s\S]*width:\s*100%;[\s\S]*height:\s*100%;[\s\S]*object-fit:\s*contain;/);
  assert.match(mainCss, /@media\s*\(max-width:\s*1023px\)\s*{[\s\S]*\.knee-msm-steps-container\s*{[\s\S]*max-width:\s*680px;[\s\S]*\.knee-msm-step-list\s*{[\s\S]*grid-template-columns:\s*1fr;/);
});

test("LP reason and MSM mock CSS keeps diagrams wide and responsive", () => {
  assert.match(mainCss, /\.knee-msm-reasons__inner\s*{[\s\S]*max-width:\s*960px;[\s\S]*margin:\s*0 auto;/);
  assert.match(mainCss, /\.knee-msm-hero,[\s\S]*\.knee-msm-empathy,[\s\S]*\.knee-msm-intro\s*{[\s\S]*max-width:\s*680px;[\s\S]*margin-left:\s*auto;[\s\S]*margin-right:\s*auto;/);
  assert.doesNotMatch(mainCss, /\.knee-msm-hero__visual/);
  assert.match(mainCss, /\.knee-msm-reason\s*{[\s\S]*display:\s*block;[\s\S]*border-left:\s*6px solid #e96a42;/);
  assert.doesNotMatch(mainCss, /\.knee-msm-reason\s*{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\) 140px;/);
  assert.match(mainCss, /\.knee-msm-reason__diagram\s*{[\s\S]*margin:\s*20px 0 18px;[\s\S]*width:\s*100%;[\s\S]*border-radius:\s*24px;[\s\S]*background:\s*#fffaf3;[\s\S]*overflow:\s*hidden;/);
  assert.match(mainCss, /\.knee-msm-reason__diagram-image\s*{[\s\S]*display:\s*block;[\s\S]*width:\s*100%;[\s\S]*height:\s*auto;[\s\S]*object-fit:\s*contain;/);
  assert.doesNotMatch(mainCss, /knee-msm-cycle/);
  assert.match(mainCss, /\.knee-msm-approaches\s*{[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(mainCss, /\.knee-msm-steps__inner\s*{[\s\S]*max-width:\s*680px;[\s\S]*margin:\s*0 auto;/);
  assert.match(mainCss, /\.knee-msm-step__visual\s*{[\s\S]*height:\s*126px;[\s\S]*background:\s*#fff;/);
  assert.doesNotMatch(mainCss, /knee-msm-cta__visual/);
  assert.match(mainCss, /@media\s*\(max-width:\s*640px\)\s*{[\s\S]*\.knee-msm-reason__diagram\s*{[\s\S]*margin:\s*18px 0 16px;[\s\S]*padding:\s*8px;[\s\S]*\.knee-msm-approaches\s*{[\s\S]*grid-template-columns:\s*1fr;/);
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

test("LP adds a readable six-reason clinic strengths section", () => {
  const clinicReasons = getTopLevelSectionSlice("clinic-reasons");
  const clinicReasonsText = stripHtmlTags(clinicReasons);
  const expectedReasons = [
    [
      "特徴1",
      "徹底したカウンセリングと全身検査で「痛みの本当の原因」を特定",
      "腰や肩を触らない？<br>レントゲンに写らない根本原因を初回に突き止めます",
      "image/flow-medical-interview-form-card.webp",
      "問診票を記入しながら丁寧にカウンセリングする様子"
    ],
    [
      "特徴2",
      "接骨院や整体院で「施術歴14年」の院長が、最初から最後まで責任担当",
      "国家資格保持者によるマンツーマン施術。<br>途中で担当が変わる不安はありません",
      "image/qualification-judotherapist-license.webp",
      "柔道整復師免許証"
    ],
    [
      "特徴3",
      "整形外科学会も推奨する運動療法「MSMメソッド」を導入",
      "バキバキしない！医学的根拠に基づいたアプローチで<br>痛みを根本から見直します",
      "image/flow-movement-assessment-768.webp",
      "関節や動きを確認しながら運動療法を行う様子"
    ],
    [
      "特徴4",
      "足腰の慢性痛に特化した「豊富な知識と経験」",
      "長年諦めていた重度な腰痛・坐骨神経痛・膝の痛み・シビレにも対応",
      "image/flow-counseling-board-768.webp",
      "足腰の慢性痛についてホワイトボードを使って説明している様子"
    ],
    [
      "特徴5",
      "セルフケアを習得し、ご自身でカラダを改善できる「卒業」を目指します",
      "動画をまねするだけでは分からない、<br>あなたの身体に合ったセルフケアを個別に指導",
      "image/treatment-stretch-768.webp",
      "自宅で続けやすいセルフケアを説明する様子"
    ],
    [
      "特徴6",
      "完全予約制・清潔で綺麗な個室のプライベート空間",
      "周囲の目を気にせず<br>リラックスして何でも相談できる環境をお約束",
      "image/clinic-room-private.webp",
      "清潔で落ち着いた雰囲気の施術室"
    ]
  ];

  assert.match(clinicReasons, /<section id="clinic-reasons" class="clinic-reasons" aria-labelledby="clinic-reasons-title">/);
  assert.match(clinicReasons, /<h2 id="clinic-reasons-title">当院が選ばれる<span>6つ<\/span>の理由<\/h2>/);
  assert.doesNotMatch(clinicReasons, /7つの理由/);
  assert.match(clinicReasonsText, /長年諦めていた重度な腰痛・坐骨神経痛・膝の痛み・シビレにも対応/);
  assert.doesNotMatch(clinicReasons, /長年諦めていた重度な腰痛・坐骨神経痛・膝の痛み・シビレにも対応<br>/);
  assert.doesNotMatch(clinicReasons, /プロ直伝の「徹底したセルフケア指導」で、10年後も再発しにくい身体へ/);
  assert.doesNotMatch(clinicReasons, /動画やオンラインでも続かなかった痛み対策を、あなた専用のストレッチでサポート/);
  assert.match(clinicReasonsText, /当院では、施術を受け続けることをゴールにしていません。/);
  assert.match(clinicReasonsText, /ご自身の身体を理解し、不調を自分で整えられるようになることを目指します。/);
  assert.match(clinicReasonsText, /YouTubeやSNSのストレッチ情報は多くありますが、身体の状態に合わない運動は腰や膝の負担を増やすこともあります。/);
  assert.match(clinicReasonsText, /今の状態に合ったセルフケアを一人ひとりにお伝えします。/);
  assert.match(clinicReasonsText, /ご自身でカラダを管理できる「卒業」を目指します。/);
  assert.equal((clinicReasons.match(/class="clinic-reason-card"/g) || []).length, 6);
  assert.equal((clinicReasons.match(/class="clinic-reason-card__label"/g) || []).length, 6);
  assert.equal((clinicReasons.match(/class="clinic-reason-card__image"/g) || []).length, 6);

  for (const [label, title, lead, src, alt] of expectedReasons) {
    assert.match(clinicReasons, new RegExp(escapeRegExp(label)));
    assert.match(clinicReasonsText, new RegExp(escapeRegExp(title)));
    assert.match(clinicReasonsText, new RegExp(escapeRegExp(lead.replace("<br>", ""))));
    assert.match(clinicReasons, new RegExp(`<img[^>]+src="${escapeRegExp(src)}"[^>]+alt="${escapeRegExp(alt)}"[^>]+class="clinic-reason-card__image"`));

    const cardStart = clinicReasons.indexOf(label);
    const nextCardStart = clinicReasons.indexOf('<article class="clinic-reason-card">', cardStart + 1);
    const card = clinicReasons.slice(cardStart, nextCardStart > -1 ? nextCardStart : clinicReasons.length);
    const cardText = stripHtmlTags(card);
    const titleIndex = cardText.indexOf(title);
    const leadIndex = cardText.indexOf(lead.replace("<br>", ""));
    const imageIndex = card.indexOf(`src="${src}"`);
    const textIndex = card.indexOf('class="clinic-reason-card__text"');

    assert.ok(titleIndex > -1 && leadIndex > titleIndex, `${label} should place the subheading after the heading`);
    assert.ok(imageIndex > leadIndex, `${label} should place the photo after the heading copy`);
    assert.ok(textIndex > imageIndex, `${label} should place the explanation text after the photo`);
  }

  assert.match(clinicReasonsText, /多くの患者様が「腰が痛いのに腰を触らないことにびっくりした」/);
  assert.match(clinicReasonsText, /柔道整復師（国家資格）を持つ院長自らが施術を担当します。/);
  assert.match(clinicReasonsText, /日本整形外科学会でもその有効性と重要性が推奨されている「運動療法」/);
  assert.match(clinicReasonsText, /他のお客様と時間が重なりにくいため、デリケートなお身体のお悩みも一対一で安心してご相談いただけます。/);
  assert.equal((clinicReasons.match(/class="feature-emphasis"/g) || []).length, 12);
  assert.equal((clinicReasons.match(/class="feature-marker"/g) || []).length, 12);
  assert.equal((clinicReasons.match(/class="feature-bold"/g) || []).length, 6);
});

test("LP clinic strengths CSS keeps the reference-like vertical layout responsive", () => {
  assert.match(mainCss, /\.clinic-reasons\s*{[\s\S]*padding:\s*56px 16px 72px;[\s\S]*background:\s*#f6fbf4;/);
  assert.match(mainCss, /\.clinic-reasons__inner\s*{[\s\S]*max-width:\s*640px;[\s\S]*margin:\s*0 auto;/);
  assert.match(mainCss, /\.clinic-reasons__header\s*{[\s\S]*margin:\s*0 calc\(50% - 50vw\) 42px;[\s\S]*background:\s*linear-gradient\(135deg,\s*#174f3f 0%,\s*#2f6f3e 100%\);[\s\S]*border-top:\s*1px solid #d8e6d7;[\s\S]*border-bottom:\s*1px solid #d8e6d7;[\s\S]*text-align:\s*center;/);
  assert.match(mainCss, /\.clinic-reasons__eyebrow\s*{[\s\S]*display:\s*none;/);
  assert.match(mainCss, /\.clinic-reasons__header h2\s*{[\s\S]*max-width:\s*360px;[\s\S]*font-size:\s*clamp\(1\.55rem,\s*3\.6vw,\s*2\.05rem\);[\s\S]*line-height:\s*1\.42;/);
  assert.match(mainCss, /\.clinic-reasons__header h2 span\s*{[\s\S]*color:\s*#f4c27a;[\s\S]*font-size:\s*1\.28em;/);
  assert.match(mainCss, /\.clinic-reasons__list\s*{[\s\S]*display:\s*grid;[\s\S]*gap:\s*50px;/);
  assert.match(mainCss, /\.clinic-reason-card\s*{[\s\S]*max-width:\s*520px;[\s\S]*text-align:\s*center;/);
  assert.match(mainCss, /\.clinic-reason-card__label\s*{[\s\S]*width:\s*min\(320px,\s*82%\);[\s\S]*border-radius:\s*999px;[\s\S]*background:\s*#174f3f;[\s\S]*box-shadow:\s*0 10px 22px rgba\(23,\s*79,\s*63,\s*0\.12\);/);
  assert.match(mainCss, /\.clinic-reason-card__body\s*{[\s\S]*padding:\s*0;[\s\S]*background:\s*transparent;[\s\S]*box-shadow:\s*none;/);
  assert.match(mainCss, /\.clinic-reason-card__lead\s*{[\s\S]*font-size:\s*0\.9rem;[\s\S]*line-height:\s*1\.7;/);
  assert.match(mainCss, /\.clinic-reason-card__text p\s*{[\s\S]*font-size:\s*1rem;[\s\S]*font-weight:\s*500;[\s\S]*line-height:\s*1\.9;/);
  assert.match(mainCss, /\.clinic-reason-card__text p \+ p\s*{[\s\S]*margin-top:\s*1\.25rem;/);
  assert.match(mainCss, /\.feature-emphasis\s*{[\s\S]*color:\s*#174f3f;[\s\S]*font-weight:\s*700;/);
  assert.match(mainCss, /\.feature-marker\s*{[\s\S]*background:\s*linear-gradient\([\s\S]*rgba\(244,\s*194,\s*122,\s*0\.38\)[\s\S]*box-decoration-break:\s*clone;/);
  assert.match(mainCss, /\.feature-bold\s*{[\s\S]*font-weight:\s*700;/);
  assert.match(mainCss, /\.clinic-reason-card__image-frame\s*{[\s\S]*width:\s*min\(100%,\s*300px\);[\s\S]*margin:\s*20px auto 0;/);
  assert.match(mainCss, /\.clinic-reason-card__image\s*{[\s\S]*width:\s*100%;[\s\S]*max-height:\s*260px;[\s\S]*object-fit:\s*contain;/);
  assert.match(mainCss, /@media\s*\(max-width:\s*640px\)\s*{[\s\S]*\.clinic-reasons\s*{[\s\S]*padding:\s*48px 14px 60px;[\s\S]*\.clinic-reason-card__label\s*{[\s\S]*width:\s*min\(320px,\s*86%\);[\s\S]*\.clinic-reason-card__image-frame\s*{[\s\S]*width:\s*min\(78vw,\s*280px\);/);
  assert.doesNotMatch(mainCss, /\.clinic-reasons__header\s*{[\s\S]*background:\s*#bd927f;/);
  assert.doesNotMatch(mainCss, /\.clinic-reason-card__label\s*{[\s\S]*background:\s*#bd927f;/);
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
      "image/flow-plan-consultation-768.webp",
      "カウンセリングでお悩みや日常の状態を伺っている様子"
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
      "image/flow-counseling-board-768.webp",
      "ホワイトボードを使って体の状態と施術方針を説明している様子"
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
  assert.doesNotMatch(flow, /flow-room-tour|院内の雰囲気|98BUwchguP0|ご予約・ご相談はLINEからお気軽にどうぞ/);

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
  assert.match(mainCss, /\.flow-slider__slides\s*{[\s\S]*touch-action:\s*pan-y;[\s\S]*user-select:\s*none;/);
  assert.match(mainCss, /\.flow-swipe-hint\s*\{[\s\S]*text-align:\s*center;[\s\S]*font-size:\s*0\.9rem;[\s\S]*margin-top:\s*12px;[\s\S]*color:\s*#1f5f4a;/);
  assert.match(mainCss, /\.flow-swipe-arrow\s*\{[\s\S]*display:\s*inline-block;[\s\S]*margin-left:\s*8px;[\s\S]*animation:\s*swipeArrow 1\.2s ease-in-out infinite;/);
  assert.match(mainCss, /@keyframes swipeArrow\s*\{[\s\S]*0%\s*\{\s*transform:\s*translateX\(0\);\s*opacity:\s*0\.5;\s*\}[\s\S]*50%\s*\{\s*transform:\s*translateX\(8px\);\s*opacity:\s*1;\s*\}[\s\S]*100%\s*\{\s*transform:\s*translateX\(0\);\s*opacity:\s*0\.5;\s*\}/);
  assert.doesNotMatch(mainCss, /flow-slider__hint/);
  assert.match(mainCss, /\.flow-slider\.is-enhanced\s+\.flow-slide:not\(\.is-active\)\s*{[\s\S]*display:\s*none;/);
  assert.match(mainCss, /\.flow-slider__dot\.is-active\s*{[\s\S]*background:\s*#f2653f;/);
  assert.doesNotMatch(mainCss, /flow-room-tour/);
  assert.match(mainCss, /@media\s*\(max-width:\s*640px\)\s*{[\s\S]*\.flow-slider__arrow\s*{[\s\S]*width:\s*44px;[\s\S]*height:\s*44px;/);
});

test("LP flow slider JavaScript uses scoped controls, dots, and counters without autoplay", () => {
  assert.match(mainJs, /function setupFlowSlider\(\)/);
  assert.match(mainJs, /document\.querySelectorAll\('\[data-flow-slider\]'\)/);
  assert.match(mainJs, /slider\.classList\.add\('is-enhanced'\)/);
  assert.match(mainJs, /querySelectorAll\('\[data-flow-slide\]'\)/);
  assert.match(mainJs, /querySelector\('\[data-flow-current\]'\)/);
  assert.match(mainJs, /querySelectorAll\('\[data-flow-dot\]'\)/);
  assert.match(mainJs, /querySelector\('\.flow-slider__slides'\)/);
  assert.match(mainJs, /swipeMinDistance\s*=\s*44/);
  assert.match(mainJs, /pointerdown/);
  assert.match(mainJs, /pointerup/);
  assert.match(mainJs, /pointercancel/);
  assert.match(mainJs, /setSlide\(deltaX < 0 \? currentIndex \+ 1 : currentIndex - 1\)/);
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
    ["symptoms/index.html", "すべての症状を見る"]
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

test("LP pricing section uses the calmer green and orange LP palette", () => {
  for (const css of [mainCss, sitePricingCss]) {
    assert.match(css, /\.hk-pricing-card\s*{[\s\S]*border:\s*1px solid #d8e6d7;[\s\S]*border-radius:\s*18px;[\s\S]*box-shadow:\s*0 18px 36px rgba\(23,\s*79,\s*63,\s*0\.10\);/);
    assert.match(css, /\.hk-pricing-rule\s*{[\s\S]*background:\s*linear-gradient\(90deg,\s*rgba\(23,\s*79,\s*63,\s*0\),\s*#174f3f,\s*rgba\(244,\s*194,\s*122,\s*0\.82\),\s*rgba\(23,\s*79,\s*63,\s*0\)\);/);
    assert.match(css, /\.hk-pricing-quote\s*{[\s\S]*color:\s*#174f3f;/);
    assert.match(css, /\.hk-pricing-normal\s*{[\s\S]*border-top:\s*1px solid #d8e6d7;[\s\S]*border-bottom:\s*1px solid #d8e6d7;/);
    assert.match(css, /\.hk-pricing-normal strong\s*{[\s\S]*color:\s*#c65f26;/);
    assert.match(css, /\.hk-pricing-labels span\s*{[\s\S]*border-radius:\s*999px;[\s\S]*background:\s*#174f3f;/);
    assert.match(css, /\.hk-pricing-price\s*{[\s\S]*color:\s*#c65f26;/);
    assert.match(css, /\.hk-pricing-deadline\s*{[\s\S]*border:\s*1px solid rgba\(198,\s*95,\s*38,\s*0\.34\);[\s\S]*background:\s*#fff8ef;/);
    assert.match(css, /\.hk-pricing-feature\s*{[\s\S]*background:\s*linear-gradient\(135deg,\s*#174f3f 0%,\s*#2f6f3e 100%\);/);
    assert.match(css, /\.hk-pricing-line\s*{[\s\S]*padding:\s*13px 16px;[\s\S]*background:\s*linear-gradient\(135deg,\s*#198754 0%,\s*#0f6f43 100%\);/);
    assert.doesNotMatch(css, /background:\s*#d71920;/);
    assert.doesNotMatch(css, /border:\s*2px solid #17120e;/);
  }
});

test("sitewide Google tracking scripts load from the head on every HTML page", () => {
  const htmlFiles = walkFiles(repoRoot, (filePath) => filePath.endsWith(".html"));
  const missing = [];
  const headPattern = /<head>[\s\S]*<script src="\/scripts\/tracking-config\.js(?:\?v=\d+)?"(?: defer)?><\/script>\s*<script src="\/scripts\/tracking\.js(?:\?v=\d+)?"(?: defer)?><\/script>[\s\S]*<\/head>/;

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
  assert.match(trackingConfig, /ga4MeasurementId:\s*"G-Z44VRQ2E61"/);
  assert.match(trackingConfig, /googleAdsConversionId:\s*"AW-18109043080"/);
  assert.match(trackingConfig, /line:\s*""/);
  assert.match(trackingConfig, /phone:\s*""/);
  assert.match(trackingConfig, /form:\s*""/);
  assert.match(trackingConfig, /reservation:\s*""/);
  assert.match(trackingConfig, /thanks:\s*""/);
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
  assert.match(trackingJs, /symptom_slug/);
  assert.match(trackingJs, /cta_location/);
  assert.match(trackingJs, /link_text/);
  assert.match(trackingJs, /getSymptomSlug/);
  assert.match(trackingJs, /getCtaLocation/);
});

test("symptom detail pages use one accessible H1 and omit retired FAQPage schema", () => {
  const symptomDir = path.join(repoRoot, "symptoms");
  const detailPages = readdirSync(symptomDir).filter((name) => name.endsWith(".html") && name !== "index.html");

  assert.equal(detailPages.length, 24);
  for (const fileName of detailPages) {
    const symptomHtml = readFileSync(path.join(symptomDir, fileName), "utf8");
    assert.equal((symptomHtml.match(/<h1\b/g) ?? []).length, 1, `${fileName} should expose exactly one H1`);
    assert.doesNotMatch(symptomHtml, /"@type"\s*:\s*"FAQPage"/, `${fileName} should not keep retired FAQPage schema`);
  }
});

test("major image-hero symptom pages use lightweight desktop sources without changing mobile heroes", () => {
  const heroPages = [
    ["lower-back-pain.html", "腰痛・ぎっくり腰", "腰痛・ギックリ腰"],
    ["sciatica.html", "坐骨神経痛", "坐骨神経痛"],
    ["spinal-stenosis.html", "脊柱管狭窄症", "脊柱菅狭窄症"],
    ["lumbar-disc-herniation.html", "腰椎椎間板ヘルニア", "椎間板ヘルニア"],
    ["hip-osteoarthritis.html", "股関節痛・変形性股関節症", "変形性股関節症"],
    ["knee-osteoarthritis.html", "膝痛・変形性膝関節症", "変形性膝関節症"]
  ];

  for (const [fileName, heading, assetBase] of heroPages) {
    const symptomHtml = readFileSync(path.join(repoRoot, "symptoms", fileName), "utf8");
    const optimizedAsset = path.join(repoRoot, "image", "symptom-hero", `${assetBase}-optimized.webp`);

    assert.match(symptomHtml, new RegExp(`<h1 class="symptom-image-hero__sr-title">${escapeRegExp(heading)}<\\/h1>`));
    assert.match(symptomHtml, new RegExp(`<source media="\\(min-width: 768px\\)" srcset="\\.\\.\\/image\\/symptom-hero\\/${escapeRegExp(assetBase)}-optimized\\.webp">`));
    assert.match(symptomHtml, new RegExp(`<source media="\\(max-width: 767px\\)" srcset="\\.\\.\\/image\\/symptom-hero\\/${escapeRegExp(assetBase)}-sp\\.webp">`));
    assert.equal(existsSync(optimizedAsset), true, `${assetBase} should have an optimized desktop asset`);
    assert.ok(statSync(optimizedAsset).size < 450 * 1024, `${assetBase} optimized asset should stay below 450KB`);
  }
});

test("all symptom detail images reserve their rendered space", () => {
  const symptomDetailFiles = readdirSync(path.join(repoRoot, "symptoms"))
    .filter((name) => name.endsWith(".html") && name !== "index.html");

  for (const symptomFile of symptomDetailFiles) {
    const symptomHtml = readFileSync(path.join(repoRoot, "symptoms", symptomFile), "utf8");
    const imageTags = symptomHtml.match(/<img\b[^>]*>/gi) || [];

    for (const imageTag of imageTags) {
      assert.match(imageTag, /\bwidth="\d+"/, `${symptomFile} image should declare width: ${imageTag}`);
      assert.match(imageTag, /\bheight="\d+"/, `${symptomFile} image should declare height: ${imageTag}`);
    }
  }
});

test("all symptom detail pages expose BreadcrumbList structured data", () => {
  const symptomDetailFiles = readdirSync(path.join(repoRoot, "symptoms"))
    .filter((name) => name.endsWith(".html") && name !== "index.html");

  for (const symptomFile of symptomDetailFiles) {
    const symptomHtml = readFileSync(path.join(repoRoot, "symptoms", symptomFile), "utf8");
    assert.match(
      symptomHtml,
      /<script type="application\/ld\+json">[\s\S]*?"@type": "BreadcrumbList"[\s\S]*?<\/script>/,
      `${symptomFile} should expose breadcrumb structured data`
    );
  }
});

test("all symptom detail pages are indexable and listed in the sitemap", () => {
  const symptomDetailFiles = readdirSync(path.join(repoRoot, "symptoms"))
    .filter((name) => name.endsWith(".html") && name !== "index.html");
  const sitemap = readFileSync(path.join(repoRoot, "sitemap.xml"), "utf8");

  for (const symptomFile of symptomDetailFiles) {
    const symptomHtml = readFileSync(path.join(repoRoot, "symptoms", symptomFile), "utf8");
    assert.doesNotMatch(symptomHtml, /<meta\s+name="robots"[^>]*noindex/i, `${symptomFile} should be indexable`);
    assert.match(
      sitemap,
      new RegExp(`<loc>https://hizakozou\\.jp/symptoms/${escapeRegExp(symptomFile)}</loc>`),
      `${symptomFile} should be present in sitemap.xml`
    );
  }
});

test("all symptom detail pages include a compact page contents navigation", () => {
  const symptomDetailFiles = readdirSync(path.join(repoRoot, "symptoms"))
    .filter((name) => name.endsWith(".html") && name !== "index.html");

  for (const symptomFile of symptomDetailFiles) {
    const symptomHtml = readFileSync(path.join(repoRoot, "symptoms", symptomFile), "utf8");
    const toc = symptomHtml.match(/<!-- SYMPTOM_PAGE_TOC_START -->([\s\S]*?)<!-- SYMPTOM_PAGE_TOC_END -->/)?.[1] ?? "";
    assert.match(toc, /<nav class="symptom-page-toc"/, `${symptomFile} should include the page contents nav`);
    assert.match(toc, /aria-label="ページの内容"/);
    assert.ok((toc.match(/class="symptom-page-toc__link"/g) ?? []).length >= 5, `${symptomFile} should link to key sections`);
    assert.ok(toc.indexOf("なぜ起こる") < toc.indexOf("医療機関"), `${symptomFile} should present content in reading order`);
  }
});

test("symptom discovery styles are shared instead of duplicated inline", () => {
  const sharedCssPath = path.join(repoRoot, "symptoms", "site-discovery.css");
  assert.equal(existsSync(sharedCssPath), true, "site-discovery.css should exist");
  const sharedCss = readFileSync(sharedCssPath, "utf8");
  assert.match(sharedCss, /\.symptom-page-toc/);
  assert.match(sharedCss, /\.related-articles-slider/);
  assert.match(sharedCss, /\.related-symptoms/);

  const symptomDetailFiles = readdirSync(path.join(repoRoot, "symptoms"))
    .filter((name) => name.endsWith(".html") && name !== "index.html");
  for (const symptomFile of symptomDetailFiles) {
    const symptomHtml = readFileSync(path.join(repoRoot, "symptoms", symptomFile), "utf8");
    assert.match(symptomHtml, /<link rel="stylesheet" href="site-discovery\.css">/);
    assert.doesNotMatch(symptomHtml, /BLOG_RELATED_ARTICLES_STYLES_START/);
    assert.doesNotMatch(symptomHtml, /\.related-articles-slider\{padding:/);
  }
});

test("all symptom detail pages include reviewed safety guidance and public references", () => {
  const symptomDetailFiles = readdirSync(path.join(repoRoot, "symptoms"))
    .filter((name) => name.endsWith(".html") && name !== "index.html");

  assert.equal(symptomDetailFiles.length, 24);
  for (const symptomFile of symptomDetailFiles) {
    const symptomHtml = readFileSync(path.join(repoRoot, "symptoms", symptomFile), "utf8");
    const guidance = symptomHtml.match(
      /<!-- SYMPTOM_TRUST_GUIDANCE_START -->([\s\S]*?)<!-- SYMPTOM_TRUST_GUIDANCE_END -->/
    )?.[1] ?? "";

    assert.match(guidance, /執筆・内容確認/, `${symptomFile} should identify the reviewer`);
    assert.match(guidance, /川上卓哉/, `${symptomFile} should name the reviewer`);
    assert.match(guidance, /柔道整復師（国家資格）/, `${symptomFile} should show the qualification`);
    assert.match(guidance, /2026年6月23日/, `${symptomFile} should show the reviewed date`);
    assert.match(guidance, /早急に医療機関へ/, `${symptomFile} should show urgent guidance`);
    assert.match(guidance, /早めに医療機関へ/, `${symptomFile} should show prompt guidance`);
    assert.match(guidance, /整体での相談を検討できる状態/, `${symptomFile} should explain the clinic boundary`);
    assert.match(guidance, /参考情報/, `${symptomFile} should include public references`);
    assert.match(guidance, /一般的な情報提供であり、診断を目的とするものではありません/);
    assert.match(guidance, /href="\.\.\/staff\.html"/);
    assert.match(symptomHtml, /"dateModified": "2026-06-23"/);
    assert.match(symptomHtml, /"name": "川上卓哉"/);
  }
});

test("symptom patient voices retain their content and show the requested individual-results note", () => {
  const symptomDetailFiles = readdirSync(path.join(repoRoot, "symptoms"))
    .filter((name) => name.endsWith(".html") && name !== "index.html");
  let pagesWithVoices = 0;

  for (const symptomFile of symptomDetailFiles) {
    const symptomHtml = readFileSync(path.join(repoRoot, "symptoms", symptomFile), "utf8");
    const voices = symptomHtml.match(
      /<!-- SYMPTOM_PATIENT_VOICES_START -->([\s\S]*?)<!-- SYMPTOM_PATIENT_VOICES_END -->/
    )?.[1] ?? "";
    if (!voices) continue;
    pagesWithVoices += 1;
    assert.match(voices, /class="symptom-voice-card"/);
    assert.match(voices, /※効果には個人差があります/);
  }

  assert.ok(pagesWithVoices >= 5, "the existing symptom-specific voice sections should remain");
});

test("symptom pages remove audited fixed-frequency and strong outcome assertions", () => {
  const symptomDetailFiles = readdirSync(path.join(repoRoot, "symptoms"))
    .filter((name) => name.endsWith(".html") && name !== "index.html");
  const combined = symptomDetailFiles
    .map((name) => readFileSync(path.join(repoRoot, "symptoms", name), "utf8"))
    .join("\n");

  assert.doesNotMatch(combined, /最初の1〜2ヶ月は週1〜2回/);
  assert.doesNotMatch(combined, /週1〜2回を1〜2ヶ月/);
  assert.doesNotMatch(combined, /アンバランスを解消し手術回避を目指します/);
  assert.doesNotMatch(combined, /神経の通り道を広げます/);
  assert.doesNotMatch(combined, /顎関節症の根本原因となる/);
  assert.doesNotMatch(combined, /再発しにくい体づくりをサポートします/);
});

test("the six major symptom pages explain distinct roles without replacing their education sections", () => {
  const majorPages = new Map([
    ["lower-back-pain.html", "腰の重さ・動き始め・長時間同じ姿勢"],
    ["sciatica.html", "お尻から脚へ広がる痛みやしびれ"],
    ["spinal-stenosis.html", "歩行で増える脚の症状"],
    ["lumbar-disc-herniation.html", "検査で言われた診断名と現在の症状"],
    ["hip-osteoarthritis.html", "足の付け根やお尻の痛み"],
    ["knee-osteoarthritis.html", "歩き始めや階段での膝の痛み"]
  ]);
  const leads = [];

  for (const [fileName, expectedFocus] of majorPages) {
    const symptomHtml = readFileSync(path.join(repoRoot, "symptoms", fileName), "utf8");
    const guide = symptomHtml.match(/<section class="symptom-major-guide"[\s\S]*?<\/section>/)?.[0] ?? "";
    assert.match(guide, /data-major-symptom-guide/, `${fileName} should include its positioning guide`);
    assert.match(guide, new RegExp(escapeRegExp(expectedFocus)), `${fileName} should explain its distinct focus`);
    assert.match(symptomHtml, /_EDUCATION_START -->/, `${fileName} should preserve its page-owned education section`);
    leads.push(stripHtmlTags(guide).replace(/\s+/g, " ").trim());
  }

  assert.equal(new Set(leads).size, majorPages.size, "major-page positioning guides should not be duplicated");
});

test("symptom directory offers location, movement, and diagnosis entry modes with a no-js location fallback", () => {
  assert.match(symptomDirectoryHtml, /role="tablist"/);
  assert.match(symptomDirectoryHtml, /data-directory-mode="location"/);
  assert.match(symptomDirectoryHtml, /data-directory-mode="movement"/);
  assert.match(symptomDirectoryHtml, /data-directory-mode="diagnosis"/);
  assert.match(symptomDirectoryHtml, /aria-selected="true"[^>]*data-directory-mode="location"/);
  assert.match(symptomDirectoryHtml, /data-directory-panel="location"/);
  assert.match(symptomDirectoryHtml, /data-directory-panel="movement"/);
  assert.match(symptomDirectoryHtml, /data-directory-panel="diagnosis"/);
  assert.match(symptomDirectoryHtml, /朝の一歩目が痛い/);
  assert.match(symptomDirectoryHtml, /長く歩くと脚がしびれる/);
  assert.match(symptomDirectoryHtml, /病院で言われた名前から探す/);
  assert.doesNotMatch(symptomDirectoryHtml, /data-directory-panel="location"[^>]*hidden/);

  for (const href of symptomDirectoryHtml.matchAll(/class="symptom-directory__link" href="([^"]+\.html)"/g)) {
    assert.equal(existsSync(path.join(repoRoot, "symptoms", href[1])), true, `directory target should exist: ${href[1]}`);
  }
});

test("tracking runtime records symptom exploration without creating ad conversions", () => {
  const explorationEvents = [
    "symptom_directory_mode_select",
    "symptom_directory_link_click",
    "symptom_toc_click",
    "related_symptom_click",
    "related_article_click",
    "medical_reference_click",
    "staff_profile_click"
  ];

  assert.match(trackingJs, /window\.hkTrackEvent/);
  for (const eventName of explorationEvents) {
    assert.match(trackingJs, new RegExp(escapeRegExp(eventName)));
  }
  assert.match(trackingJs, /directory_mode/);
  assert.match(trackingJs, /target_symptom_slug/);
  const explorationHelper = trackingJs.match(/window\.hkTrackEvent[\s\S]*?\n  };/)?.[0] ?? "";
  assert.doesNotMatch(explorationHelper, /"conversion"|send_to|buildSendTo/);
});

test("symptom page 28-day evaluation template records the baseline and comparison metrics", () => {
  assert.equal(existsSync(symptomEvaluationPath), true, "the 28-day evaluation template should exist");
  assert.match(symptomEvaluation, /2026年6月23日/);
  assert.match(symptomEvaluation, /Search Console/);
  assert.match(symptomEvaluation, /GA4/);
  assert.match(symptomEvaluation, /直前28日/);
  assert.match(symptomEvaluation, /公開後28日/);
  for (const slug of [
    "lower-back-pain",
    "sciatica",
    "spinal-stenosis",
    "lumbar-disc-herniation",
    "hip-osteoarthritis",
    "knee-osteoarthritis"
  ]) {
    assert.match(symptomEvaluation, new RegExp(escapeRegExp(slug)));
  }
});

test("large patient voice sheets use optimized WebP previews while keeping original links", () => {
  const optimizedVoiceImages = [
    ["patient-voice-yo-knee-optimized.webp", "patient-voice-yo-knee.png"],
    ["patient-voice-ym-hip-optimized.webp", "patient-voice-ym-hip.png"]
  ];

  for (const [optimizedImage, originalImage] of optimizedVoiceImages) {
    const optimizedPath = path.join(repoRoot, "image", optimizedImage);
    assert.equal(existsSync(optimizedPath), true, `${optimizedImage} should exist`);
    assert.ok(statSync(optimizedPath).size < 350 * 1024, `${optimizedImage} should stay below 350 KB`);
    assert.match(voicesHtml, new RegExp(`src="image/${escapeRegExp(optimizedImage)}"`));
    assert.match(voicesHtml, new RegExp(`href="image/${escapeRegExp(originalImage)}"`));
  }

  const kneeHtml = readFileSync(path.join(repoRoot, "symptoms", "knee-osteoarthritis.html"), "utf8");
  const hipHtml = readFileSync(path.join(repoRoot, "symptoms", "hip-osteoarthritis.html"), "utf8");
  assert.match(kneeHtml, /src="\.\.\/image\/patient-voice-yo-knee-optimized\.webp"/);
  assert.match(kneeHtml, /href="\.\.\/image\/patient-voice-yo-knee\.png"/);
  assert.match(hipHtml, /src="\.\.\/image\/patient-voice-ym-hip-optimized\.webp"/);
  assert.match(hipHtml, /href="\.\.\/image\/patient-voice-ym-hip\.png"/);
});

test("cervical and elbow metadata avoids outcome and cause assertions", () => {
  const cervicalHtml = readFileSync(path.join(repoRoot, "symptoms", "cervical-spondylosis.html"), "utf8");
  const elbowHtml = readFileSync(path.join(repoRoot, "symptoms", "elbow-tendinopathy.html"), "utf8");
  const cervicalHead = cervicalHtml.match(/<head>[\s\S]*?<\/head>/)?.[0] ?? "";
  const elbowHead = elbowHtml.match(/<head>[\s\S]*?<\/head>/)?.[0] ?? "";

  assert.doesNotMatch(cervicalHead, /動作改善の流れを改善します/);
  assert.match(cervicalHead, /首・肩・胸郭の動きや姿勢を確認し、負担を減らす方法をご提案します/);
  assert.doesNotMatch(elbowHead, /家事が原因の方|上肢全体を改善します/);
  assert.match(elbowHead, /仕事や家事で負担が重なる肘だけでなく、肩・胸郭・手首の動きも確認します/);
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

test("LP exposes LocalBusiness with founder and omits inapplicable rich-result schema", () => {
  const localBusinessBlocks = getJsonLdBlocks("LocalBusiness");
  const medicalClinicBlocks = getJsonLdBlocks("MedicalClinic");
  const faqBlocks = getJsonLdBlocks("FAQPage");

  assert.equal(localBusinessBlocks.length, 1, "LP should include one LocalBusiness schema block");
  assert.equal(medicalClinicBlocks.length, 0, "LP should not describe the clinic as a MedicalClinic");
  assert.equal(faqBlocks.length, 0, "LP should not keep FAQPage rich-result markup");
  assert.deepEqual(localBusinessBlocks[0].founder, {
    "@type": "Person",
    name: "川上卓哉",
    jobTitle: "柔道整復師",
    url: "https://hizakozou.jp/staff.html"
  });
  assert.equal(localBusinessBlocks[0].hasMap.includes("output=embed"), true, "map URL should be embeddable");
  assert.match(html, /<section id="faq"[\s\S]*?<h2[^>]*>よくある質問<\/h2>/);
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
  assert.match(html, /class="voice-reassurance-copy"/);
  assert.match(html, /一人で悩まなくて/);
  assert.match(html, /大丈夫です！/);
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
  assert.match(html, /<h2 id="voice-trust-title" class="voice-reassurance-copy__headline">/);
  assert.match(html, /一人で悩まなくて/);
  assert.match(html, /大丈夫です！/);
  assert.match(html, /歩く喜びを取り戻しています。/);
  assert.match(html, /私にお任せください。/);
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
  assert.doesNotMatch(mainCss, /@media \(max-width: 640px\)[\s\S]*\.voice-trust__assurance\s*\{\s*display:\s*none/);
  assert.match(mainCss, /@media \(max-width: 640px\)[\s\S]*\.voice-trust__assurance\s*\{[\s\S]*display:\s*block/);
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
    ["symptoms/index.html", "すべての症状を見る"],
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
  assert.match(mainCss, /@media \(max-width:\s*768px\)[\s\S]*\.hero-photo-frame\s*\{[\s\S]*aspect-ratio:\s*1448\s*\/\s*1086\s*;/);
  assert.match(html, /@media \(max-width:\s*768px\)[\s\S]*\.hero-fixed \.hero-photo-frame\s*\{[\s\S]*aspect-ratio:\s*1448\s*\/\s*1086\s*!important;/);
  assert.match(html, /@media \(max-width:\s*768px\)[\s\S]*\.hero-fixed \.hero-photo\s*\{[\s\S]*height:\s*100%\s*!important;/);
  assert.match(html, /@media \(max-width:\s*768px\)[\s\S]*\.hero-fixed \.hero-photo\s*\{[\s\S]*object-fit:\s*cover\s*!important;/);
});

test("LP mobile hero title and fixed CTA stay compact on narrow screens", () => {
  assert.match(html, /font-size:\s*clamp\(1\.42rem,\s*6vw,\s*3\.6rem\)\s*!important;/);
  assert.doesNotMatch(html, /font-size:\s*clamp\(2rem,\s*8\.6vw,\s*4rem\)/);
  assert.match(html, /<span class="mobile-fixed-cta__label">LINEで空き状況を確認<\/span>/);
  assert.doesNotMatch(getSectionSlice('class="fixed bottom-0', '<script src="scripts/main.js'), /tel:0471143274/);
  assert.doesNotMatch(getSectionSlice('class="fixed bottom-0', '<script src="scripts/main.js'), /LINEで予約する/);
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
  const approach = getSectionSlice('id="msm-method"', 'id="clinic-reasons"');
  const fixedCta = getSectionSlice('class="fixed bottom-0', '<script src="scripts/main.js');

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
  assert.match(price, /<p class="hk-pricing-copy__line">多くの方から感謝の声を頂いています。まずは一度試してください。<\/p>/);
  assert.match(price, /<p class="hk-pricing-copy__line">足腰のつらさを一緒に整理し、動きやすい身体づくりをサポートします。<\/p>/);
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
  assert.match(price, /LINEで相談・予約する/);
  assert.doesNotMatch(price, /LINEで1分かんたん仮予約|LINEで１分かんたん仮予約/);
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
    "整体でできること・できないこと",
    "病院と併用しながら相談できます",
    "当院は医療機関ではありません",
    "膝や歩き方のお悩みでご相談いただいた方の声",
    "当院での施術の流れ",
    "初回限定",
    "1,980"
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
  assert.equal((kneeHtml.match(/<h1\b/g) ?? []).length, 1, "knee osteoarthritis LP should expose one accessible H1");
  assert.match(kneeHtml, /<section class="symptom-image-hero">\s*<h1 class="symptom-image-hero__sr-title">膝痛・変形性膝関節症<\/h1>\s*<picture>\s*<source media="\(min-width: 768px\)" srcset="\.\.\/image\/symptom-hero\/変形性膝関節症-optimized\.webp">\s*<source media="\(max-width: 767px\)" srcset="\.\.\/image\/symptom-hero\/変形性膝関節症-sp\.webp">\s*<img\s+src="\.\.\/image\/symptom-hero\/変形性膝関節症\.webp"\s+alt="変形性膝関節症でお悩みの方へ"[\s\S]*?class="symptom-image-hero__image"[\s\S]*?fetchpriority="high"[\s\S]*?decoding="async"[\s\S]*?>\s*<\/picture>\s*<\/section>/);
  assert.doesNotMatch(kneeHtml, /<section class="hero">/);

  for (const copy of requiredCopy) {
    assert.match(kneeHtml, new RegExp(escapeRegExp(copy)), `knee osteoarthritis LP should include: ${copy}`);
  }

  for (const question of expectedFaqs) {
    assert.match(kneeHtml, new RegExp(escapeRegExp(question)), `FAQ should include: ${question}`);
  }

  assert.match(kneeHtml, /href="https:\/\/lin\.ee\/X01F2mP"/);
  assert.match(kneeHtml, /href="tel:0471143274"/);
  assert.match(kneeHtml, /<section id="price" class="hk-pricing-section"/);
  assert.match(kneeHtml, /<section id="access" class="py-14 bg-white"/);
  assert.match(kneeHtml, /<div id="contact" class="contact-form-section/);
  assert.match(kneeHtml, /href="\.\.\/access\.html"/);

  for (const pattern of forbiddenPatterns) {
    assert.doesNotMatch(kneeHtml, pattern, `knee osteoarthritis LP should avoid ${pattern}`);
  }
});

test("major symptom pages use approved pricing sections", () => {
  const topPricingStart = html.indexOf('<section id="price" class="hk-pricing-section"');
  const topPricingEnd = html.indexOf("</section>", topPricingStart) + "</section>".length;
  const normalizeLineEndings = (value) => value.replace(/\r\n/g, "\n").trim();
  const topPricingSection = normalizeLineEndings(html.slice(topPricingStart, topPricingEnd));
  const symptomPricingCss = readFileSync(new URL("../symptoms/site-pricing.css", import.meta.url), "utf8");
  const symptomHeaderJs = readFileSync(new URL("../symptoms/site-header.js", import.meta.url), "utf8");
  const targetPages = [
    "symptoms/lower-back-pain.html",
    "symptoms/sciatica.html",
    "symptoms/spinal-stenosis.html",
    "symptoms/knee-osteoarthritis.html",
    "symptoms/hip-osteoarthritis.html",
    "symptoms/lumbar-disc-herniation.html",
    "symptoms/ankle-stiffness-knee-pain.html",
    "symptoms/bowlegs-knee-pain.html",
    "symptoms/carpal-tunnel.html",
    "symptoms/cervical-spondylosis.html",
    "symptoms/elbow-tendinopathy.html",
    "symptoms/frozen-shoulder.html",
    "symptoms/knee-effusion.html",
    "symptoms/knee-front-pain.html",
    "symptoms/knee-hyperextension.html",
    "symptoms/knee-lateral-pain.html",
    "symptoms/knee-posterior-pain.html",
    "symptoms/meniscus-knee-pain.html",
    "symptoms/pes-anserine-bursitis.html",
    "symptoms/plantar-fasciitis.html",
    "symptoms/scoliosis.html",
    "symptoms/shoulder-stiffness.html",
    "symptoms/thoracic-outlet.html",
    "symptoms/tmj.html"
  ];
  const initialOnlyPricingPages = new Set([
    "symptoms/sciatica.html",
    "symptoms/knee-osteoarthritis.html",
    "symptoms/lower-back-pain.html",
    "symptoms/spinal-stenosis.html",
    "symptoms/lumbar-disc-herniation.html",
    "symptoms/ankle-stiffness-knee-pain.html",
    "symptoms/bowlegs-knee-pain.html",
    "symptoms/carpal-tunnel.html",
    "symptoms/cervical-spondylosis.html",
    "symptoms/elbow-tendinopathy.html",
    "symptoms/frozen-shoulder.html",
    "symptoms/hip-osteoarthritis.html",
    "symptoms/knee-effusion.html",
    "symptoms/knee-front-pain.html",
    "symptoms/knee-hyperextension.html",
    "symptoms/knee-lateral-pain.html",
    "symptoms/knee-posterior-pain.html",
    "symptoms/meniscus-knee-pain.html",
    "symptoms/pes-anserine-bursitis.html",
    "symptoms/plantar-fasciitis.html",
    "symptoms/scoliosis.html",
    "symptoms/shoulder-stiffness.html",
    "symptoms/thoracic-outlet.html",
    "symptoms/tmj.html"
  ]);

  assert.ok(topPricingStart > -1, "top page pricing section should exist");
  assert.match(symptomPricingCss, /\.hk-pricing-section\s*{/);
  assert.match(symptomPricingCss, /\.hk-pricing-price__num\s*{[\s\S]*font-size:\s*clamp\(4\.3rem,\s*18vw,\s*7\.2rem\);/);
  assert.match(symptomPricingCss, /@media\s*\(max-width:\s*390px\)\s*{[\s\S]*\.hk-pricing-price\s*{[\s\S]*flex-wrap:\s*wrap;/);
  assert.match(symptomHeaderJs, /const deadlineEl = document\.querySelector\('\[data-deadline\]'\);/);

  for (const page of targetPages) {
    const pageHtml = readPageIfExists(page);
    const priceMatches = pageHtml.match(/<section id="price" class="hk-pricing-section"/g) ?? [];
    const priceStart = pageHtml.indexOf('<section id="price" class="hk-pricing-section"');
    const priceEnd = pageHtml.indexOf("</section>", priceStart) + "</section>".length;
    const priceSection = normalizeLineEndings(pageHtml.slice(priceStart, priceEnd));

    assert.equal(priceMatches.length, 1, `${page} should have exactly one pricing section`);
    assert.match(pageHtml, /<link rel="stylesheet" href="site-pricing\.css">/, `${page} should load the shared pricing CSS`);
    assert.doesNotMatch(pageHtml, /<section class="lp-pricing">/, `${page} should not keep the old lp-pricing block`);
    assert.match(priceSection, /href="tel:0471143274" class="hk-pricing-call"/, `${page} should keep the top-page phone link`);
    assert.match(priceSection, /href="https:\/\/lin\.ee\/X01F2mP" target="_blank" rel="noopener noreferrer" class="hk-pricing-line"/, `${page} should keep the top-page LINE link`);
    if (initialOnlyPricingPages.has(page)) {
      assert.match(priceSection, /初回カウンセリング＋全身整体コース/, `${page} should explain the first-visit course`);
      assert.match(priceSection, /1,980/, `${page} should show the first-visit price`);
      assert.doesNotMatch(priceSection, /通常施術費|10,000円|全額返金保証|data-deadline|data-remaining|回数券/, `${page} should not show regular fees, scarcity, or ticket copy`);
    } else {
      assert.equal(priceSection, topPricingSection, `${page} should copy the top-page pricing HTML exactly`);
      assert.match(priceSection, /data-deadline/, `${page} should keep the deadline hook`);
      assert.match(priceSection, /data-remaining/, `${page} should keep the remaining-slots hook`);
    }
  }
});

test("major symptom pages replace concerns with top-page troubles-check layout", () => {
  const targetPages = [
    {
      page: "symptoms/lower-back-pain.html",
      aria: "腰痛でよくあるお悩み",
      heroSrc: "../image/symptom-hero/腰痛・ギックリ腰.webp",
      heroMobileSrc: "../image/symptom-hero/腰痛・ギックリ腰-sp.webp",
      heroAlt: "腰痛・ぎっくり腰でお悩みの方へ",
      items: [
        "長い間、<strong>慢性的な腰痛</strong>に悩まされている",
        "立ち上がりや歩き始めに<strong>腰が痛む</strong>",
        "長く立っていたり歩いたりすると<strong>足腰がつらい</strong>",
        "寝返りのたびに腰が痛くて<strong>目が覚める</strong>",
        "毎朝、腰の重さやこわばりを感じている",
        "整形外科や整骨院に通っても<strong>満足できなかった</strong>",
        "薬やブロック注射に<strong>頼り続けたくない</strong>",
        "もうこの腰痛は良くならないと<strong>諦めている</strong>"
      ]
    },
    {
      page: "symptoms/sciatica.html",
      aria: "坐骨神経痛でよくあるお悩み",
      heroSrc: "../image/symptom-hero/坐骨神経痛.webp",
      heroMobileSrc: "../image/symptom-hero/坐骨神経痛-sp.webp",
      heroAlt: "坐骨神経痛でお悩みの方へ",
      items: [
        "お尻から脚にかけて<strong>痛みやしびれ</strong>がある",
        "長く座っていると<strong>お尻や脚がつらくなる</strong>",
        "立ち上がりや歩き始めに<strong>電気が走るように痛む</strong>",
        "長く歩くと<strong>脚のしびれが強くなる</strong>",
        "寝ているときも脚が痛み、<strong>目が覚める</strong>",
        "病院で坐骨神経痛と言われたが<strong>変化を感じられない</strong>",
        "薬や注射に<strong>頼り続けたくない</strong>",
        "痛みやしびれが不安で、<strong>外出を控えている</strong>"
      ]
    },
    {
      page: "symptoms/spinal-stenosis.html",
      aria: "脊柱管狭窄症でよくあるお悩み",
      heroSrc: "../image/symptom-hero/脊柱菅狭窄症.webp",
      heroMobileSrc: "../image/symptom-hero/脊柱菅狭窄症-sp.webp",
      heroAlt: "脊柱管狭窄症でお悩みの方へ",
      items: [
        "少し歩くと脚が痛くなり、<strong>休憩が必要になる</strong>",
        "お尻や太もも、ふくらはぎに<strong>しびれや重さ</strong>がある",
        "立ち続けていると<strong>足腰がつらくなる</strong>",
        "前かがみになると<strong>少し楽に感じる</strong>",
        "買い物や散歩で<strong>長い距離を歩けなくなった</strong>",
        "病院で脊柱管狭窄症と言われ、<strong>手術が不安</strong>",
        "薬やブロック注射に<strong>頼り続けたくない</strong>",
        "このまま歩けなくなるのではと<strong>不安を感じている</strong>"
      ]
    },
    {
      page: "symptoms/knee-osteoarthritis.html",
      aria: "変形性膝関節症でよくあるお悩み",
      heroSrc: "../image/symptom-hero/変形性膝関節症.webp",
      heroMobileSrc: "../image/symptom-hero/変形性膝関節症-sp.webp",
      heroAlt: "変形性膝関節症でお悩みの方へ",
      items: [
        "歩き始めや立ち上がりで<strong>膝が痛む</strong>",
        "階段の上り下りで<strong>膝に強い負担を感じる</strong>",
        "正座やしゃがむ動作が<strong>できなくなってきた</strong>",
        "膝に水がたまる、<strong>腫れぼったい感じ</strong>がある",
        "膝の曲げ伸ばしで<strong>引っかかりや違和感</strong>がある",
        "朝起きたときに膝がこわばり、<strong>動きにくい</strong>",
        "整形外科で<strong>「年齢のせい」</strong>と言われた",
        "もう以前のようには歩けないと<strong>諦めている</strong>"
      ]
    },
    {
      page: "symptoms/hip-osteoarthritis.html",
      aria: "変形性股関節症でよくあるお悩み",
      heroSrc: "../image/symptom-hero/変形性股関節症.webp",
      heroMobileSrc: "../image/symptom-hero/変形性股関節症-sp.webp",
      heroAlt: "変形性股関節症でお悩みの方へ",
      items: [
        "足の付け根やお尻に<strong>痛みや違和感</strong>がある",
        "歩き始めや長く歩いたあとに<strong>股関節が痛む</strong>",
        "靴下を履く、足の爪を切る動作が<strong>つらい</strong>",
        "階段や片脚で立つと<strong>股関節が痛む</strong>",
        "車の乗り降りや方向転換が<strong>しづらい</strong>",
        "夜寝ていても股関節が痛くて<strong>目が覚める</strong>",
        "病院で手術を勧められたが、<strong>できれば避けたい</strong>",
        "このまま歩けなくなるのではと<strong>不安を感じている</strong>"
      ]
    },
    {
      page: "symptoms/lumbar-disc-herniation.html",
      aria: "腰椎椎間板ヘルニアでよくあるお悩み",
      heroSrc: "../image/symptom-hero/椎間板ヘルニア.webp",
      heroMobileSrc: "../image/symptom-hero/椎間板ヘルニア-sp.webp",
      heroAlt: "椎間板ヘルニアでお悩みの方へ",
      items: [
        "腰からお尻、脚にかけて<strong>痛みやしびれ</strong>がある",
        "長時間座っていると<strong>腰や脚がつらくなる</strong>",
        "前かがみになると<strong>痛みやしびれが強くなる</strong>",
        "立ち上がるときに<strong>腰から脚へ痛みが走る</strong>",
        "咳やくしゃみをすると<strong>腰に響く</strong>",
        "寝返りや起き上がりで腰が痛み、<strong>目が覚める</strong>",
        "病院でヘルニアと言われたが<strong>なかなか変化がない</strong>",
        "薬や注射、手術に頼る前に<strong>できることを探している</strong>"
      ]
    }
  ];

  for (const { page, aria, heroSrc, heroMobileSrc, heroAlt, items } of targetPages) {
    const pageHtml = readPageIfExists(page);
    const heroIndex = pageHtml.indexOf('<section class="symptom-image-hero">');
    const troublesIndex = pageHtml.indexOf('<section id="troubles" class="troubles-check">');
    const flowIndex = pageHtml.indexOf('<section id="flow" class="flow-slider"');
    const sectionEnd = pageHtml.indexOf("</section>", troublesIndex) + "</section>".length;
    const section = pageHtml.slice(troublesIndex, sectionEnd);
    const resolvedHeroImage = path.join(repoRoot, path.dirname(page), heroSrc);
    const resolvedHeroMobileImage = path.join(repoRoot, path.dirname(page), heroMobileSrc);

    assert.ok(heroIndex > -1 && heroIndex < troublesIndex && troublesIndex < flowIndex, `${page} should keep image hero, troubles, flow order`);
    assert.doesNotMatch(pageHtml, /<section class="hero">/, `${page} should remove the old blue hero section`);
    assert.match(pageHtml, new RegExp(`<img\\s+src="${escapeRegExp(heroSrc)}"\\s+alt="${escapeRegExp(heroAlt)}"[\\s\\S]*?width="1600"[\\s\\S]*?height="900"[\\s\\S]*?class="symptom-image-hero__image"[\\s\\S]*?fetchpriority="high"[\\s\\S]*?decoding="async"`), `${page} should use the requested hero image`);
    assert.match(pageHtml, new RegExp(`<source\\s+media="\\(max-width: 767px\\)"\\s+srcset="${escapeRegExp(heroMobileSrc)}"`), `${page} should use the requested mobile hero image`);
    assert.match(pageHtml, /\.symptom-image-hero\s*{[\s\S]*width:\s*100%;[\s\S]*background-color:\s*#faf7f1/);
    assert.match(pageHtml, /\.symptom-image-hero picture,\.symptom-image-hero__image\s*{[\s\S]*width:\s*100%;[\s\S]*height:\s*auto;[\s\S]*object-fit:\s*contain/);
    assert.match(pageHtml, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.symptom-image-hero\s*{[\s\S]*margin-left:\s*0/);
    assert.ok(existsSync(resolvedHeroImage), `${page} should reference an existing hero image`);
    assert.ok(existsSync(resolvedHeroMobileImage), `${page} should reference an existing mobile hero image`);
    assert.equal((pageHtml.match(/id="troubles"/g) ?? []).length, 1, `${page} should have one troubles id`);
    assert.equal((section.match(/<li>/g) ?? []).length, 8, `${page} should render eight concerns`);
    assert.match(section, /<h2>こんなお悩みを抱えていませんか？<\/h2>/, `${page} should use the top-page heading`);
    assert.match(section, new RegExp(`aria-label="${escapeRegExp(aria)}"`), `${page} should use the requested aria label`);
    assert.doesNotMatch(pageHtml, /<section class="concerns">/, `${page} should remove the old concerns section`);
    assert.doesNotMatch(section, /一つでも当てはまる方は|concern-item|concerns__footer/, `${page} should not keep old concern content`);
    assert.match(pageHtml, /\/\* Copied from top page troubles-check section\. \*\//, `${page} should include copied troubles CSS`);
    assert.match(pageHtml, /\.troubles-check__heading::after\s*{[\s\S]*border-top:\s*18px solid #e4e4e4;/, `${page} should keep the top-page heading triangle`);
    assert.match(pageHtml, /@media\s*\(max-width:\s*480px\)\s*{[\s\S]*\.troubles-check__list li::after\s*{[\s\S]*width:\s*24px;/, `${page} should keep the mobile troubles CSS`);

    for (const item of items) {
      assert.match(section, new RegExp(escapeRegExp(`<li>${item}</li>`)), `${page} should include concern: ${item}`);
    }
  }
});

test("all symptom detail pages use the lower-back troubles-check design", () => {
  const detailPages = readdirSync(path.join(repoRoot, "symptoms"))
    .filter((name) => name.endsWith(".html") && name !== "index.html")
    .sort();

  assert.equal(detailPages.length, 24, "the complete symptom detail page set should be covered");

  for (const fileName of detailPages) {
    const page = `symptoms/${fileName}`;
    const pageHtml = readPageIfExists(page);
    const troublesMatches = pageHtml.match(/<section id="troubles" class="troubles-check">/g) ?? [];
    const troublesIndex = pageHtml.indexOf('<section id="troubles" class="troubles-check">');
    const sectionEnd = pageHtml.indexOf("</section>", troublesIndex) + "</section>".length;
    const section = troublesIndex > -1 ? pageHtml.slice(troublesIndex, sectionEnd) : "";

    assert.equal(troublesMatches.length, 1, `${page} should have exactly one troubles-check section`);
    assert.match(section, /<h2>こんなお悩みを抱えていませんか？<\/h2>/, `${page} should use the lower-back heading`);
    assert.equal((section.match(/<li>/g) ?? []).length, 8, `${page} should show eight symptom-specific concerns`);
    assert.match(section, /<ul class="troubles-check__list" aria-label="[^"]+でよくあるお悩み">/, `${page} should provide a symptom-specific aria label`);
    assert.ok((section.match(/<strong>[^<]+<\/strong>/g) ?? []).length >= 4, `${page} should use red emphasis on key phrases`);
    assert.doesNotMatch(pageHtml, /<section class="concerns">/, `${page} should remove the legacy concerns section`);
    assert.doesNotMatch(section, /concern-item|concerns__footer|一つでも当てはまる方は/, `${page} should not retain legacy concern markup`);
    assert.match(pageHtml, /\/\* Copied from top page troubles-check section\. \*\//, `${page} should include the shared troubles-check CSS`);
    assert.match(pageHtml, /\.troubles-check__heading::after\s*{[\s\S]*border-top:\s*18px solid #e4e4e4;/, `${page} should keep the heading triangle`);
    assert.match(pageHtml, /\.troubles-check__list li::before\s*{[\s\S]*border:\s*2px solid #222;/, `${page} should keep the checkbox outline`);
    assert.match(pageHtml, /\.troubles-check__list li::after\s*{[\s\S]*border-left:\s*4px solid #e3342f;[\s\S]*border-bottom:\s*4px solid #e3342f;/, `${page} should keep the red check mark`);
    assert.match(pageHtml, /@media\s*\(max-width:\s*480px\)\s*{[\s\S]*\.troubles-check__list li::after\s*{[\s\S]*width:\s*24px;/, `${page} should keep the compact mobile layout`);
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
    ["index.html", "すべての症状を見る"]
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
  assert.match(headerCss, /@media\s*\(max-width:\s*1079px\)/, "the mobile header should activate before the desktop columns overflow");
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
    "../image/flow-counseling-board-768.webp",
    "../image/flow-movement-assessment-768.webp",
    "../image/flow-plan-consultation-768.webp",
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
  assert.match(flowCss, /\.flow-slider__slides\s*\{[\s\S]*touch-action:\s*pan-y;[\s\S]*user-select:\s*none;/);
  assert.match(flowCss, /@media \(max-width: 640px\)\s*\{[\s\S]*\.flow-slider__arrow\s*\{[\s\S]*width:\s*44px;[\s\S]*height:\s*44px;/);
  assert.match(flowCss, /\.flow-swipe-hint\s*\{[\s\S]*text-align:\s*center;[\s\S]*font-size:\s*0\.9rem;[\s\S]*margin-top:\s*12px;[\s\S]*color:\s*#1f5f4a;/);
  assert.match(flowCss, /\.flow-swipe-arrow\s*\{[\s\S]*display:\s*inline-block;[\s\S]*margin-left:\s*8px;[\s\S]*animation:\s*swipeArrow 1\.2s ease-in-out infinite;/);
  assert.match(flowCss, /@keyframes swipeArrow\s*\{[\s\S]*0%\s*\{\s*transform:\s*translateX\(0\);\s*opacity:\s*0\.5;\s*\}[\s\S]*50%\s*\{\s*transform:\s*translateX\(8px\);\s*opacity:\s*1;\s*\}[\s\S]*100%\s*\{\s*transform:\s*translateX\(0\);\s*opacity:\s*0\.5;\s*\}/);
  assert.doesNotMatch(flowCss, /flow-slider__hint/);
  assert.match(headerJs, /const setupFlowSlider = \(\) =>/);
  assert.match(headerJs, /document\.querySelectorAll\('\[data-flow-slider\]'\)/);
  assert.match(headerJs, /slider\.classList\.add\('is-enhanced'\)/);
  assert.match(headerJs, /querySelector\('\.flow-slider__slides'\)/);
  assert.match(headerJs, /swipeMinDistance\s*=\s*44/);
  assert.match(headerJs, /pointerdown/);
  assert.match(headerJs, /pointerup/);
  assert.match(headerJs, /pointercancel/);
  assert.match(headerJs, /setSlide\(deltaX < 0 \? currentIndex \+ 1 : currentIndex - 1\)/);
  assert.match(headerJs, /event\.key === 'ArrowLeft'/);
  assert.match(headerJs, /event\.key === 'ArrowRight'/);
  assert.match(headerJs, /setupFlowSlider\(\);/);
});

test("symptom pages place the treatment flow directly above the FAQ", () => {
  const symptomDir = path.join(repoRoot, "symptoms");
  const symptomPages = readdirSync(symptomDir).filter((name) => name.endsWith(".html") && name !== "index.html");

  for (const fileName of symptomPages) {
    const symptomHtml = readFileSync(path.join(symptomDir, fileName), "utf8");
    const flowMatches = [...symptomHtml.matchAll(/<section id="flow" class="flow-slider"/g)];
    const flowStart = symptomHtml.indexOf('<section id="flow" class="flow-slider"');
    const flowEnd = symptomHtml.indexOf("</section>", flowStart) + "</section>".length;
    const faqStart = symptomHtml.indexOf('<section class="faq" id="faq">');
    const betweenFlowAndFaq = symptomHtml.slice(flowEnd, faqStart);

    assert.equal(flowMatches.length, 1, `${fileName} should contain exactly one treatment flow`);
    assert.ok(flowStart > -1, `${fileName} should contain the treatment flow`);
    assert.ok(faqStart > flowEnd, `${fileName} should place the FAQ after the treatment flow`);
    assert.match(betweenFlowAndFaq, /^\s*$/, `${fileName} should place the treatment flow directly above the FAQ`);
  }
});

test("symptom treatment flow uses body-neutral image descriptions", () => {
  const symptomDir = path.join(repoRoot, "symptoms");
  const detailPages = readdirSync(symptomDir).filter((name) => name.endsWith(".html") && name !== "index.html");

  for (const fileName of detailPages) {
    const symptomHtml = readFileSync(path.join(symptomDir, fileName), "utf8");
    const flowStart = symptomHtml.indexOf('<section id="flow" class="flow-slider"');
    const faqStart = symptomHtml.indexOf('<section class="faq" id="faq">', flowStart);
    const flowBlock = symptomHtml.slice(flowStart, faqStart);

    assert.doesNotMatch(flowBlock, /股関節や膝の動きを確認している様子|膝や股関節まわりへの施術の様子/, `${fileName} should not describe the shared flow as knee-only`);
    assert.match(flowBlock, /身体の動きや姿勢を確認している様子/);
    assert.match(flowBlock, /身体の状態に合わせて施術を行っている様子/);
  }
});

test("symptom pages are indexable and remove fixed visit promises", () => {
  const symptomDir = path.join(repoRoot, "symptoms");
  const detailPages = readdirSync(symptomDir).filter((name) => name.endsWith(".html") && name !== "index.html");
  const noindexPages = detailPages
    .filter((fileName) => /<meta name="robots" content="noindex,follow">/.test(readFileSync(path.join(symptomDir, fileName), "utf8")))
    .sort();

  assert.deepEqual(noindexPages, []);

  for (const fileName of ["cervical-spondylosis.html", "plantar-fasciitis.html"]) {
    const symptomHtml = readFileSync(path.join(symptomDir, fileName), "utf8");
    assert.doesNotMatch(symptomHtml, /週1〜2回の施術を1〜2ヶ月|2〜8回：週1〜2回|2週に1回→月1回|安定期：2週〜月1回/);
    assert.match(symptomHtml, /状態には個人差があります/);
  }
});

test("thoracic outlet FAQ avoids clinic-side diagnosis and outcome guarantees", () => {
  const faq = thoracicOutletHtml.match(/<section class="faq" id="faq">[\s\S]*?<\/section>/)?.[0] ?? "";

  assert.ok(faq);
  assert.doesNotMatch(faq, /当院でもこれらの検査を行っています|検査で判断することが多く|完全になくなりますか|症状を改善するため/);
  assert.match(faq, /医療機関での確認/);
  assert.match(faq, /状態には個人差があります/);
});

test("symptom pages reuse the top-page static FAQ design", () => {
  const symptomDir = path.join(repoRoot, "symptoms");
  const symptomPages = readdirSync(symptomDir).filter((name) => name.endsWith(".html") && name !== "index.html");
  const pagesWithFaq = [];

  for (const fileName of symptomPages) {
    const symptomHtml = readFileSync(path.join(symptomDir, fileName), "utf8");
    assert.match(symptomHtml, /<link rel="stylesheet" href="site-faq\.css">/, `${fileName} should include copied top-page FAQ styles`);

    const faqStart = symptomHtml.indexOf('<section class="faq" id="faq">');
    assert.ok(faqStart > -1, `${fileName} should include the FAQ section`);
    const faqEnd = symptomHtml.indexOf("</section>", faqStart);
    const faqBlock = symptomHtml.slice(faqStart, faqEnd + "</section>".length);
    pagesWithFaq.push(fileName);

    assert.match(faqBlock, /<h2 class="section-title">&#12424;&#12367;&#12354;&#12427;&#36074;&#21839;<\/h2>/, `${fileName} should use the top FAQ heading`);
    assert.match(faqBlock, /<p class="faq__lead">&#20104;&#32004;&#21069;/, `${fileName} should include the top FAQ lead`);
    assert.match(faqBlock, /<dl class="lp-faq-list">/, `${fileName} should use the top static FAQ list`);
    assert.match(faqBlock, /<div class="lp-faq-item">/, `${fileName} should render compact FAQ items`);
    assert.match(faqBlock, /<dt>\s*<span>Q\.<\/span>/, `${fileName} should render Q labels like the top page`);
    assert.match(faqBlock, /<dd>\s*<span>A\.<\/span>/, `${fileName} should render A labels like the top page`);
    assert.match(faqBlock, /href="\.\.\/faq\.html" class="faq__more-link"/, `${fileName} should link to the shared FAQ detail page`);
    assert.doesNotMatch(faqBlock, /<details|<summary|faq__q-text|faq__a-text|chevron/, `${fileName} should remove the old accordion FAQ markup`);
  }

  assert.equal(pagesWithFaq.length, 24, "all symptom detail pages should receive the copied top-page FAQ design");

  const faqCss = readFileSync(path.join(symptomDir, "site-faq.css"), "utf8");
  assert.match(faqCss, /Copied from the top-page FAQ design/);
  assert.match(faqCss, /\.faq \.lp-faq-list\s*\{[\s\S]*border-top:\s*1px solid #e2e8f0;[\s\S]*background:\s*#fff;/);
  assert.match(faqCss, /\.faq dt\s*\{[\s\S]*color:\s*#15803d;[\s\S]*font-size:\s*1\.12rem;/);
  assert.match(faqCss, /\.faq dt span\s*\{[\s\S]*color:\s*#2563eb;/);
  assert.match(faqCss, /\.faq dd\s*\{[\s\S]*color:\s*#111827;[\s\S]*line-height:\s*1\.85;/);
  assert.match(faqCss, /\.faq dd span\s*\{[\s\S]*color:\s*#dc2626;/);
  assert.match(faqCss, /@media \(max-width: 640px\)\s*\{[\s\S]*\.faq \.lp-faq-item\s*\{[\s\S]*padding:\s*0\.78rem 0;/);
});

test("symptom related cards show an absolute arrow affordance without extra CTA text", () => {
  const symptomDir = path.join(repoRoot, "symptoms");
  const arrowPattern = /<span class="related-symptom-card__arrow" aria-hidden="true">›<\/span>/g;

  assert.match(siteDiscoveryCss, /\.related-symptom-card\{[^}]*position:relative[^}]*padding:1rem 3\.25rem 1rem 1rem/);
  assert.match(siteDiscoveryCss, /\.related-symptom-card__arrow\{[^}]*position:absolute[^}]*right:1rem[^}]*top:50%/);
  assert.match(siteDiscoveryCss, /\.related-symptom-card:hover \.related-symptom-card__arrow,/);
  assert.match(siteDiscoveryCss, /@media\(max-width:640px\)\{\.related-symptoms\{[\s\S]*\.related-symptom-card__arrow\{right:\.85rem;width:30px;height:30px;font-size:20px\}\}/);

  for (const fileName of readdirSync(symptomDir).filter((name) => name.endsWith(".html"))) {
    if (fileName === "index.html") continue;
    const symptomHtml = readFileSync(path.join(symptomDir, fileName), "utf8");
    const relatedSection = symptomHtml.match(/<section class="related-symptoms">[\s\S]*?<\/section>/)?.[0] ?? "";

    const cardCount = (relatedSection.match(/class="related-symptom-card"/g) ?? []).length;
    const arrowCount = (relatedSection.match(arrowPattern) ?? []).length;

    assert.ok(cardCount >= 3 && cardCount <= 4, `${fileName} should render 3-4 related symptom cards`);
    assert.equal(arrowCount, cardCount, `${fileName} should add one arrow to each related symptom card`);
    assert.match(relatedSection, /class="related-symptoms__all-link" href="index\.html"/);
    assert.doesNotMatch(relatedSection, />詳しく見る<|>症状ページを見る</, `${fileName} should not add CTA text`);
  }
});

test("major symptom pages use the swipeable related article slider", () => {
  const symptomDir = path.join(repoRoot, "symptoms");
  const pages = [
    "lower-back-pain.html",
    "sciatica.html",
    "spinal-stenosis.html",
    "lumbar-disc-herniation.html",
    "hip-osteoarthritis.html"
  ];

  for (const fileName of pages) {
    const symptomHtml = readFileSync(path.join(symptomDir, fileName), "utf8");
    const relatedSection = symptomHtml.match(/<!-- BLOG_RELATED_ARTICLES_START -->[\s\S]*?<!-- BLOG_RELATED_ARTICLES_END -->/)?.[0] ?? "";

    assert.match(relatedSection, /class="related-articles-slider"/, `${fileName} should use the slider section`);
    assert.match(relatedSection, /data-related-article-slider/, `${fileName} should initialize the related article slider`);
    assert.match(relatedSection, /data-related-track/, `${fileName} should expose a scroll track`);
    assert.match(relatedSection, /data-related-prev/, `${fileName} should include the previous control`);
    assert.match(relatedSection, /data-related-next/, `${fileName} should include the next control`);
    assert.match(relatedSection, /data-related-dots/, `${fileName} should render dot pagination`);
    assert.match(relatedSection, /related-articles-slider__thumb/, `${fileName} should show article thumbnails`);
    assert.doesNotMatch(relatedSection, /related-articles__grid|related-article-card__desc|class="related-article-card"/, `${fileName} should remove the old vertical related article cards`);
    assert.match(symptomHtml, /const slider = document\.querySelector\('\[data-related-article-slider\]'\);/, `${fileName} should include the slider JavaScript`);
  }
});

test("lower back related article slider prioritizes the intended waist and nerve articles", () => {
  const html = readFileSync(path.join(repoRoot, "symptoms", "lower-back-pain.html"), "utf8");
  const section = html.match(/<!-- BLOG_RELATED_ARTICLES_START -->[\s\S]*?<!-- BLOG_RELATED_ARTICLES_END -->/)?.[0] ?? "";
  const hrefs = [...section.matchAll(/class="related-articles-slider__card" href="([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(hrefs.slice(0, 5), [
    "../blog/posts/low-back-pain-hip-stiffness-relation/",
    "../blog/posts/morning-low-back-pain-causes-multifidus/",
    "../blog/posts/lower-back-pain-and-knee-link/",
    "../blog/posts/sciatica-piriformis-relation/",
    "../blog/posts/spinal-stenosis-exercise-before-surgery/"
  ]);
});

test("upper-limb symptom pages pin directly relevant articles before broad fallbacks", () => {
  const expectations = [
    ["cervical-spondylosis.html", ["hand-numbness-causes-treatment", "shoulder-stiffness-posture-breathing", "frozen-shoulder-safe-movement"]],
    ["thoracic-outlet.html", ["hand-numbness-causes-treatment", "shoulder-stiffness-posture-breathing", "frozen-shoulder-safe-movement"]],
    ["carpal-tunnel.html", ["hand-numbness-causes-treatment", "elbow-pain-grip-shoulder", "shoulder-stiffness-posture-breathing"]],
    ["elbow-tendinopathy.html", ["elbow-pain-grip-shoulder", "shoulder-stiffness-posture-breathing", "hand-numbness-causes-treatment"]]
  ];

  for (const [fileName, slugs] of expectations) {
    const configStart = buildBlogScript.indexOf(`"${fileName}": {`);
    const configEnd = buildBlogScript.indexOf("\n  },", configStart);
    const configBlock = buildBlogScript.slice(configStart, configEnd);
    assert.ok(configStart > -1, `${fileName} should have a symptom config`);
    for (const slug of slugs) assert.match(configBlock, new RegExp(escapeRegExp(slug)));

    const symptomHtml = readFileSync(path.join(repoRoot, "symptoms", fileName), "utf8");
    const relatedBlock = symptomHtml.match(/<!-- BLOG_RELATED_ARTICLES_START -->[\s\S]*?<!-- BLOG_RELATED_ARTICLES_END -->/)?.[0] ?? "";
    const positions = slugs.map((slug) => relatedBlock.indexOf(`/blog/posts/${slug}/`));
    positions.forEach((position, index) => assert.ok(position > -1, `${fileName} should show ${slugs[index]}`));
    assert.deepStrictEqual([...positions].sort((a, b) => a - b), positions, `${fileName} should keep pinned article order`);
  }
});

const kneeDetailEducationPages = [
  {
    file: "knee-effusion.html",
    marker: "KNEE_EFFUSION",
    prefix: "effusion",
    headings: [
      "膝に水がたまる・腫れるのはなぜ起こるのか？",
      "膝が腫れやすくなる4つの要因",
      "膝の腫れや重さが起きるまでの流れ",
      "なぜ水を抜いても、また腫れることがあるのか？",
      "このような症状がある場合は、まず医療機関へご相談ください",
      "当院では腫れている膝だけでなく、全身の動きを確認します",
      "整体院ひざこぞうの膝の腫れへのアプローチ",
      "膝の腫れをどこへ相談すればよいか分からない方へ",
      "通院頻度について"
    ],
    requiredPhrases: ["急な強い腫れ", "水を抜く処置を否定するものではありません"]
  },
  {
    file: "pes-anserine-bursitis.html",
    marker: "MEDIAL_KNEE_PAIN",
    prefix: "medial",
    headings: [
      "膝の内側の痛みはなぜ起こるのか？",
      "膝の内側に負担が集まりやすくなる4つの要因",
      "膝の内側が痛くなるまでの流れ",
      "なぜ内側を休ませても、また痛むことがあるのか？",
      "このような症状がある場合は、まず医療機関へご相談ください",
      "当院では膝の内側だけでなく、全身の動きを確認します",
      "整体院ひざこぞうの膝の内側の痛みへのアプローチ",
      "膝の内側のどこが痛いのか説明しにくい方へ",
      "通院頻度について"
    ],
    requiredPhrases: ["内側やや下", "鵞足炎という説明を受けた方"]
  },
  {
    file: "knee-lateral-pain.html",
    marker: "LATERAL_KNEE_PAIN",
    prefix: "lateral",
    headings: [
      "膝の外側の痛みはなぜ起こるのか？",
      "膝の外側に負担が集まりやすくなる4つの要因",
      "膝の外側が痛くなるまでの流れ",
      "なぜ外側をほぐしても、また痛むことがあるのか？",
      "このような症状がある場合は、まず医療機関へご相談ください",
      "当院では膝の外側だけでなく、全身の動きを確認します",
      "整体院ひざこぞうの膝の外側の痛みへのアプローチ",
      "歩くと外側が痛む理由を整理したい方へ",
      "通院頻度について"
    ],
    requiredPhrases: ["坂道や長く歩いたあと", "腸脛靭帯炎や外側半月板"]
  },
  {
    file: "knee-posterior-pain.html",
    marker: "POSTERIOR_KNEE_PAIN",
    prefix: "posterior",
    headings: [
      "膝の裏側の痛みはなぜ起こるのか？",
      "膝の裏側に負担が集まりやすくなる4つの要因",
      "膝の裏側がつらくなるまでの流れ",
      "なぜ膝裏をほぐしても、また張ることがあるのか？",
      "このような症状がある場合は、まず医療機関へご相談ください",
      "当院では膝の裏側だけでなく、全身の動きを確認します",
      "整体院ひざこぞうの膝の裏側の痛みへのアプローチ",
      "膝裏の張りと腫れの違いが分からない方へ",
      "通院頻度について"
    ],
    requiredPhrases: ["ふくらはぎの急な腫れ", "ベーカー嚢腫という説明を受けた方"]
  },
  {
    file: "knee-front-pain.html",
    marker: "FRONT_KNEE_PAIN",
    prefix: "frontknee",
    headings: [
      "膝の前側・お皿まわりの痛みはなぜ起こるのか？",
      "膝の前側に負担が集まりやすくなる4つの要因",
      "膝の前側が痛くなるまでの流れ",
      "なぜ前側を休ませても、また痛むことがあるのか？",
      "このような症状がある場合は、まず医療機関へご相談ください",
      "当院では膝の前側だけでなく、全身の動きを確認します",
      "整体院ひざこぞうの膝の前側の痛みへのアプローチ",
      "階段や立ち上がりで痛む理由を整理したい方へ",
      "通院頻度について"
    ],
    requiredPhrases: ["階段を下りる", "膝が伸ばせない"]
  },
  {
    file: "meniscus-knee-pain.html",
    marker: "MENISCUS_KNEE_PAIN",
    prefix: "meniscus",
    headings: [
      "膝の引っかかりや半月板まわりの不安はなぜ起こるのか？",
      "膝にねじれや圧が集まりやすくなる4つの要因",
      "膝の引っかかりが起きるまでの流れ",
      "なぜ休んでも、また引っかかることがあるのか？",
      "このような症状がある場合は、まず医療機関へご相談ください",
      "当院では引っかかる場所だけでなく、全身の動きを確認します",
      "整体院ひざこぞうの膝の引っかかりへのアプローチ",
      "半月板まわりをどこへ相談すればよいか分からない方へ",
      "通院頻度について"
    ],
    requiredPhrases: ["膝が動かないほどのロック", "診断や治療は医療機関の領域"]
  },
  {
    file: "bowlegs-knee-pain.html",
    marker: "BOWLEGS_KNEE_PAIN",
    prefix: "bowlegs",
    headings: [
      "O脚・膝のゆがみで負担が偏るのはなぜか？",
      "膝への負担が偏りやすくなる4つの要因",
      "立ち方から膝の痛みにつながるまでの流れ",
      "なぜ膝をほぐしても、また負担が偏ることがあるのか？",
      "このような症状がある場合は、まず医療機関へご相談ください",
      "当院では脚の形だけでなく、全身の動きを確認します",
      "整体院ひざこぞうのO脚・膝のゆがみへのアプローチ",
      "脚の形と膝の痛みをどう考えればよいか分からない方へ",
      "通院頻度について"
    ],
    requiredPhrases: ["脚の見た目を無理に変えるのではなく", "骨格そのものを真っすぐにする"]
  },
  {
    file: "knee-hyperextension.html",
    marker: "KNEE_HYPEREXTENSION",
    prefix: "hyperextension",
    headings: [
      "反張膝・膝が伸びすぎるのはなぜか？",
      "膝を後ろへ押し込みやすくなる4つの要因",
      "膝が伸びすぎて負担になるまでの流れ",
      "なぜ姿勢を意識しても、また膝を押し込むことがあるのか？",
      "このような症状がある場合は、まず医療機関へご相談ください",
      "当院では膝の角度だけでなく、全身の動きを確認します",
      "整体院ひざこぞうの反張膝へのアプローチ",
      "立つと膝が伸びすぎる理由を整理したい方へ",
      "通院頻度について"
    ],
    requiredPhrases: ["膝を後方へ押し込む", "無理に膝を曲げる"]
  },
  {
    file: "ankle-stiffness-knee-pain.html",
    marker: "ANKLE_STIFFNESS_KNEE_PAIN",
    prefix: "ankleknee",
    headings: [
      "足首の硬さが膝の痛みにつながることがあるのはなぜか？",
      "足元から膝へ負担が集まりやすくなる4つの要因",
      "足首の動きにくさから膝が痛くなるまでの流れ",
      "なぜ膝だけをほぐしても、また痛むことがあるのか？",
      "このような症状がある場合は、まず医療機関へご相談ください",
      "当院では膝だけでなく、足首から全身の動きを確認します",
      "整体院ひざこぞうの足首の硬さと膝痛へのアプローチ",
      "足首と膝のどちらを相談すればよいか分からない方へ",
      "通院頻度について"
    ],
    requiredPhrases: ["足首だけが唯一の原因", "体重をかけられない"]
  }
];

test("nine knee symptom education pages follow the shared patient-friendly sequence", () => {
  for (const config of kneeDetailEducationPages) {
    const pageHtml = readFileSync(path.join(repoRoot, "symptoms", config.file), "utf8");
    const sectionPattern = new RegExp(`<!-- ${config.marker}_EDUCATION_START -->[\\s\\S]*?<!-- ${config.marker}_EDUCATION_END -->`);
    const section = pageHtml.match(sectionPattern)?.[0] ?? "";

    assert.ok(section, `${config.file} should contain its scoped education block`);
    const positions = config.headings.map((heading) => section.indexOf(heading));
    positions.forEach((position, index) => {
      assert.ok(position > -1, `${config.file} is missing heading: ${config.headings[index]}`);
    });
    for (let index = 1; index < positions.length; index += 1) {
      assert.ok(positions[index - 1] < positions[index], `${config.file} headings should stay in the approved order`);
    }

    assert.equal((section.match(new RegExp(`class="${config.prefix}-factor"`, "g")) ?? []).length, 4, `${config.file} should show four factors`);
    assert.equal((section.match(new RegExp(`class="${config.prefix}-symptom-flow__step"`, "g")) ?? []).length, 4, `${config.file} should show four flow steps`);
    assert.equal((section.match(new RegExp(`class="${config.prefix}-approach-step"`, "g")) ?? []).length, 3, `${config.file} should show three approach steps`);
    assert.equal((section.match(new RegExp(`class="${config.prefix}-medical-note__item"`, "g")) ?? []).length, 6, `${config.file} should show six medical warning signs`);
    assert.match(section, /href="https:\/\/lin\.ee\/X01F2mP"/, `${config.file} should keep the approved LINE link`);
    assert.match(section, /通院頻度は、[^。]+によって異なります/, `${config.file} should explain individualized visit frequency`);
    assert.doesNotMatch(section, /最初の1〜2ヶ月|週1〜2回|frequency__phases|frequency__phase/, `${config.file} should not prescribe fixed visit counts`);
    for (const phrase of config.requiredPhrases) {
      assert.ok(section.includes(phrase), `${config.file} should include symptom-specific phrase: ${phrase}`);
    }
  }
});

test("nine knee symptom education styles are scoped and responsive", () => {
  for (const config of kneeDetailEducationPages) {
    const pageHtml = readFileSync(path.join(repoRoot, "symptoms", config.file), "utf8");
    const stylesPattern = new RegExp(`/\\* ${config.marker}_EDUCATION_STYLES_START \\*/[\\s\\S]*?/\\* ${config.marker}_EDUCATION_STYLES_END \\*/`);
    const styles = pageHtml.match(stylesPattern)?.[0] ?? "";

    assert.ok(styles, `${config.file} should contain scoped education styles`);
    assert.match(styles, new RegExp(`\\.${config.prefix}-education-section\\{`));
    assert.match(styles, new RegExp(`\\.${config.prefix}-factor-grid\\{[^}]*grid-template-columns:repeat\\(2,minmax\\(0,1fr\\)\\)`));
    assert.match(styles, new RegExp(`\\.${config.prefix}-symptom-flow\\{[^}]*grid-template-columns:repeat\\(4,minmax\\(0,1fr\\)\\)`));
    assert.match(styles, new RegExp(`\\.${config.prefix}-approach-steps\\{[^}]*grid-template-columns:repeat\\(3,minmax\\(0,1fr\\)\\)`));
    assert.match(styles, new RegExp(`@media\\(max-width:767px\\)\\{[\\s\\S]*?\\.${config.prefix}-factor-grid\\{grid-template-columns:1fr`));
    assert.match(styles, new RegExp(`@media\\(max-width:767px\\)\\{[\\s\\S]*?\\.${config.prefix}-symptom-flow\\{grid-template-columns:1fr`));
    assert.match(styles, new RegExp(`@media\\(max-width:767px\\)\\{[\\s\\S]*?\\.${config.prefix}-approach-steps\\{grid-template-columns:1fr`));
    assert.match(styles, new RegExp(`\\.${config.prefix}-consult-cta__link\\{[^}]*min-height:44px`));
    assert.doesNotMatch(styles, /body\s*\{|html\s*\{|\.site-header|\.mobile-cta\{/);
  }
});

test("nine knee symptom education redesign preserves existing page features", () => {
  for (const config of kneeDetailEducationPages) {
    const pageHtml = readFileSync(path.join(repoRoot, "symptoms", config.file), "utf8");
    const troublesStart = pageHtml.indexOf('<section id="troubles" class="troubles-check">');
    const redesignStart = pageHtml.indexOf(`<!-- ${config.marker}_EDUCATION_START -->`);
    const redesignEnd = pageHtml.indexOf(`<!-- ${config.marker}_EDUCATION_END -->`);
    const flowStart = pageHtml.indexOf('<section id="flow"');

    assert.ok(troublesStart > -1 && troublesStart < redesignStart, `${config.file} should preserve the troubles section above the redesign`);
    assert.ok(redesignEnd > redesignStart && redesignEnd < flowStart, `${config.file} should keep the redesign above treatment flow`);
    assert.match(pageHtml, /<section id="flow" class="flow-slider"/);
    assert.match(pageHtml, /<section class="faq" id="faq">/);
    assert.match(pageHtml, /<!-- RELATED_SYMPTOMS_NAV_START -->/);
    assert.match(pageHtml, /<!-- BLOG_RELATED_ARTICLES_START -->/);
    assert.match(pageHtml, /href="tel:0471143274"/);
    assert.match(pageHtml, /href="https:\/\/lin\.ee\/X01F2mP"/);
  }
});

test("lower back education redesign stays inside the requested page range", () => {
  const bodyStart = lowerBackHtml.indexOf("<body");
  const redesignStart = lowerBackHtml.indexOf("<!-- LOWER_BACK_EDUCATION_START -->");
  const voicesStart = lowerBackHtml.indexOf("<!-- SYMPTOM_PATIENT_VOICES_START -->");

  assert.ok(bodyStart > -1);
  assert.ok(redesignStart > bodyStart, "the redesigned content should start after the existing upper page");
  assert.ok(voicesStart > redesignStart, "patient voices should remain after the redesigned content");
  assert.equal(
    sha256(lowerBackHtml.slice(bodyStart, redesignStart)),
    "e11e5743b8dec6c5d530bf7ffd002b4f58786551e289413f4c65e7525dc4ef52",
    "header, hero, and concerns markup must match the approved navigation baseline"
  );
  assert.equal(
    sha256(lowerBackHtml.slice(voicesStart)),
    "7060009c6ad70996c0d6ca42c8a8462715e7b7d6dcdd01b0a85ee9f5134822b2",
    "patient voices onward must match the approved trust-and-safety baseline with the updated consultation sections"
  );
});

test("lower back education redesign follows the requested patient-friendly sequence", () => {
  const section = lowerBackHtml.match(/<!-- LOWER_BACK_EDUCATION_START -->[\s\S]*?<!-- LOWER_BACK_EDUCATION_END -->/)?.[0] ?? "";
  const headings = [
    "腰痛はなぜ起こるのか？",
    "腰に負担が集まりやすくなる4つの要因",
    "腰痛が起きるまでの流れ",
    "なぜマッサージを受けても戻ることがあるのか？",
    "このような症状がある場合は、まず医療機関へご相談ください",
    "当院では腰だけでなく、全身の動きを確認します",
    "整体院ひざこぞうの腰痛へのアプローチ",
    "自分の腰痛がどのタイプか分からない方へ",
    "通院頻度について"
  ];

  assert.ok(section, "the scoped lower-back education block should exist");
  const positions = headings.map((heading) => section.indexOf(heading));
  positions.forEach((position, index) => {
    assert.ok(position > -1, `missing lower-back heading: ${headings[index]}`);
  });
  for (let index = 1; index < positions.length; index += 1) {
    assert.ok(positions[index - 1] < positions[index], `${headings[index - 1]} should appear before ${headings[index]}`);
  }

  assert.equal((section.match(/class="lb-factor"/g) ?? []).length, 4, "four load factors should be shown");
  assert.equal((section.match(/class="lb-pain-flow__step"/g) ?? []).length, 4, "the pain flow should contain four steps");
  assert.equal((section.match(/class="lb-approach-step"/g) ?? []).length, 3, "the clinic approach should contain three steps");
  assert.equal((section.match(/class="lb-medical-note__item"/g) ?? []).length, 6, "the medical referral note should show six warning signs");
  assert.match(section, /href="https:\/\/lin\.ee\/X01F2mP"[^>]*>[\s\S]*LINEで腰痛について相談する/);
  assert.match(section, /src="\.\.\/image\/イラスト\/腰・神経\/骨盤と腰椎のゆがみタイプ\.webp"/);
  assert.match(section, /src="\.\.\/image\/flow-movement-assessment-768\.webp"/);
  assert.doesNotMatch(section, /過緊張|過可動|多裂筋|椎間関節|腰椎後弯位/);
  assert.doesNotMatch(section, /最初の1〜2ヶ月|週1〜2回|frequency__phases|frequency__phase/);
});

test("lower back education CSS is scoped and switches diagrams to mobile timelines", () => {
  const styles = lowerBackHtml.match(/\/\* LOWER_BACK_EDUCATION_STYLES_START \*\/[\s\S]*?\/\* LOWER_BACK_EDUCATION_STYLES_END \*\//)?.[0] ?? "";

  assert.ok(styles, "scoped lower-back education styles should exist");
  assert.match(styles, /\.lb-education-section\{/);
  assert.match(styles, /\.lb-factor-grid\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.lb-pain-flow\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.lb-approach-steps\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.lb-factor-grid\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.lb-pain-flow\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.lb-approach-steps\{grid-template-columns:1fr/);
  assert.match(styles, /\.lb-consult-cta__link\{[^}]*min-height:44px/);
  assert.doesNotMatch(styles, /body\s*\{|html\s*\{|\.site-header|\.mobile-cta\{/);
});

test("shoulder stiffness education redesign preserves the existing page boundaries", () => {
  const bodyStart = shoulderStiffnessHtml.indexOf("<body");
  const redesignStart = shoulderStiffnessHtml.indexOf("<!-- SHOULDER_STIFFNESS_EDUCATION_START -->");
  const voicesStart = shoulderStiffnessHtml.indexOf("<!-- SYMPTOM_PATIENT_VOICES_START -->");

  assert.ok(bodyStart > -1);
  assert.ok(redesignStart > bodyStart, "the redesigned content should start after the existing upper page");
  assert.ok(voicesStart > redesignStart, "patient voices should remain after the redesigned content");
  assert.equal(
    sha256(shoulderStiffnessHtml.slice(bodyStart, redesignStart)),
    "ff99c93266874fa39f1a660aa4f45f5e06e48ce3aea2e89251e89116b8d9232b",
    "header, hero, and unified troubles markup must remain unchanged"
  );
  assert.equal(
    sha256(shoulderStiffnessHtml.slice(voicesStart)),
    "2df536fa2d95bed0abc750f44c7c9d5d478827166af294c1e8881d10f3e64cc7",
    "patient voices onward must match the approved trust-and-safety baseline with the updated first-visit pricing and director message"
  );
});

test("shoulder stiffness education follows the approved patient-friendly sequence", () => {
  const section = shoulderStiffnessHtml.match(/<!-- SHOULDER_STIFFNESS_EDUCATION_START -->[\s\S]*?<!-- SHOULDER_STIFFNESS_EDUCATION_END -->/)?.[0] ?? "";
  const headings = [
    "肩こりはなぜ起こるのか？",
    "首・肩に負担が集まりやすくなる4つの要因",
    "肩こりが起きるまでの流れ",
    "なぜマッサージを受けても戻ることがあるのか？",
    "このような症状がある場合は、まず医療機関へご相談ください",
    "当院では首・肩だけでなく、全身の動きを確認します",
    "整体院ひざこぞうの肩こりへのアプローチ",
    "自分の肩こりがどのタイプか分からない方へ",
    "通院頻度について"
  ];

  assert.ok(section, "the scoped shoulder-stiffness education block should exist");
  const positions = headings.map((heading) => section.indexOf(heading));
  positions.forEach((position, index) => {
    assert.ok(position > -1, `missing shoulder-stiffness heading: ${headings[index]}`);
  });
  for (let index = 1; index < positions.length; index += 1) {
    assert.ok(positions[index - 1] < positions[index], `${headings[index - 1]} should appear before ${headings[index]}`);
  }

  assert.equal((section.match(/class="shoulder-factor"/g) ?? []).length, 4, "four load factors should be shown");
  assert.equal((section.match(/class="shoulder-symptom-flow__step"/g) ?? []).length, 4, "the symptom flow should contain four steps");
  assert.equal((section.match(/class="shoulder-approach-step"/g) ?? []).length, 3, "the clinic approach should contain three steps");
  assert.equal((section.match(/class="shoulder-medical-note__item"/g) ?? []).length, 6, "the medical referral note should show six warning signs");
  assert.match(section, /href="https:\/\/lin\.ee\/X01F2mP"[^>]*>[\s\S]*LINEで肩こりについて相談する/);
  assert.match(section, /src="\.\.\/image\/イラスト\/肩・首\/肩甲骨周囲の筋肉と肩こり\.webp"/);
  assert.match(section, /src="\.\.\/image\/flow-movement-assessment-768\.webp"/);
  assert.doesNotMatch(section, /根本原因|肩こりの正体|必ず改善|完治|根本治療|再発を防ぐ|頚部深層筋|前鋸筋|菱形筋|再稼働/);
  assert.doesNotMatch(section, /最初の1〜2ヶ月|週1〜2回|frequency__phases|frequency__phase/);
});

test("shoulder stiffness education CSS is scoped and responsive", () => {
  const styles = shoulderStiffnessHtml.match(/\/\* SHOULDER_STIFFNESS_EDUCATION_STYLES_START \*\/[\s\S]*?\/\* SHOULDER_STIFFNESS_EDUCATION_STYLES_END \*\//)?.[0] ?? "";

  assert.ok(styles, "scoped shoulder-stiffness education styles should exist");
  assert.match(styles, /\.shoulder-education-section\{/);
  assert.match(styles, /\.shoulder-factor-grid\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.shoulder-symptom-flow\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.shoulder-approach-steps\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.shoulder-factor-grid\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.shoulder-symptom-flow\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.shoulder-approach-steps\{grid-template-columns:1fr/);
  assert.match(styles, /\.shoulder-consult-cta__link\{[^}]*min-height:44px/);
  assert.doesNotMatch(styles, /body\s*\{|html\s*\{|\.site-header|\.mobile-cta\{/);
});

test("plantar fasciitis education redesign preserves the existing page boundaries", () => {
  const bodyStart = plantarFasciitisHtml.indexOf("<body");
  const redesignStart = plantarFasciitisHtml.indexOf("<!-- PLANTAR_FASCIITIS_EDUCATION_START -->");
  const flowStart = plantarFasciitisHtml.search(/<section\b[^>]*\bid="flow"/);

  assert.ok(bodyStart > -1);
  assert.ok(redesignStart > bodyStart, "the redesigned content should start after the existing upper page");
  assert.ok(flowStart > redesignStart, "the existing treatment flow should remain after the redesigned content");
  assert.equal(
    sha256(plantarFasciitisHtml.slice(bodyStart, redesignStart)),
    "878d62e4f26d4db4774af95a1657710be7f2ea47a786b0b3676bec530c6bdfba",
    "header, hero, and unified troubles markup must remain unchanged"
  );
  assert.equal(
    sha256(plantarFasciitisHtml.slice(flowStart)),
    "bff23e1047c1818d34dc8abd0b9f03c7cfb4e38061510db600b4d95680fe6e5b",
    "treatment flow onward must match the approved trust-and-safety baseline with the updated first-visit pricing and director message"
  );
});

test("plantar fasciitis education follows the approved patient-friendly sequence", () => {
  const section = plantarFasciitisHtml.match(/<!-- PLANTAR_FASCIITIS_EDUCATION_START -->[\s\S]*?<!-- PLANTAR_FASCIITIS_EDUCATION_END -->/)?.[0] ?? "";
  const headings = [
    "足底筋膜炎・かかとの痛みはなぜ起こるのか？",
    "足裏に負担が集まりやすくなる4つの要因",
    "かかとの痛みが起きるまでの流れ",
    "なぜ休んだり足裏をほぐしても戻ることがあるのか？",
    "このような症状がある場合は、まず医療機関へご相談ください",
    "当院では足裏だけでなく、全身の動きを確認します",
    "整体院ひざこぞうの足底筋膜炎へのアプローチ",
    "自分のかかとの痛みがどのタイプか分からない方へ",
    "通院頻度について"
  ];

  assert.ok(section, "the scoped plantar-fasciitis education block should exist");
  const positions = headings.map((heading) => section.indexOf(heading));
  positions.forEach((position, index) => {
    assert.ok(position > -1, `missing plantar-fasciitis heading: ${headings[index]}`);
  });
  for (let index = 1; index < positions.length; index += 1) {
    assert.ok(positions[index - 1] < positions[index], `${headings[index - 1]} should appear before ${headings[index]}`);
  }

  assert.equal((section.match(/class="plantar-factor"/g) ?? []).length, 4, "four load factors should be shown");
  assert.equal((section.match(/class="plantar-symptom-flow__step"/g) ?? []).length, 4, "the symptom flow should contain four steps");
  assert.equal((section.match(/class="plantar-approach-step"/g) ?? []).length, 3, "the clinic approach should contain three steps");
  assert.equal((section.match(/class="plantar-medical-note__item"/g) ?? []).length, 6, "the medical referral note should show six warning signs");
  assert.match(section, /href="https:\/\/lin\.ee\/X01F2mP"[^>]*>[\s\S]*LINEで足底筋膜炎について相談する/);
  assert.match(section, /src="\.\.\/image\/イラスト\/足・手・その他\/足底筋膜と足裏の筋肉構造\.webp"/);
  assert.match(section, /src="\.\.\/image\/flow-movement-assessment-768\.webp"/);
  assert.doesNotMatch(section, /根本原因|完治|根本治療|再発しない|再発予防|過緊張|インナーマッスル|再教育|痛みの根っこ|原因を特定/);
  assert.doesNotMatch(section, /週1〜2回|2〜8回|安定期|frequency__phases|frequency__phase/);
});

test("plantar fasciitis education CSS is scoped and responsive", () => {
  const styles = plantarFasciitisHtml.match(/\/\* PLANTAR_FASCIITIS_EDUCATION_STYLES_START \*\/[\s\S]*?\/\* PLANTAR_FASCIITIS_EDUCATION_STYLES_END \*\//)?.[0] ?? "";

  assert.ok(styles, "scoped plantar-fasciitis education styles should exist");
  assert.match(styles, /\.plantar-education-section\{/);
  assert.match(styles, /\.plantar-factor-grid\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.plantar-symptom-flow\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.plantar-approach-steps\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.plantar-factor-grid\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.plantar-symptom-flow\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.plantar-approach-steps\{grid-template-columns:1fr/);
  assert.match(styles, /\.plantar-consult-cta__link\{[^}]*min-height:44px/);
  assert.doesNotMatch(styles, /body\s*\{|html\s*\{|\.site-header|\.mobile-cta\{/);
});

test("scoliosis education redesign preserves the existing page boundaries", () => {
  const bodyStart = scoliosisHtml.indexOf("<body");
  const redesignStart = scoliosisHtml.indexOf("<!-- SCOLIOSIS_EDUCATION_START -->");
  const flowStart = scoliosisHtml.search(/<section\b[^>]*\bid="flow"/);

  assert.ok(bodyStart > -1);
  assert.ok(redesignStart > bodyStart, "the redesigned content should start after the existing upper page");
  assert.ok(flowStart > redesignStart, "the existing treatment flow should remain after the redesigned content");
  assert.equal(
    sha256(scoliosisHtml.slice(bodyStart, redesignStart)),
    "11c04e3cf0194c0c37af56c512823184e077ca45373b48273f5d726eac6024be",
    "header, hero, and unified troubles markup must remain unchanged"
  );
  assert.equal(
    sha256(scoliosisHtml.slice(flowStart)),
    "918850208cd51ba402a76aa83371f77fc96f862bdecab61ce0ad82c83fc310e6",
    "treatment flow onward must match the approved trust-and-safety baseline with the updated first-visit pricing and director message"
  );
});

test("scoliosis education follows the approved patient-friendly sequence", () => {
  const section = scoliosisHtml.match(/<!-- SCOLIOSIS_EDUCATION_START -->[\s\S]*?<!-- SCOLIOSIS_EDUCATION_END -->/)?.[0] ?? "";
  const headings = [
    "側弯症ではなぜ身体の一部に負担が集まりやすいのか？",
    "負担の偏りにつながりやすい4つの要因",
    "痛みや張りが起きるまでの流れ",
    "なぜ一部をほぐしても戻ることがあるのか？",
    "このような症状がある場合は、まず医療機関へご相談ください",
    "当院では背骨の形だけでなく、全身の動きを確認します",
    "整体院ひざこぞうの側弯症へのアプローチ",
    "自分の身体の左右差をどう考えればよいか分からない方へ",
    "通院頻度について"
  ];

  assert.ok(section, "the scoped scoliosis education block should exist");
  const positions = headings.map((heading) => section.indexOf(heading));
  positions.forEach((position, index) => {
    assert.ok(position > -1, `missing scoliosis heading: ${headings[index]}`);
  });
  for (let index = 1; index < positions.length; index += 1) {
    assert.ok(positions[index - 1] < positions[index], `${headings[index - 1]} should appear before ${headings[index]}`);
  }

  assert.equal((section.match(/class="scoliosis-factor"/g) ?? []).length, 4);
  assert.equal((section.match(/class="scoliosis-symptom-flow__step"/g) ?? []).length, 4);
  assert.equal((section.match(/class="scoliosis-approach-step"/g) ?? []).length, 3);
  assert.equal((section.match(/class="scoliosis-medical-note__item"/g) ?? []).length, 6);
  assert.match(section, /href="https:\/\/lin\.ee\/X01F2mP"[^>]*>[\s\S]*LINEで側弯症について相談する/);
  assert.match(section, /src="\.\.\/image\/イラスト\/腰・神経\/脊柱側弯の姿勢比較\.webp"/);
  assert.match(section, /src="\.\.\/image\/flow-movement-assessment-768\.webp"/);
  assert.doesNotMatch(section, /真っすぐにする|矯正|必ず改善|完治|根本治療|インナーマッスル|再稼働|頑張りすぎている筋肉/);
  assert.doesNotMatch(section, /最初の1〜2ヶ月|週1回程度|2週に1回|メンテナンス期|frequency__phases|frequency__phase/);
});

test("scoliosis education CSS is scoped and responsive", () => {
  const styles = scoliosisHtml.match(/\/\* SCOLIOSIS_EDUCATION_STYLES_START \*\/[\s\S]*?\/\* SCOLIOSIS_EDUCATION_STYLES_END \*\//)?.[0] ?? "";

  assert.ok(styles, "scoped scoliosis education styles should exist");
  assert.match(styles, /\.scoliosis-education-section\{/);
  assert.match(styles, /\.scoliosis-factor-grid\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.scoliosis-symptom-flow\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.scoliosis-approach-steps\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.scoliosis-factor-grid\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.scoliosis-symptom-flow\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.scoliosis-approach-steps\{grid-template-columns:1fr/);
  assert.match(styles, /\.scoliosis-consult-cta__link\{[^}]*min-height:44px/);
  assert.doesNotMatch(styles, /body\s*\{|html\s*\{|\.site-header|\.mobile-cta\{/);
});

test("TMJ education redesign preserves the existing page boundaries", () => {
  const bodyStart = tmjHtml.indexOf("<body");
  const redesignStart = tmjHtml.indexOf("<!-- TMJ_EDUCATION_START -->");
  const flowStart = tmjHtml.search(/<section\b[^>]*\bid="flow"/);

  assert.ok(bodyStart > -1);
  assert.ok(redesignStart > bodyStart, "the redesigned content should start after the existing upper page");
  assert.ok(flowStart > redesignStart, "the existing treatment flow should remain after the redesigned content");
  assert.equal(
    sha256(tmjHtml.slice(bodyStart, redesignStart)),
    "7cfbe2cc1c4b7338175621ecf3e02eb8b1a4f0ec26824ed6bc91dd2d4f871b7f",
    "header, hero, and unified troubles markup must remain unchanged"
  );
  assert.equal(
    sha256(tmjHtml.slice(flowStart)),
    "1bfac7d726c87e51bb21f8569b67a3ba7fa07b480bd78cc312b6b43c4e398576",
    "treatment flow onward must match the approved trust-and-safety baseline with the updated first-visit pricing and director message"
  );
});

test("TMJ education follows the approved patient-friendly sequence", () => {
  const section = tmjHtml.match(/<!-- TMJ_EDUCATION_START -->[\s\S]*?<!-- TMJ_EDUCATION_END -->/)?.[0] ?? "";
  const headings = [
    "顎関節症はなぜ起こるのか？",
    "あごに負担が集まりやすくなる4つの要因",
    "あごの痛み・開けにくさが起きるまでの流れ",
    "なぜあごをほぐしても戻ることがあるのか？",
    "このような症状がある場合は、まず歯科・医療機関へご相談ください",
    "当院ではあごだけでなく、首・肩・全身の動きを確認します",
    "整体院ひざこぞうの顎関節症へのアプローチ",
    "自分のあごの状態をどこへ相談すべきか分からない方へ",
    "通院頻度について"
  ];

  assert.ok(section, "the scoped TMJ education block should exist");
  const positions = headings.map((heading) => section.indexOf(heading));
  positions.forEach((position, index) => {
    assert.ok(position > -1, `missing TMJ heading: ${headings[index]}`);
  });
  for (let index = 1; index < positions.length; index += 1) {
    assert.ok(positions[index - 1] < positions[index], `${headings[index - 1]} should appear before ${headings[index]}`);
  }

  assert.equal((section.match(/class="tmj-factor"/g) ?? []).length, 4);
  assert.equal((section.match(/class="tmj-symptom-flow__step"/g) ?? []).length, 4);
  assert.equal((section.match(/class="tmj-approach-step"/g) ?? []).length, 3);
  assert.equal((section.match(/class="tmj-medical-note__item"/g) ?? []).length, 6);
  assert.match(section, /href="https:\/\/lin\.ee\/X01F2mP"[^>]*>[\s\S]*LINEで顎関節症について相談する/);
  assert.match(section, /src="\.\.\/image\/イラスト\/足・手・その他\/顎関節と頭蓋骨の構造\.webp"/);
  assert.match(section, /src="\.\.\/image\/flow-movement-assessment-768\.webp"/);
  assert.match(section, /歯科での確認/);
  assert.doesNotMatch(section, /根本原因|胸椎後弯|頭部前方変位|C0-C1|三叉神経|改善の近道|再起動|再稼働|頚部深層筋/);
  assert.doesNotMatch(section, /最初の1〜2ヶ月|週1〜2回|2週に1回|メンテナンス期|frequency__phases|frequency__phase/);
});

test("TMJ education CSS is scoped and responsive", () => {
  const styles = tmjHtml.match(/\/\* TMJ_EDUCATION_STYLES_START \*\/[\s\S]*?\/\* TMJ_EDUCATION_STYLES_END \*\//)?.[0] ?? "";

  assert.ok(styles, "scoped TMJ education styles should exist");
  assert.match(styles, /\.tmj-education-section\{/);
  assert.match(styles, /\.tmj-factor-grid\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.tmj-symptom-flow\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.tmj-approach-steps\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.tmj-factor-grid\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.tmj-symptom-flow\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.tmj-approach-steps\{grid-template-columns:1fr/);
  assert.match(styles, /\.tmj-consult-cta__link\{[^}]*min-height:44px/);
  assert.doesNotMatch(styles, /body\s*\{|html\s*\{|\.site-header|\.mobile-cta\{/);
});

test("frozen shoulder education redesign preserves the existing page boundaries", () => {
  const bodyStart = frozenShoulderHtml.indexOf("<body");
  const redesignStart = frozenShoulderHtml.indexOf("<!-- FROZEN_SHOULDER_EDUCATION_START -->");
  const flowStart = frozenShoulderHtml.search(/<section\b[^>]*\bid="flow"/);

  assert.ok(bodyStart > -1);
  assert.ok(redesignStart > bodyStart, "the redesigned content should start after the existing upper page");
  assert.ok(flowStart > redesignStart, "the existing treatment flow should remain after the redesigned content");
  assert.equal(
    sha256(frozenShoulderHtml.slice(bodyStart, redesignStart)),
    "8f808471a1993635643fcd30e000dbdf65fbb81f7629208900707577d19f0bfa",
    "header, hero, and unified troubles markup must remain unchanged"
  );
  assert.equal(
    sha256(frozenShoulderHtml.slice(flowStart)),
    "4b3b2a11f3fe218d9d8ed42f2c257a016e0fb118919634ee227a7cd7687a4cd9",
    "treatment flow onward must match the approved trust-and-safety baseline with the updated first-visit pricing and director message"
  );
});

test("frozen shoulder education follows the approved patient-friendly sequence", () => {
  const section = frozenShoulderHtml.match(/<!-- FROZEN_SHOULDER_EDUCATION_START -->[\s\S]*?<!-- FROZEN_SHOULDER_EDUCATION_END -->/)?.[0] ?? "";
  const headings = [
    "五十肩はなぜ起こるのか？",
    "肩が動かしにくくなる4つの要因",
    "肩の痛み・動かしにくさが続くまでの流れ",
    "なぜ肩をほぐしても戻ることがあるのか？",
    "このような症状がある場合は、まず医療機関へご相談ください",
    "当院では肩だけでなく、全身の動きを確認します",
    "整体院ひざこぞうの五十肩へのアプローチ",
    "自分の肩が今どの状態か分からない方へ",
    "通院頻度について"
  ];

  assert.ok(section, "the scoped frozen-shoulder education block should exist");
  const positions = headings.map((heading) => section.indexOf(heading));
  positions.forEach((position, index) => {
    assert.ok(position > -1, `missing frozen-shoulder heading: ${headings[index]}`);
  });
  for (let index = 1; index < positions.length; index += 1) {
    assert.ok(positions[index - 1] < positions[index], `${headings[index - 1]} should appear before ${headings[index]}`);
  }

  assert.equal((section.match(/class="frozen-factor"/g) ?? []).length, 4);
  assert.equal((section.match(/class="frozen-symptom-flow__step"/g) ?? []).length, 4);
  assert.equal((section.match(/class="frozen-approach-step"/g) ?? []).length, 3);
  assert.equal((section.match(/class="frozen-medical-note__item"/g) ?? []).length, 6);
  assert.match(section, /href="https:\/\/lin\.ee\/X01F2mP"[^>]*>[\s\S]*LINEで五十肩について相談する/);
  assert.match(section, /src="\.\.\/image\/イラスト\/肩・首\/肩関節の可動域と痛みの角度\.webp"/);
  assert.match(section, /src="\.\.\/image\/flow-movement-assessment-768\.webp"/);
  assert.doesNotMatch(section, /本当の原因|前方へのズレ|癒着|根本原因|根本治療|完治|必ず改善|再発しない|再稼働|サボった筋肉/);
  assert.doesNotMatch(section, /最初の1〜2ヶ月|週1〜2回|2週に1回|メンテナンス期|frequency__phases|frequency__phase/);
});

test("frozen shoulder education CSS is scoped and responsive", () => {
  const styles = frozenShoulderHtml.match(/\/\* FROZEN_SHOULDER_EDUCATION_STYLES_START \*\/[\s\S]*?\/\* FROZEN_SHOULDER_EDUCATION_STYLES_END \*\//)?.[0] ?? "";

  assert.ok(styles, "scoped frozen-shoulder education styles should exist");
  assert.match(styles, /\.frozen-education-section\{/);
  assert.match(styles, /\.frozen-factor-grid\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.frozen-symptom-flow\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.frozen-approach-steps\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.frozen-factor-grid\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.frozen-symptom-flow\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.frozen-approach-steps\{grid-template-columns:1fr/);
  assert.match(styles, /\.frozen-consult-cta__link\{[^}]*min-height:44px/);
  assert.doesNotMatch(styles, /body\s*\{|html\s*\{|\.site-header|\.mobile-cta\{/);
});

test("cervical spondylosis follows the shared patient-friendly education sequence", () => {
  const cervicalHtml = readFileSync(new URL("../symptoms/cervical-spondylosis.html", import.meta.url), "utf8");
  const section = cervicalHtml.match(/<!-- CERVICAL_SPONDYLOSIS_EDUCATION_START -->[\s\S]*?<!-- CERVICAL_SPONDYLOSIS_EDUCATION_END -->/)?.[0] ?? "";
  const headings = [
    "首の痛みや腕のしびれはなぜ起こるのか？",
    "首に負担が集まりやすくなる4つの要因",
    "首の痛みや腕のしびれが起きるまでの流れ",
    "なぜ首をほぐしても症状が戻ることがあるのか？",
    "このような症状がある場合は、まず医療機関へご相談ください",
    "当院では首だけでなく、全身の動きを確認します",
    "整体院ひざこぞうの首の痛みへのアプローチ",
    "首や腕の症状をどこへ相談すべきか分からない方へ",
    "通院頻度について"
  ];

  assert.ok(section, "cervical spondylosis should use a scoped education block");
  const positions = headings.map((heading) => section.indexOf(heading));
  positions.forEach((position, index) => assert.ok(position > -1, `missing cervical heading: ${headings[index]}`));
  for (let index = 1; index < positions.length; index += 1) {
    assert.ok(positions[index - 1] < positions[index], "cervical headings should follow the shared sequence");
  }
  assert.equal((section.match(/class="cervical-factor"/g) ?? []).length, 4);
  assert.equal((section.match(/class="cervical-symptom-flow__step"/g) ?? []).length, 4);
  assert.equal((section.match(/class="cervical-approach-step"/g) ?? []).length, 3);
  assert.equal((section.match(/class="cervical-medical-note__item"/g) ?? []).length, 6);
  assert.match(section, /LINEで首や腕の症状について相談する/);
  assert.doesNotMatch(section, /機能不全|サボっている|再発しにくい|根本原因|必ず改善|完治|再発しない/);
});

test("cervical spondylosis education CSS is scoped and responsive", () => {
  const cervicalHtml = readFileSync(new URL("../symptoms/cervical-spondylosis.html", import.meta.url), "utf8");
  const styles = cervicalHtml.match(/\/\* CERVICAL_SPONDYLOSIS_EDUCATION_STYLES_START \*\/[\s\S]*?\/\* CERVICAL_SPONDYLOSIS_EDUCATION_STYLES_END \*\//)?.[0] ?? "";

  assert.ok(styles);
  assert.match(styles, /\.cervical-education-section\{/);
  assert.match(styles, /\.cervical-factor-grid\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.cervical-symptom-flow\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.cervical-approach-steps\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.cervical-factor-grid\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.cervical-symptom-flow\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.cervical-approach-steps\{grid-template-columns:1fr/);
  assert.doesNotMatch(styles, /body\s*\{|html\s*\{|\.site-header|\.mobile-cta\{/);
});

test("thoracic outlet education redesign preserves the existing page boundaries", () => {
  const bodyStart = thoracicOutletHtml.indexOf("<body");
  const redesignStart = thoracicOutletHtml.indexOf("<!-- THORACIC_OUTLET_EDUCATION_START -->");
  const flowStart = thoracicOutletHtml.search(/<section\b[^>]*\bid="flow"/);

  assert.ok(bodyStart > -1);
  assert.ok(redesignStart > bodyStart, "the redesigned content should start after the existing upper page");
  assert.ok(flowStart > redesignStart, "the existing treatment flow should remain after the redesigned content");
  assert.equal(
    sha256(thoracicOutletHtml.slice(bodyStart, redesignStart)),
    "e0d389e0dac5901844875897ed1787868c68619db472d43ca39ed3479ed63739",
    "header, hero, and unified troubles markup must remain unchanged"
  );
  assert.equal(
    sha256(thoracicOutletHtml.slice(flowStart)),
    "38fb3a596a56a1c882d347e36550dfd59f73cae43a585b7cf277172fb076abb4",
    "treatment flow onward must match the approved trust-and-safety baseline with the updated first-visit pricing and director message"
  );
});

test("thoracic outlet education follows the approved patient-friendly sequence", () => {
  const section = thoracicOutletHtml.match(/<!-- THORACIC_OUTLET_EDUCATION_START -->[\s\S]*?<!-- THORACIC_OUTLET_EDUCATION_END -->/)?.[0] ?? "";
  const headings = [
    "胸郭出口症候群ではなぜ腕や手に症状が出るのか？",
    "腕や手の症状につながりやすい4つの要因",
    "しびれ・だるさが起きるまでの流れ",
    "なぜ首や肩をほぐしても戻ることがあるのか？",
    "このような症状がある場合は、まず医療機関へご相談ください",
    "当院ではしびれる場所だけでなく、全身の動きを確認します",
    "整体院ひざこぞうの胸郭出口症候群へのアプローチ",
    "自分のしびれをどこへ相談すべきか分からない方へ",
    "通院頻度について"
  ];

  assert.ok(section, "the scoped thoracic-outlet education block should exist");
  const positions = headings.map((heading) => section.indexOf(heading));
  positions.forEach((position, index) => {
    assert.ok(position > -1, `missing thoracic-outlet heading: ${headings[index]}`);
  });
  for (let index = 1; index < positions.length; index += 1) {
    assert.ok(positions[index - 1] < positions[index], `${headings[index - 1]} should appear before ${headings[index]}`);
  }

  assert.equal((section.match(/class="thoracic-factor"/g) ?? []).length, 4);
  assert.equal((section.match(/class="thoracic-symptom-flow__step"/g) ?? []).length, 4);
  assert.equal((section.match(/class="thoracic-approach-step"/g) ?? []).length, 3);
  assert.equal((section.match(/class="thoracic-medical-note__item"/g) ?? []).length, 6);
  assert.match(section, /href="https:\/\/lin\.ee\/X01F2mP"[^>]*>[\s\S]*LINEで胸郭出口症候群について相談する/);
  assert.match(section, /src="\.\.\/image\/イラスト\/肩・首\/肩から腕にしびれが出る女性\.webp"/);
  assert.match(section, /src="\.\.\/image\/flow-movement-assessment-768\.webp"/);
  assert.doesNotMatch(section, /圧迫ポイントを特定|通り道を広げ|姿勢から改善|根本原因|根本治療|完治|必ず改善|再発しない|再稼働|サボった筋肉/);
  assert.doesNotMatch(section, /最初の1〜2ヶ月|週1〜2回|2週に1回|メンテナンス期|frequency__phases|frequency__phase/);
});

test("thoracic outlet education CSS is scoped and responsive", () => {
  const styles = thoracicOutletHtml.match(/\/\* THORACIC_OUTLET_EDUCATION_STYLES_START \*\/[\s\S]*?\/\* THORACIC_OUTLET_EDUCATION_STYLES_END \*\//)?.[0] ?? "";

  assert.ok(styles, "scoped thoracic-outlet education styles should exist");
  assert.match(styles, /\.thoracic-education-section\{/);
  assert.match(styles, /\.thoracic-factor-grid\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.thoracic-symptom-flow\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.thoracic-approach-steps\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.thoracic-factor-grid\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.thoracic-symptom-flow\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.thoracic-approach-steps\{grid-template-columns:1fr/);
  assert.match(styles, /\.thoracic-consult-cta__link\{[^}]*min-height:44px/);
  assert.doesNotMatch(styles, /body\s*\{|html\s*\{|\.site-header|\.mobile-cta\{/);
});

const upperLimbEducationPages = [
  {
    file: "carpal-tunnel.html",
    html: carpalTunnelHtml,
    marker: "CARPAL_TUNNEL",
    prefix: "carpal",
    headings: [
      "手のしびれはなぜ起こるのか？",
      "手や手首に負担が集まりやすくなる4つの要因",
      "手のしびれや使いにくさが起きるまでの流れ",
      "なぜ手首を休めても症状が戻ることがあるのか？",
      "このような症状がある場合は、まず医療機関へご相談ください",
      "当院では手首だけでなく、首から手までの動きを確認します",
      "整体院ひざこぞうの手のしびれへのアプローチ",
      "自分の手のしびれをどこへ相談すべきか分からない方へ",
      "通院頻度について"
    ],
    lineCta: "LINEで手のしびれについて相談する",
    causeImage: "../image/イラスト/足・手・その他/手根管症候群と腱鞘炎の比較.webp"
  },
  {
    file: "elbow-tendinopathy.html",
    html: elbowTendinopathyHtml,
    marker: "ELBOW_TENDINOPATHY",
    prefix: "elbow",
    headings: [
      "肘の痛みはなぜ起こるのか？",
      "肘に負担が集まりやすくなる4つの要因",
      "肘の痛みが起きるまでの流れ",
      "なぜ肘を休めても痛みが戻ることがあるのか？",
      "このような症状がある場合は、まず医療機関へご相談ください",
      "当院では肘だけでなく、腕全体の動きを確認します",
      "整体院ひざこぞうの肘の痛みへのアプローチ",
      "自分の肘の痛みについて相談したい方へ",
      "通院頻度について"
    ],
    lineCta: "LINEで肘の痛みについて相談する",
    causeImage: "../image/hizi.webp"
  }
];

for (const config of upperLimbEducationPages) {
  test(`${config.file} uses the patient-friendly upper-limb education sequence`, () => {
    const sectionPattern = new RegExp(`<!-- ${config.marker}_EDUCATION_START -->[\\s\\S]*?<!-- ${config.marker}_EDUCATION_END -->`);
    const section = config.html.match(sectionPattern)?.[0] ?? "";
    const flowStart = config.html.search(/<section\b[^>]*\bid="flow"/);
    const redesignStart = config.html.indexOf(`<!-- ${config.marker}_EDUCATION_START -->`);

    assert.ok(section, `${config.file} should include a scoped education block`);
    assert.ok(redesignStart > config.html.indexOf("<body"), `${config.file} should preserve the upper page`);
    assert.ok(flowStart > redesignStart, `${config.file} should preserve treatment flow onward`);

    const positions = config.headings.map((heading) => section.indexOf(heading));
    positions.forEach((position, index) => {
      assert.ok(position > -1, `${config.file} is missing heading: ${config.headings[index]}`);
    });
    for (let index = 1; index < positions.length; index += 1) {
      assert.ok(positions[index - 1] < positions[index], `${config.file} has an incorrect section order`);
    }

    assert.equal((section.match(new RegExp(`class="${config.prefix}-factor"`, "g")) ?? []).length, 4);
    assert.equal((section.match(new RegExp(`class="${config.prefix}-symptom-flow__step"`, "g")) ?? []).length, 4);
    assert.equal((section.match(new RegExp(`class="${config.prefix}-approach-step"`, "g")) ?? []).length, 3);
    assert.equal((section.match(new RegExp(`class="${config.prefix}-medical-note__item"`, "g")) ?? []).length, 6);
    assert.match(section, new RegExp(`href="https:\\/\\/lin\\.ee\\/X01F2mP"[^>]*>[\\s\\S]*${escapeRegExp(config.lineCta)}`));
    assert.match(section, new RegExp(`src="${escapeRegExp(config.causeImage)}"`));
    assert.match(section, /src="\.\.\/image\/flow-movement-assessment-768\.webp"/);
    assert.doesNotMatch(section, /根本原因|根本治療|完治|必ず改善|再発しない|本当の原因|回復が可能/);
    assert.doesNotMatch(section, /最初の1〜2ヶ月|週1〜2回|2〜8回|2週〜月1回|frequency__phases|frequency__phase/);
  });

  test(`${config.file} education CSS is scoped and responsive`, () => {
    const stylesPattern = new RegExp(`/\\* ${config.marker}_EDUCATION_STYLES_START \\*/[\\s\\S]*?/\\* ${config.marker}_EDUCATION_STYLES_END \\*/`);
    const styles = config.html.match(stylesPattern)?.[0] ?? "";

    assert.ok(styles, `${config.file} should include scoped education styles`);
    assert.match(styles, new RegExp(`\\.${config.prefix}-education-section\\{`));
    assert.match(styles, new RegExp(`\\.${config.prefix}-factor-grid\\{[^}]*grid-template-columns:repeat\\(2,minmax\\(0,1fr\\)\\)`));
    assert.match(styles, new RegExp(`\\.${config.prefix}-symptom-flow\\{[^}]*grid-template-columns:repeat\\(4,minmax\\(0,1fr\\)\\)`));
    assert.match(styles, new RegExp(`\\.${config.prefix}-approach-steps\\{[^}]*grid-template-columns:repeat\\(3,minmax\\(0,1fr\\)\\)`));
    assert.match(styles, new RegExp(`@media\\(max-width:767px\\)\\{[\\s\\S]*\\.${config.prefix}-factor-grid\\{grid-template-columns:1fr`));
    assert.match(styles, new RegExp(`@media\\(max-width:767px\\)\\{[\\s\\S]*\\.${config.prefix}-symptom-flow\\{grid-template-columns:1fr`));
    assert.match(styles, new RegExp(`@media\\(max-width:767px\\)\\{[\\s\\S]*\\.${config.prefix}-approach-steps\\{grid-template-columns:1fr`));
    assert.match(styles, new RegExp(`\\.${config.prefix}-consult-cta__link\\{[^}]*min-height:44px`));
    assert.doesNotMatch(styles, /body\s*\{|html\s*\{|\.site-header|\.mobile-cta\{/);
  });
}

test("elbow FAQ keeps visit frequency individualized and avoids diagnosis-like claims", () => {
  const faqSection = elbowTendinopathyHtml.match(/<section[^>]*class="faq"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? "";

  assert.ok(faqSection, "the visible elbow FAQ should remain");
  assert.doesNotMatch(elbowTendinopathyHtml, /"@type"\s*:\s*"FAQPage"/);
  assert.doesNotMatch(faqSection, /週1〜2回|1〜2ヶ月|2週に1回|月1回/);
  assert.doesNotMatch(faqSection, /根本にある場合がほとんど|機能不全|改善しない限り再発|根本からの回復/);
  assert.match(faqSection, /状態には個人差があります/);
});

test("sciatica education redesign stays inside the matching lower-back page range", () => {
  const bodyStart = sciaticaHtml.indexOf("<body");
  const redesignStart = sciaticaHtml.indexOf("<!-- SCIATICA_EDUCATION_START -->");
  const voicesStart = sciaticaHtml.indexOf("<!-- SYMPTOM_PATIENT_VOICES_START -->");

  assert.ok(bodyStart > -1);
  assert.ok(redesignStart > bodyStart, "the redesigned content should start after the existing upper page");
  assert.ok(voicesStart > redesignStart, "patient voices should remain after the redesigned content");
  assert.equal(
    sha256(sciaticaHtml.slice(bodyStart, redesignStart)),
    "9581808d018dbe5ac81662f77e654605a1a6ecebd0d6c97bf923b832ea0d48f7",
    "header, hero, and concerns markup must match the approved navigation baseline"
  );
  assert.equal(
    sha256(sciaticaHtml.slice(voicesStart)),
    "8e536db55dc957229ef0050416cfedd4459db7c007f6844cd1e3dfdfd0758751",
    "patient voices onward must match the approved trust-and-safety baseline with the updated consultation sections"
  );
});

test("sciatica education redesign mirrors the lower-back patient-friendly sequence", () => {
  const section = sciaticaHtml.match(/<!-- SCIATICA_EDUCATION_START -->[\s\S]*?<!-- SCIATICA_EDUCATION_END -->/)?.[0] ?? "";
  const headings = [
    "坐骨神経痛はなぜ起こるのか？",
    "痛みやしびれにつながりやすい4つの要因",
    "痛み・しびれが起きるまでの流れ",
    "なぜお尻をほぐしても戻ることがあるのか？",
    "このような症状がある場合は、まず医療機関へご相談ください",
    "当院ではしびれの場所だけでなく、全身の動きを確認します",
    "整体院ひざこぞうの坐骨神経痛へのアプローチ",
    "自分の症状がどこから来ているか分からない方へ",
    "通院頻度について"
  ];

  assert.ok(section, "the scoped sciatica education block should exist");
  const positions = headings.map((heading) => section.indexOf(heading));
  positions.forEach((position, index) => {
    assert.ok(position > -1, `missing sciatica heading: ${headings[index]}`);
  });
  for (let index = 1; index < positions.length; index += 1) {
    assert.ok(positions[index - 1] < positions[index], `${headings[index - 1]} should appear before ${headings[index]}`);
  }

  assert.equal((section.match(/class="sciatica-factor"/g) ?? []).length, 4, "four symptom factors should be shown");
  assert.equal((section.match(/class="sciatica-symptom-flow__step"/g) ?? []).length, 4, "the symptom flow should contain four steps");
  assert.equal((section.match(/class="sciatica-approach-step"/g) ?? []).length, 3, "the clinic approach should contain three steps");
  assert.equal((section.match(/class="sciatica-medical-note__item"/g) ?? []).length, 6, "the medical referral note should show six warning signs");
  assert.match(section, /href="https:\/\/lin\.ee\/X01F2mP"[^>]*>[\s\S]*LINEで坐骨神経痛について相談する/);
  assert.match(section, /src="\.\.\/image\/イラスト\/腰・神経\/脚の骨格と坐骨神経の走行\.webp"/);
  assert.match(section, /src="\.\.\/image\/flow-movement-assessment-768\.webp"/);
  assert.doesNotMatch(section, /ダブルクラッシュ|中枢側|末梢側|過緊張|硬結|再稼働/);
  assert.doesNotMatch(section, /最初の1〜2ヶ月|週1〜2回|frequency__phases|frequency__phase/);
});

test("sciatica education CSS is scoped and matches the lower-back responsive structure", () => {
  const styles = sciaticaHtml.match(/\/\* SCIATICA_EDUCATION_STYLES_START \*\/[\s\S]*?\/\* SCIATICA_EDUCATION_STYLES_END \*\//)?.[0] ?? "";

  assert.ok(styles, "scoped sciatica education styles should exist");
  assert.match(styles, /\.sciatica-education-section\{/);
  assert.match(styles, /\.sciatica-factor-grid\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.sciatica-symptom-flow\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.sciatica-approach-steps\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.sciatica-factor-grid\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.sciatica-symptom-flow\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.sciatica-approach-steps\{grid-template-columns:1fr/);
  assert.match(styles, /\.sciatica-consult-cta__link\{[^}]*min-height:44px/);
  assert.doesNotMatch(styles, /body\s*\{|html\s*\{|\.site-header|\.mobile-cta\{/);
});

test("spinal stenosis education redesign preserves the existing page boundaries", () => {
  const bodyStart = spinalStenosisHtml.indexOf("<body");
  const redesignStart = spinalStenosisHtml.indexOf("<!-- SPINAL_STENOSIS_EDUCATION_START -->");
  const flowStart = spinalStenosisHtml.search(/<section\b[^>]*\bid="flow"/);

  assert.ok(bodyStart > -1);
  assert.ok(redesignStart > bodyStart, "the redesigned content should start after the existing upper page");
  assert.ok(flowStart > redesignStart, "the existing treatment flow should remain after the redesigned content");
  assert.equal(
    sha256(spinalStenosisHtml.slice(bodyStart, redesignStart)),
    "e624cbd943e64324474d47fbc26da31042338a81d802d8705f5f665412c9e17a",
    "header, hero, and concerns markup must match the approved navigation baseline"
  );
  assert.equal(
    sha256(spinalStenosisHtml.slice(flowStart)),
    "90a233e2329062a7de8f237eb8cdb9f868f8215dcb6c932c7a26d91d9cb808ac",
    "treatment flow onward must match the approved trust-and-safety baseline with the updated consultation sections"
  );
});

test("spinal stenosis education redesign follows the approved patient-friendly sequence", () => {
  const section = spinalStenosisHtml.match(/<!-- SPINAL_STENOSIS_EDUCATION_START -->[\s\S]*?<!-- SPINAL_STENOSIS_EDUCATION_END -->/)?.[0] ?? "";
  const headings = [
    "脊柱管狭窄症はなぜ起こるのか？",
    "歩きづらさや脚の症状につながりやすい4つの要因",
    "歩くと脚がつらくなるまでの流れ",
    "なぜ休むと楽でも、歩くとまたつらくなるのか？",
    "このような症状がある場合は、まず医療機関へご相談ください",
    "当院では歩ける距離だけでなく、全身の動きを確認します",
    "整体院ひざこぞうの脊柱管狭窄症へのアプローチ",
    "どの程度動いてよいか不安な方へ",
    "通院頻度について"
  ];

  assert.ok(section, "the scoped spinal-stenosis education block should exist");
  const positions = headings.map((heading) => section.indexOf(heading));
  positions.forEach((position, index) => {
    assert.ok(position > -1, `missing spinal-stenosis heading: ${headings[index]}`);
  });
  for (let index = 1; index < positions.length; index += 1) {
    assert.ok(positions[index - 1] < positions[index], `${headings[index - 1]} should appear before ${headings[index]}`);
  }

  assert.equal((section.match(/class="stenosis-factor"/g) ?? []).length, 4, "four symptom factors should be shown");
  assert.equal((section.match(/class="stenosis-symptom-flow__step"/g) ?? []).length, 4, "the symptom flow should contain four steps");
  assert.equal((section.match(/class="stenosis-approach-step"/g) ?? []).length, 3, "the clinic approach should contain three steps");
  assert.equal((section.match(/class="stenosis-medical-note__item"/g) ?? []).length, 6, "the medical referral note should show six warning signs");
  assert.match(section, /href="https:\/\/lin\.ee\/X01F2mP"[^>]*>[\s\S]*LINEで脊柱管狭窄症について相談する/);
  assert.match(section, /src="\.\.\/image\/spinal-stenosis-diagram\.webp"/);
  assert.match(section, /src="\.\.\/image\/flow-movement-assessment-768\.webp"/);
  assert.doesNotMatch(section, /必ず圧迫|脊柱管を広げる|腹横筋|インナーマッスル|再稼働|頑張りすぎている筋肉/);
  assert.doesNotMatch(section, /最初の1〜2ヶ月|週1〜2回|frequency__phases|frequency__phase/);
});

test("spinal stenosis education CSS is scoped and responsive", () => {
  const styles = spinalStenosisHtml.match(/\/\* SPINAL_STENOSIS_EDUCATION_STYLES_START \*\/[\s\S]*?\/\* SPINAL_STENOSIS_EDUCATION_STYLES_END \*\//)?.[0] ?? "";

  assert.ok(styles, "scoped spinal-stenosis education styles should exist");
  assert.match(styles, /\.stenosis-education-section\{/);
  assert.match(styles, /\.stenosis-factor-grid\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.stenosis-symptom-flow\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.stenosis-approach-steps\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.stenosis-factor-grid\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.stenosis-symptom-flow\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.stenosis-approach-steps\{grid-template-columns:1fr/);
  assert.match(styles, /\.stenosis-consult-cta__link\{[^}]*min-height:44px/);
  assert.doesNotMatch(styles, /body\s*\{|html\s*\{|\.site-header|\.mobile-cta\{/);
});

test("knee pain education redesign preserves the existing page boundaries", () => {
  const bodyStart = kneeOsteoarthritisHtml.indexOf("<body");
  const redesignStart = kneeOsteoarthritisHtml.indexOf("<!-- KNEE_PAIN_EDUCATION_START -->");
  const voicesStart = kneeOsteoarthritisHtml.indexOf("<!-- SYMPTOM_PATIENT_VOICES_START -->");

  assert.ok(bodyStart > -1);
  assert.ok(redesignStart > bodyStart, "the redesigned content should start after the existing upper page");
  assert.ok(voicesStart > redesignStart, "patient voices should remain after the redesigned content");
  assert.equal(
    sha256(kneeOsteoarthritisHtml.slice(bodyStart, redesignStart)),
    "4698aeed1accbf33a809e931a4f5abdc37476d500102c2d4162449bd9b0bbcb5",
    "header, hero, and concerns markup must match the approved navigation baseline"
  );
  assert.equal(
    sha256(kneeOsteoarthritisHtml.slice(voicesStart)),
    "3706e6dc164ee09f78406fb4a3016eb198251c4623edf6e60101276c93ac8533",
    "patient voices onward must match the approved trust-and-safety baseline"
  );
});

test("knee pain education redesign follows the approved patient-friendly sequence", () => {
  const section = kneeOsteoarthritisHtml.match(/<!-- KNEE_PAIN_EDUCATION_START -->[\s\S]*?<!-- KNEE_PAIN_EDUCATION_END -->/)?.[0] ?? "";
  const headings = [
    "膝の痛みはなぜ起こるのか？",
    "膝に負担が集まりやすくなる4つの要因",
    "膝の痛みが起きるまでの流れ",
    "なぜ膝をほぐしても戻ることがあるのか？",
    "このような症状がある場合は、まず医療機関へご相談ください",
    "当院では膝だけでなく、全身の動きを確認します",
    "整体院ひざこぞうの膝痛へのアプローチ",
    "自分の膝痛がどのタイプか分からない方へ",
    "通院頻度について"
  ];

  assert.ok(section, "the scoped knee-pain education block should exist");
  const positions = headings.map((heading) => section.indexOf(heading));
  positions.forEach((position, index) => {
    assert.ok(position > -1, `missing knee-pain heading: ${headings[index]}`);
  });
  for (let index = 1; index < positions.length; index += 1) {
    assert.ok(positions[index - 1] < positions[index], `${headings[index - 1]} should appear before ${headings[index]}`);
  }

  assert.equal((section.match(/class="knee-factor"/g) ?? []).length, 4, "four load factors should be shown");
  assert.equal((section.match(/class="knee-pain-flow__step"/g) ?? []).length, 4, "the pain flow should contain four steps");
  assert.equal((section.match(/class="knee-approach-step"/g) ?? []).length, 3, "the clinic approach should contain three steps");
  assert.equal((section.match(/class="knee-medical-note__item"/g) ?? []).length, 6, "the medical referral note should show six warning signs");
  assert.match(section, /href="https:\/\/lin\.ee\/X01F2mP"[^>]*>[\s\S]*LINEで膝痛について相談する/);
  assert.match(section, /src="\.\.\/image\/イラスト\/膝\/正常な膝関節と変形性膝関節症の比較\.webp"/);
  assert.match(section, /src="\.\.\/image\/flow-movement-assessment-768\.webp"/);
  assert.doesNotMatch(section, /軟骨を再生|変形を元に戻す|必ず改善|完治|根本治療|膝のズレを矯正/);
  assert.doesNotMatch(section, /最初の1〜2ヶ月|週1〜2回|frequency__phases|frequency__phase/);
});

test("knee pain education CSS is scoped and responsive", () => {
  const styles = kneeOsteoarthritisHtml.match(/\/\* KNEE_PAIN_EDUCATION_STYLES_START \*\/[\s\S]*?\/\* KNEE_PAIN_EDUCATION_STYLES_END \*\//)?.[0] ?? "";

  assert.ok(styles, "scoped knee-pain education styles should exist");
  assert.match(styles, /\.knee-education-section\{/);
  assert.match(styles, /\.knee-factor-grid\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.knee-pain-flow\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.knee-approach-steps\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.knee-factor-grid\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.knee-pain-flow\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.knee-approach-steps\{grid-template-columns:1fr/);
  assert.match(styles, /\.knee-consult-cta__link\{[^}]*min-height:44px/);
  assert.doesNotMatch(styles, /body\s*\{|html\s*\{|\.site-header|\.mobile-cta\{/);
});

test("hip pain education redesign preserves the existing page boundaries", () => {
  const bodyStart = hipOsteoarthritisHtml.indexOf("<body");
  const redesignStart = hipOsteoarthritisHtml.indexOf("<!-- HIP_PAIN_EDUCATION_START -->");
  const voicesStart = hipOsteoarthritisHtml.indexOf("<!-- SYMPTOM_PATIENT_VOICES_START -->");

  assert.ok(bodyStart > -1);
  assert.ok(redesignStart > bodyStart, "the redesigned content should start after the existing upper page");
  assert.ok(voicesStart > redesignStart, "patient voices should remain after the redesigned content");
  assert.equal(
    sha256(hipOsteoarthritisHtml.slice(bodyStart, redesignStart)),
    "9282432c2ed120c2c49331670d91348b9b5c23b5d386f53bdcfd8afcd147c473",
    "header, hero, and concerns markup must match the approved navigation baseline"
  );
  assert.equal(
    sha256(hipOsteoarthritisHtml.slice(voicesStart)),
    "905957c802b7d144e6b44ce5b0eb0715c5facf0a18a8af4625a5c1c2b681b27e",
    "patient voices onward must match the approved trust-and-safety baseline with the updated first-visit pricing and director message"
  );
});

test("hip pain education redesign follows the approved patient-friendly sequence", () => {
  const section = hipOsteoarthritisHtml.match(/<!-- HIP_PAIN_EDUCATION_START -->[\s\S]*?<!-- HIP_PAIN_EDUCATION_END -->/)?.[0] ?? "";
  const headings = [
    "股関節の痛みはなぜ起こるのか？",
    "股関節に負担が集まりやすくなる4つの要因",
    "股関節の痛みが起きるまでの流れ",
    "なぜ股関節まわりをほぐしても戻ることがあるのか？",
    "このような症状がある場合は、まず医療機関へご相談ください",
    "当院では股関節だけでなく、全身の動きを確認します",
    "整体院ひざこぞうの股関節痛へのアプローチ",
    "自分の股関節痛がどのタイプか分からない方へ",
    "通院頻度について"
  ];

  assert.ok(section, "the scoped hip-pain education block should exist");
  const positions = headings.map((heading) => section.indexOf(heading));
  positions.forEach((position, index) => {
    assert.ok(position > -1, `missing hip-pain heading: ${headings[index]}`);
  });
  for (let index = 1; index < positions.length; index += 1) {
    assert.ok(positions[index - 1] < positions[index], `${headings[index - 1]} should appear before ${headings[index]}`);
  }

  assert.equal((section.match(/class="hip-factor"/g) ?? []).length, 4, "four load factors should be shown");
  assert.equal((section.match(/class="hip-pain-flow__step"/g) ?? []).length, 4, "the pain flow should contain four steps");
  assert.equal((section.match(/class="hip-approach-step"/g) ?? []).length, 3, "the clinic approach should contain three steps");
  assert.equal((section.match(/class="hip-medical-note__item"/g) ?? []).length, 6, "the medical referral note should show six warning signs");
  assert.match(section, /href="https:\/\/lin\.ee\/X01F2mP"[^>]*>[\s\S]*LINEで股関節痛について相談する/);
  assert.match(section, /src="\.\.\/image\/イラスト\/股関節\/変形性股関節症の股関節構造\.webp"/);
  assert.match(section, /src="\.\.\/image\/flow-movement-assessment-768\.webp"/);
  assert.doesNotMatch(section, /関節破綻|過緊張|トレンデレンブルグ|インナーマッスル|再起動|手術回避|正しい歩行/);
  assert.doesNotMatch(section, /最初の1〜2ヶ月|週1〜2回|frequency__phases|frequency__phase/);
});

test("hip pain education CSS is scoped and responsive", () => {
  const styles = hipOsteoarthritisHtml.match(/\/\* HIP_PAIN_EDUCATION_STYLES_START \*\/[\s\S]*?\/\* HIP_PAIN_EDUCATION_STYLES_END \*\//)?.[0] ?? "";

  assert.ok(styles, "scoped hip-pain education styles should exist");
  assert.match(styles, /\.hip-education-section\{/);
  assert.match(styles, /\.hip-factor-grid\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.hip-pain-flow\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.hip-approach-steps\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.hip-factor-grid\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.hip-pain-flow\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.hip-approach-steps\{grid-template-columns:1fr/);
  assert.match(styles, /\.hip-consult-cta__link\{[^}]*min-height:44px/);
  assert.doesNotMatch(styles, /body\s*\{|html\s*\{|\.site-header|\.mobile-cta\{/);
});

test("disc herniation education redesign preserves the existing page boundaries", () => {
  const bodyStart = lumbarDiscHerniationHtml.indexOf("<body");
  const redesignStart = lumbarDiscHerniationHtml.indexOf("<!-- DISC_HERNIATION_EDUCATION_START -->");
  const flowStart = lumbarDiscHerniationHtml.search(/<section\b[^>]*\bid="flow"/);

  assert.ok(bodyStart > -1);
  assert.ok(redesignStart > bodyStart, "the redesigned content should start after the existing upper page");
  assert.ok(flowStart > redesignStart, "the existing treatment flow should remain after the redesigned content");
  assert.equal(
    sha256(lumbarDiscHerniationHtml.slice(bodyStart, redesignStart)),
    "6de7b57bec65b11a2979ef64b2953efcd235141cdbec1f28245cc42544726887",
    "header, hero, and concerns markup must match the approved navigation baseline"
  );
  assert.equal(
    sha256(lumbarDiscHerniationHtml.slice(flowStart)),
    "ff42fc23bb142b6ab2a2e3b6e421ac26a29aa14dcbd3075c35422295ae229e00",
    "treatment flow onward must match the approved trust-and-safety baseline with the updated consultation sections"
  );
});

test("disc herniation education redesign follows the approved patient-friendly sequence", () => {
  const section = lumbarDiscHerniationHtml.match(/<!-- DISC_HERNIATION_EDUCATION_START -->[\s\S]*?<!-- DISC_HERNIATION_EDUCATION_END -->/)?.[0] ?? "";
  const headings = [
    "椎間板ヘルニアはなぜ起こるのか？",
    "痛みやしびれにつながりやすい4つの要因",
    "腰から脚へ症状が出るまでの流れ",
    "なぜ腰やお尻をほぐしても戻ることがあるのか？",
    "このような症状がある場合は、まず医療機関へご相談ください",
    "当院では画像やしびれの場所だけでなく、全身の動きを確認します",
    "整体院ひざこぞうの椎間板ヘルニアへのアプローチ",
    "どの程度動いてよいか分からない方へ",
    "通院頻度について"
  ];

  assert.ok(section, "the scoped disc-herniation education block should exist");
  const positions = headings.map((heading) => section.indexOf(heading));
  positions.forEach((position, index) => {
    assert.ok(position > -1, `missing disc-herniation heading: ${headings[index]}`);
  });
  for (let index = 1; index < positions.length; index += 1) {
    assert.ok(positions[index - 1] < positions[index], `${headings[index - 1]} should appear before ${headings[index]}`);
  }

  assert.equal((section.match(/class="disc-factor"/g) ?? []).length, 4, "four symptom factors should be shown");
  assert.equal((section.match(/class="disc-symptom-flow__step"/g) ?? []).length, 4, "the symptom flow should contain four steps");
  assert.equal((section.match(/class="disc-approach-step"/g) ?? []).length, 3, "the clinic approach should contain three steps");
  assert.equal((section.match(/class="disc-medical-note__item"/g) ?? []).length, 6, "the medical referral note should show six warning signs");
  assert.match(section, /href="https:\/\/lin\.ee\/X01F2mP"[^>]*>[\s\S]*LINEで椎間板ヘルニアについて相談する/);
  assert.match(section, /src="\.\.\/image\/イラスト\/腰・神経\/椎間板ヘルニアによる神経圧迫\.webp"/);
  assert.match(section, /src="\.\.\/image\/flow-movement-assessment-768\.webp"/);
  assert.doesNotMatch(section, /ヘルニアを引っ込める|神経を元に戻す|インナーマッスル|腹横筋|再稼働|手術回避/);
  assert.doesNotMatch(section, /最初の1〜2ヶ月|週1回程度|frequency__phases|frequency__phase/);
});

test("disc herniation education CSS is scoped and responsive", () => {
  const styles = lumbarDiscHerniationHtml.match(/\/\* DISC_HERNIATION_EDUCATION_STYLES_START \*\/[\s\S]*?\/\* DISC_HERNIATION_EDUCATION_STYLES_END \*\//)?.[0] ?? "";

  assert.ok(styles, "scoped disc-herniation education styles should exist");
  assert.match(styles, /\.disc-education-section\{/);
  assert.match(styles, /\.disc-factor-grid\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.disc-symptom-flow\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.disc-approach-steps\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.disc-factor-grid\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.disc-symptom-flow\{grid-template-columns:1fr/);
  assert.match(styles, /@media\(max-width:767px\)\{[\s\S]*\.disc-approach-steps\{grid-template-columns:1fr/);
  assert.match(styles, /\.disc-consult-cta__link\{[^}]*min-height:44px/);
  assert.doesNotMatch(styles, /body\s*\{|html\s*\{|\.site-header|\.mobile-cta\{/);
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

test("LP places Google reviews under the voice more button before flow", () => {
  const voiceIndex = html.indexOf('class="voice-trust"');
  const moreIndex = html.indexOf('class="voice-trust__more"');
  const flowIndex = html.indexOf('id="flow"');
  const googleIndex = html.indexOf('class="google-reviews voice-trust__google"');
  const firstVisitIndex = html.indexOf('id="first-visit-policy"');
  const profileIndex = html.indexOf('id="profile"');
  const voiceToFirstVisit = html.slice(voiceIndex, firstVisitIndex);

  assert.ok(voiceIndex > -1, "patient voice section should exist");
  assert.ok(moreIndex > -1, "patient voice more button should exist");
  assert.ok(flowIndex > -1, "flow section should exist");
  assert.ok(googleIndex > -1, "Google review strip should exist");
  assert.ok(firstVisitIndex > -1, "first-visit policy section should exist");
  assert.ok(profileIndex > -1, "profile section should exist");
  assert.ok(voiceIndex < moreIndex, "patient voice more button should be inside the voice section");
  assert.ok(moreIndex < googleIndex, "Google review strip should appear under the voice more button");
  assert.ok(googleIndex < flowIndex, "flow section should follow the Google review strip");
  assert.ok(flowIndex < firstVisitIndex, "first-visit policy should appear after flow and reasons");
  assert.ok(firstVisitIndex < profileIndex, "first-visit policy should appear before profile");
  assert.doesNotMatch(voiceToFirstVisit, /id="comparison"|選び方の目安|整形外科・一般的な整体・当院の違い/);
  assert.match(html, /#first-visit-policy,\s*#profile\s*{[\s\S]*background:\s*#fff !important;[\s\S]*background-image:\s*none !important;/);
});

test("LP patient voice intro uses the reassurance message and keeps the result banner visible on mobile", () => {
  const voiceTrust = getSectionSlice('class="voice-trust"', 'class="google-reviews voice-trust__google"');

  assert.doesNotMatch(voiceTrust, /<p class="voice-trust__label">VOICE<\/p>/);
  assert.doesNotMatch(voiceTrust, /<h2 id="voice-trust-title" class="voice-trust__title">\s*患者様の声\s*<\/h2>/);
  assert.doesNotMatch(voiceTrust, /当院には、膝・腰・股関節の痛みや、歩くことへの不安でお悩みの方がご相談に来られています。/);
  assert.doesNotMatch(voiceTrust, /同じようなお悩みで来院された方のお声をご紹介します。/);

  for (const phrase of [
    "もう、",
    "一人で悩まなくて",
    "大丈夫です！",
    "どこへ行っても良くならなかった方が、",
    "当院で",
    "歩く喜びを取り戻しています。",
    "つらい足腰のお悩みは、",
    "私にお任せください。"
  ]) {
    assert.match(voiceTrust, new RegExp(escapeRegExp(phrase)));
  }

  assert.match(voiceTrust, /class="voice-reassurance-copy"/);
  assert.match(voiceTrust, /class="voice-reassurance-copy__headline"/);
  assert.match(voiceTrust, /class="voice-reassurance-copy__headline-text"/);
  assert.match(voiceTrust, /class="voice-reassurance-copy__orange">一人で悩まなくて<span class="voice-reassurance-copy__mark">大丈夫です！<\/span>/);
  assert.match(voiceTrust, /class="voice-reassurance-copy__green voice-reassurance-copy__mark"/);
  assert.match(voiceTrust, /class="voice-reassurance-copy__commitment-accent"/);
  assert.match(voiceTrust, /class="voice-reassurance-copy__orange voice-reassurance-copy__mark">私にお任せください。<\/span>/);
  assert.match(voiceTrust, /src="image\/voice-result-banner\.webp"/);
  assert.match(voiceTrust, /alt="当院の施術で改善した喜びのお声を紹介するビジュアル"/);

  assert.match(mainCss, /\.voice-reassurance-copy__headline\s*\{[\s\S]*font-size:\s*clamp\(1\.6rem,\s*4vw,\s*2\.75rem\)/);
  assert.match(mainCss, /\.voice-reassurance-copy__orange\s*\{[\s\S]*color:\s*#f05a24/);
  assert.match(mainCss, /\.voice-reassurance-copy__green\s*\{[\s\S]*color:\s*#2f7d32/);
  assert.match(mainCss, /\.voice-reassurance-copy__mark::after\s*\{[\s\S]*background:\s*rgba\(255,\s*217,\s*40,\s*0\.82\)/);
  assert.match(mainCss, /\.voice-trust__assurance\s*\{[\s\S]*display:\s*block;/);
  assert.doesNotMatch(mainCss, /@media \(max-width:\s*640px\)\s*\{[\s\S]*\.voice-trust__assurance\s*\{\s*display:\s*none;/);
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
  assert.doesNotMatch(firstVisit, /初回は、いきなり施術を進めるのではなく、状態の整理と説明を先に行います。/);
  assert.doesNotMatch(firstVisit, /不安を整理してから進めたい方に向けたご案内です。/);

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
  assert.match(html, /硬くなった筋肉をゆるめ、動きを広げる/);
  assert.match(html, /サボり筋を1つずつ目覚めさせる/);
  assert.match(html, /痛みに戻らない動きを身につける/);
  assert.match(html, /繰り返しに、終止符を/);
  assert.match(html, /無料相談・ご予約はこちら/);
  assert.doesNotMatch(html, /原因を整理する3ステップ/);
  assert.doesNotMatch(html, /image\/step1_swirl\.webp/);
  assert.doesNotMatch(html, /image\/step2_dumbbell\.webp/);
  assert.doesNotMatch(html, /image\/step3_footprint\.webp/);
});

test("LP removes the requested hero copy and clinic atmosphere gallery", () => {
  const hero = getSectionSlice(
    '<section class="pt-28 pb-16 md:pt-40 md:pb-24 bg-white overflow-hidden relative hero-fixed hz-hero">',
    'id="troubles"'
  );

  assert.doesNotMatch(hero, /階段の上り下り、歩き始め、立ち上がり、長く歩いた後の膝の痛み。/);
  assert.doesNotMatch(hero, /膝だけを揉むのではなく、硬さを緩め、必要な筋力を育て/);
  assert.doesNotMatch(hero, /柏市で膝痛にお悩みの方は、今の状態とこれからの歩みを一緒に整理していきましょう。/);
  assert.doesNotMatch(hero, /階段の上り下りがつらい/);
  assert.doesNotMatch(hero, /歩き始めに膝が痛む/);
  assert.doesNotMatch(hero, /膝に水が溜まる/);
  assert.doesNotMatch(hero, /膝をかばって腰や股関節も気になる/);
  assert.doesNotMatch(html, /id="gallery"|院内の雰囲気|aria-label="院内ギャラリー"|image\/clinic-exterior-wide-768\.webp/);
  assert.doesNotMatch(html, /相談しやすさと落ち着いた雰囲気が伝わるよう/);
  assert.doesNotMatch(html, /まずはお話を丁寧にうかがいます/);
  assert.doesNotMatch(html, /状態を見ながら分かりやすくご説明します/);
});

test("LP keeps price section after the patient voice list when the gallery is removed", () => {
  const voiceListIndex = html.indexOf('id="voice"');
  const priceIndex = html.indexOf('id="price"');

  assert.equal(html.includes('id="gallery"'), false, "gallery section should be removed");
  assert.ok(voiceListIndex > -1, "patient voice list should exist");
  assert.ok(priceIndex > -1, "price section should exist");
  assert.ok(voiceListIndex < priceIndex, "price section should appear after the patient voice list");
  assert.doesNotMatch(html, /href="blog\/posts\/knee-pain-stairs-guide\/"/);
  assert.doesNotMatch(html, /href="blog\/posts\/walking-start-knee-pain-cause\/"/);
});

test("LP keeps the retired knee-only symptom finder removed", () => {
  assert.doesNotMatch(html, /id="knee-type-nav"/);
  assert.doesNotMatch(html, /膝の痛み・不調を探す/);
  assert.doesNotMatch(html, /症状の出方や場所から、あなたに合った情報ページをすぐに見つけられます。/);
  assert.doesNotMatch(html, /id="symptoms"/);
});

test("TOP hero remains byte-for-byte unchanged", () => {
  const heroStart = html.indexOf('<section class="pt-28 pb-16 md:pt-40 md:pb-24 bg-white overflow-hidden relative hero-fixed hz-hero">');
  const heroEnd = html.indexOf('<section class="hero-safe-band', heroStart);

  assert.ok(heroStart > -1);
  assert.ok(heroEnd > heroStart);
  assert.equal(
    sha256(html.slice(heroStart, heroEnd)),
    "bdc7d3ccea1fcd9069668bac02714ceef308cd30dfec2bbc79187a7c1e39e0e9"
  );
});

test("TOP routes visitors to the six major symptoms before troubles", () => {
  const guide = html.match(/<!-- TOP_SYMPTOM_GUIDE_START -->[\s\S]*?<!-- TOP_SYMPTOM_GUIDE_END -->/)?.[0] ?? "";
  const links = [
    "symptoms/lower-back-pain.html",
    "symptoms/sciatica.html",
    "symptoms/spinal-stenosis.html",
    "symptoms/lumbar-disc-herniation.html",
    "symptoms/hip-osteoarthritis.html",
    "symptoms/knee-osteoarthritis.html",
    "symptoms/index.html"
  ];

  assert.ok(guide, "TOP symptom guide should exist");
  for (const href of links) {
    assert.match(guide, new RegExp(`href="${escapeRegExp(href)}"`));
  }
  assert.equal((guide.match(/data-top-symptom-link/g) ?? []).length, 6);
  assert.ok(html.indexOf("TOP_SYMPTOM_GUIDE_START") < html.indexOf('id="troubles"'));
});

test("TOP includes concise medical guidance", () => {
  const guide = html.match(/<!-- TOP_SYMPTOM_GUIDE_START -->[\s\S]*?<!-- TOP_SYMPTOM_GUIDE_END -->/)?.[0] ?? "";

  assert.match(guide, /急に力が入りにくくなった/);
  assert.match(guide, /排尿・排便に異常がある/);
  assert.match(guide, /事故や転倒後から強い痛みが続く/);
  assert.match(guide, /発熱や強い体調不良を伴う/);
  assert.match(guide, /data-top-medical-guidance/);
});

test("TOP uses responsive routing styles and avoids the 1024px header overflow", () => {
  assert.match(mainCss, /@media\s*\(max-width:\s*1079px\)\s*{[\s\S]*?\.site-header__inner--upper/);
  assert.match(mainCss, /\.top-symptom-guide__grid\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(mainCss, /@media\s*\(max-width:\s*1079px\)\s*{[\s\S]*?\.top-symptom-guide__grid\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(mainCss, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*?\.top-symptom-guide__grid\s*{[^}]*grid-template-columns:\s*1fr/);
  assert.match(mainCss, /\.top-symptom-guide__card\s*{[^}]*min-height:\s*72px/);
  assert.match(mainCss, /\.top-symptom-guide__all\s*{[^}]*min-height:\s*44px/);
});

test("TOP uses a lightweight icon runtime and lazy-loads the offscreen voice banner", () => {
  assert.equal(existsSync(topIconsPath), true, "top-icons.js should exist");
  assert.match(html, /<script src="scripts\/top-icons\.js" defer><\/script>/);
  assert.doesNotMatch(html, /<script src="scripts\/vendor\/lucide\.min\.js" defer><\/script>/);
  assert.match(html, /<img src="image\/voice-result-banner\.webp"[^>]+loading="lazy"/);
  assert.match(html, /<img src="image\/hero-pc\.webp"[^>]+loading="eager"[^>]+fetchpriority="high"/);
  assert.ok(Buffer.byteLength(topIconsJs) < 20 * 1024, "TOP icon runtime should stay below 20KB");
  for (const icon of ["map-pin", "calendar-check-2", "user-check", "phone-call", "message-circle", "phone", "user-round", "check-circle-2", "leaf", "send", "x", "alert-circle", "loader-2"]) {
    assert.match(topIconsJs, new RegExp(`"${escapeRegExp(icon)}"`));
  }
});

test("TOP tracking records symptom exploration, guidance visibility, and contact intent", () => {
  for (const eventName of [
    "top_symptom_link_click",
    "top_all_symptoms_click",
    "top_medical_guidance_view",
    "top_contact_form_start",
    "top_contact_form_submit"
  ]) {
    assert.match(`${trackingJs}\n${mainJs}`, new RegExp(escapeRegExp(eventName)));
  }
  assert.match(trackingJs, /data-top-symptom-link/);
  assert.match(trackingJs, /data-top-all-symptoms/);
  assert.match(mainJs, /IntersectionObserver/);
});

test("LP splits CTA roles between mid-page consultation and final reservation", () => {
  const priceSection = getSectionSlice('id="price"', 'id="faq"');
  const accessSection = getSectionSlice('id="access"', "<footer");

  assert.match(priceSection, /お電話でのご予約はこちら/);
  assert.match(priceSection, /LINEで相談・予約する/);
  assert.doesNotMatch(priceSection, /LINEで1分かんたん仮予約|LINEで１分かんたん仮予約/);
  assert.match(priceSection, /会員登録不要/);
  assert.match(priceSection, /現金/);
  assert.match(priceSection, /各種クレジットカード/);
  assert.match(priceSection, /PayPay/);
  assert.doesNotMatch(priceSection, /腰・股関節・膝・足まわりの痛みや不安を抱えている方へ。/);
  assert.doesNotMatch(priceSection, /まずは今の状態を一緒に確認していきましょう。/);
  assert.doesNotMatch(priceSection, /LINEで予約する/);
  assert.match(mainCss, /\.hk-pricing-copy\s*{[^}]*max-width:\s*34em;[^}]*text-wrap:\s*pretty;[^}]*word-break:\s*keep-all;[^}]*overflow-wrap:\s*break-word;/);
  assert.match(mainCss, /\.hk-pricing-copy__line\s*{[^}]*display:\s*block;[^}]*max-width:\s*30em;[^}]*margin:\s*0\.25rem auto 0;/);
  assert.match(accessSection, /一人で悩まず、まずは私にご相談ください。/);
  assert.doesNotMatch(accessSection, /足腰の状態を一度整理してみませんか？/);
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

test("LP places FAQ below access with enough breathing room before the footer", () => {
  const faqIndex = html.indexOf('id="faq"');
  const accessIndex = html.indexOf('id="access"');

  assert.ok(faqIndex > -1, "FAQ section should exist");
  assert.ok(accessIndex > -1, "access section should exist");
  assert.ok(faqIndex > accessIndex, "FAQ should follow access");
  assert.match(mainCss, /#faq\s*\{[\s\S]*padding-bottom:\s*clamp\(4\.75rem,\s*8vw,\s*7rem\)\s*!important;/);
  assert.match(mainCss, /#faq\s*\{[\s\S]*margin-bottom:\s*clamp\(1\.25rem,\s*3vw,\s*2\.5rem\)\s*!important;/);
  assert.match(mainCss, /#access\s*\{[\s\S]*padding-top:\s*clamp\(4\.75rem,\s*8vw,\s*7rem\)\s*!important;/);
  assert.match(mainCss, /@media \(max-width:\s*640px\)\s*\{[\s\S]*#faq\s*\{[\s\S]*padding-bottom:\s*4rem\s*!important;[\s\S]*#access\s*\{[\s\S]*padding-top:\s*4rem\s*!important;/);
});

test("LP renders Google review slider from provided real review data", () => {
  const voiceIndex = html.indexOf('class="voice-trust"');
  const moreIndex = html.indexOf('class="voice-trust__more"');
  const flowIndex = html.indexOf('id="flow"');
  const googleIndex = html.indexOf('class="google-reviews voice-trust__google"');
  const reviewSection = getSectionSlice('class="google-reviews voice-trust__google"', 'id="flow"');
  const expectedNames = ["梶谷武志様", "K様", "平川智江美様", "Kyoko T", "F.M.様", "Rit K様", "K.K.様", "NAO FUCHI様"];

  assert.ok(voiceIndex > -1, "patient voice section should exist");
  assert.ok(moreIndex > voiceIndex, "voice more button should appear inside patient voices");
  assert.ok(googleIndex > moreIndex, "Google review strip should appear under the voice more button");
  assert.ok(googleIndex < flowIndex, "Google review strip should stay before the treatment flow");
  assert.match(reviewSection, /voice-trust__google/);
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

test("LP FAQ keeps five visible reservation questions without FAQ rich-result schema", () => {
  const expectedQuestions = [
    "初回はどのくらい時間がかかりますか？",
    "痛い施術ですか？",
    "病院に通いながらでも大丈夫ですか？",
    "どのくらいのペースで通えばいいですか？",
    "駐車場はありますか？"
  ];
  const expectedAnswers = [
    "初回は約90分を目安に、カウンセリング・状態確認・施術・今後のご説明を行います。お身体の状態を丁寧に確認するため、少し長めにお時間をいただいています。",
    "強く揉んだり、無理に動かしたりする施術ではありません。状態を確認しながら、安心して受けていただける範囲で進めます。",
    "はい、大丈夫です。病院での検査や治療を否定せず、併用しながらできることを一緒に考えていきます。",
    "症状の強さや生活での負担によって変わります。初回で状態を確認したうえで、無理のない通院ペースをご提案します。必要以上に通わせるようなご案内はしません。",
    "専用駐車場はございませんが、徒歩1〜2分の場所にコインパーキングが複数あります。初回ご来院時は、駐車料金として300円を当院で負担いたします。"
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
  assert.equal((faqSection.match(/<dt>/g) ?? []).length, 5, "LP FAQ should render exactly five lightweight list questions");
  assert.equal((faqSection.match(/class="lp-faq-item"/g) ?? []).length, 5, "LP FAQ items should use compact custom spacing");
  assert.match(mainCss, /#faq dt\s*\{[\s\S]*color:\s*#15803d/);
  assert.match(mainCss, /#faq dt\s*\{[\s\S]*font-size:\s*1\.12rem/);
  assert.match(mainCss, /#faq dt span\s*\{[\s\S]*color:\s*#2563eb/);
  assert.match(mainCss, /#faq dd\s*\{[\s\S]*color:\s*#111827/);
  assert.match(mainCss, /#faq dd span\s*\{[\s\S]*color:\s*#dc2626/);
  assert.match(mainCss, /#faq \.lp-faq-item\s*\{[\s\S]*padding:\s*0\.9rem 0/);
  assert.match(mainCss, /@media \(max-width:\s*640px\)\s*\{[\s\S]*#faq \.lp-faq-item\s*\{[\s\S]*padding:\s*0\.78rem 0/);

  assert.equal(getJsonLdBlocks("FAQPage").length, 0, "FAQ rich-result schema should stay omitted");
  assert.doesNotMatch(faqSection, /予約はLINEでできますか？|公式LINEからご予約いただけます|変形性膝関節症と言われても受けられますか？|健康保険は使えますか？|どんな服装で行けばいいですか？|回数券を無理にすすめられることはありますか？|無理なご提案や押し売りはしません。|予約のキャンセル・変更はできますか？/);
  assert.match(html, /LINEからご希望日時を送ってください。空き状況を確認して、こちらから返信いたします。/);
});

test("LP director profile is a short message card that links to the staff page", () => {
  const profile = getTopLevelSectionSlice("profile");

  assert.match(profile, /<div class="director-profile__card">/);
  assert.match(profile, /src="image\/director-kawakami-profile-768\.webp"/);
  assert.match(profile, /alt="整体院ひざこぞう 院長 川上卓哉"/);
  assert.match(profile, /院長からのメッセージ/);
  assert.match(profile, /痛み、シビレの根本原因を追求します。/);
  assert.doesNotMatch(profile, /痛みの背景まで、一緒に整理します。/);
  assert.match(profile, /病院や整骨院に通っても<span class="director-profile__mark">改善しない痛み<\/span>に悩む方が多く来院されています。/);
  assert.match(profile, /当院では筋肉だけでなく、神経の動きやすさや身体の使い方まで評価し、<span class="director-profile__mark">原因<\/span>を見極めます。/);
  assert.match(profile, /すべての症状に同じ結果を約束することはできませんが、<span class="director-profile__mark">改善に向かう最短ルート<\/span>を一緒に探します。/);
  assert.match(profile, /href="\/staff\.html" class="director-profile__button">院長の想い・経歴を詳しく見る<\/a>/);
  assert.equal((profile.match(/class="director-profile__mark"/g) ?? []).length, 3);
  assert.equal((profile.match(/<p>/g) ?? []).length, 3);

  for (const removedCopy of [
    "経歴・資格",
    "院長のこと、もう少し",
    "私が痛みの専門家を目指したわけと施術への想い",
    "学生時代の膝痛との闘い",
    "20歳でのクローン病経験",
    "不安ゼロの空間を大切にしています",
    "国家資格 柔道整復師",
    "施術歴 14年",
    "MSMメソッド修了"
  ]) {
    assert.doesNotMatch(profile, new RegExp(escapeRegExp(removedCopy)), `top-page profile should not keep long detail: ${removedCopy}`);
  }

  assert.match(mainCss, /\.director-profile__card\s*{[\s\S]*grid-template-columns:\s*minmax\(180px,\s*240px\) minmax\(0,\s*1fr\);[\s\S]*background:\s*linear-gradient\(180deg,\s*#fffdf9 0%,\s*#fff8ef 100%\);[\s\S]*border-radius:\s*24px;/);
  assert.match(mainCss, /\.director-profile__copy p\s*{[\s\S]*font-size:\s*1\.06rem;[\s\S]*line-height:\s*1\.95;/);
  assert.match(mainCss, /\.director-profile__mark\s*{[\s\S]*color:\s*#c9452c;[\s\S]*background:\s*linear-gradient\(transparent 62%, rgba\(255, 222, 104, 0\.58\) 62%\);/);
  assert.match(mainCss, /\.director-profile__button\s*{[\s\S]*border:\s*1px solid #d8c5ad;[\s\S]*background:\s*#fff;[\s\S]*color:\s*#6a452f;/);
  assert.match(mainCss, /@media \(max-width:\s*600px\)\s*\{[\s\S]*\.director-profile__card\s*{[\s\S]*grid-template-columns:\s*1fr;[\s\S]*\.director-profile__button\s*{[\s\S]*width:\s*100%;/);
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
  for (const movedQuestion of ["健康保険は使えますか？", "駐車場はありますか？", "回数券を無理にすすめられることはありますか？", "予約のキャンセル・変更はできますか？", "階段の下りで膝が痛いのはなぜですか？"]) {
    assert.match(faqHtml, new RegExp(escapeRegExp(movedQuestion)));
  }
  assert(
    faqHtml.indexOf("駐車場はありますか？") < faqHtml.indexOf("回数券を無理にすすめられることはありますか？"),
    "FAQ detail page should show parking before the coupon question"
  );
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
  assert.match(accessHtml, /LINEで相談・予約する/);
  assert.doesNotMatch(accessHtml, /LINEで1分かんたん仮予約|LINEで１分かんたん仮予約/);
  assert.match(accessHtml, /会員登録不要/);
  assert.match(accessHtml, /電話で確認する/);
  assert.match(accessHtml, /href="tel:0471143274"/);
  assert.match(accessHtml, /<iframe[\s\S]*整体院ひざこぞうへのアクセスマップ/);

  assert.match(symptomsIndexHtml, /<title>症状別ページ｜整体院ひざこぞう<\/title>/);
  assert.match(symptomsIndexHtml, /<h1 id="page-title">症状別ページ<\/h1>/);
  assert.match(symptomsIndexHtml, /自分に近い探し方を選んでください/);
  assert.match(symptomsIndexHtml, /<link rel="canonical" href="https:\/\/hizakozou\.jp\/symptoms\/">/);
    for (const groupTitle of [
      "腰・お尻・脚",
      "股関節",
      "膝",
      "足首・足裏",
      "首・肩・腕・手",
      "背骨・姿勢・顎"
    ]) {
      assert.match(symptomsIndexHtml, new RegExp(escapeRegExp(groupTitle)));
    }
    for (const [href, label] of [
      ["lower-back-pain.html", "腰痛"],
      ["sciatica.html", "坐骨神経痛"],
      ["spinal-stenosis.html", "脊柱管狭窄症"],
      ["lumbar-disc-herniation.html", "腰椎椎間板ヘルニア"],
      ["hip-osteoarthritis.html", "変形性股関節症"],
      ["knee-osteoarthritis.html", "変形性膝関節症"],
      ["knee-effusion.html", "膝に水"],
      ["pes-anserine-bursitis.html", "膝の内側"],
      ["knee-lateral-pain.html", "膝の外側"],
      ["knee-posterior-pain.html", "膝の裏側"],
      ["knee-front-pain.html", "膝の前側"],
      ["meniscus-knee-pain.html", "半月板"],
      ["bowlegs-knee-pain.html", "O脚"],
      ["knee-hyperextension.html", "反張膝"],
      ["ankle-stiffness-knee-pain.html", "足首の硬さ"],
      ["plantar-fasciitis.html", "足底筋膜炎"],
      ["shoulder-stiffness.html", "肩こり"],
      ["frozen-shoulder.html", "五十肩"],
      ["cervical-spondylosis.html", "頚椎症"],
      ["thoracic-outlet.html", "胸郭出口症候群"],
      ["carpal-tunnel.html", "手根管症候群"],
      ["elbow-tendinopathy.html", "肘の痛み"],
      ["scoliosis.html", "側弯症"],
      ["tmj.html", "顎関節症"]
    ]) {
      assert.match(symptomsIndexHtml, new RegExp(`href="${escapeRegExp(href)}"`));
      assert.match(symptomsIndexHtml, new RegExp(escapeRegExp(label)));
      assert.equal(existsSync(path.join(repoRoot, "symptoms", href)), true, `${href} should exist`);
    }
    for (const offAxis of ["frozen-shoulder.html", "shoulder-stiffness.html", "tmj.html"]) {
      assert.doesNotMatch(readFileSync(path.join(repoRoot, "symptoms", offAxis), "utf8"), /<meta name="robots" content="noindex,follow">/);
    }
    const directoryLinks = [...symptomsIndexHtml.matchAll(/class="symptom-directory__link" href="([^"]+)"/g)].map((match) => match[1]);
    assert.ok(directoryLinks.length > 24, "the three entry modes may repeat relevant destinations");
    assert.equal(new Set(directoryLinks).size, 24);
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
