import { appStore } from './store.js';

class Router {
  constructor() {
    this.routes = [];
  }

  register(pattern, handler) {
    const segments = pattern.replace(/^\/+/, '').split('/').filter(Boolean);
    this.routes.push({ pattern, segments, handler });
  }

  init() {
    window.addEventListener('hashchange', () => this.resolve());
    this.resolve();
  }

  navigate(path) {
    window.location.hash = path;
  }

  getHash() {
    return window.location.hash.replace(/^#\/?/, '').replace(/\/$/, '');
  }

  getCleanHash() {
    return window.location.hash.replace(/^#/, '') || '/';
  }

  resolve() {
    const hash = this.getHash();
    const parts = hash.split('/').filter(Boolean);

    for (const route of this.routes) {
      const match = this._matchRoute(route.segments, parts);
      if (match) {
        appStore.set('currentRoute', this.getCleanHash());
        route.handler(match.params);
        return;
      }
    }

    this.navigate('/');
  }

  _matchRoute(routeSegments, urlParts) {
    if (routeSegments.length !== urlParts.length) return null;

    const params = {};

    for (let i = 0; i < routeSegments.length; i++) {
      const seg = routeSegments[i];
      const part = urlParts[i];

      if (seg.startsWith(':')) {
        params[seg.slice(1)] = part;
      } else if (seg !== part) {
        return null;
      }
    }

    return { params };
  }
}

export const router = new Router();
