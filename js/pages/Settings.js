import { DB } from '../db.js';
import { Utils } from '../utils.js';
import { showToast } from '../components/Toast.js';

export function SettingsPage() {
  function saveUserName() {
    const name = document.getElementById('userNameInput').value.trim();
    if (name) {
      DB.saveProfile({ name });
      showToast('Nombre guardado', 'success');
    }
  }

  return {
    render() {
      const hasData = DB.count('clients') > 0;
      const profile = DB.getProfile();

      return `
        <div class="page-enter" style="max-width:640px">
          <div class="content-header" style="padding-top:0">
            <h1>Configuración</h1>
          </div>

          <div class="settings-section">
            <h3>Perfil</h3>
            <div class="card">
              <div class="card-body">
                <div class="form-group">
                  <label>Tu nombre</label>
                  <input type="text" id="userNameInput" class="form-input" value="${Utils.sanitize(profile.name)}" autofocus>
                </div>
                <button class="btn btn-primary" id="saveNameBtn" style="margin-top:8px">Guardar nombre</button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>Datos de demostración</h3>
            <div class="card">
              <div class="card-body">
                <p style="margin-bottom:12px">La aplicación incluye datos de demostración precargados para que puedas explorar todas las funcionalidades.</p>
                ${hasData ? `
                  <p style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:12px">Actualmente hay <strong>${DB.count('clients')}</strong> ${DB.count('clients') === 1 ? 'cliente' : 'clientes'} en el sistema.</p>
                ` : `
                  <p style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:12px">No hay datos de demostración. Podés recargarlos cuando quieras.</p>
                `}
                <button class="btn btn-secondary" id="reseedBtn">
                  ${hasData ? 'Recargar datos demo' : 'Cargar datos demo'}
                </button>
                ${hasData ? `
                  <button class="btn btn-danger" id="clearAllBtn" style="margin-left:8px">Eliminar todos los datos</button>
                ` : ''}
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>Acerca de</h3>
            <div class="card">
              <div class="card-body">
                <p><strong>Levitar OS</strong> — Marketing CRM</p>
                <p style="font-size:var(--text-sm);color:var(--text-secondary);margin-top:4px">Versión 1.0.0</p>
                <p style="font-size:var(--text-sm);color:var(--text-muted);margin-top:12px">Sistema de gestión de clientes, campañas y contenido para agencias de marketing.</p>
              </div>
            </div>
          </div>
        </div>
      `;
    },
    afterRender() {
      document.getElementById('saveNameBtn')?.addEventListener('click', saveUserName);
      document.getElementById('userNameInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') saveUserName(); });

      document.getElementById('reseedBtn')?.addEventListener('click', async () => {
        localStorage.clear();
        DB.init();
        const { seedDemoData } = await import('../seed.js');
        seedDemoData();
        showToast('Datos demo recargados', 'success');
        window.location.reload();
      });

      document.getElementById('clearAllBtn')?.addEventListener('click', () => {
        if (confirm('¿Estás seguro de eliminar todos los datos?')) {
          localStorage.clear();
          DB.init();
          showToast('Todos los datos eliminados', 'success');
          window.location.reload();
        }
      });
    }
  };
}
