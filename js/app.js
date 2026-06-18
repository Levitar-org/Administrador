import { DB } from './db.js';
import { seedDemoData } from './seed.js';
import { router } from './router.js';
import { Sound } from './sound.js';
import { renderSidebar, updateSidebarActive } from './components/Sidebar.js';
import { DashboardPage } from './pages/Dashboard.js';
import { ClientsPage } from './pages/Clients.js';
import { ClientDetailPage } from './pages/ClientDetail.js';
import { ClientFormPage } from './pages/ClientForm.js';
import { SettingsPage } from './pages/Settings.js';

function renderPage(page) {
  const content = document.getElementById('content');
  Sound.page();
  content.innerHTML = page.render();
  updateSidebarActive();
  if (page.afterRender) {
    page.afterRender();
  }
}

DB.init();
seedDemoData();
renderSidebar();

router.register('', () => renderPage(DashboardPage()));
router.register('clients', () => renderPage(ClientsPage()));
router.register('clients/new', () => renderPage(ClientFormPage()));
router.register('clients/:id', (params) => renderPage(ClientDetailPage(params)));
router.register('settings', () => renderPage(SettingsPage()));

router.init();
