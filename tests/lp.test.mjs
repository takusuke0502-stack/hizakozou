import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("LP hero makes common knee-pain situations visible immediately", () => {
  const heroEnd = html.indexOf("<section class=\"py-10 bg-slate-50 border-y border-slate-200\">");
  assert.ok(heroEnd > -1, "hero support band should exist");
  const hero = html.slice(0, heroEnd);

  assert.match(hero, /柏市で、歩くたびにつらい膝痛に。/);
  assert.match(hero, /階段の上り下りがつらい/);
  assert.match(hero, /歩き始めに膝が痛む/);
  assert.match(hero, /膝に水が溜まる/);
});

test("LP places first-visit reassurance before the price offer", () => {
  const firstVisitIndex = html.indexOf('id="first-visit-policy"');
  const priceIndex = html.indexOf('id="price"');

  assert.ok(firstVisitIndex > -1, "first-visit policy section should exist");
  assert.ok(priceIndex > -1, "price section should exist");
  assert.ok(firstVisitIndex < priceIndex, "first-visit reassurance should appear before pricing");
  assert.match(html, /説明なしに強い施術をしない/);
  assert.match(html, /その場で長期契約を迫らない/);
});

test("LP adds knee-pain type navigation before the broad symptom list", () => {
  const typeNavIndex = html.indexOf('id="knee-type-nav"');
  const symptomsIndex = html.indexOf('id="symptoms"');

  assert.ok(typeNavIndex > -1, "knee-pain type navigation should exist");
  assert.ok(symptomsIndex > -1, "symptoms section should exist");
  assert.ok(typeNavIndex < symptomsIndex, "type navigation should guide users before the full symptom list");
  assert.match(html, /階段で痛い/);
  assert.match(html, /膝の裏が張る/);
});

test("LP links lumbar disc herniation to its own symptom page", () => {
  assert.ok(
    existsSync(new URL("../symptoms/lumbar-disc-herniation.html", import.meta.url)),
    "lumbar disc herniation symptom page should exist"
  );
  assert.match(html, /href="symptoms\/lumbar-disc-herniation\.html"[^>]*>腰椎椎間板ヘルニア/);
  assert.doesNotMatch(html, /href="symptoms\/spinal-stenosis\.html"[^>]*>腰椎椎間板ヘルニア/);
});

test("LP links scoliosis to its own symptom page with the x-ray image", () => {
  assert.ok(
    existsSync(new URL("../symptoms/scoliosis.html", import.meta.url)),
    "scoliosis symptom page should exist"
  );
  assert.ok(
    existsSync(new URL("../image/レントゲン/側弯症XP.webp", import.meta.url)),
    "scoliosis x-ray image should be available as webp"
  );
  assert.match(html, /href="symptoms\/scoliosis\.html"[^>]*>側弯症/);
});
