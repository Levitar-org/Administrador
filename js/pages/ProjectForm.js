import { DB } from '../db.js';
import { router } from '../router.js';
import { showToast } from '../components/Toast.js';

export function ProjectFormPage(params) {
  const clientId = params.id || null;

  function getClient() {
    return clientId ? DB.getById('clients', clientId) : null;
  }

  return {
    render() {
      const client = getClient();
      return `
        <div class="page-enter">
          <div class="detail-header">
            <button class="btn btn-ghost" id="backBtn">← Volver</button>
            <div class="detail-header-info">
              <h1>Nuevo Proyecto</h1>
              ${client ? `<p style="color:var(--text-muted)">para ${client.name}</p>` : ''}
            </div>
          </div>

          <div class="card" style="max-width:600px;margin:24px auto;padding:24px">
            <div class="form-group">
              <label>Nombre del proyecto *</label>
              <input type="text" id="projectName" class="form-input" placeholder="Ej: Campaña de verano 2026" autofocus>
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
            <div style="display:flex;gap:8px;margin-top:24px">
              <button class="btn btn-primary" id="saveBtn">Crear proyecto</button>
              <button class="btn btn-secondary" id="cancelBtn">Cancelar</button>
            </div>
          </div>
        </div>
      `;
    },
    afterRender() {
      const client = getClient();
      document.getElementById('backBtn')?.addEventListener('click', () => router.navigate(clientId ? `/clients/${clientId}` : '/'));
      document.getElementById('cancelBtn')?.addEventListener('click', () => router.navigate(clientId ? `/clients/${clientId}` : '/'));
      document.getElementById('saveBtn')?.addEventListener('click', () => {
        const name = document.getElementById('projectName').value.trim();
        if (!name) return showToast('El nombre es obligatorio', 'warning');
        const desc = document.getElementById('projectDesc').value.trim();
        const status = document.getElementById('projectStatus').value;
        const project = DB.create('projects', {
          clientId,
          workspace: clientId ? 'client' : 'personal',
          name,
          description: desc,
          status,
          archived: false
        });
        showToast('Proyecto creado', 'success');
        if (clientId) router.navigate(`/clients/${clientId}/projects/${project.id}`);
        else router.navigate(`/personal/projects/${project.id}`);
      });
    }
  };
}
