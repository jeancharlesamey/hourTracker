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
    } = options;

    const el = document.getElementById(elementId);
    if (!el) return;

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const todayS = todayStr();

    el.innerHTML = tasks
      .map((t, i) => {
        let total = 0;
        for (let d = 1; d <= daysInMonth; d++) {
          const ds = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          if (ds > todayS) break;
          total += getCompletions(ds)[i] || 0;
        }

        // Only show tasks with > 0 hours
        if (total === 0) return '';

        const label = `${t.name} (${fmtH(total)})`;
        return `
          <div class="flex items-center gap-1.5 md:gap-2">
            <div class="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" style="background:${COLOR_HEX[t.color]}"></div>
            <span class="text-gray-500 dark:text-white/70">${label}</span>
          </div>
        `;
      })
      .filter(html => html !== '')
      .join('');
  },
};
