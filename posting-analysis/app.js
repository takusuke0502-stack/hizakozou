const DATA_ROOT = "../data/posting";
const STORAGE_KEYS = {
  postingRecords: "hizakozou.posting.records.v1",
  inquiries: "hizakozou.posting.inquiries.v1",
  flyerDesigns: "hizakozou.posting.flyers.v1",
  distances: "hizakozou.posting.distances.v1"
};

const AGE_METRICS = {
  age_40s: { label: "40代", count: "age_40s_count", pct: "age_40s_pct" },
  age_50s: { label: "50代", count: "age_50s_count", pct: "age_50s_pct" },
  age_60s: { label: "60代", count: "age_60s_count", pct: "age_60s_pct" },
  age_70s: { label: "70代", count: "age_70s_count", pct: "age_70s_pct" },
  age_80plus: { label: "80代以上", count: "age_80plus_count", pct: "age_80plus_pct" },
  age_50_79: { label: "50〜79歳", count: "age_50_79_count", pct: "age_50_79_pct" },
  age_60_79: { label: "60〜79歳", count: "age_60_79_count", pct: "age_60_79_pct" },
  age_65plus: { label: "65歳以上", count: "age_65plus_count", pct: "age_65plus_pct" }
};

const state = {
  metadata: {},
  regions: [],
  aliases: new Map(),
  scoring: {},
  initialBusiness: { flyers: [] },
  sources: [],
  postingRecords: [],
  inquiries: [],
  flyerDesigns: [],
  distanceOverrides: {},
  selectedRegionCode: null
};

const elements = {
  dashboard: document.querySelector("#dashboard"),
  loadError: document.querySelector("#load-error"),
  kpiGrid: document.querySelector("#kpi-grid"),
  recommendationList: document.querySelector("#recommendation-list"),
  flyerSummaryBody: document.querySelector("#flyer-summary-body"),
  flyerForm: document.querySelector("#flyer-form"),
  toggleFlyerForm: document.querySelector("#toggle-flyer-form"),
  filterForm: document.querySelector("#filter-form"),
  filterFlyer: document.querySelector("#filter-flyer"),
  resetFilters: document.querySelector("#reset-filters"),
  regionTableBody: document.querySelector("#region-table-body"),
  resultCount: document.querySelector("#result-count"),
  selectedAgeHeading: document.querySelector("#selected-age-heading"),
  emptyState: document.querySelector("#empty-state"),
  ageSnapshot: document.querySelector("#age-snapshot"),
  populationSnapshot: document.querySelector("#population-snapshot"),
  dataNote: document.querySelector("#data-note"),
  sourceList: document.querySelector("#source-list"),
  dialog: document.querySelector("#region-dialog"),
  dialogCode: document.querySelector("#dialog-code"),
  dialogTitle: document.querySelector("#dialog-title"),
  dialogContent: document.querySelector("#dialog-content"),
  dialogClose: document.querySelector("#dialog-close"),
  exportButton: document.querySelector("#export-button"),
  importFile: document.querySelector("#import-file"),
  toast: document.querySelector("#toast")
};

const numberFormat = new Intl.NumberFormat("ja-JP");
const currencyFormat = new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY", maximumFractionDigits: 0 });

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);
}

function toFiniteNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatNumber(value) {
  const number = toFiniteNumber(value);
  return number === null ? "—" : numberFormat.format(Math.round(number));
}

function formatDecimal(value, suffix = "") {
  const number = toFiniteNumber(value);
  return number === null ? "—" : `${number.toFixed(1)}${suffix}`;
}

function formatCurrency(value) {
  const number = toFiniteNumber(value);
  return number === null ? "—" : currencyFormat.format(number);
}

function normalizeRegionName(value) {
  return String(value ?? "").normalize("NFKC").replace(/[\s　]+/g, "").trim();
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const parseLine = (line) => {
    const values = [];
    let current = "";
    let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
      const character = line[index];
      if (character === '"' && quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else if (character === '"') {
        quoted = !quoted;
      } else if (character === "," && !quoted) {
        values.push(current);
        current = "";
      } else {
        current += character;
      }
    }
    values.push(current);
    return values;
  };
  const headers = parseLine(lines[0]);
  return lines.slice(1).map((line) => Object.fromEntries(headers.map((header, index) => [header, parseLine(line)[index] ?? ""])));
}

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function todayForInput() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function makeId(prefix) {
  if (globalThis.crypto?.randomUUID) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function flyerName(flyerId) {
  return state.flyerDesigns.find((flyer) => flyer.id === flyerId)?.name ?? flyerId ?? "未設定";
}

function initialFlyerDesigns() {
  return state.initialBusiness.flyers.map((flyer) => ({
    id: flyer.id,
    name: flyer.name,
    version: "initial",
    start_date: "",
    ordered_count: flyer.ordered_count,
    printing_cost: null,
    distribution_cost: null,
    offer: "",
    headline: "",
    status: flyer.status,
    notes: flyer.note,
    known_unattributed_inquiries: flyer.inquiries_so_far_known ?? 0,
    remaining_count_known: flyer.remaining_count_known
  }));
}

function buildAliasMap(aliasRows) {
  const aliases = new Map();
  for (const region of state.regions) {
    for (const alias of [...(region.aliases ?? []), region.region_name, region.region_name_normalized]) {
      aliases.set(normalizeRegionName(alias), region.region_code);
    }
  }
  for (const row of aliasRows) {
    aliases.set(normalizeRegionName(row.alias), row.region_code);
    aliases.set(normalizeRegionName(row.normalized_alias), row.region_code);
  }
  state.aliases = aliases;
}

function resolveRegionCode(value) {
  return state.aliases.get(normalizeRegionName(value)) ?? null;
}

function getDistance(region) {
  const override = toFiniteNumber(state.distanceOverrides[region.region_code]);
  return override ?? toFiniteNumber(region.distance_from_clinic_km);
}

function getRevenue(inquiry) {
  return toFiniteNumber(inquiry.lifetime_revenue) ?? toFiniteNumber(inquiry.sales) ?? toFiniteNumber(inquiry.first_visit_revenue) ?? 0;
}

function buildStatsByRegion(flyerDesignId = "") {
  const map = new Map(state.regions.map((region) => [region.region_code, {
    distributed: 0,
    inquiries: 0,
    visits: 0,
    continued: 0,
    revenue: 0,
    postingRecords: [],
    inquiryRecords: []
  }]));

  for (const record of state.postingRecords) {
    if (flyerDesignId && record.flyer_design_id !== flyerDesignId) continue;
    const stats = map.get(record.region_code);
    if (!stats) continue;
    stats.distributed += Math.max(0, toFiniteNumber(record.distributed_count) ?? 0);
    stats.postingRecords.push(record);
  }

  for (const inquiry of state.inquiries) {
    if (flyerDesignId && inquiry.flyer_design_id !== flyerDesignId) continue;
    const stats = map.get(inquiry.region_code);
    if (!stats) continue;
    stats.inquiries += 1;
    stats.visits += inquiry.converted_to_visit ? 1 : 0;
    stats.continued += inquiry.continued ? 1 : 0;
    stats.revenue += getRevenue(inquiry);
    stats.inquiryRecords.push(inquiry);
  }
  return map;
}

function distanceScore(distanceKm) {
  if (distanceKm === null) return null;
  const bands = state.scoring.distance_score_default ?? [];
  const match = bands.find((band) => band.max_km === null || distanceKm <= band.max_km);
  return toFiniteNumber(match?.score);
}

function regionScore(region, stats) {
  const config = state.scoring.final_posting_score ?? {};
  const minimumDistributed = toFiniteNumber(config.minimum_distributed_for_full_response_weight) ?? 1000;
  const components = [];
  const demographicScore = toFiniteNumber(region.knee_target_score) ?? toFiniteNumber(region.demographic_score);
  if (demographicScore !== null) {
    components.push({ key: "demographic", label: "人口統計・膝痛", score: demographicScore, weight: toFiniteNumber(config.demographic_or_knee_score) ?? 0.4 });
  }

  const distance = getDistance(region);
  const distanceComponent = distanceScore(distance);
  if (distanceComponent !== null) {
    components.push({ key: "distance", label: "距離", score: distanceComponent, weight: toFiniteNumber(config.distance) ?? 0.25 });
  }

  if (stats.distributed > 0) {
    const responsePerThousand = (stats.inquiries / stats.distributed) * 1000;
    const confidence = Math.min(1, stats.distributed / minimumDistributed);
    components.push({
      key: "response",
      label: "反響実績",
      score: Math.min(100, responsePerThousand * 20),
      weight: (toFiniteNumber(config.response_performance) ?? 0.2) * confidence,
      confidence
    });
  }

  if (stats.inquiries > 0) {
    const continuationRate = stats.continued / stats.inquiries;
    const revenuePerInquiry = stats.revenue / stats.inquiries;
    const score = continuationRate * 70 + Math.min(100, revenuePerInquiry / 1000) * 0.3;
    components.push({ key: "continuation", label: "継続・売上", score, weight: toFiniteNumber(config.continuation_or_revenue) ?? 0.1 });
  }

  if ((toFiniteNumber(region.households_latest) ?? 0) > 0) {
    const headroom = Math.max(0, 100 - (stats.distributed / region.households_latest) * 100);
    components.push({ key: "headroom", label: "配布余地", score: headroom, weight: toFiniteNumber(config.distribution_headroom) ?? 0.05 });
  }

  const weightTotal = components.reduce((total, component) => total + component.weight, 0);
  const finalScore = weightTotal > 0
    ? components.reduce((total, component) => total + component.score * component.weight, 0) / weightTotal
    : 0;
  return { finalScore, components, distance };
}

function priorityForScore(score) {
  const thresholds = state.scoring.priority_thresholds ?? { S: 80, A: 65, B: 50, C: 0 };
  if (score >= thresholds.S) return "S";
  if (score >= thresholds.A) return "A";
  if (score >= thresholds.B) return "B";
  return "C";
}

function scoredRegions(statsMap = buildStatsByRegion()) {
  return state.regions.map((region) => {
    const stats = statsMap.get(region.region_code);
    const score = regionScore(region, stats);
    return { region, stats, ...score, priority: priorityForScore(score.finalScore) };
  });
}

function responseRate(stats) {
  return stats.distributed > 0 ? (stats.inquiries / stats.distributed) * 100 : null;
}

function responsePerThousand(stats) {
  return stats.distributed > 0 ? (stats.inquiries / stats.distributed) * 1000 : null;
}

function getFilters() {
  const formData = new FormData(elements.filterForm);
  return Object.fromEntries(formData.entries());
}

function selectedAgeValue(region, filters) {
  const metric = AGE_METRICS[filters.age_metric] ?? AGE_METRICS.age_60_79;
  const key = filters.age_mode === "count" ? metric.count : metric.pct;
  return toFiniteNumber(region[key]) ?? 0;
}

function filteredRegions() {
  const filters = getFilters();
  const statsMap = buildStatsByRegion(filters.flyer_design_id);
  const normalizedSearch = normalizeRegionName(filters.search);
  const exactRegionCode = normalizedSearch ? resolveRegionCode(normalizedSearch) : null;
  const minAge = toFiniteNumber(filters.min_age);
  const minHouseholds = toFiniteNumber(filters.min_households);
  const minDensity = toFiniteNumber(filters.min_density);
  const maxDistance = toFiniteNumber(filters.max_distance);
  const maxDistributed = toFiniteNumber(filters.max_distributed);

  const rows = scoredRegions(statsMap).filter((row) => {
    if (normalizedSearch) {
      const regionMatches = normalizeRegionName(row.region.region_name).includes(normalizedSearch)
        || normalizeRegionName(row.region.region_name_normalized).includes(normalizedSearch)
        || exactRegionCode === row.region.region_code;
      if (!regionMatches) return false;
    }
    if (filters.priority && row.priority !== filters.priority) return false;
    if (minAge !== null && selectedAgeValue(row.region, filters) < minAge) return false;
    if (minHouseholds !== null && (toFiniteNumber(row.region.households_latest) ?? 0) < minHouseholds) return false;
    if (minDensity !== null && (toFiniteNumber(row.region.target_50_79_per_100_households) ?? 0) < minDensity) return false;
    if (maxDistance !== null && (row.distance === null || row.distance > maxDistance)) return false;
    if (filters.distribution_status === "unposted" && row.stats.distributed > 0) return false;
    if (filters.distribution_status === "posted" && row.stats.distributed === 0) return false;
    if (maxDistributed !== null && row.stats.distributed > maxDistributed) return false;
    if (filters.inquiry_status === "yes" && row.stats.inquiries === 0) return false;
    if (filters.inquiry_status === "no" && row.stats.inquiries > 0) return false;
    if (filters.flyer_design_id && row.stats.postingRecords.length === 0 && row.stats.inquiryRecords.length === 0) return false;
    return true;
  });

  const sorters = {
    final_score: (row) => row.finalScore,
    knee_target_score: (row) => toFiniteNumber(row.region.knee_target_score) ?? 0,
    demographic_score: (row) => toFiniteNumber(row.region.demographic_score) ?? 0,
    households_latest: (row) => toFiniteNumber(row.region.households_latest) ?? 0,
    selected_age: (row) => selectedAgeValue(row.region, filters),
    target_density: (row) => toFiniteNumber(row.region.target_50_79_per_100_households) ?? 0,
    response_rate: (row) => responseRate(row.stats) ?? -1,
    distributed: (row) => row.stats.distributed
  };
  const sorter = sorters[filters.sort] ?? sorters.final_score;
  rows.sort((left, right) => sorter(right) - sorter(left) || left.region.region_name.localeCompare(right.region.region_name, "ja"));
  return { rows, filters };
}

function rankBadge(priority) {
  return `<span class="rank-badge rank-badge--${priority.toLowerCase()}">${priority}</span>`;
}

function renderKpis() {
  const rows = scoredRegions();
  const distributed = rows.reduce((total, row) => total + row.stats.distributed, 0);
  const attributedInquiries = rows.reduce((total, row) => total + row.stats.inquiries, 0);
  const unattributedInquiries = state.flyerDesigns.reduce((total, flyer) => total + (toFiniteNumber(flyer.known_unattributed_inquiries) ?? 0), 0);
  const overallRate = distributed > 0 ? (attributedInquiries / distributed) * 100 : null;
  const best = rows.filter((row) => row.stats.distributed > 0).sort((a, b) => (responsePerThousand(b.stats) ?? 0) - (responsePerThousand(a.stats) ?? 0))[0];
  const recommendations = recommendationRows(rows);
  const kpis = [
    ["Sランク地域", `${rows.filter((row) => row.priority === "S").length}地域`, "最終スコア80点以上"],
    ["Aランク地域", `${rows.filter((row) => row.priority === "A").length}地域`, "最終スコア65〜79.9点"],
    ["累計配布枚数", `${formatNumber(distributed)}枚`, "このブラウザへの登録分"],
    ["累計問い合わせ", `${formatNumber(attributedInquiries + unattributedInquiries)}件`, unattributedInquiries ? `地域未紐付け ${formatNumber(unattributedInquiries)}件を含む` : "地域に紐付いた登録分"],
    ["全体反響率", overallRate === null ? "—" : formatDecimal(overallRate, "%"), "地域紐付け済み実績で計算"],
    ["1,000枚あたり", distributed > 0 ? `${formatDecimal((attributedInquiries / distributed) * 1000)}件` : "—", "問い合わせ件数 ÷ 配布枚数"],
    ["最も反応が良い地域", best ? best.region.region_name : "実績未登録", best ? `${formatDecimal(responsePerThousand(best.stats))}件／1,000枚` : "配布実績を登録すると表示"],
    ["次に配る推奨地域", recommendations[0]?.region.region_name ?? "—", recommendations[0] ? `${formatDecimal(recommendations[0].finalScore)}点・${recommendations[0].priority}ランク` : "候補なし"]
  ];
  elements.kpiGrid.innerHTML = kpis.map(([label, value, note]) => `
    <article class="kpi"><p class="kpi__label">${escapeHtml(label)}</p><p class="kpi__value">${escapeHtml(value)}</p><p class="kpi__note">${escapeHtml(note)}</p></article>
  `).join("");
}

function recommendationRows(rows = scoredRegions()) {
  return [...rows]
    .filter((row) => row.stats.distributed < Math.max(1000, toFiniteNumber(row.region.households_latest) ?? 0))
    .sort((left, right) => right.finalScore - left.finalScore || left.stats.distributed - right.stats.distributed)
    .slice(0, 5);
}

function recommendationReasons(row) {
  const reasons = [
    `60〜79歳 ${formatDecimal(row.region.age_60_79_pct, "%")}`,
    `${formatNumber(row.region.households_latest)}世帯`,
    row.stats.distributed === 0 ? "未配布" : `配布 ${formatNumber(row.stats.distributed)}枚`,
    `${row.priority}ランク`
  ];
  if (row.stats.distributed < 1000 && row.stats.inquiries === 0) reasons.push("テスト枠");
  return reasons;
}

function renderRecommendations() {
  elements.recommendationList.innerHTML = recommendationRows().map((row, index) => `
    <li class="recommendation-item">
      <span class="recommendation-item__rank">${index + 1}</span>
      <div><h3>${escapeHtml(row.region.region_name)}</h3><p>地域コード ${escapeHtml(row.region.region_code)}</p></div>
      <span class="recommendation-item__score">${formatDecimal(row.finalScore)}点</span>
      <div class="reason-tags">${recommendationReasons(row).map((reason) => `<span class="reason-tag">${escapeHtml(reason)}</span>`).join("")}</div>
      <button type="button" class="region-open" data-region-code="${escapeHtml(row.region.region_code)}">詳細を見る</button>
    </li>
  `).join("");
}

function renderFlyerOptions() {
  const options = state.flyerDesigns.map((flyer) => `<option value="${escapeHtml(flyer.id)}">${escapeHtml(flyer.name)}</option>`).join("");
  const current = elements.filterFlyer.value;
  elements.filterFlyer.innerHTML = `<option value="">すべて</option>${options}`;
  if (state.flyerDesigns.some((flyer) => flyer.id === current)) elements.filterFlyer.value = current;
}

function renderFlyerSummary() {
  elements.flyerSummaryBody.innerHTML = state.flyerDesigns.map((flyer) => {
    const postings = state.postingRecords.filter((record) => record.flyer_design_id === flyer.id);
    const inquiries = state.inquiries.filter((inquiry) => inquiry.flyer_design_id === flyer.id);
    const distributed = postings.reduce((total, record) => total + (toFiniteNumber(record.distributed_count) ?? 0), 0);
    const known = toFiniteNumber(flyer.known_unattributed_inquiries) ?? 0;
    const inquiryCount = inquiries.length + known;
    const perThousand = distributed > 0 ? (inquiries.length / distributed) * 1000 : null;
    const revenue = inquiries.reduce((total, inquiry) => total + getRevenue(inquiry), 0);
    return `<tr>
      <td data-label="デザイン"><strong>${escapeHtml(flyer.name)}</strong><br><small>${escapeHtml(flyer.id)}</small></td>
      <td data-label="状態">${escapeHtml(statusLabel(flyer.status))}</td>
      <td data-label="注文">${formatNumber(flyer.ordered_count)}</td>
      <td data-label="配布">${formatNumber(distributed)}</td>
      <td data-label="問い合わせ">${formatNumber(inquiryCount)}${known ? `<br><small>未紐付け${formatNumber(known)}</small>` : ""}</td>
      <td data-label="1,000枚あたり">${perThousand === null ? "—" : formatDecimal(perThousand)}</td>
      <td data-label="売上">${formatCurrency(revenue)}</td>
    </tr>`;
  }).join("");
}

function statusLabel(status) {
  return ({ distribution_in_progress: "配布中", ordered_not_started: "注文済・未配布", draft: "準備中", completed: "完了" })[status] ?? status ?? "未設定";
}

function formatAge(region, metric, mode) {
  const key = mode === "count" ? metric.count : metric.pct;
  const value = region[key];
  return mode === "count" ? `${formatNumber(value)}人` : formatDecimal(value, "%");
}

function renderRegionTable() {
  const { rows, filters } = filteredRegions();
  const metric = AGE_METRICS[filters.age_metric] ?? AGE_METRICS.age_60_79;
  elements.resultCount.textContent = formatNumber(rows.length);
  elements.selectedAgeHeading.textContent = `${metric.label}（${filters.age_mode === "count" ? "人数" : "割合"}）`;
  elements.emptyState.hidden = rows.length > 0;
  elements.regionTableBody.innerHTML = rows.map((row) => {
    const cells = [
      ["優先度", rankBadge(row.priority)],
      ["地域", `<button type="button" class="region-link" data-region-code="${escapeHtml(row.region.region_code)}">${escapeHtml(row.region.region_name)}</button>`],
      ["最終", `${formatDecimal(row.finalScore)}点`],
      ["膝痛", formatDecimal(row.region.knee_target_score)],
      ["人口統計", formatDecimal(row.region.demographic_score)],
      ["世帯", formatNumber(row.region.households_latest)],
      [metric.label, formatAge(row.region, metric, filters.age_mode)],
      ["50代", formatDecimal(row.region.age_50s_pct, "%")],
      ["60代", formatDecimal(row.region.age_60s_pct, "%")],
      ["70代", formatDecimal(row.region.age_70s_pct, "%")],
      ["80代以上", formatDecimal(row.region.age_80plus_pct, "%")],
      ["50〜79／100世帯", formatDecimal(row.region.target_50_79_per_100_households)],
      ["距離", row.distance === null ? '<span class="metric-missing">—</span>' : `${formatDecimal(row.distance)}km`],
      ["配布", formatNumber(row.stats.distributed)],
      ["問合せ", formatNumber(row.stats.inquiries)],
      ["反響率", responseRate(row.stats) === null ? '<span class="metric-missing">—</span>' : formatDecimal(responseRate(row.stats), "%")],
      ["継続", formatNumber(row.stats.continued)],
      ["売上", formatCurrency(row.stats.revenue)]
    ];
    return `<tr>${cells.map(([label, value]) => `<td data-label="${escapeHtml(label)}">${value}</td>`).join("")}</tr>`;
  }).join("");
}

function ageBarRows(region) {
  const metrics = [AGE_METRICS.age_40s, AGE_METRICS.age_50s, AGE_METRICS.age_60s, AGE_METRICS.age_70s, AGE_METRICS.age_80plus];
  const maxPct = Math.max(1, ...metrics.map((metric) => toFiniteNumber(region[metric.pct]) ?? 0));
  return metrics.map((metric) => {
    const count = toFiniteNumber(region[metric.count]) ?? 0;
    const pct = toFiniteNumber(region[metric.pct]) ?? 0;
    return `<div class="age-bar"><strong>${escapeHtml(metric.label)}</strong><div class="age-bar__track"><div class="age-bar__fill" style="width:${Math.min(100, (pct / maxPct) * 100).toFixed(1)}%"></div></div><span class="age-bar__value">${formatNumber(count)}人・${formatDecimal(pct, "%")}</span></div>`;
  }).join("");
}

function historyRows(records, type) {
  if (!records.length) return '<p class="metric-missing">まだ登録がありません。</p>';
  return `<ul class="history-list">${[...records].sort((a, b) => String(b.date).localeCompare(String(a.date))).map((record) => {
    if (type === "posting") {
      return `<li class="history-item"><strong>${escapeHtml(record.date)}</strong><span>${escapeHtml(flyerName(record.flyer_design_id))}<br><small>${escapeHtml(record.memo || record.route_id || "")}</small></span><b>${formatNumber(record.distributed_count)}枚</b></li>`;
    }
    return `<li class="history-item"><strong>${escapeHtml(record.date)}</strong><span>${escapeHtml(flyerName(record.flyer_design_id))}<br><small>${escapeHtml(record.memo || "")}</small></span><b>${record.continued ? "継続" : record.converted_to_visit ? "来院" : "問合せ"}・${formatCurrency(getRevenue(record))}</b></li>`;
  }).join("")}</ul>`;
}

function renderDialog(regionCode) {
  const region = state.regions.find((item) => item.region_code === regionCode);
  if (!region) return;
  state.selectedRegionCode = regionCode;
  const stats = buildStatsByRegion().get(regionCode);
  const score = regionScore(region, stats);
  const priority = priorityForScore(score.finalScore);
  const flyerOptions = state.flyerDesigns.map((flyer) => `<option value="${escapeHtml(flyer.id)}">${escapeHtml(flyer.name)}</option>`).join("");
  elements.dialogCode.textContent = `地域コード ${region.region_code}`;
  elements.dialogTitle.textContent = region.region_name;
  const metrics = [
    ["最終優先度", `${priority}・${formatDecimal(score.finalScore)}点`], ["人口", `${formatNumber(region.population_latest)}人`], ["世帯数", `${formatNumber(region.households_latest)}世帯`],
    ["院からの距離", score.distance === null ? "—" : `${formatDecimal(score.distance)}km`], ["50〜79歳", `${formatNumber(region.age_50_79_count)}人・${formatDecimal(region.age_50_79_pct, "%")}`],
    ["60〜79歳", `${formatNumber(region.age_60_79_count)}人・${formatDecimal(region.age_60_79_pct, "%")}`], ["65歳以上", `${formatNumber(region.age_65plus_count)}人・${formatDecimal(region.age_65plus_pct, "%")}`],
    ["50〜79歳／100世帯", formatDecimal(region.target_50_79_per_100_households)], ["累計配布", `${formatNumber(stats.distributed)}枚`], ["問い合わせ", `${formatNumber(stats.inquiries)}件`],
    ["継続", `${formatNumber(stats.continued)}件`], ["売上", formatCurrency(stats.revenue)]
  ];
  const componentKeys = ["demographic", "distance", "response", "continuation", "headroom"];
  const componentLabels = { demographic: "人口統計・膝痛", distance: "距離", response: "反響実績", continuation: "継続・売上", headroom: "配布余地" };
  const scoreItems = componentKeys.map((key) => {
    const component = score.components.find((item) => item.key === key);
    return `<div class="score-item"><span>${componentLabels[key]}</span><strong>${component ? `${formatDecimal(component.score)}点` : "—"}</strong>${component?.confidence !== undefined ? `<small>信頼度 ${formatDecimal(component.confidence * 100, "%")}</small>` : ""}</div>`;
  }).join("");

  elements.dialogContent.innerHTML = `
    <section class="dialog-section"><div class="detail-metrics">${metrics.map(([label, value]) => `<div class="detail-metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}</div></section>
    <section class="dialog-section"><h3>年代構成</h3><div class="age-bars">${ageBarRows(region)}</div></section>
    <section class="dialog-section"><h3>スコア内訳</h3><div class="score-list">${scoreItems}</div></section>
    <section class="dialog-section"><h3>配布履歴</h3>${historyRows(stats.postingRecords, "posting")}</section>
    <section class="dialog-section"><h3>問い合わせ・来院・継続</h3>${historyRows(stats.inquiryRecords, "inquiry")}</section>
    <section class="dialog-section"><h3>実績を登録</h3><div class="dialog-forms">
      <form class="dialog-form" data-form="posting"><h4>配布実績</h4>
        <label>配布日<input name="date" type="date" value="${todayForInput()}" required></label>
        <label>チラシ<select name="flyer_design_id" required>${flyerOptions}</select></label>
        <label>配布枚数<input name="distributed_count" type="number" min="1" step="1" required></label>
        <label>ルートID<input name="route_id" maxlength="60"></label><label>GPSセッションID<input name="gps_session_id" maxlength="60"></label>
        <label>メモ<textarea name="memo" rows="2" maxlength="300"></textarea></label><button class="button button--primary" type="submit">配布を保存</button>
      </form>
      <form class="dialog-form" data-form="inquiry"><h4>問い合わせ</h4>
        <label>問い合わせ日<input name="date" type="date" value="${todayForInput()}" required></label>
        <label>チラシ<select name="flyer_design_id" required>${flyerOptions}</select></label>
        <div class="dialog-form__checks"><label><input name="source_confirmed" type="checkbox" checked>チラシ経由を確認</label><label><input name="converted_to_visit" type="checkbox">来院</label><label><input name="continued" type="checkbox">継続</label></div>
        <label>初回来院売上<input name="first_visit_revenue" type="number" min="0" step="1"></label><label>LTV・累計売上<input name="lifetime_revenue" type="number" min="0" step="1"></label>
        <label>メモ<textarea name="memo" rows="2" maxlength="300"></textarea></label><button class="button button--primary" type="submit">問い合わせを保存</button>
      </form>
      <form class="dialog-form" data-form="distance"><h4>距離</h4><p>既存地図などで確認した値だけを登録してください。</p>
        <label>院からの距離（km）<input name="distance" type="number" min="0" step="0.1" value="${score.distance ?? ""}" placeholder="未登録"></label>
        <button class="button button--primary" type="submit">距離を保存</button>
      </form>
    </div></section>
  `;
  if (!elements.dialog.open) elements.dialog.showModal();
}

function renderSources() {
  elements.sourceList.innerHTML = state.sources.map((source) => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.name)}</a>（${escapeHtml(source.snapshot)}）</li>`).join("");
}

function renderAll() {
  renderKpis();
  renderRecommendations();
  renderFlyerOptions();
  renderFlyerSummary();
  renderRegionTable();
  if (state.selectedRegionCode && elements.dialog.open) renderDialog(state.selectedRegionCode);
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { elements.toast.hidden = true; }, 2800);
}

function saveOperationalState() {
  writeStorage(STORAGE_KEYS.postingRecords, state.postingRecords);
  writeStorage(STORAGE_KEYS.inquiries, state.inquiries);
  writeStorage(STORAGE_KEYS.flyerDesigns, state.flyerDesigns);
  writeStorage(STORAGE_KEYS.distances, state.distanceOverrides);
}

function handleDialogSubmit(event) {
  const form = event.target.closest("form[data-form]");
  if (!form) return;
  event.preventDefault();
  const region = state.regions.find((item) => item.region_code === state.selectedRegionCode);
  if (!region) return;
  const data = new FormData(form);
  if (form.dataset.form === "posting") {
    state.postingRecords.push({
      id: makeId("posting"), date: data.get("date"), region_code: region.region_code, region_name: region.region_name,
      flyer_design_id: data.get("flyer_design_id"), distributed_count: toFiniteNumber(data.get("distributed_count")) ?? 0,
      route_id: String(data.get("route_id") ?? ""), gps_session_id: String(data.get("gps_session_id") ?? ""), memo: String(data.get("memo") ?? ""), created_at: new Date().toISOString()
    });
    showToast("配布実績を保存しました。");
  } else if (form.dataset.form === "inquiry") {
    state.inquiries.push({
      id: makeId("inquiry"), date: data.get("date"), region_code: region.region_code, region_name: region.region_name,
      flyer_design_id: data.get("flyer_design_id"), source_confirmed: data.get("source_confirmed") === "on", converted_to_visit: data.get("converted_to_visit") === "on",
      continued: data.get("continued") === "on", first_visit_revenue: toFiniteNumber(data.get("first_visit_revenue")) ?? 0,
      lifetime_revenue: toFiniteNumber(data.get("lifetime_revenue")) ?? 0, memo: String(data.get("memo") ?? ""), created_at: new Date().toISOString()
    });
    showToast("問い合わせを保存しました。");
  } else if (form.dataset.form === "distance") {
    const distance = toFiniteNumber(data.get("distance"));
    if (distance === null) delete state.distanceOverrides[region.region_code];
    else state.distanceOverrides[region.region_code] = distance;
    showToast(distance === null ? "距離の登録を解除しました。" : "距離を保存しました。");
  }
  saveOperationalState();
  renderAll();
}

function exportBackup() {
  const payload = {
    version: 1,
    exported_at: new Date().toISOString(),
    posting_records: state.postingRecords,
    inquiries: state.inquiries,
    flyer_designs: state.flyerDesigns,
    distance_overrides: state.distanceOverrides
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `hizakozou-posting-backup-${todayForInput()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function importBackup(file) {
  const payload = JSON.parse(await file.text());
  if (!Array.isArray(payload.posting_records) || !Array.isArray(payload.inquiries) || !Array.isArray(payload.flyer_designs) || typeof payload.distance_overrides !== "object") {
    throw new Error("バックアップ形式が正しくありません。");
  }
  state.postingRecords = payload.posting_records;
  state.inquiries = payload.inquiries;
  state.flyerDesigns = payload.flyer_designs;
  state.distanceOverrides = payload.distance_overrides;
  saveOperationalState();
  renderAll();
}

function bindEvents() {
  elements.filterForm.addEventListener("input", renderRegionTable);
  elements.filterForm.addEventListener("change", renderRegionTable);
  elements.resetFilters.addEventListener("click", () => { elements.filterForm.reset(); renderRegionTable(); });
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-region-code]");
    if (button) renderDialog(button.dataset.regionCode);
  });
  elements.dialogClose.addEventListener("click", () => elements.dialog.close());
  elements.dialog.addEventListener("click", (event) => {
    if (event.target === elements.dialog) elements.dialog.close();
  });
  elements.dialogContent.addEventListener("submit", handleDialogSubmit);
  elements.toggleFlyerForm.addEventListener("click", () => {
    elements.flyerForm.hidden = !elements.flyerForm.hidden;
    elements.toggleFlyerForm.setAttribute("aria-expanded", String(!elements.flyerForm.hidden));
  });
  elements.flyerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(elements.flyerForm);
    const name = String(data.get("name") ?? "").trim();
    if (!name) return;
    state.flyerDesigns.push({ id: makeId("flyer"), name, start_date: data.get("start_date"), ordered_count: toFiniteNumber(data.get("ordered_count")), status: data.get("status") });
    saveOperationalState();
    elements.flyerForm.reset();
    elements.flyerForm.hidden = true;
    elements.toggleFlyerForm.setAttribute("aria-expanded", "false");
    renderAll();
    showToast("チラシデザインを追加しました。");
  });
  elements.exportButton.addEventListener("click", exportBackup);
  elements.importFile.addEventListener("change", async () => {
    const file = elements.importFile.files?.[0];
    if (!file) return;
    try {
      await importBackup(file);
      showToast("バックアップを復元しました。");
    } catch (error) {
      showToast(error.message || "復元できませんでした。");
    } finally {
      elements.importFile.value = "";
    }
  });
}

async function loadDashboard() {
  try {
    const [regionMaster, aliasText, scoring, initialBusiness, sources] = await Promise.all([
      fetch(`${DATA_ROOT}/region_master.json`).then((response) => response.json()),
      fetch(`${DATA_ROOT}/region_aliases.csv`).then((response) => response.text()),
      fetch(`${DATA_ROOT}/scoring_config.json`).then((response) => response.json()),
      fetch(`${DATA_ROOT}/initial_business_state.json`).then((response) => response.json()),
      fetch(`${DATA_ROOT}/source_master.json`).then((response) => response.json())
    ]);
    state.metadata = regionMaster.metadata;
    state.regions = regionMaster.regions.map((region) => ({
      ...region,
      region_code: String(region.region_code)
    }));
    state.scoring = scoring;
    state.initialBusiness = initialBusiness;
    state.sources = sources;
    buildAliasMap(parseCsv(aliasText));
    state.postingRecords = readStorage(STORAGE_KEYS.postingRecords, []);
    state.inquiries = readStorage(STORAGE_KEYS.inquiries, []);
    state.flyerDesigns = readStorage(STORAGE_KEYS.flyerDesigns, initialFlyerDesigns());
    state.distanceOverrides = readStorage(STORAGE_KEYS.distances, {});
    elements.ageSnapshot.textContent = state.metadata.age_snapshot_date ?? "—";
    elements.populationSnapshot.textContent = state.metadata.population_households_snapshot_date ?? "—";
    elements.dataNote.textContent = `${formatNumber(state.regions.length)}町丁目を読み込み済み。${state.metadata.privacy_note ?? ""}`;
    renderSources();
    bindEvents();
    renderAll();
    elements.dashboard.setAttribute("aria-busy", "false");
  } catch (error) {
    console.error(error);
    elements.loadError.hidden = false;
    elements.loadError.textContent = "地域マスターを読み込めませんでした。ローカルサーバー経由で開いているか確認してください。";
    elements.dashboard.setAttribute("aria-busy", "false");
  }
}

loadDashboard();
