import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = process.cwd();
const dataPath = path.join(rootDir, "data", "blog-posts.json");
const sitemapPath = path.join(rootDir, "sitemap.xml");
const templatesDir = path.join(rootDir, "templates");
const blogDir = path.join(rootDir, "blog");
const postsDir = path.join(blogDir, "posts");
const symptomsDir = path.join(rootDir, "symptoms");

const symptomNavigationItems = [
  { href: "knee-osteoarthritis.html", label: "変形性膝関節症", description: "階段や歩き始めの膝痛、膝のこわばりが気になる方へ。" },
  { href: "knee-effusion.html", label: "膝の水（関節水腫）", description: "膝の腫れや水が溜まる不安を整理したい方へ。" },
  { href: "pes-anserine-bursitis.html", label: "膝の内側の痛み", description: "鵞足炎や内側の違和感が続く方へ。" },
  { href: "knee-lateral-pain.html", label: "膝の外側の痛み", description: "腸脛靭帯炎や外側半月板まわりが気になる方へ。" },
  { href: "knee-posterior-pain.html", label: "膝の裏側の痛み", description: "ベーカー嚢腫や膝裏の張りが気になる方へ。" },
  { href: "hip-osteoarthritis.html", label: "股関節の痛み", description: "歩き方や膝への負担と股関節の関係を知りたい方へ。" },
  { href: "lower-back-pain.html", label: "腰痛", description: "膝をかばう姿勢や歩き方と腰痛の関係が気になる方へ。" },
  { href: "sciatica.html", label: "坐骨神経痛", description: "お尻から脚のしびれや痛みが続く方へ。" },
  { href: "spinal-stenosis.html", label: "脊柱管狭窄症", description: "歩くと脚がつらい、休むと楽になる症状がある方へ。" },
  { href: "lumbar-disc-herniation.html", label: "腰椎椎間板ヘルニア", description: "腰からお尻、脚への痛みやしびれが気になる方へ。" },
  { href: "scoliosis.html", label: "側弯症", description: "背骨のカーブや姿勢の左右差、背中や腰の張りが気になる方へ。" },
  { href: "shoulder-stiffness.html", label: "肩こり", description: "首肩の重さや姿勢の崩れが気になる方へ。" },
  { href: "frozen-shoulder.html", label: "五十肩", description: "腕が上がらない、夜に肩が痛む方へ。" },
  { href: "tmj.html", label: "顎関節症", description: "あごの痛みや口の開けづらさ、首肩との関係が気になる方へ。" }
];

const symptomConfigs = {
  "knee-osteoarthritis.html": {
    symptomKey: "knee-osteoarthritis",
    label: "変形性膝関節症",
    keywords: ["変形性膝関節症", "膝痛", "階段", "歩き始め", "膝"],
    categoryHints: ["knee-pain", "exercise-therapy"]
  },
  "knee-effusion.html": {
    symptomKey: "knee-effusion",
    label: "膝に水がたまる",
    keywords: ["膝に水がたまる", "膝の腫れ", "膝痛", "膝"],
    categoryHints: ["knee-pain", "exercise-therapy"]
  },
  "knee-lateral-pain.html": {
    symptomKey: "knee-lateral-pain",
    label: "膝の外側の痛み",
    keywords: ["膝の外側", "膝痛", "歩行", "膝"],
    categoryHints: ["knee-pain", "exercise-therapy"]
  },
  "knee-posterior-pain.html": {
    symptomKey: "knee-posterior-pain",
    label: "膝の裏側の痛み",
    keywords: ["膝の裏側", "膝裏", "ベーカー嚢腫", "ハムストリング", "膝痛", "歩行", "膝"],
    categoryHints: ["knee-pain", "exercise-therapy"]
  },
  "pes-anserine-bursitis.html": {
    symptomKey: "pes-anserine-bursitis",
    label: "膝の内側の痛み",
    keywords: ["膝の内側", "鵞足炎", "膝痛", "膝"],
    categoryHints: ["knee-pain", "exercise-therapy"]
  },
  "lower-back-pain.html": {
    symptomKey: "lower-back-pain",
    label: "腰痛",
    keywords: ["腰痛", "腰", "立ち上がり", "歩行不安"],
    categoryHints: ["lower-back-pain", "exercise-therapy", "knee-pain"]
  },
  "sciatica.html": {
    symptomKey: "sciatica",
    label: "坐骨神経痛",
    keywords: ["坐骨神経痛", "お尻", "脚のしびれ", "しびれ"],
    categoryHints: ["numbness", "lower-back-pain", "exercise-therapy"]
  },
  "spinal-stenosis.html": {
    symptomKey: "spinal-stenosis",
    label: "脊柱管狭窄症",
    keywords: ["脊柱管狭窄症", "椎間板ヘルニア", "間欠性跛行", "腰", "脚のしびれ"],
    categoryHints: ["numbness", "lower-back-pain", "exercise-therapy"]
  },
  "lumbar-disc-herniation.html": {
    symptomKey: "lumbar-disc-herniation",
    label: "腰椎椎間板ヘルニア",
    keywords: ["腰椎椎間板ヘルニア", "椎間板ヘルニア", "腰", "脚のしびれ", "坐骨神経痛"],
    categoryHints: ["numbness", "lower-back-pain", "exercise-therapy"]
  },
  "scoliosis.html": {
    symptomKey: "scoliosis",
    label: "側弯症",
    keywords: ["側弯症", "脊柱側弯症", "背骨", "姿勢", "腰", "背中"],
    categoryHints: ["lower-back-pain", "exercise-therapy", "neck-shoulder-hand"]
  },
  "hip-osteoarthritis.html": {
    symptomKey: "hip-osteoarthritis",
    label: "変形性股関節症",
    keywords: ["変形性股関節症", "股関節", "歩きづらい", "膝をかばう"],
    categoryHints: ["hip-pain", "lower-back-pain", "exercise-therapy", "knee-pain"]
  },
  "shoulder-stiffness.html": {
    symptomKey: "shoulder-stiffness",
    label: "肩こり",
    keywords: ["肩こり", "首こり", "姿勢", "慢性痛"],
    categoryHints: ["neck-shoulder-hand", "exercise-therapy"]
  },
  "frozen-shoulder.html": {
    symptomKey: "frozen-shoulder",
    label: "五十肩",
    keywords: ["五十肩", "肩", "腕が上がらない", "慢性痛"],
    categoryHints: ["neck-shoulder-hand", "exercise-therapy"]
  },
  "cervical-spondylosis.html": {
    symptomKey: "cervical-spondylosis",
    label: "頚椎症",
    keywords: ["頚椎症", "首の痛み", "しびれ", "慢性痛"],
    categoryHints: ["neck-shoulder-hand", "numbness", "exercise-therapy"]
  },
  "thoracic-outlet.html": {
    symptomKey: "thoracic-outlet",
    label: "胸郭出口症候群",
    keywords: ["胸郭出口症候群", "腕のしびれ", "首肩", "慢性痛"],
    categoryHints: ["neck-shoulder-hand", "numbness", "exercise-therapy"]
  },
  "carpal-tunnel.html": {
    symptomKey: "carpal-tunnel",
    label: "手根管症候群",
    keywords: ["手根管症候群", "手のしびれ", "慢性痛"],
    categoryHints: ["neck-shoulder-hand", "numbness", "exercise-therapy"]
  },
  "elbow-tendinopathy.html": {
    symptomKey: "elbow-tendinopathy",
    label: "肘の痛み",
    keywords: ["肘の痛み", "肘", "慢性痛"],
    categoryHints: ["neck-shoulder-hand", "exercise-therapy"]
  },
  "plantar-fasciitis.html": {
    symptomKey: "plantar-fasciitis",
    label: "足底筋膜炎",
    keywords: ["足底筋膜炎", "足裏", "歩行", "慢性痛"],
    categoryHints: ["exercise-therapy", "knee-pain"]
  },
  "tmj.html": {
    symptomKey: "tmj",
    label: "顎関節症",
    keywords: ["顎関節症", "顎", "慢性痛"],
    categoryHints: ["neck-shoulder-hand", "exercise-therapy"]
  }
};

const relatedArticlesStyles = `
/* BLOG_RELATED_ARTICLES_STYLES_START */
.related-articles{padding:3.25rem 1rem;background:#f8fbff;border-top:1px solid #dbeafe}
.related-articles__eyebrow{text-align:center;font-size:13px;font-weight:900;color:#2563eb;letter-spacing:.08em;margin-bottom:.75rem}
.related-articles__title{text-align:center;font-size:1.5rem;font-weight:900;color:#1e3a8a;margin-bottom:.75rem}
.related-articles__lead{text-align:center;font-size:14px;font-weight:700;color:#475569;line-height:1.9;margin:0 auto 2rem;max-width:42rem}
.related-articles__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.related-article-card{display:flex;flex-direction:column;gap:.75rem;background:#fff;border:1px solid #dbeafe;border-radius:8px;padding:1.25rem;text-decoration:none;box-shadow:0 2px 10px rgba(37,99,235,.06);transition:transform .2s,border-color .2s,box-shadow .2s}
.related-article-card:hover,.related-article-card:focus-visible{transform:translateY(-2px);border-color:#93c5fd;box-shadow:0 10px 20px rgba(37,99,235,.12);outline:none}
.related-article-card__meta{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem}
.related-article-card__pill{display:inline-flex;align-items:center;border-radius:9999px;background:#eff6ff;color:#2563eb;font-size:11px;font-weight:900;padding:.25rem .625rem}
.related-article-card__time{font-size:11px;font-weight:700;color:#64748b}
.related-article-card__title{font-size:1rem;font-weight:900;color:#1e3a8a;line-height:1.5}
.related-article-card__desc{font-size:13px;font-weight:700;color:#475569;line-height:1.8}
.related-article-card__link{display:inline-flex;align-items:center;gap:.35rem;font-size:13px;font-weight:900;color:#2563eb}
.related-symptoms{padding:3.25rem 1rem;background:#fff;border-top:1px solid #e2e8f0}
.related-symptoms__eyebrow{text-align:center;font-size:12px;font-weight:900;color:#2563eb;letter-spacing:.1em;margin:0 0 .7rem}
.related-symptoms__title{text-align:center;font-size:1.45rem;font-weight:900;color:#1e3a8a;line-height:1.55;margin:0 0 .75rem}
.related-symptoms__lead{text-align:center;font-size:14px;font-weight:700;color:#475569;line-height:1.9;margin:0 auto 2rem;max-width:42rem}
.related-symptoms__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:.9rem}
.related-symptom-card{display:flex;flex-direction:column;gap:.55rem;min-height:126px;background:#f8fbff;border:1px solid #dbeafe;border-radius:8px;padding:1rem;text-decoration:none;transition:transform .2s,border-color .2s,background .2s,box-shadow .2s}
.related-symptom-card:hover,.related-symptom-card:focus-visible{transform:translateY(-2px);background:#fff;border-color:#93c5fd;box-shadow:0 8px 18px rgba(37,99,235,.1);outline:none}
.related-symptom-card__label{font-size:1rem;font-weight:900;color:#1e3a8a;line-height:1.5}
.related-symptom-card__description{font-size:13px;font-weight:700;color:#475569;line-height:1.75}
.symptom-mid-cta{padding:2.75rem 1rem;background:#fff;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0}
.symptom-mid-cta__inner{display:grid;gap:1.25rem;align-items:center;background:#f8fbff;border:1px solid #bfdbfe;border-radius:8px;padding:1.5rem}
.symptom-mid-cta__eyebrow{font-size:12px;font-weight:900;color:#2563eb;letter-spacing:.08em;margin:0 0 .5rem}
.symptom-mid-cta__title{font-size:1.25rem;font-weight:900;color:#1e3a8a;line-height:1.55;margin:0 0 .5rem}
.symptom-mid-cta__text{font-size:14px;font-weight:700;color:#475569;line-height:1.9;margin:0}
.symptom-mid-cta__actions{display:flex;flex-wrap:wrap;gap:.75rem}
.symptom-mid-cta__btn{display:inline-flex;align-items:center;justify-content:center;gap:.4rem;border-radius:8px;padding:.85rem 1.15rem;font-size:14px;font-weight:900;text-decoration:none;transition:transform .2s,background .2s,border-color .2s}
.symptom-mid-cta__btn--line{background:#06C755;color:#fff}
.symptom-mid-cta__btn--tel{background:#fff;color:#1e3a8a;border:1px solid #bfdbfe}
.symptom-mid-cta__btn:hover,.symptom-mid-cta__btn:focus-visible{transform:translateY(-1px);outline:2px solid #93c5fd;outline-offset:3px}
.symptom-footer{background:#0f172a;color:#cbd5e1;padding:3rem 1rem 2rem;text-align:center}
.symptom-footer__inner{max-width:860px;margin:0 auto}
.symptom-footer__logo{display:inline-block;background:#fff;border-radius:8px;padding:.7rem 1.35rem;margin-bottom:.8rem}
.symptom-footer__logo span{font-size:1.2rem;font-weight:900;color:#1e293b}
.symptom-footer__tagline{font-size:14px;font-weight:700;line-height:1.8;margin:0 0 1.4rem}
.symptom-footer__links{display:flex;flex-wrap:wrap;justify-content:center;gap:.65rem 1rem;list-style:none;margin:0 0 1.4rem;padding:0}
.symptom-footer__links a{font-size:13px;font-weight:700;color:#94a3b8;text-decoration:none;transition:color .2s}
.symptom-footer__links a:hover,.symptom-footer__links a:focus-visible{color:#60a5fa;outline:none;text-decoration:underline;text-underline-offset:4px}
.symptom-footer__note{font-size:10px;color:#64748b;font-weight:700;line-height:2;margin:0}
@media(min-width:768px){.related-articles__title{font-size:1.75rem}}
@media(min-width:768px){.symptom-mid-cta__inner{grid-template-columns:minmax(0,1fr) auto;padding:1.75rem 2rem}.symptom-mid-cta__title{font-size:1.45rem}}
@media(max-width:640px){.symptom-mid-cta__actions{flex-direction:column}.symptom-mid-cta__btn{width:100%}}
/* BLOG_RELATED_ARTICLES_STYLES_END */
`.trim();

const isCliRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isCliRun) {
  await buildBlog();
}

export async function buildBlog() {
  const [rawData, indexTemplate, postTemplate] = await Promise.all([
    fs.readFile(dataPath, "utf8"),
    fs.readFile(path.join(templatesDir, "blog-index-template.html"), "utf8"),
    fs.readFile(path.join(templatesDir, "blog-post-template.html"), "utf8")
  ]);

  const blogData = JSON.parse(rawData);
  validateBlogData(blogData);

  const categoryMap = new Map(blogData.categories.map((category) => [category.slug, category]));
  const posts = [...blogData.posts]
    .map((post) => normalizePost(post, blogData.site, categoryMap))
    .sort((a, b) => b.date.localeCompare(a.date));

  await fs.mkdir(postsDir, { recursive: true });

  await Promise.all((await fs.readdir(postsDir, { withFileTypes: true })).map(async (entry) => {
    if (entry.name === ".gitkeep") return;
    await fs.rm(path.join(postsDir, entry.name), { recursive: true, force: true });
  }));

  const indexHtml = renderTemplate(indexTemplate, {
    SEO_HEAD: buildIndexSeo(blogData.site),
    CSS_PATH: "assets/blog.css",
    HOME_PATH: "../index.html",
    BLOG_PATH: "./",
    CONTACT_PATH: "../index.html#contact",
    SITE_NAME: blogData.site.name,
    SITE_SUBTITLE: blogData.site.subtitle,
    PAGE_CONTENT: buildIndexContent(blogData.site, posts, categoryMap)
  });

  await fs.writeFile(path.join(blogDir, "index.html"), cleanGeneratedText(indexHtml), "utf8");

  for (const post of posts) {
    const postDir = path.join(postsDir, post.slug);
    await fs.mkdir(postDir, { recursive: true });
    const relatedPosts = posts.filter((item) => item.slug !== post.slug && item.category.slug === post.category.slug).slice(0, 2);
    const postHtml = renderTemplate(postTemplate, {
      SEO_HEAD: buildPostSeo(blogData.site, post),
      CSS_PATH: "../../assets/blog.css",
      HOME_PATH: "../../../index.html",
      BLOG_PATH: "../../",
      CONTACT_PATH: "../../../index.html#contact",
      SITE_NAME: blogData.site.name,
      SITE_SUBTITLE: blogData.site.subtitle,
      PAGE_CONTENT: buildPostContent(blogData.site, post, relatedPosts)
    });
    await fs.writeFile(path.join(postDir, "index.html"), cleanGeneratedText(postHtml), "utf8");
  }

  await updateSymptomPages(blogData.site, posts);

  await fs.writeFile(path.join(rootDir, "blog.html"), cleanGeneratedText(buildBlogRedirectHtml()), "utf8");
  await fs.writeFile(path.join(rootDir, "blog-detail.html"), cleanGeneratedText(buildLegacyDetailRedirectHtml()), "utf8");
  await updateSitemap(blogData.site, posts);

  console.log(`Generated ${posts.length} static blog post(s), updated symptom related articles, and regenerated sitemap.xml.`);
}

async function updateSymptomPages(site, posts) {
  const symptomFiles = await fs.readdir(symptomsDir);
  for (const fileName of symptomFiles) {
    if (!fileName.endsWith(".html")) continue;
    const baseConfig = symptomConfigs[fileName];
    const config = baseConfig ? { ...baseConfig, fileName } : null;
    if (!config) continue;

    const fullPath = path.join(symptomsDir, fileName);
    let html = await fs.readFile(fullPath, "utf8");
    html = upsertRelatedStyles(html);
    html = upsertSymptomMidCta(html, site);

    const matchedPosts = selectRelatedPosts(config, posts).slice(0, 4);
    const sectionHtml = matchedPosts.length ? buildRelatedArticlesSection(site, config, matchedPosts) : "";
    html = replaceRelatedSection(html, sectionHtml);
    html = normalizeSymptomPageDesign(html, site, config);

    await fs.writeFile(fullPath, cleanGeneratedText(html), "utf8");
  }
}

async function updateSitemap(site, posts) {
  const siteRoot = trimTrailingSlash(site.url);
  const latestBlogDate = posts.reduce((latest, post) => {
    const candidate = formatSitemapDate(post.updatedDate || post.date);
    return !latest || candidate > latest ? candidate : latest;
  }, null);

  const symptomEntries = await Promise.all(
    (await fs.readdir(symptomsDir))
      .filter((fileName) => fileName.endsWith(".html"))
      .sort((a, b) => a.localeCompare(b, "ja"))
      .map(async (fileName) => ({
        loc: `${siteRoot}/symptoms/${fileName}`,
        lastmod: await getFileLastmod(path.join(symptomsDir, fileName)),
        changefreq: "monthly",
        priority: "0.8"
      }))
  );

  const postEntries = posts.map((post) => ({
    loc: `${siteRoot}${post.url}`,
    lastmod: formatSitemapDate(post.updatedDate || post.date),
    changefreq: "monthly",
    priority: "0.7"
  }));

  const entries = [
    {
      loc: `${siteRoot}/`,
      lastmod: await getFileLastmod(path.join(rootDir, "index.html")),
      changefreq: "weekly",
      priority: "1.0"
    },
    {
      loc: `${siteRoot}/blog/`,
      lastmod: latestBlogDate || await getFileLastmod(path.join(blogDir, "index.html")),
      changefreq: "weekly",
      priority: "0.9"
    },
    ...postEntries,
    ...symptomEntries
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map((entry) => [
      "  <url>",
      `    <loc>${escapeHtml(entry.loc)}</loc>`,
      `    <lastmod>${entry.lastmod}</lastmod>`,
      `    <changefreq>${entry.changefreq}</changefreq>`,
      `    <priority>${entry.priority}</priority>`,
      "  </url>"
    ].join("\n")),
    "</urlset>",
    ""
  ].join("\n");

  await fs.writeFile(sitemapPath, cleanGeneratedText(xml), "utf8");
}

function upsertRelatedStyles(html) {
  if (html.includes("BLOG_RELATED_ARTICLES_STYLES_START")) {
    return html.replace(/\/\* BLOG_RELATED_ARTICLES_STYLES_START \*\/[\s\S]*?\/\* BLOG_RELATED_ARTICLES_STYLES_END \*\//, relatedArticlesStyles);
  }
  return html.replace("</style>", `\n    ${relatedArticlesStyles}\n  </style>`);
}

function replaceRelatedSection(html, sectionHtml) {
  const startMarker = "<!-- BLOG_RELATED_ARTICLES_START -->";
  const endMarker = "<!-- BLOG_RELATED_ARTICLES_END -->";
  const wrapped = sectionHtml ? `${startMarker}\n${sectionHtml}\n${endMarker}\n\n` : "";

  if (html.includes(startMarker) && html.includes(endMarker)) {
    return html.replace(new RegExp(`${escapeRegExp(startMarker)}[\\s\\S]*?${escapeRegExp(endMarker)}\\n*`, "m"), wrapped);
  }

  if (!sectionHtml) {
    return html;
  }

  return html.replace(/<section class="cta">/, `${wrapped}<section class="cta">`);
}

function upsertSymptomMidCta(html, site) {
  const startMarker = "<!-- SYMPTOM_MID_CTA_START -->";
  const endMarker = "<!-- SYMPTOM_MID_CTA_END -->";
  const ctaHtml = `${startMarker}
${buildSymptomMidCta(site)}
${endMarker}

`;

  if (html.includes(startMarker)) {
    return html.replace(new RegExp(`${escapeRegExp(startMarker)}[\\s\\S]*?${escapeRegExp(endMarker)}\\s*`), ctaHtml);
  }

  const approachMarker = "<section class=\"approach\">";
  if (html.includes(approachMarker)) {
    return html.replace(approachMarker, `${ctaHtml}${approachMarker}`);
  }

  return html;
}

function buildSymptomMidCta(site) {
  const lineUrl = site.lineUrl || site.cta?.href || "https://lin.ee/X01F2mP";
  const telHref = `tel:${String(site.phone || "0471143274").replace(/-/g, "")}`;
  return `<section class="symptom-mid-cta">
      <div class="container max-w-4xl symptom-mid-cta__inner">
        <div>
          <p class="symptom-mid-cta__eyebrow">相談の目安</p>
          <h2 class="symptom-mid-cta__title">原因を知るだけでなく、今の状態に合う進め方を確認しませんか？</h2>
          <p class="symptom-mid-cta__text">痛み方や生活で困っている場面は人によって違います。読みながら「自分も近いかも」と感じた方は、来院前にLINEで状況を送っていただいて大丈夫です。</p>
        </div>
        <div class="symptom-mid-cta__actions">
          <a class="symptom-mid-cta__btn symptom-mid-cta__btn--line" href="${escapeHtml(lineUrl)}" target="_blank" rel="noopener noreferrer">LINEで相談する</a>
          <a class="symptom-mid-cta__btn symptom-mid-cta__btn--tel" href="${escapeHtml(telHref)}">電話で相談する</a>
        </div>
      </div>
    </section>`;
}

export function normalizeSymptomPageDesign(html, site = {}, config = {}) {
  let output = upsertRelatedSymptomsNavigation(html, config);
  output = replaceSymptomFooter(output, site);
  return output;
}

function upsertRelatedSymptomsNavigation(html, config = {}) {
  const startMarker = "<!-- RELATED_SYMPTOMS_NAV_START -->";
  const endMarker = "<!-- RELATED_SYMPTOMS_NAV_END -->";
  const sectionHtml = `${startMarker}
${buildRelatedSymptomsNavigation(config)}
${endMarker}

`;

  if (html.includes(startMarker)) {
    return html.replace(new RegExp(`${escapeRegExp(startMarker)}[\\s\\S]*?${escapeRegExp(endMarker)}\\s*`), sectionHtml);
  }

  const oldInlinePattern = /<section style="padding:3rem 1rem;background:#f8fafc;border-top:1px solid #e2e8f0;">[\s\S]*?<\/section>\s*(?=<!-- BLOG_RELATED_ARTICLES_START -->)/;
  if (oldInlinePattern.test(html)) {
    return html.replace(oldInlinePattern, sectionHtml);
  }

  if (html.includes("<!-- BLOG_RELATED_ARTICLES_START -->")) {
    return html.replace("<!-- BLOG_RELATED_ARTICLES_START -->", `${sectionHtml}<!-- BLOG_RELATED_ARTICLES_START -->`);
  }

  return html;
}

function buildRelatedSymptomsNavigation(config = {}) {
  const currentFileName = config.fileName || config.page || "";
  const cards = symptomNavigationItems
    .filter((item) => item.href !== currentFileName)
    .slice(0, 6)
    .map((item) => `
          <a class="related-symptom-card" href="${escapeHtml(item.href)}">
            <span class="related-symptom-card__label">${escapeHtml(item.label)}</span>
            <span class="related-symptom-card__description">${escapeHtml(item.description)}</span>
          </a>`)
    .join("");

  return `<section class="related-symptoms">
      <div class="container max-w-4xl">
        <p class="related-symptoms__eyebrow">RELATED SYMPTOMS</p>
        <h2 class="related-symptoms__title">ほかの症状も確認できます</h2>
        <p class="related-symptoms__lead">痛みをかばう姿勢が続くと、別の部位にも負担がかかりやすくなります。気になる症状があれば、あわせて確認してみてください。</p>
        <div class="related-symptoms__grid">
${cards}
        </div>
      </div>
    </section>`;
}

function replaceSymptomFooter(html, site = {}) {
  const footerPattern = /<footer[\s\S]*?<\/footer>/;
  if (!footerPattern.test(html)) {
    return html;
  }
  return html.replace(footerPattern, buildSymptomFooter(site));
}

function buildSymptomFooter(site = {}) {
  const siteName = site.name || "整体院ひざこぞう";
  const siteSubtitle = site.subtitle || "柏市の整体院";
  const links = symptomNavigationItems.map((item) => `
          <li><a href="../symptoms/${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`).join("");

  return `<footer class="symptom-footer">
    <div class="symptom-footer__inner">
      <div class="symptom-footer__logo">
        <span>${escapeHtml(siteName)}</span>
      </div>
      <p class="symptom-footer__tagline">${escapeHtml(siteSubtitle)}。膝痛を中心に、歩行や姿勢の影響を受けやすい慢性痛までご相談いただけます。</p>
      <ul class="symptom-footer__links">
${links}
      </ul>
      <p class="symptom-footer__note">※個人の感想であり、成果を保証するものではありません。<br>&copy; 2026 整体院ひざこぞう All Rights Reserved.</p>
    </div>
  </footer>`;
}

function selectRelatedPosts(config, posts) {
  return posts
    .map((post) => ({ post, score: scorePostForSymptom(post, config) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date))
    .map((entry) => entry.post);
}

function scorePostForSymptom(post, config) {
  let score = 0;
  const haystacks = [
    post.title,
    post.description,
    post.lead,
    ...post.tags
  ].join(" ");

  for (const item of post.relatedSymptoms) {
    const itemHref = normalizePath(item.href || "");
    const expectedHref = normalizePath(`/symptoms/${config.fileName}`);
    const itemLabel = normalize(item.label || "");
    const configLabel = normalize(config.label);

    if (itemHref === expectedHref) {
      score += 180;
    }
    if (itemHref.endsWith(`/${config.fileName}`)) {
      score += 120;
    }
    if (itemLabel === configLabel) {
      score += 120;
    } else if (itemLabel && (itemLabel.includes(configLabel) || configLabel.includes(itemLabel))) {
      score += 80;
    }
    for (const keyword of config.keywords) {
      if (itemLabel.includes(normalize(keyword))) score += 40;
      if (normalize(item.description || "").includes(normalize(keyword))) score += 18;
    }
  }

  if (config.categoryHints.includes(post.category.slug)) {
    score += 18;
  }

  for (const keyword of config.keywords) {
    const normalizedKeyword = normalize(keyword);
    if (!normalizedKeyword) continue;
    if (post.tags.some((tag) => normalize(tag).includes(normalizedKeyword))) score += 16;
    if (normalize(post.title).includes(normalizedKeyword)) score += 14;
    if (normalize(post.description).includes(normalizedKeyword)) score += 8;
    if (normalize(post.lead || "").includes(normalizedKeyword)) score += 6;
    if (normalize(haystacks).includes(normalizedKeyword)) score += 2;
  }

  return score;
}

function normalizePath(value) {
  return String(value || "").replace(/^https?:\/\/[^/]+/i, "").replace(/\/index\.html$/i, "/");
}

function buildRelatedArticlesSection(site, config, posts) {
  const cards = posts.map((post) => `
          <a class="related-article-card" href="../blog/posts/${post.slug}/">
            <div class="related-article-card__meta">
              <span class="related-article-card__pill">${escapeHtml(post.category.name)}</span>
            </div>
            <div class="related-article-card__title">${escapeHtml(post.title)}</div>
            <p class="related-article-card__desc">${escapeHtml(trimText(post.description, 78))}</p>
            <span class="related-article-card__link">記事を読む <i data-lucide="arrow-right" style="width:.875rem;height:.875rem;" aria-hidden="true"></i></span>
          </a>
  `).join("");

  return `
    <section class="related-articles">
      <div class="container max-w-4xl">
        <p class="related-articles__eyebrow">RELATED BLOG</p>
        <h2 class="related-articles__title">${escapeHtml(config.label)}に関連する記事</h2>
        <p class="related-articles__lead">症状ページとあわせて、考え方やセルフケアの整理に役立つ記事をまとめています。気になる内容から無理なく読み進めてみてください。</p>
        <div class="related-articles__grid">
${cards}
        </div>
      </div>
    </section>
  `.trim();
}

function validateBlogData(data) {
  if (!data?.site || !Array.isArray(data?.categories) || !Array.isArray(data?.posts)) {
    throw new Error("blog-posts.json must include site, categories, and posts.");
  }
}

function normalizePost(post, site, categoryMap) {
  const category = categoryMap.get(post.category);
  if (!category) {
    throw new Error(`Unknown category: ${post.category}`);
  }

  return {
    ...post,
    category,
    updatedDate: post.updatedDate || post.date,
    eyecatch: post.eyecatch || site.defaultEyecatch,
    tags: Array.isArray(post.tags) ? post.tags : [],
    sections: enrichSections(Array.isArray(post.sections) ? post.sections : []),
    faq: Array.isArray(post.faq) ? post.faq : [],
    relatedSymptoms: Array.isArray(post.relatedSymptoms) ? post.relatedSymptoms : [],
    cta: post.cta || site.cta,
    url: `/blog/posts/${post.slug}/`
  };
}

function enrichSections(sections) {
  return sections.map((section) => ({
    ...section,
    boxType: section.boxType || inferEnhancedBoxType(section.heading, section.listStyle),
    subsections: Array.isArray(section.subsections)
      ? section.subsections.map((item) => ({
          ...item,
          boxType: item.boxType || inferEnhancedSubsectionBoxType(item.heading)
        }))
      : section.subsections
  }));
}

function inferBoxType(heading, listStyle) {
  const value = String(heading || "");
  if (listStyle === "check" || /3つの柱|3ステップ|改善ステップ|ポイント|できること/.test(value)) {
    return "point-box";
  }
  if (/受診|目安|注意|我慢/.test(value)) {
    return "caution-box";
  }
  if (/まとめ|おわりに|補足/.test(value)) {
    return "note-box";
  }
  return "";
}

function inferSubsectionBoxType(heading) {
  const value = String(heading || "");
  if (/^STEP|^\d+\./.test(value)) {
    return "point-box";
  }
  if (/注意|受診|我慢/.test(value)) {
    return "caution-box";
  }
  return "";
}

function inferEnhancedBoxType(heading, listStyle) {
  const value = String(heading || "");
  if (listStyle === "check" || /3つの柱|3ステップ|改善ステップ|戻らない体/.test(value)) {
    return "point-box";
  }
  if (/注意|受診|検討していただきたい目安|こんな時は我慢せず/.test(value)) {
    return "caution-box";
  }
  if (/まとめ|補足|希望|おわりに/.test(value)) {
    return "note-box";
  }
  return inferBoxType(heading, listStyle);
}

function inferEnhancedSubsectionBoxType(heading) {
  const value = String(heading || "");
  if (/^STEP|^\d+\./.test(value)) {
    return "point-box";
  }
  if (/注意|受診|検討|目安/.test(value)) {
    return "caution-box";
  }
  if (/まとめ|補足/.test(value)) {
    return "note-box";
  }
  return inferSubsectionBoxType(heading);
}

function buildIndexSeo(site) {
  const canonical = `${trimTrailingSlash(site.url)}/blog/`;
  return [
    `<title>${escapeHtml(site.blogTitle)} | ${escapeHtml(site.name)}</title>`,
    `<meta name="description" content="${escapeHtml(site.blogDescription)}">`,
    `<link rel="canonical" href="${canonical}">`,
    `<meta property="og:locale" content="ja_JP">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${escapeHtml(site.blogTitle)} | ${escapeHtml(site.name)}">`,
    `<meta property="og:description" content="${escapeHtml(site.blogDescription)}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${absoluteUrl(site.url, site.ogImage)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(site.blogTitle)} | ${escapeHtml(site.name)}">`,
    `<meta name="twitter:description" content="${escapeHtml(site.blogDescription)}">`,
    `<meta name="twitter:image" content="${absoluteUrl(site.url, site.ogImage)}">`
  ].join("\n  ");
}

function buildPostSeo(site, post) {
  const canonical = `${trimTrailingSlash(site.url)}${post.url}`;
  const schemas = [
    buildArticleSchema(site, post),
    post.faq.length ? buildFaqSchema(post.faq) : ""
  ].filter(Boolean).join("\n  ");

  return [
    `<title>${escapeHtml(post.title)} | ${escapeHtml(site.name)}</title>`,
    `<meta name="description" content="${escapeHtml(post.description)}">`,
    `<link rel="canonical" href="${canonical}">`,
    `<meta property="og:locale" content="ja_JP">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:title" content="${escapeHtml(post.title)} | ${escapeHtml(site.name)}">`,
    `<meta property="og:description" content="${escapeHtml(post.description)}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${absoluteUrl(site.url, post.eyecatch)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(post.title)} | ${escapeHtml(site.name)}">`,
    `<meta name="twitter:description" content="${escapeHtml(post.description)}">`,
    `<meta name="twitter:image" content="${absoluteUrl(site.url, post.eyecatch)}">`,
    schemas
  ].join("\n  ");
}

export function buildIndexContent(site, posts, categoryMap) {
  const categories = [...categoryMap.values()];
  const recentPosts = posts.slice(0, 8);
  const recommendedSlugs = [
    "knee-pain-not-healing-honest-answer",
    "knee-effusion-water-in-knee",
    "seven-checkpoints-for-knee-pain-improvement"
  ];
  const recommendedPosts = recommendedSlugs
    .map((slug) => posts.find((post) => post.slug === slug))
    .filter(Boolean);
  const renderListItem = (post) => `
    <article class="article-list-item">
      <a class="article-list-item__link" href="posts/${post.slug}/">
        <div class="article-list-item__thumb">
          <img src="..${post.eyecatch}" alt="${escapeHtml(post.title)}" loading="lazy" decoding="async" width="320" height="220">
        </div>
        <div class="article-list-item__body">
          <div class="article-list-item__meta">
            <span class="pill">${escapeHtml(post.category.name)}</span>
          </div>
          <h3 class="article-list-item__title">${escapeHtml(post.title)}</h3>
          <p class="article-list-item__excerpt">${escapeHtml(trimText(post.description, 90))}</p>
        </div>
        <span class="article-list-item__arrow">読む</span>
      </a>
    </article>
  `;

  const recentList = recentPosts.map(renderListItem).join("");
  const recommendedList = recommendedPosts.map(renderListItem).join("");
  const recommendedSection = recommendedPosts.length ? `
        <section class="category-section category-section--list category-section--recommended">
          <div class="category-section__header category-section__header--list">
            <div>
              <p class="eyebrow">Start Here</p>
              <h3>まず読む3本</h3>
            </div>
            <p class="category-section__description">来院前の不安を短時間で整理しやすい記事を選びました。膝の状態、施術の見立て、相談の目安を先に確認できます。</p>
          </div>
          <div class="article-list">${recommendedList}</div>
        </section>
  ` : "";

  const categoryChips = categories.map((category) => `
    <a class="category-chip" href="#category-${escapeHtml(category.slug)}">${escapeHtml(category.name)}</a>
  `).join("");
  const categorySections = categories.map((category) => `
    <section class="category-section category-section--list" id="category-${escapeHtml(category.slug)}">
      <div class="category-section__header category-section__header--list">
        <div>
          <p class="eyebrow">Category</p>
          <h3>${escapeHtml(category.name)}</h3>
        </div>
        <p class="category-section__description">${escapeHtml(category.description)}</p>
      </div>
      <div class="article-list">
        ${posts
          .filter((post) => post.category.slug === category.slug)
          .map(renderListItem).join("")}
      </div>
    </section>
  `).join("");

  return `
    <section class="hero-block hero-block--compact">
      <div class="shell hero-block__inner">
        <div class="hero-copy hero-copy--compact">
          <p class="eyebrow">Blog</p>
          <h1>${escapeHtml(site.blogTitle)}</h1>
          <p class="hero-copy__lead">${escapeHtml(site.blogDescription)}</p>
          <div class="hero-actions">
            <a class="button button--primary" href="../index.html#contact">LINEで相談する</a>
            <a class="button button--soft" href="../index.html#symptoms">症状ページを見る</a>
          </div>
        </div>
      </div>
    </section>
    <section class="section-block">
      <div class="shell">
        <div class="section-heading">
          <p class="eyebrow">Guide</p>
          <h2>症状やテーマから探せる読みもの一覧</h2>
          <p>膝痛を中心に、腰痛や坐骨神経痛、運動療法の考え方まで、必要な記事を一覧で探しやすい形にまとめています。</p>
        </div>
        <nav class="category-chip-list category-nav" aria-label="ブログカテゴリ">
          ${categoryChips}
        </nav>
        <div class="blog-index-sequence">
          ${recommendedSection}
          <section class="category-section category-section--list category-section--recent">
          <div class="category-section__header category-section__header--list">
            <div>
              <p class="eyebrow">Recent</p>
              <h3>新着記事</h3>
            </div>
            <p class="category-section__description">まずは最近追加した記事から確認したい方のために、新しい順でまとめています。</p>
          </div>
          <div class="article-list">${recentList}</div>
          </section>
          <div class="category-sections">${categorySections}</div>
        </div>
      </div>
    </section>
    <section class="cta-band">
      <div class="shell cta-band__inner">
        <div>
          <p class="eyebrow">Contact</p>
          <h2>記事を読んで気になったら、相談からでも大丈夫です</h2>
          <p>${escapeHtml(site.cta.subtext)}</p>
        </div>
        <div class="cta-band__actions">
          <a class="button button--primary" href="${escapeHtml(site.cta.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(site.cta.label)}</a>
          <a class="button button--soft" href="../index.html#price">初回案内を見る</a>
        </div>
      </div>
    </section>
  `;
}

export function buildPostContent(site, post, relatedPosts) {
  const articleSections = post.sections.map((section, index) => ({
    ...section,
    id: `section-${index + 1}`
  }));
  const renderedSections = articleSections.map((section) => renderSection(section));
  const midCtaIndex = Math.min(2, renderedSections.length);
  const sectionsHtml = [
    ...renderedSections.slice(0, midCtaIndex),
    buildArticleMidCta(site, post),
    ...renderedSections.slice(midCtaIndex)
  ].join("");
  const tocHtml = buildArticleToc(articleSections, "inline");
  const sideTocHtml = buildArticleToc(articleSections, "side");
  const takeawaysHtml = buildArticleTakeaways(post);
  const faqHtml = post.faq.length ? `
    <section class="article-section faq-block faq-section">
      <div class="faq-section__intro">
        <div class="faq-section__copy">
          <p class="eyebrow">FAQ</p>
          <h2>よくあるご質問と回答</h2>
          <p class="faq-section__lead">来院前によくいただく質問を、読みやすい形でまとめています。気になる項目からそのまま確認してください。</p>
        </div>
        <div class="faq-section__visual" aria-hidden="true">
          <span class="faq-section__bubble faq-section__bubble--large"></span>
          <span class="faq-section__bubble faq-section__bubble--small"></span>
          <img src="../../../image/clinic-director-new.webp" alt="" loading="lazy" decoding="async" width="320" height="320">
        </div>
      </div>
      <div class="faq-list">
        ${post.faq.map((item) => `
          <div class="faq-item">
            <div class="faq-item__question" aria-label="質問">
              <span class="faq-item__label">Q</span>
              <p>${escapeHtml(item.question)}</p>
            </div>
            <div class="faq-item__answer" aria-label="回答">
              <span class="faq-item__label">A</span>
              <p>${escapeHtml(item.answer)}</p>
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  ` : "";

  const symptomsHtml = post.relatedSymptoms.length ? `
    <section class="article-section article-section--symptoms">
      <div class="article-section__heading">
        <p class="eyebrow">Symptoms</p>
        <h2>関連する症状ページ</h2>
      </div>
      <div class="symptom-grid">
        ${post.relatedSymptoms.map((item) => `
          <a class="symptom-card symptom-card--article" href="../../..${item.href}">
            <span class="symptom-card__label">${escapeHtml(item.label)}</span>
            <span class="symptom-card__description">${escapeHtml(item.description || "")}</span>
          </a>
        `).join("")}
      </div>
    </section>
  ` : "";

  const relatedArticlesHtml = relatedPosts.length ? `
    <section class="section-block article-related">
      <div class="shell">
        <div class="section-heading">
          <p class="eyebrow">Related</p>
          <h2>あわせて読みたい記事</h2>
        </div>
        <div class="related-posts">
          ${relatedPosts.map((item) => `
            <a class="related-post-card" href="../${item.slug}/">
              <span class="pill">${escapeHtml(item.category.name)}</span>
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(item.description)}</span>
            </a>
          `).join("")}
        </div>
      </div>
    </section>
  ` : "";

  return `
    <section class="article-hero-wrap">
      <div class="shell">
        <nav class="breadcrumb" aria-label="パンくず">
          <a href="../../../index.html">トップ</a>
          <span>/</span>
          <a href="../../">ブログ</a>
          <span>/</span>
          <span>${escapeHtml(post.title)}</span>
        </nav>
        <article class="article-card">
          <div class="article-card__hero">
            <img src="../../..${post.eyecatch}" alt="${escapeHtml(post.title)}" loading="eager" decoding="async" width="1200" height="630">
          </div>
          <div class="article-card__body article-card__body--post">
            <div class="article-meta">
              <span class="pill">${escapeHtml(post.category.name)}</span>
            </div>
            <h1>${escapeHtml(post.title)}</h1>
            <p class="article-lead">${escapeHtml(post.lead || post.description)}</p>
            <div class="tag-list">${post.tags.map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join("")}</div>
          </div>
        </article>
      </div>
    </section>
    <section class="article-main">
      <div class="shell article-layout">
        <div class="article-content card-surface prose-surface">
          ${tocHtml}
          ${takeawaysHtml}
          ${sectionsHtml}
          ${faqHtml}
          ${symptomsHtml}
        </div>
        <aside class="article-side">
          ${sideTocHtml}
          <div class="side-card">
            <p class="side-card__eyebrow">相談先</p>
            <h2>${escapeHtml(site.name)}</h2>
            <p>${escapeHtml(site.subtitle)}で膝痛を中心に、腰痛や坐骨神経痛など慢性痛にも対応しています。</p>
            <a class="button button--primary button--full" href="${escapeHtml(post.cta.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(post.cta.label)}</a>
            <p class="side-card__note">${escapeHtml(post.cta.note || site.cta.subtext)}</p>
          </div>
          <div class="side-card">
            <p class="side-card__eyebrow">一覧へ</p>
            <a class="text-link text-link--block" href="../../">ブログ一覧に戻る</a>
            <a class="text-link text-link--block" href="../../../index.html#symptoms">症状ページを見る</a>
          </div>
        </aside>
      </div>
    </section>
    <section class="pricing-cta">
      <div class="shell">
        <div class="pricing-cta__card">
          <p class="pricing-cta__badge">LINEからのご相談・ご予約受付中</p>
          <h2 class="pricing-cta__title">初回 カウンセリング＋全身整体</h2>
          <p class="pricing-cta__duration">約60分（カウンセリング・状態確認・施術）</p>
          <div class="pricing-cta__price-box">
            <div class="pricing-cta__price-row">
              <div class="pricing-cta__before">
                <span class="pricing-cta__before-label">通常料金</span>
                <span class="pricing-cta__before-price">10,000円</span>
              </div>
              <span class="pricing-cta__arrow" aria-hidden="true">→</span>
              <div class="pricing-cta__after">
                <span class="pricing-cta__after-label">初回特別価格</span>
                <span class="pricing-cta__after-price">1,980<small>円（税込）</small></span>
              </div>
            </div>
          </div>
          <div class="pricing-cta__note-box">
            <p class="pricing-cta__note-title">2回目以降の料金について</p>
            <p class="pricing-cta__note-text">2回目以降は1回 10,000円（税込）です。継続される方向けのプランは、初回カウンセリング時にお体の状態を確認したうえでご案内いたします。</p>
          </div>
          <p class="pricing-cta__reassurance">初回はカウンセリングと状態確認を含めて、無理のない内容で進めます。</p>
          <p class="pricing-cta__sub">まず相談してみたいという方も、LINEから気軽にご連絡ください。</p>
          <div class="pricing-cta__actions">
            <a class="button button--primary" href="${escapeHtml(post.cta.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(post.cta.label)}</a>
            <a class="button button--phone" href="tel:${site.phone.replace(/-/g, '')}">電話で相談する</a>
          </div>
        </div>
      </div>
    </section>
    ${relatedArticlesHtml}
  `;
}

function buildArticleToc(sections, variant = "inline") {
  const items = sections
    .filter((section) => section.heading && section.id)
    .map((section, index) => `
            <li>
              <a href="#${escapeHtml(section.id)}">
                <span class="article-toc__number">${String(index + 1).padStart(2, "0")}</span>
                <span>${escapeHtml(section.heading)}</span>
              </a>
            </li>`)
    .join("");

  if (!items) return "";

  const className = variant === "side" ? "article-toc article-toc--side" : "article-toc article-toc--inline";
  const label = variant === "side" ? "記事の目次" : "この記事の目次";

  return `<nav class="${className}" aria-label="${label}">
            <p class="eyebrow">Contents</p>
            <h2>${label}</h2>
            <ol>
${items}
            </ol>
          </nav>`;
}

function buildArticleTakeaways(post) {
  const headings = post.sections
    .map((section) => section.heading)
    .filter(Boolean)
    .slice(0, 4);
  if (!headings.length) return "";

  const items = headings.map((heading) => `
            <li>${escapeHtml(heading)}</li>`).join("");

  return `<section class="article-takeaways" aria-labelledby="article-takeaways-title">
            <p class="eyebrow">Guide</p>
            <h2 id="article-takeaways-title">この記事でわかること</h2>
            <ul>
${items}
            </ul>
          </section>`;
}

function buildArticleMidCta(site, post) {
  const ctaHref = post.cta?.href || site.cta?.href || site.lineUrl || "https://lin.ee/X01F2mP";
  const ctaLabel = post.cta?.label || site.cta?.label || "LINEで相談する";
  return `<section class="article-mid-cta">
            <div>
              <p class="article-mid-cta__eyebrow">相談の目安</p>
              <h2>読んでいて自分も近いと感じたら、来院前に相談できます</h2>
              <p>痛み方や困っている動作は人によって違います。記事の内容に近い不安があれば、LINEで今の状態を送っていただいて大丈夫です。</p>
            </div>
            <a class="article-mid-cta__button" href="${escapeHtml(ctaHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(ctaLabel)}</a>
          </section>`;
}

function renderSection(section) {
  const heading = section.heading
    ? `<h2${section.id ? ` id="${escapeHtml(section.id)}"` : ""}>${escapeHtml(section.heading)}</h2>`
    : "";
  const body = renderBody(section);
  const classNames = ["article-section", section.className].filter(Boolean).join(" ");
  const subsections = Array.isArray(section.subsections)
    ? section.subsections.map((item) => `
        <section class="article-subsection">
          ${item.heading ? `<h3>${escapeHtml(item.heading)}</h3>` : ""}
          ${renderBody(item)}
        </section>
      `).join("")
    : "";

  return `<section class="${classNames}">${heading}${body}${subsections}</section>`;
}

export function renderBody(block) {
  const items = Array.isArray(block.body) ? block.body : [];
  if (items.length === 0) {
    return "";
  }
  if (block.listStyle === "check") {
    return `<ul class="check-list">${items.map((item) => `<li>${renderInlineText(item)}</li>`).join("")}</ul>`;
  }

  const chunks = [];
  let bulletItems = [];
  const flushBullets = () => {
    if (!bulletItems.length) return;
    chunks.push(`<ul class="check-list">${bulletItems.map((item) => `<li>${renderInlineText(item)}</li>`).join("")}</ul>`);
    bulletItems = [];
  };

  for (const item of items) {
    const bulletMatch = String(item).match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      bulletItems.push(bulletMatch[1].trim());
      continue;
    }
    flushBullets();
    chunks.push(`<p>${renderInlineText(item)}</p>`);
  }
  flushBullets();

  return chunks.join("");
}

function buildArticleSchema(site, post) {
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updatedDate,
    image: [absoluteUrl(site.url, post.eyecatch)],
    author: { "@type": "Organization", name: site.author },
    publisher: {
      "@type": "Organization",
      name: site.publisherName,
      logo: { "@type": "ImageObject", url: absoluteUrl(site.url, site.ogImage) }
    },
    mainEntityOfPage: `${trimTrailingSlash(site.url)}${post.url}`
  })}</script>`;
}

function buildFaqSchema(faq) {
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer }
    }))
  })}</script>`;
}

function buildBlogRedirectHtml() {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ブログ一覧へ移動します | 整体院ひざこぞう</title>
  <meta name="robots" content="noindex,follow">
  <meta http-equiv="refresh" content="0; url=./blog/">
  <link rel="canonical" href="https://hizakozou.jp/blog/">
</head>
<body>
  <p>ブログ一覧へ移動しています。表示が切り替わらない場合は <a href="./blog/">こちら</a> をご利用ください。</p>
</body>
</html>`;
}

function buildLegacyDetailRedirectHtml() {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>記事ページへ移動します | 整体院ひざこぞう</title>
  <meta name="robots" content="noindex,follow">
  <script>
    (async function () {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get("slug") || params.get("id");
      if (!slug) {
        window.location.replace("./blog/");
        return;
      }
      try {
        const res = await fetch("./data/blog-posts.json", { cache: "no-store" });
        const data = await res.json();
        const match = Array.isArray(data.posts) ? data.posts.find((post) => post.slug === slug) : null;
        window.location.replace(match ? "./blog/posts/" + match.slug + "/" : "./blog/");
      } catch (error) {
        window.location.replace("./blog/");
      }
    })();
  </script>
</head>
<body>
  <p>記事ページへ移動しています。表示が切り替わらない場合は <a href="./blog/">ブログ一覧</a> から記事をお選びください。</p>
</body>
</html>`;
}

function renderTemplate(template, values) {
  return Object.entries(values).reduce((output, [key, value]) => output.replaceAll(`{{${key}}}`, value), template);
}

function cleanGeneratedText(value) {
  return String(value).replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n");
}

function formatJapaneseDate(value) {
  return new Date(value).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

async function getFileLastmod(filePath) {
  const stats = await fs.stat(filePath);
  return formatSitemapDate(stats.mtime);
}

function formatSitemapDate(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid sitemap date: ${value}`);
  }

  return date.toISOString().slice(0, 10);
}

function absoluteUrl(siteUrl, assetPath) {
  if (/^https?:\/\//.test(assetPath)) return assetPath;
  return `${trimTrailingSlash(siteUrl)}${assetPath.startsWith("/") ? assetPath : `/${assetPath}`}`;
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function trimText(value, maxLength) {
  const text = String(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
}

function normalize(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, "");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderInlineText(value) {
  let text = escapeHtml(value);

  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+|\.\.?\/[^)\s]+|#[^)\s]+)\)/g,
    (_match, label, href) => `<a href="${href}">${label}</a>`
  );

  const quotedPhrases = Array.from(text.matchAll(/「([^」]{2,24})」/g)).map((match) => match[1]);
  for (const phrase of quotedPhrases) {
    text = text.replaceAll(`「${phrase}」`, `「<strong class="article-emphasis">${phrase}</strong>」`);
  }

  const emphasisPhrases = [
    "Joint by Joint Theory",
    "Mobility",
    "Stability",
    "Movement",
    "Deep Front Line",
    "多裂筋",
    "大腰筋",
    "梨状筋",
    "スウェイバック姿勢",
    "反張膝",
    "運動療法",
    "徒手療法",
    "日常動作の指導",
    "3つの柱",
    "3つのステップ",
    "痛みの悪循環",
    "防衛反応",
    "被害者",
    "可動性",
    "安定性"
  ];

  for (const phrase of emphasisPhrases) {
    const escapedPhrase = escapeHtml(phrase);
    const safePattern = escapedPhrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(`(?<![\\w>])${safePattern}(?![^<]*>|[\\w])`, "g"), `<strong class="article-emphasis">${escapedPhrase}</strong>`);
  }

  text = text.replace(/(STEP\s*[1-3])/g, '<strong class="article-emphasis">$1</strong>');
  return text;
}

for (const [fileName, config] of Object.entries(symptomConfigs)) {
  config.fileName = fileName;
  config.page = fileName;
}
