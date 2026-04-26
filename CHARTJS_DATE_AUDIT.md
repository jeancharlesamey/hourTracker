# Chart.js Date Usage Audit

## Overview

Chart.js is used in **analytics.html only** for three main visualizations:
1. **Linear Chart** (Intensity) — Stacked bar chart showing hours per day by task
2. **Repartition Chart** — Pie/doughnut showing task distribution by time
3. **Task Burn Chart** — Line chart showing remaining work vs. ideal burn for a task
4. **Task Daily Chart** — Bar chart showing daily hours for a specific task

---

## Data Flow: Storage → Chart.js

### Step 1: Data Source (localStorage)
```javascript
// From localStorage
completions = {
  "2026-04-20": [2.5, 1.0, 0.5, 0],
  "2026-04-21": [3.0, 2.0],
  "2026-04-22": [1.5, 2.5, 1.0],
  // ... more dates
}
```

**Format**: YYYY-MM-DD string keys, array of hour values per task

### Step 2: Date Collection
```javascript
function getAllDates() {
  const dates = Object.keys(completions)
    .filter(d => d <= todayStr())  // Only dates up to today
    .sort();                         // Sorted alphabetically (YYYY-MM-DD sorts correctly)
  return dates;
}
```

**Result**: Array of YYYY-MM-DD strings, sorted chronologically

### Step 3: Date Conversion for Display

#### 3a. Linear Chart (Monthly View)
```javascript
const displayDates = sortedDates.map((d, i) => {
  if (i % step !== 0) return '';  // Skip every nth date for spacing
  
  // Parse YYYY-MM-DD → JavaScript Date
  const [year, month, day] = d.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  // Format as: "Sun 20" or "Mon 21"
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${dayNames[date.getDay()]} ${day}`;
});
```

**Stored in**: Chart.js `labels` array
**Passed to Chart.js**: Array of abbreviated display strings
**Issue**: X-axis labels skip every nth date but ALL dates have data points

---

#### 3b. Task Burn Chart (Line Chart)
```javascript
// For task burn analysis
const allDates = getAllDates().filter(d => getHours(d, taskIndex) > 0);

// Create labels (NOT shown in code, but used internally)
// Format: YYYY-MM-DD preserved or converted to short format
const labels = allDates.map(d => {
  const [y, m, day] = d.split('-');
  return day;  // Just the day number: "20", "21", "22"
});
```

**Stored in**: Chart.js `labels` array
**Issue**: Only shows day-of-month, loses month/year context if viewing year-long data

---

#### 3c. Task Daily Chart (Monthly Bar Chart)
```javascript
const monthDates = allDates.filter(d => d.startsWith(`${yearStr}-${monthStr}`));

const labels = monthDates.map(d => {
  const [y, m, day] = d.split('-');
  return day;  // Just the day number: "1" through "31"
});
```

**Stored in**: Chart.js `labels` array
**Format**: Single digit or double digit (1-31)
**Context**: Month/year filtered before labeling, so dates are unambiguous

---

## Chart.js Configuration Details

### Linear Chart (Intensity)
```javascript
linearChartInstance = new Chart(ctx.getContext('2d'), {
  type: 'bar',
  data: {
    labels: displayDates,        // ["Sun 20", "Mon 21", "Tue 22", ...]
    datasets: datasets           // One dataset per task
  },
  options: {
    scales: {
      x: { stacked: true, ticks: { font: { size: 11 } } },
      y: { stacked: true, max: maxCap * 1.2 }
    }
  }
});
```

**Data Structure**:
- Labels are ABBREVIATED: "Sun 20" (day-of-week + day-of-month)
- All dates included in data, but not all shown as labels (controlled by `step`)
- X-axis ticks are SPARSE (every nth label to avoid crowding)

**Issue**: Mismatch between data points and visible labels can confuse users

---

### Task Burn Chart (Line Chart)
```javascript
taskBurnChartInstance = new Chart(ctx, {
  type: 'line',
  data: {
    labels: labels,              // ["20", "21", "22", ...] or ["20 Apr", ...] ?
    datasets: [
      { label: 'Remaining', data: actualData, ... },
      { label: 'Ideal', data: idealData, ... }
    ]
  }
});
```

**Data Points**: 
- X-axis: All activity dates for the task
- Y-axis: Remaining hours (estimate - accumulated work)
- Includes "Ideal" burn line if estimate + deliveryDate exist

**Date Context**: Labels show only day-of-month, unclear if spanning multiple months

---

### Task Daily Chart (Monthly Bar Chart)
```javascript
taskDailyChartInstance = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ["1", "2", "3", ..., "31"],  // Day-of-month only
    datasets: [{ label: task.name, data: monthData, ... }]
  }
});
```

**Filtered Scope**: 
- Only dates in `linearViewYear`-`linearViewMonth`
- No month/year label needed because context is already filtered
- Clean, simple labels work well here

---

## Date Format Issues in Chart.js

### Issue 1: Missing Full Date Context in Labels
```
❌ Current: "Sun 20" or just "20"
✅ Better: "Sun 20 Apr" or "2026-04-20" in title
```

When users view charts spanning multiple months, abbreviated labels are confusing.

### Issue 2: Delivery Date Not Shown on Burn Chart
```javascript
// In renderTaskBurnChart():
let deliveryDate = task.deliveryDate || '';  // YYYY-MM-DD

// ❌ Date is parsed but NOT displayed on X-axis
const deliveryPoint = deliveryDate ? parseDate(deliveryDate) : null;

// Should add visual marker (vertical line) at delivery date
// Currently missing!
```

**Impact**: Users can't see where the delivery deadline falls on the burn chart

### Issue 3: Inconsistent Date Parsing
```javascript
// Linear Chart
const [year, month, day] = d.split('-').map(Number);
const date = new Date(year, month - 1, day);  // ✅ Correct

// Daily Chart
const [y, m, day] = d.split('-');              // ❌ Strings, not parsed
return day;                                     // Uses string directly
```

Inconsistent parsing could cause issues with timezone-sensitive operations.

### Issue 4: No Month Boundaries Visible
Charts spanning multiple months don't visually separate them:
```
Labels:
[Sun 28, Mon 29, Tue 30, Wed 1, Thu 2, Fri 3]
 └─────────── March ──────────┘ └─── April ───┘

User confusion: Where does one month end?
```

---

## Date-Related Data Structures

### Completions Object (Source of Truth)
```javascript
completions = {
  "2026-04-20": [2.5, 1.0, 0.5, 0],    // 4 tasks
  "2026-04-21": [3.0, 2.0],            // 2 tasks
  "2026-04-22": [1.5, 2.5, 1.0],       // 3 tasks
  // ... continues
}
```

**Key format**: YYYY-MM-DD (always 10 characters, sortable)
**Value**: Array indexed by task index (position in tasks array)

### Date Filtering (Pre-Chart.js)
```javascript
// Month filtering
const yearStr = linearViewYear.toString();
const monthStr = String(linearViewMonth + 1).padStart(2, '0');
sortedDates = sortedDates.filter(d => d.startsWith(`${yearStr}-${monthStr}`));

// Today filtering
const allDates = Object.keys(completions)
  .filter(d => d <= todayStr())
  .sort();
```

**Both use string comparison** — works correctly because YYYY-MM-DD format is lexicographically sortable

---

## Chart.js Plugin for Delivery Date Visualization

Currently missing in burn chart — here's what could be added:

```javascript
// Custom plugin to draw delivery date line
const deliveryDatePlugin = {
  id: 'deliveryDateLine',
  afterDatasetsDraw(chart) {
    if (!deliveryDate) return;
    
    // Find position of delivery date on X-axis
    const deliveryIndex = labels.indexOf(deliveryDate);
    const xPixel = chart.scales.x.getPixelForValue(deliveryIndex);
    
    const ctx = chart.ctx;
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(xPixel, chart.scales.y.top);
    ctx.lineTo(xPixel, chart.scales.y.bottom);
    ctx.stroke();
  }
};
```

---

## Recommendations

### Priority 1 (Bug Prevention)
1. **Add delivery date marker** to burn chart (vertical line at deadline)
2. **Consistent date parsing** — use Number() for month/day consistently
3. **Preserve full date context** — store YYYY-MM-DD in labels when hovering

### Priority 2 (UX Improvement)
1. **Month separator lines** — visually divide months in linear chart
2. **Full date in tooltips** — show "20 April 2026" not just "20"
3. **Visible axis labels for all month boundaries** — even if data-heavy

### Priority 3 (Performance)
1. **Cache formatted labels** — don't recompute on every render
2. **Store computed dates** — cache monthly aggregations in localStorage
3. **Lazy-load charts** — only render visible tabs

---

## Files Involved
- **analytics.html** (lines 939-1150) — All three chart rendering functions
- **Chart.js library** (CDN) — No local modifications
- **Data**: completions object from localStorage `dt_completions`
- **Metadata**: task.deliveryDate from `dt_tasks`

---

## Timeline of Date Transformation

```
STORAGE LAYER (localStorage)
  ↓ YYYY-MM-DD (keys)
  ↓
getAllDates()
  ↓ Array of YYYY-MM-DD strings, filtered & sorted
  ↓
Date Filtering (month/year view)
  ↓ String filtering by prefix
  ↓
Date Conversion for Display
  ├─→ Linear: split('-') → new Date() → dayName + day
  ├─→ Burn: day-of-month only
  └─→ Daily: day-of-month only
  ↓
Chart.js labels array
  ↓
DISPLAY (X-axis labels in charts)
```
