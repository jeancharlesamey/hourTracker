// Shared Month Modal Module
// Provides reusable month summary modal for index.html and analytics.html

const MonthModal = {
  isOpen: false,

  // Initialize modal in the page
  init() {
    const existingModal = document.getElementById('monthSummaryOverlay');
    if (existingModal) return; // Already initialized

    // Create modal HTML
    const modalHTML = `
      <div id="monthSummaryOverlay" role="dialog" aria-modal="true" aria-label="Month Summary" class="settings-overlay hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-end sm:items-center justify-center">
        <div class="bg-card dark:bg-card-dark w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto transition-colors duration-300">
          <div class="flex items-center justify-between mb-5">
            <h2 id="summaryTitle" class="text-lg font-bold"></h2>
            <button id="closeSummary" aria-label="Close summary" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
              <svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div id="summaryContent"></div>
        </div>
      </div>
    `;

    // Inject modal into the page
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Attach event listeners
    document.getElementById('closeSummary').addEventListener('click', () => this.close());
    document.getElementById('monthSummaryOverlay').addEventListener('click', (e) => {
      if (e.target === document.getElementById('monthSummaryOverlay')) {
        this.close();
      }
    });

    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  },

  open(title, contentHTML) {
    const overlay = document.getElementById('monthSummaryOverlay');
    if (!overlay) {
      this.init();
    }
    document.getElementById('summaryTitle').textContent = title;
    document.getElementById('summaryContent').innerHTML = contentHTML;
    document.getElementById('monthSummaryOverlay').classList.remove('hidden');
    this.isOpen = true;
  },

  close() {
    const overlay = document.getElementById('monthSummaryOverlay');
    if (overlay) {
      overlay.classList.add('hidden');
      this.isOpen = false;
    }
  },

  setContent(title, contentHTML) {
    document.getElementById('summaryTitle').textContent = title;
    document.getElementById('summaryContent').innerHTML = contentHTML;
  }
};

// Auto-initialize on page load if needed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => MonthModal.init());
} else {
  MonthModal.init();
}
