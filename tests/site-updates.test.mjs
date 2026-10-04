import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { normalizeNotices, isNoticeVisible, japanDate, isDate } from '../scripts/site-notice-model.js';
import { updateNotices } from '../scripts/site-notices.js';
import { servicePages, updateServicePage, renderNotices } from '../scripts/build-site-updates.mjs';

const root = new URL('../', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');
const productionNotices = normalizeNotices(JSON.parse(read('data/site-notices.json')));
const example = (changes = {}) => ({
  id: 'test-equipment', enabled: true, publishedOn: '2026-10-01',
  startsOn: '2026-10-04', endsOn: '2026-10-04',
  title: '【表示検証用】設備点検', message: '検証用の架空の案内です。実際の予定ではありません。', ...changes
});
const normalize = items => normalizeNotices({ version: 1, notices: items });

test('manifest accepts no notices without inventing a schedule', () => {
  assert.deepEqual(normalize([]), []);
  // Future real notices must be allowed without changing the test contract.
  assert(productionNotices.every(item => item.id !== 'test-equipment' && !item.title.includes('表示検証用')));
});
test('date validation rejects impossible dates and ambiguous input', () => {
  for (const date of ['2026-02-29','2026-04-31','2026-1-01','2026/10/04',null]) assert.equal(isDate(date), false);
  assert.equal(isDate('2028-02-29'), true);
});
test('Japan date is independent of the visitor time zone at midnight', () => {
  assert.equal(japanDate(new Date('2026-10-04T14:59:59Z')), '2026-10-04');
  assert.equal(japanDate(new Date('2026-10-04T15:00:00Z')), '2026-10-05');
});
test('notices show from publication through the inclusive event end', () => {
  const [item] = normalize([example()]);
  assert.equal(isNoticeVisible(item, '2026-09-30'), false);
  assert.equal(isNoticeVisible(item, '2026-10-01'), true);
  assert.equal(isNoticeVisible(item, '2026-10-04'), true);
  assert.equal(isNoticeVisible(item, '2026-10-05'), false);
  assert.equal(isNoticeVisible(item, '2026-10-05', true), true);
});
test('disabled and future publication entries do not appear even in the archive', () => {
  assert.equal(isNoticeVisible(example({enabled:false}), '2026-10-04', true), false);
  assert.equal(isNoticeVisible(example({publishedOn:'2026-10-10'}), '2026-10-04', true), false);
});
test('malformed manifest, duplicate IDs, bad ranges and empty text fail before generation', () => {
  assert.throws(() => normalizeNotices({version:2, notices:[]}));
  for (const item of [example({id:'../x'}), example({enabled:'true'}), example({endsOn:'2026-09-01'}), example({startsOn:'2026-02-30'}), example({title:''}), example({message:null})]) assert.throws(() => normalize([item]));
  assert.throws(() => normalize([example(), example()]));
});
test('notices are newest first and titles/messages are escaped rather than executable HTML', () => {
  const list = normalize([example(), example({id:'later',publishedOn:'2026-10-03',title:'<script>alert(1)</script>',message:'<img src=x onerror=alert(1)> & "text"'})]);
  assert.equal(list[0].id, 'later');
  const html = renderNotices(list, true);
  assert(html.includes('&lt;script&gt;'));
  assert(html.includes('&lt;img'));
  assert.doesNotMatch(html, /<script>|<img/);
  assert(!renderNotices(normalize([example({enabled:false})])).includes('test-equipment'));
});

function group(items, archive = false) {
  const nodes = items.map(item => ({dataset:{publishedOn:item.publishedOn,endsOn:item.endsOn},hidden:true}));
  const empty = {hidden:false};
  return {dataset:{siteNotices:archive?'archive':'active',noticeLimit:'3'},hidden:true,nodes,empty,
    querySelectorAll: () => nodes, querySelector: () => archive ? empty : null};
}
test('active strips stay hidden when there are no applicable notices', () => {
  const g = group([example({publishedOn:'2026-10-10'}),example({endsOn:'2026-10-02'})]);
  updateNotices({querySelectorAll:()=>[g]}, new Date('2026-10-04T00:00:00Z'));
  assert.equal(g.hidden, true);
  assert(g.nodes.every(item=>item.hidden));
});
test('active strip limits items without losing an active entry behind future entries', () => {
  const g = group([example({publishedOn:'2026-10-10'}),example(),example(),example(),example()]);
  updateNotices({querySelectorAll:()=>[g]}, new Date('2026-10-04T00:00:00Z'));
  assert.equal(g.hidden,false);
  assert.deepEqual(g.nodes.map(item=>item.hidden),[true,false,false,false,true]);
});
test('midnight removes finished strips while preserving news history', () => {
  const active = group([example()]), archive = group([example()],true);
  const document = {querySelectorAll:()=>[active,archive]};
  updateNotices(document, new Date('2026-10-04T14:59:59Z'));
  assert.equal(active.nodes[0].hidden,false);
  updateNotices(document, new Date('2026-10-04T15:00:00Z'));
  assert.equal(active.hidden,true);
  assert.equal(archive.hidden,false);
  assert.equal(archive.nodes[0].hidden,false);
  assert.equal(archive.empty.hidden,true);
});
test('empty archive says not published rather than claiming the clinic is open', () => {
  const g = group([],true);
  updateNotices({querySelectorAll:()=>[g]}, new Date('2026-10-04T00:00:00Z'));
  assert.equal(g.hidden,false); assert.equal(g.empty.hidden,false);
  assert.match(renderNotices([],true),/掲載されていません/);
});

for (const page of servicePages) {
  test(`${page}: FAQ is reachable from all three common navigation menus`, () => {
    const html = read(page);
    const navs = [...html.matchAll(/<nav\b[^>]*aria-label="(?:主要メニュー|スマートフォンメニュー|フッターメニュー)"[^>]*>[\s\S]*?<\/nav>/g)];
    assert.equal(navs.length,3);
    for (const nav of navs) assert.equal((nav[0].match(/href="\/faq.html"/g)||[]).length,1);
    assert.equal(updateServicePage(page,html,productionNotices),html,'generation is idempotent');
  });
}
test('old article links and FAQ menu links target the current explanations', () => {
  const html = read('index.html');
  for (const id of ['seo-guide','msm-method','knee-msm-reasons']) assert.equal((html.match(new RegExp(`id="${id}"`,'g'))||[]).length,1);
  const faq = read('faq.html');
  assert.doesNotMatch(faq, /index\.html#(?:seo-guide|msm-method|knee-msm-reasons)/);
  assert.match(faq, /href="\/#method"/); assert.match(faq,/href="\/#features"/);
});
test('FAQ shortcut is near first-visit pricing, not a duplicate FAQ section', () => {
  const html = read('index.html');
  assert(html.indexOf('FAQ_ENTRY_START') > html.indexOf('id="price"'));
  assert(html.indexOf('FAQ_ENTRY_START') < html.indexOf('class="section trust"'));
  assert.equal((html.match(/FAQ_ENTRY_START/g)||[]).length,1);
});
test('home/access strips and dated news use shared CSS and local-only runtime', () => {
  for (const page of ['index.html','access.html','news.html']) {
    assert.match(read(page), /src="\/scripts\/site-notices.js/);
    assert.match(read(page), /href="\/styles\/site-updates.css/);
  }
  assert.doesNotMatch(read('scripts/site-notices.js'),/fetch\s*\(|setInterval\s*\(/);
  assert.match(read('scripts/site-notices.js'),/visibilitychange/);
});

// Separate visual fixture: never changes the manifest or publishes a fake schedule.
test('generate explicitly labeled notice fixtures for browser checks', async () => {
  const output = new URL('output/site-updates-preview/',root);
  await mkdir(output,{recursive:true});
  const fixtures = normalize([example({endsOn:'2026-10-20',message:'表示確認用です。9〜12時はエレベーターが利用できない想定の案内です。実際の予定ではありません。'})]);
  for (const page of ['index.html','access.html','news.html']) {
    const html = await readFile(new URL(page,root),'utf8');
    await writeFile(new URL(page,output),updateServicePage(page,html,fixtures),'utf8');
  }
});
