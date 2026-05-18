// ============================================
// Theme Toggle (Dark / Light Mode)
// ============================================

const theme = {
    init() {
        const saved = localStorage.getItem('taskflow_theme') || 'dark';
        this.set(saved);
        // Bind toggle buttons
        document.querySelectorAll('.theme-toggle').forEach(btn => {
            btn.addEventListener('click', () => this.toggle());
        });
    },

    set(mode) {
        document.documentElement.setAttribute('data-theme', mode);
        localStorage.setItem('taskflow_theme', mode);
        // Update toggle icon
        document.querySelectorAll('.theme-toggle').forEach(btn => {
            btn.innerHTML = mode === 'dark' ? '☀️' : '🌙';
        });
    },

    toggle() {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        this.set(current === 'dark' ? 'light' : 'dark');
    },

    get() {
        return localStorage.getItem('taskflow_theme') || 'dark';
    }
};

// Auto-init when script loads
document.addEventListener('DOMContentLoaded', () => theme.init());
