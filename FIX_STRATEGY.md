# Fix Strategy: Date Display vs. Storage

## Core Requirement

**DISPLAY LAYER (User-facing)**: Always show DD/MM/YYYY
**STORAGE LAYER (localStorage)**: Always keep YYYY-MM-DD

This separation ensures consistency while making the code maintainable.

---

## Display vs. Storage Mapping

### Current State (Broken)

| Component | Storage | Display | Issue |
|-----------|---------|---------|-------|
| Settings modal (edit) | YYYY-MM-DD | Native date picker (locale-dependent) ❌ | Locale bug |
| Settings modal (add) | YYYY-MM-DD | DD/MM/YYYY ✅ | Works correctly |
| Analytics heatmap | YYYY-MM-DD | YYYY-MM-DD ❌ | Should be DD/MM/YYYY |
| Daily sheet | YYYY-MM-DD | Not shown ❌ | Missing |
| Chart.js labels | YYYY-MM-DD | Abbreviated (Sun 20) ❌ | Should show full date |

### Target State (Fixed)

| Component | Storage | Display | Fix Required |
|-----------|---------|---------|--------------|
| Settings modal (edit) | YYYY-MM-DD | DD/MM/YYYY ✅ | Replace type="date" |
| Settings modal (add) | YYYY-MM-DD | DD/MM/YYYY ✅ | Already correct |
| Analytics heatmap | YYYY-MM-DD | DD/MM/YYYY | Add formatting |
| Daily sheet | YYYY-MM-DD | DD/MM/YYYY (Due: 01 Jun) | Add display logic |
| Chart.js labels | YYYY-MM-DD | DD/MM/YYYY or formatted | Enhance labels |

---

## Implementation Plan

### Phase 1: Fix Input (Settings Modal)

**Goal**: Ensure all date inputs consistently show and accept DD/MM/YYYY

#### File: [settings-modal.js](settings-modal.js)

**Fix 1.1: Regular task editing (line 219)**
```javascript
// BEFORE (broken - uses native date input):
<input id="taskDelivery${i}" type="date" value="${t.deliveryDate || ''}"
  class="..."
  oninput="window._settingsModalUpdateTaskDeliveryDate(${i}, this.value)">

// AFTER (consistent text input):
<input id="taskDelivery${i}" type="text" placeholder="DD/MM/YYYY"
  value="${t.deliveryDate ? formatDateToDDMMYYYY(t.deliveryDate) : ''}"
  pattern="\d{2}/\d{2}/\d{4}" maxlength="10"
  class="..."
  oninput="window._settingsModalFormatDeliveryDate(${i}, this)"
  onchange="window._settingsModalUpdateTaskDeliveryDate(${i}, this.value)"
  onblur="window._settingsModalUpdateTaskDeliveryDate(${i}, this.value)">
```

**Why**: 
- Removes locale dependency from native date picker
- Uses same text input as "Add Task" form (which works)
- Consistent user experience

**Impact**: ✅ Fixes locale bug, ensures DD/MM/YYYY input

---

### Phase 2: Fix Display in Analytics

**Goal**: Show delivery dates as DD/MM/YYYY in heatmaps and popovers

#### File: [analytics.html](analytics.html)

**Fix 2.1: Heatmap cell data attributes (lines 816, 897, 1363)**
```javascript
// BEFORE:
data-delivery-date="${dateStr}"  // "2026-06-01" (YYYY-MM-DD stored)

// AFTER:
data-delivery-date="${dateStr}"  // Keep as-is for comparison
data-delivery-date-display="${formatDateToDDMMYYYY(dateStr)}"  // "01/06/2026" for display
```

**Fix 2.2: Popover content (around line 712)**
```javascript
// BEFORE:
`<div>${taskName}<br>${deliveryDate}<br>...`  // Shows "2026-06-01"

// AFTER:
`<div>${taskName}<br>${formatDateToDDMMYYYY(deliveryDate)}<br>...`  // Shows "01/06/2026"
```

**Fix 2.3: Create DD/MM/YYYY formatter function in analytics.html**
```javascript
function formatDateToDDMMYYYY(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}
```

**Impact**: ✅ Heatmap shows DD/MM/YYYY, consistent with storage

---

### Phase 3: Add Delivery Dates to Daily Sheet

**Goal**: Show delivery dates in the selected day view

#### File: [index.html](index.html)

**Fix 3.1: Display delivery date in sheet (around line 270)**

Add to each task item in the sheet:
```html
<!-- BEFORE:
<div class="text-sm">Exercise: 2.5h</div>
-->

<!-- AFTER: -->
<div class="text-sm flex items-center justify-between">
  <span>Exercise: 2.5h</span>
  <span class="text-xs text-gray-400" id="deliveryDate-0"></span>
</div>
<script>
  const deliveryDate = tasks[0].deliveryDate;
  if (deliveryDate) {
    const [year, month, day] = deliveryDate.split('-');
    const formatted = `${day}/${month}/${year}`;
    const isOverdue = deliveryDate < selectedDate;
    document.getElementById('deliveryDate-0').textContent = 
      `Due: ${formatted}${isOverdue ? ' ⚠️' : ''}`;
  }
</script>
```

**Impact**: ✅ Users can see task deadlines while working on daily view

---

### Phase 4: Enhance Chart.js Labels

**Goal**: Show full DD/MM/YYYY dates in chart tooltips and labels

#### File: [analytics.html](analytics.html)

**Fix 4.1: Linear chart labels (line 1753)**
```javascript
// BEFORE:
const displayDates = sortedDates.map((d, i) => {
  if (i % step !== 0) return '';
  const [year, month, day] = d.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return `${dayNames[date.getDay()]} ${day}`;  // "Sun 20"
});

// AFTER (option A - add month):
const displayDates = sortedDates.map((d, i) => {
  if (i % step !== 0) return '';
  const [year, month, day] = d.split('-').map(Number);
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const date = new Date(year, month - 1, day);
  return `${dayNames[date.getDay()]}\n${day} ${monthNames[month-1]}`;  // "Sun\n20 Apr"
});

// OR option B - full DD/MM/YYYY in tooltip:
// Keep abbreviated labels, add full date in tooltip callback
tooltip: {
  callbacks: {
    title: function(context) {
      const dateStr = sortedDates[context[0].dataIndex];
      return formatDateToDDMMYYYY(dateStr);  // "20/04/2026"
    }
  }
}
```

**Impact**: ✅ Users see full dates when hovering, not ambiguous "20"

---

### Phase 5: Create Shared Date Utility Module

**Goal**: Single source of truth for date formatting

#### File: [date-utils.js](date-utils.js) (NEW FILE)

```javascript
// Shared date utilities - use across index.html, analytics.html, settings-modal.js

/**
 * Parse YYYY-MM-DD string to JavaScript Date
 * Uses UTC to avoid timezone shifting
 */
function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * Convert YYYY-MM-DD to JavaScript Date (local timezone)
 */
function parseDateLocal(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return new Date(y, m - 1, d);
}

/**
 * Get today as YYYY-MM-DD string
 */
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Convert YYYY-MM-DD to DD/MM/YYYY for display
 */
function formatDateToDDMMYYYY(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Convert DD/MM/YYYY to YYYY-MM-DD for storage
 */
function formatDateToYYYYMMDD(dateStr) {
  if (!dateStr) return '';
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month}-${day}`;
}

/**
 * Format YYYY-MM-DD for display with day name
 * Example: "20/04/2026 (Sun)"
 */
function formatDateWithDay(dateStr) {
  if (!dateStr) return '';
  const date = parseDateLocal(dateStr);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const formatted = formatDateToDDMMYYYY(dateStr);
  return `${formatted} (${dayNames[date.getDay()]})`;
}

// Export for use across pages
```

**Impact**: ✅ Eliminates duplication, single source of truth

---

## Fix Priority & Effort Estimate

| Phase | Component | Impact | Effort | Time |
|-------|-----------|--------|--------|------|
| **1** | Settings input (locale bug) | 🔴 Critical | LOW | 15 min |
| **2** | Analytics heatmap display | 🟠 High | LOW | 30 min |
| **3** | Daily sheet delivery dates | 🟠 High | MEDIUM | 45 min |
| **4** | Chart.js labels | 🟡 Medium | MEDIUM | 30 min |
| **5** | Shared utilities | 🟡 Medium | MEDIUM | 30 min |

**Total estimated time: ~2.5 hours**

---

## Testing Checklist

After each fix:

- [ ] Set delivery date "01/06/2026" (June 1st) in settings
- [ ] Verify it appears on June 1st in heatmap (not January 6th)
- [ ] Verify all dates display as DD/MM/YYYY everywhere
- [ ] Check storage still uses YYYY-MM-DD in localStorage
- [ ] Test in different browser locales (if possible)
- [ ] Verify daily sheet shows delivery dates
- [ ] Verify Chart.js tooltips show full dates

---

## Files to Modify

1. ✏️ [settings-modal.js](settings-modal.js) — Line 219 (type="date" → type="text")
2. ✏️ [analytics.html](analytics.html) — Lines 712, 816, 897, 1363, 1753 (display formatting)
3. ✏️ [index.html](index.html) — Around line 270 (add delivery date display)
4. ✏️ [analytics.html](analytics.html) — Chart.js tooltip callbacks (add full dates)
5. 🆕 [date-utils.js](date-utils.js) — NEW shared utility module

---

## Related Documentation
- [FIXES_NEEDED.md](FIXES_NEEDED.md) — Original priority list
- [DATE_AUDIT.md](DATE_AUDIT.md) — Storage vs. display analysis
- [CHARTJS_DATE_AUDIT.md](CHARTJS_DATE_AUDIT.md) — Chart.js specific
