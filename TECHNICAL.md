# DataSketch — technical reference

How DataSketch is built. The rules that must not be quietly undone are in `README.md`.

## Table of contents

1. [Stack and shape](#1-stack-and-shape)
2. [Storage and boot](#2-storage-and-boot)
3. [State](#3-state)
4. [Data shapes](#4-data-shapes)
5. [The data engine (`js/data.js`)](#5-the-data-engine-jsdatajs)
6. [Rendering](#6-rendering)
7. [Events and conventions](#7-events-and-conventions)
8. [The editor](#8-the-editor)
9. [Sketch and Apple Pencil](#9-sketch-and-apple-pencil)
10. [Export and import](#10-export-and-import)
11. [Branding and themes](#11-branding-and-themes)
12. [Service worker and deploy](#12-service-worker-and-deploy)
13. [Checks](#13-checks)
14. [Traps](#14-traps)
15. [Limits](#15-limits)

---

## 1. Stack and shape

Static, build-free PWA: plain HTML, CSS and native ES modules, no framework, bundler, npm or CDN scripts.
System fonts only, so it works offline; report visuals default to Segoe UI with fallbacks. Targets current
Safari on iPadOS, Chrome and Edge, and uses Pointer Events (pen, touch, mouse), `getCoalescedEvents`,
`<dialog>` and `:has()`.

```
index.html              App shell, iOS/PWA meta tags, icon links, loads js/app.js as a module
manifest.webmanifest    Install metadata (standalone, start_url and scope "./")
sw.js                   Service worker: VERSION, ASSETS precache list, cache-first fetch
css/app.css             All styles; app chrome uses CSS variables with light and dark themes
js/data.js              Fake data engine: model defaults, generation, query(), formatting, CSV and DAX export
js/app.js               Everything else: state, storage, rendering, panels, events, sketching, SW registration
icons/                  favicons, apple-touch-icon, PWA icons, mark.svg (vector source), mark-white.svg,
                        mark-96.png, wordmark.png, wordmark-dark.png
.nojekyll               GitHub Pages serves the files as they are
```

## 2. Storage and boot

- `IDB` wraps IndexedDB: database `datasketch`, object store `kv`, key `store`. If IndexedDB throws,
  `load()` reads and `save()` writes `localStorage` key `datasketch-store`.
- `load()` reads the store, calls `seed()` when there is none, runs `normalize()`, and asks for
  `navigator.storage.persist()`.
- `seed()` creates the Northwind Logistics template (`navTpl()`) and the Operations wireframe
  (`navDemo()`, logistics data model from `logisticsModel()`). It only runs on an empty store.
- `save()` is debounced 350 ms, stamps the current wireframe or template's `updated`, and writes the whole
  store. Call it after every change to persisted state. The top bar shows Saving…, Saved, or "Not saved:
  storage unavailable".
- Per-device preferences: `localStorage` keys `datasketch-libmin` (`'1'` when the visuals library is
  collapsed), `datasketch-panelmin` (`'1'` when the right panel is hidden), `datasketch-skpin` (`'1'` when the sketch
  toolbar's brushes are pinned open) and `datasketch-stability` (JSON,
  stability per sketch tool, for example `{"pencil":45}`). Read and written inside
  `try`.

## 3. State

- `store` (persisted): `{ version, templates: [...], wireframes: [...] }`.
- `ui` (transient): `mode` (`'wf'` wireframe or `'tpl'` template), `view` (`'home' | 'editor'`), `wfId`,
  `sel` (selected visual id), `panelMin` (right panel hidden), `multi` (set of ids when several are selected), `multiMode` (Select multiple
  toggle), `panel` / `tab` / `panelOpen`, `zoom` / `scale`, `libMin`, `flipped` (notes), `hl`
  (cross-highlight), `slicerSel`, `paramSel`, `dropOpen`, `sk` (sketch tool, colour, sizes, `stab` stability per tool, `open` / `pinned` brushes row, `prev` tool for
  the eraser swap),
  `skUndo` / `skRedo`, `drawing`, `ghost` (show hidden visuals faintly), `vdata` (computed visual data for
  tooltips), `exportCache`.
- `cur()` is the wireframe or template being edited. `pg()` is the active page: the wireframe page whose id
  is `pageId` (else the first), or the template itself. `findV(id)` looks in `pg()`. `model()` is the
  wireframe's data model. `pw()` / `ph()` are the canvas width and height from `cur().settings`.
- `normalize()` runs after load and after every import. It merges `BASE` into settings, `vDefaults()` into
  every visual, fills grids, notes mode, bookmarks and sketches, and turns a wireframe saved before pages
  existed (top-level `visuals`, `bookmarks`, `activeBm`, `sketch`) into a single page called "Page 1".

## 4. Data shapes

Wireframe:

```js
{ id, name, templateId, updated, settings, grid: { size, snap, show },
  notesMode: 'hidden' | 'flip' | 'side', pages: [page], pageId, model, showSketch, pencilDraws, hideLayout }
```

Page (`mkPage()`): `{ id, name, visuals: [...], bookmarks: [...], activeBm, sketch: [strokes] }`. Settings,
grid, notes mode, template and data model are shared by every page of a wireframe.

Template: `{ id, client, settings, visuals /* layout elements */, grid }`. Templates have one canvas and no
pages; `normalize()` gives them `notesMode: 'hidden'` and `bookmarks: []`.

Settings (`BASE`): `title, headerBg, headerFg, pageBg, visualBg, font, palette[6], radius, border,
borderColor, shadow, dataLabels, axisLabels, legend, gridlines, tooltips, titleSize (pt), headerH,
showHeader, logo (data URL), pageW, pageH` (default 1280 × 720).

Visual (`vDefaults()`): `id, type, x, y, w, h, title, titleAuto, dim, periods, sort, mid, m2, legend, mode,
ref, drill, sStyle, slider, from, to, params, cf, label, icon, action, bmId, paramId, text, fontSize, bold,
align, textColor, src, fit, notes, ov, hidden`.

- `type`: card, column, bar, line, area, donut, table, slicer, button, shape, text, image.
- `dim` / `legend`: a dimension id, or a time key `'T:Year' | 'T:Quarter' | 'T:Month'`.
- `mid`: measure id. `m2`: `''`, `'ly'` (last year), `'bud'` (budget) or another measure id.
- `ov`: per-visual style overrides, keys in `OVK` (dataLabels, axisLabels, legend, gridlines, tooltips,
  border, shadow, radius, color). A missing key means "use the canvas setting". `eff(v)` merges settings
  and overrides.
- `titleAuto: true` means the title comes from `autoTitle(v)` (for example "Shipments by Month and
  Region").

Bookmark (per page): `{ id, name, affects: [visualIds], hidden: [visualIds] }`. Applying one sets `hidden`
only on visuals in `affects`; the rest are "Not affected". New visuals are not added to existing bookmarks.

Sketch stroke: `{ tool, c, w, pts: [[x, y, pressure, tilt?], ...], shape?, fill? }` in page coordinates.
`tilt` (0–1) is only stored when above zero; `shape` is `'line' | 'rect' | 'ellipse'` after a QuickShape snap;
`fill` is a colour.

## 5. The data engine (`js/data.js`)

- Model: `{ seed, currency, dims: [{ id, name, count, members }], measures: [{ id, name, type: 'sum' |
  'ratio', fmt: 'number' | 'currency' | 'decimal' | 'percent', mag, trend: 'up' | 'down' | 'steady' |
  'volatile', strength: 'low' | 'med' | 'high', season, stories: [{ dim, member, effect: 'growing' |
  'declining' | 'star' | 'weak' }] }] }`.
- Trend, seasonality and stories are properties of the measure, so every visual of a measure tells the same
  story and totals reconcile. There is no per-visual trend.
- Time: `N_MONTHS` = 24 visible months, Jan 2025 to Dec 2026, plus `PAD` = 12 hidden earlier months so
  "last year" always exists. Non-time visuals default to the latest 12 months; date-range slicers set the
  range for every visual on the page.
- Generation is separable: value = base(month) × share(member, month) per dimension, with shares
  normalised per month to sum to 1. Totals reconcile exactly and filters are cheap, with no fact table in
  memory. Ratio measures use numerator and denominator series with per-member rate factors normalised to
  keep the overall level, and aggregate as Σnum / Σden.
- `mag`: annual total for sum measures, typical value for ratios (a percentage is entered as 32 for 32%).
- `query(model, { measure, variant: 'base' | 'ly' | 'bud', axis, legend, filters: { dimId: [memberIdx] },
  range: [m0, m1] })` returns `{ labels, keys, series: [{ name, key, vals }] }`. The engine is cached on a
  JSON key of the model.
- `exportTables(model)` builds Date.csv, one CSV per dimension and Fact.csv (grain: month × every
  dimension combination; ratio measures export numerator and denominator columns). Fact.csv is skipped
  above 300,000 rows. `daxMeasures(model)` writes matching DAX.

## 6. Rendering

- `renderPage()` rebuilds the whole page on most changes. Charts are inline SVG strings (`svgCart` for
  column, line and area; `svgBar`; `svgDonut`); tables, slicers and cards are HTML.
- `computeV(v)` resolves the context (slicer filters, date range, cross-highlight) and calls `query()`;
  results are cached in `ui.vdata` for tooltips.
- Cross-highlight (`ui.hl = { src, dim, i }`): visuals on the same dimension fade the other members;
  column and bar visuals on other dimensions draw a highlighted portion; line, area, card, table and
  donut are filtered.
- Template layout elements render locked (`.vis.locked`, no pointer events) behind the wireframe's visuals
  and follow the template live. A shape with no title has no inner padding, so a 2px shape is a divider
  line.
- The right panel (`renderPanel()`) shows the visual edit sheet or the tabs Canvas, Layers, Bookmarks and
  Data (templates show Canvas and Layers). Text inputs never re-render the panel, so focus stays; selects
  and switches re-render and restore focus from a selector.
- The visuals rail is a column: the type list (`.libitems`) scrolls on its own on wide screens so the Tips
  list (`.gestures`) stays at the bottom; collapsed to icons or on narrow screens the tips are hidden.
- The page tabs (`renderPages()`) and the arrange bar (`renderArrange()`) sit outside the scrolling stage,
  in `.mid`.
- Screens wider than 900px: the side panel button (`#panelBtn`, `setPanelMin()`) hides the right panel by
  adding `.nopanel` to `.ws`, which sets the panel column to 0 and lets the canvas take the space. The
  panel stays hidden while visuals are selected; `openSheet(id, true)` (Enter on a visual, Layers select)
  and `showTab()` show it again.
- Screens 900px wide or less: the library becomes a horizontal strip and the panel an overlay inside
  `.ws`, opened from the menu button; `.nopanel` has no effect there.

## 7. Events and conventions

- Event delegation only. One `click` listener switches on `data-act`. One `input` listener routes by data
  attribute: `data-s` settings, `data-v` visual fields, `data-ov` / `data-ovr` / `data-ovc` / `data-ovcon`
  style overrides, `data-mf` measure fields, `data-st` stories, `data-dname` / `data-dcount` /
  `data-dmem` dimensions, `data-cur` currency, `data-bmname` / `data-bmv` bookmarks, `data-g` grid,
  `data-k` wireframe flags, `data-l` layers option, `data-pal` palette, `data-pm` field-parameter
  measures, `data-notes`, `data-wfname`, `data-pgname`. One `change` listener handles zoom, the canvas
  size controls (`data-cs`, so a half-typed number never resizes the page), and file inputs
  (`data-import`, `data-vimg`, `data-logo`).
- One `pointerdown` listener handles library drag (drag preview `.dragghost`), visual move and resize
  (8 handles, grid snap), click and double-click (click opens the edit sheet and runs interactions;
  double-click flips to notes), multi-select and sketching.
- Destructive actions use `arm(btn, label, fn)`: the first tap changes the label, the second acts. Dialogs
  use the single `<dialog id="dlg">`; `alert()` and `confirm()` are not used.
- All user text goes through `esc()` when building HTML.
- UI copy is British English, sentence case, plain verbs, no exclamation marks.

## 8. The editor

### Library and changing a visual's type
`libHTML()` builds the library; the chevron collapses it to icons (`.lib.min`, 58px column on wide
screens). A tap calls `libClick(type)`: with nothing selected (or several selected) it adds a visual at a
free spot (`freeSpot()`); with one visual selected it opens "Change visual type", and `changeType()`
replaces the visual with the new type's defaults, keeping id, position, size, title, styling overrides,
notes and hidden state, plus measure fields between data visuals and second measure, legend and mode
between column, bar, line and area. Bookmarks and links keep working because the id is kept. Dragging from
the library always adds.

### Selection and multi-select
Tapping empty canvas, the grey stage around it, or pressing Escape clears the selection (`clearSel()`).
Ctrl, Cmd or Shift + click, or any tap while `ui.multiMode` is on, calls `toggleMulti()`. The arrange bar
appears whenever something is selected: the Select multiple toggle, then (with two or more) the count,
align left/centre/right/top/middle/bottom to the selection's bounding box, and distribute horizontally or
vertically (three or more; first and last stay, gaps become equal). `arrange(how)` applies them. Dragging a
selected visual moves the whole group, clamped so every member stays on the page; a plain click on one
member selects just that visual.

### Pages
The tab strip lists `cur().pages`; New page adds an empty page named "Page n". The "⋯" on the active tab
opens the Page dialog: rename, move left or right, duplicate, delete (two taps; the last page can't be
deleted). `dupPage()` gives the page, its visuals and bookmarks fresh ids by replacing every id in the
page's JSON, so bookmark buttons and field-parameter links point at the copies. `goPage()` clears
selection, highlight, slicer state, field-parameter state and sketch undo. Templates have no page tabs.

### Canvas size
The Canvas tab's Canvas size section offers `PAGE_SIZES` (16:9 1280 × 720, 16:9 large 1600 × 900, 2:1
1600 × 800, 4:3 960 × 720, Letter 816 × 1056, Tooltip 320 × 240) or a custom width and height of 200 to
4000px. `setSize()` stores `pageW` / `pageH` and moves, then shrinks, any visual that would fall off the
page, on every page. Wireframes take the template's size when created and again on Apply.

### Templates and layout
Template mode edits a client template on the same canvas with layout elements only (shape, text box,
image, button), plus the optional simple header band (title, colours, logo). Apply in a wireframe copies
the template's settings, including canvas size. The Layers tab can hide the template layout per wireframe
(`hideLayout`).

### Layers, bookmarks, notes and data
- Layers: front-to-back order, show or hide, select, move forward or backward, show hidden visuals faintly.
- Bookmarks: add from the current view, apply, rename, update from the view, delete, and set each visual
  to Shown, Hidden or Not affected. A button visual can apply a bookmark on click.
- Notes: double-click flips a visual to a notes card. Display modes: On flip, Reveal all, Alongside
  (numbered pins plus a notes rail beside the page).
- Data tab: measures, dimensions, currency, regenerate values (new seed, same settings), CSV and DAX export.

## 9. Sketch and Apple Pencil

### Who draws
The pointer's `pointerType` says whether the Pencil (`pen`), a finger (`touch`) or a mouse made it.
`pointerdown` decides, for wireframes only:

| | Pencil | Finger | Mouse |
| --- | --- | --- | --- |
| Sketch off | edits (draws only with `pencilDraws`) | edits | edits |
| Sketch on | draws | edits (draws only with `fingerDraws`) | draws |

`pencilDraws` ("Apple Pencil draws outside Sketch mode") and `fingerDraws` ("Finger draws in Sketch mode")
are wireframe flags in the Canvas tab; only `true` turns either on. Resize handles show in Sketch mode so a
finger can resize. A Pencil `pointerdown` cancels a finger drag in progress (`dragCancel`), so a palm that
lands first does not keep moving a visual; touches that start while the Pencil is drawing are ignored.

### Gestures
Touches on the stage are tracked in `touches` in every mode. A second finger starts a gesture
(`startGesture()`): it cancels a stroke or drag in progress and records the starting zoom and the page point
under the fingers. Moving two fingers calls `pinch()`, which sets `ui.zoom` from the change in finger
distance (20% to 300%) and scrolls the stage so the same page point stays under the fingers' midpoint;
the zoom select shows the result as a percentage (`syncZoom()`). On lifting, an unmoved tap under 450 ms
undoes (two fingers) or redoes (three) in Sketch mode. `.stage` has `touch-action: none` and Safari's own
`gesturestart` is cancelled, so pinching zooms the canvas, not the app; one finger on the grey stage no
longer scrolls (two fingers pan).

### Toolbar
`renderSkTools()` draws one row: the current-tool button (`skexpand`), colours, the tool's sizes (fill shows a
one-line hint instead), the Stability slider for drawing tools (0–90, step 5), undo, redo, Clear and Done.
Expanded, a second row lists every tool and a pin (`skpin`, kept in `datasketch-skpin`). `setTool()` picks a
tool, remembers the last non-eraser tool in `ui.sk.prev`, and collapses the row unless pinned.

### Tool ring, double-tap and hover
- **Ring:** a Pencil `pointerdown` that stays within 4px for 400 ms (`ringT` in `sketchDown()`) cancels the
  stroke (restoring anything an eraser touched) and calls `openRing()` at the tip; a right-click on the page
  in Sketch mode does the same (`contextmenu`). Six icon-only buttons sit on a 66px circle around a hub
  showing the colour. While that Pencil is still down, `ringMove()` highlights the tool under it by angle and
  `ringUp()` picks it on lift; lifting in the hub leaves the ring open for a tap. A tap outside, the hub or
  Escape closes it. Holding after drawing is QuickShape, not the ring: the ring timer stops at the first
  movement.
- **Double-tap:** a still Pencil tap under 250 ms is remembered (`lastTap`, with the sketch before it); a
  second within 400 ms and 24px restores that sketch (so neither tap leaves a dot, an erasure or a fill)
  and swaps between the tool and the eraser.
- **Hover:** a Pencil `pointermove` with no buttons over the page, while the Pencil would draw, positions
  `#hoverc`: a circle the width of the tool's stroke at mid pressure (at least 6px on screen), in the colour;
  dashed for the eraser, a filled dot for fill. It hides on contact, on finger or Pencil movement with a
  button down, and 700 ms after the last hover event.

### Tools and strokes
- Pencil and brush strokes are outlines whose width follows each point's pressure; the brush also
  tapers its ends. Pen and highlighter are plain lines of one width. The eraser removes whole strokes.
- Pencil (`grain: true` in `TOOLS`): each stroke is a `<g>` of three outlines on paper grain. The fringe is
  1.4 times the pressure and tilt width under `#skgrainF` (15% coverage, stray specks), so the edge breaks
  up rather than ending on the outline's clean curve. The edge layer is the full width under `#skgrainL`
  (50% coverage). The core is drawn without tilt, its width multiplied by `coreK()`: 0 below pressure 0.1,
  rising to 0.85 at pressure 0.6, and fading in over the first 25% and out over the last 15% of the
  stroke. It sits under the dense mask `#skgrain` (80% coverage). Light pressure and stroke ends leave only
  speckle, hard pressure lays a dark centre, and a tilted Pencil broadens only the outer layer, so shading
  is wide and light.
- Grain: `grainDefs()` runs once at start-up. It draws paper fibre on a 192 × 192 canvas: 9,000 seeded
  short strands (2–9px, random angle, lighter or darker than mid-grey), wrapped at the edges so the tile
  repeats without a seam. Each mask is that tile thresholded at its coverage with a soft edge (all three
  masks come from the same tile, so sparser layers' specks are a subset of denser ones'). The tiles go into a hidden
  `svg.skdefs` as patterns `#skgrainp`, `#skgrainLp` and `#skgrainFp`, one page unit per pixel, and luminance
  masks `#skgrain`, `#skgrainL` and `#skgrainF`. The patterns are in page units, so the grain is fixed to the page: strokes
  crossing a spot share its grains, and the grain scales with zoom like paper. The
  masks are in the document, not in `#sketch`, so home thumbnails use them too; a sketch copied out of
  the document as SVG would need the defs with it. A fill under a pencil outline stays solid. Nothing is
  stored: this is how pencil strokes are drawn, so earlier sketches show it too.
- 🚨 **The grain is fibre, not dot noise.** Thresholded dot noise reads as pixels when fine and as blocky
  camouflage when coarse (several page units per pixel, or a strong low-frequency "tooth"). The fibres
  must cover the whole tile: where flat grey shows through, the threshold falls inside it and turns its
  noise back into dots.
- Stability is an exponential moving average on the input points: each new point moves the stroke
  `1 - stability / 100` of the way towards the pointer. `stabOf(tool)` reads `ui.sk.stab[tool]`, falling back
  to the tool's built-in `smooth` (pencil 30, brush 50, pen and highlighter 60). At high values the line
  trails the pointer, so on lift the raw final point is added and the stroke ends where the Pencil left the
  screen. Dragging the slider updates `ui.sk.stab` without re-rendering the toolbar, so the slider keeps
  the touch.
- Tilt: `tiltOf()` turns the Pencil's `altitudeAngle` (or `tiltX` / `tiltY` when that is all the browser
  gives) into 0 at 50° from the glass or steeper, rising to 1 lying flat, so normal writing is unaffected.
  It is stored as a point's fourth value and multiplies the outline width by `1 + tilt × TOOLS[tool].tilt`
  (pencil 2.5, brush 1.2).
- Undo and redo stacks hold up to 60 sketch states (strokes, QuickShape snaps and fills).

### QuickShape
While drawing, a pause of 550 ms without moving more than 4px (`armHold`) runs `quickShape()` on the stroke:
a chord over 92% of the path length is a **line**; a closed path (ends within 30% of its size) whose
corners are all close to its bounding box is a **rectangle** (axis-aligned); otherwise one close to the
box's inscribed ellipse is an **ellipse**; anything else stays as drawn. The snapped shape replaces the
stroke's points (densified every 6px, average pressure and tilt) and sets `shape`; further movement before
lifting is ignored. After a rectangle, the **Make visual** chip (`showQS()`, fixed-position, gone after a few
seconds or on the next tap) opens a menu of every visual type; `qsMake()` places that visual in the box,
snapped to the grid, removes the drawing and opens its edit sheet.

### Fill
`fillAt()` fills the topmost closed drawing under a Fill tap with the chosen colour (`fill` on the stroke);
the same colour again clears it. Closed means a QuickShape rectangle or ellipse, or a stroke whose ends are
within 15% of its size (`closedStroke()`); the hit test is point-in-polygon on the stroke's points.
`strokeSVG()` draws the fill under the line.

- Sketches belong to the page; Show sketches hides them without deleting.

## 10. Export and import

Home → Export asks what to export; Home → Import asks what is being imported. `fileKind()` reads a file's
kind; choosing the wrong kind says what the file is and which option imports it.

| Kind | File | Import |
| --- | --- | --- |
| Full backup | `DataSketch backup YYYY-MM-DD.json`: the store, `{ version, templates, wireframes }` | Shows what the backup holds and asks to confirm, then replaces the store |
| Client template | `DataSketch template - <client>.json`: `{ datasketch: 'template', version: 1, template }` | Adds the template with a new id |
| Wireframe | `DataSketch wireframe - <name>.json`: `{ datasketch: 'wireframe', version: 1, wireframe, template }` | Adds the wireframe with a new id; adds the bundled template only if no template with that id exists, otherwise links to it |

Every import runs `normalize()`, so files from earlier versions (no pages, no canvas size) load.

## 11. Branding and themes

- Logo mark: navy (#11204D) rounded report frame, blue (#1F7FF6) bars and a cursor; `icons/mark.svg` is the
  vector source. `icons/mark-white.svg` is the white version for dark backgrounds.
- `BRAND` renders both versions of the mark and the wordmark (`.lt` and `.dk`); CSS shows the pair for the
  current theme using the same rules as the colour tokens (`prefers-color-scheme`, overridden by
  `data-theme` on `:root`).
- App accent: `--accent` #1A66D9 in light, #6AA8FF in dark.
- Theme JSON builds a Power BI theme from the current settings (palette, backgrounds, border, shadow,
  labels, axes, legend, tooltips, title size).

## 12. Service worker and deploy

- `sw.js` precaches `ASSETS` into a cache named `VERSION` on install, deletes other `datasketch-` caches on
  activate, and serves same-origin GET requests cache-first (navigations get the cached `index.html`).
- `app.js` registers it (not on `file://`). When a new worker is waiting, a banner offers Update, which
  posts `skipWaiting`; the page reloads on `controllerchange`.
- Release: bump `VERSION` (`datasketch-x.y.z`) in `sw.js` and `APP_VERSION` in `js/app.js` (shown on the
  home screen), add any new file to `ASSETS`, merge to `main`. GitHub Pages serves the root of `main`;
  there is no build step and no Actions workflow.

## 13. Checks

Serve the repo over http and drive it with Playwright, service workers blocked, at desktop and iPad
portrait (820 × 1180), in Chromium and in WebKit (layout differences such as the file-input overflow in §14
only show in WebKit). Headless WebKit paints the turned-away notes side of every visual (it ignores
`backface-visibility` in the 3D flip), so its screenshots show yellow notes cards with mirrored text; real
Safari does not. Use WebKit for layout measurements, Chromium for how things look:

- No page errors or console errors; home shows Operations and Northwind Logistics on a fresh store.
- Open the wireframe; every panel tab renders; clicking bars highlights; bookmarks apply.
- Add, move, resize; change a selected visual's type (Cancel leaves it unchanged); collapse the library.
- Pages: add, rename, duplicate, move, delete; switching keeps each page's visuals.
- Multi-select with Ctrl-click and with Select multiple; align, distribute, group drag; Escape clears.
- Canvas size presets and custom values; visuals stay on the page.
- Export each kind and import it back; a wrong-kind import explains itself; an old backup without pages
  still loads.
- Sketch: Pencil-type input moves and resizes with Sketch off and draws with Sketch on; in Sketch mode a
  finger (CDP `Input.dispatchTouchEvent`) moves and resizes while the Pencil and mouse draw; `fingerDraws`
  lets a finger draw. A second finger cancels a drag; two- and three-finger taps undo and redo; pinch zooms
  and two fingers pan in both modes; a 70° tilt broadens the pencil and a 30° lean does not; a pencil stroke is a group of a `#skgrainF` fringe, a `#skgrainL` edge and a `#skgrain` core, with no clean outline at size 8, grainy in Chromium and WebKit, on the canvas and in the home thumbnail; pressure 0.15 leaves speckle only and 0.9 a dark centre, and the ends fade; a held rough
  box, circle and line snap, the same box without a hold and a held scribble do not; Make visual places a
  visual in the box; Fill fills a snapped box and a freehand loop, clears with the same colour, explains a
  tap on an open line, and undoes. Toolbar: collapsed by default, expands, a pick collapses it, the pin keeps
  it open across a reload. Ring: a still 400 ms hold opens it with no dot, it is icons only, sliding
  highlights and lifting picks, a hub lift keeps it for a tap, Escape and the hub close it, right-click opens
  it, and draw-then-hold still snaps. Double-tap swaps to the eraser and back with no marks; a single tap
  still draws a dot. Hover circle: shown, grows with size, hides on contact and when hover stops, absent with
  Sketch off. Tips: nine rows, visible at the bottom of the rail. Stability:
  each tool shows its default, the eraser has none, the same zigzag at 90 is much shorter than at 0 and
  still ends at the lift point, and the value survives a reload.
- Light and dark logo; CSV export downloads.
- Side panel hides and shows on wide screens; the panel never scrolls sideways (`scrollWidth` equals
  `clientWidth` on every tab and edit sheet, in WebKit).

On the iPad: Pencil pressure and tilt feel, finger editing while the Pencil draws (and palm rejection),
pinch and pan, two- and three-finger taps, QuickShape hold timing, dragging visuals without the page
scrolling, Add to Home Screen and offline launch.

## 14. Traps

- **iPad Safari pans during drags.** `touch-action: none` on `.page` and `.vis` is not enough inside the
  scaled, scrolling stage: Safari still pans and fires `pointercancel`, which ends the drag. A non-passive
  `touchmove` listener calls `preventDefault()` when the touch is on a visual (not a textarea) or while
  drawing. `.stage` itself has `touch-action: none`; the canvas pans with two fingers.
- **WebKit lays out a hidden file input at full width.** The upload buttons (`.filebtn`) hide their
  `<input type="file">` at 1px with no opacity, but Safari still lays out its built-in button and label,
  which made the right panel 15px too wide and scroll sideways. `.filebtn` has `overflow: hidden`. Chromium
  clips them anyway, so only a WebKit check catches this.
- **Generic class names collide.** The drag preview is `.dragghost` because `button.ghost` is the top bar's
  back button style.
- **Top bar flex.** `.bar > *` is `flex: none` and the name field has a fixed flex basis, so inputs can't
  overlap the buttons.
- **Stacking.** Each `.vis` is its own stacking context (3D flip). A handle of a selected visual can sit
  under a neighbour that overlaps it.
- **Second measure axis.** Last year and budget share the primary axis; only other measures use the right
  axis.
- **Shrinking the canvas is permanent.** `setSize()` moves visuals to fit; making the canvas larger again
  does not move them back.

## 15. Limits

- Web apps get Apple Pencil pressure, tilt and hover, but not the Pencil's own double-tap or squeeze, barrel
  roll (WebKit's `twist` reads 0) or haptics. Safari handles squeeze itself (in Safari 26 it shows its own
  back/forward palette), and the page receives no event of any kind for it: no pointer, key, focus,
  visibility or history event, checked with an event log on an iPad Pro and Apple Pencil Pro in Safari 26.3.
  The tool ring therefore opens on a held tip; a native shell (`UIPencilInteraction`) would be needed to
  open it on squeeze. Drawing latency is close to, but not, native: Safari 18.2+
  offers `getPredictedEvents()`, which the app does not use yet.
- A Pencil resting palm is only guarded against once the Pencil touches: a palm that lands first can start a
  finger drag, which the Pencil's touch then cancels.
- Text boxes have one size, weight, colour and alignment, and no italics.
- Fact.csv export stops above 300,000 rows.
- Plain http on a LAN address has no service worker, install or share sheet; those need the live https
  site.
