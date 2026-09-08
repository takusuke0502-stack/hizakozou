import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('symptoms/lower-back-pain.html', root), 'utf8');
const css = readFileSync(new URL('styles/lower-back-editorial.css', root), 'utf8');

test('editorial trial is loaded on the lumbar page only', () => {
  assert.match(html, /<body class="lb-editorial">/);
  assert.match(html, /href="\.\.\/styles\/lower-back-editorial\.css\?v=/);
  for (const name of readdirSync(new URL('symptoms/', root)).filter(name => name.endsWith('.html') && name !== 'lower-back-pain.html')) {
    assert.doesNotMatch(readFileSync(new URL(`symptoms/${name}`, root), 'utf8'), /lower-back-editorial\.css/);
  }
  assert.doesNotMatch(readFileSync(new URL('index.html', root), 'utf8'), /lower-back-editorial\.css/);
});

test('the original responsive lumbar hero is restored while the editorial body remains', () => {
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.match(html, /<h1 class="symptom-image-hero__sr-title">腰痛・ぎっくり腰<\/h1>/);
  const hero = html.match(/<section class="symptom-image-hero"[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.match(hero, /腰痛・ギックリ腰-optimized\.webp/);
  assert.match(hero, /腰痛・ギックリ腰-sp-480\.webp 480w/);
  assert.match(hero, /腰痛・ギックリ腰-sp-768\.webp 768w/);
  assert.match(hero, /fetchpriority="high"/);
  assert.doesNotMatch(hero, /generated_images|loading="lazy"/);
  assert.doesNotMatch(html, /class="lb-editorial-hero"|まずはお聞かせください。/);
  for (const [, asset] of hero.matchAll(/(?:src|srcset)="([^" ]+)/g)) {
    assert.ok(existsSync(new URL(asset, new URL('symptoms/', root))), `missing hero asset: ${asset}`);
  }
});

test('the original eight concerns lead into retained visit steps and medical guidance', () => {
  const concerns = html.match(/<section id="troubles"[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.match(concerns, /こんなお悩みを抱えていませんか？/);
  assert.equal((concerns.match(/<li>/g) ?? []).length, 8);
  assert.match(concerns, /<strong>慢性的な腰痛<\/strong>/);
  const steps = html.match(/<ol class="lb-editorial-steps[\s\S]*?<\/ol>/)?.[0] ?? '';
  assert.equal((steps.match(/<li>/g) ?? []).length, 3);
  const positions = ['お話を伺う', '身体の動きを確認する', '方針をお伝えする'].map(label => steps.indexOf(label));
  assert.ok(positions.every(position => position >= 0));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  assert.match(steps, /data-photo-slot="assessment"/);
  assert.match(steps, /src="\.\.\/image\/flow-movement-assessment-768\.webp"[^>]*width="768" height="576"/);
  const medical = html.match(/<aside class="lb-editorial-medical"[\s\S]*?<\/aside>/)?.[0] ?? '';
  assert.match(medical, /足の脱力や排尿・排便の異常/);
  assert.match(medical, /先に医療機関へご相談ください/);
  assert.ok(html.indexOf(medical) < html.indexOf('<!-- LOWER_BACK_EDUCATION_START -->'));
});

test('photos, unique fragment targets, detailed information and real contact routes remain available', () => {
  for (const asset of ['flow-plan-consultation-768.webp', 'flow-movement-assessment-768.webp', 'hizakozou-logo-option2-mark.webp']) {
    assert.ok(existsSync(new URL(`image/${asset}`, root)));
  }
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, 'IDs must be unique');
  for (const [, fragment] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(fragment), `missing #${fragment}`);
  for (const id of ['lb-cause-title', 'lb-medical-title', 'lower-back-pain-trust-title', 'faq', 'flow', 'price', 'access', 'contactForm', 'menuBtn', 'mobileNav']) assert.ok(ids.includes(id), `preserve #${id}`);
  const contact = html.match(/<div class="mobile-cta">[\s\S]*?<script src="site-header\.js"/)?.[0] ?? '';
  assert.match(contact, /href="tel:0471143274"/);
  assert.match(contact, /href="https:\/\/lin\.ee\/X01F2mP"/);
  assert.match(contact, /電話で予約/);
  assert.match(contact, /LINEで相談/);
  assert.match(html, /<script src="site-header\.js" defer><\/script>/);
});

test('mobile styles retain responsive photographs, visible focus and safe-area contact padding', () => {
  assert.match(css, /object-fit: cover/);
  assert.match(css, /width: min\(100% - 44px, 760px\)/);
  assert.match(css, /focus-visible/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.doesNotMatch(css, /\.troubles-check/);
});
