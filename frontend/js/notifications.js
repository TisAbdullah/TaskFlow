// ============================================
// Notifications Panel
// ============================================

const notifications = {
    async load() {
        try {
            const data = await api.get('/notifications');
            const badge = document.querySelector('.notification-badge');
            if (badge) {
                badge.textContent = data.unreadCount;
                badge.style.display = data.unreadCount > 0 ? 'flex' : 'none';
            }
        } catch (e) { /* silent */ }
    },

    init() {
        this.load();
        // Refresh every 30 seconds
        setInterval(() => this.load(), 30000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (api.isAuthenticated()) notifications.init();
});
