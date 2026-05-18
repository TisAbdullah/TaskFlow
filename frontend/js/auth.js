// ============================================
// Auth Page Logic (Login / Signup)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Redirect if already logged in
    if (api.isAuthenticated()) {
        window.location.href = '/dashboard.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const loginSection = document.getElementById('loginSection');
    const signupSection = document.getElementById('signupSection');
    const authError = document.getElementById('authError');

    // Toggle between login and signup
    if (showSignup) {
        showSignup.addEventListener('click', (e) => {
            e.preventDefault();
            loginSection.classList.add('hidden');
            signupSection.classList.remove('hidden');
            authError.classList.remove('visible');
        });
    }
    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            signupSection.classList.add('hidden');
            loginSection.classList.remove('hidden');
            authError.classList.remove('visible');
        });
    }

    // Login form submit
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const btn = loginForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Signing in...';

            try {
                await api.login(email, password);
                window.location.href = '/dashboard.html';
            } catch (err) {
                authError.textContent = err.message;
                authError.classList.add('visible');
                btn.disabled = false;
                btn.textContent = 'Sign In';
            }
        });
    }

    // Signup form submit
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const btn = signupForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Creating account...';

            try {
                await api.signup(name, email, password);
                window.location.href = '/dashboard.html';
            } catch (err) {
                authError.textContent = err.message;
                authError.classList.add('visible');
                btn.disabled = false;
                btn.textContent = 'Create Account';
            }
        });
    }
});
