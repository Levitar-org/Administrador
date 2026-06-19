import { DB } from './db.js';
import { Utils } from './utils.js';

export function seedDemoData() {
  if (DB.count('clients') > 0) return;

  // ─── CLIENTE 1: Vice Burger ───
  const client1 = DB.create('clients', {
    archived: false,
    name: 'Vice Burger',
    industry: 'Hamburguesería Premium',
    instagram: '@viceburger.sf',
    website: 'https://viceburger.com',
    description: 'Hamburguesas smash con identidad urbana y estética nocturna.',
    positioning: 'Hamburguesas premium con identidad urbana y estética nocturna.',
    tone: 'atrevido, moderno, divertido, urbano',
    allowedWords: ['smash', 'vice', 'night', 'burger', 'crispy'],
    bannedWords: ['barato', 'económico', 'oferta'],
    mainObjective: 'Incrementar ventas y reconocimiento local.',
    services: ['Redes Sociales', 'Branding', 'Diseño', 'Marketing', 'Publicidad']
  });

  // Proyecto 1: Lanzamiento Noche de Burgers
  const proj1 = DB.create('projects', {
    clientId: client1.id,
    workspace: 'client',
    name: 'Noche de Burgers',
    description: 'Campaña de lanzamiento para incrementar ventas de viernes y sábados por la noche.',
    status: 'active',
    archived: false,
    createdAt: Utils.daysAgo(14)
  });

  // Objetivos P1
  const obj1 = DB.create('objectives', { projectId: proj1.id, title: 'Aumentar ventas nocturnas 30%', description: 'Incrementar ticket promedio en horario nocturno', type: 'kpi', status: 'in_progress', targetDate: Utils.daysFromNow(45) });
  const obj2 = DB.create('objectives', { projectId: proj1.id, title: 'Alcanzar 10k seguidores en Instagram', description: 'Crecimiento orgánico con contenido de calidad', type: 'goal', status: 'in_progress', targetDate: Utils.daysFromNow(90) });
  const obj3 = DB.create('objectives', { projectId: proj1.id, title: 'Lanzar 3 combos nocturnos', description: 'Crear y promocionar combos especiales para la noche', type: 'milestone', status: 'pending', targetDate: Utils.daysFromNow(30) });

  // Campañas P1
  const camp1 = DB.create('campaigns', { clientId: client1.id, projectId: proj1.id, archived: false, name: 'Noche de Burgers', objective: 'Incrementar ventas viernes y sábados.', status: 'active', createdAt: Utils.daysAgo(7) });

  // Contenido P1
  const posts1 = [
    { title: 'Nueva Vice Burger', description: 'Doble smash con cheddar cremoso. Tiempo limitado.', type: 'post', status: 'published' },
    { title: 'Martes de Burgers', description: '2x1 en Vice Burgers después de las 8pm.', type: 'post', status: 'published' },
    { title: 'Detrás de escena', description: 'Carne fresca, pan artesanal, música.', type: 'post', status: 'published' },
    { title: 'Combo noche', description: 'Vice Burger + Papas + Cerveza.', type: 'post', status: 'draft' }
  ];
  posts1.forEach((p, i) => DB.create('contents', { clientId: client1.id, projectId: proj1.id, campaignId: camp1.id, ...p, createdAt: Utils.daysAgo(7 - i) }));

  // Planner P1
  DB.create('planner', { projectId: proj1.id, title: 'Diseñar flyers promocionales', dueDate: Utils.daysFromNow(3), status: 'pending' });
  DB.create('planner', { projectId: proj1.id, title: 'Definir combos nocturnos', dueDate: Utils.daysFromNow(5), status: 'pending' });
  DB.create('planner', { projectId: proj1.id, title: 'Coordinar sesión de fotos', dueDate: Utils.daysFromNow(7), status: 'done' });

  // Tareas P1 (vinculadas a objetivos)
  const tasks1 = [
    { title: 'Diseñar carrusel de promociones', description: '5 slides para Instagram', status: 'done', objectiveId: obj1.id },
    { title: 'Crear historia interactiva', description: 'Encuesta para elegir burger del finde', status: 'in_progress', objectiveId: obj1.id },
    { title: 'Actualizar branding de menú', description: 'Rediseñar cards digitales', status: 'todo', objectiveId: obj2.id },
    { title: 'Diseñar reel de producto', description: 'Proceso de armado Vice Burger', status: 'todo', objectiveId: obj2.id }
  ];
  tasks1.forEach((t, i) => DB.create('tasks', { clientId: client1.id, projectId: proj1.id, campaignId: camp1.id, ...t, createdAt: Utils.daysAgo(6 - i) }));

  // Eventos P1
  const eventTypes = ['publication', 'meeting', 'delivery'];
  ['Publicar carrusel', 'Reunión estrategia semanal', 'Entrega branding menú', 'Publicar reel'].forEach((title, i) => {
    DB.create('events', { clientId: client1.id, projectId: proj1.id, campaignId: i < 2 ? camp1.id : null, title, type: eventTypes[i % 3], date: Utils.daysFromNow(i + 1), description: '' });
  });

  // Reuniones P1
  DB.create('meetings', { clientId: client1.id, projectId: proj1.id, title: 'Planificación campaña invierno', date: Utils.daysAgo(7), notes: 'Agregar combos grupales. Potenciar ventas nocturnas.' });
  DB.create('meetings', { clientId: client1.id, projectId: proj1.id, title: 'Revisión de branding', date: Utils.daysAgo(2), notes: 'Actualizar paleta de colores. Nueva tipografía.' });

  // Notas P1
  DB.create('notes', { projectId: proj1.id, workspace: 'client', title: 'Idea de contenido', content: 'Hacer un reel mostrando el smash en cámara lenta con música urbana de fondo.', tags: ['contenido', 'reel'], pinned: false });
  DB.create('notes', { projectId: proj1.id, workspace: 'client', title: 'Feedback del cliente', content: 'Quiere más foco en la experiencia nocturna. Menos producto, más vibe.', tags: ['feedback'], pinned: true });

  // Archivos P1
  DB.create('files', { projectId: proj1.id, name: 'Logo Vice Burger v2', url: '#', type: 'image', size: '2.4 MB' });
  DB.create('files', { projectId: proj1.id, name: 'Guía de marca', url: '#', type: 'pdf', size: '1.1 MB' });

  // Prompts P1
  DB.create('prompts', { clientId: client1.id, projectId: proj1.id, type: 'copy', title: 'Prompt de copy', content: 'Escribí un post para Instagram promocionando [producto] de [cliente]. Tono: [tono]' });
  DB.create('prompts', { clientId: client1.id, projectId: proj1.id, type: 'branding', title: 'Prompt de branding', content: 'Creá una guía de branding para [cliente]. Rubro: [rubro]. Incluí paleta, tipografía, tono.' });

  // Historial P1
  DB.create('history', { projectId: proj1.id, workspace: 'client', action: 'create', entityType: 'project', entityId: proj1.id, metadata: { name: 'Noche de Burgers' }, createdAt: Utils.daysAgo(14) });
  DB.create('history', { projectId: proj1.id, workspace: 'client', action: 'create', entityType: 'campaign', entityId: camp1.id, metadata: { name: 'Noche de Burgers' }, createdAt: Utils.daysAgo(7) });

  // Proyecto 2: Rediseño Visual (mismo cliente)
  const proj2 = DB.create('projects', {
    clientId: client1.id,
    workspace: 'client',
    name: 'Rediseño Visual',
    description: 'Actualización completa de identidad visual para 2026.',
    status: 'active',
    archived: false,
    createdAt: Utils.daysAgo(5)
  });

  const obj4 = DB.create('objectives', { projectId: proj2.id, title: 'Nueva paleta de colores', description: 'Actualizar colores corporativos', type: 'milestone', status: 'in_progress', targetDate: Utils.daysFromNow(15) });
  const obj5 = DB.create('objectives', { projectId: proj2.id, title: 'Rediseñar menú digital', description: 'Menú interactivo para QR en mesas', type: 'goal', status: 'pending', targetDate: Utils.daysFromNow(30) });
  DB.create('planner', { projectId: proj2.id, title: 'Presentar propuesta de colores', dueDate: Utils.daysFromNow(7), status: 'pending' });
  DB.create('planner', { projectId: proj2.id, title: 'Aprobar nueva tipografía', dueDate: Utils.daysFromNow(10), status: 'pending' });
  DB.create('tasks', { clientId: client1.id, projectId: proj2.id, title: 'Investigación de tendencias', description: 'Analizar tendencias de diseño 2026', status: 'todo', objectiveId: obj4.id });
  DB.create('notes', { projectId: proj2.id, workspace: 'client', title: 'Referencias de diseño', content: 'Mirar casos de Five Guys, Shake Shack para inspiración.', tags: ['design', 'research'], pinned: false });
  DB.create('history', { projectId: proj2.id, workspace: 'client', action: 'create', entityType: 'project', entityId: proj2.id, metadata: { name: 'Rediseño Visual' }, createdAt: Utils.daysAgo(5) });

  // ─── CLIENTE 2: FitLab ───
  const client2 = DB.create('clients', {
    archived: false,
    name: 'FitLab',
    industry: 'Gimnasio & Fitness',
    instagram: '@fitlab.ar',
    website: 'https://fitlab.com.ar',
    description: 'Gimnasio de alto rendimiento con enfoque en entrenamiento funcional.',
    positioning: 'Tu mejor versión empieza en FitLab.',
    tone: 'motivacional, directo, moderno, inclusivo',
    allowedWords: ['entrenamiento', 'rendimiento', 'transformación', 'energía'],
    bannedWords: ['milagro', 'dieta', 'rápido'],
    mainObjective: 'Aumentar membresías y retención de socios.',
    services: ['Redes Sociales', 'Marketing', 'Publicidad', 'Community Management']
  });

  const proj3 = DB.create('projects', {
    clientId: client2.id,
    workspace: 'client',
    name: 'Lanzamiento FitLab Verano',
    description: 'Campaña de verano para captar nuevos socios.',
    status: 'active',
    archived: false,
    createdAt: Utils.daysAgo(10)
  });

  const obj6 = DB.create('objectives', { projectId: proj3.id, title: 'Captar 200 nuevos socios', description: 'Meta de captación para temporada de verano', type: 'kpi', status: 'in_progress', targetDate: Utils.daysFromNow(60) });
  const obj7 = DB.create('objectives', { projectId: proj3.id, title: 'Lanzar programa de referidos', description: 'Programa de referidos para socios existentes', type: 'milestone', status: 'pending', targetDate: Utils.daysFromNow(20) });
  DB.create('campaigns', { clientId: client2.id, projectId: proj3.id, archived: false, name: 'Verano FitLab', objective: 'Captación de socios temporada verano.', status: 'active' });
  DB.create('tasks', { clientId: client2.id, projectId: proj3.id, title: 'Diseñar piezas para redes', description: 'Creatividades para Instagram y Facebook', status: 'in_progress', objectiveId: obj6.id });
  DB.create('tasks', { clientId: client2.id, projectId: proj3.id, title: 'Programar Stories semanales', description: 'Plan de contenido para stories', status: 'todo', objectiveId: obj6.id });
  DB.create('events', { clientId: client2.id, projectId: proj3.id, title: 'Lanzamiento campaña verano', type: 'publication', date: Utils.daysFromNow(3), description: '' });
  DB.create('notes', { projectId: proj3.id, workspace: 'client', title: 'Idea de contenido', content: 'Serie de Reels mostrando transformaciones de socios reales.', tags: ['contenido'], pinned: true });
  DB.create('planner', { projectId: proj3.id, title: 'Producir videos testimoniales', dueDate: Utils.daysFromNow(5), status: 'pending' });
  DB.create('history', { projectId: proj3.id, workspace: 'client', action: 'create', entityType: 'project', entityId: proj3.id, metadata: { name: 'Lanzamiento FitLab Verano' }, createdAt: Utils.daysAgo(10) });

  // ─── CLIENTE 3: Mala Vida ───
  const client3 = DB.create('clients', {
    archived: true,
    name: 'Mala Vida',
    industry: 'Indumentaria Urbana',
    instagram: '@malavida.ok',
    website: '',
    description: 'Marca de ropa urbana con estética rockera y tatuajes.',
    positioning: 'Vestí tu actitud.',
    tone: 'rockero, rebelde, auténtico, joven',
    allowedWords: ['rock', 'urbano', 'auténtico', 'actitud'],
    bannedWords: ['moda', 'tendencia', 'popular'],
    mainObjective: 'Posicionar la marca en el segmento joven.',
    services: ['Redes Sociales', 'Branding']
  });

  const proj4 = DB.create('projects', {
    clientId: client3.id,
    workspace: 'client',
    name: 'Relanzamiento Marca',
    description: 'Relanzamiento con nueva colección y colaboraciones.',
    status: 'paused',
    archived: false,
    createdAt: Utils.daysAgo(30)
  });

  const obj8 = DB.create('objectives', { projectId: proj4.id, title: 'Nueva colección cápsula', description: 'Diseñar y lanzar colección cápsula con artista local', type: 'milestone', status: 'pending', targetDate: Utils.daysFromNow(60) });
  DB.create('tasks', { clientId: client3.id, projectId: proj4.id, title: 'Contactar artistas para colaboración', description: 'Buscar 3 artistas locales para colaboración', status: 'todo', objectiveId: obj8.id });
  DB.create('notes', { projectId: proj4.id, workspace: 'client', title: 'Posibles colaboradores', content: 'Tatuador: Juan Tattoo. Músico: Banda Los Reptiles. Ilustrador: Mica Noir.', tags: ['colaboración'], pinned: false });
  DB.create('history', { projectId: proj4.id, workspace: 'client', action: 'create', entityType: 'project', entityId: proj4.id, metadata: { name: 'Relanzamiento Marca' }, createdAt: Utils.daysAgo(30) });

  // ─── WORKSPACE PERSONAL ───
  const personalProj = DB.create('projects', {
    clientId: null,
    workspace: 'personal',
    name: 'Curso de Diseño UX/UI',
    description: 'Formación en diseño de interfaces y experiencia de usuario.',
    status: 'active',
    archived: false,
    createdAt: Utils.daysAgo(20)
  });

  const pObj1 = DB.create('objectives', { projectId: personalProj.id, title: 'Completar módulo de Figma avanzado', description: 'Terminar curso de Figma con prototipado interactivo', type: 'milestone', status: 'in_progress', targetDate: Utils.daysFromNow(14) });
  const pObj2 = DB.create('objectives', { projectId: personalProj.id, title: 'Diseñar 3 interfaces completas', description: 'Portfolio de UX: app de música, dashboard, e-commerce', type: 'goal', status: 'pending', targetDate: Utils.daysFromNow(60) });

  const personalTasks = [
    { title: 'Ver módulo 5: Componentes avanzados', description: 'Figma: auto layout, variantes, props', status: 'done', objectiveId: pObj1.id },
    { title: 'Hacer ejercicio de prototipado', description: 'Prototipar flujo de checkout', status: 'in_progress', objectiveId: pObj1.id },
    { title: 'Leer artículo sobre Design Systems', description: 'Artículo de NNG sobre sistemas de diseño', status: 'todo', objectiveId: pObj1.id }
  ];
  personalTasks.forEach((t, i) => DB.create('tasks', { clientId: null, projectId: personalProj.id, ...t, createdAt: Utils.daysAgo(5 - i) }));

  DB.create('planner', { projectId: personalProj.id, title: 'Entregar ejercicio de prototipado', dueDate: Utils.daysFromNow(3), status: 'pending' });
  DB.create('planner', { projectId: personalProj.id, title: 'Preparar portfolio', dueDate: Utils.daysFromNow(30), status: 'pending' });

  DB.create('notes', { projectId: personalProj.id, workspace: 'personal', title: 'Recursos útiles', content: 'Reflex - design tokens. Storybook - documentación. Zeroheight - design system manager.', tags: ['recursos', 'aprendizaje'], pinned: true });
  DB.create('notes', { projectId: personalProj.id, workspace: 'personal', title: 'Idea de proyecto personal', content: 'Crear una app de seguimiento de hábitos con diseño minimalista.', tags: ['ideas'], pinned: false });
  DB.create('notes', { projectId: personalProj.id, workspace: 'personal', title: 'Apuntes módulo 4', content: 'Grid systems: column grids, modular grids, hierarchical grids. Margins y gutters.', tags: ['apuntes'], pinned: false });

  DB.create('files', { projectId: personalProj.id, name: 'Guía de Figma shortcuts', url: '#', type: 'pdf', size: '0.5 MB' });
  DB.create('files', { projectId: personalProj.id, name: 'Template Design System', url: '#', type: 'link', size: '-' });

  DB.create('history', { projectId: personalProj.id, workspace: 'personal', action: 'create', entityType: 'project', entityId: personalProj.id, metadata: { name: 'Curso de Diseño UX/UI' }, createdAt: Utils.daysAgo(20) });
  DB.create('history', { projectId: personalProj.id, workspace: 'personal', action: 'complete', entityType: 'task', entityId: '', metadata: { title: 'Ver módulo 5' }, createdAt: Utils.daysAgo(1) });

  // Proyecto personal 2
  const personalProj2 = DB.create('projects', {
    clientId: null,
    workspace: 'personal',
    name: 'Ideas de Negocio',
    description: 'Banco de ideas y proyectos personales.',
    status: 'active',
    archived: false,
    createdAt: Utils.daysAgo(60)
  });

  DB.create('notes', { projectId: personalProj2.id, workspace: 'personal', title: 'Saas de productividad', content: 'App tipo Notion pero más minimalista y rápida. Enfoque en captura rápida y modo offline.', tags: ['ideas', 'negocio'], pinned: true });
  DB.create('notes', { projectId: personalProj2.id, workspace: 'personal', title: 'Marketplace de diseñadores', content: 'Plataforma que conecta diseñadores freelance con startups que necesitan designs rápidos.', tags: ['ideas'], pinned: false });
  DB.create('notes', { projectId: personalProj2.id, workspace: 'personal', title: 'Contenido para redes', content: 'Canal de YouTube sobre diseño UX/UI y productividad para diseñadores.', tags: ['ideas', 'contenido'], pinned: false });

  const pObj3 = DB.create('objectives', { projectId: personalProj2.id, title: 'Validar idea #1 con MVP', description: 'Crear landing page y medir interés', type: 'goal', status: 'pending', targetDate: Utils.daysFromNow(90) });

  DB.create('tasks', { clientId: null, projectId: personalProj2.id, title: 'Research de competencia', description: 'Analizar 5 competidores directos', status: 'in_progress', objectiveId: pObj3.id });
  DB.create('tasks', { clientId: null, projectId: personalProj2.id, title: 'Definir propuesta de valor', description: 'Write UVP para cada idea', status: 'todo', objectiveId: pObj3.id });
}
