```
  ╔═══════════════════════════════════════╗
  ║                                       ║
  ║   ◷  H O U R   T R A C K E R         ║
  ║      one file. no server. no fuss.    ║
  ║                                       ║
  ╚═══════════════════════════════════════╝
```

**Alpha-1.0.0**

A minimal, offline-first hour tracker that lives only in tour computer.

No login. No backend. No complicated install. Just open and start logging.

---

## What it does

Log hours per task, per day. See everything in a calendar.

```
  March 2026
  ┌────┬────┬────┬────┬────┬────┬────┐
  │ Mo │ Tu │ We │ Th │ Fr │ Sa │ Su │
  ├────┼────┼────┼────┼────┼────┼────┤
  │    │  ● │ ●  │    │ ●  │    │    │
  │  2 │  3 │ 4  │  5 │ 6  │  7 │  8 │
  └────┴────┴────┴────┴────┴────┴────┘
         ↑
    colored dot = work logged that day
```

Each dot in the calendar is a **clock-shaped diagram**:
- Starts filling at 9am (top-left of the circle)
- Pauses at noon for a 1h30 lunch gap
- Resumes at 13:30 until end of day
- Overflows past 8h? The dot keeps filling — but turns **red**

---

## Features

```
  ┌─ Calendar ──────────────────────────────┐
  │  · Monthly view, navigate with arrows   │
  │  · Clock-metaphor dot per day           │
  │  · Over 8h → red cell + red number      │
  │  · Selected day dot slowly spins        │
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


Click on the month label to get :

  ┌─ Monthly summary popup ─────────────────┐
  │  · Hours per task, broken down by week  │
  │  · ISO week numbers (W01, W02 …)        │
  │  · Grand total at the bottom            │
  └─────────────────────────────────────────┘

  ┌─ Other ─────────────────────────────────┐
  │  · Light / dark mode toggle             │
  │  · Streak counter                       │
  │  · All data in localStorage — stays put │
  │  · Works offline (service worker)       │  └─────────────────────────────────────────┘
```

---

## Install

**Download the package and un zip in a safe place.**

No build step. No dependencies to install. It runs in any modern browser.

Git clone of you want :
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

  3. Click any day
     └─ A bottom sheet slides up
     └─ Type hours for each task (e.g. 3, 1.5, 0.25)

  4. Watch the calendar fill up
     └─ Each day dot fills like a clock face
     └─ Colors stack in order of most → least hours

  5. Click the month label for a summary
     └─ See totals per task, per week, for the month
```

---

## The dot, explained

```
           12:00
            ─┬─
        ╱    │    ╲
      ╱  ░░░░│░░░░  ╲   ← lunch gap (12:00–13:30)
     │░░░░░░░│░░░░░░░│
  9am├───────┼───────┤  ← start of day (fill begins here)
     │▓▓▓▓▓▓▓│▓▓▓▓▓▓▓│
      ╲  ▓▓▓▓│▓▓▓▓  ╱   ← task colors stack up
        ╲    │    ╱
            ─┴─
           overflow

  ▓ = hours worked    ░ = lunch gap    · = empty
```

Colors are stacked in descending order of hours logged —
the task you worked most on claims the most arc.

---

## Data & privacy

Everything is stored in your browser's `localStorage`.
Nothing is sent anywhere. Ever.

```
  your browser
      │
      └── localStorage
              ├── dt_tasks        ← your task list + colors
              └── dt_completions  ← hours per day
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
  ├── icons/            ← app icons (16, 48, 128, 192, 512px) NEED AN UPDATE
  └── ARCH/             ← archived versions NOT SHARE ON GITHUB
```

---

## Browser support

Works in any browser that supports:
- CSS conic-gradient
- localStorage
- Service Workers *(for offline/PWA only)*

Chrome 80+, Firefox 83+, Safari 15+, Edge 80+.

---

```
  made with curiosity in one file and few evening hours by jeancharlesamey
```
