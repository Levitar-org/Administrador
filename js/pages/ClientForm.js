import { DB } from '../db.js';
import { showToast } from '../components/Toast.js';
import { router } from '../router.js';

export function ClientFormPage() {
  return {
    render() {
      return `
        <div class="page-enter" style="max-width:640px">
          <div class="content-header" style="padding-top:0">
            <h1>Nuevo cliente</h1>
          </div>
          <div class="card">
            <div class="card-body">
              <div class="form-group">
                <label class="form-label">Nombre del cliente *</label>
                <input class="form-input" id="formName" placeholder="Ej: Vice Burger">
              </div>
              <div class="form-group">
                <label class="form-label">Rubro</label>
                <input class="form-input" id="formIndustry" placeholder="Ej: Hamburguesería Premium">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Instagram</label>
                  <input class="form-input" id="formInstagram" placeholder="Ej: @viceburger.sf">
                </div>
                <div class="form-group">
                  <label class="form-label">Sitio web</label>
                  <input class="form-input" id="formWebsite" placeholder="Ej: https://viceburger.com">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Posicionamiento</label>
                <textarea class="form-textarea" id="formPositioning" placeholder="¿Cómo se posiciona la marca?" rows="2"></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Tono de comunicación</label>
                <input class="form-input" id="formTone" placeholder="Ej: atrevido, moderno, divertido, urbano">
              </div>
              <div class="form-group">
                <label class="form-label">Objetivo principal</label>
                <textarea class="form-textarea" id="formObjective" placeholder="¿Cuál es el objetivo principal?" rows="2"></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Servicios</label>
                <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">
                  ${['Redes Sociales', 'Branding', 'Diseño', 'Marketing', 'Publicidad', 'Desarrollo Web', 'Fotografía', 'Video'].map(s => `
                    <label style="display:flex;align-items:center;gap:4px;font-size:var(--text-sm);cursor:pointer">
                      <input type="checkbox" class="service-check" value="${s}">
                      ${s}
                    </label>
                  `).join('')}
                </div>
              </div>
              <div style="display:flex;gap:8px;margin-top:20px">
                <button class="btn btn-primary" id="saveClientBtn">Crear cliente</button>
                <button class="btn btn-secondary" onclick="window.location.hash='#/clients'">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      `;
    },
    afterRender() {
      document.getElementById('saveClientBtn').addEventListener('click', () => {
        const name = document.getElementById('formName').value.trim();
        if (!name) {
          showToast('El nombre del cliente es obligatorio', 'error');
          return;
        }

        const services = Array.from(document.querySelectorAll('.service-check:checked')).map(cb => cb.value);

        const client = DB.create('clients', {
          archived: false,
          name,
          industry: document.getElementById('formIndustry').value.trim(),
          instagram: document.getElementById('formInstagram').value.trim(),
          website: document.getElementById('formWebsite').value.trim(),
          positioning: document.getElementById('formPositioning').value.trim(),
          tone: document.getElementById('formTone').value.trim(),
          mainObjective: document.getElementById('formObjective').value.trim(),
          services,
          allowedWords: [],
          bannedWords: []
        });

        showToast('Cliente creado', 'success');
        router.navigate(`/clients/${client.id}`);
      });
    }
  };
}
