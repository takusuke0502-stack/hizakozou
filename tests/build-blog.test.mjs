import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  buildIndexContent,
  buildPostContent,
  normalizeSymptomPageDesign,
  renderBody,
  replaceDirectoryAtomically
} from "../scripts/build-blog.mjs";

const site = {
  name: "整体院ひざこぞう",
  subtitle: "柏市の足腰専門整体院",
  phone: "04-7197-5870",
  blogTitle: "足腰・慢性痛の読みもの",
  blogDescription: "腰痛、坐骨神経痛、股関節痛、膝の痛みなど、足腰の不調でお悩みの方へ。来院前に知っておきたい身体の見方やセルフケアの考え方を、整体院ひざこぞうがわかりやすく整理します。",
  cta: {
    href: "https://lin.ee/X01F2mP",
    label: "LINEで相談する",
    subtext: "気になることは来院前に相談できます。"
  }
};

const categories = new Map([
  ["knee-pain", { slug: "knee-pain", name: "膝痛", description: "膝の痛みで相談の多いテーマです。" }],
  ["exercise-therapy", { slug: "exercise-therapy", name: "運動療法", description: "無理のない動きづくりを扱います。" }]
]);

const posts = [
  {
    slug: "shoulder-stiffness-posture-breathing",
    title: "肩こりが続く原因は姿勢だけ？",
    description: "肩こりと呼吸を整理します。",
    date: "2026-04-18",
    eyecatch: "/image/medical-interview.webp",
    category: categories.get("exercise-therapy")
  },
  {
    slug: "knee-pain-not-healing-honest-answer",
    title: "膝は治らないと思っていませんか？",
    description: "膝の痛みをあきらめる前に確認したいこと。",
    date: "2026-04-03",
    eyecatch: "/image/knee-symptom.webp",
    category: categories.get("knee-pain")
  },
  {
    slug: "knee-effusion-water-in-knee",
    title: "膝に水が溜まる原因と対処法",
    description: "膝の水と炎症を整理します。",
    date: "2026-04-12",
    eyecatch: "/image/knee-symptom-close.webp",
    category: categories.get("knee-pain")
  },
  {
    slug: "seven-checkpoints-for-knee-pain-improvement",
    title: "施術で必ず確認する7つのポイント",
    description: "膝だけでなく歩き方や股関節まで確認します。",
    date: "2026-04-03",
    eyecatch: "/image/medical-interview.webp",
    category: categories.get("knee-pain")
  }
];

test("blog index starts with compact search filters and article lists", () => {
  const html = buildIndexContent(site, posts, categories);

  assert.match(html, /column-search-panel/);
  assert.match(html, /placeholder="キーワードを入力"/);
  assert.match(html, /column-filter/);
  assert.match(html, /ストレッチ/);
  assert.match(html, /症状や部位から探す/);
  assert.match(html, /blog-card-grid/);
  assert.match(html, /article-list-item--card/);
  assert.match(html, /blog-index-sequence/);
  assert.match(html, /article-list-item__date/);
  assert.doesNotMatch(html, /hero-block/);
  assert.doesNotMatch(html, /hero-actions/);
  assert.doesNotMatch(html, /膝痛専門 お役立ち情報一覧/);
  assert.doesNotMatch(html, /まず読む3本/);
  assert.doesNotMatch(html, /category-section--recommended/);

  const recentIndex = html.indexOf("新着記事");
  const searchIndex = html.indexOf("column-search-panel");
  const categoryIndex = html.indexOf("category-sections");
  assert.ok(searchIndex > -1, "search panel should exist");
  assert.ok(recentIndex > -1, "recent heading should exist");
  assert.ok(searchIndex < recentIndex, "search panel should appear before article lists");
  assert.ok(recentIndex < categoryIndex, "recent posts should appear before category sections");
});

test("blog index uses the same taskbar links as the LP", () => {
  const html = readFileSync(new URL("../blog/index.html", import.meta.url), "utf8");

  assert.match(html, /<title>足腰・慢性痛の読みもの｜整体院ひざこぞう<\/title>/);
  assert.match(html, /<meta property="og:title" content="足腰・慢性痛の読みもの｜整体院ひざこぞう">/);
  assert.match(html, /<meta name="twitter:title" content="足腰・慢性痛の読みもの｜整体院ひざこぞう">/);
  assert.match(html, /<header id="header" class="site-header">/);
  assert.match(html, /<nav class="site-nav" aria-label="メインナビゲーション">/);
  assert.match(html, /<button id="menuBtn" class="site-menu-toggle"/);
  assert.match(html, /<nav class="site-mobile-nav hidden" id="mobileNav"/);
  assert.match(html, /href="\/#top"[\s\S]*ホーム/);
  assert.match(html, /href="\.\/"[\s\S]*コラム/);
  assert.match(html, /href="\/access\.html"[\s\S]*アクセス・予約/);
  assert.doesNotMatch(html, /膝の痛み・慢性痛の読みもの/);
  assert.doesNotMatch(html, /膝痛専門 お役立ち情報一覧/);
  assert.doesNotMatch(html, /膝痛専門 お役立ち情報/);
  assert.doesNotMatch(html, /まず読む3本/);
  assert.match(html, /column-search-panel/);
});

test("blog index meta description reflects foot-waist pain and numbness intent", () => {
  const html = readFileSync(new URL("../blog/index.html", import.meta.url), "utf8");

  assert.match(html, /<meta name="description" content="腰痛、坐骨神経痛、股関節痛、膝の痛みなど、足腰の不調でお悩みの方へ。来院前に知っておきたい身体の見方やセルフケアの考え方を、整体院ひざこぞうがわかりやすく整理します。">/);
  assert.match(html, /<p class="footer-title">柏市の足腰専門整体院 整体院ひざこぞう<\/p>/);
  assert.match(html, /<p class="footer-text">千葉県柏市｜腰痛・坐骨神経痛・股関節痛・膝痛など足腰の慢性痛相談<\/p>/);
  assert.doesNotMatch(html, /首・肩・手|肩こり、五十肩、首の痛み/);
  assert.doesNotMatch(html, /柏市で膝の痛みや慢性痛のご相談を承る整体院です。/);
});

test("sciatica root-cause column is published and linked from the blog index", () => {
  const source = readFileSync(new URL("../content/source/2026-06-sciatica-root-cause.md", import.meta.url), "utf8");
  const indexHtml = readFileSync(new URL("../blog/index.html", import.meta.url), "utf8");
  const postHtml = readFileSync(new URL("../blog/posts/sciatica-root-cause/index.html", import.meta.url), "utf8");
  const blogData = JSON.parse(readFileSync(new URL("../data/blog-posts.json", import.meta.url), "utf8"));
  const sitemap = readFileSync(new URL("../sitemap.xml", import.meta.url), "utf8");

  assert.match(source, /^slug: sciatica-root-cause$/m);
  assert.doesNotMatch(source, /\*\*/);
  assert.doesNotMatch(source, /必ず改善|完全に解放|100%戻る|一生根本改善することはない/);

  assert.match(indexHtml, /href="posts\/sciatica-root-cause\/"/);
  assert.match(postHtml, /<h1>【健康コラム】お尻から太ももの裏がビリビリ…湿布を貼っても変わらない坐骨神経痛の根本原因と足腰専門整体が明かす真実<\/h1>/);
  assert.match(postHtml, /お尻から太ももの裏のビリビリした痛みやしびれでお悩みの方へ。柏市あけぼのの整体院ひざこぞうが/);
  assert.match(postHtml, /典型的な症状チェックリスト/);
  assert.match(postHtml, /店舗情報・アクセス/);
  assert.match(postHtml, /LINEで相談する/);
  assert.doesNotMatch(postHtml, /\*\*/);
  assert.doesNotMatch(postHtml, /必ず改善|完全に解放|100%戻る|一生根本改善することはない/);

  assert.ok(blogData.posts.some((post) => post.slug === "sciatica-root-cause"));
  assert.match(sitemap, /https:\/\/hizakozou\.jp\/blog\/posts\/sciatica-root-cause\//);
});

test("renderBody keeps mixed bullet groups scannable as lists", () => {
  const html = renderBody({
    body: [
      "まず痛みの出方を確認します。",
      "- 階段で痛む",
      "- 歩き始めに痛む",
      "強い腫れがある場合は無理をしません。"
    ]
  });

  assert.equal(
    html,
    "<p>まず痛みの出方を確認します。</p><ul class=\"check-list\"><li>階段で痛む</li><li>歩き始めに痛む</li></ul><p>強い腫れがある場合は無理をしません。</p>"
  );
});

test("renderBody converts safe markdown links into article links", () => {
  const html = renderBody({
    body: [
      "詳しくは[変形性膝関節症の相談ページ](/symptoms/knee-osteoarthritis.html)も参考にしてください。"
    ]
  });

  assert.equal(
    html,
    '<p>詳しくは<a href="/symptoms/knee-osteoarthritis.html">変形性膝関節症の相談ページ</a>も参考にしてください。</p>'
  );
});

test("buildPostContent converts markdown links in article lead", () => {
  const html = buildPostContent(site, {
    title: "階段で膝が痛い原因は？",
    description: "階段の膝痛を整理します。",
    lead: "詳しくは[柏駅周辺で膝痛に悩む方への記事](/blog/posts/kashiwa-station-knee-pain-guide/)も参考にしてください。",
    slug: "knee-pain-stairs-guide",
    eyecatch: "/image/knee-symptom.webp",
    date: "2026-03-31",
    updatedDate: "2026-04-20",
    category: categories.get("knee-pain"),
    tags: ["膝痛"],
    sections: [],
    faq: [],
    relatedSymptoms: [],
    cta: {
      href: "https://lin.ee/X01F2mP",
      label: "LINEで相談する",
      note: "来院前に相談できます。"
    }
  }, []);

  assert.match(
    html,
    /<p class="article-lead">詳しくは<a href="\/blog\/posts\/kashiwa-station-knee-pain-guide\/">柏駅周辺で膝痛に悩む方への記事<\/a>も参考にしてください。<\/p>/
  );
  assert.doesNotMatch(html, /\[柏駅周辺で膝痛に悩む方への記事\]\(/);
});

test("blog article body links have visible link styling", () => {
  const css = readFileSync(new URL("../blog/assets/blog.css", import.meta.url), "utf8");

  assert.match(css, /\.article-section p a,/);
  assert.match(css, /\.article-section li a/);
  assert.match(css, /color: #2563eb;/);
  assert.match(css, /text-decoration: underline;/);
  assert.match(css, /text-underline-offset: 0\.2em;/);
});

test("normalizeSymptomPageDesign replaces inline symptom navigation and footer chrome", () => {
  const html = `
    <main>
      <section style="padding:3rem 1rem;background:#f8fafc;border-top:1px solid #e2e8f0;">
        <div class="container max-w-4xl">
          <p style="text-align:center;font-size:13px;">RELATED SYMPTOMS</p>
          <a href="knee-osteoarthritis.html" style="display:flex;" onmouseover="this.style.color='#2563eb'">変形性膝関節症</a>
        </div>
      </section>
      <!-- BLOG_RELATED_ARTICLES_START -->
      <section class="related-articles"></section>
      <!-- BLOG_RELATED_ARTICLES_END -->
      <section class="cta"></section>
    </main>
    <footer style="background:#0f172a;color:#cbd5e1;">
      <a href="../symptoms/knee-osteoarthritis.html" style="font-size:13px;" onmouseover="this.style.color='#60a5fa'">変形性膝関節症</a>
    </footer>
  `;

  const output = normalizeSymptomPageDesign(html, {
    name: "整体院ひざこぞう",
    subtitle: "柏市の整体院"
  }, {
    fileName: "shoulder-stiffness.html"
  });

  assert.match(output, /class="related-symptoms"/);
  assert.match(output, /<span class="related-symptom-card__arrow" aria-hidden="true">›<\/span>/);
  assert.match(output, /class="hk-footer-section"/);
  assert.match(output, /柏市の足腰専門整体院 整体院ひざこぞう/);
  assert.match(output, /千葉県柏市｜腰痛・坐骨神経痛・股関節痛・膝痛など足腰の慢性痛相談/);
  assert.doesNotMatch(output, /class="symptom-footer"/);
  assert.doesNotMatch(output, /膝痛専門整体院 ひざこぞう/);
  assert.doesNotMatch(output, /onmouseover/);
  assert.doesNotMatch(output, /style="display:flex;"/);
});

test("symptom related navigation is specific to the current body area", () => {
  const html = `
    <main>
      <!-- RELATED_SYMPTOMS_NAV_START -->
      <section class="related-symptoms"></section>
      <!-- RELATED_SYMPTOMS_NAV_END -->
      <!-- BLOG_RELATED_ARTICLES_START -->
      <section class="related-articles"></section>
      <!-- BLOG_RELATED_ARTICLES_END -->
    </main>
    <footer></footer>
  `;

  const shoulderOutput = normalizeSymptomPageDesign(html, site, {
    fileName: "shoulder-stiffness.html"
  });
  assert.match(shoulderOutput, /href="frozen-shoulder\.html"/);
  assert.match(shoulderOutput, /href="cervical-spondylosis\.html"/);
  assert.match(shoulderOutput, /href="thoracic-outlet\.html"/);
  assert.doesNotMatch(shoulderOutput, /href="shoulder-stiffness\.html"/);
  assert.doesNotMatch(shoulderOutput, /href="knee-osteoarthritis\.html"/);
  assert.match(shoulderOutput, /href="index\.html"[^>]*>[\s\S]*すべての症状を見る/);

  const lowerBackOutput = normalizeSymptomPageDesign(html, site, {
    fileName: "lower-back-pain.html"
  });
  assert.match(lowerBackOutput, /href="sciatica\.html"/);
  assert.match(lowerBackOutput, /href="spinal-stenosis\.html"/);
  assert.match(lowerBackOutput, /href="lumbar-disc-herniation\.html"/);
  assert.doesNotMatch(lowerBackOutput, /href="lower-back-pain\.html"/);
  assert.doesNotMatch(lowerBackOutput, /href="shoulder-stiffness\.html"/);
});

test("symptom related navigation stays compact on every configured page", () => {
  const html = `
    <main>
      <!-- RELATED_SYMPTOMS_NAV_START -->
      <section class="related-symptoms"></section>
      <!-- RELATED_SYMPTOMS_NAV_END -->
    </main>
    <footer></footer>
  `;
  const files = [
    "lower-back-pain.html",
    "sciatica.html",
    "spinal-stenosis.html",
    "lumbar-disc-herniation.html",
    "hip-osteoarthritis.html",
    "knee-osteoarthritis.html",
    "knee-effusion.html",
    "pes-anserine-bursitis.html",
    "knee-lateral-pain.html",
    "knee-posterior-pain.html",
    "knee-front-pain.html",
    "meniscus-knee-pain.html",
    "bowlegs-knee-pain.html",
    "knee-hyperextension.html",
    "ankle-stiffness-knee-pain.html",
    "plantar-fasciitis.html",
    "shoulder-stiffness.html",
    "frozen-shoulder.html",
    "cervical-spondylosis.html",
    "thoracic-outlet.html",
    "carpal-tunnel.html",
    "elbow-tendinopathy.html",
    "scoliosis.html",
    "tmj.html"
  ];

  for (const fileName of files) {
    const output = normalizeSymptomPageDesign(html, site, { fileName });
    const relatedSection = output.match(/<section class="related-symptoms">[\s\S]*?<\/section>/)?.[0] ?? "";
    const cardCount = (relatedSection.match(/class="related-symptom-card"/g) ?? []).length;

    assert.ok(cardCount >= 3 && cardCount <= 4, `${fileName} should show 3-4 related pages`);
    assert.doesNotMatch(relatedSection, new RegExp(`href="${fileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
    assert.match(relatedSection, /class="related-symptoms__all-link" href="index\.html"/);
  }
});

test("buildPostContent adds article takeaways and a middle consultation CTA", () => {
  const post = {
    title: "膝の痛みで来院前に知りたいこと",
    description: "膝の痛みを来院前に整理します。",
    lead: "膝の痛みで不安な方へ。",
    slug: "knee-guide",
    eyecatch: "/image/knee-symptom.webp",
    tags: ["膝痛"],
    category: categories.get("knee-pain"),
    sections: [
      { heading: "膝の痛みで考えられる原因", body: ["膝だけでなく歩き方も確認します。"] },
      { heading: "自宅で気をつけたいこと", body: ["無理をしないことが大切です。"] },
      { heading: "整体院ひざこぞうで確認すること", body: ["体全体を見ます。"] }
    ],
    faq: [
      {
        question: "階段を使っても大丈夫ですか？",
        answer: "痛みが強くならない範囲で様子を見ながら判断します。"
      }
    ],
    relatedSymptoms: [
      { label: "変形性膝関節症", href: "/symptoms/knee-osteoarthritis.html", description: "階段で膝が痛い方へ。" }
    ],
    cta: {
      href: "https://lin.ee/X01F2mP",
      label: "LINEで相談する",
      note: "来院前に相談できます。"
    }
  };

  const html = buildPostContent({ ...site, name: "整体院ひざこぞう", subtitle: "柏市の整体院", phone: "04-7114-3274" }, post, []);

  assert.match(html, /article-takeaways/);
  assert.match(html, /article-toc--inline/);
  assert.match(html, /article-toc--side/);
  assert.match(html, /href="#section-1"/);
  assert.match(html, /id="section-1"/);
  assert.match(html, /この記事でわかること/);
  assert.match(html, /article-mid-cta/);
  assert.match(html, /読んでいて自分も近いと感じたら/);
  assert.match(html, /symptom-card--article/);
  assert.match(html, /article-meta__date/);
  assert.match(html, /faq-item__question/);
  assert.match(html, /faq-item__answer/);
  assert.match(html, /faq-section__intro/);
  assert.doesNotMatch(html, /clinic-director-new\.webp/);
  assert.doesNotMatch(html, /<details class="faq-item">/);
  assert.doesNotMatch(html, /<summary>/);
});

test("generated blog articles emit breadcrumb structured data", () => {
  const html = readFileSync(new URL("../blog/posts/walking-start-knee-pain-cause/index.html", import.meta.url), "utf8");
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
  const breadcrumb = schemas.find((schema) => schema["@type"] === "BreadcrumbList");

  assert.ok(breadcrumb, "blog articles should emit BreadcrumbList schema");
  assert.deepEqual(
    breadcrumb.itemListElement.map((item) => item.name),
    ["整体院ひざこぞう", "ブログ", "柏市で歩き始めに膝が痛い方へ｜立ち上がりでつらい膝痛の見方"]
  );
  assert.equal(breadcrumb.itemListElement[2].item, "https://hizakozou.jp/blog/posts/walking-start-knee-pain-cause/");
});

test("buildPostContent applies shared box-type rules to sections and subsections", () => {
  const post = {
    title: "記事の分類ルール確認",
    description: "box type 判定の回帰確認です。",
    date: "2026-04-21",
    lead: "見出しごとの装飾判定を確認します。",
    slug: "box-type-check",
    eyecatch: "/image/knee-symptom.webp",
    tags: ["膝痛"],
    category: categories.get("knee-pain"),
    sections: [
      { heading: "戻らない体をつくる3ステップ", body: ["手順を整理します。"] },
      { heading: "医療機関への受診を検討していただきたい目安", body: ["先に確認したい項目です。"] },
      {
        heading: "整体院ひざこぞうでの確認のポイント",
        body: ["全身のつながりを見ます。"],
        subsections: [
          { heading: "注意して見ておきたいこと", body: ["無理をしないことが大切です。"] }
        ]
      },
      { heading: "まとめ", body: ["最後に要点を整理します。"] }
    ],
    faq: [],
    relatedSymptoms: [],
    cta: {
      href: "https://lin.ee/X01F2mP",
      label: "LINEで相談する",
      note: "来院前に相談できます。"
    }
  };

  const html = buildPostContent({ ...site, name: "整体院ひざこぞう", subtitle: "柏市の整体院", phone: "04-7114-3274" }, post, []);

  assert.match(html, /article-section point-box/);
  assert.match(html, /article-section caution-box/);
  assert.match(html, /article-subsection caution-box/);
  assert.match(html, /article-section note-box/);
});

test("blog CSS suppresses native TOC markers for custom numbers", () => {
  const css = readFileSync(new URL("../blog/assets/blog.css", import.meta.url), "utf8");

  assert.match(css, /\.article-toc li\s*{[^}]*display:\s*block;[^}]*list-style:\s*none;/s);
});

test("blog CSS places the desktop side rail on the left and resets on mobile", () => {
  const css = readFileSync(new URL("../blog/assets/blog.css", import.meta.url), "utf8");

  assert.match(css, /\.article-layout\s*{[^}]*grid-template-columns:\s*300px minmax\(0,\s*760px\);/s);
  assert.match(css, /\.article-content\s*{[^}]*grid-column:\s*2;[^}]*min-width:\s*0;/s);
  assert.match(css, /\.article-side\s*{[^}]*grid-column:\s*1;[^}]*grid-row:\s*1;/s);
  assert.match(css, /@media \(max-width:\s*1024px\)\s*{[\s\S]*?\.article-content,\s*\.article-side\s*{[^}]*grid-column:\s*auto;[^}]*grid-row:\s*auto;/s);
});

test("blog CSS styles FAQ as a static Q and A block", () => {
  const css = readFileSync(new URL("../blog/assets/blog.css", import.meta.url), "utf8");

  assert.match(css, /\.faq-section__intro\s*{[^}]*display:\s*grid;[^}]*gap:\s*8px;/s);
  assert.match(css, /\.faq-list\s*{[^}]*border-radius:\s*8px;[^}]*background:\s*#fff;/s);
  assert.match(css, /\.faq-item\s*\+\s*\.faq-item\s*{[^}]*border-top:\s*1px dashed/s);
  assert.match(css, /\.faq-item__question\s+\.faq-item__label\s*{[^}]*#f2c94c/s);
  assert.match(css, /\.faq-item__answer\s+\.faq-item__label\s*{[^}]*#8f79b9/s);
  assert.doesNotMatch(css, /\.faq-section__visual/);
  assert.doesNotMatch(css, /\.faq-item summary/);
});

test("replaceDirectoryAtomically keeps the current directory when new output generation fails", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "hizakozou-build-blog-"));
  const targetDir = path.join(tempRoot, "posts");
  const targetFile = path.join(targetDir, "existing", "index.html");

  try {
    await fs.mkdir(path.dirname(targetFile), { recursive: true });
    await fs.writeFile(targetFile, "existing output", "utf8");

    await assert.rejects(
      replaceDirectoryAtomically(targetDir, async (stagingDir) => {
        const nextFile = path.join(stagingDir, "new-post", "index.html");
        await fs.mkdir(path.dirname(nextFile), { recursive: true });
        await fs.writeFile(nextFile, "new output", "utf8");
        throw new Error("simulated generation failure");
      }),
      /simulated generation failure/
    );

    assert.equal(await fs.readFile(targetFile, "utf8"), "existing output");
    await assert.rejects(fs.access(path.join(targetDir, "new-post", "index.html")));
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
});

test("checked-in generated blog posts stay in sync with box-type rules", () => {
  const kneeEffusionHtml = readFileSync(new URL("../blog/posts/knee-effusion-water-in-knee/index.html", import.meta.url), "utf8");
  const hipWhileWalkingHtml = readFileSync(new URL("../blog/posts/hip-pain-while-walking/index.html", import.meta.url), "utf8");

  assert.match(kneeEffusionHtml, /article-section point-box/);
  assert.match(kneeEffusionHtml, /article-section caution-box/);
  assert.match(kneeEffusionHtml, /article-section note-box/);
  assert.match(hipWhileWalkingHtml, /article-section point-box/);
  assert.match(hipWhileWalkingHtml, /article-section note-box/);
});

test("generated blog pages use canonical root links instead of index.html", () => {
  const blogIndexHtml = readFileSync(new URL("../blog/index.html", import.meta.url), "utf8");
  const dailyCareHtml = readFileSync(new URL("../blog/posts/knee-pain-daily-care/index.html", import.meta.url), "utf8");

  for (const [pageName, pageHtml] of [
    ["blog/index.html", blogIndexHtml],
    ["blog/posts/knee-pain-daily-care/index.html", dailyCareHtml]
  ]) {
    assert.doesNotMatch(pageHtml, /(?:\.\.\/)+index\.html/, `${pageName} should not link to index.html`);
    assert.doesNotMatch(pageHtml, /\/index\.html/, `${pageName} should not link to /index.html`);
  }

  assert.match(blogIndexHtml, /href="\/#access"/);
  assert.match(blogIndexHtml, /href="\/#knee-type-nav"/);
  assert.match(dailyCareHtml, /<a href="\/">トップ<\/a>/);
  assert.match(dailyCareHtml, /href="\/#knee-type-nav"/);
});

test("knee-pain-daily-care article is indexable and aligned with squatting and seiza intent", () => {
  const html = readFileSync(new URL("../blog/posts/knee-pain-daily-care/index.html", import.meta.url), "utf8");

  assert.match(html, /<meta name="robots" content="index,follow">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/hizakozou\.jp\/blog\/posts\/knee-pain-daily-care\/">/);
  assert.match(html, /<title>[^<]*しゃがむ・正座で膝が痛い[^<]*<\/title>/);
  assert.match(html, /<h1>[^<]*しゃがむ・正座で膝が痛い[^<]*<\/h1>/);

  const expectedSections = [
    "しゃがむと膝が痛いときに多いパターン",
    "正座で膝が痛いときに確認したいこと",
    "立ち上がりで膝に負担が集まりやすい理由",
    "整体院ひざこぞうで確認しているポイント",
    "医療機関を優先した方がよいサイン",
    "柏市でしゃがむ・正座の膝痛に悩む方への相談導線"
  ];

  for (const section of expectedSections) {
    assert.equal(html.includes(section), true, `article should include section: ${section}`);
  }
});

test("sitemap lists only canonical indexable URLs", () => {
  const sitemap = readFileSync(new URL("../sitemap.xml", import.meta.url), "utf8");
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

  assert.ok(locs.includes("https://hizakozou.jp/"));
  assert.ok(locs.includes("https://hizakozou.jp/blog/"));
  assert.ok(locs.includes("https://hizakozou.jp/blog/posts/knee-pain-daily-care/"));
  assert.ok(locs.includes("https://hizakozou.jp/symptoms/lower-back-pain.html"));
  assert.ok(locs.includes("https://hizakozou.jp/symptoms/sciatica.html"));
  assert.equal(locs.includes("https://hizakozou.jp/symptoms/shoulder-stiffness.html"), false);
  assert.equal(locs.includes("https://hizakozou.jp/symptoms/frozen-shoulder.html"), false);
  assert.equal(locs.includes("https://hizakozou.jp/symptoms/tmj.html"), false);
  assert.equal(locs.some((loc) => loc.endsWith("/index.html") || loc.endsWith("/blog.html")), false);
  assert.equal(new Set(locs).size, locs.length);
});

test("blog data site anchors use the canonical home URL", () => {
  const data = JSON.parse(readFileSync(new URL("../data/blog-posts.json", import.meta.url), "utf8"));

  assert.equal(data.site.contactAnchor, "/#contact");
});
