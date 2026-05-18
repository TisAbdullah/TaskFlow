// ============================================
// Sidebar Navigation
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Highlight active nav link
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPage.includes(href.replace('.html', ''))) {
            link.classList.add('active');
        }
    });

    // Mobile sidebar toggle
    const menuBtn = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            if (overlay) overlay.classList.toggle('active');
        });
    }
    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }

    // Set user info in sidebar
    const user = api.getUser();
    if (user) {
        const nameEl = document.querySelector('.sidebar-user-name');
        const roleEl = document.querySelector('.sidebar-user-role');
        const avatarEl = document.querySelector('.sidebar-user .avatar');
        if (nameEl) nameEl.textContent = user.name;
        if (roleEl) roleEl.textContent = user.role;
        if (avatarEl) avatarEl.textContent = utils.getInitials(user.name);
    }

    // Logout button
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            api.logout();
        });
    });
});

// Auth guard - redirect to login if not authenticated
(function authGuard() {
    const publicPages = ['index.html', ''];
    const currentPage = window.location.pathname.split('/').pop();
    if (!publicPages.includes(currentPage) && !api.isAuthenticated()) {
        window.location.href = '/index.html';
    }
})();
