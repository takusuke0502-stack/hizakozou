import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const siteOrigin = "https://hizakozou.jp";

export async function checkBlogLinks({ rootDir = process.cwd() } = {}) {
  const blogDir = path.join(rootDir, "blog");
  const pages = [path.join(blogDir, "index.html"), ...(await collectPostPages(blogDir))];
  const errors = [];
  let checked = 0;

  for (const pagePath of pages) {
    const html = await fs.readFile(pagePath, "utf8");
    const pageUrl = pathToSiteUrl(rootDir, pagePath);
    const references = extractLocalReferences(html);

    for (const reference of references) {
      const result = await validateReference(rootDir, pagePath, pageUrl, reference);
      checked += 1;
      if (result) errors.push(result);
    }
  }

  if (errors.length) {
    throw new Error(`ブログ内リンク検査で${errors.length}件の問題が見つかりました。\n${errors.join("\n")}`);
  }

  return { pages: pages.length, checked };
}

async function collectPostPages(blogDir) {
  const postsDir = path.join(blogDir, "posts");
  const entries = await fs.readdir(postsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(postsDir, entry.name, "index.html"))
    .sort((left, right) => left.localeCompare(right, "en"));
}

function extractLocalReferences(html) {
  const values = [];
  for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
    values.push(match[1]);
  }
  for (const match of html.matchAll(/\bsrcset=["']([^"']+)["']/gi)) {
    for (const candidate of match[1].split(",")) {
      values.push(candidate.trim().split(/\s+/)[0]);
    }
  }
  return [...new Set(values)].filter(Boolean);
}

async function validateReference(rootDir, pagePath, pageUrl, reference) {
  if (/^(?:https?:)?\/\//i.test(reference) && !reference.startsWith(siteOrigin)) return "";
  if (/^(?:mailto:|tel:|javascript:|data:)/i.test(reference)) return "";

  let url;
  try {
    url = new URL(reference, pageUrl);
  } catch {
    return `${relative(rootDir, pagePath)}: URLを解釈できません (${reference})`;
  }
  if (url.origin !== siteOrigin) return "";

  const decodedPath = decodeURIComponent(url.pathname);
  const targetPath = decodedPath.endsWith("/")
    ? path.join(rootDir, decodedPath.slice(1), "index.html")
    : path.join(rootDir, decodedPath.slice(1));
  const resolvedRoot = path.resolve(rootDir);
  const resolvedTarget = path.resolve(targetPath);
  if (!resolvedTarget.startsWith(`${resolvedRoot}${path.sep}`) && resolvedTarget !== resolvedRoot) {
    return `${relative(rootDir, pagePath)}: サイト外を参照しています (${reference})`;
  }

  try {
    const stat = await fs.stat(resolvedTarget);
    if (!stat.isFile()) throw new Error("not a file");
  } catch {
    return `${relative(rootDir, pagePath)}: リンク先が存在しません (${reference})`;
  }

  if (url.hash && resolvedTarget.endsWith(".html")) {
    const id = decodeURIComponent(url.hash.slice(1));
    const targetHtml = resolvedTarget === pagePath ? await fs.readFile(pagePath, "utf8") : await fs.readFile(resolvedTarget, "utf8");
    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!new RegExp(`(?:id|name)=["']${escapedId}["']`).test(targetHtml)) {
      return `${relative(rootDir, pagePath)}: ページ内リンク先がありません (${reference})`;
    }
  }

  return "";
}

function pathToSiteUrl(rootDir, pagePath) {
  const relativePath = relative(rootDir, pagePath).replace(/\/index\.html$/, "/");
  return new URL(`/${relativePath}`, siteOrigin);
}

function relative(rootDir, targetPath) {
  return path.relative(rootDir, targetPath).replaceAll("\\", "/");
}

const isCliRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCliRun) {
  const result = await checkBlogLinks();
  console.log(`Checked ${result.checked} local references across ${result.pages} blog page(s).`);
}
