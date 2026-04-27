// Reusable Popover Component
// Provides a floating tooltip/popover for displaying contextual information

const Popover = {
  isOpen: false,
  currentTarget: null,
  hideTimeout: null,

  // Initialize popover in the page
  init() {
    const existingPopover = document.getElementById('popoverContainer');
    if (existingPopover) return; // Already initialized

    // Create popover HTML
    const popoverHTML = `
      <div id="popoverContainer" class="fixed z-50 pointer-events-none">
        <div id="popoverContent" class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 rounded-lg text-xs shadow-lg max-w-xs pointer-events-auto border border-gray-200 dark:border-gray-700">
          <div id="popoverText"></div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', popoverHTML);

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && e.target !== this.currentTarget && !e.target.closest('#popoverContent')) {
        this.close();
      }
    });
  },

  open(targetElement, content) {
    const container = document.getElementById('popoverContainer');
    if (!container) {
      this.init();
    }

    this.currentTarget = targetElement;
    document.getElementById('popoverText').innerHTML = content;

    const popoverContainer = document.getElementById('popoverContainer');
    const popoverContent = document.getElementById('popoverContent');

    popoverContainer.classList.remove('hidden');
    this.isOpen = true;

    // Position popover near target
    this.positionPopover(targetElement, popoverContent);

    // Clear any existing hide timeout
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
  },

  close() {
    const container = document.getElementById('popoverContainer');
    if (container) {
      container.classList.add('hidden');
    }
    this.isOpen = false;
    this.currentTarget = null;
  },

  positionPopover(target, popover) {
    // Get target position
    const rect = target.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();

    // Default: position above the target
    let top = rect.top - popoverRect.height - 8;
    let left = rect.left + rect.width / 2 - popoverRect.width / 2;

    // Keep within viewport horizontally
    if (left < 8) left = 8;
    if (left + popoverRect.width > window.innerWidth - 8) {
      left = window.innerWidth - popoverRect.width - 8;
    }

    // If not enough space above, position below
    if (top < 8) {
      top = rect.bottom + 8;
    }

    const container = document.getElementById('popoverContainer');
    container.style.top = top + 'px';
    container.style.left = left + 'px';
  },

  // Schedule auto-close after a delay
  autoClose(delay = 3000) {
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    this.hideTimeout = setTimeout(() => this.close(), delay);
  }
};

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Popover.init());
} else {
  Popover.init();
}
