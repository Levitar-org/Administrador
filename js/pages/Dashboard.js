import { DB } from '../db.js';
import { Utils } from '../utils.js';
import { router } from '../router.js';

export function DashboardPage() {
  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }

  function getData() {
    const clients = DB.getAll('clients');
    const projects = DB.getAll('projects');
    const tasks = DB.getAll('tasks');
    const objectives = DB.getAll('objectives');
    const notes = DB.getAll('notes');
    const events = DB.getAll('events');
    const history = DB.getAll('history');
    const activeProjects = projects.filter(p => !p.archived && p.status === 'active');
    const pendingTasks = tasks.filter(t => t.status !== 'done');

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const achievedThisWeek = objectives.filter(o =>
      o.status === 'achieved' && new Date(o.updatedAt) >= weekAgo
    );
    const doneThisWeek = tasks.filter(t => {
      const d = new Date(t.updatedAt || t.createdAt);
      return d >= weekAgo && t.status === 'done';
    });

    const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const barData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayTasks = tasks.filter(t => {
        const td = (t.updatedAt || t.createdAt || '').split('T')[0];
        return td === dateStr;
      });
      barData.push({
        label: dayLabels[6 - i],
        done: dayTasks.filter(t => t.status === 'done').length,
        created: dayTasks.length
      });
    }

    const statusCounts = { active: 0, paused: 0, completed: 0 };
    projects.forEach(p => {
      if (p.status === 'active') statusCounts.active++;
      else if (p.status === 'paused') statusCounts.paused++;
      else if (p.status === 'completed') statusCounts.completed++;
    });
    const totalProjects = projects.length || 1;
    const activePct = (statusCounts.active / totalProjects) * 100;
    const pausedPct = (statusCounts.paused / totalProjects) * 100;
    const completedPct = (statusCounts.completed / totalProjects) * 100;
    const donutGradient = `conic-gradient(var(--success) 0% ${activePct}%, var(--warning) ${activePct}% ${activePct + pausedPct}%, var(--text-muted) ${activePct + pausedPct}% 100%)`;

    return {
      activeProjects, pendingTasks, achievedThisWeek, doneThisWeek, barData,
      statusCounts, totalProjects: projects.length, donutGradient,
      objectives: objectives.filter(o => o.status !== 'achieved').slice(0, 5),
      personalTasks: tasks.filter(t => t.workspace === 'personal' && t.status !== 'done'),
      todayEvents: events.filter(e => Utils.isToday(e.date)),
      recentHistory: history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8),
      profile: DB.getProfile()
    };
  }

  function widget(title, content, extraClass) {
    return `
      <div class="dashboard-widget ${extraClass || ''}">
        <h3 class="widget-title">${title}</h3>
        <div class="widget-body">${content}</div>
      </div>
    `;
  }

  function empty() {
    return '<p style="color:var(--text-muted);padding:8px 0">Sin datos</p>';
  }

  return {
    render() {
      const d = getData();
      return `
        <div class="page-enter">
          <div class="welcome-section">
            <h1>${Utils.sanitize(d.profile.name)}</h1>
            <p>${getGreeting()}</p>
          </div>

          <div class="kpi-simple">
            <div class="kpi-card">
              <div class="kpi-card-value">${d.activeProjects.length}</div>
              <div class="kpi-card-label">Proyectos activos</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-card-value">${d.pendingTasks.length}</div>
              <div class="kpi-card-label">Tareas pendientes</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-card-value">${d.achievedThisWeek.length}</div>
              <div class="kpi-card-label">Objetivos logrados esta semana</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-card-value">${d.doneThisWeek.length}</div>
              <div class="kpi-card-label">Tareas completadas esta semana</div>
            </div>
          </div>

          <div class="dashboard-grid">
            ${widget('Distribución de Proyectos', `
              <div style="display:flex;align-items:center;gap:24px">
                <div class="donut-chart" style="background:${d.donutGradient}">
                  <div class="donut-hole">
                    <span class="donut-hole-value">${d.totalProjects}</span>
                    <span class="donut-hole-label">Total</span>
                  </div>
                </div>
                <div class="donut-legend">
                  <div class="donut-legend-item" data-nav="/clients"><span class="donut-legend-dot" style="background:var(--success)"></span>Activos (${d.statusCounts.active})</div>
                  <div class="donut-legend-item" data-nav="/clients"><span class="donut-legend-dot" style="background:var(--warning)"></span>Pausados (${d.statusCounts.paused})</div>
                  <div class="donut-legend-item" data-nav="/clients"><span class="donut-legend-dot" style="background:var(--text-muted)"></span>Completados (${d.statusCounts.completed})</div>
                </div>
              </div>
            `, 'donut-widget')}

            ${widget('Actividad Semanal', (() => {
              const maxVal = Math.max(...d.barData.map(b => b.created), 1);
              return `
                <div class="bar-chart">
                  ${d.barData.map(b => `
                    <div class="bar-chart-column">
                      <div style="font-size:9px;color:var(--text-muted);font-weight:600">${b.done}</div>
                      <div class="bar-chart-bar done" style="height:${(b.done / maxVal) * 80}px"></div>
                      <div class="bar-chart-bar created" style="height:${(b.created / maxVal) * 60}px"></div>
                      <div class="bar-chart-label">${b.label}</div>
                    </div>
                  `).join('')}
                </div>
                <div style="display:flex;gap:16px;margin-top:8px;font-size:var(--text-xs);color:var(--text-muted)">
                  <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:var(--success);vertical-align:middle;margin-right:4px"></span>Completadas</span>
                  <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:var(--accent-soft);vertical-align:middle;margin-right:4px"></span>Creadas</span>
                </div>
              `;
            })(), 'barchart-widget')}

            ${widget('Progreso de Objetivos', (() => {
              if (d.objectives.length === 0) return empty();
              return d.objectives.map(o => {
                const prog = DB.getObjectiveProgress(o.id);
                const p = DB.getById('projects', o.projectId);
                return `
                  <div style="margin-bottom:10px;cursor:pointer" data-nav="/clients">
                    <div style="display:flex;justify-content:space-between;font-size:var(--text-sm);margin-bottom:4px">
                      <span>${Utils.truncate(Utils.sanitize(o.title), 35)}</span>
                      <span style="color:var(--text-muted);font-size:var(--text-xs)">${prog.percent}%${p ? ' · ' + Utils.sanitize(p.name) : ''}</span>
                    </div>
                    <div class="progress-bar" style="height:6px">
                      <div class="progress-fill" style="width:${prog.percent}%;height:6px;background:${o.status === 'achieved' ? 'var(--success)' : 'var(--accent)'}"></div>
                    </div>
                  </div>
                `;
              }).join('');
            })(), 'objectives-widget')}

            ${widget('Hoy', (() => {
              const tasks = d.personalTasks.slice(0, 4);
              const events = d.todayEvents.slice(0, 4);
              if (tasks.length === 0 && events.length === 0) return empty();
              return `
                ${events.map(e => `
                  <div class="widget-item">
                    <span class="widget-date">${Utils.formatTime(e.date)}</span>
                    <span class="calendar-event publication" style="padding:2px 6px;font-size:10px">${Utils.truncate(Utils.sanitize(e.title), 30)}</span>
                  </div>
                `).join('')}
                ${tasks.map(t => `
                  <div class="widget-item" data-nav="${t.projectId ? '/clients' : '/personal/tasks'}">
                    <span class="widget-bullet ${t.status}"></span>
                    ${Utils.truncate(Utils.sanitize(t.title), 40)}
                  </div>
                `).join('')}
              `;
            })(), '')}

            ${widget('Actividad Reciente', (() => {
              if (d.recentHistory.length === 0) return empty();
              return d.recentHistory.map(h => `
                <div class="widget-item">
                  <span class="widget-time">${Utils.getRelativeTime(h.createdAt)}</span>
                  <span class="tag tag-${h.action}" style="font-size:9px;padding:1px 6px">${h.action}</span>
                  <span style="color:var(--text-secondary);font-size:var(--text-xs)">${Utils.sanitize(h.entityType)}</span>
                  ${h.metadata && h.metadata.name ? `<span style="margin-left:auto;font-size:var(--text-xs);color:var(--text-muted)">${Utils.truncate(Utils.sanitize(h.metadata.name), 15)}</span>` : ''}
                </div>
              `).join('');
            })(), '')}
          </div>
        </div>
      `;
    },
    afterRender() {
      document.querySelectorAll('[data-nav]').forEach(el => {
        el.addEventListener('click', () => router.navigate(el.dataset.nav));
      });
    }
  };
}