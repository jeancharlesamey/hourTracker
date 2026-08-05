// Legend Renderer - Reusable legend component for tasks with hours
// Usage: LegendRenderer.render(elementId, options)

const LegendRenderer = {
  render(elementId, options = {}) {
    const {
      tasks,
      getCompletions,
      viewYear,
      viewMonth,
      todayStr,
      COLOR_HEX,
      fmtH,
      onTaskClick,
      getTaskIndex,
    } = options;

    const el = document.getElementById(elementId);
    if (!el) return;

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const todayS = todayStr();

    el.innerHTML = tasks
      .map((t, pos) => {
        const i = getTaskIndex ? getTaskIndex(t) : pos;
        let total = 0;
        for (let d = 1; d <= daysInMonth; d++) {
          const ds = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          if (ds > todayS) break;
          total += getCompletions(ds)[i] || 0;
        }

        // Only show tasks with > 0 hours
        if (total === 0) return '';

        const displayLabel = t.idOpus ? `${t.idOpus} • ${t.name}` : t.name;
        return `
          <div data-taskindex="${i}" class="flex items-center gap-1.5 md:gap-2 cursor-pointer hover:opacity-80 transition-opacity select-none">
            <div class="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" style="background:${COLOR_HEX[t.color]}"></div>
            <span class="text-gray-500 dark:text-white/70">${displayLabel}</span>
          </div>
        `;
      })
      .filter(html => html !== '')
      .join('');

    // Add click handlers if callback provided
    if (onTaskClick) {
      el.querySelectorAll('[data-taskindex]').forEach(item => {
        item.addEventListener('click', () => {
          const taskIndex = parseInt(item.dataset.taskindex, 10);
          onTaskClick(taskIndex);
        });
      });
    }
  },
};
