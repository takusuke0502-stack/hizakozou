import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { displayDate, normalizeNotices } from './site-notice-model.js';

export const servicePages = [
  'index.html', 'staff.html', 'voices.html', 'access.html', 'msm.html', 'news.html', 'privacy.html',
  'symptoms/index.html', 'symptoms/knee-pain.html', 'symptoms/lower-back-pain.html',
  'symptoms/sciatica.html', 'symptoms/hip-osteoarthritis.html', 'symptoms/spinal-stenosis.html'
];
const root = fileURLToPath(new URL('../', import.meta.url));
const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const attributes = notice => `data-site-notice-item data-published-on="${notice.publishedOn}" data-ends-on="${notice.endsOn}" hidden`;
const period = notice => `<time datetime="${notice.startsOn}">${displayDate(notice.startsOn)}</time>${notice.startsOn === notice.endsOn ? '' : `〜<time datetime="${notice.endsOn}">${displayDate(notice.endsOn)}</time>`}`;

export function renderNotices(notices, archive = false) {
  const enabled = notices.filter(notice => notice.enabled);
  if (archive) return `<section class="dated-notices" aria-labelledby="dated-notices-title" data-site-notices="archive">
  <h2 id="dated-notices-title">日付付きのお知らせ</h2>
  <p class="dated-notices__intro">休診・設備点検など、ご来院に関わるご案内です。対象日をご確認ください。</p>
  <p class="dated-notices__empty" data-notice-empty>日付付きのお知らせは掲載されていません。予約状況はLINEまたはお電話でお問い合わせください。</p>
  <ul class="dated-notices__list">${enabled.map(notice => `<li id="notice-${notice.id}" ${attributes(notice)}><p class="dated-notices__published">掲載日：<time datetime="${notice.publishedOn}">${displayDate(notice.publishedOn)}</time></p><h3>${escape(notice.title)}</h3><p class="dated-notices__period">対象日：${period(notice)}</p><p class="dated-notices__message">${escape(notice.message)}</p></li>`).join('\n')}</ul>
  <noscript><p>日付付きのお知らせの表示にはJavaScriptが必要です。最新のご案内はLINEまたはお電話でお問い合わせください。</p></noscript>
</section>`;
  return `<aside class="site-notice-strip" aria-label="ご来院前のお知らせ" data-site-notices="active" data-notice-limit="3" hidden><div class="site-notice-strip__inner"><p>ご来院前のお知らせ</p><ul>${enabled.map(notice => `<li ${attributes(notice)}><a href="/news.html#notice-${notice.id}"><span class="site-notice-strip__date">${period(notice)}</span><span>${escape(notice.title)}</span><span aria-hidden="true">→</span></a></li>`).join('\n')}</ul></div></aside>`;
}

export function addFaqNavigation(html) {
  return html.replace(/<nav\b[^>]*aria-label="(?:主要メニュー|スマートフォンメニュー|フッターメニュー)"[^>]*>[\s\S]*?<\/nav>/g, nav => {
    if (nav.includes('href="/faq.html"')) return nav;
    return nav.replace(/(<a href="\/#first-visit"[^>]*>初回の流れ・料金<\/a>)/, '$1\n<a href="/faq.html">よくある質問</a>');
  });
}

function replaceBlock(html, name, markup, insertAt) {
  const block = `<!-- ${name}_START -->\n${markup}\n<!-- ${name}_END -->`;
  const pattern = new RegExp(`<!-- ${name}_START -->[\\s\\S]*?<!-- ${name}_END -->`);
  if (pattern.test(html)) return html.replace(pattern, () => block);
  if (!html.includes(insertAt)) throw new Error(`${name}: 挿入先が見つかりません。`);
  return html.replace(insertAt, `${block}\n${insertAt}`);
}

export function updateServicePage(file, html, notices) {
  if (!html.includes('data-site-layout="redesign-v1"')) throw new Error(`${file}: 現行レイアウトではありません。`);
  let next = addFaqNavigation(html);
  if (file === 'index.html') {
    for (const [legacy, current] of [['seo-guide','method'], ['msm-method','method'], ['knee-msm-reasons','features']]) {
      if (!next.includes(`id="${legacy}"`)) next = next.replace(`<span id="${current}"`, `<span id="${legacy}" class="route-anchor" aria-hidden="true"></span><span id="${current}"`);
    }
    next = replaceBlock(next, 'FAQ_ENTRY', '<p class="faq-entry"><a href="/faq.html">服装・通院・予約変更など、よくある質問を見る <span aria-hidden="true">→</span></a></p>', '    <section class="section trust"');
  }
  if (['index.html', 'access.html', 'news.html'].includes(file)) {
    next = next.replaceAll('/scripts/site-notices.mjs?', '/scripts/site-notices.js?');
    if (!next.includes('href="/styles/site-updates.css')) next = next.replace('</head>', '<link rel="stylesheet" href="/styles/site-updates.css?v=20261004a">\n<script type="module" src="/scripts/site-notices.js?v=20261004a"></script>\n</head>');
    if (file === 'news.html') {
      next = replaceBlock(next, 'DATED_NOTICES', renderNotices(notices, true), '        <ul class="news-index__list">');
    } else {
      const block = `<!-- ACTIVE_NOTICES_START -->\n${renderNotices(notices)}\n<!-- ACTIVE_NOTICES_END -->`;
      const pattern = /<!-- ACTIVE_NOTICES_START -->[\s\S]*?<!-- ACTIVE_NOTICES_END -->/;
      next = pattern.test(next) ? next.replace(pattern, () => block) : next.replace('</header>', `</header>\n${block}`);
    }
  }
  return next;
}

export async function buildSiteUpdates(siteRoot = root) {
  const manifest = JSON.parse(await readFile(path.join(siteRoot, 'data/site-notices.json'), 'utf8'));
  const notices = normalizeNotices(manifest);
  for (const file of servicePages) {
    const target = path.join(siteRoot, file);
    const original = await readFile(target, 'utf8');
    const next = updateServicePage(file, original, notices);
    if (next !== original) await writeFile(target, next, 'utf8');
  }
  const faqPath = path.join(siteRoot, 'faq.html');
  const faq = await readFile(faqPath, 'utf8');
  const fixed = faq.replaceAll('index.html#seo-guide', '/#method')
    .replaceAll('index.html#msm-method', '/#method')
    .replaceAll('index.html#knee-msm-reasons', '/#features');
  if (fixed !== faq) await writeFile(faqPath, fixed, 'utf8');
  return notices.length;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const count = await buildSiteUpdates();
  console.log(`FAQの入口・旧リンク・お知らせを更新しました（登録${count}件）。`);
}
