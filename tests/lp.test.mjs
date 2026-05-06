import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const mainJs = readFileSync(new URL("../scripts/main.js", import.meta.url), "utf8");
const buildBlogScript = readFileSync(new URL("../scripts/build-blog.mjs", import.meta.url), "utf8");
const generateBlogScript = readFileSync(new URL("../scripts/generate-blog.mjs", import.meta.url), "utf8");

function getJsonLdBlocks(type) {
  const matches = [...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)];

  return matches
    .map((match) => JSON.parse(match[1]))
    .filter((block) => block["@type"] === type);
}

function getSectionSlice(startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  const end = endMarker ? html.indexOf(endMarker) : html.length;

  assert.ok(start > -1, `missing start marker: ${startMarker}`);
  assert.ok(end > start, `missing end marker after ${startMarker}`);

  return html.slice(start, end);
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
    '<section class="pt-28 pb-16 md:pt-40 md:pb-24 bg-white overflow-hidden relative hero-fixed">',
    'id="troubles"',
    'id="first-visit-policy"',
    'id="seo-guide"',
    'id="approach"',
    'id="flow"',
    'id="profile"',
    'id="voice"',
    'id="knee-type-nav"',
    'id="symptoms"',
    'id="price"',
    'id="faq"',
    'id="blog-section"',
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

test("LP local image assets resolve to existing files", () => {
  const localRefs = getLocalImageReferences();

  assert.ok(localRefs.length > 0, "should find local image references in the LP");

  for (const ref of localRefs) {
    const absolutePath = path.join(repoRoot, ref.replace(/\//g, path.sep));

    assert.equal(existsSync(absolutePath), true, `missing local image asset: ${ref}`);
  }
});

test("LP has an overflow-safe mobile hero title", () => {
  assert.match(html, /<h1 class="[^"]*\bhero-title\b[^"]*"/, "hero title should keep the hero-title hook");
  assert.match(html, /\.hero-fixed \.hero-title\s*\{[\s\S]*overflow-wrap:\s*anywhere/i);
  assert.match(html, /\.hero-fixed \.hero-title\s*\{[\s\S]*font-size:\s*clamp\(/i);
});

test("LP mobile hero title and fixed CTA stay compact on narrow screens", () => {
  assert.match(html, /font-size:\s*clamp\(1\.72rem,\s*7\.4vw,\s*3\.6rem\)\s*!important;/);
  assert.doesNotMatch(html, /font-size:\s*clamp\(2rem,\s*8\.6vw,\s*4rem\)/);
  assert.match(html, /<span class="mobile-fixed-cta__label">LINE相談<\/span>/);
  assert.match(html, /<span class="mobile-fixed-cta__label">電話<\/span>/);
  assert.doesNotMatch(getSectionSlice('class="fixed bottom-0', '<script src="scripts/main.js"'), /LINEで予約する/);
});

test("LP exposes a real contact anchor for generated blog CTAs", () => {
  assert.match(html, /id="contact"/, "LP should expose a contact anchor");
  assert.doesNotMatch(buildBlogScript, /#contact/, "blog templates should not point to a missing contact anchor by accident");
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

test("LP blog preview uses the compact B-plan structure with repo thumbnails", () => {
  const blogSection = getSectionSlice('id="blog-section"', 'id="access"');
  const cardMatches = [...blogSection.matchAll(/class="blog-b-card group"/g)];
  const thumbSrcMatches = [...blogSection.matchAll(/<img src="([^"]+)" alt="[^"]*" loading="lazy" decoding="async" width="\d+" height="\d+">/g)];

  assert.equal(cardMatches.length, 3, "blog preview should render exactly three compact cards");
  assert.match(blogSection, /class="blog-b-button"[\s\S]*記事一覧を見る/);
  assert.match(blogSection, /class="blog-b-side"/);
  assert.match(blogSection, /class="blog-b-date"/);
  assert.match(blogSection, /class="blog-b-arrow"/);

  for (const [, src] of thumbSrcMatches) {
    assert.match(src, /^image\/[^"]+\.(?:svg|png|jpe?g|webp)$/i, "blog card thumbnails should use stable repo images");
    assert.doesNotMatch(src, /^data:/i, "blog card thumbnails should not use inline data URIs");
  }
});

test("LP keeps only one first-visit policy section and removes the duplicate article block", () => {
  const firstVisitHeadingCount = html.match(/初回で行うこと \/ 行わないこと/g)?.length ?? 0;

  assert.equal(firstVisitHeadingCount, 1, "first-visit reassurance should appear only once");
  assert.equal(html.includes('class="initial-visit-guide"'), false, "duplicate first-visit image section should be removed");
  assert.equal(html.includes("来院前に確認されやすいこと"), false, "mid-page article detour should be removed");
});

test("LP keeps the knee-pain specialty axis and unifies the improvement story without a duplicate three-step section", () => {
  const hero = getSectionSlice(
    '<section class="pt-28 pb-16 md:pt-40 md:pb-24 bg-white overflow-hidden relative hero-fixed">',
    'id="troubles"'
  );
  const metaDescription = "柏市で膝痛・変形性膝関節症・歩き始めや階段の痛みにお悩みの方へ。整体院ひざこぞうでは、膝だけでなく歩き方・股関節・足首・身体の使い方まで確認し、膝に負担が集まりにくい身体づくりをサポートします。柏駅西口徒歩8分、完全予約制。";

  assert.match(html, /<title>柏市で膝痛・膝の痛みの整体相談なら｜整体院ひざこぞう<\/title>/);
  assert.match(html, new RegExp(`<meta name="description" content="${metaDescription}">`));
  assert.match(html, /柏市で、歩くたびにつらい膝痛に。/);
  assert.match(hero, /膝だけでなく歩き方や身体の使い方から整え、/);
  assert.match(hero, /もっと楽に歩ける身体へ。/);
  assert.match(hero, /変形性膝関節症・歩行時痛・階段のつらさに、/);
  assert.match(hero, /施術と運動療法で向き合う膝痛専門整体院です。/);
  assert.doesNotMatch(hero, /確認します。/);
  assert.match(hero, /柏市で膝痛にお悩みの方は、/);
  assert.match(hero, /今の状態を一緒に整理していきましょう。/);
  assert.match(html, /膝の痛みは、痛む場所だけを見ても分からないことがあります/);
  assert.match(html, /膝だけを揉んで終わるのではなく/);
  assert.match(html, /<h2 class="section-title">なぜ膝の痛みが長引くのか？<\/h2>/);
  assert.equal(html.includes('id="three-step-care"'), false, "standalone three-step section should be removed");
  assert.equal(
    html.includes("当院が提供する「3つの柱」の正しい順序"),
    false,
    "duplicate three-pillar ordering block should be removed"
  );
  assert.match(html, /まず痛みを落ち着かせる/);
  assert.match(html, /膝を守る筋肉の使い方を身につける/);
  assert.match(html, /「動いても大丈夫」という感覚を取り戻す/);
});

test("LP keeps knee-type navigation ahead of the broader symptom directory", () => {
  const typeNavIndex = html.indexOf('id="knee-type-nav"');
  const symptomsIndex = html.indexOf('id="symptoms"');

  assert.ok(typeNavIndex > -1, "knee-pain type navigation should exist");
  assert.ok(symptomsIndex > -1, "symptoms section should exist");
  assert.ok(typeNavIndex < symptomsIndex, "type navigation should appear before the broader symptom list");
  assert.match(html, /href="blog\/posts\/knee-pain-stairs-guide\/"/);
  assert.match(html, /href="blog\/posts\/walking-start-knee-pain-cause\/"/);
  assert.match(html, /柏市で変形性膝関節症の整体相談/);
  assert.match(html, /歩き始めに膝が痛い方へ/);
  assert.match(html, /階段の上り下りで膝がつらい方へ/);
  assert.match(html, /膝に水が溜まりやすい方へ/);
  assert.match(html, /膝の内側が痛い方へ/);
  assert.match(html, /href="symptoms\/knee-effusion\.html"/);
  assert.match(html, /href="symptoms\/knee-posterior-pain\.html"/);
  assert.match(html, /href="symptoms\/knee-hyperextension\.html"/);
});

test("LP presents broader symptoms as knee-related support, not the main specialty", () => {
  const symptoms = getSectionSlice('id="symptoms"', 'id="price"');

  assert.match(symptoms, /膝痛と関係しやすい身体の不調/);
  assert.match(symptoms, /膝痛を中心に、股関節・足首・腰など膝への負担に関係しやすい不調を整理しています。/);
  assert.match(symptoms, /膝痛と関係しやすい股関節・足首・腰/);
  assert.match(symptoms, /肩・首・腕のご相談/);
  assert.ok(
    symptoms.indexOf("膝の痛み") < symptoms.indexOf("肩・首・腕のご相談"),
    "knee symptoms should appear before less-related shoulder and neck concerns"
  );
});

test("LP splits CTA roles between mid-page consultation and final reservation", () => {
  const priceSection = getSectionSlice('id="price"', 'id="faq"');
  const accessSection = getSectionSlice('id="access"', "<footer");

  assert.match(priceSection, /LINEで相談する/);
  assert.doesNotMatch(priceSection, /LINEで予約する/);
  assert.match(accessSection, /LINEで予約する/);
  assert.match(accessSection, /電話で確認する/);
});

test("LP FAQ keeps practical questions and schema stays aligned with the rendered section", () => {
  const expectedQuestions = [
    "健康保険は使えますか？",
    "施術は痛いですか？ボキボキ鳴らしますか？",
    "どのような服装で行けばいいですか？",
    "何回くらい通えばよくなりますか？",
    "整形外科に通いながらでも相談できますか？",
    "柏市で膝痛の整体を探しています。どんな症状を相談できますか？",
    "膝に水が溜まっていても整体を受けられますか？",
    "変形性膝関節症と言われても整体で相談できますか？",
    "歩き始めだけ膝が痛い場合も見てもらえますか？",
    "階段の下りで膝が痛いのはなぜですか？",
    "駐車場はありますか？",
    "予約のキャンセル・変更はできますか？"
  ];

  const renderedQuestions = [...html.matchAll(/<span class="text-blue-600 font-black text-xl" aria-hidden="true">Q\.<\/span>([^<]+)<\/div>/g)].map(
    (match) => match[1].trim()
  );

  assert.deepEqual(renderedQuestions, expectedQuestions, "rendered FAQ should contain only the practical questions in order");

  const faqSchema = getJsonLdBlocks("FAQPage")[0];

  assert.ok(faqSchema, "FAQ schema should exist");
  assert.deepEqual(
    faqSchema.mainEntity.map((entry) => entry.name),
    expectedQuestions,
    "FAQ schema should stay aligned with the rendered FAQ questions"
  );
  assert.equal(html.includes("初めてで緊張しているのですが大丈夫ですか？"), false, "reassurance-only FAQ should be removed");
  assert.equal(html.includes("膝以外の症状もみてもらえますか？"), false, "scope explanation should move out of FAQ");
  assert.equal(html.includes("運動が苦手でも大丈夫ですか？"), false, "exercise reassurance should not repeat in FAQ");
});
