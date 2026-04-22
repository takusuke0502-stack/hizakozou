import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const repoRoot = fileURLToPath(new URL("..", import.meta.url));

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
  assert.match(html, /柏市で、歩くたびにつらい膝痛に。/);
  assert.match(html, /膝だけでなく、歩き方・股関節・腰まで確認します。/);
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
  assert.match(html, /href="symptoms\/knee-effusion\.html"/);
  assert.match(html, /href="symptoms\/knee-posterior-pain\.html"/);
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
