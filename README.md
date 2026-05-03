◷ **HOUR TRACKER** — one file. no server. no fuss.

**v1.3.0-beta3**

A minimal, offline-first hour tracker that lives in your browser. No login, no server, no complications.

---

## UseCase

**You work on multiple projects and need to understand where your time actually goes.**

Every Friday, you review the week. You notice 3 days hit your daily cap (7.5h), 2 days stopped at 4h, and 2 days had no logged hours. The calendar shows it visually. The analytics show it numerically. You see that design work consumed 24.2h, and writing only 8.7h. Next week, you adjust. No guessing. No feeling. Numbers.

This is the premise: **"I can't improve what I can't measure."**

Most trackers ask you to log in real-time. You forget. You estimate retroactively. The data becomes fiction. This one stays simple—open at the end of your half-day or day, type hours per task, move on. No syncing. No apps. No friction. Just your browser and the truth.

The calendar shows **4 squares per day**, each representing 2 hours (8h total capacity). Each day in March 2026 displays as a grid where you can see how many hours were logged — 2, 3, 4, 5, etc. — with squares filled from bottom to top.

How it fills:
- Squares fill bottom-to-top as you log
- Tasks stack sequentially (task 1 first, task 2 next, etc.)
- Beyond 8h: overflow layer rises behind the squares
- Over your cap: cell turns red, showing you exceeded it

---

## Quick Start

1. **Open** `index.html` in your browser and bookmark it
2. **First launch:** Set your daily cap immediately (Settings ⚙ → Daily cap). This is your baseline for everything else. Default is 7.5h. Change it to what you actually work.
3. **Add tasks** via Settings ⚙ → Add task
4. **Log hours** by clicking any day
5. **Analyze** via Analytics for patterns

---

## Features by Page

**Home Calendar**
- Monthly grid with daily hour breakdown
- Visual 4-square stacking (2h per square)
- Red highlight when you exceed your daily cap
- Click any day to log hours
- Click the month label for week-by-week summary

**Analytics**
- **Activity:** GitHub-style heatmap (all tasks + per-task)
- **Intensity:** Daily/weekly bar charts with averages
- **Repartition:** Task distribution at a glance
- **Burn Chart:** Hours logged vs. ideal trajectory
- **Weekly Hours:** Toggle between W14 and Apr 1 views
- **Requirements:** Task deadlines and estimates

**Task Tracking**
- Decimal hours supported (1.5, 0.25, etc.)
- Color-coded tasks
- Optional Jira links
- Delivery date tracking with overdue warnings
- Month navigation built in

**Other**
- Light / dark mode
- All data in localStorage (stays private)
- Works fully offline
- No dependencies

---

## Install

No build step. No dependencies.

**Option 1:** Clone the repo, navigate to the folder, open `index.html`

**Option 2:** Just open `index.html` directly in any modern browser

**Browser support:** Chrome 80+, Firefox 83+, Safari 15+, Edge 80+

---

## File Structure

**Core Files**
- `index.html` — main app
- `analytics.html` — charts & analytics
- `month-modal.js` — reusable summary modal
- `settings-modal.js` — settings UI
- `app-menu.js` — header menu
- `manifest.json` — PWA config
- `sw.js` — offline support
- `icons/` — app icons

---

## Data & Privacy

Everything stays in your browser's localStorage. Nothing is sent anywhere.

Data stored locally: your task list, colors, hours per day, daily cap, and last entry timestamp.

**Export:** DevTools → Application → Local Storage → copy values
**Reset:** Settings → Delete all data

---

## Recent Updates

**v1.3.0** — Settings sidebar, task filtering, analytics refinements
- Settings Sidebar: Redesigned settings UI as dedicated sidebar modal with integrated task creation
- Task Status Persistence: Fixed migration to preserve status and external IDs across sessions
- Smart Task Filtering: Tasks now filter by month (showing only tasks with logged hours in selected month) across Weekly Breakdown, legends, and views
- Analytics Layout: Year Heatmap legend repositioned to match overview layout; tighter title-to-legend spacing
- Heatmap Tooltips: Interactive tooltips on by-task heatmap cells (hours + date) with 800ms delay; suppressed on future days with 0 hours
- Status Colors: Progress card badges now display per-status semantic colors (soon=gray, inProgress=yellow, inPause=orange, done=green, checking=blue, archived=gray)
- Navigation Fixes: Back buttons on Archive and Analytics pages now use explicit navigation for reliability

**v1.2.1-beta.2** — Bug fixes
- Color Picker: Fixed visual glitch where picker state switched across all tasks (Issue #8)
- Back Navigation: Changed from folder link to history.back() for clean navigation (Issue #9)
- Dark Mode Flash: Added synchronous dark mode check in page head to prevent light mode flash on navigation

**v1.2.0-beta.2** — Delivery tracking, charts, full-year heatmap
- Burn Chart: Refined visualization with ideal trajectory line
- Date Formatting: Consistent display + "Month Day Year" in requirements
- Hours Done Views: Toggle between Week (W14) and Day (Apr 1) with tooltips
- Heatmap: Full calendar year (Jan 1 → Dec 31)
- Visual Refinements: Improved colors, spacing, dark mode enhancements


