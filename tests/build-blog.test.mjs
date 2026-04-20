import test from "node:test";
import assert from "node:assert/strict";

import { buildIndexContent, buildPostContent, normalizeSymptomPageDesign, renderBody } from "../scripts/build-blog.mjs";

const site = {
  blogTitle: "膝痛や慢性痛の読みもの",
  blogDescription: "来院前に確認しやすい記事をまとめています。",
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
    eyecatch: "/image/knee-symptom.jpg",
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

test("blog index puts recommended conversion posts before recent posts", () => {
  const html = buildIndexContent(site, posts, categories);

  assert.match(html, /まず読む3本/);
  assert.match(html, /category-section--recommended/);

  const recommendedIndex = html.indexOf("まず読む3本");
  const recentIndex = html.indexOf("新着記事");
  assert.ok(recommendedIndex > -1, "recommended heading should exist");
  assert.ok(recentIndex > -1, "recent heading should exist");
  assert.ok(recommendedIndex < recentIndex, "recommended posts should appear before recent posts");
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
  });

  assert.match(output, /class="related-symptoms"/);
  assert.match(output, /class="symptom-footer"/);
  assert.doesNotMatch(output, /onmouseover/);
  assert.doesNotMatch(output, /style="display:flex;"/);
});

test("buildPostContent adds article takeaways and a middle consultation CTA", () => {
  const post = {
    title: "膝の痛みで来院前に知りたいこと",
    description: "膝の痛みを来院前に整理します。",
    lead: "膝の痛みで不安な方へ。",
    slug: "knee-guide",
    eyecatch: "/image/knee-symptom.jpg",
    tags: ["膝痛"],
    category: categories.get("knee-pain"),
    sections: [
      { heading: "膝の痛みで考えられる原因", body: ["膝だけでなく歩き方も確認します。"] },
      { heading: "自宅で気をつけたいこと", body: ["無理をしないことが大切です。"] },
      { heading: "整体院ひざこぞうで確認すること", body: ["体全体を見ます。"] }
    ],
    faq: [],
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
  assert.match(html, /この記事でわかること/);
  assert.match(html, /article-mid-cta/);
  assert.match(html, /読んでいて自分も近いと感じたら/);
  assert.match(html, /symptom-card--article/);
});
