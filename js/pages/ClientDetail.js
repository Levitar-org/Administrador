import { DB } from '../db.js';
import { Utils } from '../utils.js';
import { router } from '../router.js';
import { showModal } from '../components/Modal.js';
import { showToast } from '../components/Toast.js';

const TABS = [
  { id: 'overview', label: 'Resumen' },
  { id: 'campaigns', label: 'Campañas' },
  { id: 'content', label: 'Contenido' },
  { id: 'tasks', label: 'Tareas' },
  { id: 'calendar', label: 'Calendario' },
  { id: 'prompts', label: 'Prompts' },
  { id: 'settings', label: 'Configuración' }
];

export function ClientDetailPage(params) {
  const clientId = params.id;
  const client = DB.getById('clients', clientId);

  if (!client) {
    return {
      render() {
        return `
          <div class="empty-state" style="padding:80px 24px">
            <h3>Cliente no encontrado</h3>
            <p>El cliente que buscas no existe.</p>
            <button class="btn btn-primary" onclick="window.location.hash='#/clients'">Volver a clientes</button>
          </div>
        `;
      },
      afterRender() {}
    };
  }

  let activeTab = 'overview';

  function switchTab(tabId) {
    activeTab = tabId;
    renderTabContent();
    document.querySelectorAll('.tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabId);
    });
  }

  function renderTabContent() {
    const container = document.getElementById('tabContent');
    if (!container) return;
    switch (activeTab) {
      case 'overview': renderOverview(container); break;
      case 'campaigns': renderCampaigns(container); break;
      case 'content': renderContent(container); break;
      case 'tasks': renderTasks(container); break;
      case 'calendar': renderCalendar(container); break;
      case 'prompts': renderPrompts(container); break;
      case 'settings': renderSettings(container); break;
    }
  }

  function campaignOptions(selectedId) {
    const campaigns = DB.where('campaigns', c => c.clientId === clientId);
    return `<option value="">Sin campaña</option>${campaigns.map(c =>
      `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${Utils.sanitize(c.name)}</option>`
    ).join('')}`;
  }

  function getCampaignName(id) {
    if (!id) return null;
    const c = DB.getById('campaigns', id);
    return c ? c.name : null;
  }

  // ─── OVERVIEW ──────────────────────────────────────────────

  function renderOverview(container) {
    const campaigns = DB.where('campaigns', c => c.clientId === clientId);
    const contents = DB.where('contents', c => c.clientId === clientId);
    const tasks = DB.where('tasks', t => t.clientId === clientId);
    const events = DB.where('events', e => e.clientId === clientId);
    const meetings = DB.where('meetings', m => m.clientId === clientId);

    container.innerHTML = `
      <div class="page-enter">
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-label">Campañas</div>
            <div class="stat-value">${campaigns.length}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Contenido</div>
            <div class="stat-value">${contents.length}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Tareas</div>
            <div class="stat-value">${tasks.length}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Eventos</div>
            <div class="stat-value">${events.length}</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div class="card">
            <div class="card-header">
              <div class="card-title">Información del cliente</div>
            </div>
            <div class="card-body">
              <div style="display:grid;gap:8px">
                <div><strong style="color:var(--text-muted);font-size:var(--text-xs)">RUBRO</strong><br>${Utils.sanitize(client.industry)}</div>
                ${client.instagram ? `<div><strong style="color:var(--text-muted);font-size:var(--text-xs)">INSTAGRAM</strong><br>${Utils.sanitize(client.instagram)}</div>` : ''}
                ${client.website ? `<div><strong style="color:var(--text-muted);font-size:var(--text-xs)">SITIO WEB</strong><br>${Utils.sanitize(client.website)}</div>` : ''}
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">Posicionamiento</div>
            </div>
            <div class="card-body">
              <p><strong style="color:var(--text-muted);font-size:var(--text-xs)">POSICIONAMIENTO</strong><br>${Utils.sanitize(client.positioning || '—')}</p>
              <p><strong style="color:var(--text-muted);font-size:var(--text-xs)">TONO</strong><br>${Utils.sanitize(client.tone || '—')}</p>
              <p><strong style="color:var(--text-muted);font-size:var(--text-xs)">OBJETIVO</strong><br>${Utils.sanitize(client.mainObjective || '—')}</p>
            </div>
          </div>
        </div>

        ${meetings.length > 0 ? `
          <div class="card" style="margin-top:16px">
            <div class="card-header">
              <div class="card-title">Últimas reuniones</div>
            </div>
            <div class="card-body">
              ${meetings.map(m => `
                <div style="padding:12px 0;border-bottom:1px solid var(--border-light)">
                  <div style="font-weight:500">${Utils.sanitize(m.title)}</div>
                  <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:2px">${Utils.formatDateTime(m.date)}</div>
                  ${m.notes ? `<div style="font-size:var(--text-sm);color:var(--text-secondary);margin-top:6px;white-space:pre-line">${Utils.sanitize(m.notes)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // ─── CAMPAIGNS ─────────────────────────────────────────────

  let campFilter = 'active';

  function renderCampaigns(container) {
    let campaigns = DB.where('campaigns', c => c.clientId === clientId);
    if (campFilter === 'active') campaigns = campaigns.filter(c => !c.archived);
    else if (campFilter === 'archived') campaigns = campaigns.filter(c => c.archived);

    container.innerHTML = `
      <div class="page-enter">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h3 style="font-size:var(--text-lg);font-weight:600">Campañas</h3>
          <button class="btn btn-primary btn-sm" id="addCampaignBtn">Nueva campaña</button>
        </div>
        <div style="display:flex;gap:6px;margin-bottom:12px">
          <button class="btn btn-ghost btn-sm camp-filter ${campFilter === 'active' ? 'active' : ''}" data-filter="active">Activas</button>
          <button class="btn btn-ghost btn-sm camp-filter ${campFilter === 'archived' ? 'active' : ''}" data-filter="archived">Archivadas</button>
          <button class="btn btn-ghost btn-sm camp-filter ${campFilter === 'all' ? 'active' : ''}" data-filter="all">Todas</button>
        </div>
        ${campaigns.length === 0 ? `
          <div class="empty-state" style="padding:40px 24px">
            <h3>${campFilter === 'archived' ? 'Sin campañas archivadas' : 'Sin campañas'}</h3>
            <p>${campFilter === 'archived' ? 'No hay campañas archivadas para este cliente.' : 'No hay campañas para este cliente.'}</p>
          </div>
        ` : `
          <div class="card-grid">
            ${campaigns.map(c => {
              const contents = DB.where('contents', ct => ct.campaignId === c.id);
              const tasks = DB.where('tasks', t => t.campaignId === c.id);
              const events = DB.where('events', e => e.campaignId === c.id);
              return `
                <div class="card" data-campaign-id="${c.id}">
                  <div class="card-header">
                    <div>
                      <div class="card-title">${Utils.sanitize(c.name)}</div>
                      <div class="card-subtitle">Creada ${Utils.getRelativeTime(c.createdAt)}</div>
                    </div>
                    <div style="display:flex;gap:6px">
                      ${c.archived ? '<span class="tag tag-draft">Archivada</span>' : ''}
                      <span class="tag tag-${c.status}">${Utils.statusLabel(c.status)}</span>
                    </div>
                  </div>
                  <div class="card-body">
                    <p>${Utils.sanitize(c.objective || 'Sin objetivo definido')}</p>
                    <div style="display:flex;gap:12px;margin-top:10px;font-size:var(--text-xs);color:var(--text-muted)">
                      <span>${contents.length} ${Utils.pluralize(contents.length, 'contenido', 'contenidos')}</span>
                      <span>${tasks.length} ${Utils.pluralize(tasks.length, 'tarea', 'tareas')}</span>
                      <span>${events.length} ${Utils.pluralize(events.length, 'evento', 'eventos')}</span>
                    </div>
                  </div>
                  <div style="display:flex;gap:6px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border-light)">
                    <button class="btn btn-ghost btn-sm edit-campaign" data-id="${c.id}">Editar</button>
                    ${c.archived ? `
                      <button class="btn btn-ghost btn-sm restore-campaign" data-id="${c.id}">Restaurar</button>
                      <button class="btn btn-ghost btn-sm delete-campaign-perm" data-id="${c.id}" style="color:var(--danger)">Eliminar</button>
                    ` : `
                      <button class="btn btn-ghost btn-sm archive-campaign" data-id="${c.id}">Archivar</button>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `; // close innerHTML

    // Campaign filter
    container.querySelectorAll('.camp-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.camp-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        campFilter = btn.dataset.filter;
        renderCampaigns(container);
      });
    });

    // Campaign card click → detail
    container.querySelectorAll('.card[data-campaign-id]').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.edit-campaign') || e.target.closest('.archive-campaign') ||
            e.target.closest('.restore-campaign') || e.target.closest('.delete-campaign-perm')) return;
        const camp = DB.getById('campaigns', card.dataset.campaignId);
        if (camp) showCampaignDetail(container, camp);
      });
    });

    container.querySelector('#addCampaignBtn')?.addEventListener('click', () => {
      showModal('Nueva campaña', `
        <div class="form-group">
          <label class="form-label">Nombre de la campaña</label>
          <input class="form-input" id="campaignName" placeholder="Ej: Lanzamiento verano">
        </div>
        <div class="form-group">
          <label class="form-label">Objetivo</label>
          <textarea class="form-textarea" id="campaignObjective" placeholder="¿Qué querés lograr?"></textarea>
        </div>
      `, [
        { label: 'Cancelar', class: 'btn-secondary', action: (close) => close() },
        { label: 'Crear campaña', class: 'btn-primary', action: (close) => {
          const name = document.getElementById('campaignName').value.trim();
          if (!name) return;
          DB.create('campaigns', { archived: false, clientId, name, objective: document.getElementById('campaignObjective').value.trim(), status: 'active' });
          close();
          showToast('Campaña creada', 'success');
          renderCampaigns(container);
        }}
      ]);
    });

    container.querySelectorAll('.edit-campaign').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const c = DB.getById('campaigns', btn.dataset.id);
        if (!c) return;
        showModal('Editar campaña', `
          <div class="form-group">
            <label class="form-label">Nombre</label>
            <input class="form-input" id="editCampName" value="${Utils.sanitize(c.name)}">
          </div>
          <div class="form-group">
            <label class="form-label">Objetivo</label>
            <textarea class="form-textarea" id="editCampObjective">${Utils.sanitize(c.objective || '')}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Estado</label>
            <select class="form-select" id="editCampStatus">
              <option value="active" ${c.status === 'active' ? 'selected' : ''}>Activa</option>
              <option value="paused" ${c.status === 'paused' ? 'selected' : ''}>Pausada</option>
              <option value="completed" ${c.status === 'completed' ? 'selected' : ''}>Completada</option>
            </select>
          </div>
        `, [
          { label: 'Cancelar', class: 'btn-secondary', action: (close) => close() },
          { label: 'Guardar', class: 'btn-primary', action: (close) => {
            const name = document.getElementById('editCampName').value.trim();
            if (!name) return;
            DB.update('campaigns', c.id, {
              name,
              objective: document.getElementById('editCampObjective').value.trim(),
              status: document.getElementById('editCampStatus').value
            });
            close();
            showToast('Campaña actualizada', 'success');
            renderCampaigns(container);
          }}
        ]);
      });
    });

    container.querySelectorAll('.archive-campaign').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        DB.archive('campaigns', btn.dataset.id);
        Sound.trash();
        showToast('Campaña archivada', 'success');
        renderCampaigns(container);
      });
    });

    container.querySelectorAll('.restore-campaign').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        DB.restore('campaigns', btn.dataset.id);
        showToast('Campaña restaurada', 'success');
        renderCampaigns(container);
      });
    });

    container.querySelectorAll('.delete-campaign-perm').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const c = DB.getById('campaigns', btn.dataset.id);
        if (!c) return;
        showModal('Eliminar campaña', `
          <p style="margin-bottom:12px">¿Eliminar permanentemente la campaña <strong>${Utils.sanitize(c.name)}</strong>?</p>
          <p style="font-size:var(--text-sm);color:var(--text-muted)">El contenido, tareas y eventos asociados se desvincularán pero no se eliminarán.</p>
        `, [
          { label: 'Cancelar', class: 'btn-secondary', action: (close) => close() },
          { label: 'Eliminar', class: 'btn-danger', action: (close) => {
            ['contents', 'tasks', 'events'].forEach(store => {
              DB.where(store, item => item.campaignId === c.id).forEach(item => {
                DB.update(store, item.id, { campaignId: '' });
              });
            });
            DB.remove('campaigns', c.id);
            close();
            showToast('Campaña eliminada', 'success');
            renderCampaigns(container);
          }}
        ]);
      });
    });
  }

  // ─── CAMPAIGN DETAIL ────────────────────────────────────────

  function showCampaignDetail(container, camp) {
    const contents = DB.where('contents', c => c.campaignId === camp.id);
    const tasks = DB.where('tasks', t => t.campaignId === camp.id);
    const events = DB.where('events', e => e.campaignId === camp.id);

    container.innerHTML = `
      <div class="page-enter">
        <button class="btn btn-ghost back-to-campaigns" style="margin-bottom:16px">← Volver a campañas</button>

        <div class="card" style="margin-bottom:16px">
          <div class="card-body">
            <div style="display:flex;justify-content:space-between;align-items:flex-start">
              <div>
                <h3 style="font-size:var(--text-xl);font-weight:700">${Utils.sanitize(camp.name)}</h3>
                ${camp.objective ? `<p style="margin-top:4px;color:var(--text-secondary)">${Utils.sanitize(camp.objective)}</p>` : ''}
                <span class="status-badge status-${camp.status}">${camp.status === 'active' ? 'Activa' : camp.status === 'paused' ? 'Pausada' : 'Completada'}</span>
              </div>
              <div style="display:flex;gap:12px">
                <div style="text-align:center">
                  <div style="font-size:var(--text-2xl);font-weight:700">${contents.length}</div>
                  <div style="font-size:var(--text-xs);color:var(--text-muted)">Contenidos</div>
                </div>
                <div style="text-align:center">
                  <div style="font-size:var(--text-2xl);font-weight:700">${tasks.filter(t => t.status === 'done').length}/${tasks.length}</div>
                  <div style="font-size:var(--text-xs);color:var(--text-muted)">Tareas</div>
                </div>
                <div style="text-align:center">
                  <div style="font-size:var(--text-2xl);font-weight:700">${events.length}</div>
                  <div style="font-size:var(--text-xs);color:var(--text-muted)">Eventos</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h4 style="font-size:var(--text-base);font-weight:600;margin-bottom:12px">Contenido (${contents.length})</h4>
        ${contents.length === 0 ? `<p style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:16px">Sin contenido asociado.</p>` : `
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;margin-bottom:24px">
            ${contents.map(c => `
              <div class="card" style="cursor:default">
                <div class="card-body">
                  <div style="font-weight:600;margin-bottom:4px">${Utils.sanitize(c.platform)}</div>
                  <div style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:8px">${Utils.sanitize(c.text?.substring(0,120))}${c.text?.length > 120 ? '...' : ''}</div>
                  <div style="font-size:var(--text-xs);color:var(--text-muted)">${c.contentType || 'Post'} · ${Utils.getRelativeTime(c.createdAt)}</div>
                </div>
              </div>
            `).join('')}
          </div>
        `}

        <h4 style="font-size:var(--text-base);font-weight:600;margin-bottom:12px">Tareas (${tasks.length})</h4>
        ${tasks.length === 0 ? `<p style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:16px">Sin tareas asociadas.</p>` : `
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;margin-bottom:24px">
            ${tasks.map(t => `
              <div class="card" style="cursor:default;${t.status === 'done' ? 'opacity:0.6' : ''}">
                <div class="card-body">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                    <span style="width:8px;height:8px;border-radius:50%;background:${t.status === 'done' ? 'var(--success)' : t.status === 'in_progress' ? 'var(--warning)' : 'var(--text-muted)'}"></span>
                    <span style="font-weight:600">${Utils.sanitize(t.title)}</span>
                  </div>
                  ${t.description ? `<div style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:4px">${Utils.sanitize(t.description?.substring(0,100))}${t.description?.length > 100 ? '...' : ''}</div>` : ''}
                  <div style="font-size:var(--text-xs);color:var(--text-muted)">${t.status === 'done' ? 'Completada' : t.status === 'in_progress' ? 'En progreso' : 'Pendiente'} · ${t.assignee ? Utils.sanitize(t.assignee) : 'Sin asignar'}</div>
                </div>
              </div>
            `).join('')}
          </div>
        `}

        <h4 style="font-size:var(--text-base);font-weight:600;margin-bottom:12px">Eventos (${events.length})</h4>
        ${events.length === 0 ? `<p style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:16px">Sin eventos asociados.</p>` : `
          <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:24px">
            ${events.map(e => `
              <div class="card" style="cursor:default">
                <div class="card-body" style="display:flex;justify-content:space-between;align-items:center">
                  <div>
                    <div style="font-weight:600">${Utils.sanitize(e.title)}</div>
                    ${e.description ? `<div style="font-size:var(--text-sm);color:var(--text-secondary)">${Utils.sanitize(e.description?.substring(0,80))}${e.description?.length > 80 ? '...' : ''}</div>` : ''}
                  </div>
                  <div style="font-size:var(--text-sm);color:var(--text-muted);text-align:right">
                    <div>${e.date || ''}</div>
                    <div>${e.time || ''}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}

        <button class="btn btn-ghost back-to-campaigns" style="margin-top:8px">← Volver a campañas</button>
      </div>
    `;

    container.querySelectorAll('.back-to-campaigns').forEach(btn => {
      btn.addEventListener('click', () => renderCampaigns(container));
    });
  }

  // ─── PAGINATION HELPERS ─────────────────────────────────────

  function renderPagin(page, total, prefix) {
    const prev = page > 1 ? `<button class="btn btn-ghost btn-sm pagi-prev" data-prefix="${prefix}">← Anterior</button>` : '';
    const next = page < total ? `<button class="btn btn-ghost btn-sm pagi-next" data-prefix="${prefix}">Siguiente →</button>` : '';
    return `<div class="pagination" style="display:flex;justify-content:center;align-items:center;gap:8px;margin-top:16px">${prev}<span style="font-size:var(--text-sm);color:var(--text-muted)">Página ${page} de ${total}</span>${next}</div>`;
  }

  function bindPagin(container, prefix, renderFn) {
    container.querySelectorAll(`.pagi-prev[data-prefix="${prefix}"], .pagi-next[data-prefix="${prefix}"]`).forEach(btn => {
      btn.addEventListener('click', () => {
        const isNext = btn.classList.contains('pagi-next');
        if (prefix === 'cont') { contentPage += isNext ? 1 : -1; }
        else if (prefix === 'evt') { eventPage += isNext ? 1 : -1; }
        else if (prefix === 'prm') { promptPage += isNext ? 1 : -1; }
        const map = { cont: '#contentGrid', evt: '#eventList', prm: '#promptList' };
        const grid = container.querySelector(map[prefix]);
        if (grid) grid.innerHTML = renderFn();
        bindPagin(container, prefix, renderFn);
      });
    });
  }

  // ─── CONTENT ───────────────────────────────────────────────

  const CONTENT_PAGE = 12;
  let contentPage = 1;
  let contentFilterVal = 'all';

  function renderContent(container) {
    const contents = DB.where('contents', c => c.clientId === clientId);

    function contentGrid() {
      let filtered = contents;
      if (contentFilterVal && contentFilterVal !== 'all') filtered = contents.filter(c => c.type === contentFilterVal);
      if (filtered.length === 0) {
        return `<div class="empty-state" style="padding:40px 24px"><p style="color:var(--text-muted)">Sin contenido</p></div>`;
      }
      const totalPages = Math.ceil(filtered.length / CONTENT_PAGE) || 1;
      if (contentPage > totalPages) contentPage = totalPages;
      const start = (contentPage - 1) * CONTENT_PAGE;
      const pageItems = filtered.slice(start, start + CONTENT_PAGE);
      const pagi = totalPages > 1 ? renderPagin(contentPage, totalPages, 'cont') : '';
      return `<div class="content-gallery stagger">${pageItems.map(c => {
        const campName = getCampaignName(c.campaignId);
        return `
          <div class="content-item" data-id="${c.id}">
            <div class="content-item-preview ${c.type}">
              ${c.type === 'post' ? '📝' : c.type === 'story' ? '📱' : '🎬'}
            </div>
            <div class="content-item-body">
              <div class="content-item-title">${Utils.sanitize(c.title || 'Sin título')}</div>
              ${c.description ? `<div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:6px">${Utils.truncate(Utils.sanitize(c.description), 50)}</div>` : ''}
              <div class="content-item-meta">
                <span class="tag tag-${c.type}">${Utils.statusLabel(c.type)}</span>
                <span class="tag ${c.status === 'published' ? 'tag-active' : 'tag-draft'}">${Utils.statusLabel(c.status)}</span>
              </div>
              ${campName ? `<div style="margin-top:6px;font-size:var(--text-xs);color:var(--accent)">📁 ${Utils.sanitize(campName)}</div>` : ''}
            </div>
          </div>
        `;
      }).join('')}</div>${pagi}`;
    }

    container.innerHTML = `
      <div class="page-enter">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h3 style="font-size:var(--text-lg);font-weight:600">Contenido</h3>
          <button class="btn btn-primary btn-sm" id="addContentBtn">Nuevo contenido</button>
        </div>
        <div style="display:flex;gap:6px;margin-bottom:12px">
          <button class="btn btn-ghost btn-sm content-filter active" data-filter="all">Todo</button>
          <button class="btn btn-ghost btn-sm content-filter" data-filter="post">Posts</button>
          <button class="btn btn-ghost btn-sm content-filter" data-filter="story">Historias</button>
          <button class="btn btn-ghost btn-sm content-filter" data-filter="reel">Reels</button>
        </div>
        <div id="contentGrid">${contentGrid()}</div>
      </div>
    `;

    container.querySelector('#addContentBtn').addEventListener('click', () => {
      showModal('Nuevo contenido', `
        <div class="form-group">
          <label class="form-label">Título</label>
          <input class="form-input" id="contTitle" placeholder="Ej: Post promocional">
        </div>
        <div class="form-group">
          <label class="form-label">Descripción</label>
          <textarea class="form-textarea" id="contDescription" placeholder="Idea o copy del contenido" rows="3"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Tipo</label>
            <select class="form-select" id="contType">
              <option value="post">Publicación</option>
              <option value="story">Historia</option>
              <option value="reel">Reel</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Estado</label>
            <select class="form-select" id="contStatus">
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Campaña</label>
          <select class="form-select" id="contCampaign">${campaignOptions('')}</select>
        </div>
      `, [
        { label: 'Cancelar', class: 'btn-secondary', action: (close) => close() },
        { label: 'Crear', class: 'btn-primary', action: (close) => {
          const title = document.getElementById('contTitle').value.trim();
          if (!title) return;
          DB.create('contents', {
            clientId,
            campaignId: document.getElementById('contCampaign').value,
            title,
            description: document.getElementById('contDescription').value.trim(),
            type: document.getElementById('contType').value,
            status: document.getElementById('contStatus').value
          });
          close();
          showToast('Contenido creado', 'success');
          renderContent(container);
        }}
      ]);
    });

    container.querySelectorAll('.content-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.content-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        contentFilterVal = btn.dataset.filter;
        contentPage = 1;
        const grid = document.getElementById('contentGrid');
        if (grid) grid.innerHTML = contentGrid();
      });
    });

    bindPagin(container, 'cont', () => contentGrid());

    container.querySelectorAll('.content-item').forEach(el => {
      el.addEventListener('click', () => {
        const c = DB.getById('contents', el.dataset.id);
        if (!c) return;
        showModal('Editar contenido', `
          <div class="form-group">
            <label class="form-label">Título</label>
            <input class="form-input" id="editContTitle" value="${Utils.sanitize(c.title || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Descripción</label>
            <textarea class="form-textarea" id="editContDescription" rows="3">${Utils.sanitize(c.description || '')}</textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Tipo</label>
              <select class="form-select" id="editContType">
                <option value="post" ${c.type === 'post' ? 'selected' : ''}>Publicación</option>
                <option value="story" ${c.type === 'story' ? 'selected' : ''}>Historia</option>
                <option value="reel" ${c.type === 'reel' ? 'selected' : ''}>Reel</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Estado</label>
              <select class="form-select" id="editContStatus">
                <option value="draft" ${c.status === 'draft' ? 'selected' : ''}>Borrador</option>
                <option value="published" ${c.status === 'published' ? 'selected' : ''}>Publicado</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Campaña</label>
            <select class="form-select" id="editContCampaign">${campaignOptions(c.campaignId)}</select>
          </div>
        `, [
          { label: 'Cancelar', class: 'btn-secondary', action: (close) => close() },
          { label: 'Eliminar', class: 'btn-danger', action: (close) => {
            DB.remove('contents', c.id);
            close();
            showToast('Contenido eliminado', 'success');
            renderContent(container);
          }},
          { label: 'Guardar', class: 'btn-primary', action: (close) => {
            const title = document.getElementById('editContTitle').value.trim();
            if (!title) return;
            DB.update('contents', c.id, {
              title,
              description: document.getElementById('editContDescription').value.trim(),
              type: document.getElementById('editContType').value,
              status: document.getElementById('editContStatus').value,
              campaignId: document.getElementById('editContCampaign').value
            });
            close();
            showToast('Contenido actualizado', 'success');
            renderContent(container);
          }}
        ]);
      });
    });
  }

  // ─── TASKS ─────────────────────────────────────────────────

  function renderTasks(container) {
    const tasks = DB.where('tasks', t => t.clientId === clientId);
    const columns = ['todo', 'in_progress', 'done'];
    const columnLabels = { todo: 'Por hacer', in_progress: 'En progreso', done: 'Completada' };

    function renderKanban() {
      return `<div class="kanban-board">${columns.map(col => {
        const colTasks = tasks.filter(t => t.status === col);
        return `
          <div class="kanban-column" data-column="${col}">
            <div class="kanban-column-header">
              <span>${columnLabels[col]}</span>
              <span class="kanban-column-count">${colTasks.length}</span>
            </div>
            ${colTasks.map(t => {
              const campName = getCampaignName(t.campaignId);
              return `
                <div class="kanban-item" draggable="true" data-task-id="${t.id}">
                  <div style="font-size:var(--text-sm);font-weight:500">${Utils.sanitize(t.title)}</div>
                  ${t.description ? `<div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:4px">${Utils.truncate(Utils.sanitize(t.description), 40)}</div>` : ''}
                  ${campName ? `<div style="font-size:var(--text-xs);color:var(--accent);margin-top:4px">📁 ${Utils.sanitize(campName)}</div>` : ''}
                </div>
              `;
            }).join('')}
          </div>`;
      }).join('')}</div>`;
    }

    container.innerHTML = `
      <div class="page-enter">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h3 style="font-size:var(--text-lg);font-weight:600">Tareas</h3>
          <button class="btn btn-primary btn-sm" id="addTaskBtn">Nueva tarea</button>
        </div>
        ${tasks.length === 0 ? `
          <div class="empty-state" style="padding:40px 24px">
            <h3>Sin tareas</h3>
            <p>No hay tareas para este cliente.</p>
          </div>
        ` : renderKanban()}
      </div>
    `;

    // Drag and drop
    container.querySelectorAll('.kanban-item').forEach(item => {
      item.addEventListener('dragstart', () => item.classList.add('dragging'));
      item.addEventListener('dragend', () => item.classList.remove('dragging'));

      item.addEventListener('click', () => {
        const t = DB.getById('tasks', item.dataset.taskId);
        if (!t) return;
        showModal('Editar tarea', `
          <div class="form-group">
            <label class="form-label">Título</label>
            <input class="form-input" id="editTaskTitle" value="${Utils.sanitize(t.title)}">
          </div>
          <div class="form-group">
            <label class="form-label">Descripción</label>
            <textarea class="form-textarea" id="editTaskDescription" rows="3">${Utils.sanitize(t.description || '')}</textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Estado</label>
              <select class="form-select" id="editTaskStatus">
                <option value="todo" ${t.status === 'todo' ? 'selected' : ''}>Por hacer</option>
                <option value="in_progress" ${t.status === 'in_progress' ? 'selected' : ''}>En progreso</option>
                <option value="done" ${t.status === 'done' ? 'selected' : ''}>Completada</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Campaña</label>
              <select class="form-select" id="editTaskCampaign">${campaignOptions(t.campaignId)}</select>
            </div>
          </div>
        `, [
          { label: 'Cancelar', class: 'btn-secondary', action: (close) => close() },
          { label: 'Eliminar', class: 'btn-danger', action: (close) => {
            DB.remove('tasks', t.id);
            close();
            showToast('Tarea eliminada', 'success');
            renderTasks(container);
          }},
          { label: 'Guardar', class: 'btn-primary', action: (close) => {
            const title = document.getElementById('editTaskTitle').value.trim();
            if (!title) return;
            DB.update('tasks', t.id, {
              title,
              description: document.getElementById('editTaskDescription').value.trim(),
              status: document.getElementById('editTaskStatus').value,
              campaignId: document.getElementById('editTaskCampaign').value
            });
            close();
            showToast('Tarea actualizada', 'success');
            renderTasks(container);
          }}
        ]);
      });
    });

    container.querySelectorAll('.kanban-column').forEach(col => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        const dragging = container.querySelector('.dragging');
        if (dragging) col.appendChild(dragging);
      });
      col.addEventListener('drop', () => {
        const dragging = container.querySelector('.dragging');
        if (dragging) {
          DB.update('tasks', dragging.dataset.taskId, { status: col.dataset.column });
        }
      });
    });

    container.querySelector('#addTaskBtn')?.addEventListener('click', () => {
      showModal('Nueva tarea', `
        <div class="form-group">
          <label class="form-label">Título</label>
          <input class="form-input" id="taskTitle" placeholder="Ej: Diseñar carrusel">
        </div>
        <div class="form-group">
          <label class="form-label">Descripción</label>
          <textarea class="form-textarea" id="taskDescription" placeholder="Detalles de la tarea" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Campaña</label>
          <select class="form-select" id="taskCampaign">${campaignOptions('')}</select>
        </div>
      `, [
        { label: 'Cancelar', class: 'btn-secondary', action: (close) => close() },
        { label: 'Crear tarea', class: 'btn-primary', action: (close) => {
          const title = document.getElementById('taskTitle').value.trim();
          if (!title) return;
          DB.create('tasks', {
            clientId,
            campaignId: document.getElementById('taskCampaign').value,
            title,
            description: document.getElementById('taskDescription').value.trim(),
            status: 'todo'
          });
          close();
          showToast('Tarea creada', 'success');
          renderTasks(container);
        }}
      ]);
    });
  }

  const EVENTS_PAGE = 15;
  let eventPage = 1;

  // ─── CALENDAR ──────────────────────────────────────────────

  function renderCalendar(container) {
    const events = DB.where('events', e => e.clientId === clientId)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    function getCalendarDays(month, year) {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const days = [];
      const startPad = firstDay.getDay();
      for (let i = startPad - 1; i >= 0; i--) {
        const d = new Date(year, month, -i);
        days.push({ day: d.getDate(), date: d, other: true });
      }
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const d = new Date(year, month, i);
        days.push({ day: i, date: d, other: false });
      }
      return days;
    }

    function eventFormHtml(event) {
      const isEdit = !!event;
      const e = event || { title: '', type: 'publication', date: '', campaignId: '' };
      return `
        <div class="form-group">
          <label class="form-label">Título</label>
          <input class="form-input" id="evtTitle" value="${Utils.sanitize(e.title)}" placeholder="Ej: Publicar campaña">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Tipo</label>
            <select class="form-select" id="evtType">
              <option value="publication" ${e.type === 'publication' ? 'selected' : ''}>Publicación</option>
              <option value="meeting" ${e.type === 'meeting' ? 'selected' : ''}>Reunión</option>
              <option value="delivery" ${e.type === 'delivery' ? 'selected' : ''}>Entrega</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Fecha</label>
            <input class="form-input" type="date" id="evtDate" value="${e.date ? e.date.slice(0, 10) : ''}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Campaña</label>
          <select class="form-select" id="evtCampaign">${campaignOptions(e.campaignId)}</select>
        </div>
      `;
    }

    function eventsTable() {
      if (events.length === 0) return `<div class="empty-state" style="padding:24px"><p style="color:var(--text-muted)">No hay eventos</p></div>`;
      const totalPages = Math.ceil(events.length / EVENTS_PAGE) || 1;
      if (eventPage > totalPages) eventPage = totalPages;
      const start = (eventPage - 1) * EVENTS_PAGE;
      const pageItems = events.slice(start, start + EVENTS_PAGE);
      const pagi = totalPages > 1 ? renderPagin(eventPage, totalPages, 'evt') : '';
      return `
        <table class="table">
          <thead><tr><th>Fecha</th><th>Evento</th><th>Tipo</th><th>Campaña</th><th></th></tr></thead>
          <tbody>
            ${pageItems.map(e => {
              const campName = getCampaignName(e.campaignId);
              return `
                <tr data-event-id="${e.id}">
                  <td>${Utils.formatDate(e.date)}</td>
                  <td>${Utils.sanitize(e.title)}</td>
                  <td><span class="tag calendar-event ${e.type}" style="padding:2px 8px">${Utils.capitalize(e.type)}</span></td>
                  <td style="font-size:var(--text-xs);color:var(--text-muted)">${campName ? Utils.sanitize(campName) : '—'}</td>
                  <td><button class="btn btn-ghost btn-sm delete-event" data-id="${e.id}" style="color:var(--danger)">Eliminar</button></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        ${pagi}
      `;
    }

    container.innerHTML = `
      <div class="page-enter">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h3 style="font-size:var(--text-lg);font-weight:600">Calendario</h3>
          <button class="btn btn-primary btn-sm" id="addEventBtn">Nuevo evento</button>
        </div>
        <div class="calendar">
          <div class="calendar-header">
            <h3>${now.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</h3>
          </div>
          <div class="calendar-grid">
            ${['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d =>
              `<div class="calendar-day-header">${d}</div>`
            ).join('')}
            ${getCalendarDays(currentMonth, currentYear).map(day => {
              const today = new Date();
              const isToday = day.date.toDateString() === today.toDateString();
              const dayEvents = events.filter(e =>
                new Date(e.date).toDateString() === day.date.toDateString()
              );
              return `
                <div class="calendar-day ${day.other ? 'other-month' : ''} ${isToday ? 'today' : ''}">
                  <div class="calendar-day-number">${day.day}</div>
                  ${dayEvents.map(e => `
                    <div class="calendar-event ${e.type}">${Utils.sanitize(e.title)}</div>
                  `).join('')}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div style="margin-top:20px">
          <h4 style="font-size:var(--text-sm);font-weight:600;color:var(--text-secondary);margin-bottom:8px">Todos los eventos</h4>
          <div id="eventList">${eventsTable()}</div>
        </div>
      </div>
    `;

    container.querySelector('#addEventBtn').addEventListener('click', () => {
      showModal('Nuevo evento', eventFormHtml(null), [
        { label: 'Cancelar', class: 'btn-secondary', action: (close) => close() },
        { label: 'Crear evento', class: 'btn-primary', action: (close) => {
          const title = document.getElementById('evtTitle').value.trim();
          const date = document.getElementById('evtDate').value;
          if (!title || !date) return;
          DB.create('events', {
            clientId,
            campaignId: document.getElementById('evtCampaign').value,
            title,
            type: document.getElementById('evtType').value,
            date: new Date(date).toISOString(),
            description: ''
          });
          close();
          showToast('Evento creado', 'success');
          renderCalendar(container);
        }}
      ]);
    });

    container.querySelectorAll('.table tr[data-event-id]').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.delete-event')) return;
        const ev = DB.getById('events', row.dataset.eventId);
        if (!ev) return;
        showModal('Editar evento', eventFormHtml(ev), [
          { label: 'Cancelar', class: 'btn-secondary', action: (close) => close() },
          { label: 'Guardar', class: 'btn-primary', action: (close) => {
            const title = document.getElementById('evtTitle').value.trim();
            const date = document.getElementById('evtDate').value;
            if (!title || !date) return;
            DB.update('events', ev.id, {
              title,
              type: document.getElementById('evtType').value,
              date: new Date(date).toISOString(),
              campaignId: document.getElementById('evtCampaign').value
            });
            close();
            showToast('Evento actualizado', 'success');
            renderCalendar(container);
          }}
        ]);
      });
    });

    container.querySelectorAll('.delete-event').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('¿Eliminar este evento?')) {
          DB.remove('events', btn.dataset.id);
          showToast('Evento eliminado', 'success');
          renderCalendar(container);
        }
      });
    });

    bindPagin(container, 'evt', () => {
      const events = DB.where('events', e => e.clientId === clientId).sort((a, b) => new Date(a.date) - new Date(b.date));
      if (events.length === 0) return `<div class="empty-state" style="padding:24px"><p style="color:var(--text-muted)">No hay eventos</p></div>`;
      const totalPages = Math.ceil(events.length / EVENTS_PAGE) || 1;
      if (eventPage > totalPages) eventPage = totalPages;
      const start = (eventPage - 1) * EVENTS_PAGE;
      const pageItems = events.slice(start, start + EVENTS_PAGE);
      const pagi = totalPages > 1 ? renderPagin(eventPage, totalPages, 'evt') : '';
      return `
        <table class="table">
          <thead><tr><th>Fecha</th><th>Evento</th><th>Tipo</th><th>Campaña</th><th></th></tr></thead>
          <tbody>
            ${pageItems.map(e => {
              const campName = getCampaignName(e.campaignId);
              return `
                <tr data-event-id="${e.id}">
                  <td>${Utils.formatDate(e.date)}</td>
                  <td>${Utils.sanitize(e.title)}</td>
                  <td><span class="tag calendar-event ${e.type}" style="padding:2px 8px">${Utils.capitalize(e.type)}</span></td>
                  <td style="font-size:var(--text-xs);color:var(--text-muted)">${campName ? Utils.sanitize(campName) : '—'}</td>
                  <td><button class="btn btn-ghost btn-sm delete-event" data-id="${e.id}" style="color:var(--danger)">Eliminar</button></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        ${pagi}
      `;
    });
  }

  const PROMPTS_PAGE = 12;
  let promptPage = 1;
  let promptFilterVal = 'all';

  // ─── PROMPTS ───────────────────────────────────────────────

  function renderPrompts(container) {
    const prompts = DB.where('prompts', p => p.clientId === clientId);

    function promptGrid() {
      let filtered = prompts;
      if (promptFilterVal && promptFilterVal !== 'all') filtered = prompts.filter(p => p.type === promptFilterVal);
      if (filtered.length === 0) {
        return `<div class="empty-state" style="padding:40px 24px"><p style="color:var(--text-muted)">Sin prompts</p></div>`;
      }
      const totalPages = Math.ceil(filtered.length / PROMPTS_PAGE) || 1;
      if (promptPage > totalPages) promptPage = totalPages;
      const start = (promptPage - 1) * PROMPTS_PAGE;
      const pageItems = filtered.slice(start, start + PROMPTS_PAGE);
      const pagi = totalPages > 1 ? renderPagin(promptPage, totalPages, 'prm') : '';
      return `<div class="prompt-grid stagger">${pageItems.map(p => {
        const typeColor = { copy: 'tag-post', branding: 'tag-active', campaign: 'tag-paused', reels: 'tag-reel' };
        return `
          <div class="prompt-card" data-id="${p.id}">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <span class="tag ${typeColor[p.type] || 'tag-draft'}">${Utils.capitalize(p.type)}</span>
            </div>
            <div style="font-weight:600;font-size:var(--text-sm);margin-bottom:6px">${Utils.sanitize(p.title)}</div>
            <pre style="font-size:var(--text-xs);max-height:100px;overflow:hidden">${Utils.sanitize(p.content)}</pre>
            <div style="display:flex;gap:6px;margin-top:10px">
              <button class="btn btn-ghost btn-sm copy-prompt" data-content="${Utils.sanitize(p.content).replace(/"/g, '&quot;')}">Copiar</button>
              <button class="btn btn-ghost btn-sm edit-prompt" data-id="${p.id}">Editar</button>
              <button class="btn btn-ghost btn-sm delete-prompt" data-id="${p.id}" style="color:var(--danger)">Eliminar</button>
            </div>
          </div>
        `;
      }).join('')}</div>${pagi}`;
    }

    container.innerHTML = `
      <div class="page-enter">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h3 style="font-size:var(--text-lg);font-weight:600">Prompts</h3>
          <button class="btn btn-primary btn-sm" id="addPromptBtn">Nuevo prompt</button>
        </div>
        <div style="display:flex;gap:6px;margin-bottom:12px">
          <button class="btn btn-ghost btn-sm prompt-filter active" data-filter="all">Todos</button>
          <button class="btn btn-ghost btn-sm prompt-filter" data-filter="copy">Copy</button>
          <button class="btn btn-ghost btn-sm prompt-filter" data-filter="branding">Branding</button>
          <button class="btn btn-ghost btn-sm prompt-filter" data-filter="campaign">Campaña</button>
          <button class="btn btn-ghost btn-sm prompt-filter" data-filter="reels">Reels</button>
        </div>
        <div id="promptGrid">${promptGrid()}</div>
      </div>
    `;

    function promptFormHtml(prompt) {
      const isEdit = !!prompt;
      const p = prompt || { type: 'copy', title: '', content: '' };
      return `
        <div class="form-group">
          <label class="form-label">Tipo</label>
          <select class="form-select" id="prType">
            <option value="copy" ${p.type === 'copy' ? 'selected' : ''}>Copy</option>
            <option value="branding" ${p.type === 'branding' ? 'selected' : ''}>Branding</option>
            <option value="campaign" ${p.type === 'campaign' ? 'selected' : ''}>Campaña</option>
            <option value="reels" ${p.type === 'reels' ? 'selected' : ''}>Reels</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Título</label>
          <input class="form-input" id="prTitle" value="${Utils.sanitize(p.title)}" placeholder="Ej: Prompt de copy para redes">
        </div>
        <div class="form-group">
          <label class="form-label">Contenido del prompt</label>
          <textarea class="form-textarea" id="prContent" rows="6" placeholder="Escribí el prompt completo...">${Utils.sanitize(p.content)}</textarea>
        </div>
      `;
    }

    container.querySelector('#addPromptBtn').addEventListener('click', () => {
      showModal('Nuevo prompt', promptFormHtml(null), [
        { label: 'Cancelar', class: 'btn-secondary', action: (close) => close() },
        { label: 'Crear prompt', class: 'btn-primary', action: (close) => {
          const title = document.getElementById('prTitle').value.trim();
          const content = document.getElementById('prContent').value.trim();
          if (!title || !content) return;
          DB.create('prompts', {
            clientId,
            type: document.getElementById('prType').value,
            title,
            content
          });
          close();
          showToast('Prompt creado', 'success');
          renderPrompts(container);
        }}
      ]);
    });

    container.querySelectorAll('.prompt-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.prompt-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        promptFilterVal = btn.dataset.filter;
        promptPage = 1;
        const grid = document.getElementById('promptGrid');
        if (grid) grid.innerHTML = promptGrid();
        bindPagin(container, 'prm', () => promptGrid());
      });
    });

    bindPagin(container, 'prm', () => promptGrid());

    container.querySelectorAll('.copy-prompt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(btn.dataset.content).then(() => {
          showToast('Prompt copiado', 'success');
        }).catch(() => showToast('Error al copiar', 'error'));
      });
    });

    container.querySelectorAll('.edit-prompt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const p = DB.getById('prompts', btn.dataset.id);
        if (!p) return;
        showModal('Editar prompt', promptFormHtml(p), [
          { label: 'Cancelar', class: 'btn-secondary', action: (close) => close() },
          { label: 'Guardar', class: 'btn-primary', action: (close) => {
            const title = document.getElementById('prTitle').value.trim();
            const content = document.getElementById('prContent').value.trim();
            if (!title || !content) return;
            DB.update('prompts', p.id, {
              type: document.getElementById('prType').value,
              title,
              content
            });
            close();
            showToast('Prompt actualizado', 'success');
            renderPrompts(container);
          }}
        ]);
      });
    });

    container.querySelectorAll('.delete-prompt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const p = DB.getById('prompts', btn.dataset.id);
        if (!p) return;
        if (confirm(`¿Eliminar el prompt "${p.title}"?`)) {
          DB.remove('prompts', p.id);
          showToast('Prompt eliminado', 'success');
          renderPrompts(container);
        }
      });
    });
  }

  // ─── SETTINGS ──────────────────────────────────────────────

  function renderSettings(container) {
    container.innerHTML = `
      <div class="page-enter">
        <h3 style="font-size:var(--text-lg);font-weight:600;margin-bottom:16px">Configuración</h3>

        <div class="card" style="margin-bottom:16px">
          <div class="card-header">
            <div class="card-title">Información del cliente</div>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Nombre</label>
              <input class="form-input" id="editName" value="${Utils.sanitize(client.name)}">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Instagram</label>
                <input class="form-input" id="editInstagram" value="${Utils.sanitize(client.instagram || '')}">
              </div>
              <div class="form-group">
                <label class="form-label">Sitio web</label>
                <input class="form-input" id="editWebsite" value="${Utils.sanitize(client.website || '')}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Rubro</label>
              <input class="form-input" id="editIndustry" value="${Utils.sanitize(client.industry || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">Posicionamiento</label>
              <textarea class="form-textarea" id="editPositioning" rows="2">${Utils.sanitize(client.positioning || '')}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Tono</label>
              <textarea class="form-textarea" id="editTone" rows="2">${Utils.sanitize(client.tone || '')}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Objetivo principal</label>
              <textarea class="form-textarea" id="editObjective" rows="2">${Utils.sanitize(client.mainObjective || '')}</textarea>
            </div>
            <button class="btn btn-primary" id="saveClientBtn">Guardar cambios</button>
          </div>
        </div>

        <div class="card" style="margin-bottom:16px">
          <div class="card-header">
            <div class="card-title">Servicios</div>
          </div>
          <div class="card-body">
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              ${['Redes Sociales', 'Branding', 'Diseño', 'Marketing', 'Publicidad', 'Desarrollo Web', 'Fotografía', 'Video'].map(s => `
                <label style="display:flex;align-items:center;gap:4px;font-size:var(--text-sm);cursor:pointer">
                  <input type="checkbox" class="service-check" value="${s}" ${(client.services || []).includes(s) ? 'checked' : ''}>
                  ${s}
                </label>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom:16px">
          <div class="card-header">
            <div class="card-title">Palabras permitidas</div>
          </div>
          <div class="card-body">
            <p style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:8px">Separadas por comas. Estas palabras se priorizan en la comunicación.</p>
            <input class="form-input" id="editAllowedWords" value="${(client.allowedWords || []).join(', ')}" placeholder="Ej: smash, vice, night">
          </div>
        </div>

        <div class="card" style="margin-bottom:16px">
          <div class="card-header">
            <div class="card-title">Palabras prohibidas</div>
          </div>
          <div class="card-body">
            <p style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:8px">Separadas por comas. Estas palabras se evitan en la comunicación.</p>
            <input class="form-input" id="editBannedWords" value="${(client.bannedWords || []).join(', ')}" placeholder="Ej: barato, económico, oferta">
          </div>
        </div>

        <div class="danger-zone">
          <h3 style="font-size:var(--text-base);font-weight:600;margin-bottom:8px">${client.archived ? 'Cliente archivado' : 'Zona de peligro'}</h3>
          ${client.archived ? `
            <p style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:12px">Este cliente está archivado. Podés restaurarlo o eliminarlo permanentemente.</p>
            <button class="btn btn-secondary" id="restoreClientBtn">Restaurar cliente</button>
            <button class="btn btn-danger" id="deleteClientBtn" style="margin-left:8px">Eliminar permanentemente</button>
          ` : `
            <p style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:12px">Archivar este cliente oculta sus datos sin borrarlos. Podés restaurarlo después desde la lista de clientes.</p>
            <button class="btn btn-secondary" id="archiveClientBtn">Archivar cliente</button>
          `}
        </div>
      </div>
    `;

    container.querySelector('#saveClientBtn').addEventListener('click', () => {
      const allowedRaw = document.getElementById('editAllowedWords').value;
      const bannedRaw = document.getElementById('editBannedWords').value;
      DB.update('clients', clientId, {
        name: document.getElementById('editName').value.trim(),
        instagram: document.getElementById('editInstagram').value.trim(),
        website: document.getElementById('editWebsite').value.trim(),
        industry: document.getElementById('editIndustry').value.trim(),
        positioning: document.getElementById('editPositioning').value.trim(),
        tone: document.getElementById('editTone').value.trim(),
        mainObjective: document.getElementById('editObjective').value.trim(),
        services: Array.from(document.querySelectorAll('.service-check:checked')).map(cb => cb.value),
        allowedWords: allowedRaw.split(',').map(w => w.trim()).filter(Boolean),
        bannedWords: bannedRaw.split(',').map(w => w.trim()).filter(Boolean)
      });
      showToast('Cliente actualizado', 'success');
      const header = document.getElementById('clientHeader');
      if (header) {
        header.querySelector('.client-info h2').textContent = document.getElementById('editName').value.trim();
      }
    });

    container.querySelector('#archiveClientBtn')?.addEventListener('click', () => {
      DB.archive('clients', clientId);
      Sound.trash();
      showToast('Cliente archivado', 'success');
      router.navigate('/clients');
    });

    container.querySelector('#restoreClientBtn')?.addEventListener('click', () => {
      DB.restore('clients', clientId);
      showToast('Cliente restaurado', 'success');
      renderSettings(container);
    });

    container.querySelector('#deleteClientBtn')?.addEventListener('click', () => {
      showModal('Eliminar permanentemente', `
        <p style="margin-bottom:12px">¿Eliminar para siempre a <strong>${Utils.sanitize(client.name)}</strong>?</p>
        <p style="font-size:var(--text-sm);color:var(--text-muted)">Todos sus datos se borrarán. Esta acción no se puede deshacer.</p>
      `, [
        { label: 'Cancelar', class: 'btn-secondary', action: (close) => close() },
        { label: 'Eliminar', class: 'btn-danger', action: (close) => {
          DB.deleteClient(clientId);
          close();
          showToast('Cliente eliminado', 'success');
          router.navigate('/clients');
        }}
      ]);
    });
  }

  // ─── RETURN ────────────────────────────────────────────────

  return {
    render() {
      return `
        <div class="page-enter">
          <div class="client-header" id="clientHeader">
            <div class="client-avatar">${client.name.charAt(0)}</div>
            <div class="client-info">
              <h2>${Utils.sanitize(client.name)}</h2>
              <div class="client-meta">
                <span>${Utils.sanitize(client.industry)}</span>
                ${client.instagram ? `<span>${Utils.sanitize(client.instagram)}</span>` : ''}
                <span>·</span>
                <span>${Utils.getRelativeTime(client.createdAt)}</span>
              </div>
            </div>
          </div>

          <div class="services-list" style="margin-bottom:16px">
            ${(client.services || []).map(s => `<span class="service-tag">${Utils.sanitize(s)}</span>`).join('')}
          </div>

          <div class="tabs">
            ${TABS.map(t => `
              <button class="tab ${t.id === 'overview' ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>
            `).join('')}
          </div>

          <div id="tabContent"></div>
        </div>
      `;
    },
    afterRender() {
      renderTabContent();
      document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
      });
    }
  };
}
