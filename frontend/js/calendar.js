// ============================================
// Calendar Module
// ============================================

let calendarDate = new Date();
let calendarTasks = [];
let calendarMeetings = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadCalendarData();
    renderCalendar();
    document.getElementById('prevMonth')?.addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() - 1); renderCalendar(); });
    document.getElementById('nextMonth')?.addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() + 1); renderCalendar(); });
});

async function loadCalendarData() {
    try {
        const [taskData, meetingData] = await Promise.all([api.get('/tasks'), api.get('/meetings')]);
        calendarTasks = taskData.tasks || [];
        calendarMeetings = meetingData || [];
    } catch (e) { console.error(e); }
}

function renderCalendar() {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    document.getElementById('calendarTitle').textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const today = new Date();

    const container = document.getElementById('calendarDays');
    if (!container) return;
    let html = '';
    const startDay = firstDay === 0 ? 6 : firstDay - 1;

    // Previous month days
    for (let i = startDay - 1; i >= 0; i--) {
        html += `<div class="calendar-day other-month"><span class="day-number">${daysInPrev - i}</span></div>`;
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
        const dayTasks = calendarTasks.filter(t => t.due_date && t.due_date.startsWith(dateStr));
        const dayMeetings = calendarMeetings.filter(m => m.meeting_date && m.meeting_date.startsWith(dateStr));
        let events = '';
        dayTasks.slice(0, 2).forEach(t => { events += `<div class="day-event task">${utils.escapeHtml(t.title)}</div>`; });
        dayMeetings.slice(0, 2).forEach(m => { events += `<div class="day-event meeting">${utils.escapeHtml(m.title)}</div>`; });
        const extra = dayTasks.length + dayMeetings.length - 4;
        if (extra > 0) events += `<div class="day-event" style="color:var(--text-muted)">+${extra} more</div>`;
        html += `<div class="calendar-day${isToday ? ' today' : ''}"><span class="day-number">${d}</span><div class="day-events">${events}</div></div>`;
    }

    // Next month days
    const totalCells = startDay + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remaining; i++) {
        html += `<div class="calendar-day other-month"><span class="day-number">${i}</span></div>`;
    }

    container.innerHTML = html;
}
