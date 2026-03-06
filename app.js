// ── Storage helpers ───────────────────────────────────────
// Use chrome.storage.local in extension context, fall back to localStorage
const useChrome = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

async function storageGet(key, fallback) {
  try {
    if (useChrome) {
      const result = await chrome.storage.local.get(key);
      return result[key] !== undefined ? result[key] : fallback;
    }
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error('storageGet error:', e);
    return fallback;
  }
}

async function storageSet(key, value) {
  try {
    if (useChrome) {
      await chrome.storage.local.set({ [key]: value });
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    console.error('storageSet error:', e);
    showToast('Could not save — storage is full or unavailable');
  }
}

// ── Constants ──────────────────────────────────────────
const PALETTE = [
  '#ef4444','#f97316','#f59e0b','#eab308',
  '#84cc16','#22c55e','#14b8a6','#06b6d4',
  '#3b82f6','#6366f1','#8b5cf6','#a855f7',
  '#d946ef','#ec4899','#f43f5e','#78716c',
];

const COLOR_NAMES = {
  '#ef4444': 'Red', '#f97316': 'Orange', '#f59e0b': 'Amber', '#eab308': 'Yellow',
  '#84cc16': 'Lime', '#22c55e': 'Green', '#14b8a6': 'Teal', '#06b6d4': 'Cyan',
  '#3b82f6': 'Blue', '#6366f1': 'Indigo', '#8b5cf6': 'Violet', '#a855f7': 'Purple',
  '#d946ef': 'Fuchsia', '#ec4899': 'Pink', '#f43f5e': 'Rose', '#78716c': 'Stone',
};

const DEFAULT_TASKS = [
  { name: 'Exercise', color: '#22c55e' },
  { name: 'Read', color: '#3b82f6' },
  { name: 'Meditate', color: '#a855f7' },
  { name: 'Journal', color: '#f59e0b' },
];

const MAX_MONTHS_BACK = 24;

// ── State ─────────────────────────────────────────────
let tasks = [];
let completions = {};
let selectedDate = null;
let sheetOpen = false;
let darkMode = true;

// Current displayed month (year, month index 0-11)
const now = new Date();
let viewYear = now.getFullYear();
let viewMonth = now.getMonth();

// ── Dark mode ────────────────────────────────────────
function applyDarkMode() {
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  const toggle = document.getElementById('darkModeToggle');
  const knob = document.getElementById('darkModeKnob');
  if (toggle && knob) {
    toggle.setAttribute('aria-checked', darkMode);
    if (darkMode) {
      knob.classList.add('translate-x-5');
      knob.classList.remove('translate-x-0');
    } else {
      knob.classList.remove('translate-x-5');
      knob.classList.add('translate-x-0');
    }
  }
}

// ── Helpers ────────────────────────────────────────────
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function parseDate(str) {
  const [y,m,d] = str.split('-').map(Number);
  return new Date(y, m-1, d);
}

function ordinal(n) {
  if (n > 3 && n < 21) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

function formatDate(str) {
  const d = parseDate(str);
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const day = d.getDate();
  return `${weekday}, ${month} ${day}${ordinal(day)}`;
}

function dateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function showToast(message, type = 'error') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  const colors = type === 'error'
    ? 'bg-red-500/90 text-white'
    : 'bg-emerald-500/90 text-white';
  toast.className = `${colors} px-4 py-2 rounded-lg text-sm font-medium shadow-lg pointer-events-auto transition-all duration-300 opacity-0 translate-y-[-8px]`;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('opacity-0', 'translate-y-[-8px]');
  });
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-[-8px]');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function save() {
  storageSet('dt_tasks', tasks);
  storageSet('dt_completions', completions);
}

function getCompletions(date) {
  return completions[date] || [false, false, false, false];
}

// ── Streak calculation ────────────────────────────────
function calcStreak() {
  let streak = 0;
  const d = new Date();
  const todayComp = getCompletions(todayStr());
  if (!todayComp.every(Boolean)) d.setDate(d.getDate() - 1);
  while (true) {
    const ds = dateStr(d);
    const comp = getCompletions(ds);
    if (comp.every(Boolean)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

// ── Can navigate? ─────────────────────────────────────
function canGoNext() {
  const today = new Date();
  return !(viewYear === today.getFullYear() && viewMonth === today.getMonth());
}

function canGoPrev() {
  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth() - MAX_MONTHS_BACK, 1);
  const current = new Date(viewYear, viewMonth, 1);
  return current > minDate;
}

function isCurrentMonth() {
  const today = new Date();
  return viewYear === today.getFullYear() && viewMonth === today.getMonth();
}

// ── Render Legend ──────────────────────────────────────
function renderLegend() {
  const el = document.getElementById('legend');
  el.innerHTML = tasks.map(t => `
    <div class="flex items-center gap-1.5 md:gap-2">
      <div class="w-2.5 h-2.5 md:w-3 md:h-3 rounded-sm" style="background:${t.color}"></div>
      <span class="text-gray-500 dark:text-white/70">${t.name}</span>
    </div>
  `).join('');
}

// ── Render Month Navigation ───────────────────────────
function renderMonthNav() {
  const d = new Date(viewYear, viewMonth, 1);
  const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  document.getElementById('monthLabel').textContent = label;
  document.getElementById('prevMonth').disabled = !canGoPrev();
  document.getElementById('nextMonth').disabled = !canGoNext();
  const todayBtn = document.getElementById('todayBtn');
  if (isCurrentMonth()) {
    todayBtn.classList.add('hidden');
  } else {
    todayBtn.classList.remove('hidden');
  }
}

// ── Render Calendar Grid (single month) ───────────────
let prevViewYear = viewYear;
let prevViewMonth = viewMonth;

function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  const monthChanged = (viewYear !== prevViewYear || viewMonth !== prevViewMonth);
  prevViewYear = viewYear;
  prevViewMonth = viewMonth;
  const todayS = todayStr();
  const firstDay = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const dayLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const dayLabelsMobile = ['M','T','W','T','F','S','S'];

  let html = `<div>`;
  html += `<div class="grid grid-cols-7 gap-1 md:gap-2">`;

  for (let i = 0; i < 7; i++) {
    html += `<div class="text-[9px] md:text-xs text-gray-400 dark:text-white/50 text-center pb-1 md:pb-2">
      <span class="md:hidden">${dayLabelsMobile[i]}</span>
      <span class="hidden md:inline">${dayLabels[i]}</span>
    </div>`;
  }

  for (let e = 0; e < startDow; e++) {
    html += `<div></div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const comp = getCompletions(ds);
    const isToday = ds === todayS;
    const isSelected = ds === selectedDate;
    const future = ds > todayS;
    const doneCount = comp.filter(Boolean).length;
    const dateLabel = new Date(viewYear, viewMonth, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const cellLabel = `${dateLabel}, ${doneCount} of ${tasks.length} tasks completed${isToday ? ', today' : ''}`;

    html += `<div class="day-cell aspect-square rounded-sm md:rounded-md cursor-pointer relative ${isSelected ? 'ring-2 ring-white/60' : ''} ${isToday ? 'ring-2 ring-amber-400/60' : ''} ${future ? 'opacity-20 pointer-events-none' : ''} focus:outline-none focus:ring-2 focus:ring-white/60"
                  role="button" tabindex="${future ? -1 : 0}" aria-label="${cellLabel}"
                  data-date="${ds}">`;
    html += `<div class="grid grid-cols-2 grid-rows-2 w-full h-full rounded-sm md:rounded-md overflow-hidden">`;
    for (let t = 0; t < 4; t++) {
      const bg = comp[t] ? tasks[t].color : (darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)');
      html += `<div class="w-full h-full" style="background:${bg}"></div>`;
    }
    html += `</div>`;
    const allDone = comp.every(Boolean);
    html += `<span class="absolute inset-0 flex items-center justify-center text-xs md:text-base font-medium ${comp.some(Boolean) ? 'text-white/90 drop-shadow' : (darkMode ? 'text-white/60' : 'text-gray-400')}">${d}${allDone ? '<svg class="w-3 h-3 md:w-[18px] md:h-[18px] ml-px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>' : ''}</span>`;
    html += `</div>`;
  }

  html += `</div></div>`;
  grid.innerHTML = html;

  if (monthChanged) {
    grid.classList.remove('month-fade');
    void grid.offsetWidth;
    grid.classList.add('month-fade');
  }

  renderMonthNav();
}

// ── Select Day ────────────────────────────────────────
function selectDay(ds) {
  selectedDate = ds;
  renderCalendar();
  renderTaskList();
  openSheet();
}

// ── Deselect (close sheet) ────────────────────────────
function deselectDay() {
  selectedDate = null;
  closeSheet();
  renderCalendar();
}

// ── Render Task List (Bottom Sheet) ───────────────────
function renderTaskList() {
  if (!selectedDate) return;
  const el = document.getElementById('taskList');
  const comp = getCompletions(selectedDate);
  const doneCount = comp.filter(Boolean).length;

  document.getElementById('sheetDate').textContent =
    selectedDate === todayStr() ? 'Today' : formatDate(selectedDate);
  document.getElementById('sheetProgress').textContent = `${doneCount}/4`;

  el.innerHTML = tasks.map((t, i) => `
    <label class="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/8 transition-colors cursor-pointer group focus-within:ring-2 focus-within:ring-gray-400 dark:focus-within:ring-white/40">
      <div class="w-6 h-6 md:w-7 md:h-7 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
        ${comp[i] ? '' : 'border-gray-300 dark:border-white/20'}"
        style="${comp[i] ? `background:${t.color};border-color:${t.color}` : ''}">
        ${comp[i] ? '<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>' : ''}
      </div>
      <span class="flex-1 text-sm md:text-base font-medium ${comp[i] ? 'line-through text-gray-400 dark:text-white/40' : 'text-gray-900 dark:text-white/90'}">${t.name}</span>
      <div class="w-3 h-3 rounded-full shrink-0" style="background:${t.color}"></div>
      <input type="checkbox" class="hidden" ${comp[i] ? 'checked' : ''} data-task-index="${i}">
    </label>
  `).join('');

  // Attach change listeners (no inline handlers in extensions)
  el.querySelectorAll('input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', () => {
      toggleTask(parseInt(input.dataset.taskIndex));
    });
  });

  updateStreak();
}

function toggleTask(index) {
  if (!selectedDate) return;
  const comp = getCompletions(selectedDate);
  comp[index] = !comp[index];
  completions[selectedDate] = comp;
  save();
  renderTaskList();
  renderCalendar();
}

// ── Bottom Sheet Open/Close ───────────────────────────
function openSheet() {
  sheetOpen = true;
  document.getElementById('bottomSheet').classList.remove('closed');
}

function closeSheet() {
  sheetOpen = false;
  document.getElementById('bottomSheet').classList.add('closed');
}

// ── Streak Badge ──────────────────────────────────────
function updateStreak() {
  const streak = calcStreak();
  const badge = document.getElementById('streakBadge');
  if (streak > 0) {
    badge.textContent = `${streak} day${streak > 1 ? 's' : ''} streak`;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

// ── Settings ──────────────────────────────────────────
function renderSettings() {
  const el = document.getElementById('settingsTasks');
  el.innerHTML = tasks.map((t, i) => `
    <div class="space-y-2">
      <label for="taskName${i}" class="text-xs text-gray-400 dark:text-white/60 font-medium">Task ${i + 1}</label>
      <input id="taskName${i}" type="text" value="${t.name}" maxlength="20"
        class="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:border-gray-400 dark:focus:border-white/30 transition-colors"
        data-task-index="${i}">
      <div class="flex flex-wrap gap-2 pt-1">
        ${PALETTE.map(c => `
          <button class="color-swatch w-7 h-7 rounded-full ${c === t.color ? 'active' : ''}"
            style="background:${c};color:${c}"
            aria-label="${COLOR_NAMES[c] || c}${c === t.color ? ' (selected)' : ''}"
            data-task-index="${i}" data-color="${c}"></button>
        `).join('')}
      </div>
    </div>
  `).join('');

  // Attach listeners (no inline handlers)
  el.querySelectorAll('input[type="text"]').forEach(input => {
    input.addEventListener('input', () => {
      updateTaskName(parseInt(input.dataset.taskIndex), input.value);
    });
  });
  el.querySelectorAll('.color-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      updateTaskColor(parseInt(btn.dataset.taskIndex), btn.dataset.color);
    });
  });
}

function updateTaskName(index, name) {
  tasks[index].name = name || `Task ${index + 1}`;
  save();
  renderLegend();
  if (sheetOpen) renderTaskList();
}

function updateTaskColor(index, color) {
  tasks[index].color = color;
  save();
  renderSettings();
  renderLegend();
  renderCalendar();
  if (sheetOpen) renderTaskList();
}

// ── Day navigation (arrow keys) ──────────────────────
function navigateDay(offset) {
  const base = selectedDate || todayStr();
  const d = parseDate(base);
  d.setDate(d.getDate() + offset);
  const ds = dateStr(d);
  if (ds > todayStr()) return;
  if (d.getFullYear() !== viewYear || d.getMonth() !== viewMonth) {
    viewYear = d.getFullYear();
    viewMonth = d.getMonth();
  }
  selectedDate = ds;
  renderCalendar();
  renderTaskList();
  openSheet();
  const taskList = document.getElementById('taskList');
  taskList.classList.remove('sheet-fade');
  void taskList.offsetWidth;
  taskList.classList.add('sheet-fade');
}

// ── Event Listeners ──────────────────────────────────
function setupEventListeners() {
  // Close sheet button
  document.getElementById('closeSheet').addEventListener('click', (e) => {
    e.stopPropagation();
    deselectDay();
  });

  // Keyboard activation for day cells
  document.getElementById('calendarArea').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const dayCell = e.target.closest('.day-cell');
      if (dayCell && dayCell.dataset.date) {
        e.preventDefault();
        selectDay(dayCell.dataset.date);
      }
    }
  });

  // Click handling: day click vs outside click
  document.getElementById('calendarArea').addEventListener('click', (e) => {
    const dayCell = e.target.closest('.day-cell');
    if (dayCell && dayCell.dataset.date) {
      selectDay(dayCell.dataset.date);
      return;
    }
    if (sheetOpen) {
      deselectDay();
    }
  });

  // Prevent clicks inside the bottom sheet from closing it
  document.getElementById('bottomSheet').addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Month Navigation
  document.getElementById('prevMonth').addEventListener('click', () => {
    if (!canGoPrev()) return;
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });

  document.getElementById('nextMonth').addEventListener('click', () => {
    if (!canGoNext()) return;
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });

  document.getElementById('monthLabel').addEventListener('click', () => {
    const today = new Date();
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();
    renderCalendar();
  });

  document.getElementById('todayBtn').addEventListener('click', () => {
    const today = new Date();
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();
    renderCalendar();
  });

  // Scroll / Wheel to change month
  (function setupScrollNav() {
    const area = document.getElementById('calendarArea');
    let accumulated = 0;
    const THRESHOLD = 80;
    let cooldown = false;

    area.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (cooldown) return;

      accumulated += e.deltaY;

      if (accumulated > THRESHOLD) {
        if (canGoNext()) {
          cooldown = true;
          viewMonth++;
          if (viewMonth > 11) { viewMonth = 0; viewYear++; }
          renderCalendar();
          setTimeout(() => { cooldown = false; }, 250);
        }
        accumulated = 0;
      } else if (accumulated < -THRESHOLD) {
        if (canGoPrev()) {
          cooldown = true;
          viewMonth--;
          if (viewMonth < 0) { viewMonth = 11; viewYear--; }
          renderCalendar();
          setTimeout(() => { cooldown = false; }, 250);
        }
        accumulated = 0;
      }
    }, { passive: false });

    // Touch swipe on calendar area
    let touchStartY = 0;
    let touchActive = false;

    area.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
      touchActive = true;
    }, { passive: true });

    area.addEventListener('touchend', (e) => {
      if (!touchActive) return;
      touchActive = false;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dy) < 60) return;

      if (dy > 0 && canGoPrev()) {
        viewMonth--;
        if (viewMonth < 0) { viewMonth = 11; viewYear--; }
        renderCalendar();
      } else if (dy < 0 && canGoNext()) {
        viewMonth++;
        if (viewMonth > 11) { viewMonth = 0; viewYear++; }
        renderCalendar();
      }
    }, { passive: true });
  })();

  // Settings
  document.getElementById('settingsBtn').addEventListener('click', () => {
    renderSettings();
    applyDarkMode();
    document.getElementById('settingsOverlay').classList.remove('hidden');
  });

  document.getElementById('darkModeToggle').addEventListener('click', () => {
    darkMode = !darkMode;
    storageSet('dt_darkMode', darkMode);
    applyDarkMode();
    renderCalendar();
    renderLegend();
    if (sheetOpen) renderTaskList();
  });

  document.getElementById('closeSettings').addEventListener('click', () => {
    document.getElementById('settingsOverlay').classList.add('hidden');
  });

  document.getElementById('settingsOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      document.getElementById('settingsOverlay').classList.add('hidden');
    }
  });

  // Reset
  document.getElementById('resetBtn').addEventListener('click', async () => {
    if (confirm('Delete all data? This cannot be undone.')) {
      if (useChrome) {
        await chrome.storage.local.remove(['dt_tasks', 'dt_completions']);
      } else {
        localStorage.removeItem('dt_tasks');
        localStorage.removeItem('dt_completions');
      }
      tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
      completions = {};
      selectedDate = null;
      save();
      document.getElementById('settingsOverlay').classList.add('hidden');
      closeSheet();
      const today = new Date();
      viewYear = today.getFullYear();
      viewMonth = today.getMonth();
      renderLegend();
      renderCalendar();
      updateStreak();
    }
  });

  // Touch gesture for bottom sheet
  let sheetTouchStartY = 0;
  const sheet = document.getElementById('bottomSheet');
  sheet.addEventListener('touchstart', (e) => {
    sheetTouchStartY = e.touches[0].clientY;
  }, { passive: true });
  sheet.addEventListener('touchend', (e) => {
    const dy = e.changedTouches[0].clientY - sheetTouchStartY;
    if (dy > 50) deselectDay();
  }, { passive: true });

  // Keyboard: Escape, arrows
  document.addEventListener('keydown', (e) => {
    const inInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
    const settingsOpen = !document.getElementById('settingsOverlay').classList.contains('hidden');

    if (e.key === 'Escape') {
      if (settingsOpen) {
        document.getElementById('settingsOverlay').classList.add('hidden');
        return;
      }
      if (sheetOpen) deselectDay();
      return;
    }
    if (inInput || settingsOpen) return;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      navigateDay(-1);
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      navigateDay(1);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (canGoPrev()) {
        viewMonth--;
        if (viewMonth < 0) { viewMonth = 11; viewYear--; }
        if (sheetOpen) deselectDay();
        renderCalendar();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (canGoNext()) {
        viewMonth++;
        if (viewMonth > 11) { viewMonth = 0; viewYear++; }
        if (sheetOpen) deselectDay();
        renderCalendar();
      }
      return;
    }
  });
}

// ── Init ──────────────────────────────────────────────
async function init() {
  tasks = await storageGet('dt_tasks', DEFAULT_TASKS);
  completions = await storageGet('dt_completions', {});
  darkMode = await storageGet('dt_darkMode', true);

  applyDarkMode();
  setupEventListeners();
  renderLegend();
  renderCalendar();
  updateStreak();
}

init();
