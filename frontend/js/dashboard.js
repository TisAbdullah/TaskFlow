// ============================================
// Dashboard Logic
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    const user = api.getUser();
    if (!user) return;

    // Welcome message
    const welcomeName = document.getElementById('welcomeName');
    if (welcomeName) welcomeName.textContent = user.name.split(' ')[0];

    // Live clock
    function updateClock() {
        const el = document.getElementById('liveClock');
        if (el) el.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    updateClock();
    setInterval(updateClock, 1000);

    // Load dashboard data
    try {
        const data = await api.get('/dashboard/stats');
        renderStats(data.stats);
        renderChart(data.stats);
        renderWeeklyChart(data.weeklyStats);
        renderActivity(data.recentActivity);
        renderPriorityTasks();
    } catch (err) {
        console.error('Dashboard load failed:', err);
    }
});

function renderStats(s) {
    const cards = [
        { id: 'totalTasks', value: s.total, label: 'Total Tasks', cls: 'purple', icon: '📋' },
        { id: 'completedTasks', value: s.completed, label: 'Completed', cls: 'green', icon: '✅' },
        { id: 'pendingTasks', value: s.pending, label: 'Pending', cls: 'yellow', icon: '⏳' },
        { id: 'overdueTasks', value: s.overdue, label: 'Overdue', cls: 'red', icon: '🔴' },
        { id: 'teamMembers', value: s.memberCount, label: 'Team Members', cls: 'blue', icon: '👥' },
        { id: 'upcomingMeetings', value: s.upcomingMeetings, label: 'Meetings', cls: 'blue', icon: '📅' },
        { id: 'productivity', value: s.productivity, label: 'Productivity %', cls: 'purple', icon: '📈' },
        { id: 'upcomingTasks', value: s.upcoming, label: 'Upcoming', cls: 'blue', icon: '🎯' },
    ];
    cards.forEach((c, i) => {
        const el = document.getElementById(c.id);
        if (el) {
            const valEl = el.querySelector('.stat-value');
            if (valEl) utils.animateCounter(valEl, c.value, 800 + i * 100);
        }
    });
}

function renderChart(stats) {
    const canvas = document.getElementById('taskChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const total = stats.total || 1;
    const data = [
        { value: stats.completed || 0, color: '#10b981', label: 'Completed' },
        { value: stats.in_progress || 0, color: '#3b82f6', label: 'In Progress' },
        { value: stats.pending || 0, color: '#f59e0b', label: 'Pending' },
    ];
    // Draw donut chart
    const cx = canvas.width / 2, cy = canvas.height / 2, r = 80, lw = 24;
    let startAngle = -Math.PI / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    data.forEach(d => {
        const slice = (d.value / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, startAngle + slice);
        ctx.strokeStyle = d.color;
        ctx.lineWidth = lw;
        ctx.stroke();
        startAngle += slice;
    });
    // Center text
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
    ctx.font = 'bold 28px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText(stats.completed || 0, cx, cy);
    ctx.font = '12px Inter';
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim();
    ctx.fillText('completed', cx, cy + 20);
    // Legend
    const legend = document.getElementById('chartLegend');
    if (legend) {
        legend.innerHTML = data.map(d => `<div style="display:flex;align-items:center;gap:6px"><span style="width:10px;height:10px;border-radius:50%;background:${d.color};display:inline-block"></span><span style="font-size:0.8rem;color:var(--text-secondary)">${d.label}: ${d.value}</span></div>`).join('');
    }
}

function renderWeeklyChart(weeklyStats) {
    const canvas = document.getElementById('weeklyChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const values = new Array(7).fill(0);
    // Map weekly stats to days
    weeklyStats.forEach(s => {
        const d = new Date(s.date).getDay();
        const idx = d === 0 ? 6 : d - 1;
        values[idx] = s.count;
    });
    const maxVal = Math.max(...values, 1);
    const barW = 30, gap = 20, startX = 40, chartH = canvas.height - 50, baseY = chartH;
    // Bars
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim();
    values.forEach((v, i) => {
        const x = startX + i * (barW + gap);
        const h = (v / maxVal) * (chartH - 30);
        const gradient = ctx.createLinearGradient(x, baseY - h, x, baseY);
        gradient.addColorStop(0, '#7c3aed');
        gradient.addColorStop(1, '#a855f7');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, baseY - h, barW, h, 4);
        ctx.fill();
        // Day label
        ctx.fillStyle = textColor;
        ctx.font = '11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(days[i], x + barW / 2, baseY + 18);
        // Value on top
        if (v > 0) {
            ctx.fillStyle = '#7c3aed';
            ctx.fillText(v, x + barW / 2, baseY - h - 6);
        }
    });
}

function renderActivity(activities) {
    const container = document.getElementById('activityFeed');
    if (!container) return;
    if (!activities || activities.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No recent activity</p></div>';
        return;
    }
    container.innerHTML = activities.map(a => `
        <div class="activity-item">
            <div class="activity-dot"></div>
            <div class="activity-content">
                <div class="activity-action"><strong>${utils.escapeHtml(a.user_name || 'You')}</strong> ${utils.escapeHtml(a.action)}</div>
                <div class="activity-time">${utils.timeAgo(a.created_at)}</div>
            </div>
        </div>
    `).join('');
}

async function renderPriorityTasks() {
    const container = document.getElementById('priorityTasks');
    if (!container) return;
    try {
        const data = await api.get('/tasks?priority=high&limit=5');
        const tasks = data.tasks || [];
        if (tasks.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No priority tasks</p></div>';
            return;
        }
        container.innerHTML = tasks.map(t => `
            <div class="priority-task" onclick="window.location.href='/tasks.html'">
                <span class="badge badge-${t.priority}">${t.priority}</span>
                <span class="task-title">${utils.escapeHtml(t.title)}</span>
                <span class="task-due ${utils.isOverdue(t.due_date) ? 'overdue' : ''}">${t.due_date ? utils.formatDate(t.due_date) : ''}</span>
            </div>
        `).join('');
    } catch (err) { container.innerHTML = '<p class="text-muted text-sm">Failed to load</p>'; }
}
