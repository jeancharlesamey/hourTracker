// Settings Modal - Reusable settings + task management component
// Usage: SettingsModal.init(options), then SettingsModal.open()

const PALETTE = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose', 'zinc'];

const COLOR_HEX = {
  'red': '#ef4444', 'orange': '#f97316', 'amber': '#f59e0b', 'yellow': '#eab308',
  'lime': '#84cc16', 'green': '#22c55e', 'emerald': '#10b981', 'teal': '#14b8a6',
  'cyan': '#06b6d4', 'sky': '#0ea5e9', 'blue': '#3b82f6', 'indigo': '#6366f1',
  'violet': '#8b5cf6', 'purple': '#a855f7', 'fuchsia': '#d946ef', 'pink': '#ec4899',
  'rose': '#f43f5e', 'zinc': '#71717a',
};

const COLOR_NAMES = {
  'red': 'Red', 'orange': 'Orange', 'amber': 'Amber', 'yellow': 'Yellow',
  'lime': 'Lime', 'green': 'Green', 'emerald': 'Emerald', 'teal': 'Teal',
  'cyan': 'Cyan', 'sky': 'Sky', 'blue': 'Blue', 'indigo': 'Indigo',
  'violet': 'Violet', 'purple': 'Purple', 'fuchsia': 'Fuchsia', 'pink': 'Pink',
  'rose': 'Rose', 'zinc': 'Zinc',
};

const DEFAULT_TASKS = [
  { name: 'Exercise', color: 'green', estimate: '', deliveryDate: '', jiraLink: '', status: '', idOpus: '', estimateHistory: [] },
  { name: 'Read', color: 'blue', estimate: '', deliveryDate: '', jiraLink: '', status: '', idOpus: '', estimateHistory: [] },
  { name: 'Meditate', color: 'purple', estimate: '', deliveryDate: '', jiraLink: '', status: '', idOpus: '', estimateHistory: [] },
  { name: 'Journal', color: 'amber', estimate: '', deliveryDate: '', jiraLink: '', status: '', idOpus: '', estimateHistory: [] },
];

const SettingsModal = {
  config: {
    getTasks: null,
    setTasks: null,
    getCompletions: null,
    setCompletions: null,
    getMaxCap: null,
    setMaxCap: null,
    onSave: null,
    onTasksChanged: null,
    onSheetOpen: null,
    onReload: null,
    showAddTask: true,
    showDailyCap: true,
  },

  state: {
    isAddTaskMode: false,
    pendingDeleteIndex: null,
    pendingDeleteCallback: null,
    pageNeedsReload: false,
  },

  initialized: false,

  init(options = {}) {
    Object.assign(this.config, options);

    // Inject CSS if not already done
    if (!document.getElementById('settings-modal-styles')) {
      const style = document.createElement('style');
      style.id = 'settings-modal-styles';
      style.textContent = `
        .settings-overlay {
          transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .settings-overlay.hidden {
          opacity: 0;
          visibility: hidden;
        }

        .color-swatch {
          transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .color-swatch:hover { transform: scale(1.2); }
        .color-swatch.active {
          box-shadow: 0 0 0 2px #fff, 0 0 0 4px currentColor;
          transform: scale(1.15);
        }

        .hold-btn-fill {
          transform: scaleX(0);
          transform-origin: left;
          transition: none;
        }
        .hold-btn.holding .hold-btn-fill {
          transform: scaleX(1);
          transition: transform 3s linear;
        }
        .hold-btn.filled .hold-btn-fill {
          transform: scaleX(1);
          transition: none;
        }
      `;
      document.head.appendChild(style);
    }

    // Inject HTML if not already done
    if (!document.getElementById('settingsOverlay')) {
      this._injectHTML();
    }

    // Wire event listeners
    this._wireEventListeners();
    this.initialized = true;
  },

  _injectHTML() {
    const html = `
      <div id="settingsOverlay" role="dialog" aria-modal="true" aria-label="Settings" class="settings-overlay hidden fixed inset-0 z-40">
        <div id="settingsBackdrop" class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div class="settings-panel absolute top-0 right-0 h-full bg-card dark:bg-card-dark shadow-2xl overflow-y-auto transition-colors duration-300">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 id="settingsTitle" class="text-lg font-bold">Settings</h2>
              <button id="closeSettings" aria-label="Close settings" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
                <img src="./icons/close-icon.svg" alt="" class="w-5 h-5 text-gray-400 dark:text-white/50" aria-hidden="true">
              </button>
            </div>
            <div id="settingsTasks" class="space-y-5"></div>
            <div id="settingsDeleteSection" class="mt-3">
              <button id="resetBtn" class="hold-btn w-full py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium select-none relative overflow-hidden">
                <span class="hold-btn-fill absolute inset-0 bg-red-700 origin-left"></span>
                <span class="relative z-10">Delete all data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="deleteModal" class="settings-overlay hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-6">
        <div class="bg-card dark:bg-card-dark w-full max-w-sm rounded-2xl p-6 shadow-xl transition-colors duration-300">
          <h2 class="text-base font-bold mb-1">Delete all data – Are you sure?</h2>
          <p class="text-sm text-gray-400 dark:text-white/40 mb-6">All data will be permanently removed. This cannot be undone.</p>
          <div class="flex gap-3 justify-end">
            <button id="deleteCancelBtn" class="px-4 py-2 rounded-lg text-sm font-medium bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">Cancel</button>
            <button id="deleteConfirmBtn" class="hold-btn px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white select-none relative overflow-hidden">
              <span class="hold-btn-fill absolute inset-0 bg-red-700 origin-left"></span>
              <span class="relative z-10">Hold to delete</span>
            </button>
          </div>
        </div>
      </div>

      <div id="deleteTaskModal" class="settings-overlay hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-6">
        <div class="bg-card dark:bg-card-dark w-full max-w-sm rounded-2xl p-6 shadow-xl transition-colors duration-300">
          <h2 id="deleteTaskModalTitle" class="text-base font-bold mb-1">Delete task?</h2>
          <p class="text-sm text-gray-400 dark:text-white/40 mb-6">This task will be removed if you press the red button for 3 seconds.</p>
          <div class="flex gap-3 justify-end">
            <button id="deleteTaskCancelBtn" class="px-4 py-2 rounded-lg text-sm font-medium bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">Cancel</button>
            <button id="deleteTaskConfirmBtn" class="hold-btn px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white select-none relative overflow-hidden">
              <span class="hold-btn-fill absolute inset-0 bg-red-700 origin-left"></span>
              <span class="relative z-10">Hold to delete</span>
            </button>
          </div>
        </div>
      </div>

      <div id="cancelAddTaskModal" class="settings-overlay hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-6">
        <div class="bg-card dark:bg-card-dark w-full max-w-sm rounded-2xl p-6 shadow-xl transition-colors duration-300">
          <h2 class="text-base font-bold mb-1">Discard task?</h2>
          <p class="text-sm text-gray-400 dark:text-white/40 mb-6">This new task will be deleted without saving.</p>
          <div class="flex gap-3 justify-end">
            <button id="cancelAddTaskCancelBtn" class="px-4 py-2 rounded-lg text-sm font-medium bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">Keep editing</button>
            <button id="cancelAddTaskConfirmBtn" class="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors">Discard</button>
          </div>
        </div>
      </div>

      <div id="addTaskModal" class="settings-overlay hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-6">
        <div class="bg-card dark:bg-card-dark w-full max-w-lg rounded-2xl p-6 shadow-xl transition-colors duration-300">
          <h2 class="text-base font-bold mb-4">Add a task</h2>
          <div id="addTaskForm"></div>
          <div class="flex gap-3 justify-end mt-6">
            <button id="addTaskCancelBtn" class="px-4 py-2 rounded-lg text-sm font-medium bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">Cancel</button>
            <button id="addTaskSaveBtn" class="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">Save task</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  _wireEventListeners() {
    const closeSettings = document.getElementById('closeSettings');
    const settingsBackdrop = document.getElementById('settingsBackdrop');
    const resetBtn = document.getElementById('resetBtn');
    const deleteCancelBtn = document.getElementById('deleteCancelBtn');
    const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
    const deleteTaskCancelBtn = document.getElementById('deleteTaskCancelBtn');
    const cancelAddTaskCancelBtn = document.getElementById('cancelAddTaskCancelBtn');
    const cancelAddTaskConfirmBtn = document.getElementById('cancelAddTaskConfirmBtn');

    closeSettings?.addEventListener('click', () => this.close());
    settingsBackdrop?.addEventListener('click', () => this.close());
    this._wireHoldButton('resetBtn', () => this._showDeleteModal());
    this._wireHoldButton('deleteConfirmBtn', () => this._confirmDeleteAllData());
    this._wireHoldButton('deleteTaskConfirmBtn', () => this._handleDeleteTaskConfirmed());
    deleteCancelBtn?.addEventListener('click', () => this._hideDeleteModal());
    deleteTaskCancelBtn?.addEventListener('click', () => this._hideDeleteTaskModal());
    cancelAddTaskCancelBtn?.addEventListener('click', () => this._hideCancelAddTaskModal());
    cancelAddTaskConfirmBtn?.addEventListener('click', () => this._handleDiscardTask());

    const addTaskCancelBtn = document.getElementById('addTaskCancelBtn');
    const addTaskSaveBtn = document.getElementById('addTaskSaveBtn');
    addTaskCancelBtn?.addEventListener('click', () => this._handleDiscardTask());
    addTaskSaveBtn?.addEventListener('click', () => this._handleSaveAddTask());
  },

  _wireHoldButton(btnId, onComplete, duration = 3000) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    let holdTimer = null;

    const startHold = (e) => {
      e.preventDefault();
      if (btn.classList.contains('filled')) return;
      btn.classList.add('holding');
      holdTimer = setTimeout(() => {
        holdTimer = null;
        btn.classList.remove('holding');
        btn.classList.add('filled');
        onComplete();
      }, duration);
    };

    const cancelHold = () => {
      if (!holdTimer) return;
      clearTimeout(holdTimer);
      holdTimer = null;
      btn.classList.remove('holding');
    };

    btn.addEventListener('pointerdown', startHold);
    btn.addEventListener('pointerup', cancelHold);
    btn.addEventListener('pointerleave', cancelHold);
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  },

  _resetHoldButton(btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.classList.remove('holding', 'filled');
  },

  renderSettings(options = {}) {
    const { tasks: showTasks = true, dailyCap: showDailyCap = true, deleteData: showDeleteData = false, title = 'Settings' } = options;
    const el = document.getElementById('settingsTasks');
    const titleEl = document.getElementById('settingsTitle');
    if (titleEl) titleEl.textContent = title;
    let html = '';

    const tasks = this.config.getTasks();
    const maxCap = this.config.getMaxCap();

    if (showDailyCap) {
      html += `
        <div class="mb-5 pb-5 border-b border-gray-200 dark:border-white/10">
          <label class="text-sm font-medium block mb-1">Daily cap <span class="text-gray-400 dark:text-white/40 text-xs font-normal">(hours)</span></label>
          <p class="text-xs text-gray-400 dark:text-white/40 mb-2">Number of hours worked in a day before burnout warning</p>
          <input type="number" min="1" max="24" step="0.5" value="${maxCap}"
            class="w-28 bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-400 dark:focus:border-white/30 transition-colors"
            oninput="window._settingsModalUpdateMaxCap(this.value)">
        </div>
      `;
    }

    if (showTasks) {
      html += tasks.map((t, i) => {
        if (t && t.status === 'archived') return '';
        return `
        <div id="taskContainer-${i}" class="pb-4 border-b border-gray-200 dark:border-white/10 last:border-b-0 transition-all duration-700">

          <!-- Row 1: ID / Task name / Jira link -->
          <div class="grid grid-cols-5 gap-2 mb-2">
            <div class="col-span-1">
              <label for="taskIdOpus${i}" class="text-xs text-gray-400 dark:text-white/60 font-medium block mb-1">ID</label>
              <input id="taskIdOpus${i}" type="text" value="${t.idOpus || ''}" placeholder="Opus ID"
                class="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:border-gray-400 dark:focus:border-white/30 transition-colors"
                onfocus="window._settingsModalFocusField(${i}, 'idOpus')"
                oninput="window._settingsModalUpdateTaskIdOpus(${i}, this.value)"
                onblur="window._settingsModalBlurField(${i}, 'idOpus')">
            </div>
            <div class="col-span-2">
              <label for="taskName${i}" class="text-xs text-gray-400 dark:text-white/60 font-medium block mb-1">Task</label>
              <input id="taskName${i}" type="text" value="${t.name}" maxlength="20" placeholder="Task name"
                class="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:border-gray-400 dark:focus:border-white/30 transition-colors"
                onfocus="window._settingsModalFocusField(${i}, 'name')"
                oninput="window._settingsModalUpdateTaskName(${i}, this.value)"
                onblur="window._settingsModalBlurField(${i}, 'name')">
            </div>
            <div class="col-span-2">
              <label for="taskJira${i}" class="text-xs text-gray-400 dark:text-white/60 font-medium block mb-1">Jira Link</label>
              <input id="taskJira${i}" type="url" value="${t.jiraLink || ''}" maxlength="256" placeholder="https://..."
                class="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:border-gray-400 dark:focus:border-white/30 transition-colors"
                onfocus="window._settingsModalFocusField(${i}, 'jiraLink')"
                oninput="window._settingsModalUpdateTaskJiraLink(${i}, this.value)"
                onblur="window._settingsModalBlurField(${i}, 'jiraLink')">
            </div>
          </div>

          <!-- Row 2: Estimated workload / Delivery date / Status -->
          <div class="grid grid-cols-5 gap-2 mb-2">
            <div class="col-span-1">
              <label for="taskEstimate${i}" class="text-xs text-gray-400 dark:text-white/60 font-medium block mb-1">Est.</label>
              <input id="taskEstimate${i}" type="number" min="0" step="1" value="${t.estimate || ''}" placeholder="days"
                class="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:border-gray-400 dark:focus:border-white/30 transition-colors"
                onfocus="window._settingsModalFocusEstimate(${i})"
                oninput="window._settingsModalUpdateTaskEstimate(${i}, this.value)"
                onblur="window._settingsModalFinalizeEstimateChange(${i}, this.value)">
            </div>
            <div class="col-span-2">
              <label for="taskDelivery${i}" class="text-xs text-gray-400 dark:text-white/60 font-medium block mb-1">Delivery date</label>
              <input id="taskDelivery${i}" type="text" placeholder="DD/MM/YYYY" value="${t.deliveryDate ? formatDateToDDMMYYYY(t.deliveryDate) : ''}" pattern="\\d{2}/\\d{2}/\\d{4}" maxlength="10"
                class="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-400 dark:focus:border-white/30 transition-colors"
                oninput="window._settingsModalFormatDeliveryDate(${i}, this)"
                onchange="window._settingsModalUpdateTaskDeliveryDate(${i}, this.value)"
                onblur="window._settingsModalUpdateTaskDeliveryDate(${i}, this.value)">
            </div>
            <div class="col-span-2">
              <label for="taskStatus${i}" class="text-xs text-gray-400 dark:text-white/60 font-medium block mb-1">Status</label>
              <select id="taskStatus${i}"
                class="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-400 dark:focus:border-white/30 transition-colors"
                onchange="window._settingsModalUpdateTaskStatus(${i}, this.value)">
                <option value="" ${!t.status ? 'selected' : ''}>—</option>
                <option value="soon" ${t.status === 'soon' ? 'selected' : ''}>Soon</option>
                <option value="inPause" ${t.status === 'inPause' ? 'selected' : ''}>In Pause</option>
                <option value="inProgress" ${t.status === 'inProgress' ? 'selected' : ''}>In Progress</option>
                <option value="devStarted" ${t.status === 'devStarted' ? 'selected' : ''}>Dev started</option>
                <option value="checking" ${t.status === 'checking' ? 'selected' : ''}>Final review</option>
                <option value="done" ${t.status === 'done' ? 'selected' : ''}>Done</option>
                <option value="archived" ${t.status === 'archived' ? 'selected' : ''}>Archived</option>
              </select>
            </div>
          </div>

          <!-- Row 3: Color picker + Delete button -->
          <div class="flex items-center justify-between gap-3 pt-1">
            <div style="display: grid; grid-template-columns: repeat(9, 1fr); gap: 8px;">
              ${PALETTE.map(c => `
                <button class="color-swatch w-7 h-7 rounded-full ${c === t.color ? 'active' : ''}"
                  style="background:${COLOR_HEX[c]};color:${COLOR_HEX[c]}"
                  aria-label="${COLOR_NAMES[c]}${c === t.color ? ' (selected)' : ''}"
                  onclick="window._settingsModalUpdateTaskColor(${i}, '${c}')"></button>
              `).join('')}
            </div>
            ${tasks.length > 1 ? `<button onclick="window._settingsModalDeleteTask(${i})" class="text-xs text-red-400 hover:text-red-300 transition-colors whitespace-nowrap" aria-label="Delete task ${i + 1}">Delete task</button>` : ''}
          </div>

        </div>
      `;
      }).join('');
      html += `
        <a href="archive.html" target="_blank" class="w-full mt-2 py-2 rounded-lg border border-gray-300 dark:border-white/10 text-sm text-gray-700 dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center no-underline">
          Archive
        </a>
      `;
    }

    if (el) el.innerHTML = html;

    // Show/hide sections
    const deleteSection = document.getElementById('settingsDeleteSection');
    if (deleteSection) deleteSection.style.display = showDeleteData ? 'block' : 'none';
  },

  _showDeleteModal() {
    document.getElementById('deleteModal')?.classList.remove('hidden');
  },

  // Public entry point for pages that don't show the Settings panel's
  // delete section (deleteData defaults to false) but still want to
  // trigger the same confirm-delete flow, e.g. archive.html.
  openDeleteAllModal() {
    if (!this.initialized) return;
    this._showDeleteModal();
  },

  _hideDeleteModal() {
    document.getElementById('deleteModal')?.classList.add('hidden');
    this._resetHoldButton('resetBtn');
    this._resetHoldButton('deleteConfirmBtn');
  },

  _confirmDeleteAllData() {
    document.getElementById('deleteModal')?.classList.add('hidden');
    this._resetHoldButton('resetBtn');
    this._resetHoldButton('deleteConfirmBtn');
    const completions = this.config.getCompletions();
    const setCompletions = this.config.setCompletions;
    const setTasks = this.config.setTasks;

    localStorage.removeItem('dt_tasks');
    localStorage.removeItem('dt_completions');
    setTasks(JSON.parse(JSON.stringify(DEFAULT_TASKS)));
    setCompletions({});

    if (this.config.onSave) this.config.onSave();
    if (this.config.onTasksChanged) this.config.onTasksChanged();
    if (this.config.onReload) this.config.onReload();
  },

  _formatHours(hours) {
    const rounded = Math.round((hours || 0) * 100) / 100;
    return `${rounded}h`;
  },

  _getTaskTotalHours(index) {
    const completions = this.config.getCompletions?.() || {};
    let total = 0;
    Object.values(completions).forEach(comp => {
      if (Array.isArray(comp) && typeof comp[index] === 'number') {
        total += comp[index];
      }
    });
    return total;
  },

  _showDeleteTaskModal(name, hours) {
    const titleEl = document.getElementById('deleteTaskModalTitle');
    if (titleEl) {
      titleEl.textContent = `Delete ${name || 'this task'} (${this._formatHours(hours)})?`;
    }
    document.getElementById('deleteTaskModal')?.classList.remove('hidden');
  },

  // Public entry point for callers (e.g. archive.html) that manage their
  // own task list/removal logic and just want the shared hold-to-delete
  // confirmation modal. onConfirm is invoked once the button is held down
  // for the full duration.
  openDeleteTaskModal(taskName, hours, onConfirm) {
    if (!this.initialized) return;
    this.state.pendingDeleteCallback = onConfirm;
    this._showDeleteTaskModal(taskName, hours);
  },

  _hideDeleteTaskModal() {
    document.getElementById('deleteTaskModal')?.classList.add('hidden');
    this.state.pendingDeleteIndex = null;
    this.state.pendingDeleteCallback = null;
    this._resetHoldButton('deleteTaskConfirmBtn');
  },

  _handleDeleteTaskConfirmed() {
    if (this.state.pendingDeleteCallback) {
      const callback = this.state.pendingDeleteCallback;
      this.state.pendingDeleteCallback = null;
      document.getElementById('deleteTaskModal')?.classList.add('hidden');
      this._resetHoldButton('deleteTaskConfirmBtn');
      callback();
      return;
    }
    this._handleConfirmDeleteTask();
  },

  _handleConfirmDeleteTask() {
    const index = this.state.pendingDeleteIndex;
    if (index === null) return;
    this.state.pendingDeleteIndex = null;
    document.getElementById('deleteTaskModal')?.classList.add('hidden');
    this._resetHoldButton('deleteTaskConfirmBtn');

    const taskEl = document.getElementById(`taskContainer-${index}`);
    if (taskEl) {
      const height = taskEl.offsetHeight;
      taskEl.style.overflow = 'hidden';
      taskEl.style.height = height + 'px';
      taskEl.style.opacity = '0';
      taskEl.style.marginBottom = '0';
      taskEl.style.paddingBottom = '0';

      setTimeout(() => {
        taskEl.style.height = '0px';
      }, 10);

      setTimeout(() => {
        if (this.state.isAddTaskMode) {
          const tasks = this.config.getTasks();
          const completions = this.config.getCompletions();
          tasks.splice(index, 1);
          Object.keys(completions).forEach(date => {
            if (Array.isArray(completions[date])) {
              completions[date].splice(index, 1);
            }
          });
          this.config.onSave?.();
          document.body.classList.add('page-reload-fade');
          this.config.onReload?.();
        } else {
          this._removeTask(index);
          this.state.pageNeedsReload = true;
        }
      }, 700);
    } else {
      if (this.state.isAddTaskMode) {
        const tasks = this.config.getTasks();
        const completions = this.config.getCompletions();
        tasks.splice(index, 1);
        Object.keys(completions).forEach(date => {
          if (Array.isArray(completions[date])) {
            completions[date].splice(index, 1);
          }
        });
        this.config.onSave?.();
        this.renderSettings({ title: 'Settings' });
        this.config.onTasksChanged?.();
        document.getElementById('settingsOverlay')?.classList.add('hidden');
        this.state.isAddTaskMode = false;
      } else {
        this._removeTask(index);
        this.state.pageNeedsReload = true;
      }
    }
  },

  _removeTask(index) {
    const tasks = this.config.getTasks();
    if (tasks.length <= 1) return;

    tasks.splice(index, 1);
    const completions = this.config.getCompletions();
    Object.keys(completions).forEach(date => {
      if (Array.isArray(completions[date])) {
        completions[date].splice(index, 1);
      }
    });

    this.config.onSave?.();
    this.renderSettings();
    this.config.onTasksChanged?.();
    this.config.onSheetOpen?.();
  },

  _showCancelAddTaskModal() {
    document.getElementById('cancelAddTaskModal')?.classList.remove('hidden');
  },

  _hideCancelAddTaskModal() {
    document.getElementById('cancelAddTaskModal')?.classList.add('hidden');
  },

  _handleDiscardTask() {
    document.getElementById('cancelAddTaskModal')?.classList.add('hidden');
    const lastIndex = this.config.getTasks().length - 1;
    const tasks = this.config.getTasks();
    const completions = this.config.getCompletions();
    tasks.splice(lastIndex, 1);
    Object.keys(completions).forEach(date => {
      if (Array.isArray(completions[date])) {
        completions[date].splice(lastIndex, 1);
      }
    });
    this.config.onSave?.();
    this.state.isAddTaskMode = false;
    document.getElementById('addTaskModal')?.classList.add('hidden');
  },

  _handleSaveAddTask() {
    const lastIndex = this.config.getTasks().length - 1;
    const taskNameInput = document.getElementById(`taskName${lastIndex}`);
    const name = taskNameInput?.value.trim() || 'unknown';

    const tasks = this.config.getTasks();
    tasks[lastIndex].name = name;
    this.config.onSave?.();
    console.log('Task saved:', tasks[lastIndex]);

    this.state.isAddTaskMode = false;
    document.getElementById('addTaskModal')?.classList.add('hidden');
    this.renderSettings();
    this.config.onTasksChanged?.();
  },

  // Public API
  open() {
    this.state.isAddTaskMode = false;
    this.renderSettings({ title: 'Settings' });
    document.getElementById('settingsOverlay')?.classList.remove('hidden');
  },

  close() {
    const tasks = this.config.getTasks();
    const setTasks = this.config.setTasks;
    tasks.filter(t => t.name.trim() !== '');
    if (tasks.length === 0) {
      setTasks(JSON.parse(JSON.stringify(DEFAULT_TASKS)));
    }
    this.config.onSave?.();

    const overlay = document.getElementById('settingsOverlay');
    overlay?.classList.add('closing');
    setTimeout(() => {
      overlay?.classList.remove('closing');
      overlay?.classList.add('hidden');
      if (this.state.pageNeedsReload) {
        this.state.pageNeedsReload = false;
        document.body.classList.add('page-reload-fade');
        this.config.onReload?.();
      }
    }, 300);
  },

  openAddTask() {
    const usedColors = this.config.getTasks().map(t => t.color);
    const nextColor = PALETTE.find(c => !usedColors.includes(c)) || PALETTE[this.config.getTasks().length % PALETTE.length];

    const tasks = this.config.getTasks();
    const newTask = { name: '', color: nextColor, estimate: '', deliveryDate: '', jiraLink: '', status: '', idOpus: '' };
    tasks.push(newTask);
    this.config.onSave?.();
    this.state.isAddTaskMode = true;

    const i = tasks.length - 1;
    const t = tasks[i];
    const el = document.getElementById('addTaskForm');
    if (el) {
      el.innerHTML = `
        <!-- Row 1: ID / Task name / Jira link -->
        <div class="grid grid-cols-5 gap-2 mb-2">
          <div class="col-span-1">
            <label for="taskIdOpus${i}" class="text-xs text-gray-400 dark:text-white/60 font-medium block mb-1">ID</label>
            <input id="taskIdOpus${i}" type="text" value="" placeholder="Opus ID"
              class="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:border-gray-400 dark:focus:border-white/30 transition-colors"
              oninput="window._settingsModalUpdateTaskIdOpus(${i}, this.value)">
          </div>
          <div class="col-span-2">
            <label for="taskName${i}" class="text-xs text-gray-400 dark:text-white/60 font-medium block mb-1">Task</label>
            <input id="taskName${i}" type="text" value="${t.name}" maxlength="20" placeholder="Task name"
              class="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:border-gray-400 dark:focus:border-white/30 transition-colors"
              oninput="window._settingsModalUpdateTaskName(${i}, this.value)">
          </div>
          <div class="col-span-2">
            <label for="taskJira${i}" class="text-xs text-gray-400 dark:text-white/60 font-medium block mb-1">Jira Link</label>
            <input id="taskJira${i}" type="url" value="${t.jiraLink || ''}" maxlength="256" placeholder="https://..."
              class="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:border-gray-400 dark:focus:border-white/30 transition-colors"
              oninput="window._settingsModalUpdateTaskJiraLink(${i}, this.value)">
          </div>
        </div>

        <!-- Row 2: Est. / Delivery date / Status -->
        <div class="grid grid-cols-5 gap-2 mb-2">
          <div class="col-span-1">
            <label for="taskEstimate${i}" class="text-xs text-gray-400 dark:text-white/60 font-medium block mb-1">Est.</label>
            <input id="taskEstimate${i}" type="number" min="0" step="1" value="" placeholder="days"
              class="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:border-gray-400 dark:focus:border-white/30 transition-colors"
              oninput="window._settingsModalUpdateTaskEstimate(${i}, this.value)">
          </div>
          <div class="col-span-2">
            <label for="taskDelivery${i}" class="text-xs text-gray-400 dark:text-white/60 font-medium block mb-1">Delivery date</label>
            <input id="taskDelivery${i}" type="text" placeholder="DD/MM/YYYY" value="" pattern="\\d{2}/\\d{2}/\\d{4}" maxlength="10"
              class="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-400 dark:focus:border-white/30 transition-colors"
              oninput="window._settingsModalFormatDeliveryDate(${i}, this)"
              onchange="window._settingsModalUpdateTaskDeliveryDate(${i}, this.value)"
              onblur="window._settingsModalUpdateTaskDeliveryDate(${i}, this.value)">
          </div>
          <div class="col-span-2">
            <label for="taskStatus${i}" class="text-xs text-gray-400 dark:text-white/60 font-medium block mb-1">Status</label>
            <select id="taskStatus${i}"
              class="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-400 dark:focus:border-white/30 transition-colors"
              onchange="window._settingsModalUpdateTaskStatus(${i}, this.value)">
              <option value="" selected>—</option>
              <option value="soon">Soon</option>
              <option value="inPause">In Pause</option>
              <option value="inProgress">In Progress</option>
              <option value="devStarted">Dev started</option>
              <option value="checking">Final review</option>
              <option value="done">Done</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <!-- Row 3: Color picker -->
        <div class="grid grid-cols-9 gap-2 pt-2">
          ${PALETTE.map(c => `
            <button class="color-swatch w-7 h-7 rounded-full ${c === t.color ? 'active' : ''}"
              style="background:${COLOR_HEX[c]};color:${COLOR_HEX[c]}"
              aria-label="${COLOR_NAMES[c]}${c === t.color ? ' (selected)' : ''}"
              onclick="window._settingsModalUpdateTaskColor(${i}, '${c}')"></button>
          `).join('')}
        </div>
      `;
    }
    document.getElementById('addTaskModal')?.classList.remove('hidden');
    setTimeout(() => document.getElementById(`taskName${i}`)?.focus(), 100);
  },

};

// Expose global functions for inline oninput handlers
window._settingsModalUpdateTaskName = (i, v) => {
  const tasks = SettingsModal.config.getTasks();
  if (tasks[i]) {
    tasks[i].name = v;
    SettingsModal.config.onSave?.();
  }
};

let _fieldFocusValue = null;

window._settingsModalFocusField = (i, field) => {
  const tasks = SettingsModal.config.getTasks();
  if (tasks[i]) {
    _fieldFocusValue = tasks[i][field];
  }
};

window._settingsModalBlurField = (i, field) => {
  const tasks = SettingsModal.config.getTasks();
  if (tasks[i]) {
    window.logTaskChange?.(tasks[i], field, _fieldFocusValue, tasks[i][field]);
  }
  _fieldFocusValue = null;
};

window._settingsModalUpdateTaskColor = (i, c) => {
  const tasks = SettingsModal.config.getTasks();
  if (tasks[i]) {
    const oldColor = tasks[i].color;
    tasks[i].color = c;
    window.logTaskChange?.(tasks[i], 'color', oldColor, c);
    SettingsModal.config.onSave?.();

    // Update only the color swatch active state for this specific task
    const taskContainer = document.getElementById(`taskContainer-${i}`);
    if (taskContainer) {
      const swatches = taskContainer.querySelectorAll('button.color-swatch');
      swatches.forEach(swatch => {
        swatch.classList.remove('active');
      });
      // Activate only the clicked color swatch for this task
      swatches.forEach(swatch => {
        if (swatch.getAttribute('aria-label')?.toLowerCase() === c.toLowerCase()) {
          swatch.classList.add('active');
        }
      });
    }

    if (!SettingsModal.state.isAddTaskMode) {
      SettingsModal.config.onTasksChanged?.();
    }
  }
};

let _estimateFocusValue = null;

window._settingsModalFocusEstimate = (i) => {
  const tasks = SettingsModal.config.getTasks();
  if (tasks[i]) {
    _estimateFocusValue = parseFloat(tasks[i].estimate) || 0;
  }
};

window._settingsModalUpdateTaskEstimate = (i, v) => {
  const tasks = SettingsModal.config.getTasks();
  if (tasks[i]) {
    tasks[i].estimate = v;
    SettingsModal.config.onSave?.();
  }
};

window._settingsModalFinalizeEstimateChange = (i, v) => {
  const tasks = SettingsModal.config.getTasks();
  if (!tasks[i]) return;
  const newVal = parseFloat(v) || 0;
  const oldVal = _estimateFocusValue ?? (parseFloat(tasks[i].estimate) || 0);

  if (newVal !== oldVal) {
    const completions = SettingsModal.config.getCompletions?.() || {};
    const hasLoggedHours = Object.values(completions).some(
      comp => Array.isArray(comp) && (comp[i] || 0) > 0
    );
    if (hasLoggedHours) {
      if (!Array.isArray(tasks[i].estimateHistory)) tasks[i].estimateHistory = [];
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
      tasks[i].estimateHistory.push({ date: dateStr, from: oldVal, to: newVal });
    }
  }
  window.logTaskChange?.(tasks[i], 'estimate', oldVal, newVal);
  _estimateFocusValue = null;
  SettingsModal.config.onSave?.();
};

window._settingsModalUpdateTaskDeliveryDate = (i, v) => {
  const tasks = SettingsModal.config.getTasks();
  if (tasks[i]) {
    const oldDeliveryDate = tasks[i].deliveryDate;
    // Handle both YYYY-MM-DD (from native date input) and DD/MM/YYYY (from text input) formats
    if (v && v.length === 10) {
      if (v.includes('/')) {
        // DD/MM/YYYY format
        const [day, month, year] = v.split('/');
        tasks[i].deliveryDate = `${year}-${month}-${day}`;
      } else if (v.includes('-')) {
        // YYYY-MM-DD format (already correct)
        tasks[i].deliveryDate = v;
      } else {
        tasks[i].deliveryDate = '';
      }
    } else {
      tasks[i].deliveryDate = '';
    }
    window.logTaskChange?.(tasks[i], 'deliveryDate', oldDeliveryDate, tasks[i].deliveryDate);
    SettingsModal.config.onSave?.();
  }
};

window._settingsModalUpdateTaskJiraLink = (i, v) => {
  const tasks = SettingsModal.config.getTasks();
  if (tasks[i]) {
    tasks[i].jiraLink = v;
    SettingsModal.config.onSave?.();
  }
};

window._settingsModalDeleteTask = (i) => {
  SettingsModal.state.pendingDeleteIndex = i;
  const tasks = SettingsModal.config.getTasks();
  const name = tasks[i]?.name;
  const hours = SettingsModal._getTaskTotalHours(i);
  SettingsModal._showDeleteTaskModal(name, hours);
};

window._settingsModalAddTask = () => {
  const usedColors = SettingsModal.config.getTasks().map(t => t.color);
  const nextColor = PALETTE.find(c => !usedColors.includes(c)) || PALETTE[SettingsModal.config.getTasks().length % PALETTE.length];
  const newTask = { name: `Task ${SettingsModal.config.getTasks().length + 1}`, color: nextColor, estimate: '', deliveryDate: '', jiraLink: '', status: '', idOpus: '', estimateHistory: [] };
  const tasks = SettingsModal.config.getTasks();
  tasks.push(newTask);
  SettingsModal.config.onSave?.();
  SettingsModal.renderSettings();
  SettingsModal.config.onTasksChanged?.();
};

window._settingsModalUpdateMaxCap = (v) => {
  const val = parseFloat(v);
  if (!isNaN(val) && val > 0) {
    SettingsModal.config.setMaxCap(val);
    SettingsModal.config.onSave?.();
    SettingsModal.config.onTasksChanged?.();
  }
};

window._settingsModalUpdateTaskStatus = (i, v) => {
  const tasks = SettingsModal.config.getTasks();
  if (tasks[i]) {
    const oldStatus = tasks[i].status;
    tasks[i].status = v;
    window.logTaskChange?.(tasks[i], 'status', oldStatus, v);
    SettingsModal.config.onSave?.();
  }
};

window._settingsModalUpdateTaskIdOpus = (i, v) => {
  const tasks = SettingsModal.config.getTasks();
  if (tasks[i]) {
    tasks[i].idOpus = v;
    SettingsModal.config.onSave?.();
  }
};

// Date formatting utilities
function formatDateToDDMMYYYY(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function formatDateToYYYYMMDD(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.replace(/\D/g, '').match(/.{1,2}/g);
  if (!parts || parts.length !== 3) return '';
  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
}

window.formatDateToDDMMYYYY = formatDateToDDMMYYYY;

window._settingsModalFormatDeliveryDate = (i, input) => {
  let value = input.value.replace(/\D/g, '');

  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2);
  }
  if (value.length >= 5) {
    value = value.slice(0, 5) + '/' + value.slice(5, 9);
  }

  input.value = value;
};

// Export constants for use across pages
window.PALETTE = PALETTE;
window.COLOR_HEX = COLOR_HEX;
window.COLOR_NAMES = COLOR_NAMES;
window.DEFAULT_TASKS = DEFAULT_TASKS;
