import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

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
