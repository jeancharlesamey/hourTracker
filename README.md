```
  ╔═══════════════════════════════════════╗
  ║                                       ║
  ║   ◷  H O U R   T R A C K E R          ║
  ║      one file. no server. no fuss.    ║
  ║                                       ║
  ╚═══════════════════════════════════════╝
```

**beta-1.1.0**

A minimal, offline-first hour tracker that lives only in your computer.

No login. No backend. No complicated install. Just open and start logging.

---

## What it does

Log hours per task, per day. See everything in a calendar. Analyze trends with detailed charts.

```
  March 2026
  ┌────┬────┬────┬────┬────┬────┬────┐
  │ Mo │ Tu │ We │ Th │ Fr │ Sa │ Su │
  ├────┼────┼────┼────┼────┼────┼────┤
  │    │ ▩▩ │ ▩▩ │    │ ▩▩ │    │    │
  │  2 │  3 │ 4  │  5 │ 6  │  7 │  8 │
  └────┴────┴────┴────┴────┴────┴────┘
         ↑
    4 squares = work logged that day
```

Each day cell shows **4 squares**, each representing 2 hours (8h total):
- Squares fill bottom-to-top as you log hours
- Tasks stack sequentially — task 1 fills first, task 2 picks up where it left off
- Beyond 8h? An overflow layer rises behind the squares
- Over your daily cap? The cell turns red

---

## Features

**Home Calendar**
- Monthly view, scrollable grid
- Legend + month nav stay sticky
- Navigate with arrows or wheel
- 4-square diagram per day
- Over cap → red cell + white number
- Burnout days badge in header
- "Go to today" jumps + opens sheet
- Click month label → monthly summary (week-by-week breakdown + task totals)
- Mode toggle: Hours / Days / Percent

**Analytics Page**
Three views for insight:
- **Activity:** GitHub-style contribution heatmap with all tasks combined + individual per-task heatmaps
- **Intensity:** Line chart showing task hours over the month with day labels (e.g., "Tue 21"), responsive height
- **Repartition:** Doughnut chart showing how hours are split across tasks
- Month navigation on each view
- Click month name → same summary modal
- Dark mode support throughout

**Tasks**
- Add / remove tasks anytime
- Pick a color per task
- Log hours (decimals OK: 1.5, 0.25)
- No hard cap — log what you worked
- Sheet header: Xh remain / filled ✓ (remaining hours for selected day)
- Last fill toast (today only): "45min since last fill at 10:00am" — auto-dismisses when cap is reached, only updates when logging today

**Legend**
- Shows each task's monthly total
- Example: ● Writing (6.5h)

**Monthly Summary Modal**
- Week-by-week breakdown (W01, W02 …)
- Per-week task totals in grid layout
- Month total with all task contributions
- Mode toggle: Hours / Days / Percent
  - Hours: 0.25 = 15min · 0.5 = 30min
  - Days: 1 day = daily cap
  - Percent: share of total per week
- Burnout pill with days over cap
- Reusable across Home and Analytics

**Other**
- Light / dark mode toggle
- Configurable daily cap (default 7.5h)
- All data in localStorage — stays put
- Works offline (service worker)

---

## Install

**Download the package and unzip in a safe place.**

No build step. No dependencies to install. It runs in any modern browser.

Git clone if you want:
```bash
git clone https://github.com/you/hour-tracker.git
cd hour-tracker
open index.html        # macOS
# or double-click index.html in Finder / Explorer
```

---

## Usage

```
  1. Open index.html with your browser (bookmark it)
     └─ The current month loads automatically

  2. Add your tasks
     └─ Settings (⚙) → "+ Add task" → pick a name + color

  3. Set your daily cap
     └─ Settings (⚙) → Daily cap (default: 7.5h)

  4. Click any day
     └─ A bottom sheet slides up
     └─ Type hours for each task (e.g. 3, 1.5, 0.25)

  5. Watch the calendar fill up
     └─ Squares fill task by task, bottom to top
     └─ Red cell = you went over your daily cap

  6. Click the month label for a summary
     └─ See totals per task, per week, for the month
     └─ Toggle between Hours / Days / Percent views
     └─ Burnout pill shows days over cap + total excess

  7. Open Analytics for deeper insights
     └─ Click the chart icon in the header (📊)
     └─ Choose: Activity (heatmap) / Intensity (line) / Repartition (pie)
     └─ Navigate months, view summaries, identify patterns
```

---

## The squares, explained

```
  Each day cell = 4 squares × 2h = 8h capacity

  ┌──┬──┐
  │  │  │  sq3 (4–6h)  sq4 (6–8h)
  ├──┼──┤
  │▓▓│░░│  sq1 (0–2h)  sq2 (2–4h)
  └──┴──┘
     ↑
  fills bottom to top, task by task

  task 1: 1h  → bottom half of sq1 (color A)
  task 2: 2h  → top half of sq1 + bottom of sq2 (color B)
  task 3: ...   keeps stacking into the next square

  beyond 8h → overflow layer rises behind the grid
  beyond cap → cell turns red
```

---

## Data & privacy

Everything is stored in your browser's `localStorage`.
Nothing is sent anywhere. Ever.

```
  your browser
      │
      └── localStorage
              ├── dt_tasks        ← your task list + colors
              ├── dt_completions  ← hours per day
              ├── dt_maxCap       ← your daily cap setting
              ├── dt_lastFill     ← timestamp of last fill (today only)
              └── dt_lastFillDay  ← date of last fill (for day rollover)
```

To export: open DevTools → Application → Local Storage → copy the values.

To reset all data: Settings → Delete all data.

---

## File structure

```
  hour-tracker/
  ├── index.html        ← main app (HTML + CSS + JS)
  ├── analytics.html    ← charts & analytics page
  ├── month-modal.js    ← reusable month summary modal
  ├── manifest.json     ← PWA manifest
  ├── sw.js             ← service worker (offline support)
  └── icons/            ← app icons (16, 48, 128, 192, 512px)
```

---

## Browser support

Works in any browser that supports:
- CSS grid + custom properties
- localStorage
- Service Workers *(for offline/PWA only)*
- Chart.js *(for Analytics page)*

Chrome 80+, Firefox 83+, Safari 15+, Edge 80+.

---

## Changelog

**beta-1.1.0** — 2026-04-21
- **Analytics page** (new):
  - Activity view: GitHub-style heatmap (all tasks + individual)
  - Intensity view: Line chart with responsive height, day labels (e.g., "Tue 21")
  - Repartition view: Doughnut chart showing task distribution
  - Month navigation on each view
  - Month summary modal with week-by-week breakdown
- **Month Summary Modal** (refactored):
  - Extracted to reusable `month-modal.js` component
  - Accessible from both index.html and analytics.html
  - Mode toggle: Hours / Days / Percent
  - Per-week task grids + month total
- **UI improvements**:
  - Updated header icons for consistency
  - Dark mode refinements
  - Responsive chart heights based on viewport

**alpha-1.0.6** — 2026-03-28
- Bottom sheet responsive width:
  ≤ 800px → full width (slide-up)
  801–999px → 50vw, flips left/right by day column
  ≥ 1000px → 33vw, flips left/right by day column
- Live resize: sheet updates instantly when window is resized

**alpha-1.0.5** — 2026-03-28
- Bottom sheet: fixed 33vw width on desktop
- Bottom sheet: flips left/right based on selected day's column
- Sheet header: hidden when at cap, shows overages otherwise
- Last fill toast: elapsed time display

**alpha-1.0.4** — 2026-03-27
- Last fill toast: persistent, today-only
- Bottom sheet header improvements
- Desktop layout refinements

**alpha-1.0.3** — initial tagged release

---

```
  made with curiosity in one file and few evening hours by jeancharlesamey
```
