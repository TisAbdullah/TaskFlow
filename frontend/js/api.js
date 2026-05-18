// ============================================
// API Client - Centralized fetch wrapper
// ============================================

const API_BASE = '/api';

const api = {
    // Get stored JWT token
    getToken() {
        return localStorage.getItem('taskflow_token');
    },

    // Build headers with auth token
    headers(extra = {}) {
        const h = { 'Content-Type': 'application/json', ...extra };
        const token = this.getToken();
        if (token) h['Authorization'] = `Bearer ${token}`;
        return h;
    },

    // Generic request method
    async request(method, endpoint, body = null) {
        const options = { method, headers: this.headers() };
        if (body) options.body = JSON.stringify(body);

        const res = await fetch(`${API_BASE}${endpoint}`, options);

        // Handle 401 - redirect to login
        if (res.status === 401) {
            localStorage.removeItem('taskflow_token');
            localStorage.removeItem('taskflow_user');
            window.location.href = '/index.html';
            throw new Error('Session expired');
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Request failed');
        return data;
    },

    // Convenience methods
    get(endpoint) { return this.request('GET', endpoint); },
    post(endpoint, body) { return this.request('POST', endpoint, body); },
    put(endpoint, body) { return this.request('PUT', endpoint, body); },
    patch(endpoint, body) { return this.request('PATCH', endpoint, body); },
    delete(endpoint) { return this.request('DELETE', endpoint); },

    // Auth methods
    async login(email, password) {
        const data = await this.post('/auth/login', { email, password });
        localStorage.setItem('taskflow_token', data.token);
        localStorage.setItem('taskflow_user', JSON.stringify(data.user));
        return data;
    },

    async signup(name, email, password) {
        const data = await this.post('/auth/signup', { name, email, password });
        localStorage.setItem('taskflow_token', data.token);
        localStorage.setItem('taskflow_user', JSON.stringify(data.user));
        return data;
    },

    logout() {
        localStorage.removeItem('taskflow_token');
        localStorage.removeItem('taskflow_user');
        window.location.href = '/index.html';
    },

    // Get current user from localStorage
    getUser() {
        const u = localStorage.getItem('taskflow_user');
        return u ? JSON.parse(u) : null;
    },

    // Check if logged in
    isAuthenticated() {
        return !!this.getToken();
    }
};
