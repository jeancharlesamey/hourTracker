# Date Storage vs. Display Audit

## Summary
The app uses **YYYY-MM-DD** format as the canonical storage format across all layers (localStorage, state, and display). However, there are inconsistencies in how dates are converted and displayed, and some gaps in the caching strategy.

---

## Storage Layer

### 1. **localStorage** (Primary persistence)

| Key | Format | Content | Used By |
|-----|--------|---------|---------|
| `dt_tasks` | JSON string | Tasks array with `deliveryDate` field | index.html, analytics.html, settings-modal.js |
| `dt_completions` | JSON string | Object: `{ "YYYY-MM-DD": [hours, ...] }` | index.html, analytics.html |
| `dt_maxCap` | Plain number | Daily hours cap (e.g., "7.5") | index.html, analytics.html |
| `dt_darkMode` | Plain string | "true" or "false" | index.html, analytics.html |
| `dt_lastFill` | Timestamp (milliseconds) | Last recorded completion time | index.html only |
| `dt_lastFillDay` | YYYY-MM-DD string | Last day a task was logged | index.html only |

### 2. **In-Memory State** (JavaScript variables)
Both pages maintain their own copies:
- `tasks` — array of task objects
- `completions` — object with YYYY-MM-DD keys and array of hours values
- `maxCap` — numeric daily cap
- `darkMode` — boolean flag

These are synced to localStorage via `save()` function in both pages.

### 3. **Delivery Dates (Task Metadata)**
Stored in `dt_tasks` within each task object:
```javascript
{
  name: "Exercise",
  color: "green",
  estimate: "",
  deliveryDate: "2026-04-26",  // YYYY-MM-DD format
  jiraLink: ""
}
```

---

## Display Layer

### **index.html** (Main tracker)

| Component | Data Source | Storage Format | Display Format | Function |
|-----------|------------|-----------------|-----------------|----------|
| **Selected Date Header** | `selectedDate` variable | YYYY-MM-DD | "Wednesday, April 26th" | `formatDate()` |
| **Month Label** | `viewYear`, `viewMonth` | Numbers | "April 2026" | `toLocaleDateString('en-US', { month: 'long', year: 'numeric' })` |
| **Calendar Grid** | `viewYear`, `viewMonth` | Numbers | Day number only (1-31) | Direct display |
| **Sheet Date** | `selectedDate` | YYYY-MM-DD | "Today" or formatted date | `formatDate()` |

**Key Functions:**
- `parseDate(str)` — Converts YYYY-MM-DD → JavaScript Date object
- `formatDate(str)` — Converts YYYY-MM-DD → "Wednesday, April 26th"
- `dateStr()` — Converts JavaScript Date → YYYY-MM-DD

### **analytics.html** (Analytics view)

| Component | Data Source | Storage Format | Display Format | Function |
|-----------|------------|-----------------|-----------------|----------|
| **Delivery Date Column** | `task.deliveryDate` | YYYY-MM-DD | YYYY-MM-DD (raw) | Direct display in table/popover |
| **Delivery Status Popover** | `task.deliveryDate` | YYYY-MM-DD | YYYY-MM-DD + status text | `setupDeliveryDatePopovers()` |
| **Historical Data Cards** | completions object | YYYY-MM-DD (keys) | Month-based aggregation | JavaScript loops |

**Key Functions:**
- `parseDate(dateStr)` — Converts YYYY-MM-DD → JavaScript Date object
- `getDeliveryDatesForDate(dateStr)` — Filters tasks with matching delivery date
- `calculateDaysLate(deliveryDateStr, activityDateStr)` — Calculates days overdue

### **settings-modal.js** (Task configuration)

| Component | Data Source | Storage Format | Display Format | Function |
|-----------|------------|-----------------|-----------------|----------|
| **Delivery Date Input (native date)** | `t.deliveryDate` | YYYY-MM-DD | Date input picker shows native format | HTML5 `<input type="date">` |
| **Delivery Date Input (text)** | `t.deliveryDate` | YYYY-MM-DD | DD/MM/YYYY with formatting | Text input + `formatDateToDDMMYYYY()` |
| **Add Task Form** | New task creation | N/A | DD/MM/YYYY | `formatDateToDDMMYYYY()` |

**Key Functions:**
- `formatDateToDDMMYYYY(dateStr)` — Converts YYYY-MM-DD → DD/MM/YYYY (line 602-605)
- `formatDateToYYYYMMDD(dateStr)` — Converts DD/MM/YYYY → YYYY-MM-DD (line 608-613)
- `_settingsModalUpdateTaskDeliveryDate()` — Handles both input formats (line 546-566)
- `_settingsModalFormatDeliveryDate()` — Auto-formats DD/MM/YYYY input (line 618-629)

---

## Issues & Inconsistencies

### 1. **Delivery Date Display Inconsistency**
- **Settings Modal**: Shows DD/MM/YYYY format when adding/editing tasks
- **Analytics Page**: Shows raw YYYY-MM-DD format in the delivery date column
- **Expected**: Should be consistent across the app

### 2. **Missing Date Display in Sheet** (index.html)
- When a day is selected in the calendar, the sheet header shows "Today" or formatted date
- **But**: No visibility into task delivery dates when viewing daily completions
- **Note**: Task details may not show delivery dates in the sheet

### 3. **Local Cache Not Fully Optimized**
Currently cached in localStorage:
- ✅ `dt_tasks` — complete task objects
- ✅ `dt_completions` — hour logs
- ✅ `dt_maxCap` — daily cap
- ✅ `dt_darkMode` — dark mode preference
- ✅ `dt_lastFill` — last completion timestamp
- ✅ `dt_lastFillDay` — last day worked

**Not cached (computed on-the-fly):**
- Week aggregations (analytics)
- Month aggregations (analytics)
- Working days calculations
- Days late calculations

### 4. **Service Worker (sw.js) Not Caching API Data**
- File exists but minimal functionality
- No caching strategy for computed analytics data
- PWA offline support is limited

### 5. **Date Parsing Edge Cases**
Both `index.html` and `analytics.html` use similar `parseDate()` functions:
```javascript
function parseDate(str) {
  const [y, m, d] = str.split('-');
  return new Date(y, m-1, d);
}
```
**Issue**: Uses local timezone, may cause date shifting near midnight or across timezones

### 6. **Timestamp Inconsistency**
- `dt_lastFill` — Stored as milliseconds (JavaScript timestamp)
- `dt_lastFillDay` — Stored as YYYY-MM-DD string
- **Why?** Should both use the same format for consistency

---

## Date Format Summary Table

| Format | Usage | Storage Layer | Display Layer | Risk Level |
|--------|-------|----------------|----------------|------------|
| **YYYY-MM-DD** | Canonical storage | ✅ All storage | ✅ Primary (YYYY-MM-DD keys in completions) | 🟢 Low |
| **JavaScript Date objects** | Calculations | ✅ In-memory only | ✅ Input for formatting functions | 🟢 Low |
| **Formatted strings** | Human-readable | ❌ Not stored | ✅ Sheet header, month label, popovers | 🟡 Medium |
| **DD/MM/YYYY** | User input | ❌ Temporary only | ✅ Settings modal only | 🟢 Low |
| **Millisecond timestamps** | Activity tracking | ✅ dt_lastFill only | ❌ Not displayed | 🔴 High (inconsistent with other dates) |

---

## Recommendations

### Priority 1 (Consistency)
1. **Standardize delivery date display**: Use YYYY-MM-DD everywhere or convert all to readable format
2. **Fix timestamp format**: Convert `dt_lastFill` to YYYY-MM-DD string format like `dt_lastFillDay`
3. **Timezone-aware parsing**: Use `parseDate()` to handle UTC or explicit timezone handling

### Priority 2 (Performance)
1. **Cache computed analytics**: Store week/month aggregations in localStorage
2. **Extend service worker**: Implement proper offline caching strategy
3. **Lazy-load analytics**: Cache daily calculations on first view

### Priority 3 (UX)
1. **Display delivery dates in daily sheet**: Show task deadlines when viewing day's completions
2. **Consistent date formatting**: Use user's locale preference globally
3. **Add visual date indicators**: Highlight overdue dates in calendar view

---

## Data Flow Diagram

```
┌─────────────────┐
│  HTML5 inputs   │ (date picker, text input)
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  settings-modal.js          │
│  Format conversion:         │
│  - DD/MM/YYYY → YYYY-MM-DD │
│  - YYYY-MM-DD → DD/MM/YYYY │
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  In-Memory State (both pages)    │
│  - tasks array (YYYY-MM-DD dates)│
│  - completions object            │
│  - maxCap, darkMode              │
└────────┬─────────────────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
┌──────────┐  ┌──────────────────────────┐
│localStorage  Display Formatting      │
│ (persistent)  formatDate(),           │
│              toLocaleDateString(),    │
│              parseDate()              │
│              ├─ index.html            │
│              └─ analytics.html        │
└──────────┘  └──────────────────────────┘
    ▲
    │
    └──── save() triggered by onSave callback
```

---

## Files Involved
- **index.html** — Calendar view with daily tracking
- **analytics.html** — Historical data and delivery date tracking
- **settings-modal.js** — Task configuration and delivery date input
- **month-modal.js** — Month summary display (generic modal)
- **localStorage** — Primary data persistence
- **sw.js** — Service worker (minimal date handling)
