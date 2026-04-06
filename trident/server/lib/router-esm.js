// express-router-esm.js
// Clean ESM version of Express Router (no TypeScript)

// --- Safe minimal stubs for Route and Layer (replace missing imports) ---
class Route {
  constructor(path) {
    this.path = path;
    this.stack = [];
    this.methods = {};
  }
  _handles_method(method) {
    return this.methods[method.toLowerCase()] || false;
  }
  _options() {
    return Object.keys(this.methods).map(m => m.toUpperCase());
  }
  dispatch(req, res, next) {
    // Minimal stub: call all handlers in stack
    let idx = 0;
    const nextHandler = (err) => {
      if (err) return next(err);
      if (idx >= this.stack.length) return next();
      const handler = this.stack[idx++];
      handler(req, res, nextHandler);
    };
    nextHandler();
  }
  all(...handlers) {
    handlers.forEach(h => this.stack.push(h));
    this.methods['all'] = true;
    return this;
  }
}

class Layer {
  constructor(path, opts, fn) {
    this.path = path;
    this.handle = fn;
    this.name = fn.name || '<anonymous>';
    this.route = undefined;
    this.params = {};
    this.keys = [];
    this.opts = opts || {};
  }
  match(path) {
    // Simple path match: exact or prefix
    if (this.opts.end === false) {
      return path.startsWith(this.path);
    }
    return path === this.path;
  }
  handle_request(req, res, next) {
    if (this.route) {
      this.route.dispatch(req, res, next);
    } else {
      this.handle(req, res, next);
    }
  }
  handle_error(err, req, res, next) {
    if (this.handle.length === 4) {
      this.handle(err, req, res, next);
    } else {
      next(err);
    }
  }
}
import methods from 'methods';
import mixin from 'utils-merge';
import debugFn from 'debug';
import deprecateFn from 'depd';
import flatten from 'array-flatten';
import parseUrl from 'parseurl';
import setPrototypeOf from 'setprototypeof'; // <-- FIXED missing semicolon

const debug = debugFn('express:router');
const deprecate = deprecateFn('express');

const objectRegExp = /^\[object (\S+)\]$/;
const slice = Array.prototype.slice;
const toString = Object.prototype.toString;

/* -------------------------------------------------------
   Utility helpers
------------------------------------------------------- */

function appendMethods(list, addition) {
  for (let i = 0; i < addition.length; i++) {
    const method = addition[i];
    if (!list.includes(method)) list.push(method);
  }
}

function getPathname(req) {
  try {
    return parseUrl(req).pathname;
  } catch {
    return undefined;
  }
}

function getProtohost(url) {
  if (typeof url !== 'string' || url.length === 0 || url[0] === '/') return undefined;

  const searchIndex = url.indexOf('?');
  const pathLength = searchIndex !== -1 ? searchIndex : url.length;
  const fqdnIndex = url.slice(0, pathLength).indexOf('://');

  return fqdnIndex !== -1
    ? url.substring(0, url.indexOf('/', 3 + fqdnIndex))
    : undefined;
}

function gettype(obj) {
  const type = typeof obj;
  if (type !== 'object') return type;
  return toString.call(obj).replace(objectRegExp, '$1');
}

/* -------------------------------------------------------
   Path sanitizer (safe, no double decode)
------------------------------------------------------- */

function sanitizePath(path) {
  if (typeof path !== 'string') return '';

  // Avoid double-decoding attacks
  let decoded = path;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    // leave as-is if decode fails
  }

  return decoded
    .replace(/[^\w\-\.~\/]/g, '')
    .replace(/\/+/g, '/');
}

function matchLayer(layer, path) {
  try {
    if (!layer || typeof layer.match !== 'function') {
      throw new Error('Invalid layer: missing match()');
    }
    const safePath = sanitizePath(path);
    const result = layer.match(safePath);
    if (typeof result !== 'boolean') {
      throw new Error('Layer.match() must return boolean');
    }
    return result;
  } catch (err) {
    // Return false for non-matching or error, but log for debug
    if (typeof debug === 'function') debug('matchLayer error: %o', err);
    return false;
  }
}

/* -------------------------------------------------------
   Restore / wrap helpers
------------------------------------------------------- */

function restore(fn, obj, ...props) {
  const vals = props.map(prop => obj[prop]);
  return function restoreFn(err) {
    for (let i = 0; i < props.length; i++) {
      obj[props[i]] = vals[i];
    }
    return fn(err);
  };
}

function wrap(old, fn) {
  return function newFn(err) {
    return fn(old, err);
  };
}

function sendOptionsResponse(res, options, next) {
  try {
    res.setHeader('Allow', options.join(', '));
    res.end();
  } catch (err) {
    next(err);
  }
}

function mergeParams(params, parent) {
  if (!parent) return params;
  const obj = mixin({}, parent);
  if (params) mixin(obj, params);
  return obj;
}

/* -------------------------------------------------------
   Router factory
------------------------------------------------------- */

export default function createRouter(options = {}) {
  function router(req, res, next) {
    router.handle(req, res, next);
  }

  setPrototypeOf(router, proto);

  router.params = {};
  router._params = [];
  router.caseSensitive = options.caseSensitive;
  router.mergeParams = options.mergeParams;
  router.strict = options.strict;
  router.stack = [];

  return router;
}

/* -------------------------------------------------------
   Router prototype
------------------------------------------------------- */

const proto = {};

/* ---------------- param() ---------------- */

proto.param = function param(name, fn) {
  if (typeof name === 'function') {
    deprecate('router.param(fn): Refactor to use path params');
    this._params.push(name);
    return;
  }

  const params = this._params;
  let ret;

  if (name[0] === ':') {
    deprecate(`router.param("${name}", fn): Use router.param("${name.slice(1)}", fn) instead`);
    name = name.slice(1);
  }

  for (let i = 0; i < params.length; ++i) {
    if ((ret = params[i](name, fn))) {
      fn = ret;
    }
  }

  if (typeof fn !== 'function') {
    throw new Error(`invalid param() call for ${name}, got ${fn}`);
  }

  (this.params[name] = this.params[name] || []).push(fn);
  return this;
};

/* ---------------- handle() ---------------- */

proto.handle = function handle(req, res, out) {
  const self = this;

  debug('dispatching %s %s', req.method, req.url);

  let idx = 0;
  const protohost = getProtohost(req.url) || '';
  let removed = '';
  let slashAdded = false;
  let sync = 0;
  const paramcalled = {};
  const options = [];
  const stack = self.stack;

  const parentParams = req.params;
  const parentUrl = req.baseUrl || '';

  let done = restore(out, req, 'baseUrl', 'next', 'params');

  req.next = next;
  req.baseUrl = parentUrl;
  req.originalUrl = req.originalUrl || req.url;

  if (req.method === 'OPTIONS') {
    done = wrap(done, function (old, err) {
      if (err || options.length === 0) return old(err);
      sendOptionsResponse(res, options, old);
    });
  }

  next();

  function next(err) {
    let layerError = err === 'route' ? null : err;

    if (slashAdded) {
      req.url = req.url.slice(1);
      slashAdded = false;
    }

    if (removed.length !== 0) {
      req.baseUrl = parentUrl;
      req.url = protohost + removed + req.url.slice(protohost.length);
      removed = '';
    }

    if (layerError === 'router') {
      setImmediate(done, null);
      return;
    }

    if (idx >= stack.length) {
      setImmediate(done, layerError);
      return;
    }

    if (++sync > 100) {
      return setImmediate(next, err);
    }

    const path = getPathname(req);
    if (path == null) return done(layerError);

    let layer, match, route;

    while (match !== true && idx < stack.length) {
      layer = stack[idx++];
      match = matchLayer(layer, path);
      route = layer.route;

      if (typeof match !== 'boolean') {
        layerError = layerError || match;
      }

      if (match !== true) continue;
      if (!route) continue;

      if (layerError) {
        match = false;
        continue;
      }

      const method = req.method;
      const has_method = route._handles_method(method);

      if (!has_method && method === 'OPTIONS') {
        appendMethods(options, route._options());
      }

      if (!has_method && method !== 'HEAD') {
        match = false;
      }
    }

    if (match !== true) return done(layerError);

    if (route) req.route = route;

    req.params = self.mergeParams
      ? mergeParams(layer.params, parentParams)
      : layer.params;

    const layerPath = layer.path;

    self.process_params(layer, paramcalled, req, res, function (err) {
      if (err) {
        next(layerError || err);
      } else if (route) {
        layer.handle_request(req, res, next);
      } else {
        trim_prefix(layer, layerError, layerPath, path);
      }
      sync = 0;
    });
  }

  function trim_prefix(layer, layerError, layerPath, path) {
    if (layerPath.length !== 0) {
      if (layerPath !== path.slice(0, layerPath.length)) {
        next(layerError);
        return;
      }

      const c = path[layerPath.length];
      if (c && c !== '/' && c !== '.') return next(layerError);

      removed = layerPath;
      req.url = protohost + req.url.slice(protohost.length + removed.length);

      if (!protohost && req.url[0] !== '/') {
        req.url = '/' + req.url;
        slashAdded = true;
      }

      req.baseUrl = parentUrl + (removed.endsWith('/') ? removed.slice(0, -1) : removed);
    }

    debug('%s %s : %s', layer.name, layerPath, req.originalUrl);

    if (layerError) {
      layer.handle_error(layerError, req, res, next);
    } else {
      layer.handle_request(req, res, next);
    }
  }
};

/* ---------------- process_params() ---------------- */

proto.process_params = function process_params(layer, called, req, res, done) {
  const params = this.params;
  const keys = layer.keys;

  if (!keys || keys.length === 0) return done();

  let i = 0;
  let paramIndex = 0;
  let key, name, paramVal, paramCallbacks, paramCalled;

  function param(err) {
    if (err) return done(err);
    if (i >= keys.length) return done();

    paramIndex = 0;
    key = keys[i++];
    name = key.name;
    paramVal = req.params[name];
    paramCallbacks = params[name];
    paramCalled = called[name];

    if (paramVal === undefined || !paramCallbacks) return param();

    if (
      paramCalled &&
      (paramCalled.match === paramVal ||
        (paramCalled.error && paramCalled.error !== 'route'))
    ) {
      req.params[name] = paramCalled.value;
      return param(paramCalled.error);
    }

    called[name] = paramCalled = {
      error: null,
      match: paramVal,
      value: paramVal
    };

    paramCallback();
  }

  function paramCallback(err) {
    const fn = paramCallbacks[paramIndex++];
    paramCalled.value = req.params[key.name];

    if (err) {
      paramCalled.error = err;
      return param(err);
    }

    if (!fn) return param();

    try {
      fn(req, res, paramCallback, paramVal, key.name);
    } catch (e) {
      paramCallback(e);
    }
  }

  param();
};

/* ---------------- use() ---------------- */

proto.use = function use(path, ...callbacks) {
  let offset = 0;

  if (typeof path === 'function') {
    callbacks.unshift(path);
    path = '/';
  } else if (Array.isArray(path)) {
    path = path[0] || '/';
  } else if (typeof path !== 'string') {
    throw new TypeError('Router.use() path must be a string or function');
  }

  const fns = flatten(callbacks);

  if (fns.length === 0) {
    throw new TypeError('Router.use() requires a middleware function');
  }

  for (let fn of fns) {
    if (typeof fn !== 'function') {
      throw new TypeError('Router.use() requires a middleware function but got ' + gettype(fn));
    }

    debug('use %o %s', path, fn.name || '<anonymous>');

    const layer = new Layer(
      path,
      { sensitive: this.caseSensitive, strict: false, end: false },
      fn
    );

    layer.route = undefined;
    this.stack.push(layer);
  }

  return this;
};

/* ---------------- route() ---------------- */

proto.route = function route(path) {
  const route = new Route(path);

  const layer = new Layer(
    path,
    { sensitive: this.caseSensitive, strict: this.strict, end: true },
    route.dispatch.bind(route)
  );

  layer.route = route;
  this.stack.push(layer);

  return route;
};

/* ---------------- HTTP methods ---------------- */

[...methods, 'all'].forEach(function (method) {
  proto[method] = function (path, ...handlers) {
    const route = this.route(path);
    route[method](...handlers);
    return this;
  };
});
