import { DB } from '../db.js';
import { Utils } from '../utils.js';
import { router } from '../router.js';
import { showModal } from '../components/Modal.js';
import { showToast } from '../components/Toast.js';
import { CalendarGrid } from '../components/Calendar.js';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'objectives', label: 'Objetivos' },
  { id: 'campaigns', label: 'Campañas' },
  { id: 'content', label: 'Contenido' },
  { id: 'planner', label: 'Planner' },
  { id: 'calendar', label: 'Calendario' },
  { id: 'tasks', label: 'Tareas' },
  { id: 'files', label: 'Archivos' },
  { id: 'prompts', label: 'Prompts' },
  { id: 'notes', label: 'Notas' },
  { id: 'meetings', label: 'Reuniones' },
  { id: 'history', label: 'Historial' },
];

export function ProjectDetailPage(params) {
  const projectId = params.pid;
  const clientId = params.id || null;
  let activeTab = 'overview';
  let contentFilter = 'all';
  let campaignFilter = 'all';
  let promptFilter = 'all';

  function getProject() {
    return DB.getById('projects', projectId);
  }

  function getClient() {
    return clientId ? DB.getById('clients', clientId) : null;
  }

  function renderHeader(project, client) {
    const backHref = clientId ? `/clients/${clientId}` : '/personal';
    return `
      <div class="detail-header">
        <button class="btn btn-ghost" id="backBtn">← Volver</button>
        <div class="detail-header-info">
          <div class="detail-avatar" style="background:${project.workspace === 'personal' ? 'var(--success)' : 'var(--primary)'}">${project.name.charAt(0)}</div>
          <div>
            <h1>${Utils.sanitize(project.name)}</h1>
            <p style="color:var(--text-muted)">
              ${project.workspace === 'personal' ? 'Workspace Personal' : Utils.sanitize(client ? client.name : '')}
              · <span class="tag tag-${project.status}">${Utils.statusLabel(project.status)}</span>
            </p>
          </div>
        </div>
        <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
          <span class="project-meta">Creado ${Utils.getRelativeTime(project.createdAt)}</span>
          <button class="btn btn-secondary" id="editProjectBtn">✏️ Editar</button>
        </div>
      </div>
    `;
  }

  function renderTabs() {
    return `
      <div class="tabs detail-tabs" style="margin-top:16px">
        ${TABS.map(t => `
          <button class="tab-btn ${activeTab === t.id ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>
        `).join('')}
      </div>
    `;
  }

  function renderOverview() {
    const project = getProject();
    const contents = DB.where('contents', c => c.projectId === projectId);
    const tasks = DB.where('tasks', t => t.projectId === projectId);
    const objectives = DB.where('objectives', o => o.projectId === projectId);
    const events = DB.where('events', e => e.projectId === projectId);
    const campaignCount = DB.where('campaigns', c => c.projectId === projectId).length;
    const doneTasks = tasks.filter(t => t.status === 'done');
    const activeObjectives = objectives.filter(o => o.status !== 'achieved');

    return `
      <div class="page-enter" style="margin-top:16px">
        <div class="stat-grid">
          <div class="stat-card"><div class="stat-label">Campañas</div><div class="stat-value">${campaignCount}</div></div>
          <div class="stat-card"><div class="stat-label">Contenido</div><div class="stat-value">${contents.length}</div></div>
          <div class="stat-card"><div class="stat-label">Tareas</div><div class="stat-value">${tasks.length}</div><div class="stat-change">${doneTasks.length} completadas</div></div>
          <div class="stat-card"><div class="stat-label">Eventos</div><div class="stat-value">${events.length}</div></div>
          <div class="stat-card"><div class="stat-label">Objetivos</div><div class="stat-value">${objectives.length}</div><div class="stat-change">${activeObjectives.length} activos</div></div>
        </div>

        ${objectives.length > 0 ? `
          <div class="card" style="margin-top:16px;padding:16px">
            <h3 style="margin-bottom:12px">Objetivos del proyecto</h3>
            <div class="objectives-list">
              ${objectives.slice(0, 5).map(o => {
                const prog = DB.getObjectiveProgress(o.id);
                return `
                <div class="objective-item" style="flex-direction:column;align-items:stretch;gap:6px;padding:8px 0">
                  <div style="display:flex;align-items:center;gap:8px">
                    <span class="objective-status objective-${o.status}"></span>
                    <strong style="font-size:var(--text-sm)">${Utils.sanitize(o.title)}</strong>
                    ${o.targetDate ? `<span style="color:var(--text-muted);font-size:var(--text-xs)">${Utils.formatDate(o.targetDate)}</span>` : ''}
                  </div>
                  ${prog.total > 0 ? `
                  <div class="progress-bar" style="height:6px">
                    <div class="progress-fill" style="width:${prog.percent}%;height:6px;background:${o.status === 'achieved' ? 'var(--success)' : 'var(--accent)'}"></div>
                  </div>
                  <div style="font-size:var(--text-xs);color:var(--text-muted)">${prog.done}/${prog.total} tareas · ${prog.percent}%</div>` : ''}
                </div>
              `}).join('')}
            </div>
          </div>
        ` : ''}

        <div class="card" style="margin-top:16px;padding:16px">
          <h3 style="margin-bottom:12px">Descripción</h3>
          <p style="color:var(--text-secondary)">${Utils.sanitize(project.description || 'Sin descripción')}</p>
        </div>
      </div>
    `;
  }

  function renderObjectives() {
    const objectives = DB.where('objectives', o => o.projectId === projectId);
    return `
      <div class="page-enter" style="margin-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h3>Objetivos (${objectives.length})</h3>
          <button class="btn btn-primary" id="addObjectiveBtn">+ Nuevo objetivo</button>
        </div>
        ${objectives.length === 0 ? `
          <div class="empty-state"><p style="color:var(--text-muted)">No hay objetivos definidos</p></div>
        ` : `
          <div class="objectives-list">
            ${objectives.map(o => {
              const prog = DB.getObjectiveProgress(o.id);
              return `
              <div class="card" style="padding:16px;margin-bottom:8px">
                <div style="display:flex;justify-content:space-between;align-items:start">
                  <div style="flex:1">
                    <div style="display:flex;align-items:center;gap:8px">
                      <span class="objective-status objective-${o.status}"></span>
                      <strong>${Utils.sanitize(o.title)}</strong>
                      <span class="tag tag-${o.type}">${Utils.statusLabel(o.type)}</span>
                      ${prog.total > 0 ? `<span class="tag" style="background:var(--surface-secondary);color:var(--text-secondary)">${prog.done}/${prog.total} tareas</span>` : ''}
                    </div>
                    ${o.description ? `<p style="color:var(--text-muted);font-size:var(--text-sm);margin-top:4px">${Utils.sanitize(o.description)}</p>` : ''}
                    ${prog.total > 0 ? `
                    <div class="progress-bar" style="margin-top:8px">
                      <div class="progress-fill" style="width:${prog.percent}%;background:${o.status === 'achieved' ? 'var(--success)' : 'var(--accent)'}"></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--text-muted);margin-top:2px">
                      <span>${prog.percent}% completado</span>
                      <span>${prog.done} de ${prog.total} tareas</span>
                    </div>` : ''}
                  </div>
                  <div style="display:flex;gap:4px;flex-shrink:0">
                    <button class="btn btn-sm btn-ghost objective-status-btn" data-id="${o.id}" data-status="${o.status}">✓</button>
                    <button class="btn btn-sm btn-ghost objective-del-btn" data-id="${o.id}">✕</button>
                  </div>
                </div>
                ${o.targetDate ? `<div style="margin-top:8px;font-size:var(--text-sm);color:var(--text-muted)">Meta: ${Utils.formatDate(o.targetDate)}</div>` : ''}
              </div>
            `}).join('')}
          </div>
        `}
      </div>
    `;
  }

  function renderCampaigns() {
    const campaigns = DB.where('campaigns', c => c.projectId === projectId);
    const filtered = campaignFilter === 'all' ? campaigns : campaigns.filter(c => c.status === campaignFilter);
    const statuses = ['all', 'active', 'paused', 'completed'];

    return `
      <div class="page-enter" style="margin-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h3>Campañas (${campaigns.length})</h3>
          <button class="btn btn-primary" id="addCampaignBtn">+ Nueva campaña</button>
        </div>
        <div class="filter-bar" style="margin-bottom:12px">
          ${statuses.map(s => `
            <button class="btn btn-sm ${campaignFilter === s ? 'btn-primary' : 'btn-ghost'}" data-campaign-filter="${s}">${Utils.statusLabel(s)}</button>
          `).join('')}
        </div>
        ${filtered.length === 0 ? `
          <div class="empty-state"><p style="color:var(--text-muted)">No hay campañas</p></div>
        ` : `
          <div class="card-grid">
            ${filtered.map(c => `
              <div class="card" style="padding:16px">
                <div style="display:flex;justify-content:space-between;align-items:start">
                  <h4>${Utils.sanitize(c.name)}</h4>
                  <span class="tag tag-${c.status}">${Utils.statusLabel(c.status)}</span>
                </div>
                <p style="color:var(--text-muted);font-size:var(--text-sm);margin-top:8px">${Utils.sanitize(c.objective || '')}</p>
                <div style="display:flex;gap:4px;margin-top:8px">
                  <button class="btn btn-sm btn-ghost campaign-edit-btn" data-id="${c.id}">✏️</button>
                  <button class="btn btn-sm btn-ghost campaign-del-btn" data-id="${c.id}">✕</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  function renderContent() {
    const contents = DB.where('contents', c => c.projectId === projectId);
    const filtered = contentFilter === 'all' ? contents : contents.filter(c => c.type === contentFilter);
    const types = ['all', 'post', 'story', 'reel'];

    return `
      <div class="page-enter" style="margin-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h3>Contenido (${contents.length})</h3>
          <button class="btn btn-primary" id="addContentBtn">+ Nuevo contenido</button>
        </div>
        <div class="filter-bar" style="margin-bottom:12px">
          ${types.map(t => `
            <button class="btn btn-sm ${contentFilter === t ? 'btn-primary' : 'btn-ghost'}" data-content-filter="${t}">${Utils.statusLabel(t)}</button>
          `).join('')}
        </div>
        ${filtered.length === 0 ? `
          <div class="empty-state"><p style="color:var(--text-muted)">No hay contenido</p></div>
        ` : `
          <div class="card-grid">
            ${filtered.map(c => `
              <div class="card" style="padding:16px">
                <div style="display:flex;justify-content:space-between;align-items:start">
                  <h4>${Utils.sanitize(c.title)}</h4>
                  <div style="display:flex;gap:4px">
                    <span class="tag tag-${c.type}">${Utils.statusLabel(c.type)}</span>
                    <span class="tag tag-${c.status}">${Utils.statusLabel(c.status)}</span>
                  </div>
                </div>
                <p style="color:var(--text-muted);font-size:var(--text-sm);margin-top:8px">${Utils.truncate(Utils.sanitize(c.description || ''), 100)}</p>
                <div style="display:flex;gap:4px;margin-top:8px">
                  <button class="btn btn-sm btn-ghost content-edit-btn" data-id="${c.id}">✏️</button>
                  <button class="btn btn-sm btn-ghost content-del-btn" data-id="${c.id}">✕</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  function renderPlanner() {
    const items = DB.where('planner', p => p.projectId === projectId);
    return `
      <div class="page-enter" style="margin-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h3>Planner (${items.length})</h3>
          <button class="btn btn-primary" id="addPlannerBtn">+ Nuevo item</button>
        </div>
        ${items.length === 0 ? `
          <div class="empty-state"><p style="color:var(--text-muted)">No hay items en el planner</p></div>
        ` : `
          <div class="planner-list">
            ${items.map(p => `
              <div class="planner-item ${p.status === 'done' ? 'planner-done' : ''}">
                <label class="planner-checkbox">
                  <input type="checkbox" ${p.status === 'done' ? 'checked' : ''} data-planner-id="${p.id}">
                  <span class="checkmark"></span>
                </label>
                <div class="planner-content">
                  <span class="planner-title">${Utils.sanitize(p.title)}</span>
                  ${p.dueDate ? `<span class="planner-date">${Utils.formatDateShort(p.dueDate)}</span>` : ''}
                </div>
                <button class="btn btn-sm btn-ghost planner-del-btn" data-id="${p.id}">✕</button>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  function renderCalendar() {
    const events = DB.where('events', e => e.projectId === projectId);
    const tasks = DB.where('tasks', t => t.projectId === projectId);
    return `
      <div class="page-enter" style="margin-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h3>Calendario</h3>
          <button class="btn btn-primary" id="addEventBtn">+ Nuevo evento</button>
        </div>
        <div class="calendar-layout">
          <div id="calendarContainer"></div>
        </div>
      </div>
    `;
  }

  function renderTasks() {
    const tasks = DB.where('tasks', t => t.projectId === projectId);
    const columns = ['todo', 'in_progress', 'done'];
    const columnLabels = { todo: 'Por hacer', in_progress: 'En progreso', done: 'Completada' };

    return `
      <div class="page-enter" style="margin-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h3>Tareas (${tasks.length})</h3>
          <button class="btn btn-primary" id="addTaskBtn">+ Nueva tarea</button>
        </div>
        <div class="kanban-board">
          ${columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col);
            return `
              <div class="kanban-column" data-status="${col}">
                <div class="kanban-column-header">
                  <span>${columnLabels[col]}</span>
                  <span class="kanban-count">${colTasks.length}</span>
                </div>
                <div class="kanban-items" id="kanban-${col}">
                  ${colTasks.map(t => {
                    const obj = t.objectiveId ? DB.getById('objectives', t.objectiveId) : null;
                    return `
                    <div class="kanban-item" draggable="true" data-task-id="${t.id}">
                      <div class="kanban-item-title">${Utils.sanitize(t.title)}</div>
                      ${obj ? `<div class="kanban-item-obj"><span class="objective-dot objective-${obj.status}"></span>${Utils.truncate(Utils.sanitize(obj.title), 30)}</div>` : ''}
                      ${t.description ? `<div class="kanban-item-desc">${Utils.truncate(Utils.sanitize(t.description), 50)}</div>` : ''}
                      <button class="btn btn-sm btn-ghost task-del-btn" data-id="${t.id}">✕</button>
                    </div>
                  `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderFiles() {
    const files = DB.where('files', f => f.projectId === projectId);
    return `
      <div class="page-enter" style="margin-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h3>Archivos (${files.length})</h3>
          <button class="btn btn-primary" id="addFileBtn">+ Agregar archivo</button>
        </div>
        ${files.length === 0 ? `
          <div class="empty-state"><p style="color:var(--text-muted)">No hay archivos</p></div>
        ` : `
          <div class="card-grid">
            ${files.map(f => `
              <div class="card" style="padding:16px">
                <div style="display:flex;align-items:center;gap:8px">
                  <span style="font-size:24px">${f.type === 'image' ? '🖼' : f.type === 'pdf' ? '📄' : '🔗'}</span>
                  <div>
                    <strong>${Utils.sanitize(f.name)}</strong>
                    <div style="color:var(--text-muted);font-size:var(--text-sm)">${Utils.sanitize(f.type)} · ${Utils.sanitize(f.size)}</div>
                  </div>
                </div>
                <div style="display:flex;gap:4px;margin-top:8px">
                  ${f.url && f.url !== '#' ? `<a href="${Utils.sanitize(f.url)}" target="_blank" class="btn btn-sm btn-primary">Abrir</a>` : ''}
                  <button class="btn btn-sm btn-ghost file-del-btn" data-id="${f.id}">✕</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  function renderPrompts() {
    const prompts = DB.where('prompts', p => p.projectId === projectId);
    const filtered = promptFilter === 'all' ? prompts : prompts.filter(p => p.type === promptFilter);
    const types = ['all', 'copy', 'branding', 'campaign', 'reels'];

    return `
      <div class="page-enter" style="margin-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h3>Prompts (${prompts.length})</h3>
          <button class="btn btn-primary" id="addPromptBtn">+ Nuevo prompt</button>
        </div>
        <div class="filter-bar" style="margin-bottom:12px">
          ${types.map(t => `
            <button class="btn btn-sm ${promptFilter === t ? 'btn-primary' : 'btn-ghost'}" data-prompt-filter="${t}">${Utils.statusLabel(t)}</button>
          `).join('')}
        </div>
        ${filtered.length === 0 ? `
          <div class="empty-state"><p style="color:var(--text-muted)">No hay prompts</p></div>
        ` : `
          <div class="card-grid">
            ${filtered.map(p => `
              <div class="card" style="padding:16px">
                <div style="display:flex;justify-content:space-between;align-items:start">
                  <h4>${Utils.sanitize(p.title)}</h4>
                  <span class="tag tag-${p.type}">${Utils.statusLabel(p.type)}</span>
                </div>
                <pre style="background:var(--bg-secondary);padding:12px;border-radius:6px;margin-top:8px;font-size:var(--text-sm);white-space:pre-wrap;color:var(--text-secondary)">${Utils.sanitize(p.content)}</pre>
                <div style="display:flex;gap:4px;margin-top:8px">
                  <button class="btn btn-sm btn-secondary copy-prompt-btn" data-content="${Utils.sanitize(p.content)}">📋 Copiar</button>
                  <button class="btn btn-sm btn-ghost prompt-del-btn" data-id="${p.id}">✕</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  function renderNotes() {
    const notes = DB.where('notes', n => n.projectId === projectId);
    return `
      <div class="page-enter" style="margin-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h3>Notas (${notes.length})</h3>
          <button class="btn btn-primary" id="addNoteBtn">+ Nueva nota</button>
        </div>
        ${notes.length === 0 ? `
          <div class="empty-state"><p style="color:var(--text-muted)">No hay notas</p></div>
        ` : `
          <div class="notes-list">
            ${notes.map(n => `
              <div class="card note-card ${n.pinned ? 'note-pinned' : ''}" style="padding:16px;margin-bottom:8px">
                <div style="display:flex;justify-content:space-between;align-items:start">
                  <div style="flex:1">
                    <div style="display:flex;align-items:center;gap:8px">
                      ${n.pinned ? '<span>📌</span>' : ''}
                      <strong>${Utils.sanitize(n.title)}</strong>
                    </div>
                    <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-top:4px;white-space:pre-wrap">${Utils.sanitize(n.content)}</p>
                    ${n.tags && n.tags.length ? `<div style="display:flex;gap:4px;margin-top:8px">${n.tags.map(tg => `<span class="tag">${Utils.sanitize(tg)}</span>`).join('')}</div>` : ''}
                  </div>
                  <button class="btn btn-sm btn-ghost note-del-btn" data-id="${n.id}">✕</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  function renderMeetings() {
    const meetings = DB.where('meetings', m => m.projectId === projectId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    return `
      <div class="page-enter" style="margin-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h3>Reuniones (${meetings.length})</h3>
          <button class="btn btn-primary" id="addMeetingBtn">+ Nueva reunión</button>
        </div>
        ${meetings.length === 0 ? `
          <div class="empty-state"><p style="color:var(--text-muted)">No hay reuniones</p></div>
        ` : `
          <div class="timeline">
            ${meetings.map(m => `
              <div class="timeline-item">
                <div class="timeline-item-time">${Utils.formatDate(m.date)}</div>
                <div class="timeline-item-content">
                  <strong>${Utils.sanitize(m.title)}</strong>
                  ${m.notes ? `<p style="color:var(--text-muted);font-size:var(--text-sm);margin-top:4px">${Utils.truncate(Utils.sanitize(m.notes), 120)}</p>` : ''}
                </div>
                <button class="btn btn-sm btn-ghost meeting-del-btn" data-id="${m.id}">✕</button>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  function renderHistory() {
    const history = DB.where('history', h => h.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return `
      <div class="page-enter" style="margin-top:16px">
        <h3 style="margin-bottom:12px">Historial de actividad</h3>
        ${history.length === 0 ? `
          <div class="empty-state"><p style="color:var(--text-muted)">Sin actividad registrada</p></div>
        ` : `
          <div class="timeline">
            ${history.map(h => `
              <div class="timeline-item">
                <div class="timeline-item-time">${Utils.getRelativeTime(h.createdAt)}</div>
                <div class="timeline-item-content">
                  <span class="tag tag-${h.action}" style="margin-right:4px">${h.action}</span>
                  ${Utils.sanitize(h.entityType)} ${h.metadata && h.metadata.name ? `· ${Utils.sanitize(h.metadata.name)}` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  function showAddObjective() {
    showModal('Nuevo Objetivo', `
      <div class="form-group"><label>Título</label><input type="text" id="objTitle" class="form-input" autofocus></div>
      <div class="form-group"><label>Descripción</label><textarea id="objDesc" class="form-input" rows="2"></textarea></div>
      <div class="form-group"><label>Tipo</label><select id="objType" class="form-input"><option value="goal">Meta</option><option value="milestone">Hito</option><option value="kpi">KPI</option></select></div>
      <div class="form-group"><label>Fecha meta</label><input type="date" id="objTarget" class="form-input"></div>
    `, [
      { label: 'Cancelar', class: 'btn btn-secondary', action: c => c() },
      { label: 'Crear', class: 'btn btn-primary', action: c => {
        const title = document.getElementById('objTitle').value.trim();
        if (!title) return showToast('El título es obligatorio', 'warning');
        DB.create('objectives', { projectId, title, description: document.getElementById('objDesc').value.trim(), type: document.getElementById('objType').value, targetDate: document.getElementById('objTarget').value, status: 'pending' });
        DB.createHistoryEntry('create', 'objective', '', { projectId, workspace: 'client', name: title });
        showToast('Objetivo creado', 'success'); c(); reRender();
      }}
    ]);
  }

  function showAddCampaign() {
    showModal('Nueva Campaña', `
      <div class="form-group"><label>Nombre</label><input type="text" id="campName" class="form-input" autofocus></div>
      <div class="form-group"><label>Objetivo</label><textarea id="campObj" class="form-input" rows="2"></textarea></div>
      <div class="form-group"><label>Estado</label><select id="campStatus" class="form-input"><option value="active">Activo</option><option value="paused">Pausado</option><option value="completed">Completado</option></select></div>
    `, [
      { label: 'Cancelar', class: 'btn btn-secondary', action: c => c() },
      { label: 'Crear', class: 'btn btn-primary', action: c => {
        const name = document.getElementById('campName').value.trim();
        if (!name) return showToast('El nombre es obligatorio', 'warning');
        DB.create('campaigns', { clientId, projectId, name, objective: document.getElementById('campObj').value.trim(), status: document.getElementById('campStatus').value, archived: false });
        showToast('Campaña creada', 'success'); c(); reRender();
      }}
    ]);
  }

  function showAddContent() {
    showModal('Nuevo Contenido', `
      <div class="form-group"><label>Título</label><input type="text" id="contTitle" class="form-input" autofocus></div>
      <div class="form-group"><label>Descripción</label><textarea id="contDesc" class="form-input" rows="2"></textarea></div>
      <div class="form-group"><label>Tipo</label><select id="contType" class="form-input"><option value="post">Post</option><option value="story">Historia</option><option value="reel">Reel</option></select></div>
      <div class="form-group"><label>Estado</label><select id="contStatus" class="form-input"><option value="draft">Borrador</option><option value="published">Publicado</option></select></div>
    `, [
      { label: 'Cancelar', class: 'btn btn-secondary', action: c => c() },
      { label: 'Crear', class: 'btn btn-primary', action: c => {
        const title = document.getElementById('contTitle').value.trim();
        if (!title) return showToast('El título es obligatorio', 'warning');
        DB.create('contents', { clientId, projectId, title, description: document.getElementById('contDesc').value.trim(), type: document.getElementById('contType').value, status: document.getElementById('contStatus').value });
        showToast('Contenido creado', 'success'); c(); reRender();
      }}
    ]);
  }

  function showAddPlanner() {
    showModal('Nuevo Item en Planner', `
      <div class="form-group"><label>Título</label><input type="text" id="planTitle" class="form-input" autofocus></div>
      <div class="form-group"><label>Fecha límite</label><input type="date" id="planDate" class="form-input"></div>
    `, [
      { label: 'Cancelar', class: 'btn btn-secondary', action: c => c() },
      { label: 'Crear', class: 'btn btn-primary', action: c => {
        const title = document.getElementById('planTitle').value.trim();
        if (!title) return showToast('El título es obligatorio', 'warning');
        DB.create('planner', { projectId, title, dueDate: document.getElementById('planDate').value, status: 'pending' });
        showToast('Item creado', 'success'); c(); reRender();
      }}
    ]);
  }

  function showAddEvent() {
    showModal('Nuevo Evento', `
      <div class="form-group"><label>Título</label><input type="text" id="evtTitle" class="form-input" autofocus></div>
      <div class="form-group"><label>Fecha</label><input type="date" id="evtDate" class="form-input"></div>
      <div class="form-group"><label>Tipo</label><select id="evtType" class="form-input"><option value="publication">Publicación</option><option value="meeting">Reunión</option><option value="delivery">Entrega</option></select></div>
    `, [
      { label: 'Cancelar', class: 'btn btn-secondary', action: c => c() },
      { label: 'Crear', class: 'btn btn-primary', action: c => {
        const title = document.getElementById('evtTitle').value.trim();
        if (!title) return showToast('El título es obligatorio', 'warning');
        DB.create('events', { clientId, projectId, title, date: document.getElementById('evtDate').value, type: document.getElementById('evtType').value, description: '' });
        showToast('Evento creado', 'success'); c(); reRender();
      }}
    ]);
  }

  function getObjectivesOptions() {
    const objectives = DB.where('objectives', o => o.projectId === projectId && o.status !== 'achieved');
    if (objectives.length === 0) return '<option value="">Sin objetivos disponibles</option>';
    return objectives.map(o => `<option value="${o.id}">${Utils.sanitize(o.title)}</option>`).join('');
  }

  function showAddTask() {
    showModal('Nueva Tarea', `
      <div class="form-group"><label>Título</label><input type="text" id="taskTitle" class="form-input" autofocus></div>
      <div class="form-group"><label>Descripción</label><textarea id="taskDesc" class="form-input" rows="2"></textarea></div>
      <div class="form-group"><label>Fecha de vencimiento</label><input type="date" id="taskDueDate" class="form-input"></div>
      <div class="form-group"><label>Objetivo vinculado</label><select id="taskObjective" class="form-input"><option value="">Sin objetivo</option>${getObjectivesOptions()}</select></div>
    `, [
      { label: 'Cancelar', class: 'btn btn-secondary', action: c => c() },
      { label: 'Crear', class: 'btn btn-primary', action: c => {
        const title = document.getElementById('taskTitle').value.trim();
        if (!title) return showToast('El título es obligatorio', 'warning');
        const objectiveId = document.getElementById('taskObjective')?.value || null;
        DB.create('tasks', { clientId, projectId, title, description: document.getElementById('taskDesc').value.trim(), dueDate: document.getElementById('taskDueDate').value || null, status: 'todo', objectiveId });
        showToast('Tarea creada', 'success'); c(); reRender();
      }}
    ]);
  }

  function showAddFile() {
    showModal('Agregar Archivo', `
      <div class="form-group"><label>Nombre</label><input type="text" id="fileTitle" class="form-input" autofocus></div>
      <div class="form-group"><label>URL</label><input type="url" id="fileUrl" class="form-input" placeholder="https://..."></div>
      <div class="form-group"><label>Tipo</label><select id="fileType" class="form-input"><option value="link">Link</option><option value="image">Imagen</option><option value="pdf">PDF</option><option value="doc">Documento</option></select></div>
    `, [
      { label: 'Cancelar', class: 'btn btn-secondary', action: c => c() },
      { label: 'Agregar', class: 'btn btn-primary', action: c => {
        const name = document.getElementById('fileTitle').value.trim();
        if (!name) return showToast('El nombre es obligatorio', 'warning');
        DB.create('files', { projectId, name, url: document.getElementById('fileUrl').value.trim(), type: document.getElementById('fileType').value, size: '-' });
        showToast('Archivo agregado', 'success'); c(); reRender();
      }}
    ]);
  }

  function showAddPrompt() {
    showModal('Nuevo Prompt', `
      <div class="form-group"><label>Título</label><input type="text" id="promptTitle" class="form-input" autofocus></div>
      <div class="form-group"><label>Tipo</label><select id="promptType" class="form-input"><option value="copy">Copy</option><option value="branding">Branding</option><option value="campaign">Campaña</option><option value="reels">Reels</option></select></div>
      <div class="form-group"><label>Contenido del prompt</label><textarea id="promptContent" class="form-input" rows="4" placeholder="Escribí el prompt con placeholders como [cliente]..."></textarea></div>
    `, [
      { label: 'Cancelar', class: 'btn btn-secondary', action: c => c() },
      { label: 'Crear', class: 'btn btn-primary', action: c => {
        const title = document.getElementById('promptTitle').value.trim();
        const content = document.getElementById('promptContent').value.trim();
        if (!title || !content) return showToast('Completá todos los campos', 'warning');
        DB.create('prompts', { clientId, projectId, title, content, type: document.getElementById('promptType').value });
        showToast('Prompt creado', 'success'); c(); reRender();
      }}
    ]);
  }

  function showAddNote() {
    showModal('Nueva Nota', `
      <div class="form-group"><label>Título</label><input type="text" id="noteTitle" class="form-input" autofocus></div>
      <div class="form-group"><label>Contenido</label><textarea id="noteContent" class="form-input" rows="4"></textarea></div>
      <div class="form-group"><label>Tags (separados por coma)</label><input type="text" id="noteTags" class="form-input" placeholder="ej: diseño, feedback"></div>
    `, [
      { label: 'Cancelar', class: 'btn btn-secondary', action: c => c() },
      { label: 'Crear', class: 'btn btn-primary', action: c => {
        const title = document.getElementById('noteTitle').value.trim();
        if (!title) return showToast('El título es obligatorio', 'warning');
        const tags = document.getElementById('noteTags').value.split(',').map(t => t.trim()).filter(Boolean);
        DB.create('notes', { projectId, workspace: 'client', title, content: document.getElementById('noteContent').value.trim(), tags, pinned: false });
        showToast('Nota creada', 'success'); c(); reRender();
      }}
    ]);
  }

  function showAddMeeting() {
    showModal('Nueva Reunión', `
      <div class="form-group"><label>Título</label><input type="text" id="meetTitle" class="form-input" autofocus></div>
      <div class="form-group"><label>Fecha</label><input type="date" id="meetDate" class="form-input"></div>
      <div class="form-group"><label>Notas</label><textarea id="meetNotes" class="form-input" rows="3"></textarea></div>
    `, [
      { label: 'Cancelar', class: 'btn btn-secondary', action: c => c() },
      { label: 'Crear', class: 'btn btn-primary', action: c => {
        const title = document.getElementById('meetTitle').value.trim();
        if (!title) return showToast('El título es obligatorio', 'warning');
        DB.create('meetings', { clientId, projectId, title, date: document.getElementById('meetDate').value, notes: document.getElementById('meetNotes').value.trim() });
        showToast('Reunión creada', 'success'); c(); reRender();
      }}
    ]);
  }

  function showEditProject() {
    const p = getProject();
    showModal('Editar Proyecto', `
      <div class="form-group"><label>Nombre</label><input type="text" id="editName" class="form-input" value="${Utils.sanitize(p.name)}" autofocus></div>
      <div class="form-group"><label>Descripción</label><textarea id="editDesc" class="form-input" rows="3">${Utils.sanitize(p.description || '')}</textarea></div>
      <div class="form-group"><label>Estado</label><select id="editStatus" class="form-input">
        <option value="active" ${p.status === 'active' ? 'selected' : ''}>Activo</option>
        <option value="paused" ${p.status === 'paused' ? 'selected' : ''}>Pausado</option>
        <option value="completed" ${p.status === 'completed' ? 'selected' : ''}>Completado</option>
      </select></div>
    `, [
      { label: 'Cancelar', class: 'btn btn-secondary', action: c => c() },
      { label: 'Archivar', class: 'btn btn-secondary', action: c => { DB.archive('projects', projectId); showToast('Proyecto archivado', 'success'); c(); router.navigate(clientId ? `/clients/${clientId}` : '/personal'); }},
      { label: 'Guardar', class: 'btn btn-primary', action: c => {
        const name = document.getElementById('editName').value.trim();
        if (!name) return showToast('El nombre es obligatorio', 'warning');
        DB.update('projects', projectId, {
          name, description: document.getElementById('editDesc').value.trim(),
          status: document.getElementById('editStatus').value
        });
        showToast('Proyecto actualizado', 'success'); c(); reRender();
      }}
    ]);
  }

  function handleDragAndDrop() {
    const items = document.querySelectorAll('.kanban-item[draggable]');
    const columns = document.querySelectorAll('.kanban-column');

    items.forEach(item => {
      item.addEventListener('dragstart', () => item.classList.add('dragging'));
      item.addEventListener('dragend', () => item.classList.remove('dragging'));
    });

    columns.forEach(col => {
      col.addEventListener('dragover', e => {
        e.preventDefault();
        const dragging = document.querySelector('.dragging');
        if (!dragging) return;
        const itemsContainer = col.querySelector('.kanban-items');
        const afterElement = getDragAfterElement(itemsContainer, e.clientY);
        if (afterElement) itemsContainer.insertBefore(dragging, afterElement);
        else itemsContainer.appendChild(dragging);
      });

      col.addEventListener('drop', () => {
        const dragging = document.querySelector('.dragging');
        if (!dragging) return;
        const newStatus = col.dataset.status;
        const taskId = dragging.dataset.taskId;
        if (newStatus === 'done') {
          DB.completeTask(taskId);
        } else {
          DB.update('tasks', taskId, { status: newStatus });
        }
        toastUpdate = showToast('Tarea movida', 'success');
        setTimeout(() => reRender(), 500);
      });
    });
  }

  function getDragAfterElement(container, y) {
    const elements = [...container.querySelectorAll('.kanban-item:not(.dragging)')];
    return elements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) return { offset, element: child };
      return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  let toastUpdate;

  function reRender() {
    const page = render();
    const content = document.getElementById('content');
    if (content) {
      content.innerHTML = page.render();
      page.afterRender();
    }
  }

  function render() {
    const project = getProject();
    if (!project) {
      router.navigate(clientId ? `/clients/${clientId}` : '/');
      return { render: () => '', afterRender: () => {} };
    }

    const client = getClient();

    return {
      render() {
        return `
          <div class="page-enter">
            ${renderHeader(project, client)}
            ${renderTabs()}
            ${activeTab === 'overview' ? renderOverview() : ''}
            ${activeTab === 'objectives' ? renderObjectives() : ''}
            ${activeTab === 'campaigns' ? renderCampaigns() : ''}
            ${activeTab === 'content' ? renderContent() : ''}
            ${activeTab === 'planner' ? renderPlanner() : ''}
            ${activeTab === 'calendar' ? renderCalendar() : ''}
            ${activeTab === 'tasks' ? renderTasks() : ''}
            ${activeTab === 'files' ? renderFiles() : ''}
            ${activeTab === 'prompts' ? renderPrompts() : ''}
            ${activeTab === 'notes' ? renderNotes() : ''}
            ${activeTab === 'meetings' ? renderMeetings() : ''}
            ${activeTab === 'history' ? renderHistory() : ''}
          </div>
        `;
      },
      afterRender() {
        document.getElementById('backBtn')?.addEventListener('click', () => router.navigate(clientId ? `/clients/${clientId}` : '/personal'));
        document.getElementById('editProjectBtn')?.addEventListener('click', showEditProject);

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            activeTab = btn.dataset.tab;
            reRender();
          });
        });

        // CRUD buttons
        document.getElementById('addObjectiveBtn')?.addEventListener('click', showAddObjective);
        document.getElementById('addCampaignBtn')?.addEventListener('click', showAddCampaign);
        document.getElementById('addContentBtn')?.addEventListener('click', showAddContent);
        document.getElementById('addPlannerBtn')?.addEventListener('click', showAddPlanner);
        document.getElementById('addEventBtn')?.addEventListener('click', showAddEvent);
        document.getElementById('addTaskBtn')?.addEventListener('click', showAddTask);
        document.getElementById('addFileBtn')?.addEventListener('click', showAddFile);
        document.getElementById('addPromptBtn')?.addEventListener('click', showAddPrompt);
        document.getElementById('addNoteBtn')?.addEventListener('click', showAddNote);
        document.getElementById('addMeetingBtn')?.addEventListener('click', showAddMeeting);

        // Filters
        document.querySelectorAll('[data-campaign-filter]').forEach(el => {
          el.addEventListener('click', () => { campaignFilter = el.dataset.campaignFilter; reRender(); });
        });
        document.querySelectorAll('[data-content-filter]').forEach(el => {
          el.addEventListener('click', () => { contentFilter = el.dataset.contentFilter; reRender(); });
        });
        document.querySelectorAll('[data-prompt-filter]').forEach(el => {
          el.addEventListener('click', () => { promptFilter = el.dataset.promptFilter; reRender(); });
        });

        // Delete buttons
        document.querySelectorAll('.objective-del-btn').forEach(el => {
          el.addEventListener('click', (e) => { e.stopPropagation(); DB.remove('objectives', el.dataset.id); reRender(); });
        });
        document.querySelectorAll('.objective-status-btn').forEach(el => {
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            const current = el.dataset.status;
            const prog = DB.getObjectiveProgress(el.dataset.id);
            if (current !== 'achieved' && prog.total > 0 && prog.percent < 100) {
              showToast('Completá todas las tareas vinculadas para lograr este objetivo', 'warning');
              return;
            }
            const next = current === 'achieved' ? 'pending' : current === 'pending' ? 'in_progress' : 'achieved';
            DB.update('objectives', el.dataset.id, { status: next });
            if (next === 'achieved') {
              DB.createHistoryEntry('complete', 'objective', el.dataset.id, { projectId, workspace: 'client' });
            }
            reRender();
          });
        });
        document.querySelectorAll('.campaign-del-btn').forEach(el => {
          el.addEventListener('click', (e) => { e.stopPropagation(); DB.remove('campaigns', el.dataset.id); reRender(); });
        });
        document.querySelectorAll('.content-del-btn').forEach(el => {
          el.addEventListener('click', (e) => { e.stopPropagation(); DB.remove('contents', el.dataset.id); reRender(); });
        });
        document.querySelectorAll('.planner-del-btn').forEach(el => {
          el.addEventListener('click', (e) => { e.stopPropagation(); DB.remove('planner', el.dataset.id); reRender(); });
        });
        document.querySelectorAll('.planner-checkbox input').forEach(el => {
          el.addEventListener('change', () => {
            const id = el.dataset.plannerId;
            const checked = el.checked;
            DB.update('planner', id, { status: checked ? 'done' : 'pending' });
          });
        });
        document.querySelectorAll('.event-del-btn').forEach(el => {
          el.addEventListener('click', (e) => { e.stopPropagation(); DB.remove('events', el.dataset.id); reRender(); });
        });
        document.querySelectorAll('.task-del-btn').forEach(el => {
          el.addEventListener('click', (e) => { e.stopPropagation(); DB.remove('tasks', el.dataset.id); reRender(); });
        });
        document.querySelectorAll('.file-del-btn').forEach(el => {
          el.addEventListener('click', (e) => { e.stopPropagation(); DB.remove('files', el.dataset.id); reRender(); });
        });
        document.querySelectorAll('.prompt-del-btn').forEach(el => {
          el.addEventListener('click', (e) => { e.stopPropagation(); DB.remove('prompts', el.dataset.id); reRender(); });
        });
        document.querySelectorAll('.note-del-btn').forEach(el => {
          el.addEventListener('click', (e) => { e.stopPropagation(); DB.remove('notes', el.dataset.id); reRender(); });
        });
        document.querySelectorAll('.meeting-del-btn').forEach(el => {
          el.addEventListener('click', (e) => { e.stopPropagation(); DB.remove('meetings', el.dataset.id); reRender(); });
        });

        // Copy prompt
        document.querySelectorAll('.copy-prompt-btn').forEach(el => {
          el.addEventListener('click', () => {
            navigator.clipboard.writeText(el.dataset.content).then(() => showToast('Prompt copiado', 'success'));
          });
        });

        // Campaign edit
        document.querySelectorAll('.campaign-edit-btn').forEach(el => {
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            const c = DB.getById('campaigns', el.dataset.id);
            if (!c) return;
            showModal('Editar Campaña', `
              <div class="form-group"><label>Nombre</label><input type="text" id="editCampName" class="form-input" value="${Utils.sanitize(c.name)}"></div>
              <div class="form-group"><label>Objetivo</label><textarea id="editCampObj" class="form-input" rows="2">${Utils.sanitize(c.objective || '')}</textarea></div>
              <div class="form-group"><label>Estado</label><select id="editCampStatus" class="form-input">
                <option value="active" ${c.status === 'active' ? 'selected' : ''}>Activo</option>
                <option value="paused" ${c.status === 'paused' ? 'selected' : ''}>Pausado</option>
                <option value="completed" ${c.status === 'completed' ? 'selected' : ''}>Completado</option>
              </select></div>
            `, [
              { label: 'Cancelar', class: 'btn btn-secondary', action: cl => cl() },
              { label: 'Guardar', class: 'btn btn-primary', action: cl => {
                DB.update('campaigns', el.dataset.id, {
                  name: document.getElementById('editCampName').value.trim(),
                  objective: document.getElementById('editCampObj').value.trim(),
                  status: document.getElementById('editCampStatus').value
                });
                showToast('Campaña actualizada', 'success'); cl(); reRender();
              }}
            ]);
          });
        });

        // Content edit
        document.querySelectorAll('.content-edit-btn').forEach(el => {
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            const c = DB.getById('contents', el.dataset.id);
            if (!c) return;
            showModal('Editar Contenido', `
              <div class="form-group"><label>Título</label><input type="text" id="editContTitle" class="form-input" value="${Utils.sanitize(c.title)}"></div>
              <div class="form-group"><label>Descripción</label><textarea id="editContDesc" class="form-input" rows="2">${Utils.sanitize(c.description || '')}</textarea></div>
              <div class="form-group"><label>Tipo</label><select id="editContType" class="form-input">
                <option value="post" ${c.type === 'post' ? 'selected' : ''}>Post</option>
                <option value="story" ${c.type === 'story' ? 'selected' : ''}>Historia</option>
                <option value="reel" ${c.type === 'reel' ? 'selected' : ''}>Reel</option>
              </select></div>
              <div class="form-group"><label>Estado</label><select id="editContStatus" class="form-input">
                <option value="draft" ${c.status === 'draft' ? 'selected' : ''}>Borrador</option>
                <option value="published" ${c.status === 'published' ? 'selected' : ''}>Publicado</option>
              </select></div>
            `, [
              { label: 'Cancelar', class: 'btn btn-secondary', action: cl => cl() },
              { label: 'Guardar', class: 'btn btn-primary', action: cl => {
                DB.update('contents', el.dataset.id, {
                  title: document.getElementById('editContTitle').value.trim(),
                  description: document.getElementById('editContDesc').value.trim(),
                  type: document.getElementById('editContType').value,
                  status: document.getElementById('editContStatus').value
                });
                showToast('Contenido actualizado', 'success'); cl(); reRender();
              }}
            ]);
          });
        });

        // Calendar
        if (activeTab === 'calendar' && document.getElementById('calendarContainer')) {
          const events = DB.where('events', e => e.projectId === projectId);
          const tasks = DB.where('tasks', t => t.projectId === projectId);
          const cal = CalendarGrid({
            events,
            tasks,
            showSidebar: false,
            onNavigate: (type, id) => {
              if (type === 'event') {
                const ev = DB.getById('events', id);
                if (ev) showModal(Utils.sanitize(ev.title), `<p style="color:var(--text-secondary)">${Utils.formatDate(ev.date)}</p><p style="color:var(--text-muted);font-size:var(--text-sm);margin-top:8px">${Utils.sanitize(ev.description || '')}</p>`, [
                  { label: 'Cerrar', class: 'btn btn-secondary', action: c => c() }
                ]);
              } else {
                activeTab = 'tasks';
                reRender();
              }
            }
          });
          const container = document.getElementById('calendarContainer');
          container.innerHTML = cal.render();
          cal.afterRender();
        }

        // Drag and drop for tasks
        if (activeTab === 'tasks') {
          handleDragAndDrop();
        }
      }
    };
  }

  return render();
}
