import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const readText = (path) => readFile(new URL(path, import.meta.url), "utf8");

const [regionMasterText, aliasesCsv, scoringText, businessText, html, css, app] = await Promise.all([
  readText("../data/posting/region_master.json"),
  readText("../data/posting/region_aliases.csv"),
  readText("../data/posting/scoring_config.json"),
  readText("../data/posting/initial_business_state.json"),
  readText("../posting-analysis/index.html"),
  readText("../posting-analysis/styles.css"),
  readText("../posting-analysis/app.js")
]);

const regionMaster = JSON.parse(regionMasterText);
const scoring = JSON.parse(scoringText);
const business = JSON.parse(businessText);

test("posting master contains 318 unique Kashiwa regions", () => {
  assert.equal(regionMaster.metadata.city, "柏市");
  assert.equal(regionMaster.metadata.record_count, 318);
  assert.equal(regionMaster.regions.length, 318);
  assert.equal(new Set(regionMaster.regions.map((region) => String(region.region_code))).size, 318);
});

test("full-width and half-width Toyoshikidai aliases share one region code", () => {
  const rows = aliasesCsv.split(/\r?\n/).filter((line) => line.startsWith("豊四季台"));
  const fullWidth = rows.find((line) => line.startsWith("豊四季台３丁目,"));
  const halfWidth = rows.find((line) => line.startsWith("豊四季台3丁目,"));

  assert.ok(fullWidth);
  assert.ok(halfWidth);
  assert.equal(fullWidth.split(",")[2], halfWidth.split(",")[2]);
  assert.match(app, /normalize\("NFKC"\)/);
});

test("scoring configuration preserves missing-value and low-volume safeguards", () => {
  assert.deepEqual(scoring.final_posting_score, {
    demographic_or_knee_score: 0.4,
    distance: 0.25,
    response_performance: 0.2,
    continuation_or_revenue: 0.1,
    distribution_headroom: 0.05,
    renormalize_missing_weights: true,
    minimum_distributed_for_full_response_weight: 1000
  });
  assert.deepEqual(scoring.priority_thresholds, { S: 80, A: 65, B: 50, C: 0 });
  assert.match(app, /weightTotal > 0/);
  assert.match(app, /stats\.distributed > 0/);
  assert.match(app, /Math\.min\(1, stats\.distributed \/ minimumDistributed\)/);
  assert.match(app, /value === null \|\| value === undefined \|\| value === ""/);
});

test("dashboard exposes required filters, operational records, and mobile layout", () => {
  assert.match(html, /noindex,nofollow,noarchive/);
  assert.match(html, /40代[\s\S]*50代[\s\S]*60代[\s\S]*70代[\s\S]*80代以上/);
  assert.match(html, /50〜79歳／100世帯/);
  assert.match(app, /name="gps_session_id"|GPSセッションID/);
  assert.match(app, /flyer_design_id/);
  assert.match(app, /route_id/);
  assert.match(app, /gps_session_id/);
  assert.match(app, /localStorage/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /\.data-table--regions[\s\S]*display: block/);
});

test("initial flyer state keeps legacy and new designs separate", () => {
  assert.deepEqual(business.flyers.map((flyer) => flyer.id), ["legacy_flyer", "new_flyer_202608"]);
  assert.equal(business.flyers[0].inquiries_so_far_known, 2);
  assert.equal(business.flyers[1].ordered_count, 10000);
});
