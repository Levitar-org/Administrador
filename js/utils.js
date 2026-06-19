export const Utils = {
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  },

  today() {
    return new Date().toISOString().split('T')[0];
  },

  isToday(dateStr) {
    return new Date(dateStr).toDateString() === new Date().toDateString();
  },

  isThisWeek(dateStr) {
    const now = new Date();
    const d = new Date(dateStr);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    return d >= startOfWeek && d < endOfWeek;
  },

  formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  },

  formatDateShort(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short'
    });
  },

  formatTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  formatDateTime(dateStr) {
    return `${this.formatDate(dateStr)} ${this.formatTime(dateStr)}`;
  },

  getRelativeTime(dateStr) {
    const now = new Date();
    const d = new Date(dateStr);
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'ahora mismo';
    if (diffMin < 60) return `hace ${diffMin} min`;
    if (diffHr < 24) return `hace ${diffHr}h`;
    if (diffDays < 7) return `hace ${diffDays} días`;
    return this.formatDate(dateStr);
  },

  daysFromNow(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString();
  },

  daysAgo(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
  },

  truncate(str, len = 60) {
    if (str.length <= len) return str;
    return str.slice(0, len) + '…';
  },

  pluralize(n, singular, plural) {
    return n === 1 ? singular : (plural || singular + 's');
  },

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  statusLabel(status) {
    const labels = {
      active: 'Activa',
      paused: 'Pausada',
      completed: 'Completada',
      todo: 'Por hacer',
      in_progress: 'En progreso',
      done: 'Completada',
      published: 'Publicado',
      draft: 'Borrador',
      post: 'Publicación',
      story: 'Historia',
      reel: 'Reel'
    };
    return labels[status] || status;
  },

  sanitize(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  debounce(fn, ms = 200) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }
};
