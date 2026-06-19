import { DB } from '../db.js';
import { Utils } from '../utils.js';
import { router } from '../router.js';
import { showModal } from '../components/Modal.js';
import { showToast } from '../components/Toast.js';

export function ClientDetailPage(params) {
  const clientId = params.id;
  let activeTab = 'projects';

  function getClient() {
    return DB.getById('clients', clientId);
  }

  function getProjects() {
    return DB.getClientProjects(clientId);
  }

  function renderHeader(client) {
    return `
      <div class="detail-header">
        <button class="btn btn-ghost" id="backBtn">← Volver</button>
        <div class="detail-header-info">
          <div class="detail-avatar">${client.name.charAt(0)}</div>
          <div>
            <h1>${Utils.sanitize(client.name)}</h1>
            <p style="color:var(--text-muted)">${Utils.sanitize(client.industry)}</p>
          </div>
        </div>
        <div style="margin-left:auto;display:flex;gap:8px">
          <button class="btn btn-secondary" id="newProjectBtn">+ Nuevo Proyecto</button>
          <button class="btn btn-ghost" id="clientSettingsBtn">⚙</button>
        </div>
      </div>
    `;
  }

  function renderTabs() {
    const tabs = [
      { id: 'projects', label: 'Proyectos' },
      { id: 'info', label: 'Información' },
    ];
    return `
      <div class="tabs" style="margin-top:16px">
        ${tabs.map(t => `
          <button class="tab-btn ${activeTab === t.id ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>
        `).join('')}
      </div>
    `;
  }

  function renderProjectsTab() {
    const projects = getProjects();
    return `
      <div class="page-enter" style="margin-top:16px">
        ${projects.length === 0 ? `
          <div class="empty-state" style="padding:48px;text-align:center">
            <p style="color:var(--text-muted);margin-bottom:12px">Este cliente aún no tiene proyectos</p>
            <button class="btn btn-primary" id="newProjectBtnEmpty">+ Crear primer proyecto</button>
          </div>
        ` : `
          <div class="project-grid">
            ${projects.map(p => `
              <div class="project-card" data-project-id="${p.id}">
                <div class="project-card-header">
                  <div class="project-status project-status-${p.status}"></div>
                  <span class="tag tag-${p.status}">${Utils.statusLabel(p.status)}</span>
                </div>
                <h3 class="project-card-name">${Utils.sanitize(p.name)}</h3>
                <p class="project-card-desc">${Utils.truncate(Utils.sanitize(p.description || ''), 80)}</p>
                <div class="project-card-meta">
                  <span>Creado ${Utils.getRelativeTime(p.createdAt)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  function renderInfoTab(client) {
    return `
      <div class="page-enter" style="margin-top:16px">
        <div class="card" style="padding:24px">
          <div class="form-group">
            <label>Nombre</label>
            <input type="text" id="editName" value="${Utils.sanitize(client.name)}" class="form-input">
          </div>
          <div class="form-group">
            <label>Industria</label>
            <input type="text" id="editIndustry" value="${Utils.sanitize(client.industry || '')}" class="form-input">
          </div>
          <div class="form-group">
            <label>Instagram</label>
            <input type="text" id="editInstagram" value="${Utils.sanitize(client.instagram || '')}" class="form-input">
          </div>
          <div class="form-group">
            <label>Website</label>
            <input type="text" id="editWebsite" value="${Utils.sanitize(client.website || '')}" class="form-input">
          </div>
          <div class="form-group">
            <label>Posicionamiento</label>
            <textarea id="editPositioning" class="form-input" rows="3">${Utils.sanitize(client.positioning || '')}</textarea>
          </div>
          <div class="form-group">
            <label>Tono</label>
            <input type="text" id="editTone" value="${Utils.sanitize(client.tone || '')}" class="form-input">
          </div>
          <div class="form-group">
            <label>Objetivo Principal</label>
            <textarea id="editObjective" class="form-input" rows="2">${Utils.sanitize(client.mainObjective || '')}</textarea>
          </div>
          <div style="display:flex;gap:8px;margin-top:16px">
            <button class="btn btn-primary" id="saveClientBtn">Guardar cambios</button>
            <button class="btn btn-danger" id="deleteClientBtn">Eliminar cliente</button>
            <button class="btn btn-secondary" id="archiveClientBtn">${client.archived ? 'Restaurar' : 'Archivar'}</button>
          </div>
        </div>
      </div>
    `;
  }

  function showNewProjectForm() {
    showModal('Nuevo Proyecto', `
      <div class="form-group">
        <label>Nombre del proyecto</label>
        <input type="text" id="projectName" class="form-input" placeholder="Ej: Campaña de verano" autofocus>
      </div>
      <div class="form-group">
        <label>Descripción</label>
        <textarea id="projectDesc" class="form-input" rows="3" placeholder="Objetivo y alcance del proyecto"></textarea>
      </div>
      <div class="form-group">
        <label>Estado</label>
        <select id="projectStatus" class="form-input">
          <option value="active">Activo</option>
          <option value="paused">Pausado</option>
          <option value="completed">Completado</option>
        </select>
      </div>
    `, [
      { label: 'Cancelar', class: 'btn btn-secondary', action: close => close() },
      { label: 'Crear proyecto', class: 'btn btn-primary', action: close => {
        const name = document.getElementById('projectName').value.trim();
        if (!name) return showToast('El nombre es obligatorio', 'warning');
        const desc = document.getElementById('projectDesc').value.trim();
        const status = document.getElementById('projectStatus').value;
        DB.create('projects', {
          clientId,
          workspace: 'client',
          name,
          description: desc,
          status,
          archived: false
        });
        DB.createHistoryEntry('create', 'project', '', { projectId: '', workspace: 'client', name });
        showToast('Proyecto creado', 'success');
        close();
        reRender();
      }}
    ]);
  }

  function reRender() {
    const page = render();
    const content = document.getElementById('content');
    if (content) {
      content.innerHTML = page.render();
      page.afterRender();
    }
  }

  function render() {
    const client = getClient();
    if (!client) {
      router.navigate('/clients');
      return { render: () => '', afterRender: () => {} };
    }

    return {
      render() {
        return `
          <div class="page-enter">
            ${renderHeader(client)}
            ${renderTabs()}
            ${activeTab === 'projects' ? renderProjectsTab() : renderInfoTab(client)}
          </div>
        `;
      },
      afterRender() {
        document.getElementById('backBtn')?.addEventListener('click', () => router.navigate('/clients'));
        document.getElementById('newProjectBtn')?.addEventListener('click', showNewProjectForm);
        document.getElementById('newProjectBtnEmpty')?.addEventListener('click', showNewProjectForm);
        document.getElementById('clientSettingsBtn')?.addEventListener('click', () => {
          activeTab = 'info';
          reRender();
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            activeTab = btn.dataset.tab;
            reRender();
          });
        });

        // Project card click
        document.querySelectorAll('.project-card').forEach(el => {
          el.addEventListener('click', () => {
            router.navigate(`/clients/${clientId}/projects/${el.dataset.projectId}`);
          });
        });

        // Save client
        document.getElementById('saveClientBtn')?.addEventListener('click', () => {
          DB.update('clients', clientId, {
            name: document.getElementById('editName').value.trim(),
            industry: document.getElementById('editIndustry').value.trim(),
            instagram: document.getElementById('editInstagram').value.trim(),
            website: document.getElementById('editWebsite').value.trim(),
            positioning: document.getElementById('editPositioning').value.trim(),
            tone: document.getElementById('editTone').value.trim(),
            mainObjective: document.getElementById('editObjective').value.trim(),
          });
          showToast('Cliente actualizado', 'success');
          reRender();
        });

        // Delete client
        document.getElementById('deleteClientBtn')?.addEventListener('click', () => {
          showModal('Eliminar cliente', '¿Estás seguro? Se eliminarán todos sus proyectos y datos asociados.', [
            { label: 'Cancelar', class: 'btn btn-secondary', action: close => close() },
            { label: 'Eliminar', class: 'btn btn-danger', action: close => {
              DB.deleteClient(clientId);
              showToast('Cliente eliminado', 'success');
              close();
              router.navigate('/clients');
            }}
          ]);
        });

        // Archive/restore client
        document.getElementById('archiveClientBtn')?.addEventListener('click', () => {
          const client = getClient();
          if (client.archived) {
            DB.restore('clients', clientId);
            showToast('Cliente restaurado', 'success');
          } else {
            DB.archive('clients', clientId);
            showToast('Cliente archivado', 'success');
          }
          reRender();
        });
      }
    };
  }

  return render();
}
