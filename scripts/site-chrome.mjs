import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();
export const primaryNavigation = [
  ["/", "TOP"], ["/symptoms/knee-pain.html", "膝の痛みについて"],
  ["/#first-visit", "初回の流れ・料金"], ["/msm.html", "施術について（MSMメソッド）"],
  ["/staff.html", "院長紹介"], ["/access.html", "アクセス・道順"], ["/faq.html", "よくある質問"]
];
const moreNavigation = [["/voices.html", "患者様のお声"], ["/symptoms/", "症状別ページ"], ["/blog/", "コラム"], ["/news.html", "お知らせ"]];
const links = (items, current = "") => items.map(([href, label]) => `<a href="${href}"${href === current ? ' aria-current="page"' : ""}>${label}</a>`).join("\n");

export async function loadSiteChrome() {
  const [header, footer, contact] = await Promise.all(["header", "footer", "contact"].map(name => fs.readFile(path.join(root, "templates", `site-${name}.html`), "utf8")));
  return {header, footer: footer.replace("{{FOOTER_NAV}}", links([...primaryNavigation, ...moreNavigation]) + '\n<a href="/#contact">お問い合わせ</a>'), contact};
}
export function renderSiteHeader(chrome, current = "") {
  return chrome.header.replace("{{PRIMARY_NAV}}", links(primaryNavigation, current)).replace("{{MOBILE_NAV}}", links([...primaryNavigation, ...moreNavigation], current) + '\n<a href="/#contact">メールで問い合わせる</a>\n<a href="https://lin.ee/X01F2mP" target="_blank" rel="noopener noreferrer">LINEで相談・予約</a>\n<a href="tel:0471143274">電話で相談</a>');
}
export async function buildSiteChrome() {
  const chrome = await loadSiteChrome();
  const dirs = [root, path.join(root, "symptoms")];
  let changed = 0;
  for (const dir of dirs) {
    for (const file of (await fs.readdir(dir)).filter(file => file.endsWith(".html"))) {
      const full = path.join(dir, file);
      const before = await fs.readFile(full, "utf8");
      if (!/<header\b[^>]*class="[^"]*(?:site-header|clinic-header)/.test(before)) continue;
      const current = dir === root && file === "index.html" ? "/" : "/" + path.relative(root, full).replaceAll("\\", "/");
      let after = before.replace(/<header\b[^>]*class="[^"]*(?:site-header|clinic-header)[^"]*"[^>]*>[\s\S]*?<\/header>/, renderSiteHeader(chrome, current).trimEnd()).replace(/<footer\b[\s\S]*?<\/footer>/, chrome.footer.trimEnd());
      // Two legacy pages stored the lower navigation outside their header element.
      after = after.replace(/(<\/header>)\s*<div class="site-header__lower">[\s\S]*?(?=<main\b)/, "$1\n");
      if (!after.includes('/styles/site-chrome.css')) after = after.replace("</head>", '  <link rel="stylesheet" href="/styles/site-chrome.css?v=20261104a">\n  <script src="/scripts/site-chrome.js?v=20261104a" defer></script>\n</head>');
      if (after !== before) {await fs.writeFile(full, after, "utf8"); changed++;}
    }
  }
  return changed;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(`Updated common navigation on ${await buildSiteChrome()} page(s).`);
