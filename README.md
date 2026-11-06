# DataSketch

Wireframes for Power BI reports, made in client requirement sessions on an iPad with Apple Pencil or on a
desktop. Visuals look like Power BI natives and are filled from a realistic, internally consistent fake data
model, so clients react to the layout and the story rather than to real numbers. Client templates carry a
client's styling and page layout; wireframes have pages, bookmarks, layers, notes and Pencil sketches.

Live at **https://adamnc02.github.io/data-sketch/**, served by GitHub Pages from the root of `main`, and
made to be added to an iPad Home Screen. **Status: 1.3.2.**

## Stack

Plain HTML, CSS and native ES modules. **No framework, no bundler, no npm, no CDN scripts and no build
step**: the files in this repo are what the browser runs. All data stays on the device (IndexedDB, with a
`localStorage` fallback); nothing is sent to a server. A service worker caches the app so it works
offline once loaded.

## What it does

- **Home:** wireframes and client templates as cards with thumbnails. New wireframe picks a template and a
  starting data model (the sample model or a copy of another wireframe's). **Export** and **Import** each ask
  what kind: a full backup, one client template, or one wireframe.
- **Client templates:** styling (colours, theme palette, font, corners, borders, shadows, data labels and the
  rest), canvas size, and a page layout built from shapes, text boxes, images and buttons. Wireframes copy
  the styling and canvas size when created (Apply copies them again) and show the template's layout live,
  locked, behind their visuals.
- **Report and page names:** a text box can show its own text, the **report name** (the wireframe's name,
  followed by a separator such as `|`) or the **page name**. A page-name box set to start after the report
  name sits one space after the separator, so the spacing either side of the `|` stays even as the name
  changes. In the template both show their sample text.
- **Page navigator:** one visual with a button per page, vertical or horizontal. In a template it shows
  placeholders (Page 1, Page 2…); in a wireframe it lists the wireframe's pages in the order of the page tabs,
  follows renames, new pages and reordering, and highlights the current page. Any text box can be set to **Upper case** and to
  **Wide spacing** (a space between the letters of each word and an em space between words and either side of
  the separator); the stored text keeps its own case and spacing.
- **Canvas:** presets from 16:9 to Letter and Tooltip, or a custom size; Fit, 100, 75 and 50% zoom; a grid
  with snap; drag from the library or tap to add; move and resize from every edge, or type the X, Y, width
  and height in the edit sheet.
- **Keyboard:** Delete (or Backspace) deletes the selected visuals, with Undo in the message that follows.
  The arrow keys nudge the selection: one grid step with snap on, 1px with it off.
- **Visuals:** card, column, bar, line, area, donut, table, matrix, slicer (list, dropdown, tiles, date range, field
  parameter), button, page navigator, shape, text box and image. With a visual selected, tapping another type in the
  library changes it after a confirmation. The library collapses to icons, and on wide screens (iPad
  landscape, desktop) the side panel button in the top bar hides the right panel to give the canvas more room.
- **Matrix:** up to three row levels (dimensions, or Year, Quarter and Month) with + and − to expand and
  collapse each group, Expand all and Collapse all, subtotals on every group and a grand total. With no
  column field it shows the measure, last year and the change; with one (a dimension or a time level) it
  shows the measure for each column member and a Total column.
- **Multi-select:** Ctrl, Cmd or Shift + click, or **Select multiple** in the arrange bar on touch. Align
  left, centre, right, top, middle or bottom; distribute horizontally or vertically; drag the group.
- **Pages:** a tab strip under the canvas. Each page has its own visuals, bookmarks and sketches; styling,
  grid and the data model are shared.
- **Interactivity:** cross-highlighting from bars, rows and slicers, tooltips, date drill, bookmarks with
  per-visual scope (Shown, Hidden, Not affected) linked to buttons.
- **Notes:** double-click a visual to flip it and type notes; show them on flip, all at once, or alongside
  the page as numbered pins.
- **Data tab:** measures (type, format, size, trend, strength, seasonality and stories such as "top
  performer"), dimensions and member names, currency, regenerate values, and export of a star schema as
  CSVs with matching DAX measures.
- **Sketch:** the **Sketch** button switches Apple Pencil from editing to drawing. In Sketch mode the Pencil
  (and a mouse) draws while a finger keeps selecting, moving and resizing visuals; "Finger draws in Sketch
  mode" lets a finger draw instead. Pencil, pen, brush, highlighter, fill and eraser; pressure-sensitive,
  and the pencil and brush broaden when the Pencil is tilted past writing angle. The pencil is grainy like
  an HB pencil on paper, lighter when pressed lightly. Each drawing tool has its
  own sizes and a Stability slider (smoothing, 0–90), kept per device.
- **Sketch toolbar:** colours, size, stability, undo, redo, Clear and Done. The current-tool button expands the
  brushes; picking one collapses them again unless the pin is on.
- **Tool ring:** hold the Pencil tip still (or right-click with a mouse) and a ring of tool icons opens
  around it; slide onto one and lift, or tap one. Double-tap the tip to swap between the tool and the
  eraser. A hovering Pencil shows a circle of the tool's size and colour.
- **QuickShape:** draw and hold still at the end; a line, rectangle or ellipse snaps clean. A snapped
  rectangle offers **Make visual**, which places any visual type in exactly that box.
- **Fill:** tap inside a closed drawing (a snapped rectangle or ellipse, or any outline whose ends meet) to
  fill it with the chosen colour; the same colour again clears it.
- **Tips:** the gestures and editing shortcuts are listed at the bottom of the visuals rail.
- **Gestures (any mode):** pinch to zoom, drag with two fingers to pan. In Sketch mode, a two-finger tap
  undoes and a three-finger tap redoes.
- **Theme JSON:** a Power BI theme file from the current styling, to copy or download.

## Rules that must not be quietly undone

### Every path is relative.
GitHub Pages serves the app from `/data-sketch/`. `css/app.css` and `./` work; `/css/app.css` breaks the
live app while working on localhost.

### Every release bumps `VERSION` in `sw.js` and `APP_VERSION` in `js/app.js`.
The service worker serves every file from its cache. Without a new `VERSION`, installed copies keep
running the old files and never offer the update.

### A file the app needs is listed in `ASSETS` in `sw.js`.
Anything missing from the list is not available offline.

### Every new stored field has a default in `vDefaults()`, `BASE` or `normalize()`.
Stores, backups and exports from earlier versions load through `normalize()`. A field without a default is
`undefined` in old data.

### Visuals, bookmarks and sketches are read through `pg()`, never `cur()`.
They belong to the active page of a wireframe. `cur()` is the wireframe or template; `pg()` is its page (a
template is its own single page).

### The canvas size is read through `pw()` and `ph()`.
It lives in each template's and wireframe's settings. There is no fixed page size in the code.

### Trend, seasonality and stories live on the measure, never on a visual.
Every visual of a measure then tells the same story and totals reconcile across visuals.

### Destructive actions confirm with a second tap (`arm()`), never `confirm()`.
Full-backup import confirms in its own dialog. The Delete key is the one exception: it deletes at once and
its message offers Undo.

### All user text goes through `esc()` before it is put into HTML.

## Running it locally

ES modules and the service worker need http, not `file://`. From the repo root:

```
python3 -m http.server 8765
```

Open `http://localhost:8765/`. To test on an iPad on the same Wi-Fi, use the Mac's LAN address
(`http://<mac-ip>:8765/`). Plain http on a LAN address has no service worker or Add to Home Screen; test
those on the live site.

## Tests

There is no automated test suite in the repo. Changes are checked by driving the app in Chromium with
Playwright (service workers blocked so cached files can't hide a change), at desktop and iPad portrait
(820 × 1180) sizes, in Chromium and WebKit (Safari's engine lays out some controls differently), and then
on the iPad. `TECHNICAL.md` §13 lists the checks.

## Deploying

Merging to `main` deploys: GitHub Pages builds from the root of `main` (Settings → Pages → Deploy from a
branch → `main` / `(root)`). `.nojekyll` makes Pages serve the files as they are. Bump `VERSION` and
`APP_VERSION` first; open copies then show **"A new version of DataSketch is ready"** with an Update
button.

On the iPad: Safari → Share → **Add to Home Screen**. The Home Screen app keeps its data separately from
Safari tabs, so Export a full backup and Import it when moving between them.

## Documents

- `README.md`: this file.
- `TECHNICAL.md`: how the app is built, module by module, with the data shapes and file formats.
