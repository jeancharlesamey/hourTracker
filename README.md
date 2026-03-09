```
  ╔═══════════════════════════════════════╗
  ║                                       ║
  ║   ◷  H O U R   T R A C K E R         ║
  ║      one file. no server. no fuss.    ║
  ║                                       ║
  ╚═══════════════════════════════════════╝
```

**1.0.1**

A minimal, offline-first hour tracker that lives only in your computer.

No login. No backend. No complicated install. Just open and start logging.

---

## What it does

Log hours per task, per day. See everything in a calendar.

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

```
  ┌─ Calendar ──────────────────────────────┐
  │  · Monthly view, navigate with arrows   │
  │  · 4-square diagram per day             │
  │  · Over cap → red cell + white number   │
  │  · Burnout days badge in header         │
  │  · "Go to today" jumps + opens sheet    │
  │  · Click month label → monthly summary  │
  └─────────────────────────────────────────┘

  ┌─ Tasks ─────────────────────────────────┐
  │  · Add / remove tasks anytime           │
  │  · Pick a color per task                │
  │  · Log hours (decimals OK: 1.5, 0.25)   │
  │  · No hard cap — log what you worked    │
  └─────────────────────────────────────────┘

  ┌─ Legend ────────────────────────────────┐
  │  · Shows each task's monthly total      │
  │  · Example: ● Writing (6.5h)            │
  └─────────────────────────────────────────┘

  ┌─ Monthly summary popup ─────────────────┐
  │  · Hours per task, broken down by week  │
  │  · ISO week numbers (W01, W02 …)        │
  │  · Grand total at the bottom            │
  │  · Burnout pill with total exceeded h   │
  └─────────────────────────────────────────┘

  ┌─ Other ─────────────────────────────────┐
  │  · Light / dark mode toggle             │
  │  · Configurable daily cap (default 7.5h)│
  │  · All data in localStorage — stays put │
  │  · Works offline (service worker)       │
  └─────────────────────────────────────────┘
```

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
     └─ Burnout pill shows days over cap + total excess
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
              └── dt_maxCap       ← your daily cap setting
```

To export: open DevTools → Application → Local Storage → copy the values.

To reset all data: Settings → Delete all data.

---

## File structure

```
  hour-tracker/
  ├── index.html        ← the whole app (HTML + CSS + JS)
  ├── manifest.json     ← PWA manifest
  ├── sw.js             ← service worker (for offline support)
  └── icons/            ← app icons (16, 48, 128, 192, 512px)
```

---

## Browser support

Works in any browser that supports:
- CSS grid + custom properties
- localStorage
- Service Workers *(for offline/PWA only)*

Chrome 80+, Firefox 83+, Safari 15+, Edge 80+.

---

```
  made with curiosity in one file and few evening hours by jeancharlesamey
```
