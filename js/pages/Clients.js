import { DB } from '../db.js';
import { Utils } from '../utils.js';
import { router } from '../router.js';
import { showModal } from '../components/Modal.js';
import { showToast } from '../components/Toast.js';
import { Sound } from '../sound.js';

const PAGE_SIZE = 20;

export function ClientsPage() {
  let searchQuery = '';
  let filterMode = 'active';
  let currentPage = 1;

  function getClients() {
    let clients;
    if (filterMode === 'active') clients = DB.getActive('clients');
    else if (filterMode === 'archived') clients = DB.getArchived('clients');
    else clients = DB.getAll('clients');

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      clients = clients.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.industry || '').toLowerCase().includes(q) ||
        (c.instagram || '').toLowerCase().includes(q)
      );
    }
    return clients;
  }

  function renderClientList() {
    const allClients = getClients();
    const totalPages = Math.ceil(allClients.length / PAGE_SIZE) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * PAGE_SIZE;
    const clients = allClients.slice(start, start + PAGE_SIZE);

    if (allClients.length === 0) {
      return `
        <div class="empty-state" style="padding:60px 24px">
          ${searchQuery ? `
            <h3>Sin resultados</h3>
            <p>No se encontraron clientes para "${Utils.sanitize(searchQuery)}"</p>
          ` : filterMode === 'archived' ? `
            <h3>Sin archivados</h3>
            <p>No hay clientes archivados.</p>
          ` : `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.3"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <h3>No hay clientes</h3>
            <p>Creá tu primer cliente para comenzar a gestionar su contenido.</p>
            <button class="btn btn-primary" id="addClientBtnEmpty">Crear cliente</button>
          `}
        </div>
      `;
    }

    return `
      <div class="card-grid stagger">
        ${clients.map(c => {
          const campaigns = DB.where('campaigns', ca => ca.clientId === c.id);
          const contents = DB.where('contents', co => co.clientId === c.id);
          const tasks = DB.where('tasks', t => t.clientId === c.id);
          return `
            <div class="client-card" data-client-id="${c.id}">
              <div class="client-card-header">
                <div class="client-card-avatar">${c.name.charAt(0)}</div>
                <div style="flex:1">
                  <div class="client-card-name">${Utils.sanitize(c.name)}</div>
                  <div class="client-card-industry">${Utils.sanitize(c.industry)}</div>
                </div>
                ${c.archived ? `<span class="tag tag-draft">Archivado</span>` : ''}
              </div>
              <div class="client-card-body">
                ${c.instagram ? `<div style="margin-bottom:6px;font-size:var(--text-sm);color:var(--text-secondary)">${Utils.sanitize(c.instagram)}</div>` : ''}
                <div class="services-list">
                  ${(c.services || []).map(s => `<span class="service-tag">${Utils.sanitize(s)}</span>`).join('')}
                </div>
              </div>
              <div class="client-card-footer">
                <span>${campaigns.length} ${Utils.pluralize(campaigns.length, 'campaña', 'campañas')}</span>
                <span>${contents.length} ${Utils.pluralize(contents.length, 'contenido', 'contenidos')}</span>
                <span>${tasks.length} ${Utils.pluralize(tasks.length, 'tarea', 'tareas')}</span>
              </div>
              ${c.archived ? `
                <div style="display:flex;gap:6px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border-light)">
                  <button class="btn btn-ghost btn-sm restore-client" data-id="${c.id}">Restaurar</button>
                  <button class="btn btn-ghost btn-sm delete-client-perm" data-id="${c.id}" style="color:var(--danger)">Eliminar permanentemente</button>
                </div>
              ` : `
                <div style="display:flex;gap:6px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border-light)">
                  <button class="btn btn-ghost btn-sm archive-client" data-id="${c.id}">Archivar</button>
                </div>
              `}
            </div>
          `;
        }).join('')}
      </div>
      ${totalPages > 1 ? renderPagination(currentPage, totalPages, 'clients-page') : ''}
    `;
  }

  function renderPagination(page, total, prefix) {
    const prev = page > 1 ? `<button class="btn btn-ghost btn-sm pagi-prev" data-prefix="${prefix}">← Anterior</button>` : '';
    const next = page < total ? `<button class="btn btn-ghost btn-sm pagi-next" data-prefix="${prefix}">Siguiente →</button>` : '';
    return `
      <div class="pagination" style="display:flex;justify-content:center;align-items:center;gap:8px;margin-top:24px">
        ${prev}
        <span style="font-size:var(--text-sm);color:var(--text-muted)">Página ${page} de ${total}</span>
        ${next}
      </div>
    `;
  }

  return {
    render() {
      return `
        <div class="page-enter">
          <div class="content-header" style="padding-top:0">
            <h1>Clientes</h1>
            <div class="content-header-actions">
              <div class="search-bar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" id="clientSearch" placeholder="Buscar clientes..." value="${Utils.sanitize(searchQuery)}">
              </div>
              <button class="btn btn-primary" id="addClientBtn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Nuevo cliente
              </button>
            </div>
          </div>
          <div style="display:flex;gap:6px;margin-bottom:12px;padding:0 32px">
            <button class="btn btn-ghost btn-sm client-filter ${filterMode === 'active' ? 'active' : ''}" data-filter="active">Activos</button>
            <button class="btn btn-ghost btn-sm client-filter ${filterMode === 'archived' ? 'active' : ''}" data-filter="archived">Archivados</button>
            <button class="btn btn-ghost btn-sm client-filter ${filterMode === 'all' ? 'active' : ''}" data-filter="all">Todos</button>
          </div>
          <div style="padding:0 32px 32px" id="clientList">${renderClientList()}</div>
        </div>
      `;
    },
    afterRender() {
      const searchInput = document.getElementById('clientSearch');
      if (searchInput) {
        searchInput.addEventListener('input', Utils.debounce(function() {
          searchQuery = this.value;
          currentPage = 1;
          const list = document.getElementById('clientList');
          if (list) list.innerHTML = renderClientList();
          bindCardEvents();
        }, 200));
      }

      document.querySelectorAll('.client-filter').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.client-filter').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          filterMode = btn.dataset.filter;
          currentPage = 1;
          searchQuery = '';
          if (searchInput) searchInput.value = '';
          const list = document.getElementById('clientList');
          if (list) list.innerHTML = renderClientList();
          bindCardEvents();
        });
      });

      function bindCardEvents() {
        document.querySelectorAll('.pagi-prev, .pagi-next').forEach(btn => {
          btn.addEventListener('click', () => {
            const isNext = btn.classList.contains('pagi-next');
            currentPage += isNext ? 1 : -1;
            const list = document.getElementById('clientList');
            if (list) list.innerHTML = renderClientList();
            bindCardEvents();
          });
        });

        document.querySelectorAll('.client-card').forEach(el => {
          el.addEventListener('click', (e) => {
            if (e.target.closest('.archive-client') || e.target.closest('.restore-client') ||
                e.target.closest('.delete-client-perm')) return;
            router.navigate(`/clients/${el.dataset.clientId}`);
          });
        });

        document.querySelectorAll('.archive-client').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            DB.archive('clients', btn.dataset.id);
            Sound.trash();
            showToast('Cliente archivado', 'success');
            const list = document.getElementById('clientList');
            if (list) list.innerHTML = renderClientList();
            bindCardEvents();
          });
        });

        document.querySelectorAll('.restore-client').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            DB.restore('clients', btn.dataset.id);
            showToast('Cliente restaurado', 'success');
            const list = document.getElementById('clientList');
            if (list) list.innerHTML = renderClientList();
            bindCardEvents();
          });
        });

        document.querySelectorAll('.delete-client-perm').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const c = DB.getById('clients', btn.dataset.id);
            if (!c) return;
            showModal('Eliminar permanentemente', `
              <p style="margin-bottom:12px">¿Eliminar permanentemente a <strong>${Utils.sanitize(c.name)}</strong>?</p>
              <p style="font-size:var(--text-sm);color:var(--text-muted)">Todos sus datos se borrarán. Esta acción no se puede deshacer.</p>
            `, [
              { label: 'Cancelar', class: 'btn-secondary', action: (close) => close() },
              { label: 'Eliminar', class: 'btn-danger', action: (close) => {
                DB.deleteClient(c.id);
                close();
                showToast('Cliente eliminado', 'success');
                const list = document.getElementById('clientList');
                if (list) list.innerHTML = renderClientList();
                bindCardEvents();
              }}
            ]);
          });
        });

        const addBtnEmpty = document.getElementById('addClientBtnEmpty');
        if (addBtnEmpty) addBtnEmpty.addEventListener('click', () => router.navigate('/clients/new'));
      }
      bindCardEvents();

      const addBtn = document.getElementById('addClientBtn');
      if (addBtn) addBtn.addEventListener('click', () => router.navigate('/clients/new'));
    }
  };
}
