import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pages = [
  {
    file: "sciatica.html",
    factorId: "sciatica-factors-title",
    image:
      "sciatica-buttock-leg/sciatica-buttock-leg-factors",
  },
  {
    file: "spinal-stenosis.html",
    factorId: "stenosis-factors-title",
    image:
      "lumbar-spinal-stenosis-walking/lumbar-spinal-stenosis-walking-factors",
  },
  {
    file: "lumbar-disc-herniation.html",
    factorId: "disc-factors-title",
    image:
      "lumbar-disc-herniation-leg-symptoms/lumbar-disc-herniation-leg-symptoms-factors",
  },
  {
    file: "hip-osteoarthritis.html",
    factorId: "hip-factors-title",
    image:
      "hip-osteoarthritis-groin-pain/hip-osteoarthritis-groin-pain-factors",
  },
  {
    file: "knee-osteoarthritis.html",
    factorId: "knee-factors-title",
    image:
      "knee-osteoarthritis-daily-movement/knee-osteoarthritis-daily-movement-factors",
  },
  {
    file: "plantar-fasciitis.html",
    factorId: "plantar-factors-title",
    image:
      "plantar-fasciitis-first-step-pain/plantar-fasciitis-first-step-pain-factors",
  },
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

for (const page of pages) {
  test(`${page.file} shows a responsive context figure after its factor list`, () => {
    const html = readFileSync(
      new URL(`../symptoms/${page.file}`, import.meta.url),
      "utf8",
    );
    const sectionStart = html.indexOf(`aria-labelledby="${page.factorId}"`);
    const sectionEnd = html.indexOf("</section>", sectionStart);
    const section = html.slice(sectionStart, sectionEnd);
    const imagePath = `../image/blog/${page.image}`;

    assert.ok(sectionStart > -1, "factor section should exist");
    assert.ok(section.includes('class="symptom-context-figure"'));
    assert.ok(
      section.indexOf('class="symptom-context-figure"') >
        section.indexOf("factor-grid"),
      "figure should follow the factor grid",
    );
    assert.match(
      section,
      new RegExp(
        `srcset="${escapeRegExp(imagePath)}-480\\.webp"[\\s\\S]*srcset="${escapeRegExp(imagePath)}-768\\.webp"[\\s\\S]*src="${escapeRegExp(imagePath)}-1200\\.webp"`,
      ),
    );
    assert.match(section, /loading="lazy" decoding="async" width="1200" height="800"/);
    assert.match(section, /target="_blank" rel="noopener"/);
    assert.match(html, /href="site-content-figures\.css"/);
  });
}

test("shared symptom figure styles stay open and readable on mobile", () => {
  const css = readFileSync(
    new URL("../symptoms/site-content-figures.css", import.meta.url),
    "utf8",
  );

  assert.match(css, /\.symptom-context-figure\s*{[\s\S]*margin:/);
  assert.match(css, /\.symptom-context-figure__link img\s*{[\s\S]*height:\s*auto;/);
  assert.doesNotMatch(css, /box-shadow|border-radius/);
  assert.match(
    css,
    /@media \(max-width:\s*767px\)[\s\S]*\.symptom-context-figure__zoom\s*{[\s\S]*display:\s*inline-block;/,
  );
});
