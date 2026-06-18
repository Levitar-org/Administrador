import { DB } from '../db.js';
import { Utils } from '../utils.js';
import { router } from '../router.js';

export function DashboardPage() {
  const clients = DB.getAll('clients');
  const campaigns = DB.getAll('campaigns');
  const tasks = DB.getAll('tasks');
  const events = DB.getAll('events');
  const contents = DB.getAll('contents');

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const pendingTasks = tasks.filter(t => t.status !== 'done');
  const doneTasks = tasks.filter(t => t.status === 'done');
  const upcomingEvents = events
    .filter(e => new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const recentContents = [...contents]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Monthly content chart (last 6 months)
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const now = new Date();
  const monthData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const count = contents.filter(c => {
      const cd = new Date(c.createdAt);
      return `${cd.getFullYear()}-${String(cd.getMonth() + 1).padStart(2, '0')}` === key;
    }).length;
    monthData.push({ label: monthNames[d.getMonth()], count });
  }
  const maxMonthCount = Math.max(...monthData.map(m => m.count), 1);

  // Task donut
  const taskTotal = tasks.length || 1;
  const taskDonePct = Math.round((doneTasks.length / taskTotal) * 100);
  const taskPendingPct = 100 - taskDonePct;
  const donutR = 54;
  const donutCirc = 2 * Math.PI * donutR;
  const doneOffset = donutCirc * (1 - taskDonePct / 100);

  return {
    render() {
      return `
        <div class="page-enter">
          <div class="welcome-section">
            <h1>Dashboard</h1>
            <p>Resumen general de tu operación</p>
          </div>

          <div class="stat-grid stagger">
            <div class="stat-card">
              <div class="stat-label">Clientes</div>
              <div class="stat-value">${clients.length}</div>
              <div class="stat-change" style="color:var(--text-muted)">${Utils.pluralize(clients.length, 'cliente activo', 'clientes activos')}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Campañas activas</div>
              <div class="stat-value">${activeCampaigns.length}</div>
              <div class="stat-change" style="color:var(--text-muted)">${Utils.pluralize(activeCampaigns.length, 'campaña en curso', 'campañas en curso')}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Tareas pendientes</div>
              <div class="stat-value">${pendingTasks.length}</div>
              <div class="stat-change" style="color:var(--text-muted)">${Utils.pluralize(pendingTasks.length, 'tarea por hacer', 'tareas por hacer')}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Contenido total</div>
              <div class="stat-value">${contents.length}</div>
              <div class="stat-change" style="color:var(--text-muted)">${Utils.pluralize(contents.length, 'pieza creada', 'piezas creadas')}</div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0">
            <div class="recent-activity">
              <h3>Contenido por mes</h3>
              <div style="padding:16px">
                <svg width="100%" height="200" viewBox="0 0 400 200" style="display:block;max-width:400px;margin:0 auto">
                  <rect x="0" y="0" width="400" height="200" fill="none"/>
                  <line x1="30" y1="180" x2="400" y2="180" stroke="var(--border-light)" stroke-width="1"/>
                  ${monthData.map((m, i) => {
                    const barW = 50;
                    const gap = 8;
                    const x = 30 + i * (barW + gap) + gap;
                    const barH = (m.count / maxMonthCount) * 140;
                    const y = 180 - barH;
                    return `
                      <rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="4" fill="var(--primary)" style="transition:height 0.4s ease"/>
                      <text x="${x + barW / 2}" y="195" text-anchor="middle" font-size="10" fill="var(--text-muted)">${m.label}</text>
                      <text x="${x + barW / 2}" y="${y - 4}" text-anchor="middle" font-size="10" fill="var(--text-secondary)">${m.count}</text>
                    `;
                  }).join('')}
                </svg>
              </div>
            </div>

            <div class="recent-activity">
              <h3>Completitud de tareas</h3>
              <div style="padding:16px;display:flex;flex-direction:column;align-items:center">
                <svg width="180" height="180" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="${donutR}" fill="none" stroke="var(--border-light)" stroke-width="12"/>
                  <circle cx="60" cy="60" r="${donutR}" fill="none" stroke="var(--success)" stroke-width="12"
                    stroke-dasharray="${donutCirc}" stroke-dashoffset="${doneOffset}"
                    transform="rotate(-90, 60, 60)" style="transition:stroke-dashoffset 0.6s ease"/>
                  <text x="60" y="55" text-anchor="middle" font-size="22" font-weight="700" fill="var(--text-primary)">${taskDonePct}%</text>
                  <text x="60" y="72" text-anchor="middle" font-size="9" fill="var(--text-muted)">completado</text>
                </svg>
                <div style="display:flex;gap:24px;margin-top:12px;font-size:var(--text-sm)">
                  <span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:50%;background:var(--success)"></span> ${doneTasks.length} hechas</span>
                  <span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:50%;background:var(--text-muted)"></span> ${pendingTasks.length} pendientes</span>
                </div>
              </div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <div class="recent-activity">
              <h3>Próximos eventos</h3>
              ${upcomingEvents.length === 0 ? `
                <div class="empty-state" style="padding:24px">
                  <p style="color:var(--text-muted)">No hay eventos próximos</p>
                </div>
              ` : `
                <div class="timeline">
                  ${upcomingEvents.map(e => `
                    <div class="timeline-item">
                      <div class="timeline-item-time">${Utils.formatDate(e.date)}</div>
                      <div class="timeline-item-content">${Utils.sanitize(e.title)}</div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>

            <div class="recent-activity">
              <h3>Contenido reciente</h3>
              ${recentContents.length === 0 ? `
                <div class="empty-state" style="padding:24px">
                  <p style="color:var(--text-muted)">No hay contenido aún</p>
                </div>
              ` : `
                <div class="timeline">
                  ${recentContents.map(c => `
                    <div class="timeline-item">
                      <div class="timeline-item-time">${Utils.getRelativeTime(c.createdAt)} · <span class="tag tag-${c.type}">${Utils.statusLabel(c.type)}</span></div>
                      <div class="timeline-item-content">${Utils.sanitize(c.title)}</div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>

          ${clients.length > 0 ? `
            <div style="margin-top:24px">
              <div class="recent-activity">
                <h3>Clientes</h3>
                <div class="card-grid stagger" style="margin-top:12px">
                  ${clients.map(c => `
                    <div class="client-card" data-client-id="${c.id}">
                      <div class="client-card-header">
                        <div class="client-card-avatar">${c.name.charAt(0)}</div>
                        <div>
                          <div class="client-card-name">${Utils.sanitize(c.name)}</div>
                          <div class="client-card-industry">${Utils.sanitize(c.industry)}</div>
                        </div>
                      </div>
                      <div class="client-card-body">
                        <div class="services-list">
                          ${(c.services || []).map(s => `<span class="service-tag">${Utils.sanitize(s)}</span>`).join('')}
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          ` : ''}
        </div>
      `;
    },
    afterRender() {
      document.querySelectorAll('.client-card').forEach(el => {
        el.addEventListener('click', () => {
          router.navigate(`/clients/${el.dataset.clientId}`);
        });
      });
    }
  };
}
