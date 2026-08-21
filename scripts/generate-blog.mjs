import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = process.cwd();
const sourceDir = path.join(rootDir, "content", "source");
const seoDir = path.join(rootDir, "content", "seo");
const meoDir = path.join(rootDir, "content", "meo");
const dataPath = path.join(rootDir, "data", "blog-posts.json");

const DEFAULT_RELATED_SYMPTOMS = {
  "膝の痛み": {
    label: "膝の痛み",
    href: "/symptoms/knee-pain.html",
    description: "痛む場所や動作から近い相談ページを探したい方へ。"
  },
  "膝痛": {
    label: "膝の痛み",
    href: "/symptoms/knee-pain.html",
    description: "痛む場所や動作から近い相談ページを探したい方へ。"
  },
  "変形性膝関節症": {
    label: "変形性膝関節症",
    href: "/symptoms/knee-osteoarthritis.html",
    description: "膝の曲げ伸ばしや歩き始めで違和感がある方へ。"
  },
  "膝関節水腫": {
    label: "膝に水がたまる",
    href: "/symptoms/knee-effusion.html",
    description: "腫れや重さがあるときの見方を知りたい方へ。"
  },
  "膝の水": {
    label: "膝に水がたまる",
    href: "/symptoms/knee-effusion.html",
    description: "腫れや重さがあるときの見方を知りたい方へ。"
  },
  "膝に水が溜まる": {
    label: "膝に水がたまる",
    href: "/symptoms/knee-effusion.html",
    description: "腫れや重さがあるときの見方を知りたい方へ。"
  },
  "膝に水がたまる": {
    label: "膝に水がたまる",
    href: "/symptoms/knee-effusion.html",
    description: "腫れや重さがあるときの見方を知りたい方へ。"
  },
  "膝の外側の痛み": {
    label: "膝の外側の痛み",
    href: "/symptoms/knee-lateral-pain.html",
    description: "歩行時や階段で外側が気になる方へ。"
  },
  "膝の前側の痛み": {
    label: "膝の前側の痛み",
    href: "/symptoms/knee-front-pain.html",
    description: "階段や立ち上がりでお皿まわりが気になる方へ。"
  },
  "膝のお皿の痛み": {
    label: "膝の前側の痛み",
    href: "/symptoms/knee-front-pain.html",
    description: "階段や立ち上がりでお皿まわりが気になる方へ。"
  },
  "半月板損傷": {
    label: "半月板損傷・膝の引っかかり",
    href: "/symptoms/meniscus-knee-pain.html",
    description: "曲げ伸ばしや引っかかり感が気になる方へ。"
  },
  "膝の引っかかり": {
    label: "半月板損傷・膝の引っかかり",
    href: "/symptoms/meniscus-knee-pain.html",
    description: "曲げ伸ばしや引っかかり感が気になる方へ。"
  },
  "O脚": {
    label: "O脚・膝のゆがみ",
    href: "/symptoms/bowlegs-knee-pain.html",
    description: "膝の内側や脚のゆがみが気になる方へ。"
  },
  "膝のゆがみ": {
    label: "O脚・膝のゆがみ",
    href: "/symptoms/bowlegs-knee-pain.html",
    description: "膝の内側や脚のゆがみが気になる方へ。"
  },
  "反張膝": {
    label: "反張膝・膝が伸びすぎる",
    href: "/symptoms/knee-hyperextension.html",
    description: "立つと膝が後ろへ入りやすい方へ。"
  },
  "膝が伸びすぎる": {
    label: "反張膝・膝が伸びすぎる",
    href: "/symptoms/knee-hyperextension.html",
    description: "立つと膝が後ろへ入りやすい方へ。"
  },
  "足首の硬さ": {
    label: "足首の硬さと膝痛",
    href: "/symptoms/ankle-stiffness-knee-pain.html",
    description: "足首や足裏の使いにくさが膝に響く方へ。"
  },
  "足首由来の膝痛": {
    label: "足首の硬さと膝痛",
    href: "/symptoms/ankle-stiffness-knee-pain.html",
    description: "足首や足裏の使いにくさが膝に響く方へ。"
  },
  "腸脛靭帯炎": {
    label: "膝の外側の痛み",
    href: "/symptoms/knee-lateral-pain.html",
    description: "ランニングや歩行で膝の外側が気になる方へ。"
  },
  "膝の裏側の痛み": {
    label: "膝の裏側の痛み",
    href: "/symptoms/knee-posterior-pain.html",
    description: "膝裏の張りや曲げ伸ばしの違和感がある方へ。"
  },
  "鵞足炎": {
    label: "膝の内側の痛み",
    href: "/symptoms/pes-anserine-bursitis.html",
    description: "膝の内側から下にかけて痛みがある方へ。"
  },
  "腰痛": {
    label: "腰痛",
    href: "/symptoms/lower-back-pain.html",
    description: "腰の重さや立ち上がりのつらさがある方へ。"
  },
  "坐骨神経痛": {
    label: "坐骨神経痛",
    href: "/symptoms/sciatica.html",
    description: "お尻から脚にかけての違和感がある方へ。"
  },
  "脊柱管狭窄症": {
    label: "脊柱管狭窄症",
    href: "/symptoms/spinal-stenosis.html",
    description: "歩くとしびれや重だるさが出やすい方へ。"
  },
  "腰椎椎間板ヘルニア": {
    label: "腰椎椎間板ヘルニア",
    href: "/symptoms/lumbar-disc-herniation.html",
    description: "腰から脚にかけて痛みやしびれがある方へ。"
  },
  "椎間板ヘルニア": {
    label: "腰椎椎間板ヘルニア",
    href: "/symptoms/lumbar-disc-herniation.html",
    description: "腰から脚にかけて痛みやしびれがある方へ。"
  },
  "側弯症": {
    label: "側弯症",
    href: "/symptoms/scoliosis.html",
    description: "背骨のカーブや姿勢の左右差が気になる方へ。"
  },
  "脊柱側弯症": {
    label: "側弯症",
    href: "/symptoms/scoliosis.html",
    description: "背骨のカーブや姿勢の左右差が気になる方へ。"
  },
  "変形性股関節症": {
    label: "変形性股関節症",
    href: "/symptoms/hip-osteoarthritis.html",
    description: "股関節の動きづらさも気になる方へ。"
  },
  "頚椎症": {
    label: "頚椎症",
    href: "/symptoms/cervical-spondylosis.html",
    description: "首の痛みやしびれが続く方へ。"
  },
  "胸郭出口症候群": {
    label: "胸郭出口症候群",
    href: "/symptoms/thoracic-outlet.html",
    description: "首肩や腕のしびれが気になる方へ。"
  },
  "手根管症候群": {
    label: "手根管症候群",
    href: "/symptoms/carpal-tunnel.html",
    description: "手のしびれや細かな作業のしにくさがある方へ。"
  },
  "肘の痛み": {
    label: "肘の痛み",
    href: "/symptoms/elbow-tendinopathy.html",
    description: "肘の痛みが慢性的に続く方へ。"
  },
  "足底筋膜炎": {
    label: "足底筋膜炎",
    href: "/symptoms/plantar-fasciitis.html",
    description: "足裏の痛みで歩きづらさがある方へ。"
  }
};

const FAQ_HEADINGS = new Set(["faq", "よくある質問", "よくあるご質問"]);
const ARTICLE_LAYOUTS = new Set(["readable-v2", "readable-v3"]);
const OFF_AXIS_SYMPTOM_HREFS = new Set([
  "/symptoms/shoulder-stiffness.html",
  "/symptoms/frozen-shoulder.html",
  "/symptoms/tmj.html"
]);
const REQUIRED_BLOG_CATEGORIES = [
  {
    slug: "knee-pain",
    name: "膝の痛み",
    description: "階段、歩き始め、正座、腫れなど、膝まわりの不調を動作や場所から整理します。"
  },
  {
    slug: "lower-back-pain",
    name: "腰の痛み",
    description: "朝の腰の重さ、立ち上がり、膝や股関節とのつながりなどを扱います。"
  },
  {
    slug: "hip-pain",
    name: "股関節の痛み",
    description: "歩き始め、寝返り、しゃがみ動作など、股関節まわりの不調を整理します。"
  },
  {
    slug: "foot-walking",
    name: "足・歩き方",
    description: "足裏、足指、足首、歩き方など、足元から膝や腰への負担を見直します。"
  },
  {
    slug: "numbness",
    name: "しびれ",
    description: "坐骨神経痛や足腰のしびれなど、神経まわりの不安を扱います。"
  },
  {
    slug: "exercise-therapy",
    name: "運動療法・セルフケア",
    description: "施術とあわせて、無理なく続けやすい動きづくりやセルフケアをまとめます。"
  },
  {
    slug: "clinic-guidance",
    name: "受診目安・通院",
    description: "医療機関へ相談したい目安や、整体の通い方を考えるための記事です。"
  },
  {
    slug: "neck-shoulder-hand",
    name: "首・肩・腕・手",
    description: "肩こり、五十肩、手のしびれなど、足腰以外の慢性痛記事をまとめます。"
  },
  {
    slug: "food-nutrition",
    name: "食事・栄養",
    description: "足腰の筋力や骨の健康を考えるうえで知っておきたい、日々の食事と栄養の基本をまとめます。"
  }
];

const isCliRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCliRun) {
  await main();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const blogData = await readJson(dataPath);
  validateBlogData(blogData);
  normalizeSiteConfig(blogData.site);
  ensureBlogCategories(blogData);

  const sourceFiles = await collectSourceFiles(args);
  const symptomLookup = buildSymptomLookup(blogData.posts);
  const categoryLookup = buildCategoryLookup(blogData.categories);
  const existingPostsBySlug = new Map(blogData.posts.map((post) => [post.slug, post]));

  await fs.mkdir(seoDir, { recursive: true });
  await fs.mkdir(meoDir, { recursive: true });

  const touchedSlugs = [];
  const deletedSlugs = [];

  for (const fileName of sourceFiles) {
    const absolutePath = path.join(sourceDir, fileName);
    const parsed = await parseSourceFile(absolutePath, { categoryLookup, symptomLookup });
    if (parsed.replaceSlug && parsed.replaceSlug !== parsed.slug) {
      existingPostsBySlug.delete(parsed.replaceSlug);
    }
    const existing = existingPostsBySlug.get(parsed.slug);

    if (parsed.draft) {
      if (existingPostsBySlug.delete(parsed.slug)) {
        deletedSlugs.push(parsed.slug);
      }
      await writeDerivedFiles(parsed, { publish: false });
      continue;
    }

    const post = toBlogPost(parsed, blogData.site, existing);
    existingPostsBySlug.set(post.slug, post);
    touchedSlugs.push(post.slug);
    await writeDerivedFiles(parsed, { publish: true });
  }

  blogData.posts = [...existingPostsBySlug.values()].sort(comparePosts);
  await writeJson(dataPath, blogData);

  console.log(`Updated source posts: ${touchedSlugs.join(", ") || "none"}`);
  if (deletedSlugs.length) {
    console.log(`Removed draft posts from data/blog-posts.json: ${deletedSlugs.join(", ")}`);
  }

  const { buildBlog } = await import("./build-blog.mjs");
  await buildBlog();
}

function parseArgs(argv) {
  let source = "";
  let all = false;

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--all") {
      all = true;
      continue;
    }
    if (value === "--source") {
      source = argv[index + 1] || "";
      index += 1;
      continue;
    }
  }

  if (!all && !source) {
    all = true;
  }

  return { all, source };
}

async function collectSourceFiles(args) {
  if (args.source) {
    const fileName = path.basename(args.source);
    const targetPath = path.join(sourceDir, fileName);
    await fs.access(targetPath);
    return [fileName];
  }

  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md") && !entry.name.startsWith("_"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, "ja"));
}

export async function parseSourceFile(filePath, context) {
  const raw = await fs.readFile(filePath, "utf8");
  const { frontmatter, body } = splitFrontmatter(raw, filePath);
  const meta = parseFrontmatter(frontmatter, filePath);
  const normalized = normalizeSourceBody(body);
  const parsedBody = parseMarkdownBody(normalized);
  const relatedSymptoms = buildRelatedSymptoms(meta.symptoms, context.symptomLookup);

  return {
    filePath,
    fileName: path.basename(filePath),
    slug: required(meta.slug, "slug", filePath),
    replaceSlug: String(meta.replaceSlug || "").trim(),
    title: required(meta.title, "title", filePath),
    date: required(meta.date, "date", filePath),
    updatedDate: meta.updated || meta.updatedDate || meta.date,
    description: required(meta.description, "description", filePath),
    category: resolveCategory(meta.category, context.categoryLookup, filePath),
    region: meta.region || "柏市",
    tags: splitCsv(meta.tags),
    heroImage: meta.heroImage || meta.eyecatch || "",
    heroAlt: String(meta.heroAlt || "").trim(),
    layout: normalizeArticleLayout(meta.layout),
    author: String(meta.author || "").trim(),
    reviewer: String(meta.reviewer || "").trim(),
    reviewedDate: String(meta.reviewedDate || "").trim(),
    parentSymptom: String(meta.parentSymptom || "").trim(),
    relatedSlugs: splitCsv(meta.relatedSlugs),
    searchIntent: String(meta.searchIntent || "").trim(),
    referencePreset: String(meta.referencePreset || "").trim(),
    draft: parseBoolean(meta.draft),
    relatedSymptoms,
    lead: parsedBody.lead,
    sections: parsedBody.sections,
    faq: parsedBody.faq
  };
}

function splitFrontmatter(raw, filePath) {
  const normalized = raw.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`Frontmatter is required: ${filePath}`);
  }
  return {
    frontmatter: match[1],
    body: match[2].trim()
  };
}

function parseFrontmatter(frontmatter, filePath) {
  const meta = {};
  for (const line of frontmatter.split("\n")) {
    if (!line.trim()) continue;
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      throw new Error(`Invalid frontmatter line in ${filePath}: ${line}`);
    }
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    meta[key] = stripQuotes(value);
  }
  return meta;
}

function stripQuotes(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

export function normalizeArticleLayout(value) {
  const layout = String(value || "").trim();
  return ARTICLE_LAYOUTS.has(layout) ? layout : "";
}

function normalizeSourceBody(value) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseMarkdownBody(body) {
  const lines = body.split("\n");
  const leadLines = [];
  const sections = [];
  let currentSection = null;
  let currentSubsection = null;
  let currentFaqQuestion = null;
  let mode = "body";
  const faq = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("## ")) {
      const heading = line.slice(3).trim();
      currentSubsection = null;
      currentFaqQuestion = null;
      if (FAQ_HEADINGS.has(heading.toLowerCase())) {
        mode = "faq";
        currentSection = null;
        continue;
      }
      mode = "body";
      currentSection = createSection(heading);
      sections.push(currentSection);
      continue;
    }

    if (line.startsWith("### ")) {
      const heading = line.slice(4).trim();
      if (mode === "faq") {
        currentFaqQuestion = { question: heading, answers: [] };
        faq.push(currentFaqQuestion);
        continue;
      }
      if (!currentSection) {
        currentSection = createSection("");
        sections.push(currentSection);
      }
      currentSubsection = createSection(heading);
      currentSection.subsections.push(currentSubsection);
      continue;
    }

    if (mode === "faq") {
      if (currentFaqQuestion) {
        currentFaqQuestion.answers.push(line);
      }
      continue;
    }

    const target = currentSubsection || currentSection;

    if (!target) {
      leadLines.push(line);
      continue;
    }

    pushSectionLine(target, line);
  }

  const normalizedSections = sections
    .map(finalizeSection)
    .filter((section) => section.body.length || section.subsections?.length);

  const normalizedFaq = faq
    .map((item) => ({
      question: item.question,
      answer: joinParagraphs(item.answers)
    }))
    .filter((item) => item.question && item.answer);

  return {
    lead: joinParagraphs(leadLines.slice(0, 2)) || "",
    sections: normalizedSections,
    faq: normalizedFaq
  };
}

function createSection(heading) {
  return {
    heading,
    body: [],
    listStyle: "",
    subsections: [],
    rawItems: []
  };
}

function pushSectionLine(target, line) {
  const bulletMatch = line.match(/^[-*]\s+(.+)$/);
  if (bulletMatch) {
    target.rawItems.push({ type: "bullet", value: bulletMatch[1].trim() });
    return;
  }
  target.rawItems.push({ type: "paragraph", value: line });
}

function finalizeSection(section) {
  const onlyBullets = section.rawItems.length > 0 && section.rawItems.every((item) => item.type === "bullet");
  const body = section.rawItems.map((item) => {
    if (!onlyBullets && item.type === "bullet") {
      return `- ${item.value}`;
    }
    return item.value;
  });
  const normalized = {
    heading: section.heading || undefined,
    body,
    listStyle: onlyBullets ? "check" : undefined,
    subsections: section.subsections.map(finalizeSection).filter((item) => item.body.length)
  };

  if (!normalized.subsections.length) {
    delete normalized.subsections;
  }
  if (!normalized.listStyle) {
    delete normalized.listStyle;
  }

  return normalized;
}

function buildRelatedSymptoms(value, symptomLookup) {
  return splitCsv(value)
    .map((label) => symptomLookup.get(label) || DEFAULT_RELATED_SYMPTOMS[label] || createFallbackSymptom(label))
    .filter(isAllowedRelatedSymptom)
    .filter(Boolean);
}

function isAllowedRelatedSymptom(item) {
  if (!item) return false;
  return !OFF_AXIS_SYMPTOM_HREFS.has(String(item.href || ""));
}

function createFallbackSymptom(label) {
  return {
    label,
    href: "/symptoms/",
    description: "関連する症状ページはご相談時にご案内しています。"
  };
}

function buildSymptomLookup(posts) {
  const lookup = new Map(Object.entries(DEFAULT_RELATED_SYMPTOMS));

  for (const post of posts) {
    for (const symptom of post.relatedSymptoms || []) {
      if (!symptom?.label || !symptom?.href) continue;
      if (lookup.has(symptom.label) || symptom.href === "/index.html#symptoms" || symptom.href === "/#symptoms" || symptom.href === "/symptoms/") continue;
      lookup.set(symptom.label, {
        label: symptom.label,
        href: symptom.href,
        description: symptom.description || ""
      });
    }
  }

  return lookup;
}

function buildCategoryLookup(categories) {
  const lookup = new Map();
  for (const category of categories) {
    lookup.set(category.slug, category.slug);
    lookup.set(category.name, category.slug);
  }

  lookup.set("膝の痛み", "knee-pain");
  lookup.set("膝痛", "knee-pain");
  lookup.set("腰の痛み", "lower-back-pain");
  lookup.set("腰痛", "lower-back-pain");
  lookup.set("シビレ", "numbness");
  lookup.set("しびれ", "numbness");
  lookup.set("痺れ", "numbness");
  lookup.set("股関節痛", "hip-pain");
  lookup.set("股関節の痛み", "hip-pain");
  lookup.set("足・歩き方", "foot-walking");
  lookup.set("足裏・歩き方", "foot-walking");
  lookup.set("足裏", "foot-walking");
  lookup.set("歩き方", "foot-walking");
  lookup.set("首・肩・手", "neck-shoulder-hand");
  lookup.set("首・肩・腕・手", "neck-shoulder-hand");
  lookup.set("首肩手", "neck-shoulder-hand");
  lookup.set("運動療法", "exercise-therapy");
  lookup.set("運動療法・セルフケア", "exercise-therapy");
  lookup.set("セルフケア", "exercise-therapy");
  lookup.set("受診目安・通院", "clinic-guidance");
  lookup.set("通院・相談", "clinic-guidance");
  lookup.set("受診目安", "clinic-guidance");
  lookup.set("食事・栄養", "food-nutrition");
  lookup.set("栄養", "food-nutrition");
  lookup.set("食事", "food-nutrition");

  return lookup;
}

function resolveCategory(value, categoryLookup, filePath) {
  const slug = categoryLookup.get(value);
  if (!slug) {
    throw new Error(`Unknown category "${value}" in ${filePath}`);
  }
  return slug;
}

export function toBlogPost(parsed, site, existing = {}) {
  const layout = parsed.layout || existing.layout || "";
  const reviewedDate = parsed.reviewedDate || existing.reviewedDate || "";
  const referencePreset = parsed.referencePreset || existing.referencePreset || "";
  const heroAlt = parsed.heroAlt || existing.heroAlt || parsed.title;
  const author = parsed.author || existing.author || "";
  const reviewer = parsed.reviewer || existing.reviewer || "";
  const parentSymptom = parsed.parentSymptom || existing.parentSymptom || "";
  const relatedSlugs = Array.isArray(parsed.relatedSlugs) && parsed.relatedSlugs.length
    ? parsed.relatedSlugs
    : (existing.relatedSlugs || []);
  const searchIntent = parsed.searchIntent || existing.searchIntent || "";

  return {
    slug: parsed.slug,
    title: parsed.title,
    description: parsed.description,
    date: parsed.date,
    updatedDate: parsed.updatedDate || existing.updatedDate || parsed.date,
    category: parsed.category,
    region: parsed.region,
    tags: parsed.tags,
    eyecatch: parsed.heroImage || existing.eyecatch || site.defaultEyecatch,
    heroAlt,
    ...(layout ? { layout } : {}),
    ...(author ? { author } : {}),
    ...(reviewer ? { reviewer } : {}),
    ...(reviewedDate ? { reviewedDate } : {}),
    ...(parentSymptom ? { parentSymptom } : {}),
    ...(relatedSlugs.length ? { relatedSlugs: [...new Set(relatedSlugs)].filter((slug) => slug !== parsed.slug) } : {}),
    ...(searchIntent ? { searchIntent } : {}),
    ...(referencePreset ? { referencePreset } : {}),
    readingTime: formatReadingTime(parsed),
    relatedSymptoms: parsed.relatedSymptoms,
    lead: parsed.lead || parsed.description,
    sections: parsed.sections,
    faq: parsed.faq,
    cta: sanitizeCta(existing.cta || buildDefaultCta(parsed.category))
  };
}

function sanitizeCta(cta = {}) {
  return Object.fromEntries(
    Object.entries(cta).map(([key, value]) => [
      key,
      typeof value === "string" ? sanitizeStrongWording(value) : value
    ])
  );
}

function sanitizeStrongWording(value) {
  return value
    .replaceAll("根本改善", "体づくり")
    .replaceAll("唯一の方法", "大切な視点")
    .replaceAll("確実に楽", "楽に動ける可能性")
    .replaceAll("再貯留を防ぎます", "再びたまりにくい動き方を目指します")
    .replaceAll("再発を防ぎます", "再発しにくい動き方を目指します")
    .replaceAll("排液を促します", "循環しやすい状態を目指します")
    .replaceAll("効く理由", "役立つ理由");
}

function buildDefaultCta(category) {
  if (category === "exercise-therapy") {
    return {
      heading: "無理のない運動療法から始めたい方へ",
      text: "今の体の状態に合わせて、施術とセルフケアの両面から整理していきます。",
      label: "LINEで相談する",
      href: "https://lin.ee/X01F2mP",
      note: "運動が苦手な方もご相談いただけます。"
    };
  }

  return {
    heading: "膝や腰の痛みが続いて不安な方へ",
    text: "症状や生活動作を一緒に確認しながら、今の状態に合う進め方を整理できます。",
    label: "LINEで相談する",
    href: "https://lin.ee/X01F2mP",
    note: "来院前のご相談も受け付けています。"
  };
}

function formatReadingTime(parsed) {
  const text = [
    parsed.title,
    parsed.description,
    parsed.lead,
    ...parsed.sections.flatMap(flattenSectionText),
    ...parsed.faq.flatMap((item) => [item.question, item.answer])
  ].join("");
  const minutes = Math.max(2, Math.ceil(text.length / 500));
  return `約${minutes}分`;
}

function flattenSectionText(section) {
  const values = [...section.body];
  if (section.subsections) {
    for (const subsection of section.subsections) {
      values.push(subsection.heading || "", ...subsection.body);
    }
  }
  return values;
}

async function writeDerivedFiles(parsed, options) {
  const stem = path.basename(parsed.fileName, ".md");
  const seoPath = path.join(seoDir, `${stem}.md`);
  const meoPath = path.join(meoDir, `${stem}.txt`);

  const seoContent = buildSeoMarkdown(parsed, options.publish);
  const meoContent = buildMeoText(parsed, options.publish);

  await fs.writeFile(seoPath, seoContent, "utf8");
  await fs.writeFile(meoPath, meoContent, "utf8");
}

function buildSeoMarkdown(parsed, publish) {
  const lines = [
    `# ${parsed.title}`,
    "",
    `- slug: ${parsed.slug}`,
    `- date: ${parsed.date}`,
    `- updated: ${parsed.updatedDate || parsed.date}`,
    `- category: ${parsed.category}`,
    `- region: ${parsed.region}`,
    `- status: ${publish ? "publish" : "draft"}`,
    `- description: ${parsed.description}`,
    parsed.tags.length ? `- tags: ${parsed.tags.join(" / ")}` : "",
    parsed.relatedSymptoms.length ? `- symptoms: ${parsed.relatedSymptoms.map((item) => item.label).join(" / ")}` : "",
    "",
    parsed.lead,
    ""
  ].filter(Boolean);

  for (const section of parsed.sections) {
    if (section.heading) {
      lines.push(`## ${section.heading}`);
    }
    for (const item of section.body) {
      lines.push(section.listStyle === "check" ? `- ${item}` : item);
    }
    if (section.subsections) {
      for (const subsection of section.subsections) {
        lines.push("", `### ${subsection.heading}`);
        for (const item of subsection.body) {
          lines.push(subsection.listStyle === "check" ? `- ${item}` : item);
        }
      }
    }
    lines.push("");
  }

  if (parsed.faq.length) {
    lines.push("## よくあるご質問", "");
    for (const item of parsed.faq) {
      lines.push(`### ${item.question}`, item.answer, "");
    }
  }

  return `${lines.join("\n").trim()}\n`;
}

function buildMeoText(parsed, publish) {
  const lines = [
    `タイトル: ${parsed.title}`,
    `公開状態: ${publish ? "publish" : "draft"}`,
    `公開日: ${parsed.date}`,
    `説明: ${parsed.description}`,
    parsed.relatedSymptoms.length ? `関連症状: ${parsed.relatedSymptoms.map((item) => item.label).join("、")}` : "",
    "",
    parsed.lead
  ].filter(Boolean);

  for (const section of parsed.sections) {
    if (section.heading) {
      lines.push("", `【${section.heading}】`);
    }
    for (const item of section.body) {
      lines.push(item);
    }
    if (section.subsections) {
      for (const subsection of section.subsections) {
        lines.push("", `${subsection.heading}`);
        for (const item of subsection.body) {
          lines.push(item);
        }
      }
    }
  }

  return `${lines.join("\n").trim()}\n`;
}

function splitCsv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBoolean(value) {
  return String(value || "").toLowerCase() === "true";
}

function joinParagraphs(lines) {
  return lines.join("\n\n").trim();
}

function comparePosts(left, right) {
  return right.date.localeCompare(left.date) || right.slug.localeCompare(left.slug);
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function validateBlogData(data) {
  if (!data?.site || !Array.isArray(data?.categories) || !Array.isArray(data?.posts)) {
    throw new Error("data/blog-posts.json must include site, categories, and posts.");
  }
}

function ensureBlogCategories(blogData) {
  const existingBySlug = new Map((blogData.categories || []).map((category) => [category.slug, category]));
  const requiredSlugs = new Set(REQUIRED_BLOG_CATEGORIES.map((category) => category.slug));
  const orderedRequired = REQUIRED_BLOG_CATEGORIES.map((category) => ({
    ...existingBySlug.get(category.slug),
    ...category
  }));
  const remainingExisting = (blogData.categories || []).filter((category) => !requiredSlugs.has(category.slug));
  blogData.categories = [...orderedRequired, ...remainingExisting];
}

function normalizeSiteConfig(site) {
  if (!site || typeof site !== "object") return;
  if (site.contactAnchor === "/index.html#contact") {
    site.contactAnchor = "/#contact";
  }
  if (!site.defaultEyecatch || site.defaultEyecatch === "/image/medical-interview.webp") {
    site.defaultEyecatch = "/image/knee-symptom-wide.webp";
  }
}

function required(value, fieldName, filePath) {
  if (!String(value || "").trim()) {
    throw new Error(`Missing required field "${fieldName}" in ${filePath}`);
  }
  return String(value).trim();
}
