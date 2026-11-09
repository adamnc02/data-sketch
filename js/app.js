// DataSketch: Power BI report wireframing
import * as D from './data.js';

const APP_VERSION = '1.4.0';
const $ = (s, r = document) => r.querySelector(s);
const uid = D.uid;
const clone = o => JSON.parse(JSON.stringify(o));
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const trunc = (s, n) => s.length > n ? s.slice(0, Math.max(1, n - 1)) + '…' : s;
const wide = () => matchMedia('(min-width:901px)').matches;

/* ---------- icons ---------- */
const ic = p => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const P = {
  filter: '<path d="M4 5h16l-6 7v6l-4 2v-8z"/>', close: '<path d="M6 6l12 12M18 6L6 18"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>', home: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',
  chart: '<path d="M5 20V10M12 20V4M19 20v-7"/>', settings: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>'
};
const I = {
  multi: ic('<rect x="3" y="3" width="11" height="11" rx="1.5"/><path d="M10 17v3a1 1 0 001 1h9a1 1 0 001-1v-9a1 1 0 00-1-1h-3" stroke-dasharray="2.5 2.5"/>'),
  'al-l': ic('<path d="M4 3v18"/><rect x="7" y="6" width="12" height="4" rx="1"/><rect x="7" y="14" width="7" height="4" rx="1"/>'), 'al-c': ic('<path d="M12 3v18"/><rect x="5" y="6" width="14" height="4" rx="1"/><rect x="8" y="14" width="8" height="4" rx="1"/>'),
  'al-r': ic('<path d="M20 3v18"/><rect x="5" y="6" width="12" height="4" rx="1"/><rect x="10" y="14" width="7" height="4" rx="1"/>'), 'al-t': ic('<path d="M3 4h18"/><rect x="6" y="7" width="4" height="12" rx="1"/><rect x="14" y="7" width="4" height="7" rx="1"/>'),
  'al-m': ic('<path d="M3 12h18"/><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="8" width="4" height="8" rx="1"/>'), 'al-b': ic('<path d="M3 20h18"/><rect x="6" y="5" width="4" height="12" rx="1"/><rect x="14" y="10" width="4" height="7" rx="1"/>'),
  'ds-h': ic('<path d="M4 3v18M20 3v18"/><rect x="9" y="7" width="6" height="10" rx="1"/>'), 'ds-v': ic('<path d="M3 4h18M3 20h18"/><rect x="7" y="9" width="10" height="6" rx="1"/>'),
  sidepanel: ic('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>'),
  pin: ic('<path d="M9 4h6l-1 6 3 3H7l3-3z"/><path d="M12 13v7"/>'),
  x: ic(P.close), back: ic('<path d="M15 5l-7 7 7 7"/>'), fwd: ic('<path d="M9 5l7 7-7 7"/>'),
  more: ic('<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'), plus: ic('<path d="M12 5v14M5 12h14"/>'),
  up: ic('<path d="M6 15l6-6 6 6"/>'), down: ic('<path d="M6 9l6 6 6-6"/>'),
  copy: ic('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3"/>'),
  paste: ic('<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6"/>'),
  notes: ic('<path d="M5 4h14v16H5z"/><path d="M8 9h8M8 13h8M8 17h5"/>'), swap: ic('<path d="M4 8h13l-3-3M20 16H7l3 3"/>'),
  trash: ic('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
  eye: ic('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  eyeoff: ic('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><path d="M4 4l16 16"/>'),
  card: ic('<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 14h6M7 10h3"/>'),
  column: ic('<path d="M5 20v-8M10 20V6M15 20V9M20 20v-6"/>'), bar: ic('<path d="M4 5h12M4 10h16M4 15h8M4 20h13"/>'),
  line: ic('<path d="M3 17l5-6 4 3 4-7 5 4"/>'), area: ic('<path d="M3 19v-5l5-5 4 3 4-5 5 4v8z"/>'),
  donut: ic('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M12 4v4.5"/>'),
  table: ic('<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 9h18M3 14h18M10 4v16"/>'),
  matrix: ic('<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 9h18M10 4v16M13 13h5M13 16.5h5M5.5 12.5h2M6.5 11.5v2"/>'),
  slicer: ic('<rect x="4" y="5" width="4" height="4"/><rect x="4" y="15" width="4" height="4"/><path d="M11 7h9M11 17h9"/>'),
  button: ic('<rect x="3" y="7" width="18" height="10" rx="5"/><path d="M9 12h6"/>'),
  pagenav: ic('<rect x="4" y="3.5" width="16" height="4.5" rx="1.5"/><rect x="4" y="9.75" width="16" height="4.5" rx="1.5"/><rect x="4" y="16" width="16" height="4.5" rx="1.5"/>'),
  shape: ic('<rect x="4" y="4" width="16" height="16" rx="2"/>'), text: ic('<path d="M5 6h14M12 6v13"/>'),
  image: ic('<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 7"/>'),
  pencil: ic('<path d="M4 20l1-5L16 4l4 4L9 19z"/><path d="M14 6l4 4"/>'),
  undo: ic('<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>'), redo: ic('<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 000 12h3"/>'),
  menu: ic('<path d="M4 6h16M4 12h16M4 18h16"/>'), download: ic('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'), upload: ic('<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>')
};
const CAL = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
const BRAND = `<span class="brand"><img class="mark lt" src="icons/mark-96.png" alt=""><img class="mark dk" src="icons/mark-white.svg" alt=""><img class="word lt" src="icons/wordmark.png" alt="DataSketch"><img class="word dk" src="icons/wordmark-dark.png" alt="DataSketch"></span>`;

/* ---------- constants ---------- */
const TYPES = {
  card: { name: 'Card', w: 300, h: 105 }, column: { name: 'Column chart', w: 405, h: 255 }, bar: { name: 'Bar chart', w: 405, h: 255 },
  line: { name: 'Line chart', w: 600, h: 255 }, area: { name: 'Area chart', w: 600, h: 255 }, donut: { name: 'Donut chart', w: 300, h: 255 },
  table: { name: 'Table', w: 450, h: 255 }, matrix: { name: 'Matrix', w: 510, h: 300 }, slicer: { name: 'Slicer', w: 210, h: 255 }, button: { name: 'Button', w: 135, h: 45 },
  pagenav: { name: 'Page navigator', w: 180, h: 150 },
  shape: { name: 'Shape', w: 300, h: 300 }, text: { name: 'Text box', w: 300, h: 45 }, image: { name: 'Image', w: 150, h: 60 }
};
const MULTI = ['column', 'bar', 'line', 'area'];
const DATA_TYPES = ['card', 'column', 'bar', 'line', 'area', 'donut', 'table', 'matrix'];
const LAYOUT_TYPES = ['shape', 'text', 'image', 'button', 'pagenav'];
const SLICER_SIZES = { list: [210, 255], dropdown: [210, 75], tiles: [405, 75], date: [300, 120], param: [405, 75] };
const HIER = ['T:Year', 'T:Quarter', 'T:Month'];
const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
const FONTS = [["'Segoe UI', system-ui, sans-serif", 'Segoe UI'], ['Arial, Helvetica, sans-serif', 'Arial'], ['Verdana, sans-serif', 'Verdana'], ["'Trebuchet MS', sans-serif", 'Trebuchet MS'], ['Georgia, serif', 'Georgia']];
const BASE = { title: 'Sales overview', headerBg: '#1F3A5F', headerFg: '#FFFFFF', pageBg: '#F3F2F1', visualBg: '#FFFFFF', font: FONTS[0][0], palette: ['#118DFF', '#12239E', '#E66C37', '#6B007B', '#E044A7', '#744EC2'], radius: 4, border: false, borderColor: '#C8C6C4', shadow: false, dataLabels: false, axisLabels: true, legend: true, gridlines: true, tooltips: true, titleSize: 11, headerH: 60, showHeader: true, logo: null, pageW: 1280, pageH: 720 };
const PAGE_SIZES = [[1280, 720, '16:9'], [1600, 900, '16:9 large'], [1600, 800, '2:1'], [960, 720, '4:3'], [816, 1056, 'Letter'], [320, 240, 'Tooltip']];
const TOOLS = {
  pencil: { label: 'Pencil', sizes: [2, 3, 5, 8], press: [.45, 1.15], tilt: 2.5, smooth: .3, op: .92, grain: true, icon: '<path d="M4 20l2-6L16 4l4 4L10 18z"/><path d="M14 6l4 4"/><path d="M6 14l4 4"/>' },
  pen: { label: 'Pen', sizes: [1.5, 2.5, 4, 7], press: null, smooth: .6, op: 1, icon: '<g transform="rotate(45 12 12)"><path d="M12 22l-5-8.5c0-3 1-5 2-5.5h6c1 .5 2 2.5 2 5.5z"/><path d="M12 22v-7"/><circle cx="12" cy="13.5" r="1.4"/><path d="M9 8V3h6v5"/></g>' },
  brush: { label: 'Brush', sizes: [4, 8, 14, 24], press: [.12, 1.7], taper: true, tilt: 1.2, smooth: .5, op: 1, icon: '<path d="M10 14l8-10a2 2 0 013 2.5L13 16"/><path d="M9 14c-3 0-4 2-4 4 0 1-1 2-2 2 4 1 9 0 9-4z"/>' },
  marker: { label: 'Highlighter', sizes: [10, 16, 24, 34], press: null, smooth: .6, op: .35, cap: 'butt', icon: '<path d="M9 12l-5 5v3h3l5-5"/><path d="M8 11l7-7 5 5-7 7z"/>' },
  fill: { label: 'Fill', icon: '<path d="M5 11l6-6 8 8-6 6a2 2 0 01-2.8 0L5 13.8a2 2 0 010-2.8z"/><path d="M5 12h13"/><path d="M20 15s1.5 2 1.5 3a1.5 1.5 0 01-3 0c0-1 1.5-3 1.5-3z"/>' },
  eraser: { label: 'Eraser', sizes: [10, 20, 36, 56], icon: '<path d="M8 20h12"/><path d="M4.5 14.5l9-9 6 6-7 7H9z"/>' }
};
const stabOf = t => ui.sk.stab[t] ?? Math.round((TOOLS[t].smooth || 0) * 100);
const SK_COLOURS = [['#252423', 'Black'], ['#D13438', 'Red'], ['#1A66D9', 'Blue'], ['#107C10', 'Green'], ['#F2C80F', 'Yellow'], ['#FFFFFF', 'White']];

/* ---------- storage ---------- */
const KEY = 'datasketch-store';
const IDB = {
  db: null,
  async open() {
    if (this.db) return this.db;
    this.db = await new Promise((res, rej) => { const r = indexedDB.open('datasketch', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    return this.db;
  },
  async get(k) { const db = await this.open(); return new Promise((res, rej) => { const t = db.transaction('kv').objectStore('kv').get(k); t.onsuccess = () => res(t.result); t.onerror = () => rej(t.error); }); },
  async set(k, v) { const db = await this.open(); return new Promise((res, rej) => { const tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').put(v, k); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); }); }
};
let store, saveT;
async function load() {
  try { store = await IDB.get('store'); } catch (e) { try { const s = localStorage.getItem(KEY); if (s) store = JSON.parse(s); } catch (_) {} }
  if (!store || !store.templates) store = seed();
  normalize();
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) {}
}
function save() {
  const o = cur(); if (o) o.updated = Date.now();
  setSaved('Saving…'); clearTimeout(saveT);
  saveT = setTimeout(async () => {
    try { await IDB.set('store', clone(store)); setSaved('Saved'); }
    catch (e) { try { localStorage.setItem(KEY, JSON.stringify(store)); setSaved('Saved'); } catch (_) { setSaved('Not saved: storage unavailable'); } }
  }, 350);
}
function setSaved(t) { const el = $('#saved'); if (el) el.textContent = t; }

/* ---------- model helpers ---------- */
const ui = {
  mode: 'wf', view: 'home', wfId: null, sel: null, panel: 'tab', tab: 'settings', panelOpen: false, flipped: new Set(), hl: null, hlBefore: null, last: null,
  zoom: 'fit', scale: 1, libMin: false, panelMin: false, multi: new Set(), multiMode: false, sk: { on: false, tool: 'pencil', color: '#252423', size: { pencil: 3, pen: 2.5, brush: 8, marker: 16, eraser: 20 }, stab: {}, open: false, pinned: false, prev: 'pencil' },
  skUndo: [], skRedo: [], drawing: false, ghost: false, paramSel: {}, slicerSel: {}, dropOpen: null, bmOpen: null, mOpen: null, vdata: new Map(), exportCache: null, clip: null
};
const cur = () => ui.mode === 'tpl' ? store.templates.find(t => t.id === ui.wfId) : store.wireframes.find(w => w.id === ui.wfId);
// Visuals, bookmarks and sketches belong to a page. A template is edited as a single page.
const pg = () => { const o = cur(); return !o || ui.mode === 'tpl' ? o : o.pages.find(p => p.id === o.pageId) || o.pages[0]; };
const pw = () => cur()?.settings.pageW || 1280, ph = () => cur()?.settings.pageH || 720;
const tplOf = o => o && o.templateId ? store.templates.find(t => t.id === o.templateId) : null;
const findV = id => pg()?.visuals.find(v => v.id === id);
const model = () => cur()?.model;
const measOf = id => model()?.measures.find(m => m.id === id);
const dimKeyName = k => model() ? D.dimName(model(), k) : '';

function vDefaults(type, md) {
  const cat = md ? md.dims.map(d => d.id) : [], pick = i => cat[i] ?? cat[0] ?? 'T:Month';
  const dim = { column: pick(0), bar: pick(1), line: 'T:Month', area: 'T:Month', donut: pick(4), table: pick(2), matrix: pick(1), slicer: pick(1) }[type] || '';
  return {
    type, title: '', titleAuto: true, dim, periods: D.isTime(dim) ? D.TIME_PERIODS[dim] : 12, sort: 'value', mid: md?.measures[0]?.id || '', m2: '', legend: '', mode: 'clustered',
    ref: 'none', drill: true, sStyle: 'list', slider: true, from: 12, to: 23, params: md ? md.measures.slice(0, 3).map(m => m.id) : [], cf: 'none',
    label: 'Button', icon: 'none', action: 'none', bmId: '', paramId: '', text: 'Text', fontSize: 16, bold: false, align: 'left', textColor: '#252423',
    src: null, fit: 'contain', notes: '', ov: {}, hidden: false, bind: '', sep: '', follow: false, upper: false, wide: false,
    navDir: 'vertical', navN: 3, navGap: 6, navSize: 13, navBold: true, navText: '#ffffff', navHi: true, navSel: '',
    sub: type === 'matrix' && cat.length > 1 ? [pick(0)] : [], cols: '', open: type === 'matrix' ? ['0'] : []
  };
}
function mkPage(name, ex = {}) { return { id: uid(), name, visuals: [], bookmarks: [], activeBm: '', sketch: [], ...ex }; }
function mkV(type, x, y, w, h, ex = {}, md = null) { return { id: uid(), ...vDefaults(type, md), x, y, w, h, ...ex }; }
function mOf(v) {
  if (v.paramId) { const p = findV(v.paramId); if (p && p.type === 'slicer' && p.sStyle === 'param') { const o = p.params.filter(id => measOf(id)); if (o.length) return o[clamp(ui.paramSel[p.id] || 0, 0, o.length - 1)]; } }
  return measOf(v.mid) ? v.mid : model()?.measures[0]?.id;
}
function autoTitle(v) {
  const m = measOf(mOf(v))?.name || 'Measure', dn = dimKeyName(v.dim) || 'item';
  switch (v.type) {
    case 'card': return m;
    case 'slicer': return v.sStyle === 'param' ? 'Measure' : v.sStyle === 'date' ? 'Date' : dn;
    case 'button': case 'pagenav': case 'shape': case 'text': case 'image': return '';
    case 'matrix': return `${m} by ${mxLevels(v).map(dimKeyName).join(' and ') || 'item'}${mxCols(v) ? ` and ${dimKeyName(v.cols)}` : ''}`;
  }
  let m2 = '';
  if (v.m2 && MULTI.includes(v.type) && v.type !== 'bar') m2 = v.m2 === 'ly' ? ' and last year' : v.m2 === 'bud' ? ' and budget' : measOf(v.m2) ? ` and ${measOf(v.m2).name}` : '';
  const lg = v.legend && MULTI.includes(v.type) && v.legend !== v.dim ? ` and ${dimKeyName(v.legend)}` : '';
  return `${m}${m2} by ${dn}${lg}`;
}
const tTitle = v => v.titleAuto ? autoTitle(v) : v.title;
const vName = v => v.type === 'text' ? `Text: ${v.bind === 'report' ? 'Report name' : v.bind === 'page' ? 'Page name' : trunc(v.text || '', 28)}` : v.type === 'image' ? 'Image' : v.type === 'button' ? `${v.label || (v.icon !== 'none' ? v.icon[0].toUpperCase() + v.icon.slice(1) : '') || 'Untitled'} button` : (tTitle(v) || TYPES[v.type].name);

/* ---------- seed content ---------- */
function logisticsModel() {
  const depot = D.newDim('Depot', 6, 'Manchester\nLeeds\nBirmingham\nBristol\nGlasgow\nLondon'), reg = D.newDim('Region', 4, 'North\nMidlands\nSouth\nScotland');
  return { seed: Math.floor(Math.random() * 1e9), currency: '£', dims: [depot, reg, D.newDim('Customer', 8), D.newDim('Product category', 5)], measures: [
    D.newMeasure({ name: 'Shipments', mag: 240000, trend: 'up', season: 'q4' }),
    D.newMeasure({ name: 'On-time %', type: 'ratio', fmt: 'percent', mag: 92, trend: 'steady', strength: 'low', stories: [{ dim: depot.id, member: 4, effect: 'weak' }] }),
    D.newMeasure({ name: 'Late deliveries', mag: 9800, trend: 'down', stories: [{ dim: depot.id, member: 4, effect: 'star' }] }),
    D.newMeasure({ name: 'Cost to serve', fmt: 'currency', mag: 6200000, trend: 'up', strength: 'low' }),
    D.newMeasure({ name: 'Cost per shipment', type: 'ratio', fmt: 'currency', mag: 25.8, trend: 'up', strength: 'low' })] };
}
function navTpl() {
  const S = { ...clone(BASE), title: 'Operations dashboard', showHeader: false, pageBg: '#F2F4F7', headerBg: '#1B2A41', palette: ['#2F6FED', '#1B2A41', '#F28C28', '#3BA776', '#D9475F', '#8A63D2'], radius: 8, shadow: true };
  const vis = [mkV('shape', 0, 0, 75, 720, { ov: { color: '#1B2A41', radius: 0, shadow: false } }), mkV('shape', 75, 0, 1205, 60, { ov: { color: '#FFFFFF', radius: 0, shadow: true } }),
    mkV('text', 15, 15, 45, 30, { text: 'NW', fontSize: 18, bold: true, align: 'center', textColor: '#FFFFFF' }),
    mkV('button', 15, 90, 45, 45, { label: '', icon: 'home', ov: { color: '#2F6FED', radius: 8, shadow: false } }), mkV('button', 15, 150, 45, 45, { label: '', icon: 'chart', ov: { color: '#2B3D5A', radius: 8, shadow: false } }),
    mkV('button', 15, 210, 45, 45, { label: '', icon: 'settings', ov: { color: '#2B3D5A', radius: 8, shadow: false } }),
    mkV('text', 105, 12, 600, 36, { text: 'Operations dashboard', fontSize: 20, bold: true, textColor: '#1B2A41' }),
    mkV('text', 960, 18, 300, 24, { text: 'Data as at [refresh date]', fontSize: 12, align: 'right', textColor: '#605E5C' })];
  return { id: uid(), client: 'Northwind Logistics', settings: S, visuals: vis, grid: { size: 15, snap: true, show: true } };
}
function navDemo(t) {
  const md = logisticsModel(), [shp, ot, late, cost] = md.measures.map(m => m.id), [depot, reg] = md.dims.map(d => d.id);
  const V = (type, x, y, w, h, ex) => mkV(type, x, y, w, h, ex, md);
  const vis = [V('card', 90, 75, 285, 105, { mid: shp }), V('card', 390, 75, 285, 105, { mid: ot }), V('card', 690, 75, 285, 105, { mid: late }), V('card', 990, 75, 285, 105, { mid: cost }),
    V('line', 90, 195, 585, 510, { mid: shp, legend: reg, notes: 'Page header and nav rail come from the Northwind Logistics template. Edit them from the template on the home screen.' }),
    V('column', 690, 195, 585, 510, { mid: late, dim: depot, m2: ot, ref: 'target', notes: 'Combo chart: late deliveries with on-time % on the right axis. Glasgow is set up as the problem depot.' })];
  return { id: uid(), name: 'Operations', templateId: t.id, updated: Date.now() + 1, settings: clone(t.settings), grid: { size: 15, snap: true, show: true }, notesMode: 'hidden', pages: [mkPage('Overview', { visuals: vis })], model: md };
}
function seed() {
  const t = navTpl();
  return { version: 1, templates: [t], wireframes: [navDemo(t)] };
}
function normalize() {
  const nv = (a, md) => (a || []).map(v => ({ ...vDefaults(v.type, md), ...v, ov: v.ov || {} }));
  store.templates.forEach(t => { t.settings = { ...clone(BASE), ...t.settings }; t.visuals = nv(t.visuals); t.grid = t.grid || { size: 15, snap: true, show: true }; t.notesMode = 'hidden'; t.bookmarks = []; });
  store.wireframes.forEach(w => {
    w.settings = { ...clone(BASE), ...w.settings }; w.model = w.model || D.defaultModel();
    w.grid = w.grid || { size: 15, snap: true, show: true }; w.notesMode = w.notesMode || 'hidden';
    if (!w.pages) { w.pages = [mkPage('Page 1', { visuals: w.visuals || [], bookmarks: w.bookmarks || [], activeBm: w.activeBm || '', sketch: w.sketch || [] })]; ['visuals', 'bookmarks', 'activeBm', 'sketch'].forEach(k => delete w[k]); }
    w.pages.forEach(p => {
      p.visuals = nv(p.visuals, w.model); p.bookmarks = p.bookmarks || []; p.sketch = p.sketch || [];
      p.bookmarks.forEach(bm => { bm.hidden = bm.hidden || []; bm.affects = bm.affects || p.visuals.map(v => v.id); });
    });
  });
}

/* ---------- data for visuals ---------- */
function dateRange() {
  const ds = pg().visuals.filter(v => v.type === 'slicer' && v.sStyle === 'date' && !v.hidden);
  if (!ds.length) return null;
  let a = 0, b = D.N_MONTHS - 1;
  ds.forEach(v => { a = Math.max(a, Math.min(v.from, v.to)); b = Math.min(b, Math.max(v.from, v.to)); });
  return [a, Math.max(a, b)];
}
function slicerFilters(exceptId) {
  const f = {};
  for (const v of pg().visuals) {
    if (v.type !== 'slicer' || v.hidden || v.id === exceptId || !['list', 'tiles', 'dropdown'].includes(v.sStyle) || D.isTime(v.dim)) continue;
    const s = ui.slicerSel[v.id]; if (s == null) continue;
    f[v.dim] = [s];
  }
  return f;
}
function computeV(v) {
  const md = model(), mid = mOf(v), meas = measOf(mid);
  if (!meas) return null;
  const dr = dateRange(), filters = slicerFilters(v.id), hl = ui.hl;
  let hlMode = null;
  if (hl) {
    const src = findV(hl.src);
    if (!src || src.hidden) ui.hl = null;
    else if (hl.src === v.id || v.dim === hl.dim) hlMode = 'fade';
    else if (['column', 'bar'].includes(v.type)) hlMode = 'portion';
    else hlMode = 'filter';
  }
  const fAll = { ...filters };
  if (hlMode === 'filter') fAll[hl.dim] = [hl.i];
  const time = D.isTime(v.dim), range = time ? timeRange(v.dim, v.periods, dr) : dr || [D.N_MONTHS - 12, D.N_MONTHS - 1];
  const axis = v.type === 'card' ? null : (v.dim || null), legend = MULTI.includes(v.type) && v.legend && v.legend !== v.dim ? v.legend : null;
  const q = (measure, variant, f, ax = axis, lg = legend) => D.query(md, { measure, variant, axis: ax, legend: lg, filters: f || fAll, range });
  const main = q(mid, 'base');
  if (!main) return null;
  let s2 = null;
  if (MULTI.includes(v.type) && v.type !== 'bar' && v.m2) {
    const m2id = (v.m2 === 'ly' || v.m2 === 'bud') ? mid : v.m2, m2meas = measOf(m2id);
    if (m2meas) {
      const r = q(m2id, v.m2 === 'ly' ? 'ly' : v.m2 === 'bud' ? 'bud' : 'base', fAll, axis, null);
      s2 = { name: v.m2 === 'ly' ? `${meas.name} last year` : v.m2 === 'bud' ? `${meas.name} budget` : m2meas.name, vals: r.series[0].vals, meas: m2meas, same: v.m2 === 'ly' || v.m2 === 'bud' };
    }
  }
  let hvals = null;
  if (hlMode === 'portion') hvals = q(mid, 'base', { ...fAll, [hl.dim]: [hl.i] }).series.map(s => s.vals);
  let ly = null, tot = null, totLy = null;
  if (v.type === 'card' || v.type === 'table') ly = q(mid, 'ly');
  if (v.type === 'table') { tot = q(mid, 'base', fAll, null, null).series[0].vals[0]; totLy = q(mid, 'ly', fAll, null, null).series[0].vals[0]; }
  let order = main.keys.map((_, i) => i);
  if (!time && v.dim && v.sort === 'value' && ['column', 'bar', 'table', 'donut'].includes(v.type)) {
    const t = order.map(i => main.series.reduce((a, s) => a + (s.vals[i] || 0), 0));
    order.sort((a, b) => t[b] - t[a]);
  }
  const pick = arr => order.map(i => arr[i]);
  const cs = md.currency || '£';
  const data = {
    meas, fmt: x => D.fmtValue(x, meas, cs), labels: pick(main.labels), keys: pick(main.keys), time, hlMode,
    series: main.series.map((s, si) => ({ name: legend ? s.name : meas.name, vals: pick(s.vals), hvals: hvals ? pick(hvals[si]) : null })),
    s2: s2 ? { ...s2, vals: pick(s2.vals), fmt: x => D.fmtValue(x, s2.meas, cs) } : null,
    ly: ly ? pick(ly.series[0].vals) : null, tot, totLy
  };
  ui.vdata.set(v.id, data);
  return data;
}
// The months a time axis shows: the last `periods` years, quarters or months up to the end of the date range.
function timeRange(key, periods, dr) {
  const per = clamp(periods || D.TIME_PERIODS[key], 1, D.TIME_MAX[key]), end = dr ? dr[1] : D.N_MONTHS - 1;
  const start = key === 'T:Month' ? end - per + 1 : key === 'T:Quarter' ? (Math.floor(end / 3) - per + 1) * 3 : (Math.floor(end / 12) - per + 1) * 12;
  return [Math.max(dr ? dr[0] : 0, start, 0), end];
}
/* Matrix: rows are a hierarchy of up to three fields (dimensions or Year, Quarter, Month), with an optional field across
   the columns. Each row is its own query filtered to its members (a time member narrows the month range), so every
   subtotal is the engine's total for that slice and reconciles with the other visuals. */
const MX_LEVELS = 3;
function mxLevels(v) { const md = model(), ok = k => D.isTime(k) || md?.dims.some(d => d.id === k); return [v.dim, ...(v.sub || [])].filter((k, i, a) => k && ok(k) && a.indexOf(k) === i).slice(0, MX_LEVELS); }
function mxCols(v) { return v.cols && !mxLevels(v).includes(v.cols) && (D.isTime(v.cols) || model()?.dims.some(d => d.id === v.cols)) ? v.cols : ''; }
// The time field whose "Periods shown" sets a visual's month range: the axis, or for a matrix the columns, else a row level.
function periodKey(v) { if (v.type !== 'matrix') return D.isTime(v.dim) ? v.dim : ''; const c = mxCols(v); return D.isTime(c) ? c : mxLevels(v).find(D.isTime) || ''; }
function narrow(key, k, f, r) {
  if (!D.isTime(key)) return [{ ...f, [key]: [k] }, r];
  const lo = key === 'T:Year' ? k * 12 : key === 'T:Quarter' ? k * 3 : k, hi = key === 'T:Year' ? lo + 11 : key === 'T:Quarter' ? lo + 2 : lo;
  return [f, [Math.max(r[0], lo), Math.min(r[1], hi)]];
}
function computeMatrix(v) {
  const md = model(), mid = mOf(v), meas = measOf(mid), levels = mxLevels(v);
  if (!meas || !levels.length) return null;
  const dr = dateRange(), fAll = slicerFilters(v.id), hl = ui.hl, pk = periodKey(v), cols = mxCols(v);
  if (hl && hl.src !== v.id) { const src = findV(hl.src); if (!src || src.hidden) ui.hl = null; else fAll[hl.dim] = [hl.i]; }
  const range = pk ? timeRange(pk, v.periods, dr) : dr || [D.N_MONTHS - 12, D.N_MONTHS - 1];
  const q = (variant, f, r, axis) => D.query(md, { measure: mid, variant, axis, filters: f, range: r });
  const head = cols ? q('base', fAll, range, cols) : null;
  // A row's cells: one per column member plus its total, or the measure and last year when there are no columns.
  const cells = (f, r) => {
    const tot = q('base', f, r, null).series[0].vals[0];
    if (!cols) return [tot, q('ly', f, r, null).series[0].vals[0]];
    const res = q('base', f, r, cols), at = new Map(res.keys.map((k, i) => [k, res.series[0].vals[i]]));
    return [...head.keys.map(k => at.has(k) ? at.get(k) : null), tot];
  };
  const open = new Set(v.open || []);
  const build = (lv, f, r, path) => {
    const key = levels[lv], res = q('base', f, r, key), vals = res.series[0].vals;
    let idx = res.keys.map((_, i) => i);
    if (!D.isTime(key)) { if (f[key]) idx = idx.filter(i => f[key].includes(res.keys[i])); if (v.sort === 'value') idx.sort((a, b) => (vals[b] || 0) - (vals[a] || 0)); }
    return idx.map(i => {
      const k = res.keys[i], p = path ? `${path}/${k}` : String(k), [f2, r2] = narrow(key, k, f, r), kids = lv < levels.length - 1, on = kids && open.has(p);
      return { label: res.labels[i], path: p, lv, kids, open: on, vals: cells(f2, r2), children: on ? build(lv + 1, f2, r2, p) : [] };
    });
  };
  return { meas, fmt: x => D.fmtValue(x, meas, md.currency || '£'), levels, cols, colLabels: head ? head.labels : null, rows: build(0, fAll, range, ''), total: cells(fAll, range) };
}
// Every row path that has children, for Expand all.
function mxAllPaths(v) {
  const out = [], walk = rows => rows.forEach(r => { if (r.kids) { out.push(r.path); walk(r.children); } });
  const all = { ...v, open: [] }, md = computeMatrix(all); if (!md) return out;
  // Expanding level by level reaches every parent row.
  for (let lv = 0; lv < md.levels.length - 1; lv++) { all.open = out.slice(); out.length = 0; walk(computeMatrix(all).rows); }
  return out;
}
function niceMax(m) { if (!(m > 0)) return 1; const p = Math.pow(10, Math.floor(Math.log10(m))); const f = m / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; }
function op(v, key, d) { const h = ui.hl; if (!h || !d || d.hlMode !== 'fade') return 1; return v.dim === h.dim && key !== h.i ? .28 : 1; }

/* ---------- visual rendering ---------- */
const OVK = ['dataLabels', 'axisLabels', 'legend', 'gridlines', 'tooltips', 'border', 'shadow', 'radius', 'color'];
function eff(v, base) { const s = base || cur().settings, r = { ...s }, o = v.ov || {}; if (v.type === 'text' || v.type === 'image') { r.shadow = false; r.border = false; } for (const k of OVK) if (o[k] !== undefined && o[k] !== null) r[k] = o[k]; return r; }
function faceStyle(S, bg) { return `background:${bg};border:1px solid ${S.border ? S.borderColor : 'transparent'};border-radius:${S.radius}px;box-shadow:${S.shadow ? '0 1px 2px rgba(0,0,0,.08),0 4px 14px rgba(0,0,0,.13)' : 'none'}`; }
function legendSVG(items) { let x = 2, o = ''; items.forEach(([nm, c]) => { o += `<circle cx="${x + 4}" cy="8" r="4" fill="${c}"/><text x="${x + 12}" y="11">${esc(trunc(nm, 22))}</text>`; x += 22 + Math.min(nm.length, 22) * 5.6; }); return o; }
const svgWrap = (W, H, o) => `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-size="10" fill="#605E5C" aria-hidden="true">${o}</svg>`;
function refLine(v, base, x1, x2, Y, horiz, fmt) {
  if (v.ref === 'none') return '';
  const vals = base.filter(x => x != null), avg = vals.reduce((a, b) => a + b, 0) / (vals.length || 1), val = v.ref === 'target' ? avg * 1.12 : avg, t = `${v.ref === 'target' ? 'Target' : 'Average'} ${fmt(val)}`;
  if (horiz) { const x = Y(val); return `<line x1="${x}" x2="${x}" y1="${x1}" y2="${x2}" stroke="#A4262C" stroke-dasharray="6 4" stroke-width="1.5"/><text x="${x + 4}" y="${x1 + 10}" fill="#A4262C">${t}</text>`; }
  const y = Y(val); return `<line x1="${x1}" x2="${x2}" y1="${y}" y2="${y}" stroke="#A4262C" stroke-dasharray="6 4" stroke-width="1.5"/><text x="${x2 - 2}" y="${y - 4}" text-anchor="end" fill="#A4262C">${t}</text>`;
}
function svgCart(v, S, W, H, d) {
  const lab = d.labels, keys = d.keys, ser = d.series, s2 = d.s2, n = lab.length, K = ser.length;
  const col = k => K === 1 && S.color ? S.color : S.palette[k % S.palette.length], c2 = S.palette[K % S.palette.length];
  const stacked = v.type === 'column' && K > 1 && v.mode !== 'clustered', pct = stacked && v.mode === 'pct';
  const sums = lab.map((_, i) => ser.reduce((a, s) => a + (s.vals[i] || 0), 0));
  const same = s2 && s2.same && !pct, base1 = stacked ? Math.max(...sums) : Math.max(...ser.flatMap(s => s.vals.map(x => x || 0)));
  const max = pct ? 1 : niceMax(Math.max(base1, same ? Math.max(...s2.vals.map(x => x || 0)) : 0) * 1.1), max2 = s2 ? (same ? max : niceMax(Math.max(...s2.vals.map(x => x || 0)) * 1.1)) : 1;
  const fv = x => pct ? Math.round(x * 100) + '%' : d.fmt(x), legend = S.legend && (K > 1 || !!s2), lg = legend ? 20 : 0;
  const left = S.axisLabels ? 44 : 8, right = s2 && !same && S.axisLabels ? 44 : 10, bottom = S.axisLabels ? 20 : 8, top = lg + (S.dataLabels ? 16 : 8);
  const pw = Math.max(10, W - left - right), ph = Math.max(10, H - top - bottom), Y = x => top + ph - (x || 0) / max * ph, Y2 = x => top + ph - (x || 0) / max2 * ph;
  const band = pw / n, cx = v.type === 'column' ? i => left + band * (i + .5) : i => left + (n > 1 ? pw * i / (n - 1) : pw / 2), step = Math.max(1, Math.ceil(n * 46 / pw));
  const portion = d.hlMode === 'portion';
  let o = '';
  if (legend) o += legendSVG([...ser.map((s, k) => [s.name, col(k)]), ...(s2 ? [[s2.name, c2]] : [])]);
  for (let k = 0; k <= 4; k++) {
    const y = top + ph - ph * k / 4;
    if (S.gridlines && k > 0) o += `<line x1="${left}" x2="${left + pw}" y1="${y}" y2="${y}" stroke="#E1DFDD" stroke-dasharray="3 3"/>`;
    if (S.axisLabels) { o += `<text x="${left - 6}" y="${y + 3}" text-anchor="end">${fv(max * k / 4)}</text>`; if (s2 && !same) o += `<text x="${left + pw + 6}" y="${y + 3}">${s2.fmt(max2 * k / 4)}</text>`; }
  }
  o += `<line x1="${left}" x2="${left + pw}" y1="${top + ph}" y2="${top + ph}" stroke="#C8C6C4"/>`;
  if (v.type === 'column') {
    const gw = Math.min(band * .7, K * 52), bw = stacked ? gw : gw / K;
    lab.forEach((_, i) => {
      const x0 = left + band * i + (band - gw) / 2; let acc = 0, hacc = 0;
      ser.forEach((s, k) => {
        const raw = s.vals[i] || 0, val = pct ? (sums[i] ? raw / sums[i] : 0) : raw, h = val / max * ph, x = stacked ? x0 : x0 + bw * k, y = stacked ? Y(acc + val) : Y(val);
        const w = Math.max(1, bw - (stacked ? 0 : 1)), opa = op(v, keys[i], d);
        o += `<rect data-i="${i}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${Math.max(0, h).toFixed(1)}" fill="${col(k)}" opacity="${portion ? .3 : opa}"/>`;
        if (portion && s.hvals) {
          const hraw = s.hvals[i] || 0, hv = pct ? (sums[i] ? hraw / sums[i] : 0) : hraw, hh = hv / max * ph, hy = stacked ? Y(hacc + hv) : Y(hv);
          o += `<rect class="hlbar" x="${x.toFixed(1)}" y="${hy.toFixed(1)}" width="${w.toFixed(1)}" height="${Math.max(0, hh).toFixed(1)}" fill="${col(k)}"/>`;
          hacc += hv;
        }
        if (stacked) acc += val;
        if (S.dataLabels) { if (stacked) { if (h > 14) o += `<text x="${x + bw / 2}" y="${y + h / 2 + 3}" text-anchor="middle" fill="#fff">${fv(val)}</text>`; } else if (bw > 18) o += `<text x="${x + bw / 2}" y="${y - 4}" text-anchor="middle" fill="#252423">${fv(val)}</text>`; }
      });
      if (S.axisLabels && i % step === 0) o += `<text x="${x0 + gw / 2}" y="${H - 5}" text-anchor="middle">${esc(trunc(lab[i], Math.max(4, Math.floor(band * step / 6))))}</text>`;
    });
  } else {
    ser.forEach((s, k) => {
      const pts = s.vals.map((val, i) => [cx(i), Y(val)]), p = pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' ');
      if (v.type === 'area') o += `<path d="${p} L${pts[n - 1][0].toFixed(1)} ${top + ph} L${pts[0][0].toFixed(1)} ${top + ph} Z" fill="${col(k)}" opacity="${K > 1 ? .16 : .28}"/>`;
      o += `<path d="${p}" fill="none" stroke="${col(k)}" stroke-width="2" stroke-linejoin="round"/>`;
      pts.forEach((q, i) => {
        if (v.type === 'line' && n <= 40) o += `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="2.6" fill="${col(k)}"/>`;
        if (S.dataLabels && (i % step === 0 || i === n - 1)) o += `<text x="${q[0]}" y="${q[1] - 7}" text-anchor="middle" fill="#252423">${fv(s.vals[i])}</text>`;
      });
    });
    if (S.axisLabels) lab.forEach((l, i) => { if (i % step === 0) o += `<text x="${cx(i)}" y="${H - 5}" text-anchor="middle">${esc(l)}</text>`; });
  }
  if (s2) {
    const pts = s2.vals.map((val, i) => [cx(i), Y2(val)]);
    o += `<path d="${pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' ')}" fill="none" stroke="${c2}" stroke-width="2" ${v.type === 'column' ? '' : 'stroke-dasharray="6 4"'} stroke-linejoin="round"/>`;
    pts.forEach((q, i) => { o += `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="3" fill="#fff" stroke="${c2}" stroke-width="2"/>`; if (S.dataLabels && (i % step === 0 || i === n - 1)) o += `<text x="${q[0]}" y="${q[1] - 8}" text-anchor="middle" fill="${c2}">${s2.fmt(s2.vals[i])}</text>`; });
  }
  if (!pct) o += refLine(v, stacked ? sums : ser[0].vals, left, left + pw, Y, false, d.fmt);
  if (v.type !== 'column') { const hw = n > 1 ? pw / (n - 1) / 2 : pw / 2; lab.forEach((_, i) => { o += `<rect data-i="${i}" x="${(cx(i) - hw).toFixed(1)}" y="${top}" width="${(hw * 2).toFixed(1)}" height="${ph}" fill="transparent"/>`; }); }
  return svgWrap(W, H, o);
}
function svgBar(v, S, W, H, d) {
  const lab = d.labels, keys = d.keys, ser = d.series, n = lab.length, K = ser.length, col = k => K === 1 && S.color ? S.color : S.palette[k % S.palette.length];
  const stacked = K > 1 && v.mode !== 'clustered', pct = stacked && v.mode === 'pct', sums = lab.map((_, i) => ser.reduce((a, s) => a + (s.vals[i] || 0), 0));
  const max = pct ? 1 : niceMax((stacked ? Math.max(...sums) : Math.max(...ser.flatMap(s => s.vals.map(x => x || 0)))) * 1.05), fv = x => pct ? Math.round(x * 100) + '%' : d.fmt(x);
  const legend = S.legend && K > 1, lg = legend ? 20 : 0, left = S.axisLabels ? Math.min(100, W * .32) : 8, right = S.dataLabels && !stacked ? 46 : 12, top = 4 + lg, bottom = 4;
  const pw = Math.max(10, W - left - right), ph = Math.max(10, H - top - bottom), band = ph / n, gh = Math.min(band * .72, K * 26), bh = stacked ? gh : gh / K, X = x => left + (x || 0) / max * pw;
  const portion = d.hlMode === 'portion';
  let o = '';
  if (legend) o += legendSVG(ser.map((s, k) => [s.name, col(k)]));
  if (S.gridlines) for (let k = 1; k <= 4; k++) { const x = left + pw * k / 4; o += `<line x1="${x}" x2="${x}" y1="${top}" y2="${top + ph}" stroke="#E1DFDD" stroke-dasharray="3 3"/>`; }
  o += `<line x1="${left}" x2="${left}" y1="${top}" y2="${top + ph}" stroke="#C8C6C4"/>`;
  lab.forEach((l, i) => {
    const y0 = top + band * i + (band - gh) / 2; let acc = 0, hacc = 0;
    ser.forEach((s, k) => {
      const raw = s.vals[i] || 0, val = pct ? (sums[i] ? raw / sums[i] : 0) : raw, w = val / max * pw, x = stacked ? X(acc) : left, y = stacked ? y0 : y0 + bh * k, h = Math.max(1, bh - (stacked ? 0 : 1));
      o += `<rect data-i="${i}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0, w).toFixed(1)}" height="${h.toFixed(1)}" fill="${col(k)}" opacity="${portion ? .3 : op(v, keys[i], d)}"/>`;
      if (portion && s.hvals) { const hraw = s.hvals[i] || 0, hv = pct ? (sums[i] ? hraw / sums[i] : 0) : hraw; o += `<rect class="hlbar" x="${(stacked ? X(hacc) : left).toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0, hv / max * pw).toFixed(1)}" height="${h.toFixed(1)}" fill="${col(k)}"/>`; hacc += hv; }
      if (stacked) acc += val;
      if (S.dataLabels) { if (stacked) { if (w > 34) o += `<text x="${x + w / 2}" y="${y + bh / 2 + 3}" text-anchor="middle" fill="#fff">${fv(val)}</text>`; } else o += `<text x="${x + w + 4}" y="${y + bh / 2 + 3}" fill="#252423">${fv(val)}</text>`; }
    });
    if (S.axisLabels) o += `<text x="${left - 6}" y="${y0 + gh / 2 + 3}" text-anchor="end">${esc(trunc(l, Math.floor(left / 6)))}</text>`;
  });
  if (!pct) o += refLine(v, stacked ? sums : ser[0].vals, top, top + ph, X, true, d.fmt);
  return svgWrap(W, H, o);
}
function svgDonut(v, S, W, H, d) {
  const vals = d.series[0].vals.map(x => Math.max(0, x || 0)), lab = d.labels, tot = vals.reduce((a, b) => a + b, 0) || 1, lw = S.legend ? Math.min(130, W * .44) : 0;
  const cx = (W - lw) / 2, cy = H / 2, r = Math.max(12, Math.min((W - lw) / 2, H / 2) - 6), ri = r * .58; let a0 = -Math.PI / 2, o = '';
  vals.forEach((val, i) => {
    const f = val / tot, a1 = a0 + Math.max(f, 1e-6) * Math.PI * 2, lg = f > .5 ? 1 : 0, c = S.palette[i % S.palette.length], Pt = (rad, a) => [(cx + rad * Math.cos(a)).toFixed(1), (cy + rad * Math.sin(a)).toFixed(1)];
    const [x0, y0] = Pt(r, a0), [x1, y1] = Pt(r, a1), [x2, y2] = Pt(ri, a1), [x3, y3] = Pt(ri, a0);
    o += `<path data-i="${i}" d="M${x0} ${y0}A${r} ${r} 0 ${lg} 1 ${x1} ${y1}L${x2} ${y2}A${ri} ${ri} 0 ${lg} 0 ${x3} ${y3}Z" fill="${c}" stroke="#fff" stroke-width="1" opacity="${op(v, d.keys[i], d)}"/>`;
    if (S.dataLabels && f > .06) { const [tx, ty] = Pt((r + ri) / 2, (a0 + a1) / 2); o += `<text x="${tx}" y="${+ty + 3}" text-anchor="middle" fill="#fff" font-weight="600">${Math.round(f * 100)}%</text>`; }
    a0 = a1;
  });
  if (lw) { const lh = 16, y0 = Math.max(4, cy - vals.length * lh / 2); vals.forEach((_, i) => { o += `<rect x="${W - lw + 4}" y="${y0 + i * lh}" width="8" height="8" rx="4" fill="${S.palette[i % S.palette.length]}"/><text x="${W - lw + 16}" y="${y0 + i * lh + 8}">${esc(trunc(lab[i], Math.floor((lw - 16) / 6)))}</text>`; }); }
  return svgWrap(W, H, o);
}
// Change against last year: points for a percentage, the difference for another ratio, a percentage for a sum.
function changeFns(d) {
  const ratio = d.meas.type === 'ratio', chg = (a, b) => ratio ? (a - b) * (d.meas.fmt === 'percent' ? 100 : 1) : (b ? (a - b) / b * 100 : 0);
  return [chg, (a, b) => { const c = chg(a, b); return ratio && d.meas.fmt === 'percent' ? `${c >= 0 ? '+' : ''}${c.toFixed(1)} pts` : ratio ? `${c >= 0 ? '+' : ''}${d.fmt(c)}` : `${c >= 0 ? '+' : ''}${c.toFixed(1)}%`; }];
}
function htmlTable(v, S, d) {
  const vals = d.series[0].vals, ly = d.ly || [], max = Math.max(...vals.map(x => x || 0)) || 1, bc = S.color || S.palette[0], [chg, chgTxt] = changeFns(d);
  const rows = vals.map((val, i) => {
    const w = Math.round((val || 0) / max * 100), c = chg(val, ly[i]);
    const bar = v.cf === 'bars' ? ` style="background:linear-gradient(to right,${bc}55 ${w}%,transparent ${w}%)"` : '';
    const icon = v.cf === 'icons' ? `<span style="color:${c >= 0 ? '#107C10' : '#A4262C'}">${c >= 0 ? '▲' : '▼'}</span> ` : '';
    return `<tr data-i="${i}" style="opacity:${op(v, d.keys[i], d)}"><td>${esc(d.labels[i])}</td><td class="n"${bar}>${d.fmt(val)}</td><td class="n">${d.fmt(ly[i])}</td><td class="n">${icon}${chgTxt(val, ly[i])}</td></tr>`;
  }).join('');
  return `<div class="fill"><table class="vtab ${S.gridlines ? 'gl' : ''}"><thead><tr><th>${esc(dimKeyName(v.dim) || 'Item')}</th><th class="n">${esc(d.meas.name)}</th><th class="n">Last year</th><th class="n">Change</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td>Total</td><td class="n">${d.fmt(d.tot)}</td><td class="n">${d.fmt(d.totLy)}</td><td class="n">${chgTxt(d.tot, d.totLy)}</td></tr></tfoot></table></div>`;
}
function htmlMatrix(v, S, d) {
  const [, chgTxt] = changeFns(d), flat = [], walk = rows => rows.forEach(r => { flat.push(r); walk(r.children); });
  walk(d.rows);
  const nums = vals => d.cols ? vals.map(x => `<td class="n">${x == null ? '' : d.fmt(x)}</td>`).join('') : `<td class="n">${d.fmt(vals[0])}</td><td class="n">${d.fmt(vals[1])}</td><td class="n">${chgTxt(vals[0], vals[1])}</td>`;
  const head = d.cols ? [...d.colLabels, 'Total'].map(l => `<th class="n">${esc(l)}</th>`).join('') : `<th class="n">${esc(d.meas.name)}</th><th class="n">Last year</th><th class="n">Change</th>`;
  const rows = flat.map(r => `<tr class="${r.open ? 'mxopen' : ''}"><td class="mxl" style="padding-left:${6 + r.lv * 14}px">${r.kids ? `<button class="mxt" data-act="mxtog" data-id="${v.id}" data-path="${r.path}" aria-expanded="${r.open}" aria-label="${r.open ? 'Collapse' : 'Expand'} ${esc(r.label)}">${r.open ? '−' : '+'}</button>` : d.levels.length > 1 ? '<span class="mxs"></span>' : ''}${esc(r.label)}</td>${nums(r.vals)}</tr>`).join('');
  return `<div class="fill"><table class="vtab mx ${S.gridlines ? 'gl' : ''}"><thead><tr><th>${esc(dimKeyName(d.levels[0]))}</th>${head}</tr></thead><tbody>${rows}</tbody><tfoot><tr><td>Total</td>${nums(d.total)}</tr></tfoot></table></div>`;
}
function slicerMembers(v) { const dm = model()?.dims.find(x => x.id === v.dim); return dm ? D.memberNames(dm) : []; }
function htmlSlicer(v) {
  const st = v.sStyle || 'list';
  if (st === 'param') { const o = v.params.filter(id => measOf(id)), sel = clamp(ui.paramSel[v.id] || 0, 0, Math.max(0, o.length - 1)); return `<div class="fill"><div class="vtiles">${o.map((id, i) => `<span data-p="${i}" class="${i === sel ? 'on' : ''}">${esc(measOf(id).name)}</span>`).join('') || '<span>Choose measures in the edit sheet</span>'}</div></div>`; }
  if (st === 'date') { const a = Math.min(v.from, v.to), b = Math.max(v.from, v.to), mx = D.N_MONTHS - 1; return `<div class="fill"><div class="vdate"><span>${D.monthLabel(a)} ${CAL}</span><span>${D.monthLabel(b)} ${CAL}</span></div>${v.slider ? `<div class="vslider"><b style="left:${a / mx * 100}%;right:${100 - b / mx * 100}%"></b><i style="left:${a / mx * 100}%"></i><i style="left:${b / mx * 100}%"></i></div>` : ''}</div>`; }
  const lab = slicerMembers(v), on = ui.slicerSel[v.id] ?? -1;
  if (st === 'tiles') return `<div class="fill"><div class="vtiles">${lab.map((l, i) => `<span data-i="${i}" class="${i === on ? 'on' : ''}">${esc(l)}</span>`).join('')}</div></div>`;
  if (st === 'dropdown') return `<div class="fill"><div class="vdd" data-dd>${on >= 0 && lab[on] ? esc(lab[on]) : 'All'}<span aria-hidden="true">▾</span></div></div>`;
  return `<div class="fill"><ul class="vsl">${lab.map((l, i) => `<li data-i="${i}"><span class="cb ${i === on ? 'on' : ''}"></span>${esc(l)}</li>`).join('')}</ul></div>`;
}
function htmlCard(v, S, W, H, d) {
  const val = d.series[0].vals[0], ly = d.ly ? d.ly[0] : null, fs = Math.round(Math.min(H * .42, W * .17));
  let ch = '';
  if (ly != null && isFinite(ly) && ly !== 0) {
    if (d.meas.type === 'ratio' && d.meas.fmt === 'percent') { const c = (val - ly) * 100; ch = `${c >= 0 ? '+' : ''}${c.toFixed(1)} pts vs last year`; }
    else { const c = (val - ly) / Math.abs(ly) * 100; ch = `${c >= 0 ? '+' : ''}${c.toFixed(1)}% vs last year`; }
  }
  return `<div class="vcard"><div class="vcv" style="font-size:${fs}px;color:${S.color || '#252423'}">${d.fmt(val)}</div><div class="vcl">${esc(tTitle(v))}</div>${H > 80 && ch ? `<div class="vcd">${ch}</div>` : ''}</div>`;
}
function frontHTML(v, S) {
  const t = v.type, title = tTitle(v), showT = !['card', 'button', 'pagenav', 'text', 'image'].includes(t) && !!title, np = ['button', 'pagenav', 'text', 'image'].includes(t) || (t === 'shape' && !showT), pad = np ? 0 : 10;
  const th = showT ? Math.round(S.titleSize * 1.333 * 1.35) + 6 : 0, W = Math.max(20, v.w - pad * 2 - 2), H = Math.max(20, v.h - pad * 2 - 2 - th);
  const bg = t === 'button' ? (S.color || S.palette[0]) : t === 'shape' ? (S.color || S.visualBg) : (t === 'text' || t === 'image') ? (S.color || 'transparent') : S.visualBg;
  let body = '';
  if (DATA_TYPES.includes(t)) {
    const d = t === 'matrix' ? computeMatrix(v) : computeV(v);
    if (!d) body = '<div class="imgph">Choose a measure</div>';
    else switch (t) {
      case 'column': case 'line': case 'area': body = svgCart(v, S, W, H, d); break;
      case 'bar': body = svgBar(v, S, W, H, d); break;
      case 'donut': body = svgDonut(v, S, W, H, d); break;
      case 'table': body = htmlTable(v, S, d); break;
      case 'matrix': body = htmlMatrix(v, S, d); break;
      case 'card': body = htmlCard(v, S, W, H, d); break;
    }
  } else switch (t) {
    case 'slicer': body = htmlSlicer(v); break;
    case 'button': body = `<div class="vbtn">${v.icon !== 'none' && P[v.icon] ? `<svg viewBox="0 0 24 24" aria-hidden="true">${P[v.icon]}</svg>` : ''}${v.label ? `<span>${esc(v.label)}</span>` : ''}</div>`; break;
    case 'text': body = `<div class="vtext" style="font-size:${v.fontSize}px;font-weight:${v.bold ? 700 : 400};color:${v.textColor};justify-content:${{ left: 'flex-start', center: 'center', right: 'flex-end' }[v.align] || 'flex-start'};text-align:${v.align}">${esc(textStyle(v.text, v))}</div>`; break;
    case 'pagenav': body = htmlNav(v, S); break;
    case 'image': body = v.src ? `<img class="vimg" src="${v.src}" alt="" style="object-fit:${v.fit}">` : '<div class="imgph">Image</div>'; break;
  }
  return `<div class="face front ${np ? 'nopad' : ''}" style="${t === 'pagenav' ? 'background:transparent;border:0;box-shadow:none' : faceStyle(S, bg)}">${showT ? `<div class="vt" style="font-size:${S.titleSize}pt">${esc(title)}</div>` : ''}<div class="vb">${body}</div>${(v.notes || '').trim() && cur()?.notesMode !== 'side' ? '<span class="hasnote" aria-hidden="true"></span>' : ''}</div>`;
}
/* Page navigator: one button per page, in page-tab order. bindText() gives a wireframe's copy its page names
   (_pages) and the active page's index (_cur); a template shows navN placeholders, Page 1 to Page N. */
function htmlNav(v, S) {
  const names = v._pages || Array.from({ length: v.navN }, (_, i) => `Page ${i + 1}`), at = v._pages ? v._cur : 0, fill = S.color || S.palette[0];
  return `<div class="vnav ${v.navDir === 'horizontal' ? 'row' : ''}" style="gap:${v.navGap}px">${names.map((n, i) => {
    const on = v.navHi && i === at;
    return `<div class="vnb ${on ? 'on' : ''}" style="${faceStyle(S, on ? v.navSel || S.palette[1] || fill : fill)};color:${v.navText};font-size:${v.navSize}px;font-weight:${v.navBold || on ? 700 : 400}"><span>${esc(n)}</span></div>`;
  }).join('')}</div>`;
}
function layoutHTML(v, S0) { if (v.hidden) return ''; return `<div class="vis locked" style="left:${v.x}px;top:${v.y}px;width:${v.w}px;height:${v.h}px"><div class="flip">${frontHTML({ ...v, notes: '' }, eff(v, S0))}</div></div>`; }
function visHTML(v, pin) {
  if (v.hidden && !ui.ghost) return '';
  const S = eff(v), hi = HIER.indexOf(v.dim), drill = v.drill && hi >= 0 && MULTI.includes(v.type), dd = v.type === 'slicer' && v.sStyle === 'dropdown' && ui.dropOpen === v.id;
  const ddl = dd ? `<ul class="ddlist" style="top:${v.h - 6}px"><li data-all>All</li>${slicerMembers(v).map((l, i) => `<li data-i="${i}"><span class="cb ${i === ui.slicerSel[v.id] ? 'on' : ''}"></span>${esc(l)}</li>`).join('')}</ul>` : '';
  return `<div class="vis ${ui.sel === v.id || ui.multi.has(v.id) ? 'sel' : ''} ${ui.flipped.has(v.id) ? 'flipped' : ''} ${v.hidden ? 'ghosted' : ''} ${dd ? 'ddopen' : ''}" data-id="${v.id}" tabindex="0" aria-label="${esc(vName(v))}. Press Enter to edit" style="left:${v.x}px;top:${v.y}px;width:${v.w}px;height:${v.h}px">
 <div class="flip">${frontHTML(v, S)}<div class="face back" style="border-radius:${S.radius}px"><div class="nhead"><span>Notes: ${esc(vName(v))}</span><button data-act="flipback">Done</button></div><textarea data-notes="${v.id}" aria-label="Notes for ${esc(vName(v))}" placeholder="Type notes for this visual">${esc(v.notes)}</textarea></div></div>
 ${drill ? `<div class="vhdr"><button data-act="drillup" aria-label="Drill up" ${hi === 0 ? 'disabled' : ''}>${I.up}</button><button data-act="drilldown" aria-label="Drill down" ${hi === HIER.length - 1 ? 'disabled' : ''}>${I.down}</button></div>` : ''}
 ${HANDLES.map(h => `<span class="vrs" data-h="${h}" aria-hidden="true"></span>`).join('')}${pin ? `<span class="pin vpin">${pin}</span>` : ''}${ddl}</div>`;
}
function tipHTML(v, i) {
  const S = eff(v), d = ui.vdata.get(v.id);
  if (!S.tooltips || !d) return '';
  if (MULTI.includes(v.type)) {
    const K = d.series.length, rows = d.series.map((s, k) => [s.name, d.fmt(s.vals[i]), K === 1 && S.color ? S.color : S.palette[k % S.palette.length]]);
    if (d.hlMode === 'portion') d.series.forEach(s => { if (s.hvals) rows.push([`${s.name} (highlighted)`, d.fmt(s.hvals[i]), '#605E5C']); });
    if (d.s2) rows.push([d.s2.name, d.s2.fmt(d.s2.vals[i]), S.palette[K % S.palette.length]]);
    return `<b>${esc(d.labels[i])}</b>${rows.map(([nm, val, c]) => `<div><span><i style="background:${c}"></i>${esc(nm)}</span><span>${val}</span></div>`).join('')}`;
  }
  if (v.type === 'donut') { const vals = d.series[0].vals, tot = vals.reduce((a, b) => a + (b || 0), 0) || 1; return `<b>${esc(d.labels[i])}</b><div><span>${esc(d.meas.name)}</span><span>${d.fmt(vals[i])}</span></div><div><span>Share</span><span>${Math.round((vals[i] || 0) / tot * 100)}%</span></div>`; }
  return '';
}

/* ---------- home ---------- */
function thumbRects(list, S) {
  return list.filter(v => !v.hidden).map(v => {
    if (v.type === 'pagenav') { const n = v._pages ? v._pages.length : v.navN, row = v.navDir === 'horizontal', g = v.navGap, bw = row ? (v.w - g * (n - 1)) / n : v.w, bh = row ? v.h : (v.h - g * (n - 1)) / n;
      return Array.from({ length: n }, (_, i) => `<rect x="${row ? v.x + i * (bw + g) : v.x}" y="${row ? v.y : v.y + i * (bh + g)}" width="${Math.max(1, bw)}" height="${Math.max(1, bh)}" rx="${v.ov && v.ov.radius !== undefined ? v.ov.radius : S.radius}" fill="${v.ov && v.ov.color || S.palette[0]}"/>`).join(''); }
    const f = v.ov && v.ov.color || (v.type === 'button' ? S.palette[0] : v.type === 'text' ? 'none' : v.type === 'image' ? 'rgba(0,0,0,.06)' : S.visualBg);
    return `<rect x="${v.x}" y="${v.y}" width="${v.w}" height="${v.h}" rx="${v.ov && v.ov.radius !== undefined ? v.ov.radius : S.radius}" fill="${f}" ${v.type === 'text' ? '' : 'stroke="rgba(0,0,0,.12)" stroke-width="2"'}/>${v.type === 'text' ? `<rect x="${v.x + 4}" y="${v.y + v.h / 2 - 4}" width="${Math.max(0, Math.min(v.w - 8, (v.text || '').length * v.fontSize * .5))}" height="8" rx="4" fill="${v.textColor}" opacity=".5"/>` : ''}`;
  }).join('');
}
function thumb(o) { const s = o.settings, tpl = tplOf(o), p = o.pages ? o.pages[0] : o; return `<svg viewBox="0 0 ${s.pageW} ${s.pageH}" aria-hidden="true"><rect width="${s.pageW}" height="${s.pageH}" fill="${s.pageBg}"/>${s.showHeader !== false ? `<rect width="${s.pageW}" height="${s.headerH}" fill="${s.headerBg}"/>` : ''}${tpl && !o.hideLayout ? thumbRects(bindText(tpl.visuals, o, p), tpl.settings) : ''}${thumbRects(bindText(p.visuals, o, o.pages ? p : null), s)}${o.showSketch === false ? '' : (p.sketch || []).map(strokeSVG).join('')}</svg>`; }
function renderHome() {
  clearQS(); closeRing(); hideHover();
  ui.view = 'home'; ui.wfId = null; ui.hl = null; $('#tip').hidden = true;
  const wfs = store.wireframes.slice().sort((a, b) => b.updated - a.updated), tn = id => store.templates.find(t => t.id === id)?.client || 'No template';
  const when = t => new Date(t).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  $('#app').innerHTML = `<header class="bar">${BRAND}<span class="spacer"></span><button data-act="export">${I.download}Export</button><button data-act="import">${I.upload}Import</button><button class="primary" data-act="newwf">New wireframe</button></header>
 <main class="home"><section><div class="shead"><h2>Wireframes</h2></div>
 ${wfs.length ? `<div class="cards">${wfs.map(w => `<article class="wcard">${thumb(w)}<div class="wbody"><div class="wname">${esc(w.name)}</div><div class="meta">${esc(tn(w.templateId))}${w.pages.length > 1 ? `, ${w.pages.length} pages` : ''}, edited ${when(w.updated)}</div></div><div class="wact"><button class="primary" data-act="open" data-id="${w.id}">Open</button><button data-act="dupwf" data-id="${w.id}">Duplicate</button><button data-act="delwf" data-id="${w.id}">Delete</button></div></article>`).join('')}</div>` : `<div class="empty">No wireframes yet. Start one from a client template.</div>`}</section>
 <section><div class="shead"><h2>Client templates</h2><button data-act="newtpl">${I.plus} New template</button></div>
 ${store.templates.length ? `<div class="cards">${store.templates.map(t => `<article class="wcard">${thumb(t)}<div class="wbody"><div class="wname">${esc(t.client || 'Untitled client')}</div><div class="meta">${t.visuals.length ? `Page layout with ${t.visuals.length} elements` : 'Styling only, no page layout yet'}</div></div><div class="wact"><button class="primary" data-act="edittpl" data-id="${t.id}">Edit template</button><button data-act="deltpl" data-id="${t.id}">Delete</button></div></article>`).join('')}</div>` : `<div class="empty">Create a template with a client’s page layout, logo and styling, then start wireframes from it.</div>`}</section>
 <p class="hint" style="max-width:1200px;margin:0 auto">DataSketch ${APP_VERSION}. Your work is stored on this device only. Use Export to keep a backup or move work to another device, and Import to load it.</p></main>`;
}

/* ---------- editor ---------- */
function openWf(id, mode = 'wf') {
  Object.assign(ui, { mode, view: 'editor', wfId: id, sel: null, multi: new Set(), multiMode: false, panel: 'tab', tab: 'settings', hl: null, skUndo: [], skRedo: [], paramSel: {}, slicerSel: {}, dropOpen: null, ghost: false });
  ui.sk.on = false; ui.sk.open = false; closeRing(); ui.vdata.clear();
  const o = cur(), T_ = mode === 'tpl';
  ui.flipped = new Set(o.notesMode === 'flip' ? pg().visuals.map(v => v.id) : []);
  try { ui.sk.pinned = localStorage.getItem('datasketch-skpin') === '1'; } catch (e) {}
  try { ui.sk.stab = JSON.parse(localStorage.getItem('datasketch-stability') || '{}') || {}; } catch (e) { ui.sk.stab = {}; }
  try { ui.libMin = localStorage.getItem('datasketch-libmin') === '1'; ui.panelMin = localStorage.getItem('datasketch-panelmin') === '1'; } catch (e) {}
  const tn = T_ ? 'Client template' : tplOf(o)?.client;
  $('#app').innerHTML = `<header class="bar"><button class="ghost" data-act="home">${I.back}Wireframes</button>
 <input type="text" class="wfname" data-wfname value="${esc(T_ ? o.client : o.name)}" aria-label="${T_ ? 'Client name' : 'Wireframe name'}">
 ${tn ? `<span class="meta client">${esc(tn)}</span>` : ''}<span class="saved" id="saved">Saved</span><span class="spacer"></span>
 <select id="zoom" aria-label="Zoom"><option value="fit">Fit</option><option value="1">100%</option><option value="0.75">75%</option><option value="0.5">50%</option></select>
 ${T_ ? '' : `<button data-act="sketch" id="skBtn" aria-pressed="false">${I.pencil}Sketch</button>`}<button data-act="theme">Theme JSON</button><button class="desk-only icon" data-act="panelmin" id="panelBtn"></button><button class="mobile-only icon" data-act="togglepanel" aria-label="Settings, layers, bookmarks and data">${I.menu}</button></header>
 <div class="ws ${ui.panelMin ? 'nopanel' : ''}">${libHTML()}
 <div class="mid"><main class="stage" id="stage"><div id="sktools"></div><div class="sizer" id="sizer"><div class="wrap" id="wrap"></div></div></main><div id="arrange"></div>${T_ ? '' : '<nav class="pagetabs" id="pagetabs" aria-label="Pages"></nav>'}</div>
 <aside class="panel" id="panel" aria-label="Settings"></aside></div>`;
  clearQS(); setPanelMin(ui.panelMin); renderPage(); syncZoom(); renderPanel(); renderPages();
}
// Wide screens only: hides the right panel column. Narrow screens use the slide-over panel instead.
function setPanelMin(on) {
  ui.panelMin = on; try { localStorage.setItem('datasketch-panelmin', on ? '1' : '0'); } catch (e) {}
  $('.ws')?.classList.toggle('nopanel', on);
  const b = $('#panelBtn'); if (b) { const l = on ? 'Show side panel' : 'Hide side panel'; b.innerHTML = I.sidepanel; b.setAttribute('aria-pressed', !on); b.setAttribute('aria-label', l); b.title = l; }
  fit();
}
function libHTML() {
  const T_ = ui.mode === 'tpl', min = !!ui.libMin;
  return `<aside class="lib ${min ? 'min' : ''}" aria-label="Visuals"><div class="libhead"><h2>${T_ ? 'Layout elements' : 'Visuals'}</h2><button class="icon libtog" data-act="libmin" aria-expanded="${!min}" aria-label="${min ? 'Show labels' : 'Collapse to icons'}">${min ? I.fwd : I.back}</button></div>
 <div class="libitems">${Object.entries(TYPES).filter(([k]) => !T_ || LAYOUT_TYPES.includes(k)).map(([k, t]) => `<button class="libitem" data-type="${k}" data-act="add" title="${t.name}" aria-label="${t.name}">${I[k]}<span class="lbl">${t.name}</span></button>`).join('')}</div>
 ${T_ ? '<p class="hint">Build the client’s page header, nav rail and logo here. Every wireframe using this template shows this layout, locked, behind its visuals.</p>' : `<div class="gestures" aria-label="Tips"><h3>Tips</h3><dl>
  <dt>Tap a type</dt><dd>Add</dd>
  <dt>Double-tap</dt><dd>Menu</dd>
  <dt>Hold Pencil tip</dt><dd>Tool ring</dd>
  <dt>Double-tap tip</dt><dd>Eraser</dd>
  <dt>Draw + hold</dt><dd>Snap shape</dd>
  <dt>Pinch</dt><dd>Zoom</dd>
  <dt>2-finger drag</dt><dd>Pan</dd>
  <dt>2 / 3-finger tap</dt><dd>Undo / redo</dd>
  <dt>Finger in Sketch</dt><dd>Edit</dd></dl></div>`}</aside>`;
}
function renderPages() {
  const el = $('#pagetabs'); if (!el) return;
  const cp = pg();
  el.innerHTML = cur().pages.map(p => `<span class="ptab ${p.id === cp.id ? 'on' : ''}"><button data-act="gopage" data-id="${p.id}" aria-current="${p.id === cp.id ? 'page' : 'false'}">${esc(p.name)}</button>${p.id === cp.id ? `<button class="icon" data-act="pagemenu" aria-label="Page options">${I.more}</button>` : ''}</span>`).join('')
    + `<button class="addpage" data-act="addpage">${I.plus}New page</button>`;
}
function notesOrder() { return pg().visuals.filter(v => (v.notes || '').trim()).sort((a, b) => a.y - b.y || a.x - b.x); }
function railHTML() { const list = notesOrder(); return `<aside class="rail" id="rail" style="min-height:${ph()}px;font-family:${cur().settings.font}"><h3>Notes</h3>${list.length ? `<ol>${list.map((v, i) => `<li><span class="pin">${i + 1}</span><div><b>${esc(vName(v))}</b><p>${esc(v.notes)}</p></div></li>`).join('')}</ol>` : '<p>No notes yet. Double-tap or right-click a visual and choose Notes to add one.</p>'}</aside>`; }
function renderRail() { const r = $('#rail'); if (r) r.outerHTML = railHTML(); }
/* Text boxes can show the wireframe's name (bind 'report', followed by its separator) or the page's name (bind 'page').
   In a template they show their own text as a sample. A page-name box with `follow` starts one space after the
   report-name box's text ends, so the gap after the separator equals the gap before it, whatever the name's length. */
let measureCtx = null;
function textW(str, v, font) {
  measureCtx = measureCtx || document.createElement('canvas').getContext('2d');
  measureCtx.font = `${v.bold ? 700 : 400} ${v.fontSize}px ${font}`; return measureCtx.measureText(str).width;
}
const TXT_PAD = 6; // .vtext's side padding
const EM_SPACE = '\u2003';
// Upper case, and wide spacing: a space between the letters of a word and an em space between words (a separator
// such as "|" counts as a word). Applied when drawing, so the stored text keeps its case and spacing.
function textStyle(str, v) {
  let t = v.upper ? String(str).toUpperCase() : String(str);
  if (v.wide) t = t.split('\n').map(l => l.trim().split(/\s+/).map(w => [...w].join(' ')).join(EM_SPACE)).join('\n');
  return t;
}
function bindText(list, o, p) {
  if (!list.some(v => v.type === 'pagenav' || v.type === 'text' && v.bind)) return list;
  const wf = !!o.pages, font = o.settings.font, rep = list.find(v => v.type === 'text' && v.bind === 'report' && !v.hidden);
  const txt = v => v.bind === 'report' ? (wf ? o.name : v.text) + (v.sep ? ' ' + v.sep : '') : v.bind === 'page' ? (wf && p ? p.name : v.text) : v.text;
  return list.map(v => {
    if (v.type === 'pagenav') return wf ? { ...v, _pages: o.pages.map(x => x.name), _cur: Math.max(0, o.pages.indexOf(p)) } : v;
    if (v.type !== 'text' || !v.bind) return v;
    const r = { ...v, text: txt(v) };
    if (v.bind === 'page' && v.follow && rep) {
      const w = Math.min(textW(textStyle(txt(rep), rep), rep, font), rep.w - TXT_PAD * 2), start = rep.align === 'right' ? rep.x + rep.w - TXT_PAD - w : rep.align === 'center' ? rep.x + (rep.w - w) / 2 : rep.x + TXT_PAD;
      r.x = start + w + textW(rep.wide ? EM_SPACE : ' ', rep, font) - TXT_PAD;
    }
    return r;
  });
}
const hasBound = list => !!list?.some(v => v.type === 'pagenav' || v.type === 'text' && v.bind);
function renderPage() {
  const o = cur(), p = pg(), s = o.settings, g = o.grid, side = o.notesMode === 'side', pins = {};
  if (side) notesOrder().forEach((v, i) => pins[v.id] = i + 1);
  const tp = ui.mode === 'wf' ? tplOf(o) : null;
  $('#wrap').innerHTML = `<div class="page ${ui.sk.on ? 'sketching' : ''}" id="page" style="width:${pw()}px;height:${ph()}px;background:${s.pageBg};font-family:${s.font}">
 ${s.showHeader !== false ? `<div class="pghead" style="height:${s.headerH}px;background:${s.headerBg};color:${s.headerFg}">${s.logo ? `<img src="${s.logo}" alt="Client logo">` : '<span class="logoph">Logo</span>'}<span class="pgt">${esc(s.title)}</span><span class="pgr">Data as at [refresh date]</span></div>` : ''}
 ${tp && !o.hideLayout ? bindText(tp.visuals, o, p).map(v => layoutHTML(v, tp.settings)).join('') : ''}
 ${g.show ? `<div class="gridov" style="background-size:${g.size}px ${g.size}px"></div>` : ''}
 ${bindText(p.visuals, o, p).map(v => visHTML(v, pins[v.id])).join('')}<svg class="sketch" id="sketch" viewBox="0 0 ${pw()} ${ph()}" width="${pw()}" height="${ph()}" aria-hidden="true" ${o.showSketch === false ? 'style="display:none"' : ''}>${(p.sketch || []).map(strokeSVG).join('')}</svg></div>${side ? railHTML() : ''}`;
  fit();
}
function fit() {
  const st = $('#stage'), wr = $('#wrap'), sz = $('#sizer'); if (!st || !wr) return;
  const ww = pw() + (cur().notesMode === 'side' ? 320 : 0), s = ui.zoom === 'fit' ? Math.min(1, (st.clientWidth - 40) / ww) : +ui.zoom;
  ui.scale = Math.max(.1, s); wr.style.transform = `scale(${ui.scale})`; sz.style.width = ww * ui.scale + 'px'; sz.style.height = ph() * ui.scale + 'px';
}
function setSel(id) { ui.sel = id; document.querySelectorAll('.vis[data-id]').forEach(el => el.classList.toggle('sel', el.dataset.id === id || ui.multi.has(el.dataset.id))); renderArrange(); }
function toggleMulti(id) {
  if (!ui.multi.size && ui.sel && ui.sel !== id) ui.multi.add(ui.sel);
  if (ui.multi.has(id)) ui.multi.delete(id); else ui.multi.add(id);
  const next = ui.multi.has(id) ? id : [...ui.multi].pop() || null;
  if (ui.multi.size < 2) ui.multi.clear();
  if (ui.multi.size && ui.panel === 'visual') { ui.panel = 'tab'; renderPanel(); }
  setSel(next); refreshSide();
}
function renderArrange() {
  const el = $('#arrange'); if (!el) return;
  const n = ui.multi.size, b = (val, label, dis) => `<button data-act="arrange" data-val="${val}" aria-label="${label}" title="${label}" ${dis ? 'disabled' : ''}>${I[val]}</button>`;
  if (ui.sk.on || (!ui.sel && !n && !ui.multiMode)) { el.innerHTML = ''; return; }
  el.innerHTML = `<div class="arrange" role="toolbar" aria-label="Arrange"><button data-act="multimode" aria-pressed="${ui.multiMode}" aria-label="Select multiple" title="Select multiple">${I.multi}${n ? '' : '<span>Select multiple</span>'}</button>
  ${n ? `<span class="sep"></span><span class="acount">${n} selected</span>${b('al-l', 'Align left')}${b('al-c', 'Align centre')}${b('al-r', 'Align right')}<span class="sep"></span>${b('al-t', 'Align top')}${b('al-m', 'Align middle')}${b('al-b', 'Align bottom')}<span class="sep"></span>${b('ds-h', 'Distribute horizontally', n < 3)}${b('ds-v', 'Distribute vertically', n < 3)}` : ''}</div>`;
}
function arrange(how) {
  const vs = pg().visuals.filter(v => ui.multi.has(v.id)); if (vs.length < 2) return;
  const x0 = Math.min(...vs.map(v => v.x)), x1 = Math.max(...vs.map(v => v.x + v.w)), y0 = Math.min(...vs.map(v => v.y)), y1 = Math.max(...vs.map(v => v.y + v.h));
  const spread = (key, size, a, b) => { const s = vs.slice().sort((p, q) => p[key] - q[key]), gap = (b - a - s.reduce((t, v) => t + v[size], 0)) / (s.length - 1); let at = a; s.forEach(v => { v[key] = Math.round(at); at += v[size] + gap; }); };
  ({ 'al-l': () => vs.forEach(v => v.x = x0), 'al-c': () => vs.forEach(v => v.x = Math.round((x0 + x1 - v.w) / 2)), 'al-r': () => vs.forEach(v => v.x = x1 - v.w),
    'al-t': () => vs.forEach(v => v.y = y0), 'al-m': () => vs.forEach(v => v.y = Math.round((y0 + y1 - v.h) / 2)), 'al-b': () => vs.forEach(v => v.y = y1 - v.h),
    'ds-h': () => vs.length > 2 && spread('x', 'w', x0, x1), 'ds-v': () => vs.length > 2 && spread('y', 'h', y0, y1) })[how]();
  renderPage(); save();
}

/* ---------- panel builders ---------- */
const F = {
  text: (p, k, label, val, ph = '') => `<label class="field stack"><span>${label}</span><input type="text" data-${p}="${k}" value="${esc(val)}" placeholder="${esc(ph)}"></label>`,
  color: (p, k, label, val) => `<label class="field"><span>${label}</span><input type="color" data-${p}="${k}" value="${val}"></label>`,
  sw: (p, k, label, val) => `<label class="sw"><input type="checkbox" role="switch" data-${p}="${k}" ${val ? 'checked' : ''}><span class="track"></span><span>${label}</span></label>`,
  range: (p, k, label, val, min, max) => `<label class="field"><span>${label}: <output>${val}</output>px</span><input type="range" min="${min}" max="${max}" data-${p}="${k}" value="${val}"></label>`,
  num: (p, k, label, val, min, max) => `<label class="field"><span>${label}</span><input type="number" min="${min}" max="${max}" data-${p}="${k}" value="${val}" style="width:80px"></label>`,
  sel: (p, k, label, opts, val) => `<label class="field"><span>${label}</span><select data-${p}="${k}">${opts.map(([a, b]) => `<option value="${esc(a)}" ${String(val) === String(a) ? 'selected' : ''}>${esc(b)}</option>`).join('')}</select></label>`,
  font: (p, val) => `<label class="field"><span>Font</span><select data-${p}="font">${FONTS.map(([v, l]) => `<option value="${v}" ${v === val ? 'selected' : ''}>${l}</option>`).join('')}</select></label>`,
  logo: val => `<div class="field"><span>Logo</span><div class="inline"><label class="filebtn">Upload<input type="file" accept="image/*" data-logo></label>${val ? `<button data-act="clearlogo">Remove</button>` : ''}</div></div>`,
  pal: (attr, pal) => `<div class="pal">${pal.map((c, i) => `<input type="color" ${attr}="${i}" value="${c}" aria-label="Theme colour ${i + 1}">`).join('')}</div>`
};
const segH = (act, cv, opts, label, extra = '') => `<div class="seg" role="group" aria-label="${label}">${opts.map(([a, b]) => `<button data-act="${act}" data-val="${a}" ${extra} aria-pressed="${cv === a}">${b}</button>`).join('')}</div>`;
function pageFields(s) { return F.text('s', 'title', 'Report title', s.title) + F.color('s', 'headerBg', 'Header background', s.headerBg) + F.color('s', 'headerFg', 'Header text', s.headerFg) + F.color('s', 'pageBg', 'Page background', s.pageBg) + F.logo(s.logo) + F.font('s', s.font); }
function visualFields(s) { return F.color('s', 'visualBg', 'Visual background', s.visualBg) + F.range('s', 'radius', 'Corner radius', s.radius, 0, 24) + F.sw('s', 'border', 'Border', s.border) + F.color('s', 'borderColor', 'Border colour', s.borderColor) + F.sw('s', 'shadow', 'Shadow', s.shadow) + F.sw('s', 'dataLabels', 'Data labels', s.dataLabels) + F.sw('s', 'axisLabels', 'Axis labels', s.axisLabels) + F.sw('s', 'legend', 'Legends', s.legend) + F.sw('s', 'gridlines', 'Gridlines', s.gridlines) + F.sw('s', 'tooltips', 'Tooltips on hover', s.tooltips) + F.num('s', 'titleSize', 'Title size (pt)', s.titleSize, 8, 24); }
function sizeFields(s) {
  const pre = PAGE_SIZES.find(([w, h]) => w === s.pageW && h === s.pageH), dim = (k, label, val) => `<label class="field"><span>${label}</span><input type="number" min="200" max="4000" data-cs="${k}" value="${val}" style="width:90px"></label>`;
  return `<label class="field"><span>Size</span><select data-cs="preset">${PAGE_SIZES.map(([w, h, n]) => `<option value="${w}x${h}" ${pre && pre[0] === w && pre[1] === h ? 'selected' : ''}>${n} (${w} × ${h})</option>`).join('')}<option value="custom" ${pre ? '' : 'selected'}>Custom</option></select></label>
 ${dim('w', 'Width (px)', s.pageW)}${dim('h', 'Height (px)', s.pageH)}`;
}
function setSize(w, h) {
  const o = cur(); w = clamp(Math.round(w) || 1280, 200, 4000); h = clamp(Math.round(h) || 720, 200, 4000);
  Object.assign(o.settings, { pageW: w, pageH: h });
  (o.pages || [o]).forEach(p => p.visuals.forEach(v => { v.w = Math.min(v.w, w); v.h = Math.min(v.h, h); v.x = clamp(v.x, 0, w - v.w); v.y = clamp(v.y, 0, h - v.h); }));
  renderPage(); renderPanel('[data-cs=preset]'); save();
}
function settingsBody() {
  const o = cur(), s = o.settings, g = o.grid, T_ = ui.mode === 'tpl';
  return `${T_ ? '' : `<section><h3>Client template</h3><div class="inline"><select id="tplSel" aria-label="Client template">${store.templates.map(t => `<option value="${t.id}" ${t.id === o.templateId ? 'selected' : ''}>${esc(t.client)}</option>`).join('')}</select><button data-act="applytpl">Apply</button></div><p class="hint">Replaces page and visual styling with the template’s. The template’s page layout always shows live.</p></section>`}
 <section><h3>Canvas size</h3>${sizeFields(s)}<p class="hint">${T_ ? 'Wireframes take this size when they are created or when you apply this template.' : 'Visuals that would fall off the page move to fit.'}</p></section>
 <section><h3>Page</h3>${F.sw('s', 'showHeader', 'Simple header band', s.showHeader !== false)}${pageFields(s)}<p class="hint">Turn the header band off if the page layout builds its own header from shapes.</p></section>
 <section><h3>All visuals</h3>${visualFields(s)}</section>
 <section><h3>Theme colours</h3>${F.pal('data-pal', s.palette)}</section>
 <section><h3>Grid</h3><label class="field"><span>Grid size (px)</span><input type="number" min="5" max="60" data-g="size" value="${g.size}" style="width:80px"></label>${F.sw('g', 'snap', 'Snap to grid', g.snap)}${F.sw('g', 'show', 'Show grid', g.show)}</section>
 ${T_ ? '' : `<section><h3>Sketch</h3>${F.sw('k', 'pencilDraws', 'Apple Pencil draws outside Sketch mode', o.pencilDraws === true)}${F.sw('k', 'fingerDraws', 'Finger draws in Sketch mode', o.fingerDraws === true)}${F.sw('k', 'showSketch', 'Show sketches', o.showSketch !== false)}<p class="hint">Turn on Sketch in the top bar to draw with Apple Pencil; your finger keeps selecting, moving and resizing visuals. With Sketch off, the Pencil works like a finger. Hold the Pencil tip for the tool ring (right-click on desktop); double-tap it to swap with the eraser. Draw and hold to snap a line, rectangle or ellipse. Pinch to zoom and drag with two fingers to pan; in Sketch mode, tap with two fingers to undo and three to redo.</p></section>
 <section><h3>Notes</h3>${segH('notesmode', o.notesMode, [['hidden', 'On flip'], ['flip', 'Reveal all'], ['side', 'Alongside']], 'Notes display')}<p class="hint">Double-tap or right-click a visual and choose Notes to flip it and type notes.</p></section>`}`;
}
function layersBody() {
  const o = cur(), p = pg(), tp = ui.mode === 'wf' ? tplOf(o) : null;
  return `<section><p class="hint" style="margin:0 0 10px">Top of the list sits in front. Use the eye to show or hide a visual; bookmarks remember this.</p><ol class="layers">${p.visuals.slice().reverse().map((v, ri) => { const i = p.visuals.length - 1 - ri; return `<li class="${ui.sel === v.id ? 'on' : ''} ${v.hidden ? 'off' : ''}"><button class="icon" data-act="lyeye" data-id="${v.id}" aria-pressed="${!v.hidden}" aria-label="${v.hidden ? 'Show' : 'Hide'} ${esc(vName(v))}">${v.hidden ? I.eyeoff : I.eye}</button><button class="lname" data-act="lysel" data-id="${v.id}">${I[v.type]}<span>${esc(vName(v))}</span></button><button class="icon" data-act="lyup" data-id="${v.id}" aria-label="Bring forward" ${i === p.visuals.length - 1 ? 'disabled' : ''}>${I.up}</button><button class="icon" data-act="lydown" data-id="${v.id}" aria-label="Send backward" ${i === 0 ? 'disabled' : ''}>${I.down}</button></li>`; }).join('')}</ol>
 ${tp && tp.visuals.length ? `<ol class="layers" style="margin-top:2px"><li class="${o.hideLayout ? 'off' : ''}"><button class="icon" data-act="layouteye" aria-pressed="${!o.hideLayout}" aria-label="${o.hideLayout ? 'Show' : 'Hide'} client page layout">${o.hideLayout ? I.eyeoff : I.eye}</button><span class="lname">${I.shape}<span>Client page layout (locked)</span></span></li></ol>` : ''}</section>
 <section>${F.sw('l', 'ghost', 'Show hidden visuals faintly while editing', ui.ghost)}</section>`;
}
function bmSummary(bm) { const p = pg(), a = p.visuals.filter(v => bm.affects.includes(v.id)); return `Controls ${a.length} of ${p.visuals.length} visuals (${a.filter(v => !bm.hidden.includes(v.id)).length} shown)`; }
const bmState = (bm, id) => !bm.affects.includes(id) ? 'skip' : bm.hidden.includes(id) ? 'hide' : 'show';
function bookmarksBody() {
  const p = pg();
  return `<section><button class="primary wide" data-act="bmadd">Add bookmark from current view</button><p class="hint">A bookmark shows or hides the visuals it controls and leaves the rest alone. Link it to a button visual to demo filter panels, menus and alternate views. Set a visual to “Not affected” to keep a bookmark from touching it.</p></section>
 <section>${p.bookmarks.length ? p.bookmarks.map(bm => `<div class="bm ${p.activeBm === bm.id ? 'on' : ''}"><div class="inline"><input type="text" data-bmname="${bm.id}" value="${esc(bm.name)}" aria-label="Bookmark name"><button data-act="bmapply" data-id="${bm.id}">Apply</button></div>
  <details data-bmd="${bm.id}" ${ui.bmOpen === bm.id ? 'open' : ''}><summary>${bmSummary(bm)}</summary><div class="bmlist">${p.visuals.map(v => { const st = bmState(bm, v.id); return `<label class="field" style="margin:4px 0"><span>${esc(vName(v))}</span><select data-bmv="${bm.id}" data-vid="${v.id}" style="width:130px">${[['show', 'Shown'], ['hide', 'Hidden'], ['skip', 'Not affected']].map(([a, b]) => `<option value="${a}" ${st === a ? 'selected' : ''}>${b}</option>`).join('')}</select></label>`; }).join('')}</div></details>
  <div class="inline"><button data-act="bmupdate" data-id="${bm.id}">Update from current view</button><button class="danger" data-act="bmdel" data-id="${bm.id}">Delete</button></div></div>`).join('') : '<p class="hint">No bookmarks yet.</p>'}</section>`;
}
const SEASONS = [['none', 'None'], ['summer', 'Summer peak'], ['winter', 'Winter peak'], ['spring', 'Spring peak'], ['q4', 'Q4 peak'], ['december', 'December spike']];
const EFFECTS = [['growing', 'Growing'], ['declining', 'Declining'], ['star', 'Top performer'], ['weak', 'Underperformer']];
function dataBody() {
  const md = model();
  const fmtOpts = t => t === 'ratio' ? [['percent', 'Percentage'], ['currency', 'Currency'], ['decimal', 'Decimal'], ['number', 'Whole number']] : [['number', 'Whole number'], ['currency', 'Currency'], ['decimal', 'Decimal']];
  const magLabel = m => m.type === 'sum' ? 'Annual total' : m.fmt === 'percent' ? 'Typical value (%)' : 'Typical value';
  const uses = id => cur().pages.flatMap(p => p.visuals).filter(v => (DATA_TYPES.includes(v.type) && v.mid === id) || v.m2 === id || (v.type === 'slicer' && v.sStyle === 'param' && v.params.includes(id))).length;
  return `<section><h3>Measures</h3><p class="hint" style="margin:0 0 6px">Trend, seasonality and stories live on the measure, so every visual tells the same story and totals reconcile.</p>
 ${md.measures.map(m => `<details class="mcard" data-mopen="${m.id}" ${ui.mOpen === m.id ? 'open' : ''}><summary><span>${esc(m.name)}</span><span class="meta">${m.type === 'ratio' ? 'Rate' : 'Total'}, ${{ up: 'upward', down: 'downward', steady: 'steady', volatile: 'volatile' }[m.trend]}</span></summary><div class="inner">
  <label class="field stack"><span>Name</span><input type="text" data-mf="name" data-id="${m.id}" value="${esc(m.name)}"></label>
  <label class="field"><span>Type</span><select data-mf="type" data-id="${m.id}"><option value="sum" ${m.type === 'sum' ? 'selected' : ''}>Total, summed</option><option value="ratio" ${m.type === 'ratio' ? 'selected' : ''}>Rate or average</option></select></label>
  <label class="field"><span>Format</span><select data-mf="fmt" data-id="${m.id}">${fmtOpts(m.type).map(([a, b]) => `<option value="${a}" ${m.fmt === a ? 'selected' : ''}>${b}</option>`).join('')}</select></label>
  <label class="field"><span>${magLabel(m)}</span><input type="number" data-mf="mag" data-id="${m.id}" value="${m.mag}" style="width:120px"></label>
  <p class="hint" style="margin-top:8px">Trend</p>${segH('mtrend', m.trend, [['up', 'Upward'], ['down', 'Downward'], ['steady', 'Steady'], ['volatile', 'Volatile']], 'Trend', `data-id="${m.id}"`)}
  ${segH('mstrength', m.strength, [['low', 'Low'], ['med', 'Medium'], ['high', 'High']], 'Strength', `data-id="${m.id}"`)}
  <label class="field"><span>Seasonality</span><select data-mf="season" data-id="${m.id}">${SEASONS.map(([a, b]) => `<option value="${a}" ${m.season === a ? 'selected' : ''}>${b}</option>`).join('')}</select></label>
  <p class="hint" style="margin-top:8px">Stories</p>
  ${(m.stories || []).map((st, i) => { const dm = md.dims.find(x => x.id === st.dim); return `<div class="story"><select data-st="dim" data-id="${m.id}" data-i="${i}" aria-label="Dimension">${md.dims.map(x => `<option value="${x.id}" ${x.id === st.dim ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select><select data-st="member" data-id="${m.id}" data-i="${i}" aria-label="Member">${dm ? D.memberNames(dm).map((nm, j) => `<option value="${j}" ${j === +st.member ? 'selected' : ''}>${esc(nm)}</option>`).join('') : ''}</select><select data-st="effect" data-id="${m.id}" data-i="${i}" aria-label="Effect">${EFFECTS.map(([a, b]) => `<option value="${a}" ${st.effect === a ? 'selected' : ''}>${b}</option>`).join('')}</select><button data-act="stdel" data-id="${m.id}" data-i="${i}" aria-label="Remove story">${I.x}</button></div>`; }).join('')}
  <div class="acts" style="margin-top:8px"><button data-act="stadd" data-id="${m.id}" ${md.dims.length ? '' : 'disabled'}>${I.plus}Add story</button><button class="danger" data-act="mdel" data-id="${m.id}" ${md.measures.length > 1 ? '' : 'disabled'}>Delete measure</button></div>
  ${uses(m.id) ? `<p class="hint">Used by ${uses(m.id)} visual${uses(m.id) > 1 ? 's' : ''}.</p>` : ''}
 </div></details>`).join('')}
 <button data-act="madd">${I.plus}Add measure</button></section>
 <section><h3>Dimensions</h3><p class="hint" style="margin:0 0 6px">Name, number of members, and optional real member names. Year, Quarter and Month are built in.</p>
 ${md.dims.map(dm => `<div class="dimrow"><input type="text" data-dname="${dm.id}" value="${esc(dm.name)}" aria-label="Dimension name"><input type="number" min="1" max="30" data-dcount="${dm.id}" value="${dm.count}" aria-label="Number of members"><button class="icon" data-act="dimdel" data-id="${dm.id}" aria-label="Delete ${esc(dm.name)}">${I.x}</button></div>
  <details class="dimmem"><summary>Member names</summary><textarea data-dmem="${dm.id}" placeholder="One per line. Leave blank for ${esc(dm.name)} 1, ${esc(dm.name)} 2…">${esc(dm.members)}</textarea></details>`).join('')}
 <button data-act="dimadd" style="margin-top:8px">${I.plus}Add dimension</button></section>
 <section><h3>Model</h3><label class="field"><span>Currency symbol</span><input type="text" data-cur value="${esc(md.currency)}" style="width:70px"></label>
 <button data-act="regen">Regenerate all values</button><p class="hint">Keeps every setting and gives the noise a fresh roll.</p></section>
 <section><h3>Export for Power BI</h3><p class="hint" style="margin:0 0 8px">Download the fake model as a star schema: a fact table plus date and dimension tables, matching every number on the page.</p>
 <div class="files"><button data-act="exp" data-file="Fact.csv">${I.download}Fact</button><button data-act="exp" data-file="Date.csv">${I.download}Date</button>${md.dims.map(dm => `<button data-act="exp" data-file="${esc(dm.name)}.csv">${I.download}${esc(dm.name)}</button>`).join('')}</div>
 <p class="hint" style="margin-top:10px">DAX measures for the exported tables</p><textarea class="daxbox" readonly aria-label="DAX measures">${esc(D.daxMeasures(md))}</textarea></section>`;
}
function customCount(v) { return Object.keys(v.ov).length + (v.titleAuto ? 0 : 1); }
function sheetBody(v) {
  const t = v.type, s = cur().settings, o = v.ov, multi = MULTI.includes(t), md = model(), cus = '<span class="custom">Custom</span>';
  const tri = (k, label) => { const val = o[k] === undefined ? '' : o[k] ? 'on' : 'off'; return `<label class="field"><span>${label}${val ? cus : ''}</span><select data-ov="${k}"><option value="" ${val === '' ? 'selected' : ''}>Canvas (${s[k] ? 'on' : 'off'})</option><option value="on" ${val === 'on' ? 'selected' : ''}>On</option><option value="off" ${val === 'off' ? 'selected' : ''}>Off</option></select></label>`; };
  const params = md ? pg().visuals.filter(x => x.type === 'slicer' && x.sStyle === 'param' && x.id !== v.id) : [];
  const dimOpts = (allowTime, exclude) => [...(allowTime ? [['T:Year', 'Year'], ['T:Quarter', 'Quarter'], ['T:Month', 'Month']] : []), ...md.dims.filter(d => d.id !== exclude).map(d => [d.id, d.name]), ['__newdim', 'New dimension…']];
  const measOpts = () => [...md.measures.map(m => [m.id, m.name]), ['__newm', 'New measure…']];
  const hasDim = ['column', 'bar', 'line', 'area', 'donut', 'table', 'matrix'].includes(t) || (t === 'slicer' && ['list', 'tiles', 'dropdown'].includes(v.sStyle));
  const n = customCount(v);
  let h = '<section>';
  if (t === 'button') h += `<h3>Button</h3>${F.text('v', 'label', 'Button text', v.label)}${F.sel('v', 'icon', 'Icon', [['none', 'None'], ['filter', 'Filter'], ['close', 'Close'], ['arrow', 'Arrow'], ['info', 'Info'], ['home', 'Home'], ['chart', 'Chart'], ['settings', 'Settings']], v.icon)}${ui.mode === 'tpl' ? '<p class="hint">Layout buttons are for show. Link bookmarks to buttons in a wireframe.</p>' : F.sel('v', 'target', 'On click', [['', 'Do nothing'], ...pg().bookmarks.map(b => [b.id, 'Bookmark: ' + b.name])], v.action === 'bookmark' ? v.bmId : '') + (pg().bookmarks.length ? '' : '<p class="hint">Add bookmarks in the Bookmarks tab, then choose one here.</p>')}`;
  else if (t === 'pagenav') h += `<h3>Page navigator</h3><p class="hint">One button per page, in the order of the page tabs${ui.mode === 'tpl' ? '. In the template it shows placeholders; each wireframe shows its own pages' : ''}.</p>${ui.mode === 'tpl' ? F.num('v', 'navN', 'Placeholder pages', v.navN, 1, 20) : ''}${F.sel('v', 'navDir', 'Direction', [['vertical', 'Vertical'], ['horizontal', 'Horizontal']], v.navDir)}${F.num('v', 'navGap', 'Gap (px)', v.navGap, 0, 60)}${F.num('v', 'navSize', 'Text size (px)', v.navSize, 8, 40)}${F.sw('v', 'navBold', 'Bold', v.navBold)}${F.color('v', 'navText', 'Text colour', v.navText)}${F.sw('v', 'navHi', 'Highlight the current page', v.navHi)}${v.navHi ? F.color('v', 'navSel', 'Current page fill', v.navSel || s.palette[1] || s.palette[0]) : ''}`;
  else if (t === 'text') h += `<h3>Text</h3>${F.sel('v', 'bind', 'Shows', [['', 'Its own text'], ['report', 'Report name'], ['page', 'Page name']], v.bind)}${!v.bind ? F.text('v', 'text', 'Text', v.text) : ui.mode === 'tpl' ? F.text('v', 'text', 'Sample text', v.text) : ''}${v.bind === 'report' ? F.text('v', 'sep', 'Separator after the name', v.sep, 'None') : ''}${v.bind === 'page' ? F.sw('v', 'follow', 'Start after the report name', v.follow) : ''}${F.sw('v', 'upper', 'Upper case', v.upper)}${F.sw('v', 'wide', 'Wide spacing', v.wide)}${v.wide ? '<p class="hint">A space between letters and an em space between words and around the separator.</p>' : ''}${v.bind ? `<p class="hint">${v.bind === 'report' ? 'Shows the wireframe’s name, then the separator.' : 'Shows the name of the page.'}${v.bind === 'page' && v.follow ? ' Sits one space after the report name’s separator and moves with the name’s length.' : ''}${ui.mode === 'tpl' ? ' The sample text shows here in the template.' : ''}</p>` : ''}${F.num('v', 'fontSize', 'Size (px)', v.fontSize, 8, 72)}${F.sw('v', 'bold', 'Bold', v.bold)}${F.sel('v', 'align', 'Align', [['left', 'Left'], ['center', 'Centre'], ['right', 'Right']], v.align)}${F.color('v', 'textColor', 'Text colour', v.textColor)}`;
  else if (t === 'image') h += `<h3>Image</h3><div class="field"><span>Image file</span><div class="inline"><label class="filebtn">Upload<input type="file" accept="image/*" data-vimg></label>${v.src ? '<button data-act="imgclear">Remove</button>' : ''}</div></div>${F.sel('v', 'fit', 'Fit', [['contain', 'Fit inside'], ['cover', 'Fill and crop']], v.fit)}<p class="hint">Use this for client logos in page layouts.</p>`;
  else {
    h += `<h3>Fields</h3><label class="field stack"><span>Title${v.titleAuto ? '' : cus}</span><input type="text" data-v="title" value="${esc(v.titleAuto ? '' : v.title)}" placeholder="${esc(autoTitle(v) || 'No title')}"></label>`;
    if (md && DATA_TYPES.includes(t)) {
      h += F.sel('v', 'mid', 'Measure', measOpts(), v.mid);
      if (params.length) h += F.sel('v', 'paramId', 'Measure comes from', [['', 'The measure above'], ...params.map(p => [p.id, 'Field parameter: ' + tTitle(p)])], v.paramId);
    }
    if (md && hasDim && t !== 'card') {
      h += F.sel('v', 'dim', t === 'slicer' ? 'Field' : t === 'matrix' ? 'Rows' : 'Axis', dimOpts(t !== 'slicer'), v.dim);
      if (t === 'matrix') {
        const used = mxLevels(v), fields = dimOpts(true).filter(([a]) => a !== '__newdim');
        (v.sub || []).forEach((k, i) => h += F.sel('mxsub', i, `Rows, level ${i + 2}`, [['', 'Remove this level'], ...fields.filter(([a]) => a === k || !used.includes(a))], k));
        if (used.length < MX_LEVELS && fields.some(([a]) => !used.includes(a))) h += `<button data-act="mxadd" style="margin:2px 0 8px">${I.plus}Add row level</button>`;
        h += F.sel('v', 'cols', 'Columns', [['', 'None'], ...fields.filter(([a]) => !used.includes(a))], mxCols(v));
        if (used.length > 1) h += `<div class="inline" style="margin:2px 0 8px"><button data-act="mxexp">Expand all</button><button data-act="mxcol">Collapse all</button></div>`;
      }
      const pk = periodKey(v);
      if (pk) h += F.num('v', 'periods', 'Periods shown', v.periods, 1, D.TIME_MAX[pk]);
      if ((t === 'matrix' || !pk) && t !== 'slicer' && !['line', 'area'].includes(t)) h += F.sel('v', 'sort', 'Sort', [['value', 'By value, highest first'], ['axis', 'By name']], v.sort);
    }
    if (md && multi) {
      if (t !== 'bar') h += F.sel('v', 'm2', t === 'column' ? 'Line measure (combo)' : 'Second measure', [['', 'None'], ['ly', 'Last year'], ['bud', 'Budget'], ...md.measures.map(m => [m.id, m.name])], v.m2);
      h += F.sel('v', 'legend', 'Legend', [['', 'None'], ...md.dims.filter(d => d.id !== v.dim).map(d => [d.id, d.name])], v.legend);
      if ((t === 'column' || t === 'bar') && v.legend) h += segH('mode', v.mode, [['clustered', 'Clustered'], ['stacked', 'Stacked'], ['pct', '100%']], 'Series layout');
    }
    if (md && DATA_TYPES.includes(t)) h += `<button data-act="gomeasure" style="margin-top:8px">Edit trend and seasonality for ${esc(measOf(mOf(v))?.name || 'measure')}</button>`;
  }
  h += '</section>';
  if (t === 'slicer') {
    h += `<section><h3>Slicer</h3>${F.sel('v', 'sStyle', 'Style', [['list', 'List'], ['dropdown', 'Dropdown'], ['tiles', 'Tiles'], ['date', 'Date range'], ['param', 'Field parameter']], v.sStyle)}`;
    if (v.sStyle === 'date') { const mo = Array.from({ length: D.N_MONTHS }, (_, m) => [m, D.monthLabel(m)]); h += F.sel('v', 'from', 'From', mo, v.from) + F.sel('v', 'to', 'To', mo, v.to) + F.sw('v', 'slider', 'Show slider', v.slider) + '<p class="hint">The date range filters every visual on the page.</p>'; }
    if (v.sStyle === 'param') h += `<p class="hint" style="margin-top:8px">Measures offered</p>${md.measures.map(m => `<label class="chk"><input type="checkbox" data-pm="${m.id}" ${v.params.includes(m.id) ? 'checked' : ''}>${esc(m.name)}</label>`).join('')}<p class="hint">Link charts to this slicer with “Measure comes from” in their edit sheet.</p>`;
    h += '</section>';
  }
  if (multi) h += `<section><h3>Analytics</h3>${F.sel('v', 'ref', 'Reference line', [['none', 'None'], ['average', 'Average'], ['target', 'Target']], v.ref)}${HIER.includes(v.dim) ? F.sw('v', 'drill', 'Drill buttons (Year › Quarter › Month)', v.drill) : ''}</section>`;
  if (t === 'table') h += `<section><h3>Conditional formatting</h3>${F.sel('v', 'cf', 'Format', [['none', 'None'], ['bars', 'Data bars'], ['icons', 'Change icons']], v.cf)}</section>`;
  h += `<section><h3>Styling</h3>`;
  if (multi || t === 'donut') { h += tri('dataLabels', 'Data labels'); if (multi) h += tri('axisLabels', 'Axis labels'); h += tri('legend', 'Legend'); }
  if (multi || t === 'table' || t === 'matrix') h += tri('gridlines', 'Gridlines');
  if (multi || t === 'donut') h += tri('tooltips', 'Tooltips');
  h += tri('border', 'Border') + tri('shadow', 'Shadow') + `<label class="field"><span>Corner radius${o.radius !== undefined ? cus : ''}</span><input type="number" min="0" max="40" data-ovr value="${o.radius ?? ''}" placeholder="${s.radius}" style="width:80px"></label>`;
  if (['column', 'bar', 'line', 'area', 'card', 'button', 'pagenav', 'shape', 'text', 'image'].includes(t)) h += `<div class="field"><label class="sw" style="margin:0"><input type="checkbox" role="switch" data-ovcon ${o.color ? 'checked' : ''}><span class="track"></span><span>${['button', 'pagenav', 'shape'].includes(t) ? 'Custom fill' : ['text', 'image'].includes(t) ? 'Background' : 'Custom colour'}</span></label><input type="color" data-ovc value="${o.color || (['shape', 'text', 'image'].includes(t) ? s.visualBg : s.palette[0])}" ${o.color ? '' : 'disabled'} aria-label="Colour"></div>`;
  const pos = (k, label) => `<label class="field"><span>${label}</span><input type="number" data-pos="${k}" value="${v[k]}" min="${k === 'w' || k === 'h' ? 15 : 0}" max="4000" style="width:80px" ${k === 'x' && v.bind === 'page' && v.follow ? 'disabled' : ''}></label>`;
  h += `</section><section><h3>Position and size (px)</h3>${pos('x', 'X')}${pos('y', 'Y')}${pos('w', 'Width')}${pos('h', 'Height')}${v.bind === 'page' && v.follow ? '<p class="hint">X follows the report name.</p>' : ''}</section><section><h3>Arrange</h3><div class="acts"><button data-act="zfront">To front</button><button data-act="zfwd">Forward</button><button data-act="zbwd">Backward</button><button data-act="zback">To back</button></div>${F.sw('v', 'hidden', 'Hidden', v.hidden)}</section>
 <section class="acts">${ui.mode === 'tpl' ? '' : '<button data-act="flipnote">Flip to notes</button>'}<button data-act="dup">Duplicate</button><button class="danger" data-act="del">Delete</button></section>
 <section><button class="wide" data-act="reset" ${n ? '' : 'disabled'}>Reset styling to canvas defaults${n ? ` (${n} custom)` : ''}</button><p class="hint">Clears this visual’s custom styling and title. Fields, notes and position are kept.</p></section>`;
  return h;
}
function renderPanel(focusSel) {
  const p = $('#panel'); if (!p) return;
  const v = ui.panel === 'visual' ? findV(ui.sel) : null; if (!v) ui.panel = 'tab';
  const closeM = `<button class="icon mobile-only" data-act="togglepanel" aria-label="Close panel">${I.x}</button>`;
  if (v) p.innerHTML = `<div class="ph line"><div><h2>Edit visual</h2><p class="hint" style="margin:2px 0 0">${TYPES[v.type].name}${v.hidden ? ', hidden' : ''}</p></div><button class="icon" data-act="closesheet" aria-label="Close edit sheet">${I.x}</button></div><div class="pscroll">${sheetBody(v)}</div>`;
  else {
    const tabs = ui.mode === 'tpl' ? [['settings', 'Canvas'], ['layers', 'Layers']] : [['settings', 'Canvas'], ['layers', 'Layers'], ['bookmarks', 'Bookmarks'], ['data', 'Data']];
    if (!tabs.some(([k]) => k === ui.tab)) ui.tab = 'settings';
    const titles = { settings: ui.mode === 'tpl' ? 'Template settings' : 'Canvas settings', layers: 'Layers', bookmarks: 'Bookmarks', data: 'Data model' };
    const body = { settings: settingsBody, layers: layersBody, bookmarks: bookmarksBody, data: dataBody }[ui.tab]();
    p.innerHTML = `<div class="ph"><h2>${titles[ui.tab]}</h2>${closeM}</div><div class="tabs" role="tablist">${tabs.map(([k, l]) => `<button role="tab" data-act="tab" data-val="${k}" aria-selected="${ui.tab === k}">${l}</button>`).join('')}</div><div class="pscroll">${body}</div>`;
  }
  p.classList.toggle('open', ui.panelOpen);
  if (focusSel) p.querySelector(focusSel)?.focus();
}
function openSheet(id, force) { setSel(id); ui.panel = 'visual'; if (force || wide()) ui.panelOpen = true; if (force && ui.panelMin) setPanelMin(false); renderPanel(); }
function refreshSide() { if (ui.panel === 'tab' && ['layers', 'bookmarks'].includes(ui.tab)) renderPanel(); }
function showTab(tab) { ui.panel = 'tab'; ui.tab = tab; ui.panelOpen = true; if (ui.panelMin) setPanelMin(false); renderPanel(); }

/* ---------- visual ops ---------- */
function snapV(n) { const g = cur().grid; return g.snap ? Math.round(n / g.size) * g.size : Math.round(n); }
function freeSpot(w, h) {
  const o = cur(), g = o.grid.size, top = o.settings.showHeader !== false ? o.settings.headerH + g : g, tp = ui.mode === 'wf' ? tplOf(o) : null;
  const obs = [...pg().visuals, ...(tp && !o.hideLayout ? tp.visuals : [])].filter(v => !v.hidden);
  for (let y = top; y + h <= ph(); y += g) for (let x = g; x + w <= pw(); x += g) { if (!obs.some(v => x < v.x + v.w + g && x + w + g > v.x && y < v.y + v.h + g && y + h + g > v.y)) return { x, y }; }
  return { x: g, y: top };
}
function addVisual(type, x, y) {
  const T = TYPES[type], p = x == null ? freeSpot(T.w, T.h) : { x: snapV(x), y: snapV(y) };
  const v = mkV(type, clamp(p.x, 0, pw() - T.w), clamp(p.y, 0, ph() - T.h), T.w, T.h, {}, model());
  if (type === 'matrix') { const top = computeMatrix(v)?.rows[0]; v.open = top?.kids ? [top.path] : []; } // the first row shown, opened
  pg().visuals.push(v); renderPage(); openSheet(v.id); save();
}
function goPage(id) {
  const o = cur(); o.pageId = id; clearQS(); closeRing();
  Object.assign(ui, { sel: null, multi: new Set(), hl: null, skUndo: [], skRedo: [], paramSel: {}, slicerSel: {}, dropOpen: null });
  ui.vdata.clear(); ui.flipped = new Set(o.notesMode === 'flip' ? pg().visuals.map(v => v.id) : []);
  if (ui.panel === 'visual') ui.panel = 'tab';
  renderPage(); renderPanel(); renderPages(); renderSkTools(); save();
}
function addPage() {
  const o = cur(); let n = o.pages.length + 1;
  while (o.pages.some(p => p.name === `Page ${n}`)) n++;
  const p = mkPage(`Page ${n}`); o.pages.push(p); goPage(p.id);
}
function dupPage() {
  // Fresh ids for the page, its visuals and bookmarks; links between them (bookmark buttons, field parameters) follow.
  const o = cur(), src = pg(); let txt = JSON.stringify(src);
  [src.id, ...src.visuals.map(v => v.id), ...src.bookmarks.map(b => b.id)].forEach(id => txt = txt.split(`"${id}"`).join(`"${uid()}"`));
  const c = JSON.parse(txt); c.name = `${src.name} (copy)`;
  o.pages.splice(o.pages.indexOf(src) + 1, 0, c); goPage(c.id);
}
function pageDialog() {
  const dlg = $('#dlg'), o = cur(), p = pg(), i = o.pages.indexOf(p), n = o.pages.length;
  dlg.innerHTML = `<div class="dh"><h2 id="dlgTitle">Page</h2><button class="icon" data-act="closedlg" aria-label="Close">${I.x}</button></div>
 <div class="db"><label class="field stack"><span>Page name</span><input type="text" data-pgname value="${esc(p.name)}"></label>
 <div class="inline" style="margin-top:14px;flex-wrap:wrap"><button data-act="pagemove" data-val="-1" ${i ? '' : 'disabled'}>${I.back}Move left</button><button data-act="pagemove" data-val="1" ${i < n - 1 ? '' : 'disabled'}>Move right${I.fwd}</button><button data-act="pagedup">Duplicate page</button></div>
 <p class="hint">Each page has its own visuals, bookmarks and sketches. Styling, grid and the data model are shared across the wireframe.</p></div>
 <div class="df"><button class="danger" data-act="pagedel" style="margin-right:auto" ${n > 1 ? '' : 'disabled'}>Delete page</button><button class="primary" data-act="closedlg">Done</button></div>`;
  if (!dlg.open) { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); }
}
function libClick(type) { ui.multi.clear(); addVisual(type); }
function changeType(v, type) {
  const d = vDefaults(type, model()), keep = ['id', 'x', 'y', 'w', 'h', 'title', 'titleAuto', 'notes', 'ov', 'hidden'];
  if (DATA_TYPES.includes(v.type) && DATA_TYPES.includes(type)) keep.push('mid', 'paramId', 'sort', 'ref', 'drill');
  if (MULTI.includes(v.type) && MULTI.includes(type)) keep.push('m2', 'legend', 'mode');
  if (v.dim && d.dim && !(type === 'slicer' && D.isTime(v.dim))) keep.push('dim', 'periods');
  const nv = { ...d }; keep.forEach(k => nv[k] = v[k]);
  const a = pg().visuals; a[a.indexOf(v)] = nv;
  ui.hl = null; ui.vdata.delete(v.id); delete ui.slicerSel[v.id]; delete ui.paramSel[v.id];
  renderPage(); openSheet(nv.id); save();
}
function flipOne(id, on) { if (on === undefined) on = !ui.flipped.has(id); animateFlip([id], on); if (on) setTimeout(() => $(`textarea[data-notes="${id}"]`)?.focus({ preventScroll: true }), 480); }
function animateFlip(ids, on) { requestAnimationFrame(() => requestAnimationFrame(() => ids.forEach(id => { on ? ui.flipped.add(id) : ui.flipped.delete(id); document.querySelector(`.vis[data-id="${id}"]`)?.classList.toggle('flipped', on); }))); }
function setNotesMode(m) { const o = cur(); o.notesMode = m; ui.flipped = new Set(); renderPage(); if (m === 'flip') animateFlip(pg().visuals.map(v => v.id), true); renderPanel(`[data-act=notesmode][data-val=${m}]`); save(); }
function applyBm(id, quiet) { const p = pg(), bm = p.bookmarks.find(b => b.id === id); if (!bm) return; p.visuals.forEach(v => { if (bm.affects.includes(v.id)) v.hidden = bm.hidden.includes(v.id); }); p.activeBm = id; ui.dropOpen = null; renderPage(); if (!quiet) refreshSide(); save(); }
function moveZ(id, how) { const a = pg().visuals, i = a.findIndex(v => v.id === id); if (i < 0) return; const [v] = a.splice(i, 1); const j = how === 'front' ? a.length : how === 'back' ? 0 : how === 'fwd' ? Math.min(a.length, i + 1) : Math.max(0, i - 1); a.splice(j, 0, v); renderPage(); save(); }
function addMeasure() { const m = D.newMeasure({ name: `Measure ${model().measures.length + 1}` }); model().measures.push(m); return m; }
function addDim() { const d = D.newDim(`Dimension ${model().dims.length + 1}`, 5); model().dims.push(d); return d; }
function toast(msg, act) {
  const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg;
  if (act) { const b = document.createElement('button'); b.textContent = act[0]; b.onclick = () => { el.remove(); act[1](); }; el.appendChild(b); }
  document.body.appendChild(el); setTimeout(() => el.remove(), act ? 6000 : 2600);
}
const selIds = () => ui.multi.size ? [...ui.multi] : ui.sel ? [ui.sel] : [];
// Removes visuals from the page and its bookmarks; returns a function that puts them back.
function removeVisuals(ids) {
  const p = pg(), before = { visuals: p.visuals.slice(), bookmarks: clone(p.bookmarks || []) };
  p.visuals = p.visuals.filter(x => !ids.includes(x.id));
  (p.bookmarks || []).forEach(bm => { bm.hidden = bm.hidden.filter(x => !ids.includes(x)); bm.affects = bm.affects.filter(x => !ids.includes(x)); });
  ui.sel = null; ui.multi.clear(); if (ui.panel === 'visual') ui.panel = 'tab';
  renderPage(); renderPanel(); renderArrange(); save();
  return () => { Object.assign(p, before); if (ui.view === 'editor') { renderPage(); refreshSide(); } save(); };
}
// The Delete key deletes at once and offers Undo, so it needs no second press.
function deleteKey() {
  const ids = selIds(), vs = pg().visuals.filter(x => ids.includes(x.id)); if (!vs.length) return;
  const undo = removeVisuals(ids);
  toast(vs.length > 1 ? `Deleted ${vs.length} visuals` : `Deleted ${vName(vs[0])}`, ['Undo', undo]);
}
// Arrow keys: with snap on, a step lands on the next grid line; with snap off, it is 1px. A group moves together.
function nudge(key) {
  const ids = selIds(), vs = pg().visuals.filter(x => ids.includes(x.id)); if (!vs.length) return;
  const g = cur().grid, ax = key === 'ArrowLeft' || key === 'ArrowRight' ? 'x' : 'y', sz = ax === 'x' ? 'w' : 'h', dir = key === 'ArrowLeft' || key === 'ArrowUp' ? -1 : 1;
  const lo = Math.min(...vs.map(v => v[ax])), hi = Math.max(...vs.map(v => v[ax] + v[sz]));
  const to = g.snap ? (dir > 0 ? Math.floor(lo / g.size) + 1 : Math.ceil(lo / g.size) - 1) * g.size : lo + dir;
  const d = clamp(to - lo, -lo, (ax === 'x' ? pw() : ph()) - hi); if (!d) return;
  vs.forEach(v => { v[ax] += d; const el = document.querySelector(`.vis[data-id="${v.id}"]`); if (el) el.style[ax === 'x' ? 'left' : 'top'] = v[ax] + 'px'; });
  if (cur().notesMode === 'side' || hasBound(vs)) renderPage();
  syncPos(); save();
}
// Keeps the edit sheet's position fields in step after a drag, a nudge or a typed value.
function syncPos() { const v = ui.panel === 'visual' && ui.sel ? findV(ui.sel) : null; if (v) document.querySelectorAll('[data-pos]').forEach(i => { if (document.activeElement !== i) i.value = v[i.dataset.pos]; }); }
/* ---------- clipboard ---------- */
// The clipboard is in memory (ui.clip): it lasts until the app reloads and carries visuals between pages, wireframes
// and templates. Copies get fresh ids. Links inside the copied set (a visual and the field-parameter slicer it reads)
// point at the copies; links to things the target page does not have (its bookmarks, a slicer left behind) are dropped;
// measures and dimensions the target wireframe's data model does not have go back to that model's defaults.
const nVis = (vs, verb) => vs.length > 1 ? `${verb} ${vs.length} visuals` : `${verb} ${vName(vs[0])}`;
function copySel() {
  const ids = selIds(), vs = pg().visuals.filter(v => ids.includes(v.id)); if (!vs.length) return null;
  ui.clip = { vs: clone(vs), doc: cur().id, page: pg().id, n: {} }; return vs;
}
function copyKey() { const vs = copySel(); if (vs) toast(nVis(vs, 'Copied')); }
function cutKey() { const vs = copySel(); if (vs) toast(nVis(vs, 'Cut'), ['Undo', removeVisuals(vs.map(v => v.id))]); }
// A visual pasted into another wireframe keeps its own measure and fields only where that wireframe's model has them.
function fitModel(v, md) {
  const ms = new Set(md.measures.map(m => m.id)), ds = new Set(md.dims.map(d => d.id)), okD = k => !k || D.isTime(k) || ds.has(k), d = vDefaults(v.type, md);
  if (v.mid && !ms.has(v.mid)) v.mid = d.mid;
  if (v.m2 && !['ly', 'bud'].includes(v.m2) && !ms.has(v.m2)) v.m2 = '';
  v.params = (v.params || []).filter(id => ms.has(id)); if (!v.params.length) v.params = d.params;
  const dim0 = v.dim, sub0 = (v.sub || []).join();
  if (!okD(v.dim)) { v.dim = d.dim; v.periods = d.periods; }
  if (!okD(v.legend)) v.legend = '';
  if (!okD(v.cols)) v.cols = '';
  v.sub = (v.sub || []).filter(k => k && okD(k) && k !== v.dim);
  if (v.dim !== dim0 || v.sub.join() !== sub0) v.open = [];
}
// at: a page point (the canvas menu pastes where it was opened). Otherwise each paste on the page the visuals came
// from steps two grid squares down and right, and on another page the first paste lands in the same place.
function pasteClip(at) {
  const c = ui.clip; if (!c) return;
  const o = cur(), p = pg(), tpl = ui.mode === 'tpl', src = c.vs.filter(v => !tpl || LAYOUT_TYPES.includes(v.type)), skipped = c.vs.length - src.length;
  if (!src.length) return toast('Templates hold layout elements only, so there is nothing here to paste');
  let txt = JSON.stringify(src); src.forEach(v => txt = txt.split(`"${v.id}"`).join(`"${uid()}"`));
  const nv = JSON.parse(txt), mine = new Set(nv.map(v => v.id));
  nv.forEach(v => {
    if (v.paramId && !mine.has(v.paramId) && !p.visuals.some(x => x.id === v.paramId && x.type === 'slicer')) v.paramId = '';
    if (v.bmId && !(p.bookmarks || []).some(b => b.id === v.bmId)) { v.bmId = ''; v.action = 'none'; }
    if (!tpl && c.doc !== o.id) fitModel(v, model());
  });
  const x0 = Math.min(...nv.map(v => v.x)), y0 = Math.min(...nv.map(v => v.y)), x1 = Math.max(...nv.map(v => v.x + v.w)), y1 = Math.max(...nv.map(v => v.y + v.h));
  let dx, dy;
  if (at) { dx = snapV(at.x) - x0; dy = snapV(at.y) - y0; }
  else {
    const key = `${o.id}/${p.id}`, home = key === `${c.doc}/${c.page}` && p.visuals.some(x => c.vs.some(s => s.id === x.id));
    const k = (c.n[key] || 0) + (home ? 1 : 0); c.n[key] = (c.n[key] || 0) + 1; dx = dy = k * o.grid.size * 2;
  }
  dx = Math.max(-x0, Math.min(dx, pw() - x1)); dy = Math.max(-y0, Math.min(dy, ph() - y1));
  nv.forEach(v => { v.w = Math.min(v.w, pw()); v.h = Math.min(v.h, ph()); v.x = clamp(v.x + dx, 0, pw() - v.w); v.y = clamp(v.y + dy, 0, ph() - v.h); });
  p.visuals.push(...nv);
  ui.multi = new Set(nv.length > 1 ? nv.map(v => v.id) : []); ui.sel = nv[nv.length - 1].id;
  if (ui.panel === 'visual' && nv.length > 1) ui.panel = 'tab';
  renderPage(); setSel(ui.sel); renderPanel(); save();
  toast(nVis(nv, 'Pasted') + (skipped ? `. ${skipped} not pasted: templates hold layout elements only` : ''), ['Undo', () => removeVisuals([...mine])]);
}
function changeTypeUndo(v, type) {
  const p = pg(), old = clone(v); changeType(v, type);
  toast(`Changed to ${TYPES[type].name.toLowerCase()}`, ['Undo', () => { const i = p.visuals.findIndex(x => x.id === old.id); if (i < 0) return; p.visuals[i] = old; ui.vdata.delete(old.id); if (p === pg() && ui.view === 'editor') { renderPage(); openSheet(old.id); } save(); }]);
}

/* ---------- visual menu ---------- */
// Right-click, or double-tap / double-click, on a visual: change type, notes, copy, paste, delete (on a multi-selection:
// copy, paste, delete). On empty canvas: paste, at that spot. In Sketch mode a right-click opens the tool ring instead.
let vmenu = null;
function closeMenu() { if (vmenu) { vmenu.el.remove(); vmenu = null; } }
function openMenu(cx, cy, id) {
  closeMenu(); clearQS(); $('#tip').hidden = true;
  if (id && !selIds().includes(id)) { ui.multi.clear(); setSel(id); if (ui.panel === 'visual') renderPanel(); else refreshSide(); }
  const r = $('#page').getBoundingClientRect(), el = document.createElement('div');
  el.className = 'vmenu'; el.setAttribute('role', 'menu');
  vmenu = { el, view: 'main', t: performance.now(), ctx: { id, cx, cy, at: { x: (cx - r.left) / ui.scale, y: (cy - r.top) / ui.scale } } };
  document.body.appendChild(el); menuHTML();
}
function menuHTML() {
  const { el, view, ctx } = vmenu, v = ctx.id ? findV(ctx.id) : null, n = v ? selIds().length : 0, it = (val, icon, label, ex = '') => `<button role="menuitem" data-act="vm" data-val="${val}" ${ex}>${I[icon]}<span>${label}</span></button>`;
  const paste = it('paste', 'paste', 'Paste', ui.clip ? '' : 'disabled');
  if (view === 'types') {
    const types = Object.entries(TYPES).filter(([k]) => ui.mode !== 'tpl' || LAYOUT_TYPES.includes(k));
    el.innerHTML = `${it('back', 'back', 'Change type')}<div class="vmtypes">${types.map(([k, t]) => `<button role="menuitem" data-act="vmtype" data-type="${k}" ${k === v.type ? 'aria-current="true" disabled' : ''}>${I[k]}<span>${t.name}</span></button>`).join('')}</div>`;
  } else if (!v) el.innerHTML = paste;
  else el.innerHTML = `<div class="vmhead">${esc(n > 1 ? `${n} visuals` : vName(v))}</div>${n > 1 ? '' : it('types', 'swap', 'Change type') + (ui.mode === 'tpl' ? '' : it('notes', 'notes', ui.flipped.has(v.id) ? 'Hide notes' : 'Notes'))}${it('copy', 'copy', 'Copy')}${paste}<span class="sep"></span>${it('delete', 'trash', 'Delete', 'class="danger"')}`;
  const w = el.offsetWidth, h = el.offsetHeight;
  el.style.left = clamp(ctx.cx + 4, 8, innerWidth - w - 8) + 'px'; el.style.top = (ctx.cy + 4 + h > innerHeight - 8 ? Math.max(8, ctx.cy - h - 4) : ctx.cy + 4) + 'px';
  el.querySelector('button:not([disabled])')?.focus({ preventScroll: true });
}
function vmAct(val) {
  if (!vmenu) return;
  const { ctx } = vmenu, v = ctx.id ? findV(ctx.id) : null;
  if (val === 'types' || val === 'back') { vmenu.view = val === 'types' ? 'types' : 'main'; return menuHTML(); }
  closeMenu();
  if (val === 'copy') copyKey();
  else if (val === 'paste') pasteClip(v ? null : ctx.at);
  else if (val === 'delete') deleteKey();
  else if (val === 'notes' && v) { if (v.hidden && !ui.flipped.has(v.id)) { v.hidden = false; renderPage(); save(); } flipOne(v.id); }
}
function download(name, text, type = 'text/csv') { const url = URL.createObjectURL(new Blob([text], { type })); const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000); }

/* ---------- pointer: canvas ---------- */
function clearSel() { ui.multi.clear(); setSel(null); if (ui.dropOpen) { ui.dropOpen = null; renderPage(); } if (ui.panel === 'visual') { ui.panel = 'tab'; ui.tab = 'settings'; renderPanel(); } else refreshSide(); }
// Touches on the stage. Two or more fingers are a gesture in every mode: pinch zooms, two fingers drag to pan,
// a two-finger tap undoes and a three-finger tap redoes (Sketch mode). One finger always edits unless fingerDraws.
const touches = new Map(); let gesture = null, strokeCancel = null, dragCancel = null;
function startGesture() {
  if (strokeCancel) strokeCancel(); if (dragCancel) dragCancel(); clearQS();
  const [a, b] = [...touches.values()], r = $('#page').getBoundingClientRect(), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
  gesture = { t: Date.now(), moved: false, max: 2, d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, s0: ui.scale, px: (cx - r.left) / ui.scale, py: (cy - r.top) / ui.scale };
}
function pinch() {
  const [a, b] = [...touches.values()], cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2, d = Math.hypot(a.x - b.x, a.y - b.y);
  ui.zoom = String(+clamp(gesture.s0 * d / gesture.d0, .2, 3).toFixed(3)); fit(); syncZoom();
  const st = $('#stage'), r = $('#page').getBoundingClientRect();
  st.scrollLeft += r.left - (cx - gesture.px * ui.scale); st.scrollTop += r.top - (cy - gesture.py * ui.scale);
}
function syncZoom() {
  const z = $('#zoom'); if (!z) return;
  let o = z.querySelector('[data-custom]');
  if ([...z.options].some(x => !x.dataset.custom && x.value === ui.zoom)) { if (o) o.remove(); z.value = ui.zoom; return; }
  if (!o) { o = document.createElement('option'); o.dataset.custom = '1'; z.appendChild(o); }
  o.value = ui.zoom; o.textContent = Math.round(ui.scale * 100) + '%'; z.value = ui.zoom;
}
document.addEventListener('pointerdown', e => {
  if (ui.view !== 'editor') return;
  ui.downT = performance.now();
  if (vmenu && !e.target.closest('.vmenu')) closeMenu();
  const lib = e.target.closest('.libitem'); if (lib) return libDown(e, lib);
  if (qs && !e.target.closest('.qschip')) clearQS();
  if (ring && ring.pointerId == null && !e.target.closest('.skring')) closeRing();
  if (e.pointerType === 'pen') hideHover();
  if (e.pointerType === 'touch' && e.target.closest('#stage') && !e.target.closest('#sktools')) {
    if (ui.drawing === 'pen') { e.preventDefault(); return; }   // palm resting while the Pencil draws
    touches.set(e.pointerId, { x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY });
    if (touches.size === 2) { startGesture(); e.preventDefault(); return; }
    if (touches.size > 2) { if (gesture) gesture.max = Math.max(gesture.max, touches.size); e.preventDefault(); return; }
  }
  if (e.pointerType === 'pen' && dragCancel) dragCancel();   // a palm that landed first must not keep dragging
  const page = e.target.closest('#page');
  if (!page) { if (e.target.closest('#stage') && !e.target.closest('#sktools')) clearSel(); return; }
  if (ui.drawing) { if (e.pointerType === 'touch') e.preventDefault(); return; }
  // Sketch mode: the Pencil and a mouse draw, a finger edits (unless fingerDraws). Outside it only pencilDraws draws.
  const o = cur(), kind = e.pointerType;
  const draws = ui.mode === 'wf' && e.button === 0 && (kind === 'pen' ? (ui.sk.on || o.pencilDraws === true) : kind === 'touch' ? (ui.sk.on && o.fingerDraws === true) : ui.sk.on);
  if (draws && !e.target.closest('textarea,.nhead button,.vhdr')) return sketchDown(e, page);
  const el = e.target.closest('.vis[data-id]');
  if (!el) {   // a double-tap on empty canvas opens the menu (Paste)
    clearSel(); if (e.button !== 0) return;
    const now = Date.now(), l = ui.lastE;
    if (l && now - l.t < 380 && Math.hypot(e.clientX - l.x, e.clientY - l.y) < 24) { ui.lastE = null; openMenu(e.clientX, e.clientY, null); } else ui.lastE = { t: now, x: e.clientX, y: e.clientY };
    return;
  }
  if (e.target.closest('button,textarea,.back') || e.button !== 0) return;
  if (e.ctrlKey || e.metaKey || e.shiftKey || ui.multiMode) {   // two quick toggles leave the selection as it was and open the menu
    const id = el.dataset.id, now = Date.now(); toggleMulti(id);
    if (ui.lastM && ui.lastM.id === id && now - ui.lastM.t < 380) { ui.lastM = null; openMenu(e.clientX, e.clientY, id); } else ui.lastM = { id, t: now };
    return;
  }
  const v = findV(el.dataset.id), hEl = e.target.closest('.vrs'), dir = hEl ? hEl.dataset.h : null, resize = !!dir, target = e.target, g = cur().grid;
  const st = { x: e.clientX, y: e.clientY, vx: v.x, vy: v.y, vw: v.w, vh: v.h }; let moved = false;
  const group = !resize && ui.multi.has(v.id) ? pg().visuals.filter(x => ui.multi.has(x.id)).map(x => ({ v: x, x: x.x, y: x.y, el: document.querySelector(`.vis[data-id="${x.id}"]`) })) : null;
  if (!group && ui.multi.size) ui.multi.clear();
  const was = ui.sel; if (!group) { setSel(v.id); if (ui.panel === 'visual' && was !== v.id) renderPanel(); else if (was !== v.id) refreshSide(); }
  el.setPointerCapture(e.pointerId);
  const mv = ev => {
    const dx = (ev.clientX - st.x) / ui.scale, dy = (ev.clientY - st.y) / ui.scale;
    if (!moved && Math.abs(dx) + Math.abs(dy) < 4) return;
    moved = true; el.classList.add('dragging'); $('#tip').hidden = true;
    if (resize) {
      const mn = Math.max(15, g.size); let x = st.vx, y = st.vy, w = st.vw, h = st.vh;
      if (dir.includes('e')) w = clamp(snapV(st.vx + st.vw + dx) - st.vx, mn, pw() - st.vx);
      if (dir.includes('s')) h = clamp(snapV(st.vy + st.vh + dy) - st.vy, mn, ph() - st.vy);
      if (dir.includes('w')) { x = clamp(snapV(st.vx + dx), 0, st.vx + st.vw - mn); w = st.vx + st.vw - x; }
      if (dir.includes('n')) { y = clamp(snapV(st.vy + dy), 0, st.vy + st.vh - mn); h = st.vy + st.vh - y; }
      Object.assign(v, { x, y, w, h }); Object.assign(el.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
    } else if (group) {
      const gx0 = Math.min(...group.map(g => g.x)), gx1 = Math.max(...group.map(g => g.x + g.v.w)), gy0 = Math.min(...group.map(g => g.y)), gy1 = Math.max(...group.map(g => g.y + g.v.h));
      const mx = clamp(snapV(st.vx + dx) - st.vx, -gx0, pw() - gx1), my = clamp(snapV(st.vy + dy) - st.vy, -gy0, ph() - gy1);
      group.forEach(g => { g.v.x = g.x + mx; g.v.y = g.y + my; if (g.el) { g.el.style.left = g.v.x + 'px'; g.el.style.top = g.v.y + 'px'; } });
    } else { v.x = clamp(snapV(st.vx + dx), 0, pw() - v.w); v.y = clamp(snapV(st.vy + dy), 0, ph() - v.h); el.style.left = v.x + 'px'; el.style.top = v.y + 'px'; }
  };
  dragCancel = () => {
    dragCancel = null; el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); el.classList.remove('dragging');
    try { el.releasePointerCapture(e.pointerId); } catch (_) {}
    if (moved) { if (group) group.forEach(g => { g.v.x = g.x; g.v.y = g.y; }); else Object.assign(v, { x: st.vx, y: st.vy, w: st.vw, h: st.vh }); renderPage(); }
  };
  const up = ev => {
    dragCancel = null;
    el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); el.classList.remove('dragging');
    if (moved) { if (resize || cur().notesMode === 'side' || ui.dropOpen === v.id || hasBound(group ? group.map(g => g.v) : [v])) renderPage(); syncPos(); save(); return; }
    if (group) ui.multi.clear();
    clickVisual(v, target, ev);
  };
  el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
});
document.addEventListener('pointermove', e => {
  if (e.pointerType === 'pen' && !e.buttons && ui.view === 'editor') hoverAt(e); else if (e.pointerType !== 'mouse') hideHover();
  if (e.pointerType === 'touch' && touches.has(e.pointerId)) {
    const t = touches.get(e.pointerId); t.x = e.clientX; t.y = e.clientY;
    if (gesture) { if (Math.hypot(t.x - t.x0, t.y - t.y0) > 12) gesture.moved = true; if (gesture.moved && gesture.max === 2 && touches.size === 2) pinch(); }
  }
  const tip = $('#tip');
  if (ui.view !== 'editor' || ui.drawing || ui.sk.on) { tip.hidden = true; return; }
  const t = e.target.closest && e.target.closest('.front [data-i]'), el = t && t.closest('.vis[data-id]');
  if (!el || el.classList.contains('dragging') || el.classList.contains('flipped')) { tip.hidden = true; return; }
  const v = findV(el.dataset.id), h = v ? tipHTML(v, +t.dataset.i) : '';
  if (!h) { tip.hidden = true; return; }
  tip.innerHTML = h; tip.hidden = false;
  const r = tip.getBoundingClientRect(); let x = e.clientX + 14, y = e.clientY + 14;
  if (x + r.width > innerWidth - 8) x = e.clientX - r.width - 14; if (y + r.height > innerHeight - 8) y = e.clientY - r.height - 14;
  tip.style.left = x + 'px'; tip.style.top = y + 'px';
});
const touchEnd = e => {
  if (e.pointerType !== 'touch' || !touches.has(e.pointerId)) return;
  touches.delete(e.pointerId);
  if (gesture && touches.size === 0) { if (!gesture.moved && Date.now() - gesture.t < 450 && ui.sk.on) { if (gesture.max >= 3) skRedo(); else skUndo(); } gesture = null; }
};
// iPad Safari can still pan the stage under touch-action:none, which cancels the drag. Block the native pan on visuals and while drawing.
document.addEventListener('touchmove', e => { if (ui.view === 'editor' && (ui.drawing || (e.touches && e.touches.length > 1 && e.target.closest && e.target.closest('#stage')) || (e.target.closest && e.target.closest('#page .vis[data-id]') && !e.target.closest('textarea')))) e.preventDefault(); }, { passive: false });
// Right-click on the page: the tool ring in Sketch mode, otherwise the visual menu (or Paste on empty canvas).
// A notes field keeps the browser's own menu.
document.addEventListener('contextmenu', e => {
  if (ui.view !== 'editor' || !e.target.closest('#page')) return;
  if (ui.sk.on && ui.mode === 'wf') { e.preventDefault(); openRing(e.clientX, e.clientY, null); return; }
  if (e.target.closest('textarea,input')) return;
  e.preventDefault(); const el = e.target.closest('.vis[data-id]'); openMenu(e.clientX, e.clientY, el ? el.dataset.id : null);
});
// Safari's own pinch would zoom the whole app instead of the canvas
document.addEventListener('gesturestart', e => { if (ui.view === 'editor') e.preventDefault(); });
document.addEventListener('pointerup', touchEnd); document.addEventListener('pointercancel', touchEnd);
// A second tap or click within 380 ms opens the visual menu, and undoes any highlight the first one made.
function clickVisual(v, target, ev) {
  const now = Date.now();
  if (ui.last && ui.last.id === v.id && now - ui.last.t < 380) { ui.last = null; if (ui.hl !== ui.hlBefore) { ui.hl = ui.hlBefore; renderPage(); } openMenu(ev.clientX, ev.clientY, v.id); return; }
  ui.last = { id: v.id, t: now }; ui.hlBefore = ui.hl;
  openSheet(v.id);
  if (v.type === 'button') { if (v.action === 'bookmark' && v.bmId) applyBm(v.bmId); return; }
  if (v.type === 'slicer') {
    if (v.sStyle === 'param') { const p = target.closest('[data-p]'); if (p) { ui.paramSel[v.id] = +p.dataset.p; renderPage(); } return; }
    if (v.sStyle === 'date') return;
    if (v.sStyle === 'dropdown') {
      if (target.closest('[data-dd]')) { ui.dropOpen = ui.dropOpen === v.id ? null : v.id; renderPage(); return; }
      if (target.closest('[data-all]')) { delete ui.slicerSel[v.id]; ui.dropOpen = null; renderPage(); return; }
    }
    const di = target.closest('[data-i]');
    if (di) { const i = +di.dataset.i; if (ui.slicerSel[v.id] === i) delete ui.slicerSel[v.id]; else ui.slicerSel[v.id] = i; ui.dropOpen = null; renderPage(); }
    return;
  }
  const di = target.closest('[data-i]');
  if (di && v.dim && !D.isTime(v.dim) && ['column', 'bar', 'donut', 'table'].includes(v.type)) {
    const d = ui.vdata.get(v.id), key = d ? d.keys[+di.dataset.i] : +di.dataset.i;
    const same = ui.hl && ui.hl.i === key && ui.hl.dim === v.dim;
    ui.hl = same ? null : { src: v.id, dim: v.dim, i: key }; ui.dropOpen = null; renderPage();
  } else if (ui.hl && !di) { ui.hl = null; renderPage(); }
}
function libDown(e, b) {
  if (e.button !== 0) return; e.preventDefault();
  const type = b.dataset.type, st = { x: e.clientX, y: e.clientY }; let ghost = null;
  const mv = ev => { if (!ghost && Math.hypot(ev.clientX - st.x, ev.clientY - st.y) < 6) return; if (!ghost) { ghost = document.createElement('div'); ghost.className = 'dragghost'; ghost.textContent = TYPES[type].name; document.body.appendChild(ghost); } ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px'; };
  const up = ev => {
    window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
    if (!ghost) { libClick(type); return; }
    ghost.remove(); const pg = $('#page').getBoundingClientRect(), T = TYPES[type];
    if (ev.clientX >= pg.left && ev.clientX <= pg.right && ev.clientY >= pg.top && ev.clientY <= pg.bottom) addVisual(type, (ev.clientX - pg.left) / ui.scale - T.w / 2, (ev.clientY - pg.top) / ui.scale - T.h / 2);
  };
  window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
}

/* ---------- sketch ---------- */
function pathD(pts) { const f = n => n.toFixed(1); if (pts.length < 2) return `M${f(pts[0][0])} ${f(pts[0][1])}l0.01 0`; let d = `M${f(pts[0][0])} ${f(pts[0][1])}`; for (let i = 1; i < pts.length - 1; i++) d += `Q${f(pts[i][0])} ${f(pts[i][1])} ${f((pts[i][0] + pts[i + 1][0]) / 2)} ${f((pts[i][1] + pts[i + 1][1]) / 2)}`; const l = pts[pts.length - 1]; return d + `L${f(l[0])} ${f(l[1])}`; }
function outlinePath(pts, w, press, taper, tilt = 0, k = null) {
  const [lo, hi] = press, f = n => n.toFixed(1), n = pts.length, rad = i => { let r = w * (lo + (hi - lo) * (pts[i][2] ?? .5)) / 2 * (1 + (pts[i][3] || 0) * tilt); if (taper) { const t = Math.min(i, n - 1 - i); r *= Math.min(1, .2 + t / 6); } return k ? r * k(i, n) : Math.max(.35, r); };
  if (n < 2) { const r = rad(0), [x, y] = pts[0]; return `M${f(x - r)} ${f(y)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`; }
  const L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
    const r = rad(i); L.push([pts[i][0] - dy * r, pts[i][1] + dx * r]); R.push([pts[i][0] + dy * r, pts[i][1] - dx * r]);
  }
  const rE = rad(n - 1), rS = rad(0);
  let d = `M${f(L[0][0])} ${f(L[0][1])}`;
  for (let i = 1; i < n; i++) d += `L${f(L[i][0])} ${f(L[i][1])}`;
  d += `A${f(rE)} ${f(rE)} 0 0 0 ${f(R[n - 1][0])} ${f(R[n - 1][1])}`;
  for (let i = n - 1; i >= 0; i--) d += `L${f(R[i][0])} ${f(R[i][1])}`;
  return d + `A${f(rS)} ${f(rS)} 0 0 0 ${f(L[0][0])} ${f(L[0][1])}Z`;
}
function strokeSVG(s) {
  if (s.fill) return `<g><path d="${pathD(s.pts)}Z" fill="${s.fill}"/>${strokeSVG({ ...s, fill: null })}</g>`;
  const T = TOOLS[s.tool] || TOOLS.pen;
  if (!T.press) return `<path d="${pathD(s.pts)}" stroke="${s.c}" stroke-width="${s.w}" fill="none" stroke-linecap="${T.cap || 'round'}" stroke-linejoin="round" opacity="${T.op}"${s.tool === 'marker' ? ' style="mix-blend-mode:multiply"' : ''}/>`;
  if (T.grain) return `<g fill="${s.c}" opacity="${T.op}"><path d="${outlinePath(s.pts, s.w, T.press, false, T.tilt, () => 1.4)}" mask="url(#skgrainF)"/><path d="${outlinePath(s.pts, s.w, T.press, false, T.tilt)}" mask="url(#skgrainL)"/><path d="${outlinePath(s.pts, s.w, T.press, false, 0, coreK(s.pts))}" mask="url(#skgrain)"/></g>`;
  return `<path d="${outlinePath(s.pts, s.w, T.press, T.taper, T.tilt)}" fill="${s.c}" opacity="${T.op}"/>`;
}
// Pencil: graphite only marks the raised tooth of the paper. Each stroke is three layers on the same paper
// grain: a fringe 1.4 times the width with very sparse grain (#skgrainF, stray specks, so the edge breaks up
// instead of ending on a clean curve), the full width with sparse grain (#skgrainL) and a core with dense
// grain (#skgrain). The core's width follows pressure and fades over the first 25% and last 15% of the stroke,
// so light pressure and the ends leave only speckle and hard pressure lays down a dark centre. Tilt
// broadens only the outer layer, so shading on the side of the lead is wide and light.
const coreK = pts => (i, n) => n < 3 ? .6 : .85 * clamp(((pts[i][2] ?? .5) - .1) / .5, 0, 1) * Math.min(1, i / (n * .25), (n - 1 - i) / (n * .15));
// The grain tile: paper fibre. Short strands at random angles, some lighter and some darker than the
// paper, drawn on a canvas and wrapped at the edges so the tile repeats without a seam, then thresholded at
// a given coverage. Fibres, not dot noise: thresholded dot noise reads as pixels or camouflage, not
// graphite. All three masks come from the same tile, so sparser layers' specks are a subset of denser ones'.
// The patterns are in page units, so the grain stays put under the page and overlapping strokes darken
// the same grains. One pair of masks serves every SVG in the document (canvas and thumbnails), so it is
// added once at start-up.
function grainDefs() {
  const N = 192, S = 1, n = N * N, c = document.createElement('canvas'); c.width = c.height = N;
  const cx = c.getContext('2d'); if (!cx) return;
  let seed = 20261102; const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  cx.fillStyle = '#808080'; cx.fillRect(0, 0, N, N);
  for (let k = 0; k < 9000; k++) {
    const x = rnd() * N, y = rnd() * N, a = rnd() * Math.PI, l = 2 + rnd() * 7, dx = Math.cos(a) * l / 2, dy = Math.sin(a) * l / 2, v = rnd() < .5 ? 0 : 255;
    cx.strokeStyle = `rgba(${v},${v},${v},${(.12 + rnd() * .3).toFixed(2)})`; cx.lineWidth = .5 + rnd() * .7;
    for (const ox of x < l ? [0, N] : x > N - l ? [0, -N] : [0]) for (const oy of y < l ? [0, N] : y > N - l ? [0, -N] : [0]) { cx.beginPath(); cx.moveTo(x - dx + ox, y - dy + oy); cx.lineTo(x + dx + ox, y + dy + oy); cx.stroke(); }
  }
  const px = cx.getImageData(0, 0, N, N).data, g = new Float32Array(n);
  for (let k = 0; k < n; k++) g[k] = px[4 * k] / 255 + (rnd() - .5) * .01;
  const sorted = Float32Array.from(g).sort();
  const tile = cover => {
    const q = sorted[Math.round((1 - cover) * (n - 1))], img = cx.createImageData(N, N);
    for (let k = 0; k < n; k++) { const v = clamp((g[k] - q) / .08 + .5, 0, 1) * 255; img.data[4 * k] = img.data[4 * k + 1] = img.data[4 * k + 2] = v; img.data[4 * k + 3] = 255; }
    cx.putImageData(img, 0, 0); return c.toDataURL();
  };
  const def = (id, cover) => `<pattern id="${id}p" patternUnits="userSpaceOnUse" width="${N * S}" height="${N * S}"><image href="${tile(cover)}" width="${N * S}" height="${N * S}"/></pattern><mask id="${id}"><rect x="-1e5" y="-1e5" width="2e5" height="2e5" fill="url(#${id}p)"/></mask>`;
  document.body.insertAdjacentHTML('beforeend', `<svg class="skdefs" width="0" height="0" aria-hidden="true"><defs>${def('skgrain', .8)}${def('skgrainL', .5)}${def('skgrainF', .15)}</defs></svg>`);
}
function redrawSketch() { const svg = $('#sketch'); if (svg) svg.innerHTML = (pg().sketch || []).map(strokeSVG).join(''); }
function pushUndo() { const o = cur(); ui.skUndo.push(clone(pg().sketch || [])); if (ui.skUndo.length > 60) ui.skUndo.shift(); ui.skRedo = []; }
function skUndo() { if (!ui.skUndo.length) return; const o = cur(); ui.skRedo.push(clone(pg().sketch || [])); pg().sketch = ui.skUndo.pop(); redrawSketch(); renderSkTools(); save(); }
function skRedo() { if (!ui.skRedo.length) return; const o = cur(); ui.skUndo.push(clone(pg().sketch || [])); pg().sketch = ui.skRedo.pop(); redrawSketch(); renderSkTools(); save(); }
// 0 while the Pencil is at writing angle or steeper, rising to 1 as it lies flat. Safari reports either
// altitudeAngle or tiltX/tiltY; a browser that only knows tilt reports altitude as straight up.
const TILT_FROM = 50 * Math.PI / 180;
function tiltOf(ev) {
  if (ev.pointerType !== 'pen') return 0;
  let a = ev.altitudeAngle;
  if (a == null || (a >= Math.PI / 2 - 1e-6 && (ev.tiltX || ev.tiltY))) { const tx = Math.tan((ev.tiltX || 0) * Math.PI / 180), ty = Math.tan((ev.tiltY || 0) * Math.PI / 180); a = Math.atan2(1, Math.hypot(tx, ty)); }
  return clamp((TILT_FROM - a) / TILT_FROM, 0, 1);
}
/* ---------- QuickShape ---------- */
let qs = null, lastTap = null;
function densify(list, step = 6) {
  const out = [list[0]];
  for (let i = 1; i < list.length; i++) { const [ax, ay] = list[i - 1], [bx, by] = list[i], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / step)); for (let k = 1; k <= n; k++) out.push([ax + (bx - ax) * k / n, ay + (by - ay) * k / n]); }
  return out;
}
// A held stroke becomes a straight line, a rectangle (axis-aligned, for wireframes) or an ellipse; anything else stays as drawn.
function quickShape(pts) {
  const P = pts.map(p => [p[0], p[1]]), n = P.length; if (n < 5) return null;
  let L = 0; for (let i = 1; i < n; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
  if (L < 30) return null;
  const avg = k => pts.reduce((t, p) => t + (p[k] || 0), 0) / n, pr = +avg(2).toFixed(2), tl = +avg(3).toFixed(2);
  const mk = list => list.map(([x, y]) => tl ? [+x.toFixed(1), +y.toFixed(1), pr, tl] : [+x.toFixed(1), +y.toFixed(1), pr]);
  const [sx, sy] = P[0], [ex, ey] = P[n - 1], chord = Math.hypot(ex - sx, ey - sy);
  if (chord / L > .92) return { kind: 'line', pts: mk(densify([[sx, sy], [ex, ey]])) };
  const xs = P.map(p => p[0]), ys = P.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), w = x1 - x0, h = y1 - y0, diag = Math.hypot(w, h);
  if (w < 20 || h < 20 || chord > .3 * Math.max(w, h)) return null;
  const corner = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].reduce((t, [cx, cy]) => t + Math.min(...P.map(([x, y]) => Math.hypot(x - cx, y - cy))), 0) / 4 / diag;
  const rErr = P.reduce((t, [x, y]) => t + Math.min(Math.abs(x - x0), Math.abs(x - x1), Math.abs(y - y0), Math.abs(y - y1)), 0) / n / Math.min(w, h);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, eErr = P.reduce((t, [x, y]) => t + Math.abs(Math.hypot((x - cx) / (w / 2), (y - cy) / (h / 2)) - 1), 0) / n;
  if (corner < .08 && rErr < .08) return { kind: 'rect', pts: mk(densify([[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]])) };
  if (eErr < .14) return { kind: 'ellipse', pts: mk(Array.from({ length: 73 }, (_, i) => [cx + w / 2 * Math.cos(i / 72 * 2 * Math.PI), cy + h / 2 * Math.sin(i / 72 * 2 * Math.PI)])) };
  return null;
}
// Fill: a QuickShape rectangle or ellipse, or any freehand outline whose ends meet, counts as closed.
function closedStroke(s) {
  if (s.shape === 'rect' || s.shape === 'ellipse') return true;
  const P = s.pts; if (P.length < 8) return false;
  const xs = P.map(p => p[0]), ys = P.map(p => p[1]), w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
  return w > 15 && h > 15 && Math.hypot(P[0][0] - P.at(-1)[0], P[0][1] - P.at(-1)[1]) < Math.max(12, .15 * Math.max(w, h));
}
function inside(P, x, y) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i][1] > y) !== (P[j][1] > y) && x < (P[j][0] - P[i][0]) * (y - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; return c; }
// Fills the topmost closed drawing under the tap; the same colour again clears it.
function fillAt(x, y) {
  const list = pg().sketch || [], s = [...list].reverse().find(k => k.tool !== 'eraser' && closedStroke(k) && inside(k.pts, x, y));
  if (!s) { toast('Tap inside a closed shape to fill it'); return; }
  pushUndo(); s.fill = s.fill === ui.sk.color ? null : ui.sk.color; if (!s.fill) delete s.fill;
  redrawSketch(); renderSkTools(); save();
}
function clearQS() { if (!qs) return; clearTimeout(qs.t); qs.el.remove(); qs = null; }
function showQS(s) {
  clearQS();
  const xs = s.pts.map(p => p[0]), ys = s.pts.map(p => p[1]), box = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  const r = $('#page').getBoundingClientRect(), el = document.createElement('div');
  el.className = 'qschip'; el.innerHTML = `<button data-act="qsmake">${I.column}Make visual</button>`;
  el.style.left = clamp(r.left + box.x * ui.scale, 8, innerWidth - 200) + 'px'; el.style.top = clamp(r.top + box.y * ui.scale - 56, 8, innerHeight - 60) + 'px';
  document.body.appendChild(el); qs = { s, box, el, t: setTimeout(clearQS, 8000) };
}
function qsMenu() {
  if (!qs) return; clearTimeout(qs.t); qs.t = setTimeout(clearQS, 20000);
  qs.el.innerHTML = `<span class="lab">Make this a</span>${Object.entries(TYPES).map(([k, t]) => `<button data-act="qstype" data-type="${k}" aria-label="${t.name}" title="${t.name}">${I[k]}</button>`).join('')}<button data-act="qsclose" aria-label="Keep the drawing">${I.x}</button>`;
}
function qsMake(type) {
  if (!qs) return;
  const { s, box } = qs, w = clamp(snapV(box.w), 30, pw()), h = clamp(snapV(box.h), 30, ph());
  const v = mkV(type, clamp(snapV(box.x), 0, pw() - w), clamp(snapV(box.y), 0, ph() - h), w, h, {}, model());
  pg().visuals.push(v); pg().sketch = pg().sketch.filter(x => x !== s); clearQS();
  renderPage(); renderSkTools(); openSheet(v.id); save();
}
function sketchDown(e, page) {
  e.preventDefault(); const o = cur(); pg().sketch = pg().sketch || []; $('#tip').hidden = true;
  if (o.showSketch === false) { o.showSketch = true; $('#sketch').style.display = ''; const t = $('[data-k=showSketch]'); if (t) t.checked = true; }
  const tool = (ui.sk.on || e.pointerType !== 'pen') ? ui.sk.tool : (ui.sk.tool), T = TOOLS[tool], rect = page.getBoundingClientRect();
  const rawPt = ev => [(ev.clientX - rect.left) / ui.scale, (ev.clientY - rect.top) / ui.scale, ev.pointerType === 'pen' ? (ev.pressure || .5) : .5, tiltOf(ev)];
  clearQS();
  if (tool === 'fill' && e.pointerType !== 'pen') { const [x, y] = rawPt(e); fillAt(x, y); return; }
  pushUndo(); ui.drawing = e.pointerType; page.setPointerCapture(e.pointerId);
  let up0 = null, mv, s = null, path = null, changed = false, last = null, cancelled = false, hold = null, snapped = false, lastRaw = null;
  // Pencil only: holding still for 400 ms before moving opens the tool ring instead of drawing
  const t0 = Date.now(), sx0 = e.clientX, sy0 = e.clientY, pen = e.pointerType === 'pen', before = clone(ui.skUndo[ui.skUndo.length - 1] || []), undoLen = ui.skUndo.length - 1; let still = true;
  const ringT = pen ? setTimeout(() => { if (still && strokeCancel) { strokeCancel(); openRing(sx0, sy0, e.pointerId); } }, 400) : null;
  const moveCheck = ev => { if (still && Math.hypot(ev.clientX - sx0, ev.clientY - sy0) > 4) { still = false; clearTimeout(ringT); } };
  page.addEventListener('pointermove', moveCheck);
  const size = ui.sk.size[tool];
  if (tool === 'fill') {
    mv = () => {};
    up0 = () => { ui.skUndo.pop(); if (still) { const [x, y] = rawPt(e); fillAt(x, y); } };
  } else if (tool === 'eraser') {
    mv = ev => { const [x, y] = rawPt(ev), n = pg().sketch.length, r = size / 2 + 4; pg().sketch = pg().sketch.filter(st => !st.pts.some(p => Math.hypot(p[0] - x, p[1] - y) < r + (st.w || 2) / 2)); if (pg().sketch.length !== n) { changed = true; redrawSketch(); } };
    mv(e);
  } else {
    const smooth = ev => { const p = rawPt(ev); if (!last) { last = p; return p; } const k = 1 - stabOf(tool) / 100; last = [last[0] + (p[0] - last[0]) * k, last[1] + (p[1] - last[1]) * k, last[2] + (p[2] - last[2]) * .5, last[3] + (p[3] - last[3]) * .5]; return last; };
    // QuickShape: holding still for 550 ms snaps the stroke; small jitter does not restart the wait
    const armHold = () => { clearTimeout(hold); hold = setTimeout(() => { const sh = quickShape(lastRaw ? [...s.pts, lastRaw] : s.pts); if (sh) { s.pts = sh.pts; s.shape = sh.kind; snapped = true; draw(); } }, 550); };
    s = { tool, c: ui.sk.color, w: size, pts: [smooth(e)] };
    path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); $('#sketch').appendChild(path);
    const draw = () => { const tmp = document.createElementNS('http://www.w3.org/2000/svg', 'g'); tmp.innerHTML = strokeSVG(s); const np = tmp.firstChild; path.replaceWith(np); path = np; };
    mv = ev => {
      if (snapped) return;
      let list = ev.getCoalescedEvents ? ev.getCoalescedEvents() : []; if (!list.length) list = [ev]; for (const c of list) { const p = smooth(c), l = s.pts[s.pts.length - 1]; if (Math.hypot(p[0] - l[0], p[1] - l[1]) >= .8) s.pts.push(p); } draw();
      const raw = rawPt(ev); if (!lastRaw || Math.hypot(raw[0] - lastRaw[0], raw[1] - lastRaw[1]) > 4) { lastRaw = raw; armHold(); }
    };
    draw();
  }
  strokeCancel = () => { cancelled = true; if (path) path.remove(); finish(); ui.skUndo.pop(); if (changed) { pg().sketch = before; redrawSketch(); renderSkTools(); } };
  const finish = () => { clearTimeout(hold); clearTimeout(ringT); page.removeEventListener('pointermove', moveCheck); page.removeEventListener('pointermove', mv); page.removeEventListener('pointerup', up); page.removeEventListener('pointercancel', up); ui.drawing = false; strokeCancel = null; };
  const up = ev => {
    finish();
    if (cancelled) return;
    // Pencil double-tap: two quick, still taps close together swap the tool and the eraser, leaving no marks
    if (pen && still && Date.now() - t0 < 250) {
      const tp = lastTap; lastTap = null;
      if (tp && Date.now() - tp.t < 400 && Math.hypot(sx0 - tp.x, sy0 - tp.y) < 24) { pg().sketch = tp.before; ui.skUndo.length = tp.undoLen; ui.skRedo = []; redrawSketch(); setTool(ui.sk.tool === 'eraser' ? (ui.sk.prev || 'pencil') : 'eraser'); save(); return; }
      lastTap = { t: Date.now(), x: sx0, y: sy0, before, undoLen };
    } else lastTap = null;
    if (up0) { up0(); renderSkTools(); return; }
    if (s) {
      const raw = rawPt(ev), lp = s.pts[s.pts.length - 1];
      if (!snapped && s.pts.length > 1 && Math.hypot(raw[0] - lp[0], raw[1] - lp[1]) > .8) s.pts.push([raw[0], raw[1], lp[2], lp[3]]);
      s.pts = s.pts.map(p => p[3] > .005 ? [+p[0].toFixed(1), +p[1].toFixed(1), +(+p[2]).toFixed(2), +p[3].toFixed(2)] : [+p[0].toFixed(1), +p[1].toFixed(1), +(+p[2]).toFixed(2)]);
      pg().sketch.push(s); changed = true;
    }
    if (!changed) ui.skUndo.pop();
    renderSkTools(); save();
    if (s && s.shape === 'rect') showQS(s);
  };
  page.addEventListener('pointermove', mv); page.addEventListener('pointerup', up); page.addEventListener('pointercancel', up);
}
function renderSkTools() {
  const el = $('#sktools'); if (!el) return;
  const b = $('#skBtn'); if (b) b.setAttribute('aria-pressed', ui.sk.on);
  if (!ui.sk.on) { el.innerHTML = ''; return; }
  const t = ui.sk.tool, T = TOOLS[t], open = ui.sk.open || ui.sk.pinned;
  const dot = sz => Math.min(28, Math.max(3, t === 'eraser' ? sz / 2 : sz));
  el.innerHTML = `<div class="sktools ${open ? 'open' : ''}" role="toolbar" aria-label="Sketch tools"><div class="skrow">
  <button class="curtool" data-act="skexpand" aria-expanded="${open}" aria-label="${T.label}: ${open ? 'hide' : 'show'} tools" title="${T.label}">${ic(T.icon)}${open ? I.up : I.down}</button>
  <span class="sep"></span>${SK_COLOURS.map(([c, l]) => `<button data-act="skcolor" data-val="${c}" aria-pressed="${ui.sk.color === c}" aria-label="${l}"><span class="dot" style="background:${c}"></span></button>`).join('')}
  ${T.sizes ? `<span class="sep"></span>${T.sizes.map(sz => `<button data-act="skw" data-val="${sz}" aria-pressed="${ui.sk.size[t] === sz}" aria-label="Size ${sz}"><span class="wdot" style="width:${dot(sz)}px;height:${dot(sz)}px;${t === 'eraser' ? 'background:transparent;border:2px solid currentColor' : ''}"></span></button>`).join('')}` : `<span class="sep"></span><span class="lab">Tap inside a closed shape to fill it</span>`}
  ${T.smooth != null ? `<span class="sep"></span><label class="stab"><span class="lab">Stability</span><input type="range" min="0" max="90" step="5" data-skstab value="${stabOf(t)}" aria-label="${T.label} stability"><output>${stabOf(t)}</output></label>` : ''}
  <span class="sep"></span><button data-act="skundo" aria-label="Undo" ${ui.skUndo.length ? '' : 'disabled'}>${I.undo}</button><button data-act="skredo" aria-label="Redo" ${ui.skRedo.length ? '' : 'disabled'}>${I.redo}</button><button data-act="skclear" ${(pg().sketch || []).length ? '' : 'disabled'}>Clear</button>
  <button class="primary" data-act="sketch">Done</button></div>
  ${open ? `<div class="skrow skbrushes">${Object.entries(TOOLS).map(([k, x]) => `<button class="tool" data-act="sktool" data-val="${k}" aria-pressed="${t === k}">${ic(x.icon)}<span>${x.label}</span></button>`).join('')}<span class="spacer"></span><button class="icon" data-act="skpin" aria-pressed="${ui.sk.pinned}" aria-label="${ui.sk.pinned ? 'Unpin tools' : 'Keep tools open'}" title="${ui.sk.pinned ? 'Unpin tools' : 'Keep tools open'}">${I.pin}</button></div>` : ''}</div>`;
}
function setTool(t) { if (t !== 'eraser' && ui.sk.tool !== 'eraser') ui.sk.prev = t; else if (t === 'eraser' && ui.sk.tool !== 'eraser') ui.sk.prev = ui.sk.tool; ui.sk.tool = t; if (!ui.sk.pinned) ui.sk.open = false; renderSkTools(); updateHover(); }
/* ---------- tool ring: hold the Pencil tip still, or right-click, to open it around the pointer ---------- */
let ring = null;
const RING_R = 66;
function openRing(x, y, pointerId) {
  closeRing();
  const keys = Object.keys(TOOLS), cx = clamp(x, RING_R + 30, innerWidth - RING_R - 30), cy = clamp(y, RING_R + 30, innerHeight - RING_R - 30);
  const el = document.createElement('div'); el.className = 'skring'; el.style.left = cx + 'px'; el.style.top = cy + 'px';
  el.setAttribute('role', 'menu'); el.setAttribute('aria-label', 'Sketch tools');
  el.innerHTML = keys.map((k, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / keys.length; return `<button role="menuitem" data-act="ringtool" data-val="${k}" aria-label="${TOOLS[k].label}" aria-pressed="${ui.sk.tool === k}" style="left:${Math.cos(a) * RING_R}px;top:${Math.sin(a) * RING_R}px">${ic(TOOLS[k].icon)}</button>`; }).join('')
    + `<button class="hub" data-act="ringclose" aria-label="Close"><span class="dot" style="background:${ui.sk.color}"></span></button>`;
  document.body.appendChild(el);
  ring = { el, cx, cy, keys, pointerId, hot: null };
  if (pointerId != null) { document.addEventListener('pointermove', ringMove); document.addEventListener('pointerup', ringUp); document.addEventListener('pointercancel', ringUp); }
}
// While the Pencil that opened the ring is still down, sliding onto a tool highlights it and lifting picks it.
function ringHit(x, y) { const dx = x - ring.cx, dy = y - ring.cy; if (Math.hypot(dx, dy) < 32) return null; const n = ring.keys.length, i = Math.round(((Math.atan2(dy, dx) + Math.PI / 2) / (2 * Math.PI) * n + n) % n) % n; return ring.keys[i]; }
function ringMove(e) { if (!ring || e.pointerId !== ring.pointerId) return; ring.hot = ringHit(e.clientX, e.clientY); ring.el.querySelectorAll('[data-act=ringtool]').forEach(b => b.classList.toggle('hot', b.dataset.val === ring.hot)); }
function ringUp(e) {
  if (!ring || e.pointerId !== ring.pointerId) return;
  document.removeEventListener('pointermove', ringMove); document.removeEventListener('pointerup', ringUp); document.removeEventListener('pointercancel', ringUp);
  const hot = ringHit(e.clientX, e.clientY); ring.pointerId = null;
  if (hot) { closeRing(); setTool(hot); }
}
function closeRing() { if (!ring) return; document.removeEventListener('pointermove', ringMove); document.removeEventListener('pointerup', ringUp); document.removeEventListener('pointercancel', ringUp); ring.el.remove(); ring = null; }
/* ---------- hover circle: the tool's size and colour under a hovering Pencil ---------- */
let hoverT = null, lastHover = null;
const drawsPen = () => ui.mode === 'wf' && (ui.sk.on || cur()?.pencilDraws === true);
function hoverAt(e) {
  lastHover = e; const c = $('#hoverc'), page = e.target.closest && e.target.closest('#page');
  if (!c || !page || !drawsPen() || ring) { hideHover(); return; }
  const t = ui.sk.tool, T = TOOLS[t], w = ui.sk.size[t] || 0, d = t === 'fill' ? 18 : t === 'eraser' ? w + 8 : T.press ? w * (T.press[0] + T.press[1]) / 2 : w, px = Math.max(6, d * ui.scale);
  c.className = 'hoverc ' + t; c.style.width = c.style.height = px + 'px'; c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px';
  c.style.setProperty('--hc', ui.sk.color); c.hidden = false;
  clearTimeout(hoverT); hoverT = setTimeout(hideHover, 700);
}
function hideHover() { const c = $('#hoverc'); if (c) c.hidden = true; clearTimeout(hoverT); }
function updateHover() { const c = $('#hoverc'); if (c && !c.hidden && lastHover) hoverAt(lastHover); }

/* ---------- clicks ---------- */
function arm(btn, label, fn) { if (btn.dataset.armed) { fn(); return; } btn.dataset.armed = '1'; const old = btn.innerHTML; btn.textContent = label; setTimeout(() => { if (btn.isConnected) { delete btn.dataset.armed; btn.innerHTML = old; } }, 3000); }
function newWfDialog() {
  const dlg = $('#dlg');
  dlg.innerHTML = `<div class="dh"><h2 id="dlgTitle">New wireframe</h2><button class="icon" data-act="closedlg" aria-label="Close">${I.x}</button></div>
 <div class="db"><label class="field stack"><span>Name</span><input type="text" id="nwName" value="Untitled wireframe"></label>
 <h3 style="margin-top:16px">Client template</h3><div class="choices">${store.templates.map((t, i) => `<label class="choice"><input type="radio" name="nwt" value="${t.id}" ${i === 0 ? 'checked' : ''}><span><b>${esc(t.client)}</b><br><span class="meta">${t.visuals.length ? 'With page layout' : 'Styling only'}</span></span></label>`).join('')}
 <label class="choice"><input type="radio" name="nwt" value="" ${store.templates.length ? '' : 'checked'}><span><b>Blank</b><br><span class="meta">Power BI default styling</span></span></label></div>
 <h3 style="margin-top:16px">Data model</h3><label class="field stack"><span>Start the data model from</span><select id="nwModel"><option value="">Standard sample model (Sales, Product, Region…)</option>${store.wireframes.map(w => `<option value="${w.id}">Copy of ${esc(w.name)}</option>`).join('')}</select></label></div>
 <div class="df"><button data-act="closedlg">Cancel</button><button class="primary" data-act="createwf">Create wireframe</button></div>`;
  if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
}
const IMPORT_KINDS = { backup: ['Full backup', 'a full backup'], template: ['Client template', 'a client template'], wireframe: ['Wireframe', 'a wireframe'] };
let pendingBackup = null;
function showDlg(html) { const dlg = $('#dlg'); dlg.innerHTML = html; if (!dlg.open) { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); } }
const choice = (name, val, title, meta, on, extra = '') => `<label class="choice"><input type="radio" name="${name}" value="${val}" ${on ? 'checked' : ''}><span><b>${title}</b><br><span class="meta">${meta}</span>${extra}</span></label>`;
function exportDialog() {
  const pick = (id, list, label) => `<select id="${id}" aria-label="${label}" style="margin-top:6px;width:100%">${list.map(([v, n]) => `<option value="${v}">${esc(n)}</option>`).join('')}</select>`;
  showDlg(`<div class="dh"><h2 id="dlgTitle">Export</h2><button class="icon" data-act="closedlg" aria-label="Close">${I.x}</button></div>
 <div class="db"><p class="hint" style="margin:0 0 12px">What would you like to export?</p><div class="choices">
 ${choice('exk', 'backup', 'Full backup', 'Every wireframe and client template on this device', true)}
 ${store.templates.length ? choice('exk', 'template', 'Client template', 'One template, to share or use on another device', false, pick('exTpl', store.templates.map(t => [t.id, t.client || 'Untitled client']), 'Template to export')) : ''}
 ${store.wireframes.length ? choice('exk', 'wireframe', 'Wireframe', 'One wireframe with its pages, data model and client template', false, pick('exWf', store.wireframes.map(w => [w.id, w.name]), 'Wireframe to export')) : ''}</div></div>
 <div class="df"><button data-act="closedlg">Cancel</button><button class="primary" data-act="doexport">${I.download}Download</button></div>`);
}
function doExport() {
  const k = (document.querySelector('input[name=exk]:checked') || {}).value, fn = n => (n || '').replace(/[^\w -]/g, '').trim() || 'Untitled', json = 'application/json';
  if (k === 'template') { const t = store.templates.find(x => x.id === $('#exTpl').value); download(`DataSketch template - ${fn(t.client)}.json`, JSON.stringify({ datasketch: 'template', version: 1, template: t }), json); }
  else if (k === 'wireframe') { const w = store.wireframes.find(x => x.id === $('#exWf').value); download(`DataSketch wireframe - ${fn(w.name)}.json`, JSON.stringify({ datasketch: 'wireframe', version: 1, wireframe: w, template: tplOf(w) || null }), json); }
  else download(`DataSketch backup ${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(store), json);
  closeDlg();
}
function importDialog(kind = 'backup', note = '') {
  showDlg(`<div class="dh"><h2 id="dlgTitle">Import</h2><button class="icon" data-act="closedlg" aria-label="Close">${I.x}</button></div>
 <div class="db"><p class="hint" style="margin:0 0 12px">What are you importing?</p><div class="choices">
 ${choice('imk', 'backup', 'Full backup', 'Replaces every wireframe and template on this device', kind === 'backup')}
 ${choice('imk', 'template', 'Client template', 'Adds a template exported from DataSketch', kind === 'template')}
 ${choice('imk', 'wireframe', 'Wireframe', 'Adds a wireframe, and its client template if this device doesn’t have it', kind === 'wireframe')}</div>
 ${note ? `<p class="dmsg" role="alert">${esc(note)}</p>` : ''}</div>
 <div class="df"><button data-act="closedlg">Cancel</button><label class="filebtn primary">${I.upload}Choose file<input type="file" accept="application/json,.json" data-import></label></div>`);
}
const fileKind = d => !d || typeof d !== 'object' ? null : d.datasketch === 'template' && d.template ? 'template' : d.datasketch === 'wireframe' && d.wireframe ? 'wireframe' : Array.isArray(d.templates) && Array.isArray(d.wireframes) ? 'backup' : null;
function importFile(want, data) {
  const k = fileKind(data);
  if (!k) return importDialog(want, 'That file isn’t a DataSketch export. Choose a .json file exported from DataSketch.');
  if (k !== want) return importDialog(want, `That file is ${IMPORT_KINDS[k][1]}, not ${IMPORT_KINDS[want][1]}. Choose “${IMPORT_KINDS[k][0]}” to import it.`);
  if (k === 'backup') {
    pendingBackup = data;
    return showDlg(`<div class="dh"><h2 id="dlgTitle">Replace everything?</h2><button class="icon" data-act="closedlg" aria-label="Close">${I.x}</button></div>
 <div class="db"><p style="margin:0">This backup has ${data.wireframes.length} wireframe${data.wireframes.length === 1 ? '' : 's'} and ${data.templates.length} client template${data.templates.length === 1 ? '' : 's'}.</p><p class="hint">Importing it replaces the ${store.wireframes.length} wireframe${store.wireframes.length === 1 ? '' : 's'} and ${store.templates.length} template${store.templates.length === 1 ? '' : 's'} on this device. Export a full backup first if you might need them.</p></div>
 <div class="df"><button data-act="closedlg">Cancel</button><button class="danger" data-act="dobackup">Replace everything</button></div>`);
  }
  if (k === 'template') { const t = { ...clone(data.template), id: uid() }; store.templates.push(t); normalize(); save(); closeDlg(); renderHome(); toast(`Imported ${t.client || 'template'}`); return; }
  const w = { ...clone(data.wireframe), id: uid(), updated: Date.now() }, t = data.template;
  if (t && t.id && !store.templates.some(x => x.id === t.id)) store.templates.push(clone(t));
  if (w.templateId && !store.templates.some(x => x.id === w.templateId)) w.templateId = null;
  store.wireframes.push(w); normalize(); save(); closeDlg(); renderHome(); toast(`Imported ${w.name || 'wireframe'}`);
}
function closeDlg() { const dlg = $('#dlg'); if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); }
function themeJSON() {
  const o = cur(), s = o.settings, client = ui.mode === 'tpl' ? o.client : (tplOf(o)?.client || o.name);
  return JSON.stringify({ name: client + ' theme', dataColors: s.palette, background: s.visualBg, foreground: '#252423', tableAccent: s.palette[0],
    visualStyles: { '*': { '*': { background: [{ show: true, color: { solid: { color: s.visualBg } } }], border: [{ show: s.border, color: { solid: { color: s.borderColor } }, radius: s.radius }], dropShadow: [{ show: s.shadow }], labels: [{ show: s.dataLabels }], categoryAxis: [{ show: s.axisLabels }], valueAxis: [{ show: s.axisLabels, gridlineShow: s.gridlines }], legend: [{ show: s.legend }], visualTooltip: [{ show: s.tooltips }], title: [{ fontSize: s.titleSize }] } },
      page: { '*': { background: [{ color: { solid: { color: s.pageBg } }, transparency: 0 }] } } } }, null, 2);
}
function themeDialog() {
  const dlg = $('#dlg');
  dlg.innerHTML = `<div class="dh"><h2 id="dlgTitle">Power BI theme JSON</h2><button class="icon" data-act="closedlg" aria-label="Close">${I.x}</button></div>
 <div class="db"><p class="hint" style="margin:0 0 10px">Built from these settings. Import it in Power BI Desktop under View › Themes › Browse for themes. Property names can vary between Power BI versions, so check it against yours.</p><textarea id="themeTxt" readonly aria-label="Theme JSON">${esc(themeJSON())}</textarea></div>
 <div class="df"><button data-act="closedlg">Close</button><button data-act="dljson">${I.download}Download</button><button class="primary" data-act="copyjson">Copy</button></div>`;
  if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
}
function cleanupRefs() {
  const md = model(), o = cur(), dimIds = md.dims.map(d => d.id), mIds = md.measures.map(m => m.id);
  for (const v of o.pages.flatMap(p => p.visuals)) {
    if (v.dim && !D.isTime(v.dim) && !dimIds.includes(v.dim)) v.dim = DATA_TYPES.includes(v.type) || v.type === 'slicer' ? (dimIds[0] || 'T:Month') : '';
    if (v.type === 'slicer' && D.isTime(v.dim)) v.dim = dimIds[0] || '';
    if (v.legend && !dimIds.includes(v.legend)) v.legend = '';
    if (v.mid && !mIds.includes(v.mid)) v.mid = mIds[0];
    if (v.m2 && !['ly', 'bud'].includes(v.m2) && !mIds.includes(v.m2)) v.m2 = '';
    v.params = (v.params || []).filter(id => mIds.includes(id));
    if (v.sub?.length) v.sub = v.sub.filter(k => D.isTime(k) || dimIds.includes(k));
    if (v.cols && !D.isTime(v.cols) && !dimIds.includes(v.cols)) v.cols = '';
  }
  md.measures.forEach(m => m.stories = (m.stories || []).filter(s => dimIds.includes(s.dim)));
  ui.slicerSel = {}; ui.hl = null;
}
document.addEventListener('click', e => {
  const sum = e.target.closest('details[data-bmd] > summary'); if (sum) { const d = sum.parentElement; ui.bmOpen = d.open ? null : d.dataset.bmd; }
  const msum = e.target.closest('details[data-mopen] > summary'); if (msum) { const d = msum.parentElement; ui.mOpen = d.open ? null : d.dataset.mopen; }
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act, id = b.dataset.id, v = ui.sel ? findV(ui.sel) : null, o = cur();
  switch (act) {
    case 'home': renderHome(); break;
    case 'open': openWf(id); break;
    case 'newwf': newWfDialog(); break;
    case 'createwf': {
      const name = $('#nwName').value.trim() || 'Untitled wireframe', tid = (document.querySelector('input[name=nwt]:checked') || {}).value || '', t = store.templates.find(x => x.id === tid), src = store.wireframes.find(w => w.id === $('#nwModel').value);
      const md = src ? clone(src.model) : D.defaultModel();
      const nw = { id: uid(), name, templateId: tid || null, updated: Date.now(), settings: clone(t ? t.settings : BASE), grid: { size: 15, snap: true, show: true }, notesMode: 'hidden', pages: [mkPage('Page 1')], model: md };
      store.wireframes.push(nw); closeDlg(); openWf(nw.id); save(); break;
    }
    case 'dupwf': { const w = store.wireframes.find(x => x.id === id); const c = clone(w); c.id = uid(); c.name = w.name + ' (copy)'; c.updated = Date.now(); store.wireframes.push(c); save(); renderHome(); break; }
    case 'delwf': arm(b, 'Confirm delete', () => { store.wireframes = store.wireframes.filter(w => w.id !== id); save(); renderHome(); }); break;
    case 'newtpl': { const nt = { id: uid(), client: 'New client', settings: clone(BASE), visuals: [], grid: { size: 15, snap: true, show: true }, notesMode: 'hidden', bookmarks: [] }; store.templates.push(nt); openWf(nt.id, 'tpl'); save(); setTimeout(() => $('.wfname')?.select(), 50); break; }
    case 'edittpl': openWf(id, 'tpl'); break;
    case 'deltpl': arm(b, 'Confirm delete', () => { store.templates = store.templates.filter(t => t.id !== id); save(); renderHome(); }); break;
    case 'export': exportDialog(); break;
    case 'doexport': doExport(); break;
    case 'import': importDialog(); break;
    case 'dobackup': if (pendingBackup) { store = pendingBackup; pendingBackup = null; normalize(); save(); closeDlg(); renderHome(); toast('Backup imported'); } break;
    case 'closedlg': closeDlg(); break;
    case 'add': if (e.detail === 0) libClick(b.dataset.type); break;
    case 'multimode': ui.multiMode = !ui.multiMode; renderArrange(); break;
    case 'arrange': arrange(b.dataset.val); break;
    // A menu opened by a second touch can appear under the finger: only a press that began after it opened counts.
    case 'vm': if (vmenu && ui.downT > vmenu.t) vmAct(b.dataset.val); break;
    case 'vmtype': { if (!vmenu || ui.downT < vmenu.t) break; const mv = vmenu && findV(vmenu.ctx.id); closeMenu(); if (mv && mv.type !== b.dataset.type) changeTypeUndo(mv, b.dataset.type); break; }
    case 'libmin': ui.libMin = !ui.libMin; try { localStorage.setItem('datasketch-libmin', ui.libMin ? '1' : '0'); } catch (e) {} $('.lib').outerHTML = libHTML(); fit(); break;
    case 'gopage': if (id !== pg().id) goPage(id); break;
    case 'addpage': addPage(); break;
    case 'pagemenu': pageDialog(); break;
    case 'pagemove': { const ps = o.pages, i = ps.indexOf(pg()), j = i + +b.dataset.val; if (j < 0 || j >= ps.length) break; ps.splice(j, 0, ps.splice(i, 1)[0]); renderPages(); if (hasBound(tplOf(o)?.visuals) || hasBound(pg().visuals)) renderPage(); pageDialog(); save(); break; }
    case 'pagedup': closeDlg(); dupPage(); toast('Page duplicated'); break;
    case 'pagedel': arm(b, 'Confirm delete', () => { const ps = o.pages, i = ps.indexOf(pg()); ps.splice(i, 1); closeDlg(); goPage(ps[Math.max(0, i - 1)].id); }); break;
    case 'flipback': flipOne(b.closest('.vis').dataset.id, false); break;
    case 'closesheet': ui.panel = 'tab'; renderPanel(); break;
    case 'tab': ui.tab = b.dataset.val; ui.panel = 'tab'; renderPanel(`[data-act=tab][data-val=${ui.tab}]`); break;
    case 'panelmin': setPanelMin(!ui.panelMin); break;
    case 'togglepanel': ui.panelOpen = !ui.panelOpen; $('#panel').classList.toggle('open', ui.panelOpen); break;
    case 'notesmode': setNotesMode(b.dataset.val); break;
    case 'applytpl': { const t = store.templates.find(x => x.id === $('#tplSel').value); if (!t) break; arm(b, 'Confirm', () => { o.templateId = t.id; o.settings = clone(t.settings); setSize(o.settings.pageW, o.settings.pageH); }); break; }
    case 'clearlogo': o.settings.logo = null; renderPage(); renderPanel(); save(); break;
    case 'layouteye': o.hideLayout = !o.hideLayout; renderPage(); renderPanel('[data-act=layouteye]'); save(); break;
    case 'imgclear': v.src = null; renderPage(); renderPanel(); save(); break;
    case 'mode': v.mode = b.dataset.val; renderPage(); renderPanel(`[data-act=mode][data-val=${v.mode}]`); save(); break;
    case 'gomeasure': ui.mOpen = mOf(v); showTab('data'); setTimeout(() => $(`details[data-mopen="${ui.mOpen}"]`)?.scrollIntoView({ block: 'start' }), 30); break;
    case 'flipnote': ui.panelOpen = false; $('#panel').classList.remove('open'); if (v.hidden) { v.hidden = false; renderPage(); } flipOne(v.id, true); break;
    case 'dup': { const g = o.grid.size, c = { ...clone(v), id: uid(), x: clamp(v.x + g * 2, 0, pw() - v.w), y: clamp(v.y + g * 2, 0, ph() - v.h) }; pg().visuals.push(c); renderPage(); openSheet(c.id); save(); break; }
    case 'del': arm(b, 'Confirm delete', () => removeVisuals([v.id])); break;
    case 'mxtog': { const x = findV(id); if (!x) break; const s = new Set(x.open), pth = b.dataset.path; if (s.has(pth)) s.delete(pth); else s.add(pth); x.open = [...s]; renderPage(); save(); break; }
    case 'mxadd': { const used = mxLevels(v), k = [...HIER, ...model().dims.map(d => d.id)].find(a => !used.includes(a) && a !== v.cols); if (!k) break; v.sub = [...used.slice(1), k]; renderPage(); renderPanel(`[data-mxsub="${v.sub.length - 1}"]`); save(); break; }
    case 'mxexp': v.open = mxAllPaths(v); renderPage(); save(); break;
    case 'mxcol': v.open = []; renderPage(); save(); break;
    case 'reset': v.ov = {}; v.titleAuto = true; v.title = ''; renderPage(); renderPanel(); save(); break;
    case 'zfront': case 'zfwd': case 'zbwd': case 'zback': moveZ(v.id, { zfront: 'front', zfwd: 'fwd', zbwd: 'bwd', zback: 'back' }[act]); break;
    case 'drillup': case 'drilldown': { const dv = findV(b.closest('.vis').dataset.id), hi = HIER.indexOf(dv.dim), ni = clamp(hi + (act === 'drillup' ? -1 : 1), 0, HIER.length - 1); dv.dim = HIER[ni]; dv.periods = D.TIME_PERIODS[dv.dim]; renderPage(); if (ui.panel === 'visual' && ui.sel === dv.id) renderPanel(); save(); break; }
    case 'lyeye': { const lv = findV(id); lv.hidden = !lv.hidden; renderPage(); renderPanel(`[data-act=lyeye][data-id="${id}"]`); save(); break; }
    case 'lysel': openSheet(id, true); break;
    case 'lyup': case 'lydown': moveZ(id, act === 'lyup' ? 'fwd' : 'bwd'); renderPanel(`[data-act=${act}][data-id="${id}"]`); break;
    case 'bmadd': { const bm = { id: uid(), name: `Bookmark ${pg().bookmarks.length + 1}`, affects: pg().visuals.map(x => x.id), hidden: pg().visuals.filter(x => x.hidden).map(x => x.id) }; pg().bookmarks.push(bm); pg().activeBm = bm.id; ui.bmOpen = bm.id; renderPanel(); save(); break; }
    case 'bmapply': applyBm(id); break;
    case 'bmupdate': { const bm = pg().bookmarks.find(x => x.id === id); bm.hidden = pg().visuals.filter(x => x.hidden && bm.affects.includes(x.id)).map(x => x.id); pg().activeBm = id; renderPanel(); save(); toast('Bookmark updated'); break; }
    case 'bmdel': arm(b, 'Confirm delete', () => { pg().bookmarks = pg().bookmarks.filter(x => x.id !== id); pg().visuals.forEach(x => { if (x.bmId === id) { x.bmId = ''; x.action = 'none'; } }); renderPanel(); save(); }); break;
    case 'mtrend': case 'mstrength': { const m = measOf(id); m[act === 'mtrend' ? 'trend' : 'strength'] = b.dataset.val; ui.mOpen = id; renderPage(); renderPanel(`[data-act=${act}][data-id="${id}"][data-val=${b.dataset.val}]`); save(); break; }
    case 'stadd': { const m = measOf(id); m.stories = m.stories || []; m.stories.push({ dim: model().dims[0].id, member: 0, effect: 'growing' }); ui.mOpen = id; renderPage(); renderPanel(); save(); break; }
    case 'stdel': { const m = measOf(id); m.stories.splice(+b.dataset.i, 1); ui.mOpen = id; renderPage(); renderPanel(); save(); break; }
    case 'madd': { const m = addMeasure(); ui.mOpen = m.id; renderPanel(); save(); setTimeout(() => $(`[data-mf=name][data-id="${m.id}"]`)?.select(), 30); break; }
    case 'mdel': arm(b, 'Confirm delete', () => { const md = model(); md.measures = md.measures.filter(m => m.id !== id); cleanupRefs(); renderPage(); renderPanel(); save(); }); break;
    case 'dimadd': { const d = addDim(); renderPanel(); save(); setTimeout(() => $(`[data-dname="${d.id}"]`)?.select(), 30); break; }
    case 'dimdel': arm(b, 'Delete?', () => { const md = model(); md.dims = md.dims.filter(d => d.id !== id); cleanupRefs(); renderPage(); renderPanel(); save(); }); break;
    case 'regen': model().seed = Math.floor(Math.random() * 1e9); renderPage(); save(); toast('New values generated'); break;
    case 'exp': {
      const key = JSON.stringify(model());
      if (!ui.exportCache || ui.exportCache.key !== key) ui.exportCache = { key, res: D.exportTables(model()) };
      const res = ui.exportCache.res, f = b.dataset.file;
      if (f === 'Fact.csv' && res.factSkipped) { toast(`The fact table would have ${res.rows.toLocaleString('en-GB')} rows. Reduce members or dimensions to export it.`); break; }
      if (res.files[f]) download(f, res.files[f]);
      break;
    }
    case 'theme': themeDialog(); break;
    case 'dljson': download(`${(ui.mode === 'tpl' ? o.client : (tplOf(o)?.client || o.name)).replace(/[^\w -]/g, '')} theme.json`, themeJSON(), 'application/json'); break;
    case 'copyjson': { const t = $('#themeTxt'); const done = () => { b.textContent = 'Copied'; setTimeout(() => b.textContent = 'Copy', 1600); }; (navigator.clipboard ? navigator.clipboard.writeText(t.value) : Promise.reject()).then(done).catch(() => { t.select(); try { document.execCommand('copy'); done(); } catch (_) { b.textContent = 'Select and copy'; } }); break; }
    case 'qsmake': qsMenu(); break;
    case 'qstype': qsMake(b.dataset.type); break;
    case 'qsclose': clearQS(); break;
    case 'sketch': clearQS(); closeRing(); hideHover(); ui.sk.on = !ui.sk.on; ui.sk.open = false; ui.multi.clear(); setSel(null); if (ui.panel === 'visual') { ui.panel = 'tab'; renderPanel(); } renderSkTools(); renderPage(); break;
    case 'sktool': setTool(b.dataset.val); break;
    case 'skexpand': ui.sk.open = !(ui.sk.open || ui.sk.pinned); if (!ui.sk.open && ui.sk.pinned) { ui.sk.pinned = false; try { localStorage.setItem('datasketch-skpin', '0'); } catch (e) {} } renderSkTools(); break;
    case 'skpin': ui.sk.pinned = !ui.sk.pinned; ui.sk.open = true; try { localStorage.setItem('datasketch-skpin', ui.sk.pinned ? '1' : '0'); } catch (e) {} renderSkTools(); break;
    case 'ringtool': closeRing(); setTool(b.dataset.val); break;
    case 'ringclose': closeRing(); break;
    case 'skcolor': ui.sk.color = b.dataset.val; if (ui.sk.tool === 'eraser') ui.sk.tool = ui.sk.prev || 'pencil'; renderSkTools(); break;
    case 'skw': ui.sk.size[ui.sk.tool] = +b.dataset.val; renderSkTools(); updateHover(); break;
    case 'skundo': skUndo(); break;
    case 'skredo': skRedo(); break;
    case 'skclear': arm(b, 'Clear all?', () => { pushUndo(); pg().sketch = []; redrawSketch(); renderSkTools(); save(); }); break;
  }
});

/* ---------- inputs ---------- */
document.addEventListener('input', e => {
  const t = e.target, ds = t.dataset;
  if (!ui.view || ui.view !== 'editor') return;
  const o = cur();
  if ('skstab' in ds) { ui.sk.stab[ui.sk.tool] = +t.value; const out = t.parentElement.querySelector('output'); if (out) out.textContent = t.value; try { localStorage.setItem('datasketch-stability', JSON.stringify(ui.sk.stab)); } catch (e) {} return; }
  if ('notes' in ds) {
    const v = findV(ds.notes); v.notes = t.value;
    const front = t.closest('.vis')?.querySelector('.front');
    if (front && o.notesMode !== 'side') { const dot = front.querySelector('.hasnote'); if (v.notes.trim() && !dot) front.insertAdjacentHTML('beforeend', '<span class="hasnote" aria-hidden="true"></span>'); if (!v.notes.trim() && dot) dot.remove(); }
    if (o.notesMode === 'side') renderRail(); save(); return;
  }
  if ('wfname' in ds) { if (ui.mode === 'tpl') o.client = t.value; else { o.name = t.value; if (hasBound(tplOf(o)?.visuals) || hasBound(pg().visuals)) renderPage(); } save(); return; }
  if ('pgname' in ds) { pg().name = t.value; renderPages(); if (hasBound(tplOf(o)?.visuals) || hasBound(pg().visuals)) renderPage(); save(); return; }
  if ('bmname' in ds) { pg().bookmarks.find(b => b.id === ds.bmname).name = t.value; save(); return; }
  if ('bmv' in ds) {
    const bm = pg().bookmarks.find(b => b.id === ds.bmv); bm.hidden = bm.hidden.filter(x => x !== ds.vid); bm.affects = bm.affects.filter(x => x !== ds.vid);
    if (t.value !== 'skip') { bm.affects.push(ds.vid); if (t.value === 'hide') bm.hidden.push(ds.vid); }
    if (pg().activeBm === bm.id) applyBm(bm.id, true);
    const sm = t.closest('details')?.querySelector('summary'); if (sm) sm.textContent = bmSummary(bm); save(); return;
  }
  if ('k' in ds) { o[ds.k] = t.checked; if (ds.k === 'showSketch') { const sv = $('#sketch'); if (sv) sv.style.display = t.checked ? '' : 'none'; } save(); return; }
  if ('l' in ds) { ui.ghost = t.checked; renderPage(); return; }
  if ('s' in ds) {
    const k = ds.s; if (t.type === 'number' && t.value === '') return;
    o.settings[k] = t.type === 'checkbox' ? t.checked : (t.type === 'number' || t.type === 'range') ? +t.value : t.value;
    if (t.type === 'range') { const out = t.closest('.field')?.querySelector('output'); if (out) out.textContent = t.value; }
    renderPage(); save(); return;
  }
  if ('pal' in ds) { o.settings.palette[+ds.pal] = t.value; renderPage(); save(); return; }
  if ('g' in ds) { const g = o.grid; if (ds.g === 'size') { if (t.value === '' || +t.value < 5) return; g.size = clamp(Math.round(+t.value), 5, 60); } else g[ds.g] = t.checked; renderPage(); save(); return; }
  // data model
  if ('mf' in ds) {
    const m = measOf(ds.id), k = ds.mf;
    if (k === 'mag') { if (t.value === '') return; m.mag = +t.value; }
    else if (k === 'type') { m.type = t.value; m.fmt = t.value === 'ratio' ? 'percent' : 'number'; m.mag = t.value === 'ratio' ? 50 : 100000; }
    else m[k] = t.value;
    ui.mOpen = m.id; renderPage();
    if (t.tagName === 'SELECT') renderPanel(`[data-mf=${k}][data-id="${m.id}"]`);
    else if (k === 'name') { const sm = t.closest('details')?.querySelector('summary span'); if (sm) sm.textContent = t.value; }
    save(); return;
  }
  if ('st' in ds) {
    const m = measOf(ds.id), st = m.stories[+ds.i];
    st[ds.st] = ds.st === 'member' ? +t.value : t.value; if (ds.st === 'dim') st.member = 0;
    ui.mOpen = m.id; renderPage(); renderPanel(`[data-st=${ds.st}][data-id="${m.id}"][data-i="${ds.i}"]`); save(); return;
  }
  if ('dname' in ds) { model().dims.find(d => d.id === ds.dname).name = t.value; renderPage(); save(); return; }
  if ('dcount' in ds) { if (t.value === '') return; model().dims.find(d => d.id === ds.dcount).count = clamp(parseInt(t.value) || 1, 1, 30); ui.slicerSel = {}; ui.hl = null; renderPage(); save(); return; }
  if ('dmem' in ds) { model().dims.find(d => d.id === ds.dmem).members = t.value; renderPage(); save(); return; }
  if ('cur' in ds) { model().currency = t.value; renderPage(); save(); return; }
  const v = ui.sel ? findV(ui.sel) : null; if (!v) return;
  if ('mxsub' in ds) { const i = +ds.mxsub; if (t.value) v.sub[i] = t.value; else v.sub.splice(i, 1); if (v.cols === t.value) v.cols = ''; v.open = []; renderPage(); renderPanel(t.value ? `[data-mxsub="${i}"]` : '[data-v=dim]'); save(); return; }
  if ('pm' in ds) { v.params = v.params.filter(x => x !== ds.pm); if (t.checked) { const order = model().measures.map(m => m.id); v.params.push(ds.pm); v.params.sort((a, b) => order.indexOf(a) - order.indexOf(b)); } ui.paramSel[v.id] = 0; renderPage(); save(); return; }
  if ('v' in ds) {
    const k = ds.v;
    if (k === 'mid' && t.value === '__newm') { const m = addMeasure(); v.mid = m.id; renderPage(); ui.mOpen = m.id; showTab('data'); save(); setTimeout(() => $(`[data-mf=name][data-id="${m.id}"]`)?.select(), 30); return; }
    if (k === 'dim' && t.value === '__newdim') { const d = addDim(); v.dim = d.id; renderPage(); showTab('data'); save(); setTimeout(() => $(`[data-dname="${d.id}"]`)?.select(), 30); return; }
    if (k === 'periods') { if (t.value === '') return; v.periods = clamp(parseInt(t.value) || 1, 1, D.TIME_MAX[periodKey(v)] || 24); }
    else if (k === 'cols') { v.cols = t.value; if (D.isTime(t.value)) v.periods = D.TIME_PERIODS[t.value]; }
    else if (k === 'bind') {
      v.bind = t.value;
      // A report-name box keeps a trailing separator from its text ("Sales |") as its separator.
      const m = v.bind === 'report' && !v.sep && (v.text || '').match(/\s*([|•·–—\/-])\s*$/); if (m && m.index) { v.sep = m[1]; v.text = v.text.slice(0, m.index); }
      // A page-name box on the report name's row starts after it; one elsewhere keeps its place.
      if (v.bind === 'page' && pg().visuals.some(x => x.type === 'text' && x.bind === 'report' && x.y < v.y + v.h && v.y < x.y + x.h)) v.follow = true;
    }
    else if (k === 'title') { v.title = t.value; v.titleAuto = t.value.trim() === ''; }
    else if (k === 'target') { v.action = t.value ? 'bookmark' : 'none'; v.bmId = t.value; }
    else if (k === 'sStyle') { v.sStyle = t.value; const sz = SLICER_SIZES[t.value]; v.w = sz[0]; v.h = sz[1]; v.x = clamp(v.x, 0, pw() - v.w); v.y = clamp(v.y, 0, ph() - v.h); if (D.isTime(v.dim) || !v.dim) v.dim = model().dims[0]?.id || ''; delete ui.slicerSel[v.id]; }
    else if (k === 'from' || k === 'to') v[k] = +t.value;
    else if (k === 'dim') { v.dim = t.value; if (v.type === 'matrix') v.open = []; if (D.isTime(v.dim)) v.periods = D.TIME_PERIODS[v.dim]; if (v.legend === v.dim) v.legend = ''; delete ui.slicerSel[v.id]; if (ui.hl && ui.hl.src === v.id) ui.hl = null; }
    else v[k] = t.type === 'checkbox' ? t.checked : t.type === 'number' ? (t.value === '' ? v[k] : +t.value) : t.value;
    if (k === 'paramId' && t.value) ui.paramSel[t.value] = ui.paramSel[t.value] || 0;
    renderPage();
    if (t.tagName === 'SELECT' || t.type === 'checkbox') renderPanel(`[data-v=${k}]`);
    else { const ti = $('[data-v=title]'); if (ti && v.titleAuto) ti.placeholder = autoTitle(v); }
    if (k === 'hidden' || k === 'label' || k === 'text') refreshSide();
    save(); return;
  }
  if ('ov' in ds) { const k = ds.ov; if (t.value === '') delete v.ov[k]; else v.ov[k] = t.value === 'on'; renderPage(); renderPanel(`[data-ov=${k}]`); save(); return; }
  if ('ovr' in ds) { if (t.value === '') delete v.ov.radius; else v.ov.radius = clamp(+t.value, 0, 40); renderPage(); save(); return; }
  if ('ovc' in ds) { v.ov.color = t.value; renderPage(); save(); return; }
  if ('ovcon' in ds) { const c = $('[data-ovc]'); if (t.checked) { v.ov.color = c.value; c.disabled = false; } else { delete v.ov.color; c.disabled = true; } renderPage(); save(); return; }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'zoom') { ui.zoom = t.value; fit(); syncZoom(); return; }
  if (t.dataset.pos) {
    const v = ui.sel ? findV(ui.sel) : null, k = t.dataset.pos, n = Math.round(+t.value); if (!v || t.value === '' || !isFinite(n)) return;
    if (k === 'w') v.w = clamp(n, 15, pw() - v.x); else if (k === 'h') v.h = clamp(n, 15, ph() - v.y); else if (k === 'x') v.x = clamp(n, 0, pw() - v.w); else v.y = clamp(n, 0, ph() - v.h);
    t.value = v[k]; renderPage(); save(); return;
  }
  if (t.dataset.cs) { const s = cur().settings, k = t.dataset.cs; if (k === 'preset') { if (t.value !== 'custom') setSize(...t.value.split('x').map(Number)); return; } if (t.value === '') return; setSize(k === 'w' ? +t.value : s.pageW, k === 'h' ? +t.value : s.pageH); return; }
  const f = t.files && t.files[0]; if (!f) return;
  const r = new FileReader();
  if (t.matches('[data-import]')) {
    const want = (document.querySelector('input[name=imk]:checked') || {}).value || 'backup';
    r.onload = () => { let data = null; try { data = JSON.parse(r.result); } catch (err) {} t.value = ''; importFile(want, data); };
    r.readAsText(f); return;
  }
  if (t.matches('[data-vimg]')) { const v = ui.sel ? findV(ui.sel) : null; if (!v) return; r.onload = () => { v.src = r.result; renderPage(); renderPanel(); save(); }; r.readAsDataURL(f); return; }
  if (t.matches('[data-logo]')) { r.onload = () => { cur().settings.logo = r.result; renderPage(); renderPanel(); save(); }; r.readAsDataURL(f); }
});
document.addEventListener('keydown', e => {
  const el = e.target;
  if (e.key === 'Escape' && ring) { closeRing(); return; }
  if (e.key === 'Escape' && vmenu) { closeMenu(); return; }
  const free = ui.view === 'editor' && !$('#dlg').open && !el.closest?.('input,textarea,select'), onCanvas = free && (ui.sel || ui.multi.size);
  if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && free) {
    const k = e.key.toLowerCase();
    if (k === 'c' && onCanvas) { e.preventDefault(); closeMenu(); copyKey(); return; }
    if (k === 'x' && onCanvas) { e.preventDefault(); closeMenu(); cutKey(); return; }
    if (k === 'v' && ui.clip) { e.preventDefault(); closeMenu(); pasteClip(); return; }
  }
  if (e.key === 'Escape' && onCanvas) { clearSel(); return; }
  if ((e.key === 'Delete' || e.key === 'Backspace') && onCanvas && !e.metaKey && !e.ctrlKey) { e.preventDefault(); deleteKey(); return; }
  if (e.key.startsWith('Arrow') && onCanvas && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); nudge(e.key); return; }
  if (!el.classList || !el.classList.contains('vis') || el.classList.contains('locked')) return;
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSheet(el.dataset.id, true); }
});
window.addEventListener('resize', () => { closeMenu(); if (ui.view === 'editor') fit(); });

/* ---------- service worker ---------- */
function showUpdate(reg) {
  if ($('.update')) return;
  const el = document.createElement('div'); el.className = 'update';
  el.innerHTML = '<span>A new version of DataSketch is ready.</span><button>Update</button>';
  el.querySelector('button').onclick = () => { if (reg.waiting) reg.waiting.postMessage('skipWaiting'); else location.reload(); };
  document.body.appendChild(el);
}
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').then(reg => {
    if (reg.waiting && navigator.serviceWorker.controller) showUpdate(reg);
    reg.addEventListener('updatefound', () => { const nw = reg.installing; nw && nw.addEventListener('statechange', () => { if (nw.state === 'installed' && navigator.serviceWorker.controller) showUpdate(reg); }); });
    setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
  }).catch(() => {});
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (refreshing) return; refreshing = true; location.reload(); });
}

/* ---------- start ---------- */
grainDefs();
load().then(renderHome).catch(err => { console.error(err); $('#app').innerHTML = `<div class="loading">DataSketch couldn’t start: ${esc(err.message)}</div>`; });
