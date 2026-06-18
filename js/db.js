import { Utils } from './utils.js';

const STORES = ['clients', 'campaigns', 'contents', 'tasks', 'events', 'meetings', 'prompts'];

export const DB = {
  _ready: false,

  init() {
    STORES.forEach(store => {
      if (!localStorage.getItem(`levitar_${store}`)) {
        localStorage.setItem(`levitar_${store}`, JSON.stringify([]));
      }
    });
    this._ready = true;
  },

  _getStore(store) {
    try {
      return JSON.parse(localStorage.getItem(`levitar_${store}`)) || [];
    } catch {
      return [];
    }
  },

  _setStore(store, data) {
    localStorage.setItem(`levitar_${store}`, JSON.stringify(data));
  },

  _notify(store, action) {
    const event = new CustomEvent('levitar:change', {
      detail: { store, action }
    });
    document.dispatchEvent(event);
  },

  // CREATE
  create(store, data) {
    const list = this._getStore(store);
    const item = { ...data, id: Utils.generateId(), createdAt: new Date().toISOString() };
    list.push(item);
    this._setStore(store, list);
    this._notify(store, 'create');
    return item;
  },

  // READ ALL
  getAll(store) {
    return this._getStore(store);
  },

  // READ BY ID
  getById(store, id) {
    return this._getStore(store).find(item => item.id === id) || null;
  },

  // READ WHERE
  where(store, predicate) {
    return this._getStore(store).filter(predicate);
  },

  // UPDATE
  update(store, id, data) {
    const list = this._getStore(store);
    const idx = list.findIndex(item => item.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
    this._setStore(store, list);
    this._notify(store, 'update');
    return list[idx];
  },

  // DELETE
  remove(store, id) {
    const list = this._getStore(store);
    const idx = list.findIndex(item => item.id === id);
    if (idx === -1) return false;
    list.splice(idx, 1);
    this._setStore(store, list);
    this._notify(store, 'delete');
    return true;
  },

  // DELETE WHERE (for cascade)
  removeWhere(store, predicate) {
    const list = this._getStore(store);
    const remaining = list.filter(item => !predicate(item));
    this._setStore(store, remaining);
    this._notify(store, 'delete');
    return remaining;
  },

  // COUNT
  count(store) {
    return this._getStore(store).length;
  },

  // SEARCH
  search(store, query, fields = ['name', 'title']) {
    const list = this._getStore(store);
    const q = query.toLowerCase();
    return list.filter(item =>
      fields.some(f => item[f] && item[f].toLowerCase().includes(q))
    );
  },

  // ARCHIVE / RESTORE
  archive(store, id) {
    return this.update(store, id, { archived: true });
  },

  restore(store, id) {
    return this.update(store, id, { archived: false });
  },

  getActive(store) {
    return this._getStore(store).filter(item => !item.archived);
  },

  getArchived(store) {
    return this._getStore(store).filter(item => item.archived);
  },

  // CASCADE DELETE FOR CLIENT
  deleteClient(clientId) {
    ['campaigns', 'contents', 'tasks', 'events', 'meetings', 'prompts'].forEach(store => {
      this.removeWhere(store, item => item.clientId === clientId);
    });
    return this.remove('clients', clientId);
  },

  isReady() {
    return this._ready;
  }
};
