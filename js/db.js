import { Utils } from './utils.js';

const STORES = [
  'clients', 'projects',
  'campaigns', 'contents', 'tasks', 'events', 'meetings', 'prompts',
  'objectives', 'planner', 'files', 'notes', 'history'
];

const PROFILE_KEY = 'levitar_profile';

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

  create(store, data) {
    const list = this._getStore(store);
    const now = new Date().toISOString();
    const item = {
      ...data,
      id: Utils.generateId(),
      createdAt: now,
      updatedAt: now
    };
    list.push(item);
    this._setStore(store, list);
    this._notify(store, 'create');
    return item;
  },

  getAll(store) {
    return this._getStore(store);
  },

  getById(store, id) {
    return this._getStore(store).find(item => item.id === id) || null;
  },

  where(store, predicate) {
    return this._getStore(store).filter(predicate);
  },

  update(store, id, data) {
    const list = this._getStore(store);
    const idx = list.findIndex(item => item.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
    this._setStore(store, list);
    this._notify(store, 'update');
    return list[idx];
  },

  remove(store, id) {
    const list = this._getStore(store);
    const idx = list.findIndex(item => item.id === id);
    if (idx === -1) return false;
    list.splice(idx, 1);
    this._setStore(store, list);
    this._notify(store, 'delete');
    return true;
  },

  removeWhere(store, predicate) {
    const list = this._getStore(store);
    const remaining = list.filter(item => !predicate(item));
    this._setStore(store, remaining);
    this._notify(store, 'delete');
    return remaining;
  },

  count(store) {
    return this._getStore(store).length;
  },

  search(store, query, fields = ['name', 'title']) {
    const list = this._getStore(store);
    const q = query.toLowerCase();
    return list.filter(item =>
      fields.some(f => item[f] && item[f].toLowerCase().includes(q))
    );
  },

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

  getActiveProjects() {
    return this._getStore('projects').filter(p => !p.archived && p.status !== 'completed');
  },

  getClientProjects(clientId) {
    return this._getStore('projects').filter(p => p.clientId === clientId && !p.archived);
  },

  getPersonalProjects() {
    return this._getStore('projects').filter(p => p.workspace === 'personal' && !p.archived);
  },

  getProjectContents(projectId) {
    const related = {};
    ['campaigns', 'contents', 'tasks', 'events', 'meetings', 'prompts',
     'objectives', 'planner', 'files', 'notes', 'history'].forEach(store => {
      related[store] = this.where(store, item => item.projectId === projectId);
    });
    return related;
  },

  deleteProject(projectId) {
    ['campaigns', 'contents', 'tasks', 'events', 'meetings', 'prompts',
     'objectives', 'planner', 'files', 'notes', 'history'].forEach(store => {
      this.removeWhere(store, item => item.projectId === projectId);
    });
    return this.remove('projects', projectId);
  },

  deleteClient(clientId) {
    const projects = this.where('projects', p => p.clientId === clientId);
    projects.forEach(p => this.deleteProject(p.id));
    return this.remove('clients', clientId);
  },

  createHistoryEntry(action, entityType, entityId, metadata = {}) {
    return this.create('history', {
      projectId: metadata.projectId || null,
      workspace: metadata.workspace || 'client',
      action,
      entityType,
      entityId,
      metadata
    });
  },

  getPersonalItems(store) {
    return this._getStore(store).filter(item => item.workspace === 'personal');
  },

  getTasksByObjective(objectiveId) {
    return this._getStore('tasks').filter(t => t.objectiveId === objectiveId);
  },

  getObjectiveProgress(objectiveId) {
    const tasks = this.getTasksByObjective(objectiveId);
    if (tasks.length === 0) return { done: 0, total: 0, percent: 0 };
    const done = tasks.filter(t => t.status === 'done').length;
    return { done, total: tasks.length, percent: Math.round((done / tasks.length) * 100) };
  },

  completeTask(taskId) {
    const task = this.getById('tasks', taskId);
    if (!task) return null;
    const updated = this.update('tasks', taskId, { status: 'done', completedAt: new Date().toISOString() });
    if (task.objectiveId) {
      const prog = this.getObjectiveProgress(task.objectiveId);
      if (prog.total > 0 && prog.percent === 100) {
        this.update('objectives', task.objectiveId, { status: 'achieved' });
        this.createHistoryEntry('complete', 'objective', task.objectiveId, {
          projectId: task.projectId, workspace: task.workspace || 'client',
          name: (this.getById('objectives', task.objectiveId) || {}).title
        });
      } else if (prog.total > 0) {
        this.update('objectives', task.objectiveId, { status: 'in_progress' });
      }
    }
    return updated;
  },

  uncompleteTask(taskId) {
    return this.update('tasks', taskId, { status: 'todo', completedAt: null });
  },

  getTasksDueToday() {
    const today = new Date().toISOString().split('T')[0];
    return this._getStore('tasks').filter(t => t.dueDate && t.dueDate === today && t.status !== 'done');
  },

  getTasksOverdue() {
    const today = new Date().toISOString().split('T')[0];
    return this._getStore('tasks').filter(t => t.dueDate && t.dueDate < today && t.status !== 'done');
  },

  getTasksUpcoming(days = 7) {
    const today = new Date();
    const future = new Date(today);
    future.setDate(future.getDate() + days);
    const todayStr = today.toISOString().split('T')[0];
    const futureStr = future.toISOString().split('T')[0];
    return this._getStore('tasks').filter(t =>
      t.dueDate && t.dueDate >= todayStr && t.dueDate <= futureStr && t.status !== 'done'
    );
  },

  isReady() {
    return this._ready;
  },

  getProfile() {
    try {
      return JSON.parse(localStorage.getItem(PROFILE_KEY)) || { name: 'Usuario' };
    } catch {
      return { name: 'Usuario' };
    }
  },

  saveProfile(profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }
};
