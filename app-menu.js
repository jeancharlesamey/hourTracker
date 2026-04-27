// App Menu - Reusable dropdown component for Hour Tracker
// Usage: AppMenu.init(options)

const AppMenu = {
  config: {
    darkModeToggleCallback: null,
    settingsCallback: null,
    addTaskCallback: null,
  },

  // Initialize the app menu with event listeners
  init(options = {}) {
    // Store callbacks if provided
    Object.assign(this.config, options);

    // Setup event listeners
    const appMenuBtn = document.getElementById('appMenuBtn');
    const appMenu = document.getElementById('appMenu');
    const appSettingsBtn = document.getElementById('appSettingsBtn');
    const dropdownDarkMode = document.getElementById('dropdownDarkMode');
    const addTaskBtn = document.getElementById('addTaskBtn');

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (appMenuBtn && appMenu && !appMenuBtn.contains(e.target) && !appMenu.contains(e.target)) {
        appMenu.classList.add('hidden');
      }
    });

    // Settings button
    if (appSettingsBtn) {
      appSettingsBtn.addEventListener('click', () => {
        if (appMenu) appMenu.classList.add('hidden');
        if (this.config.settingsCallback) {
          this.config.settingsCallback();
        }
      });
    }

    // Dark mode toggle
    if (dropdownDarkMode) {
      dropdownDarkMode.addEventListener('click', () => {
        if (this.config.darkModeToggleCallback) {
          this.config.darkModeToggleCallback();
        }
      });
    }

    // Add task button
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', () => {
        if (appMenu) appMenu.classList.add('hidden');
        if (this.config.addTaskCallback) {
          this.config.addTaskCallback();
        }
      });
    }
  },

  // Update dark mode knob position
  updateDarkModeKnob(isDark) {
    const dropdownKnob = document.getElementById('dropdownDarkModeKnob');
    if (dropdownKnob) {
      dropdownKnob.style.transform = isDark ? 'translateX(16px)' : 'translateX(0)';
    }
  },

  // Toggle menu visibility
  toggleMenu() {
    const appMenu = document.getElementById('appMenu');
    if (appMenu) {
      appMenu.classList.toggle('hidden');
    }
  },

  // Close menu
  closeMenu() {
    const appMenu = document.getElementById('appMenu');
    if (appMenu) {
      appMenu.classList.add('hidden');
    }
  },

  // Open menu
  openMenu() {
    const appMenu = document.getElementById('appMenu');
    if (appMenu) {
      appMenu.classList.remove('hidden');
    }
  },
};
