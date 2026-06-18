import { DB } from './db.js';
import { Utils } from './utils.js';

export function seedDemoData() {
  if (DB.count('clients') > 0) return;

  const client = DB.create('clients', {
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

  // Adjust client createdAt to be older
  const savedClient = DB.update('clients', client.id, {
    createdAt: Utils.daysAgo(14)
  });

  // Campaign
  const campaign = DB.create('campaigns', {
    archived: false,
    clientId: client.id,
    name: 'Noche de Burgers',
    objective: 'Incrementar ventas viernes y sábados.',
    status: 'active',
    createdAt: Utils.daysAgo(7)
  });

  // 5 Posts
  const posts = [
    { title: 'Nueva Vice Burger', description: 'Presentamos nuestra nueva hamburguesa con doble smash y cheddar cremoso. Disponible solo por tiempo limitado.', type: 'post', status: 'published' },
    { title: 'Martes de Burgers', description: 'Todos los martes: 2x1 en Vice Burgers después de las 8pm. La noche es joven.', type: 'post', status: 'published' },
    { title: 'Detrás de escena', description: 'Así preparamos nuestras burgers. Carne fresca, pan artesanal, y la mejor música.', type: 'post', status: 'published' },
    { title: 'Combo noche', description: 'Vice Burger + Papas + Cerveza. El combo definitivo para la noche.', type: 'post', status: 'draft' },
    { title: 'Colaboración', description: 'Pronto: colaboración con artistas locales. Stay tuned.', type: 'post', status: 'draft' }
  ];

  posts.forEach((p, i) => {
    DB.create('contents', {
      clientId: client.id,
      campaignId: campaign.id,
      ...p,
      createdAt: Utils.daysAgo(7 - i)
    });
  });

  // 3 Stories
  const stories = [
    { title: 'Staff Picks', description: 'Nuestro staff recomienda sus burgers favoritas. ¿Cuál es la tuya?', type: 'story', status: 'published' },
    { title: 'Detrás del mostrador', description: 'Mirá cómo armamos la Vice Burger perfecta. Spoiler: mucho queso.', type: 'story', status: 'published' },
    { title: 'Happy Hour', description: 'Happy hour todos los días de 6 a 8pm. 2x1 en pintas.', type: 'story', status: 'draft' }
  ];

  stories.forEach((s, i) => {
    DB.create('contents', {
      clientId: client.id,
      campaignId: campaign.id,
      ...s,
      createdAt: Utils.daysAgo(4 - i)
    });
  });

  // 2 Reels
  const reels = [
    { title: 'Smash Moment', description: 'El momento exacto del smash. La clave de una Vice Burger perfecta. #Smash #ViceBurger', type: 'reel', status: 'published' },
    { title: 'Night Vibe', description: 'La vibra de Vice Burger de noche. Luces, música, hamburguesas.', type: 'reel', status: 'draft' }
  ];

  reels.forEach((r, i) => {
    DB.create('contents', {
      clientId: client.id,
      campaignId: campaign.id,
      ...r,
      createdAt: Utils.daysAgo(3 - i)
    });
  });

  // Tasks
  const tasks = [
    { title: 'Diseñar carrusel de promociones', description: 'Crear carrusel de 5 slides con promociones semanales para Instagram.', status: 'done' },
    { title: 'Crear historia para fin de semana', description: 'Historia interactiva con encuesta para elegir la burger del finde.', status: 'in_progress' },
    { title: 'Actualizar branding de menú', description: 'Rediseñar cards del menú digital con nueva identidad visual.', status: 'todo' },
    { title: 'Diseñar reel de producto', description: 'Reel mostrando el proceso de armado de la Vice Burger clásica.', status: 'todo' }
  ];

  tasks.forEach((t, i) => {
    DB.create('tasks', {
      clientId: client.id,
      campaignId: campaign.id,
      ...t,
      createdAt: Utils.daysAgo(6 - i)
    });
  });

  // Calendar events (spread across next 15 days)
  const eventTypes = ['publication', 'meeting', 'delivery'];
  const eventTitles = [
    'Publicar carrusel de promociones',
    'Reunión de estrategia semanal',
    'Entrega de branding de menú',
    'Publicar reel de producto',
    'Reunión con diseñador gráfico',
    'Entrega de historia interactiva',
    'Publicar post colaboración',
    'Reunión de planificación mensual'
  ];

  eventTitles.forEach((title, i) => {
    DB.create('events', {
      clientId: client.id,
      campaignId: i < 4 ? campaign.id : null,
      title,
      type: eventTypes[i % 3],
      date: Utils.daysFromNow(i + 1),
      description: ''
    });
  });

  // Meeting (7 days ago)
  DB.create('meetings', {
    clientId: client.id,
    title: 'Planificación de campaña invierno',
    date: Utils.daysAgo(7),
    notes: 'Agregar combos grupales.\nPotenciar ventas nocturnas.\nReforzar identidad visual.'
  });

  // Prompts
  const prompts = [
    {
      type: 'copy',
      title: 'Prompt de copy para redes',
      content: 'Escribí un post para Instagram promocionando [producto/servicio] de [cliente].\n\nTono: [tono]\nPalabras clave: [palabras]\nEvitar: [palabras prohibidas]\n\nObjetivo: [objetivo]'
    },
    {
      type: 'branding',
      title: 'Prompt de branding',
      content: 'Creá una guía de branding para [cliente].\n\nRubro: [rubro]\nIdentidad: [posicionamiento]\n\nIncluí:\n- Paleta de colores\n- Tipografía\n- Tono de comunicación\n- Aplicaciones principales'
    },
    {
      type: 'campaign',
      title: 'Prompt de campaña',  
      content: 'Diseñá una campaña para [cliente] con:\n\nNombre de campaña: [nombre]\nObjetivo: [objetivo]\nDuración: [duración]\n\nCanales: Instagram, TikTok, Email\n\nIncluí:\n- 3 ideas de contenido\n- 1 mecánica de interacción\n- CTA principal'
    },
    {
      type: 'reels',
      title: 'Prompt de reels',
      content: 'Generá ideas de reels para [cliente].\n\nRubro: [rubro]\nTono visual: [tono]\n\nCada idea debe incluir:\n- Hook (primeros 3 segundos)\n- Estructura del video\n- Música sugerida\n- CTA final'
    }
  ];

  prompts.forEach(p => {
    DB.create('prompts', {
      clientId: client.id,
      ...p
    });
  });
}
