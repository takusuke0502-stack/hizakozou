import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const sourceDir = path.join(rootDir, "content", "source");
const seoDir = path.join(rootDir, "content", "seo");
const meoDir = path.join(rootDir, "content", "meo");
const blogDir = path.join(rootDir, "blog");
const postsDir = path.join(blogDir, "posts");
const dataDir = path.join(blogDir, "data");
const assetsDir = path.join(blogDir, "assets");

const args = process.argv.slice(2);
const targetArgIndex = args.indexOf("--source");
const targetSource = targetArgIndex >= 0 ? args[targetArgIndex + 1] : "";

await ensureDirectories();

if (targetSource) {
  await assertSourceExists(targetSource);
}

const sourceFiles = (await fs.readdir(sourceDir))
  .filter((file) => file.endsWith(".md") && !file.startsWith("_"))
  .sort();

const posts = [];
const symptomPageMap = {
  "変形性膝関節症": { href: "../../symptoms/knee-osteoarthritis.html", label: "変形性膝関節症", summary: "階段や立ち上がりで膝が気になる方に向けたページです。" },
  "腰痛": { href: "../../symptoms/lower-back-pain.html", label: "腰痛", summary: "膝をかばって腰までつらいときの考え方も整理しています。" },
  "坐骨神経痛": { href: "../../symptoms/sciatica.html", label: "坐骨神経痛", summary: "しびれや脚への違和感が気になる方はこちらをご覧ください。" },
  "脊柱管狭窄症": { href: "../../symptoms/spinal-stenosis.html", label: "脊柱管狭窄症", summary: "歩く距離で症状が変わるときの見方をまとめています。" },
  "肩こり": { href: "../../symptoms/shoulder-stiffness.html", label: "肩こり", summary: "首肩まわりの重だるさや慢性的な負担が気になる方向けです。" },
  "四十肩": { href: "../../symptoms/frozen-shoulder.html", label: "四十肩・五十肩", summary: "肩が上がりにくい時期の考え方をまとめています。" },
  "五十肩": { href: "../../symptoms/frozen-shoulder.html", label: "四十肩・五十肩", summary: "肩が上がりにくい時期の考え方をまとめています。" },
  "手根管症候群": { href: "../../symptoms/carpal-tunnel.html", label: "手根管症候群", summary: "手のしびれや使いにくさが気になる方に向けたページです。" },
  "頚椎症": { href: "../../symptoms/cervical-spondylosis.html", label: "頚椎症", summary: "首から腕にかけての痛みやしびれを整理したページです。" },
  "股関節痛": { href: "../../symptoms/hip-osteoarthritis.html", label: "股関節の痛み", summary: "歩行時に股関節の負担も気になる方におすすめです。" },
  "変形性股関節症": { href: "../../symptoms/hip-osteoarthritis.html", label: "変形性股関節症", summary: "股関節の動かしづらさや歩きにくさを整理しています。" },
  "膝に水がたまる": { href: "../../symptoms/knee-effusion.html", label: "膝に水がたまる", summary: "腫れや熱っぽさがある膝の変化が気になる方へ。" },
  "膝の外側の痛み": { href: "../../symptoms/knee-lateral-pain.html", label: "膝の外側の痛み", summary: "歩く・走るときの膝の外側の負担を整理したページです。" },
  "鵞足炎": { href: "../../symptoms/pes-anserine-bursitis.html", label: "鵞足炎", summary: "膝の内側に出る痛みや違和感が気になる方向けです。" },
  "足底腱膜炎": { href: "../../symptoms/plantar-fasciitis.html", label: "足底腱膜炎", summary: "足裏の負担が膝や歩き方に影響している方にも役立ちます。" },
  "胸郭出口症候群": { href: "../../symptoms/thoracic-outlet.html", label: "胸郭出口症候群", summary: "腕のだるさやしびれが続くときの見方をまとめています。" },
  "顎関節症": { href: "../../symptoms/tmj.html", label: "顎関節症", summary: "あごの違和感や食いしばりが気になる方に向けたページです。" },
  "肘の痛み": { href: "../../symptoms/elbow-tendinopathy.html", label: "肘の痛み", summary: "仕事や家事で肘が使いづらいときの考え方をまとめています。" }
};

for (const file of sourceFiles) {
  const fullPath = path.join(sourceDir, file);
  const raw = await fs.readFile(fullPath, "utf8");
  const parsed = parseSource(raw, file);
  if (parsed.meta.draft === "true") {
    continue;
  }

  const post = buildPost(parsed, file);
  posts.push(post);

  await fs.writeFile(path.join(seoDir, `${post.slug}.md`), buildSeoMarkdown(post), "utf8");
  await fs.writeFile(path.join(meoDir, `${post.slug}.txt`), buildMeoDraft(post), "utf8");
  await fs.writeFile(path.join(postsDir, `${post.slug}.html`), buildPostHtml(post), "utf8");
}

posts.sort((a, b) => b.date.localeCompare(a.date));

await removeStaleGeneratedFiles(seoDir, posts.map((post) => `${post.slug}.md`));
await removeStaleGeneratedFiles(meoDir, posts.map((post) => `${post.slug}.txt`));
await removeStaleGeneratedFiles(postsDir, posts.map((post) => `${post.slug}.html`));

await fs.writeFile(path.join(dataDir, "posts.json"), JSON.stringify(posts, null, 2), "utf8");

const blogIndexHtml = buildBlogListRedirectHtml();
await fs.writeFile(path.join(rootDir, "blog.html"), blogIndexHtml, "utf8");

const blogFolderIndexHtml = buildBlogIndexHtml(posts, {
  cssPath: "assets/blog.css",
  homePath: "../index.html",
  indexPath: "../blog.html",
  canonical: "https://hizakozou.jp/blog/",
  postBasePath: "posts/",
  assetPrefix: ".."
});
await fs.writeFile(path.join(blogDir, "index.html"), blogFolderIndexHtml, "utf8");

await fs.writeFile(path.join(rootDir, "blog-detail.html"), buildLegacyRedirectHtml(), "utf8");

console.log(`Generated ${posts.length} blog post(s).`);

async function ensureDirectories() {
  await fs.mkdir(sourceDir, { recursive: true });
  await fs.mkdir(seoDir, { recursive: true });
  await fs.mkdir(meoDir, { recursive: true });
  await fs.mkdir(postsDir, { recursive: true });
  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(assetsDir, { recursive: true });
}

async function assertSourceExists(input) {
  const candidates = [
    path.isAbsolute(input) ? input : path.join(rootDir, input),
    path.join(sourceDir, input)
  ];

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return;
    } catch {
      // continue
    }
  }

  throw new Error(`Source file not found: ${input}`);
}

function parseSource(raw, fileName) {
  const normalized = raw.replace(/\r\n/g, "\n").trim();
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const metaBlock = match ? match[1] : "";
  const body = match ? match[2].trim() : normalized;
  const meta = {};

  for (const line of metaBlock.split("\n")) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex < 0) continue;
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    meta[key] = value;
  }

  meta.slug = meta.slug || slugify(meta.title || fileName.replace(/\.md$/i, ""));
  meta.title = meta.title || fileName.replace(/\.md$/i, "");
  meta.date = meta.date || new Date().toISOString().slice(0, 10);
  meta.description = meta.description || createDescription(body, meta.title);
  meta.category = meta.category || "お知らせ";
  meta.region = meta.region || "柏市";
  meta.heroImage = meta.heroImage || "/image/medical-interview.webp";
  meta.tags = splitCsv(meta.tags);
  meta.symptoms = splitCsv(meta.symptoms);

  return { meta, body };
}

function buildPost(parsed, fileName) {
  const lead = getLeadParagraphs(parsed.body, 2);
  const seoMarkdown = buildSeoBody(parsed.meta, parsed.body);
  const html = markdownToHtml(seoMarkdown);
  const excerpt = createDescription(lead || parsed.body, parsed.meta.title, 90);
  const relatedSymptoms = parsed.meta.symptoms
    .map((name) => symptomPageMap[name])
    .filter(Boolean)
    .slice(0, 3);

  return {
    slug: parsed.meta.slug,
    sourceFile: fileName,
    title: parsed.meta.title,
    date: parsed.meta.date,
    description: parsed.meta.description,
    category: parsed.meta.category,
    region: parsed.meta.region,
    tags: parsed.meta.tags,
    symptoms: parsed.meta.symptoms,
    relatedSymptoms,
    heroImage: parsed.meta.heroImage,
    excerpt,
    url: `blog/posts/${parsed.meta.slug}.html`,
    seoMarkdown,
    html,
    updatedAt: new Date().toISOString()
  };
}

function buildSeoBody(meta, body) {
  const intro = getLeadParagraphs(body, 2) || meta.description;
  const takeawayLines = [
    `${meta.region}で、膝痛を中心に腰痛や坐骨神経痛など慢性痛全般のご相談を受けています。`,
    "痛みのある場所だけでなく、普段の動き方や生活背景も一緒に整理していきます。",
    "必要に応じて医療機関での検査が必要なケースも見極めながら、無理のない進め方をご提案します。"
  ];

  const summarySection = takeawayLines.map((line) => `- ${line}`).join("\n");
  const symptomLine = meta.symptoms.length
    ? `膝の痛みを中心に、${meta.symptoms.join("、")}などのご相談にもつながりやすい内容として整理しています。`
    : "膝の痛みを中心に、慢性痛全般のご相談にもつながりやすい内容として整理しています。";

  return [
    `# ${meta.title}`,
    "",
    intro,
    "",
    "## この記事でお伝えしたいこと",
    "",
    summarySection,
    "",
    body.trim(),
    "",
    "## 整体院ひざこぞうで大切にしていること",
    "",
    `${symptomLine} 一人ひとりの状態に合わせて、改善を目指しながら負担を減らす考え方を大切にしています。`,
    "",
    "## 医療機関での検査をおすすめするケース",
    "",
    "強い腫れやしびれ、急な痛みの変化、安静にしていてもつらい状態などがある場合は、医療機関での検査が必要なことがあります。当院での対応が難しい場合は、無理に施術を進めず医療機関をご案内します。",
    "",
    "## まとめ",
    "",
    `${meta.title}について不安が続くときは、症状を一人で抱え込まず、今の状態を整理することから始めてみてください。`
  ].join("\n");
}

function buildSeoMarkdown(post) {
  const lines = [
    "---",
    `title: ${post.title}`,
    `slug: ${post.slug}`,
    `date: ${post.date}`,
    `description: ${post.description}`,
    `category: ${post.category}`,
    `region: ${post.region}`,
    `sourceFile: ${post.sourceFile}`,
    `heroImage: ${post.heroImage}`,
    `tags: ${post.tags.join(",")}`,
    `symptoms: ${post.symptoms.join(",")}`,
    "---",
    "",
    post.seoMarkdown.trim(),
    ""
  ];
  return lines.join("\n");
}

function buildMeoDraft(post) {
  const base = `${post.region}の整体院ひざこぞうです。${post.title}にまつわる不安は、痛みのある場所だけでなく、日常の動きや体の使い方を整理すると見え方が変わることがあります。膝痛を中心に、腰痛や坐骨神経痛など慢性痛全般のご相談にも対応しています。無理に施術をすすめるのではなく、今の状態に合わせて分かりやすくご提案します。気になることがあれば、まずはお気軽にご相談ください。`;
  return trimText(base, 320);
}

function buildPostHtml(post) {
  const title = `${escapeHtml(post.title)} | 整体院ひざこぞう`;
  const canonical = `https://hizakozou.jp/${post.url}`;
  const ogImage = absoluteAssetUrl(post.heroImage);
  const relatedSymptomsHtml = post.relatedSymptoms.length
    ? `<section class="related-section">
          <h2>関連する症状ページ</h2>
          <div class="related-links">
            ${post.relatedSymptoms.map((item) => `
              <a class="related-link-card" href="${item.href}">
                <span class="related-link-card__label">${escapeHtml(item.label)}</span>
                <span class="related-link-card__summary">${escapeHtml(item.summary || "")}</span>
                <span class="related-link-card__meta">症状ページを見る</span>
              </a>
            `).join("")}
          </div>
        </section>`
    : "";

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${escapeHtml(post.description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(post.title)} | 整体院ひざこぞう">
  <meta property="og:description" content="${escapeHtml(post.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ogImage}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="../assets/blog.css">
</head>
<body>
  <header class="site-header">
    <div class="inner header-row">
      <a class="brand" href="../../index.html">整体院ひざこぞう<span>柏駅西口の整体院</span></a>
      <nav class="header-nav">
        <a class="header-link" href="../../index.html#symptoms">症状別ページ</a>
        <a class="header-link" href="../../index.html#contact">LINEで相談</a>
        <a class="header-button" href="../../blog.html">ブログ一覧</a>
      </nav>
    </div>
  </header>
  <main class="page-shell">
    <div class="inner">
      <nav class="breadcrumb"><a href="../../index.html">ホーム</a> / <a href="../../blog.html">ブログ</a> / <span>${escapeHtml(post.title)}</span></nav>
      <article class="article-card">
        <img class="article-hero" src="${relativeAssetPath(post.heroImage, "../..")}" alt="${escapeHtml(post.title)}" loading="eager" decoding="async" width="1200" height="630">
        <div class="article-body">
          <div class="article-meta">
            <span>${escapeHtml(post.category)}</span>
            <time datetime="${post.date}">${formatJapaneseDate(post.date)}</time>
          </div>
          <h1 class="article-title">${escapeHtml(post.title)}</h1>
          <p class="article-lead">${escapeHtml(post.description)}</p>
          <div class="article-content">
            ${post.html}
          </div>
          ${relatedSymptomsHtml}
          <div class="article-note">
            <p>当記事は情報提供を目的としたもので、医療行為の代替ではありません。症状の強さや経過によっては、医療機関での検査が必要な場合があります。</p>
          </div>
          <div class="article-actions">
            <a class="secondary-button" href="../../blog.html">ブログ一覧へ戻る</a>
            <a class="primary-button" href="../../index.html#contact">LINEで相談する</a>
          </div>
        </div>
      </article>
    </div>
  </main>
</body>
</html>`;
}

function buildBlogIndexHtml(posts, options) {
  const cards = posts.length
    ? posts.map((post) => buildCard(post, options)).join("\n")
    : `<div class="empty-state"><h2>まだ公開記事はありません</h2><p>content/source/ に元原稿を置いて生成すると、ここに記事が並びます。</p></div>`;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ブログ一覧 | 整体院ひざこぞう</title>
  <meta name="description" content="整体院ひざこぞうのブログ一覧です。膝痛を中心に、腰痛や坐骨神経痛など慢性痛全般に関する読み物を掲載します。">
  <link rel="canonical" href="${options.canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="ブログ一覧 | 整体院ひざこぞう">
  <meta property="og:description" content="膝痛を中心に、慢性痛全般の考え方や日常のヒントをまとめた記事一覧です。">
  <meta property="og:url" content="${options.canonical}">
  <meta property="og:image" content="https://hizakozou.jp/ogp.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="${options.cssPath}">
</head>
<body>
  <header class="site-header">
    <div class="inner header-row">
      <a class="brand" href="${options.homePath}">整体院ひざこぞう<span>柏駅西口の整体院</span></a>
      <nav class="header-nav">
        <a class="header-link" href="${options.homePath}#symptoms">症状別ページ</a>
        <a class="header-link" href="${options.homePath}#contact">LINEで相談</a>
      </nav>
    </div>
  </header>
  <main class="page-shell">
    <div class="inner">
      <section class="page-hero">
        <p class="eyebrow">Blog</p>
        <h1>膝痛を中心に、慢性痛全般の情報を整理したブログです</h1>
        <p>元原稿の想いを残しつつ、整体院サイトに合う読みやすさでまとめています。強い断定は避け、日常で役立つ視点を大切にしています。</p>
      </section>
      <section class="cards-grid">
        ${cards}
      </section>
    </div>
  </main>
</body>
</html>`;
}

function buildLegacyRedirectHtml() {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ブログ記事へ移動します | 整体院ひざこぞう</title>
  <meta name="robots" content="noindex,follow">
  <script>
    (async function () {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id") || params.get("slug");
      if (!id) {
        window.location.replace("./blog.html");
        return;
      }
      try {
        const res = await fetch("./blog/data/posts.json", { cache: "no-store" });
        const posts = await res.json();
        const match = posts.find((post) => post.slug === id);
        window.location.replace(match ? "./" + match.url : "./blog.html");
      } catch (error) {
        window.location.replace("./blog.html");
      }
    })();
  </script>
</head>
<body>
  <p>ブログ記事へ移動しています。自動で切り替わらない場合は <a href="./blog.html">ブログ一覧</a> をご覧ください。</p>
</body>
</html>`;
}

function buildBlogListRedirectHtml() {
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
  <p>ブログ一覧へ移動しています。自動で切り替わらない場合は <a href="./blog/">こちら</a> をご利用ください。</p>
</body>
</html>`;
}

function buildCard(post, options) {
  return `<article class="post-card">
    <a class="post-card__link" href="${options.postBasePath}${post.slug}.html">
      <img class="post-card__image" src="${relativeAssetPath(post.heroImage, options.assetPrefix)}" alt="${escapeHtml(post.title)}" loading="lazy" decoding="async" width="600" height="360">
      <div class="post-card__body">
        <div class="post-card__meta">
          <span>${escapeHtml(post.category)}</span>
          <time datetime="${post.date}">${formatJapaneseDate(post.date)}</time>
        </div>
        <h2>${escapeHtml(post.title)}</h2>
        <p>${escapeHtml(post.excerpt)}</p>
      </div>
    </a>
  </article>`;
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let listType = "";
  let listItems = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    html.push(`<${listType}>${listItems.map((item) => `<li>${renderInline(item)}</li>`).join("")}</${listType}>`);
    listItems = [];
    listType = "";
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = Math.min(heading[1].length, 4);
      html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    const ul = line.match(/^- (.*)$/);
    if (ul) {
      flushParagraph();
      if (listType && listType !== "ul") flushList();
      listType = "ul";
      listItems.push(ul[1]);
      continue;
    }

    const ol = line.match(/^\d+\.\s+(.*)$/);
    if (ol) {
      flushParagraph();
      if (listType && listType !== "ol") flushList();
      listType = "ol";
      listItems.push(ol[1]);
      continue;
    }

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      flushList();
      html.push(`<blockquote><p>${renderInline(quote[1])}</p></blockquote>`);
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return html.join("\n");
}

function renderInline(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function createDescription(text, fallback = "", maxLength = 120) {
  const base = trimText(stripMarkdown(text || fallback).replace(/\s+/g, " "), maxLength);
  return base || fallback;
}

function getLeadParagraphs(markdown, count) {
  const blocks = markdown
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .filter((block) => !block.startsWith("#") && !block.startsWith("- ") && !/^\d+\./.test(block));
  return blocks.slice(0, count).join("\n\n");
}

function splitCsv(value = "") {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function trimText(value, maxLength) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
}

function stripMarkdown(markdown) {
  return markdown.replace(/^#+\s+/gm, "").replace(/[*_`>#-]/g, "");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatJapaneseDate(value) {
  return new Date(value).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function absoluteAssetUrl(assetPath) {
  return assetPath.startsWith("http")
    ? assetPath
    : `https://hizakozou.jp${assetPath.startsWith("/") ? assetPath : `/${assetPath}`}`;
}

function relativeAssetPath(assetPath, basePrefix) {
  if (assetPath.startsWith("http")) return assetPath;
  if (assetPath.startsWith("/")) return `${basePrefix}${assetPath}`;
  return `${basePrefix}/${assetPath}`;
}

async function removeStaleGeneratedFiles(directory, keepFiles) {
  const keepSet = new Set(keepFiles.concat(".gitkeep"));
  const files = await fs.readdir(directory);
  await Promise.all(files.map(async (file) => {
    if (keepSet.has(file)) return;
    if (file.endsWith(".md") || file.endsWith(".txt") || file.endsWith(".html")) {
      await fs.rm(path.join(directory, file), { force: true });
    }
  }));
}
