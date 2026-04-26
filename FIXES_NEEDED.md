# Priority Fixes Based on Both Audits

## P0: Critical Issues (Breaking Functionality)

### 0. **URGENT: Delivery Date Locale Mismatch Bug**
- **Impact**: User sets delivery date to "01/06/2026" (June 1st DD/MM), appears on January 6th heatmap
- **Root Cause**: Native HTML5 `<input type="date">` respects browser/OS locale, not always YYYY-MM-DD
  - If user's system is set to US locale (MM/DD), the date picker interprets "01/06" as January 6th
  - But code stores it as-is, creating mismatch
- **Locations**:
  - [settings-modal.js:219](settings-modal.js#L219) — Regular task editing uses `type="date"`
  - [settings-modal.js:474](settings-modal.js#L474) — Add task form uses `type="text"` (works correctly)
  - [analytics.html:883](analytics.html#L883) — Heatmap comparison: `task.deliveryDate === dateStr`
- **Fix**: Replace native date input with text input (DD/MM/YYYY) everywhere for consistency
- **Effort**: LOW (remove type="date", use text input with formatting)
- **Example**:
  ```javascript
  // BROKEN (current - line 219):
  <input id="taskDelivery${i}" type="date" value="${t.deliveryDate || ''}">
  
  // FIXED:
  <input id="taskDelivery${i}" type="text" placeholder="DD/MM/YYYY" 
         value="${t.deliveryDate ? formatDateToDDMMYYYY(t.deliveryDate) : ''}"
         oninput="window._settingsModalFormatDeliveryDate(${i}, this)"
         onchange="window._settingsModalUpdateTaskDeliveryDate(${i}, this.value)">
  ```

---

## P0: Critical Issues (Breaking Functionality)

### 1. **Delivery Date Marker Missing on Burn Chart**
- **Impact**: Users can't see when a task deadline is — the main purpose of delivery dates
- **Location**: [analytics.html:939-1050](analytics.html#L939-L1050) `renderTaskBurnChart()`
- **Fix**: Add vertical line (or marker) at delivery date position on the burn chart
- **Effort**: LOW (add custom Chart.js plugin)
- **Why critical**: Defeats purpose of tracking deadline vs. actual progress

```javascript
// MISSING: Visual indicator of delivery date on X-axis
// Currently only calculated for status text, not rendered
```

---

### 2. **Delivery Date Display Inconsistency (UX Breaking)**
- **Storage Format**: YYYY-MM-DD (correct)
- **Settings Modal Shows**: DD/MM/YYYY (via `formatDateToDDMMYYYY()`)
- **Analytics Shows**: YYYY-MM-DD (raw in tables)
- **Index.html Shows**: Not shown at all in daily view
- **Impact**: Confusing user experience, formats don't match across pages
- **Locations**:
  - [settings-modal.js:474, 602-605](settings-modal.js#L474-L605) — Shows DD/MM/YYYY
  - [analytics.html:649, 712](analytics.html#L649-L712) — Shows YYYY-MM-DD
  - [index.html:~800s](index.html#L800) — Not shown
- **Fix**: Standardize to ONE format across all pages
- **Effort**: MEDIUM (requires audit of all display locations)
- **Decision Needed**: Which format? Recommendation: `YYYY-MM-DD` (canonical) or `DD MMM YYYY` (readable)

---

### 3. **Missing Delivery Dates in Daily Sheet** (index.html)
- **Current State**: When you select a day, the sheet shows task hours logged but NOT task deadlines
- **Impact**: Users can't see if they're working on overdue tasks from the main tracker
- **Location**: [index.html:250-280](index.html#L250-L280) — Sheet HTML rendering
- **Fix**: Add delivery date display alongside task names in sheet
- **Effort**: MEDIUM (requires UI changes + date logic)
- **Example**:
  ```
  ❌ Current:
  - Exercise: 2.5h
  - Read: 1.0h
  
  ✅ Better:
  - Exercise: 2.5h (Due: Apr 28)
  - Read: 1.0h (Due: Apr 25 - OVERDUE!)
  ```

---

## P1: Data Integrity Issues

### 4. **Timestamp Format Inconsistency**
- **Problem**: `dt_lastFill` stored as milliseconds (JavaScript timestamp), `dt_lastFillDay` as YYYY-MM-DD string
- **Locations**: 
  - [index.html:416-418](index.html#L416-L418) — Reading timestamp
  - [index.html:606-609](index.html#L606-L609) — Setting timestamp
- **Impact**: Mixed formats make code harder to maintain, potential bugs in date comparisons
- **Fix**: Convert `dt_lastFill` to YYYY-MM-DD string format
- **Effort**: LOW (simple find-replace + conversion function)
- **Before**:
  ```javascript
  localStorage.setItem('dt_lastFill', Date.now());  // 1714000000000
  ```
- **After**:
  ```javascript
  localStorage.setItem('dt_lastFill', todayStr());  // "2026-04-25"
  ```

---

### 5. **Timezone-Aware Date Parsing**
- **Problem**: `parseDate(str)` uses local timezone, can shift dates near midnight or across DST boundaries
- **Locations**: 
  - [index.html:333-335](index.html#L333-L335)
  - [analytics.html:534-536](analytics.html#L534-L536)
- **Fix**: Use UTC-aware parsing or document timezone assumptions
- **Effort**: LOW-MEDIUM (requires testing across timezones)
- **Current Code**:
  ```javascript
  function parseDate(str) {
    const [y, m, d] = str.split('-');
    return new Date(y, m-1, d);  // ❌ Uses local timezone
  }
  ```
- **Better Code**:
  ```javascript
  function parseDate(str) {
    const [y, m, d] = str.split('-');
    return new Date(Date.UTC(y, m-1, d));  // ✅ UTC
  }
  ```

---

### 6. **Inconsistent Date Parsing in Chart.js**
- **Problem**: Linear chart uses `map(Number)`, daily chart uses raw strings
- **Locations**:
  - [analytics.html:1753-1759](analytics.html#L1753-L1759) — Linear: `split('-').map(Number)`
  - [analytics.html:1085-1087](analytics.html#L1085-L1087) — Daily: `split('-')` (no map)
- **Fix**: Standardize to `split('-').map(Number)` everywhere
- **Effort**: LOW (find-replace)

---

## P2: UX/Display Issues

### 7. **Ambiguous Chart Labels (Multi-Month Views)**
- **Problem**: Linear chart shows only "Sun 20", "Mon 21" — doesn't indicate which month
- **Location**: [analytics.html:1753-1759](analytics.html#L1753-L1759) — `displayDates` mapping
- **Impact**: Users can't tell which dates are from which month when chart spans January→February transition
- **Fix**: Add month indicator or visual month separator
- **Effort**: MEDIUM (requires Chart.js plugin or label restructuring)
- **Options**:
  ```
  Option A: Enhance labels
  "Sun 20" → "Sun 20 Apr"
  
  Option B: Add visual separator
  [vertical line at month boundaries]
  
  Option C: Add month title above sections
  "April" [chart data] "May" [chart data]
  ```

---

### 8. **Chart X-Axis Label Mismatch**
- **Problem**: Linear chart uses sparse labels (every nth) but ALL dates have data
- **Location**: [analytics.html:1743-1765](analytics.html#L1743-L1765) — `step` variable
- **Impact**: Users may think missing labels = missing data
- **Fix**: Either show all labels (rotate 45°) or add tooltip clarification
- **Effort**: LOW-MEDIUM (CSS rotation or Chart.js plugin)

---

## P3: Performance/Caching Issues

### 9. **Computed Analytics Not Cached**
- **Problem**: Week/month aggregations recalculated every page load
- **Locations**:
  - [analytics.html:549-570](analytics.html#L549-L570) — `getWeekDates()`
  - [analytics.html:571-592](analytics.html#L571-L592) — `getYearDates()`
- **Fix**: Cache computed data in localStorage with invalidation date
- **Effort**: MEDIUM (requires careful cache invalidation logic)
- **Impact**: Faster page loads, especially on large datasets

---

### 10. **Service Worker Not Utilized**
- **Current State**: `sw.js` exists but is minimal, doesn't cache computed data
- **Location**: [sw.js](sw.js)
- **Fix**: Implement caching strategy for:
  - Computed week/month summaries
  - Chart.js rendered data
  - Offline analytics view
- **Effort**: HIGH (requires service worker refactor)
- **Impact**: PWA offline functionality, performance improvement

---

## P4: Code Quality Issues

### 11. **Delivery Date Format Conversion Duplication**
- **Problem**: Multiple places duplicate date parsing logic
- **Locations**: 
  - [settings-modal.js:602-614](settings-modal.js#L602-L614)
  - [index.html:333-335](index.html#L333-L335)
  - [analytics.html:534-536](analytics.html#L534-L536)
  - Multiple split('-') patterns in Chart.js code
- **Fix**: Create shared utility module with single `parseDate()`, `formatDate()`, etc.
- **Effort**: MEDIUM (refactor, test)
- **Benefit**: Single source of truth, easier maintenance

---

### 12. **Date Display Not Using User Locale**
- **Problem**: Hardcoded 'en-US' locale in `toLocaleDateString()` calls
- **Locations**: 
  - [index.html:358-360, 674, 728](index.html#L358-L674-L728)
  - [analytics.html throughout](analytics.html)
- **Fix**: Use browser's locale or add locale preference to settings
- **Effort**: LOW (replace hardcoded strings with `navigator.language`)
- **Impact**: Better UX for non-English users

---

## Summary by Effort vs. Impact

| Priority | Issue | Effort | Impact | Recommended Action |
|----------|-------|--------|--------|-------------------|
| **P0** | Delivery date marker on burn chart | LOW | CRITICAL | Fix immediately |
| **P0** | Delivery date display consistency | MEDIUM | CRITICAL | Decide format, fix all locations |
| **P0** | Missing delivery dates in daily sheet | MEDIUM | HIGH | Add to sheet UI |
| **P1** | Timestamp format inconsistency | LOW | MEDIUM | Standardize to YYYY-MM-DD |
| **P1** | Timezone-aware parsing | LOW-MED | MEDIUM | Use UTC parsing |
| **P1** | Inconsistent Chart.js parsing | LOW | LOW | Standardize |
| **P2** | Ambiguous chart labels | MEDIUM | MEDIUM | Add month context |
| **P2** | Chart label mismatch | LOW-MED | LOW | Visual fix |
| **P3** | Computed data not cached | MEDIUM | MEDIUM | Cache in localStorage |
| **P3** | Service worker unused | HIGH | MEDIUM | Implement offline caching |
| **P4** | Date logic duplication | MEDIUM | LOW | Create utility module |
| **P4** | Hardcoded locale | LOW | LOW | Use browser locale |

---

## Recommended Fix Order (by impact & dependencies)

1. **[FIRST]** Delivery date marker on burn chart (P0, LOW effort, high visibility)
2. **[SECOND]** Standardize delivery date display format (P0, decide format first)
3. **[THIRD]** Add delivery dates to daily sheet (P0, builds on #2)
4. **[FOURTH]** Fix timestamp format (P1, low effort, good maintenance)
5. **[FIFTH]** Fix timezone parsing (P1, prevents future bugs)
6. **[SIXTH]** Create shared date utilities module (P4, enables other improvements)
7. **[SEVENTH]** Add month context to charts (P2, improves UX)
8. **[EIGHTH]** Cache computed analytics (P3, improves performance)

---

## Related Documentation
- [DATE_AUDIT.md](DATE_AUDIT.md) — Storage vs. display analysis
- [CHARTJS_DATE_AUDIT.md](CHARTJS_DATE_AUDIT.md) — Chart.js specific issues
