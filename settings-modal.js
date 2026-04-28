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
  { name: 'Exercise', color: 'green', estimate: '', deliveryDate: '', jiraLink: '' },
  { name: 'Read', color: 'blue', estimate: '', deliveryDate: '', jiraLink: '' },
  { name: 'Meditate', color: 'purple', estimate: '', deliveryDate: '', jiraLink: '' },
  { name: 'Journal', color: 'amber', estimate: '', deliveryDate: '', jiraLink: '' },
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
            <div id="settingsDeleteSection" class="mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
              <button id="resetBtn" class="w-full py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">Delete all data</button>
            </div>
          </div>
        </div>
      </div>

      <div id="deleteModal" class="settings-overlay hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-6">
        <div class="bg-card dark:bg-card-dark w-full max-w-sm rounded-2xl p-6 shadow-xl transition-colors duration-300">
          <h2 class="text-base font-bold mb-1">Delete — Are you sure?</h2>
          <p class="text-sm text-gray-400 dark:text-white/40 mb-6">All data will be permanently removed. This cannot be undone.</p>
          <div class="flex gap-3 justify-end">
            <button id="deleteCancelBtn" class="px-4 py-2 rounded-lg text-sm font-medium bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">Cancel</button>
            <button id="deleteConfirmBtn" class="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors">Delete</button>
          </div>
        </div>
      </div>

      <div id="deleteTaskModal" class="settings-overlay hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-6">
        <div class="bg-card dark:bg-card-dark w-full max-w-sm rounded-2xl p-6 shadow-xl transition-colors duration-300">
          <h2 class="text-base font-bold mb-1">Delete task?</h2>
          <p class="text-sm text-gray-400 dark:text-white/40 mb-6">This task will be removed.</p>
          <div class="flex gap-3 justify-end">
            <button id="deleteTaskCancelBtn" class="px-4 py-2 rounded-lg text-sm font-medium bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">Cancel</button>
            <button id="deleteTaskConfirmBtn" class="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors">Delete</button>
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
    const deleteTaskConfirmBtn = document.getElementById('deleteTaskConfirmBtn');
    const cancelAddTaskCancelBtn = document.getElementById('cancelAddTaskCancelBtn');
    const cancelAddTaskConfirmBtn = document.getElementById('cancelAddTaskConfirmBtn');

    closeSettings?.addEventListener('click', () => this.close());
    settingsBackdrop?.addEventListener('click', () => this.close());
    resetBtn?.addEventListener('click', () => this._showDeleteModal());
    deleteCancelBtn?.addEventListener('click', () => this._hideDeleteModal());
    deleteConfirmBtn?.addEventListener('click', () => this._confirmDeleteAllData());
    deleteTaskCancelBtn?.addEventListener('click', () => this._hideDeleteTaskModal());
    deleteTaskConfirmBtn?.addEventListener('click', () => this._handleConfirmDeleteTask());
    cancelAddTaskCancelBtn?.addEventListener('click', () => this._hideCancelAddTaskModal());
    cancelAddTaskConfirmBtn?.addEventListener('click', () => this._handleDiscardTask());

    // Delegated event listeners for save/cancel task buttons
    document.addEventListener('click', (e) => {
      if (e.target.id === 'saveAddTaskBtn') this._handleSaveAddTask();
      if (e.target.id === 'cancelAddTaskBtn') this._handleDiscardTask();
    });
  },

  renderSettings(options = {}) {
    const { tasks: showTasks = true, dailyCap: showDailyCap = true, deleteData: showDeleteData = true, title = 'Settings' } = options;
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
      html += tasks.map((t, i) => `
        <div id="taskContainer-${i}" class="space-y-2 pb-4 border-b border-gray-200 dark:border-white/10 last:border-b-0 transition-all duration-700">
          <div class="flex items-center justify-between gap-2">
            <div class="flex-1">
              <label for="taskName${i}" class="text-xs text-gray-400 dark:text-white/60 font-medium block mb-1">Task ${i + 1}</label>
              <input id="taskName${i}" type="text" value="${t.name}" maxlength="20" placeholder="Task name"
                class="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:border-gray-400 dark:focus:border-white/30 transition-colors"
                oninput="window._settingsModalUpdateTaskName(${i}, this.value)">
            </div>
            <div class="flex-1">
              <label for="taskJira${i}" class="text-xs text-gray-400 dark:text-white/60 font-medium block mb-1">Jira Link</label>
              <input id="taskJira${i}" type="url" value="${t.jiraLink || ''}" maxlength="256" placeholder="https://..."
                class="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:border-gray-400 dark:focus:border-white/30 transition-colors"
                oninput="window._settingsModalUpdateTaskJiraLink(${i}, this.value)">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="taskEstimate${i}" class="text-xs text-gray-400 dark:text-white/60 font-medium block mb-1">Estimated workload</label>
              <input id="taskEstimate${i}" type="number" min="0" step="1" value="${t.estimate || ''}" placeholder="days"
                class="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:border-gray-400 dark:focus:border-white/30 transition-colors"
                oninput="window._settingsModalUpdateTaskEstimate(${i}, this.value)">
            </div>
            <div>
              <label for="taskDelivery${i}" class="text-xs text-gray-400 dark:text-white/60 font-medium block mb-1">Delivery date</label>
              <input id="taskDelivery${i}" type="text" placeholder="DD/MM/YYYY" value="${t.deliveryDate ? formatDateToDDMMYYYY(t.deliveryDate) : ''}" pattern="\\d{2}/\\d{2}/\\d{4}" maxlength="10"
                class="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-400 dark:focus:border-white/30 transition-colors"
                oninput="window._settingsModalFormatDeliveryDate(${i}, this)"
                onchange="window._settingsModalUpdateTaskDeliveryDate(${i}, this.value)"
                onblur="window._settingsModalUpdateTaskDeliveryDate(${i}, this.value)">
            </div>
          </div>

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
      `).join('');
      html += `
        <button onclick="window._settingsModalAddTask()" class="w-full mt-2 py-2 rounded-lg border border-dashed border-gray-300 dark:border-white/20 text-sm text-gray-400 dark:text-white/40 hover:border-gray-400 dark:hover:border-white/40 hover:text-gray-500 dark:hover:text-white/60 transition-colors">
          + Add task
        </button>
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

  _hideDeleteModal() {
    document.getElementById('deleteModal')?.classList.add('hidden');
  },

  _confirmDeleteAllData() {
    document.getElementById('deleteModal')?.classList.add('hidden');
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

  _showDeleteTaskModal() {
    document.getElementById('deleteTaskModal')?.classList.remove('hidden');
  },

  _hideDeleteTaskModal() {
    document.getElementById('deleteTaskModal')?.classList.add('hidden');
    this.state.pendingDeleteIndex = null;
  },

  _handleConfirmDeleteTask() {
    const index = this.state.pendingDeleteIndex;
    if (index === null) return;
    this.state.pendingDeleteIndex = null;
    document.getElementById('deleteTaskModal')?.classList.add('hidden');

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
    document.getElementById('settingsOverlay')?.classList.add('hidden');
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
    document.getElementById('settingsOverlay')?.classList.add('hidden');
    this.renderSettings({ title: 'Settings' });
    this.config.onTasksChanged?.();
  },

  // Public API
  open() {
    this.state.isAddTaskMode = false;
    this.renderSettings({ title: 'Settings' });
    document.getElementById('settingsOverlay')?.classList.remove('hidden');
  },

  close() {
    if (this.state.isAddTaskMode) {
      document.getElementById('cancelAddTaskModal')?.classList.remove('hidden');
      return;
    }

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
    const newTask = { name: '', color: nextColor, estimate: '', deliveryDate: '', jiraLink: '' };
    tasks.push(newTask);
    this.config.onSave?.();
    this.state.isAddTaskMode = true;

    this.renderSettings({ tasks: false, dailyCap: false, deleteData: false, title: 'Add a task' });

    const el = document.getElementById('settingsTasks');
    const i = tasks.length - 1;
    const t = tasks[i];
    const taskHTML = `
      <div class="space-y-2 pb-4">
        <div class="flex items-center justify-between gap-2">
          <div class="flex-1">
            <label for="taskName${i}" class="text-xs text-gray-400 dark:text-white/60 font-medium block mb-1">New Task</label>
            <input id="taskName${i}" type="text" value="${t.name}" maxlength="20" placeholder="Task name"
              class="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:border-gray-400 dark:focus:border-white/30 transition-colors"
              oninput="window._settingsModalUpdateTaskName(${i}, this.value)">
          </div>
          <div class="flex-1">
            <label for="taskJira${i}" class="text-xs text-gray-400 dark:text-white/60 font-medium block mb-1">Jira Link</label>
            <input id="taskJira${i}" type="url" value="${t.jiraLink || ''}" maxlength="256" placeholder="https://..."
              class="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:border-gray-400 dark:focus:border-white/30 transition-colors"
              oninput="window._settingsModalUpdateTaskJiraLink(${i}, this.value)">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="taskEstimate${i}" class="text-xs text-gray-400 dark:text-white/60 font-medium block mb-1">Estimated workload</label>
            <input id="taskEstimate${i}" type="number" min="0" step="1" value="${t.estimate || ''}" placeholder="days"
              class="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:border-gray-400 dark:focus:border-white/30 transition-colors"
              oninput="window._settingsModalUpdateTaskEstimate(${i}, this.value)">
          </div>
          <div>
            <label for="taskDelivery${i}" class="text-xs text-gray-400 dark:text-white/60 font-medium block mb-1">Delivery date</label>
            <input id="taskDelivery${i}" type="text" placeholder="DD/MM/YYYY" value="${t.deliveryDate ? formatDateToDDMMYYYY(t.deliveryDate) : ''}" pattern="\\d{2}/\\d{2}/\\d{4}" maxlength="10"
              class="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-400 dark:focus:border-white/30 transition-colors"
              oninput="window._settingsModalFormatDeliveryDate(${i}, this)"
              onchange="window._settingsModalUpdateTaskDeliveryDate(${i}, this.value)"
              onblur="window._settingsModalUpdateTaskDeliveryDate(${i}, this.value)">
          </div>
        </div>

        <div class="grid grid-cols-9 gap-2 pt-2.5">
          ${PALETTE.map(c => `
            <button class="color-swatch w-7 h-7 rounded-full ${c === t.color ? 'active' : ''}"
              style="background:${COLOR_HEX[c]};color:${COLOR_HEX[c]}"
              aria-label="${COLOR_NAMES[c]}${c === t.color ? ' (selected)' : ''}"
              onclick="window._settingsModalUpdateTaskColor(${i}, '${c}')"></button>
          `).join('')}
        </div>
      </div>
      <div class="flex gap-3 justify-end mt-6">
        <button id="cancelAddTaskBtn" class="px-4 py-2 rounded-lg text-sm font-medium bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">Cancel</button>
        <button id="saveAddTaskBtn" class="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">Save task</button>
      </div>
    `;
    if (el) el.innerHTML = taskHTML;
    document.getElementById('settingsOverlay')?.classList.remove('hidden');
    setTimeout(() => {
      document.getElementById(`taskName${i}`)?.focus();
    }, 100);
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

window._settingsModalUpdateTaskColor = (i, c) => {
  const tasks = SettingsModal.config.getTasks();
  if (tasks[i]) {
    tasks[i].color = c;
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

window._settingsModalUpdateTaskEstimate = (i, v) => {
  const tasks = SettingsModal.config.getTasks();
  if (tasks[i]) {
    tasks[i].estimate = v;
    SettingsModal.config.onSave?.();
  }
};

window._settingsModalUpdateTaskDeliveryDate = (i, v) => {
  const tasks = SettingsModal.config.getTasks();
  if (tasks[i]) {
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
  SettingsModal._showDeleteTaskModal();
};

window._settingsModalAddTask = () => {
  const usedColors = SettingsModal.config.getTasks().map(t => t.color);
  const nextColor = PALETTE.find(c => !usedColors.includes(c)) || PALETTE[SettingsModal.config.getTasks().length % PALETTE.length];
  const newTask = { name: `Task ${SettingsModal.config.getTasks().length + 1}`, color: nextColor, estimate: '', deliveryDate: '', jiraLink: '' };
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
