class Store {
  constructor() {
    this._state = {
      currentRoute: null,
      currentClient: null,
      currentProject: null,
      clients: [],
      projects: [],
      theme: localStorage.getItem('levitar_theme') || 'system',
      sidebarOpen: true
    };
  }

  get(key) {
    return this._state[key];
  }

  set(key, value) {
    this._state[key] = value;
    this._emit(key, value);
  }

  _emit(event, data) {
    const e = new CustomEvent(`levitar:state:${event}`, { detail: data });
    document.dispatchEvent(e);
  }

  on(event, callback) {
    document.addEventListener(`levitar:state:${event}`, callback);
  }

  off(event, callback) {
    document.removeEventListener(`levitar:state:${event}`, callback);
  }
}

export const appStore = new Store();
