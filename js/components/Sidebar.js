import { router } from '../router.js';
import { Sound } from '../sound.js';

const mainLinks = [
  { href: '/', icon: 'dashboard', label: 'Dashboard' },
  { href: '/personal', icon: 'personal', label: 'Personal' },
];

const extraLinks = [
  { href: '/clients', icon: 'clients', label: 'Clientes' },
];

const personalLinks = [
  { href: '/personal', icon: 'projects', label: 'Proyectos' },
  { href: '/personal/tasks', icon: 'tasks', label: 'Tareas' },
  { href: '/personal/notes', icon: 'notes', label: 'Notas' },
  { href: '/personal/calendar', icon: 'calendar', label: 'Calendario' },
  { href: '/personal/ideas', icon: 'ideas', label: 'Ideas' },
];

const bottomLinks = [
  { href: '/settings', icon: 'settings', label: 'Configuración' }
];

const Icons = {
  logo: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="8" fill="#6366f1"/><path d="M7 14L12 19L21 10" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  dashboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  personal: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  clients: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  projects: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  tasks: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  notes: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
  calendar: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  ideas: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>`,
  settings: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  sun: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  soundOn: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
  soundOff: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`,
  chevronDown: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
};

let personalExpanded = false;

function isActive(href) {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  if (href === '/') return hash === '/' || hash === '';
  if (href === '/personal') return hash.startsWith('/personal');
  return hash.startsWith(href);
}

function togglePersonal(e) {
  e.preventDefault();
  personalExpanded = !personalExpanded;
  const submenu = document.getElementById('personalSubmenu');
  const chevron = document.getElementById('personalChevron');
  if (submenu) submenu.classList.toggle('open', personalExpanded);
  if (chevron) chevron.style.transform = personalExpanded ? 'rotate(180deg)' : 'rotate(0)';
}

export function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  personalExpanded = window.location.hash.startsWith('#/personal');

  sidebar.innerHTML = `
    <div class="sidebar-logo">
      ${Icons.logo}
      <span>Levitar OS</span>
    </div>
    <nav class="sidebar-nav">
      <div class="sidebar-section-label">Navegación</div>
      ${mainLinks.map(l => `
        <a class="sidebar-item ${isActive(l.href) ? 'active' : ''}" data-nav="${l.href}">
          ${Icons[l.icon]}
          <span>${l.label}</span>
          ${l.href === '/personal' ? `<span class="sidebar-chevron" id="personalChevron" style="margin-left:auto;transition:transform 0.2s">${Icons.chevronDown}</span>` : ''}
        </a>
      `).join('')}

      <div class="sidebar-submenu ${personalExpanded ? 'open' : ''}" id="personalSubmenu">
        ${personalLinks.map(l => `
          <a class="sidebar-item sidebar-sub-item ${isActive(l.href) ? 'active' : ''}" data-nav="${l.href}">
            ${Icons[l.icon]}
            <span>${l.label}</span>
          </a>
        `).join('')}
      </div>

      ${extraLinks.map(l => `
        <a class="sidebar-item ${isActive(l.href) ? 'active' : ''}" data-nav="${l.href}">
          ${Icons[l.icon]}
          <span>${l.label}</span>
        </a>
      `).join('')}
    </nav>
    <div class="sidebar-footer">
      ${bottomLinks.map(l => `
        <a class="sidebar-item ${isActive(l.href) ? 'active' : ''}" data-nav="${l.href}">
          ${Icons[l.icon]}
          <span>${l.label}</span>
        </a>
      `).join('')}
      <button class="sidebar-item theme-toggle" id="themeToggle" style="width:100%">
        <span id="themeIcon">${Icons.sun}</span>
        <span id="themeLabel">Modo claro</span>
      </button>
      <button class="sidebar-item" id="soundToggle" style="width:100%">
        <span id="soundIcon">${Icons.soundOn}</span>
        <span id="soundLabel">Sonido</span>
      </button>
    </div>
  `;

  // Navigation
  sidebar.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const nav = el.dataset.nav;
      if (nav === '/personal') {
        togglePersonal(e);
      }
      router.navigate(nav);
    });
  });

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
    updateThemeUI();
  }

  // Sound toggle
  const soundToggle = document.getElementById('soundToggle');
  if (soundToggle) {
    const updateSoundUI = () => {
      const icon = document.getElementById('soundIcon');
      const label = document.getElementById('soundLabel');
      const on = Sound.isEnabled();
      if (icon) icon.innerHTML = on ? Icons.soundOn : Icons.soundOff;
      if (label) label.textContent = on ? 'Sonido' : 'Silencio';
    };
    soundToggle.addEventListener('click', () => {
      Sound.toggle(!Sound.isEnabled());
      updateSoundUI();
    });
    updateSoundUI();
  }

  // Mobile drawer
  const toggleBtn = document.getElementById('sidebarToggle');
  const overlay = document.getElementById('sidebarOverlay');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSidebar(!document.getElementById('sidebar').classList.contains('open'));
    });
  }
  if (overlay) {
    overlay.addEventListener('click', () => toggleSidebar(false));
  }
  document.querySelectorAll('.sidebar-item[data-nav]').forEach(el => {
    el.addEventListener('click', () => toggleSidebar(false));
  });
}

function toggleSidebar(open) {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!sidebar || !overlay) return;
  sidebar.classList.toggle('open', open);
  overlay.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

function getPreferredTheme() {
  const stored = localStorage.getItem('levitar_theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function toggleTheme() {
  const current = getPreferredTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('levitar_theme', next);
  applyTheme(next);
  updateThemeUI();
}

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

function updateThemeUI() {
  const theme = getPreferredTheme();
  const icon = document.getElementById('themeIcon');
  const label = document.getElementById('themeLabel');
  if (icon) icon.innerHTML = theme === 'dark' ? Icons.moon : Icons.sun;
  if (label) label.textContent = theme === 'dark' ? 'Modo oscuro' : 'Modo claro';
  applyTheme(theme);
}

export function updateSidebarActive() {
  document.querySelectorAll('.sidebar-item').forEach(el => {
    const href = el.dataset.nav;
    if (href) {
      el.classList.toggle('active', isActive(href));
    }
  });
}
