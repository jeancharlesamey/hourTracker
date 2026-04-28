# Project Instructions - Hour Tracker

## Git Operations - COMPLETELY DISABLED

**Claude must NOT execute ANY git commands on this project. None.**

Forbidden:
- No `git add`, `git commit`, `git push`
- No `git status`, `git log`, `git diff`
- No `git branch`, `git checkout`, `git merge`
- No `git reset`, `git rebase`, `git pull`
- No `git` command whatsoever, in any form

User handles all git operations exclusively.

## General Workflow

- Review code and suggest changes
- Propose Plan Mode for heavy need reflexion and implementation on multipe files
- Ask user for confirmation before making file modifications
- Provide clear explanations of what's being changed and why

## Task Data Structure

Each task object contains:
- `name` — task name
- `color` — task color identifier
- `estimate` — estimated workload (days)
- `deliveryDate` — delivery date (YYYY-MM-DD format)
- `jiraLink` — Jira link URL
- `status` — task status (Soon/inProgress/inPause/done/checking/archived)
- **`idOpus`** — **Opus ID** (external ID reference, displayed as "ID" in the UI)

**IMPORTANT:** The "ID" field in the task editing form is `idOpus` — it stores the Claude Opus ID (or other external ID) associated with the task. This is NOT a database identifier for the task itself.

## PR Template for v1.3.0-beta.3

**Title:** Beta-1.3.0: Analytics refinements — task filtering, legend layout, and heatmap tooltips

**Description:**

### Summary
This release improves the analytics interface with smarter task filtering, refined legend positioning, and interactive heatmap cell tooltips. Tasks now filter to show only those with logged hours in the selected month across all views. The Year Heatmap legend in by-task view now matches the overview layout, and heatmap cells display contextual tooltips on hover.

### Improvements

**Task Filtering**
- Tasks now filter to show only those with hours logged in the selected month
- Applied to: Weekly Breakdown table, task legend, and by-task view
- Reduces clutter and focuses analytics on active work

**Legend Positioning & Spacing**
- Moved Year Heatmap legend in by-task view to separate container (matches overview layout)
- Legend now sits above the graph instead of inside the graph container
- Reduced spacing between titles and legends by half (mb-6/mb-4 → mb-2; legend margin-bottom 1.5rem → 0.75rem)
- Tighter, cleaner visual hierarchy

**Heatmap Cell Tooltips**
- Added custom tooltips to by-task Year Heatmap cells
- Display: hours logged + date (DD/MM/YYYY format)
- Behavior: appears after 800ms hover delay; suppressed on future days with 0 hours
- Allows quick inspection of daily logged hours without clicking

**Status Persistence & Colors**
- Fixed task migration: `status` and `idOpus` fields now persist across sessions
- Progress card badge displays per-status colors:
  - soon → gray, inProgress → yellow, inPause → orange, done → green, checking → blue, archived → gray
- Semantic color coding improves task status visibility

**Navigation**
- Back buttons on Archive and Analytics pages now use explicit navigation (window.location.href) instead of browser history
- More reliable and prevents URL path exposure

### Files Changed
- **analytics.html** — Task filtering, legend restructuring, heatmap tooltips, status badge colors, back button navigation (lines ~339, ~425-430, ~509-514, ~1618-1750, ~1969-1993)

### Testing Checklist

**Task Filtering**
- [ ] Open Analytics → Overview → Weekly Breakdown shows only tasks with hours in selected month
- [ ] Switch months → table updates to show only tasks with hours for that month
- [ ] By-task view: task legend only displays tasks with hours in selected month
- [ ] Select a task with 0 hours in selected month → task doesn't appear in legend

**Legend Positioning**
- [ ] Overview → Year Heatmap legend displays above the graph
- [ ] By-task view → Year Heatmap legend displays above the graph (matches overview position)
- [ ] Title-to-legend spacing is tight (not 1.5rem margin like before)

**Heatmap Tooltips**
- [ ] By-task view: hover over a cell with logged hours → tooltip appears after ~800ms
- [ ] Tooltip displays: hours (e.g., "2.5h") on first line, date (e.g., "28/04/2026") on second line
- [ ] Hover over a future date with 0 hours → no tooltip appears
- [ ] Hover over a past date with 0 hours → tooltip appears showing "0h"
- [ ] Move mouse away from cell → tooltip disappears

**Status Persistence**
- [ ] Open index.html → add/edit task with status "In Progress"
- [ ] Reload page → task status persists (not cleared)
- [ ] Open Archive → edit a task's status
- [ ] Return to index.html → status change is reflected

**Status Badge Colors**
- [ ] By-task view: Progress card header badge shows gray for "soon"
- [ ] Progress card badge shows yellow for "inProgress"
- [ ] Progress card badge shows orange for "inPause"
- [ ] Progress card badge shows green for "done"
- [ ] Progress card badge shows blue for "checking"
- [ ] Progress card badge shows gray for "archived"
- [ ] Colors work in both light and dark modes

**Navigation**
- [ ] Open Analytics → click back button → navigates to index.html
- [ ] Open Archive → click back button → navigates to index.html
- [ ] URL bar shows clean paths (no folder exposure)

**General**
- [ ] Load existing analytics data — nothing broke
- [ ] Monthly selector still filters data correctly
- [ ] Task colors display correctly everywhere
- [ ] No console errors
- [ ] Dark mode toggle still works as expected

### Version Info
- Previous: beta-1.2.x
- Current: beta-1.3.0
- Type: Feature release (new filtering, improved UX, status persistence)
- Breaking changes: None

