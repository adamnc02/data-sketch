// DataSketch data engine
// One fake semantic model per wireframe. Measures carry trend, seasonality and magnitude.
// Values are built from a separable model: base(month) x share(dimension member, month) for every dimension,
// so totals always reconcile across visuals, and filters/highlights are exact.

export const N_MONTHS = 24;          // visible months: Jan 2025 to Dec 2026
export const START_YEAR = 2025;
const PAD = 12;                      // 12 hidden months before the range so "last year" always exists
const M = N_MONTHS + PAD;
export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const TIME_KEYS = ['T:Year', 'T:Quarter', 'T:Month'];
export const TIME_PERIODS = { 'T:Year': 2, 'T:Quarter': 8, 'T:Month': 12 };
export const TIME_MAX = { 'T:Year': 2, 'T:Quarter': 8, 'T:Month': 24 };
export const isTime = k => typeof k === 'string' && k.startsWith('T:');

export const uid = () => Math.random().toString(36).slice(2, 10);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
export function hash(s) {
  let h = 2166136261;
  for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

/* ---------- model construction ---------- */
export function newDim(name, count = 5, members = '') { return { id: uid(), name, count, members }; }
export function newMeasure(o = {}) {
  return { id: uid(), name: 'New measure', type: 'sum', fmt: 'number', mag: 100000, trend: 'up', strength: 'med', season: 'none', stories: [], ...o };
}
export function defaultModel() {
  return {
    seed: Math.floor(Math.random() * 1e9), currency: '£',
    dims: [newDim('Product', 6), newDim('Region', 5), newDim('Customer', 8), newDim('Category', 4), newDim('Channel', 4)],
    measures: [
      newMeasure({ name: 'Sales', fmt: 'currency', mag: 4200000, trend: 'up' }),
      newMeasure({ name: 'Units', mag: 180000, trend: 'up', strength: 'low' }),
      newMeasure({ name: 'Orders', mag: 52000, trend: 'steady' }),
      newMeasure({ name: 'Margin %', type: 'ratio', fmt: 'percent', mag: 32, trend: 'steady', strength: 'low' }),
      newMeasure({ name: 'Avg order value', type: 'ratio', fmt: 'currency', mag: 81, trend: 'up', strength: 'low' })
    ]
  };
}
export function memberNames(dim) {
  const custom = String(dim.members || '').split(/\n|,/).map(s => s.trim()).filter(Boolean);
  const n = clamp(dim.count | 0, 1, 30);
  return Array.from({ length: n }, (_, i) => custom[i] || `${dim.name} ${i + 1}`);
}
export function dimName(model, key) {
  if (isTime(key)) return key.slice(2);
  const d = model.dims.find(x => x.id === key);
  return d ? d.name : '';
}
export const monthLabel = m => `${MONTHS[((m % 12) + 12) % 12]} ${START_YEAR + Math.floor(m / 12)}`;

/* ---------- formatting ---------- */
export function fmtValue(val, meas, currency = '£') {
  if (val == null || !isFinite(val)) return '–';
  const f = meas ? meas.fmt : 'number';
  if (f === 'percent') return (val * 100).toFixed(1) + '%';
  const a = Math.abs(val);
  let s;
  if (a >= 1e9) s = (val / 1e9).toFixed(1) + 'bn';
  else if (a >= 1e6) s = (val / 1e6).toFixed(a >= 1e7 ? 1 : 2) + 'M';
  else if (a >= 1e4) s = (val / 1e3).toFixed(a >= 1e5 ? 0 : 1) + 'K';
  else if (f === 'decimal') s = val.toFixed(2);
  else if (f === 'currency' && a < 100) s = val.toFixed(2);
  else s = Math.round(val).toLocaleString('en-GB');
  return f === 'currency' ? currency + s : s;
}

/* ---------- engine ---------- */
const SEASON = {
  none: () => 1,
  summer: mo => [.82, .84, .9, .96, 1.05, 1.2, 1.34, 1.36, 1.12, .96, .88, .92][mo],
  winter: mo => [1.28, 1.18, 1.02, .92, .86, .82, .8, .84, .9, 1, 1.12, 1.3][mo],
  december: mo => mo === 11 ? 1.75 : mo === 10 ? 1.18 : .94,
  q4: mo => mo >= 9 ? 1.28 : .91,
  spring: mo => [.9, .95, 1.12, 1.22, 1.2, 1.05, .95, .92, .96, .98, .93, .9][mo]
};
const LVL = { low: 1, med: 2, high: 3 };
const moy = k => (((k - PAD) % 12) + 12) % 12;

let cacheKey = null, cacheEng = null;
function engine(model) {
  const key = JSON.stringify([model.seed, model.dims, model.measures]);
  if (key === cacheKey) return cacheEng;
  cacheKey = key;
  cacheEng = compile(model);
  return cacheEng;
}

function compile(model) {
  const E = { meas: {}, baseW: {} };
  for (const d of model.dims) {
    const r = rng(hash(model.seed + '|dim|' + d.id));
    E.baseW[d.id] = Array.from({ length: clamp(d.count | 0, 1, 30) }, () => .45 + r() * 1.1);
  }
  for (const ms of model.measures) {
    const r = rng(hash(model.seed + '|m|' + ms.id));
    const L = LVL[ms.strength] || 2, season = SEASON[ms.season] || SEASON.none;
    let g = 0, amp = .03;
    if (ms.trend === 'up') { g = .010 * L; amp = .035; }
    else if (ms.trend === 'down') { g = -.008 * L; amp = .035; }
    else if (ms.trend === 'steady') { amp = .012 * L; }
    else { amp = .075 * L; }
    const ratio = ms.type === 'ratio';
    const raw = [], bud = [], den = [];
    for (let k = 0; k < M; k++) {
      const s = ratio ? 1 + (season(moy(k)) - 1) * .35 : season(moy(k));
      const gg = ratio ? g * .4 : g, aa = ratio ? amp * .5 : amp;
      let v = Math.pow(1 + gg, k) * s * (1 + aa * (r() * 2 - 1));
      if (ms.trend === 'volatile' && k % 2) v *= 1 + (r() - .4) * aa;
      raw.push(v);
      bud.push(Math.pow(1 + gg, k) * s);
      den.push(Math.pow(1.004, k) * season(moy(k)) * (1 + .02 * (r() * 2 - 1)));
    }
    const last = (arr) => arr.slice(M - 12).reduce((a, b) => a + b, 0);
    let target = +ms.mag || 0;
    const me = { type: ms.type, dims: {} };
    if (!ratio) {
      const sc = target / (last(raw) || 1);
      me.base = raw.map(v => v * sc);
      me.bud = bud.map(v => v * sc * 1.05);
    } else {
      if (ms.fmt === 'percent') target /= 100;
      const sc = target / ((last(raw) / 12) || 1), sb = target / ((last(bud) / 12) || 1);
      const cap = ms.fmt === 'percent' ? .995 : Infinity;
      me.level = raw.map(v => Math.min(cap, v * sc));
      me.budLevel = bud.map(v => Math.min(cap, v * sb * 1.02));
      const dsc = 1000 / ((last(den) / 12) || 1);
      me.den = den.map(v => v * dsc);
    }
    for (const d of model.dims) {
      const n = E.baseW[d.id].length, rm = rng(hash(model.seed + '|s|' + d.id + '|' + ms.id));
      const w = E.baseW[d.id].map(b => b * (.85 + rm() * .3));
      const tilt = w.map(() => (rm() * 2 - 1) * .004);
      const rf = w.map(() => 1 + .18 * (rm() * 2 - 1));
      const rtilt = w.map(() => 0);
      for (const st of (ms.stories || [])) {
        if (st.dim !== d.id || st.member == null || st.member >= n) continue;
        const j = +st.member;
        if (st.effect === 'star') { w[j] *= 2.2; rf[j] *= 1.12; }
        else if (st.effect === 'weak') { w[j] *= .4; rf[j] *= .86; }
        else if (st.effect === 'growing') { tilt[j] += .03; rtilt[j] += .006; }
        else if (st.effect === 'declining') { tilt[j] -= .025; rtilt[j] -= .006; }
      }
      const share = [], rate = [];
      for (let k = 0; k < M; k++) {
        const row = w.map((wj, j) => wj * Math.pow(1 + tilt[j], k) * (1 + .05 * (rm() * 2 - 1)));
        const sum = row.reduce((a, b) => a + b, 0);
        const sh = row.map(x => x / sum);
        share.push(sh);
        if (ratio) {
          const rr = rf.map((f, j) => f * Math.pow(1 + rtilt[j], k));
          const norm = sh.reduce((a, s, j) => a + s * rr[j], 0);
          rate.push(rr.map(x => x / norm));
        }
      }
      me.dims[d.id] = { share, rate: ratio ? rate : null };
    }
    E.meas[ms.id] = me;
  }
  return E;
}

/* time buckets */
function bucketOf(key, m) {
  if (key === 'T:Year') return Math.floor(m / 12);
  if (key === 'T:Quarter') return Math.floor(m / 3);
  return m;
}
function bucketLabel(key, b) {
  if (key === 'T:Year') return String(START_YEAR + b);
  if (key === 'T:Quarter') return `Q${b % 4 + 1} ${START_YEAR + Math.floor(b / 4)}`;
  return `${MONTHS[b % 12]} ${String(START_YEAR + Math.floor(b / 12)).slice(2)}`;
}

/**
 * query(model, {measure, variant, axis, legend, filters, range})
 *  measure: measure id; variant: 'base' | 'ly' | 'bud'
 *  axis/legend: dim id or 'T:Year'|'T:Quarter'|'T:Month' (legend categorical only)
 *  filters: { dimId: [memberIdx, ...] }
 *  range: [m0, m1] visible month indices (0..23)
 * returns { labels, keys, series: [{ name, key, vals }] } or null
 */
export function query(model, q) {
  const E = engine(model), me = E.meas[q.measure];
  if (!me) return null;
  const ratio = me.type === 'ratio';
  const dimById = id => model.dims.find(d => d.id === id);
  const axisTime = isTime(q.axis), axDim = !axisTime && q.axis ? dimById(q.axis) : null;
  const lgDim = q.legend && !isTime(q.legend) && q.legend !== q.axis ? dimById(q.legend) : null;
  const filters = q.filters || {};
  const [m0, m1] = q.range || [N_MONTHS - 12, N_MONTHS - 1];
  const shift = q.variant === 'ly' ? -12 : 0;

  let axKeys, axLabels;
  if (axisTime) {
    axKeys = [];
    for (let m = m0; m <= m1; m++) { const b = bucketOf(q.axis, m); if (!axKeys.includes(b)) axKeys.push(b); }
    axLabels = axKeys.map(b => bucketLabel(q.axis, b));
  } else if (axDim) {
    axLabels = memberNames(axDim); axKeys = axLabels.map((_, i) => i);
  } else { axKeys = [0]; axLabels = ['Total']; }
  const lgNames = lgDim ? memberNames(lgDim) : [null];
  const A = axKeys.length, Lc = lgNames.length;
  const num = Array.from({ length: Lc }, () => new Array(A).fill(0));
  const dnm = Array.from({ length: Lc }, () => new Array(A).fill(0));

  for (let m = m0; m <= m1; m++) {
    const k = m + PAD + shift;
    if (k < 0) continue;
    let bN, bD;
    if (!ratio) { bN = q.variant === 'bud' ? me.bud[k] : me.base[k]; bD = 0; }
    else { bD = me.den[k]; bN = bD * (q.variant === 'bud' ? me.budLevel[k] : me.level[k]); }
    let fN = 1, fD = 1;
    for (const d of model.dims) {
      if ((axDim && d.id === axDim.id) || (lgDim && d.id === lgDim.id)) continue;
      const f = filters[d.id];
      if (!f || !f.length) continue;
      const md = me.dims[d.id];
      let sN = 0, sD = 0;
      for (const j of f) { const s = md.share[k][j] || 0; sD += s; sN += s * (ratio ? md.rate[k][j] : 1); }
      fN *= sN; fD *= sD;
    }
    const vec = (dim) => {
      const md = me.dims[dim.id], f = filters[dim.id];
      const vN = md.share[k].map((s, j) => (f && f.length && !f.includes(j)) ? 0 : s * (ratio ? md.rate[k][j] : 1));
      const vD = md.share[k].map((s, j) => (f && f.length && !f.includes(j)) ? 0 : s);
      return [vN, vD];
    };
    let aN, aD, ai = null;
    if (axDim) [aN, aD] = vec(axDim);
    else if (axisTime) { ai = axKeys.indexOf(bucketOf(q.axis, m)); }
    const [lN, lD] = lgDim ? vec(lgDim) : [[1], [1]];
    for (let l = 0; l < Lc; l++) {
      if (axDim) {
        for (let a = 0; a < A; a++) { num[l][a] += bN * fN * aN[a] * lN[l]; dnm[l][a] += bD * fD * aD[a] * lD[l]; }
      } else {
        const a = axisTime ? ai : 0;
        num[l][a] += bN * fN * lN[l]; dnm[l][a] += bD * fD * lD[l];
      }
    }
  }
  const series = lgNames.map((nm, l) => ({ name: nm, key: l, vals: num[l].map((x, a) => ratio ? (dnm[l][a] ? x / dnm[l][a] : null) : x) }));
  return { labels: axLabels, keys: axKeys, series };
}

/* ---------- export ---------- */
function csvEscape(v) { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
const toCSV = rows => rows.map(r => r.map(csvEscape).join(',')).join('\r\n');

export function exportTables(model, maxRows = 300000) {
  const E = engine(model);
  const files = {};
  files['Date.csv'] = toCSV([['Date', 'Year', 'Quarter', 'Month', 'MonthNumber', 'MonthName'],
    ...Array.from({ length: N_MONTHS }, (_, m) => {
      const y = START_YEAR + Math.floor(m / 12), mo = m % 12;
      return [`${y}-${String(mo + 1).padStart(2, '0')}-01`, y, `Q${Math.floor(mo / 3) + 1}`, `${MONTHS[mo]} ${y}`, mo + 1, MONTHS[mo]];
    })]);
  for (const d of model.dims) files[`${d.name}.csv`] = toCSV([[`${d.name}Key`, d.name], ...memberNames(d).map((n, i) => [i + 1, n])]);
  const counts = model.dims.map(d => E.baseW[d.id].length);
  const combos = counts.reduce((a, b) => a * b, 1);
  if (combos * N_MONTHS > maxRows) return { files, factSkipped: true, rows: combos * N_MONTHS };
  const head = ['Date', ...model.dims.map(d => `${d.name}Key`)];
  for (const ms of model.measures) {
    if (ms.type === 'ratio') head.push(`${ms.name} numerator`, `${ms.name} denominator`); else head.push(ms.name);
  }
  const rows = [head];
  const idx = new Array(counts.length).fill(0);
  for (let m = 0; m < N_MONTHS; m++) {
    const k = m + PAD, date = `${START_YEAR + Math.floor(m / 12)}-${String(m % 12 + 1).padStart(2, '0')}-01`;
    idx.fill(0);
    for (let c = 0; c < combos; c++) {
      const row = [date, ...idx.map(i => i + 1)];
      for (const ms of model.measures) {
        const me = E.meas[ms.id];
        let pS = 1, pR = 1;
        model.dims.forEach((d, di) => { const md = me.dims[d.id]; pS *= md.share[k][idx[di]]; if (md.rate) pR *= md.rate[k][idx[di]]; });
        if (me.type === 'ratio') { const dn = me.den[k] * pS; row.push((dn * me.level[k] * pR).toFixed(4), dn.toFixed(4)); }
        else row.push((me.base[k] * pS).toFixed(2));
      }
      rows.push(row);
      for (let di = idx.length - 1; di >= 0; di--) { idx[di]++; if (idx[di] < counts[di]) break; idx[di] = 0; }
    }
  }
  files['Fact.csv'] = toCSV(rows);
  return { files, factSkipped: false, rows: rows.length - 1 };
}

export function daxMeasures(model) {
  return model.measures.map(ms => ms.type === 'ratio'
    ? `${ms.name} =\nDIVIDE ( SUM ( Fact[${ms.name} numerator] ), SUM ( Fact[${ms.name} denominator] ) )`
    : `${ms.name} =\nSUM ( Fact[${ms.name}] )`).join('\n\n');
}
