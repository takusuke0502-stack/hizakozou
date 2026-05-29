import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const mainJs = readFileSync(new URL("../scripts/main.js", import.meta.url), "utf8");
const mainCss = readFileSync(new URL("../styles/main.css", import.meta.url), "utf8");
const buildBlogScript = readFileSync(new URL("../scripts/build-blog.mjs", import.meta.url), "utf8");
const generateBlogScript = readFileSync(new URL("../scripts/generate-blog.mjs", import.meta.url), "utf8");
const trackingConfigPath = path.join(repoRoot, "scripts", "tracking-config.js");
const trackingJsPath = path.join(repoRoot, "scripts", "tracking.js");
const trackingConfig = existsSync(trackingConfigPath) ? readFileSync(trackingConfigPath, "utf8") : "";
const trackingJs = existsSync(trackingJsPath) ? readFileSync(trackingJsPath, "utf8") : "";

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
    'id="first-visit-policy"',
    'id="seo-guide"',
    'id="msm-method"',
    'id="comparison"',
    'id="flow"',
    'id="profile"',
    'id="voice"',
    'id="knee-type-nav"',
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

test("LP canonicalizes direct index.html visits to the root URL", () => {
  assert.match(html, /<link rel="canonical" href="https:\/\/hizakozou\.jp\/">/);
  assert.match(html, /window\.location\.pathname\.endsWith\("\/index\.html"\)/);
  assert.match(html, /window\.location\.replace\(canonicalPath \+ window\.location\.search \+ window\.location\.hash\)/);
});

test("desktop header groups access/contact and exposes a keyboard-friendly real symptom dropdown", () => {
  const desktopNav = getSectionSlice('<nav class="site-nav"', '<nav class="site-mobile-nav"');
  const mobileNav = getElementSlice('<nav class="site-mobile-nav"');
  const symptomLinks = [
    ["symptoms/knee-osteoarthritis.html", "変形性膝関節症"],
    ["symptoms/pes-anserine-bursitis.html", "膝の内側の痛み"],
    ["symptoms/knee-effusion.html", "膝に水がたまる"],
    ["symptoms/meniscus-knee-pain.html", "半月板の違和感"],
    ["symptoms/knee-front-pain.html", "膝の前側の痛み"],
    ["symptoms/knee-posterior-pain.html", "膝の裏側の痛み"],
    ["symptoms/knee-lateral-pain.html", "膝の外側の痛み"],
    ["symptoms/hip-osteoarthritis.html", "股関節痛"]
  ];

  assert.match(desktopNav, /症状別/);
  assert.match(desktopNav, /SYMPTOMS/);
  assert.match(desktopNav, /aria-haspopup="true"/);
  assert.match(desktopNav, /aria-controls="site-symptoms-menu"/);
  assert.match(desktopNav, /aria-expanded="false"/);
  assert.match(desktopNav, /aria-label="症状別ページ"/);
  assert.match(desktopNav, /アクセス・予約/);
  assert.match(desktopNav, /ACCESS \/ CONTACT/);
  assert.match(desktopNav, /href="#access"/);

  assert.doesNotMatch(desktopNav, /院情報・アクセス/);
  assert.doesNotMatch(desktopNav, /INFO \/ ACCESS/);
  assert.doesNotMatch(desktopNav, /ご予約・お問合せ/);

  for (const [href, label] of symptomLinks) {
    assert.match(desktopNav, new RegExp(`href="${escapeRegExp(href)}"`), `${label} should be linked`);
    assert.match(desktopNav, new RegExp(escapeRegExp(label)), `${label} should be visible`);
    assert.equal(existsSync(path.join(repoRoot, href)), true, `${href} should exist`);
  }

  assert.doesNotMatch(mobileNav, /site-nav__dropdown/);
  assert.doesNotMatch(mobileNav, /SYMPTOMS/);
  assert.match(mobileNav, /href="#access"/);
  assert.match(mobileNav, /href="#contact"/);

  assert.match(mainCss, /\.site-nav__item--has-dropdown:hover\s+\.site-nav__dropdown/);
  assert.match(mainCss, /\.site-nav__item--has-dropdown:focus-within\s+\.site-nav__dropdown/);
  assert.match(mainCss, /\.site-nav__item--has-dropdown\.is-open\s+\.site-nav__dropdown/);
  assert.match(mainCss, /\.site-nav__dropdown-link:focus-visible/);

  assert.match(mainJs, /setupHeaderSymptomDropdown/);
  assert.match(mainJs, /aria-expanded/);
  assert.match(mainJs, /is-open/);
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
  assert.match(thanksHtml, /window\.gtag\("event", "conversion", \{ send_to: "AW-18109043080\/zShOCLee9LIcEIijiLtD" \}\);/);
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
  assert.match(html, /image\/patient-voice-kt\.webp/);
  assert.match(html, /image\/patient-voice-yn\.webp/);
  assert.match(html, /image\/patient-voice-kk-anonymized\.webp/);
  assert.match(html, /image\/patient-voice-numajiri\.webp/);
  assert.doesNotMatch(html, /patient-voice-yo-knee\.png/);
  assert.doesNotMatch(html, /patient-voice-ym-hip\.png/);
  assert.match(html, /K\.T/);
  assert.match(html, /Y\.N/);
  assert.match(html, /K\.K/);
  assert.match(html, /N\.H/);
  assert.doesNotMatch(html, /Y\.O様/);
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

test("LP mobile hero title and fixed CTA stay compact on narrow screens", () => {
  assert.match(html, /font-size:\s*clamp\(1\.42rem,\s*6vw,\s*3\.6rem\)\s*!important;/);
  assert.doesNotMatch(html, /font-size:\s*clamp\(2rem,\s*8\.6vw,\s*4rem\)/);
  assert.match(html, /<span class="mobile-fixed-cta__label">LINEで空き状況を確認<\/span>/);
  assert.doesNotMatch(getSectionSlice('class="fixed bottom-0', '<script src="scripts/main.js"'), /tel:0471143274/);
  assert.doesNotMatch(getSectionSlice('class="fixed bottom-0', '<script src="scripts/main.js"'), /LINEで予約する/);
});

test("LP Step 2 uses Japanese labels, comparison table, and a single mobile LINE CTA", () => {
  const approach = getSectionSlice('id="msm-method"', 'id="comparison"');
  const comparison = getSectionSlice('id="comparison"', 'id="flow"');
  const fixedCta = getSectionSlice('class="fixed bottom-0', '<script src="scripts/main.js"');

  assert.doesNotMatch(html, /CLINICAL VIEW|HIZAKOZOU METHOD|FIRST VISIT/);
  assert.match(approach, /STEP\s*<strong>1<\/strong>/);
  assert.match(approach, /STEP\s*<strong>2<\/strong>/);
  assert.match(approach, /STEP\s*<strong>3<\/strong>/);
  assert.match(html, /膝痛を見立てる視点/);
  assert.match(html, /初回の進め方/);
  assert.match(html, /ひざこぞう式MSMメソッド/);
  assert.equal(html.includes('id="method-features"'), false, "duplicated feature section should be integrated into the method section");
  assert.match(comparison, /整形外科・一般的な整体・当院の違い/);
  assert.match(comparison, /<table class="hz-compare-table">/);
  assert.match(comparison, /class="hz-compare-mobile"/);
  assert.match(comparison, /class="hz-compare-card"/);
  assert.match(html, /@media \(min-width: 380px\) and \(max-width: 767px\)/);
  assert.match(comparison, /整形外科/);
  assert.match(comparison, /一般的な整体/);
  assert.match(comparison, /整体院ひざこぞう/);
  assert.equal((fixedCta.match(/<a /g) ?? []).length, 1, "mobile fixed CTA should be one button");
  assert.match(fixedCta, /LINEで空き状況を確認/);
});

test("LP Step 3 adds conversion copy, review proof, flyer-style price CTA, and toast form handling", () => {
  const hero = getSectionSlice('<main>', '<section id="seo-guide"');
  const price = getSectionSlice('id="price"', 'id="faq"');
  const contact = getSectionSlice('id="contact"', 'id="lightbox"');

  assert.match(hero, /痛みに慣れようとしている[\s\S]*自分に、/);
  assert.match(hero, /気づいていますか。/);
  assert.match(hero, /それは慣れたのではなく、諦めているだけかもしれない。/);
  assert.match(hero, /もう一度、自分の体と向き合う時間をつくりませんか。/);
  assert.doesNotMatch(hero, /また旅行に行けた。孫と公園を歩けた。/);
  assert.match(price, /「先生に出会えて良かった。」<br>「もっと早く来ていれば良かった」と/);
  assert.match(price, /多くの方から感謝の声を頂いています。まずは一度試してください。/);
  assert.match(price, /私があなたの膝痛を全力で改善させます！/);
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
  assert.match(mainJs, /WEEKS_CONFIG/);
  assert.match(mainJs, /残り\$\{config\.remaining\}名様/);
  const forbiddenAutoUpdateLabel = ["毎週月曜日", "に自動更新"].join("");
  assert.ok(!`${html}\n${mainJs}\n${mainCss}`.includes(forbiddenAutoUpdateLabel));
  assert.match(html, /id="toast"/);
  assert.match(contact, /id="successMessage"[^>]*tabindex="-1"/);
  assert.match(contact, /アクセスを確認する/);
  assert.match(mainJs, /function showToast\(/);
  assert.match(mainJs, /showToast\('入力内容をご確認ください。', 'error'\)/);
  assert.match(mainJs, /showToast\('送信が完了しました。24時間以内に折り返しご連絡いたします。'\)/);
  assert.match(mainJs, /showToast\('送信に失敗しました。LINE予約・お電話もご利用ください。', 'error'\)/);
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
    assert.match(src, /^image\/[^"]+\.(?:svg|webp)$/i, "blog card thumbnails should use stable repo images");
    assert.doesNotMatch(src, /^data:/i, "blog card thumbnails should not use inline data URIs");
  }
});

test("LP keeps only one first-visit policy section and removes the duplicate article block", () => {
  const firstVisitHeadingCount = html.match(/初回で行うこと \/ 行わないこと/g)?.length ?? 0;

  assert.equal(firstVisitHeadingCount, 1, "first-visit reassurance should appear only once");
  assert.equal(html.includes('class="initial-visit-guide"'), false, "duplicate first-visit image section should be removed");
  assert.equal(html.includes("来院前に確認されやすいこと"), false, "mid-page article detour should be removed");
});

test("LP first-visit policy uses the PNG icon set accessibly", () => {
  const firstVisit = getSectionSlice('id="first-visit-policy"', 'id="seo-guide"');
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
  const firstVisit = getSectionSlice('id="first-visit-policy"', 'id="seo-guide"');
  const doCard = getSectionSlice('class="card card-do"', 'class="card card-dont"');
  const dontCard = getSectionSlice('class="card card-dont"', 'id="seo-guide"');
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
  const metaDescription = "柏市で膝痛・歩き始めや階段の痛みにお悩みの女性へ。整体院ひざこぞうでは、緩める・鍛える・動作改善の3ステップで、膝に負担が集まりにくい身体づくりをやさしくサポートします。柏駅西口徒歩8分、完全予約制。";

  assert.match(html, /<title>【柏市の膝痛整体】変形性膝関節症・階段の痛みに｜整体院ひざこぞう<\/title>/);
  assert.match(html, new RegExp(`<meta name="description" content="${metaDescription}">`));
  assert.match(html, /【柏市の膝痛整体】変形性膝関節症・階段の痛みに｜整体院ひざこぞう/);
  assert.match(hero, /痛みに慣れようとしている[\s\S]*自分に、/);
  assert.match(hero, /気づいていますか。/);
  assert.match(hero, /それは慣れたのではなく、諦めているだけかもしれない。/);
  assert.match(hero, /もう一度、自分の体と向き合う時間をつくりませんか。/);
  assert.match(hero, /柏市で膝痛にお悩みの方は、/);
  assert.match(hero, /今の状態とこれからの歩みを一緒に整理していきましょう。/);
  assert.match(html, /膝の痛みは、痛む場所だけを見ても分からないことがあります/);
  assert.match(html, /膝だけを揉んで終わるのではなく/);
  assert.match(html, /痛い膝だけを見るのではなく/);
  assert.equal(html.includes('id="three-step-care"'), false, "standalone three-step section should be removed");
  assert.equal(
    html.includes("当院が提供する「3つの柱」の正しい順序"),
    false,
    "duplicate three-pillar ordering block should be removed"
  );
  assert.match(html, /膝に負担が集まる“流れ”を整えます/);
  assert.match(html, /<h3>緩める<\/h3>/);
  assert.match(html, /<h3>目覚めさせる<\/h3>/);
  assert.match(html, /<h3>動きを整える<\/h3>/);
  assert.match(html, /股関節の使い方/);
  assert.match(html, /膝への負担/);
  assert.match(html, /足首の動き/);
  assert.match(html, /こんな毎日を目指します/);
  assert.match(html, /「もう年だから…」とあきらめる前に/);
  assert.doesNotMatch(html, /原因を整理する3ステップ/);
  assert.doesNotMatch(html, /image\/step1_swirl\.webp/);
  assert.doesNotMatch(html, /image\/step2_dumbbell\.webp/);
  assert.doesNotMatch(html, /image\/step3_footprint\.webp/);
});

test("LP keeps knee-type navigation ahead of the price section", () => {
  const typeNavIndex = html.indexOf('id="knee-type-nav"');
  const priceIndex = html.indexOf('id="price"');

  assert.ok(typeNavIndex > -1, "knee-pain type navigation should exist");
  assert.ok(priceIndex > -1, "price section should exist");
  assert.ok(typeNavIndex < priceIndex, "type navigation should appear before the price section");
  assert.match(html, /href="blog\/posts\/knee-pain-stairs-guide\/"/);
  assert.match(html, /href="blog\/posts\/walking-start-knee-pain-cause\/"/);
  assert.match(html, /柏市で変形性膝関節症の整体相談/);
  assert.match(html, /歩き始めに膝が痛い方へ/);
  assert.match(html, /階段の上り下りで膝がつらい方へ/);
  assert.match(html, /膝に水が溜まりやすい方へ/);
  assert.match(html, /膝の内側が痛い方へ/);
  assert.match(html, /href="symptoms\/knee-effusion\.html"/);
  assert.match(html, /href="symptoms\/knee-posterior-pain\.html"/);
});

test("LP symptom finder cards show compact arrow affordances", () => {
  const finderSection = getSectionSlice('id="knee-type-nav"', 'id="price"');
  const linkCardCount = (finderSection.match(/class="symptom-link-card"/g) ?? []).length;
  const rowLinkCount = (finderSection.match(/class="symptom-row-link"/g) ?? []).length;

  assert.equal(linkCardCount, 10, "symptom finder should keep the same compact card set");
  assert.equal(rowLinkCount, 11, "symptom finder should keep the same row card set");
  assert.equal((finderSection.match(/class="symptom-link-card__arrow"/g) ?? []).length, linkCardCount);
  assert.equal((finderSection.match(/class="symptom-row-link__arrow"/g) ?? []).length, rowLinkCount);
  assert.doesNotMatch(finderSection, /詳しく見る|症状ページを見る/);
  assert.doesNotMatch(finderSection, /data-lucide="chevron-right"/);

  assert.match(mainCss, /\.symptom-link-card\s*\{[^}]*position:\s*relative[^}]*padding:\s*12px 36px 12px 12px/s);
  assert.match(mainCss, /\.symptom-link-card__arrow\s*\{[^}]*position:\s*absolute[^}]*right:\s*9px[^}]*top:\s*50%/s);
  assert.match(mainCss, /\.symptom-link-card__arrow,\s*\.symptom-row-link__arrow\s*\{[^}]*width:\s*22px[^}]*height:\s*22px/s);
});

test("LP removes the duplicate broader symptom directory", () => {
  const betweenTypeNavAndPrice = getSectionSlice('id="knee-type-nav"', 'id="price"');

  assert.doesNotMatch(html, /id="symptoms"/);
  assert.doesNotMatch(betweenTypeNavAndPrice, /膝痛と関係しやすい身体の不調/);
  assert.doesNotMatch(betweenTypeNavAndPrice, /膝痛を中心に、股関節・足首・腰など膝への負担に関係しやすい不調を整理しています。/);
});

test("LP splits CTA roles between mid-page consultation and final reservation", () => {
  const priceSection = getSectionSlice('id="price"', 'id="faq"');
  const accessSection = getSectionSlice('id="access"', "<footer");

  assert.match(priceSection, /お電話でのご予約はこちら/);
  assert.match(priceSection, /LINEで相談・予約する/);
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
