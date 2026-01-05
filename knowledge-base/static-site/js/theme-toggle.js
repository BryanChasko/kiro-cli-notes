/**
 * Theme Toggle System with SVG Icons and Persistence
 */
class ThemeToggle {
    constructor() {
        this.currentTheme = this.getInitialTheme();
        this.init();
    }

    getInitialTheme() {
        // Check localStorage first
        const stored = localStorage.getItem('theme');
        if (stored && ['light', 'dark'].includes(stored)) {
            return stored;
        }
        
        // Fall back to system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    init() {
        this.createToggle();
        this.applyTheme(this.currentTheme);
        this.bindEvents();
    }

    createToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'theme-toggle';
        toggle.setAttribute('aria-label', 'Toggle theme');
        toggle.innerHTML = this.getToggleIcon();
        
        // Insert into header or create floating toggle
        const header = document.querySelector('.header');
        if (header) {
            header.appendChild(toggle);
        } else {
            toggle.classList.add('theme-toggle--floating');
            document.body.appendChild(toggle);
        }
        
        this.toggle = toggle;
    }

    getToggleIcon() {
        const sunIcon = `
            <svg class="theme-toggle__icon theme-toggle__icon--sun" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="4" stroke="currentColor" stroke-width="1.5"/>
                <path d="M10 2V4M10 16V18M18 10H16M4 10H2M15.314 4.686L13.9 6.1M6.1 13.9L4.686 15.314M15.314 15.314L13.9 13.9M6.1 6.1L4.686 4.686" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
        `;
        
        const moonIcon = `
            <svg class="theme-toggle__icon theme-toggle__icon--moon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        
        return sunIcon + moonIcon;
    }

    bindEvents() {
        this.toggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    }

    applyTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update toggle state
        if (this.toggle) {
            this.toggle.setAttribute('data-theme', theme);
            this.toggle.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`);
        }
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    window.themeToggle = new ThemeToggle();
});
