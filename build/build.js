
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("code42day-el/index.js", Function("exports, require, module",
"module.exports = el;\n\
\n\
// see: http://www.w3.org/html/wg/drafts/html/master/single-page.html#void-elements\n\
var voids = [\n\
  'area', 'base', 'br', 'col', 'embed',\n\
  'hr', 'img', 'input', 'keygen', 'link',\n\
  'menuitem', 'meta', 'param', 'source', 'track', 'wbr'\n\
];\n\
\n\
function el(tag, content, attrs) {\n\
  var attrStr, classes, ids, text;\n\
\n\
  if (typeof content !== 'string') {\n\
    attrs = content;\n\
    content = '';\n\
  }\n\
\n\
  tag = tag || '';\n\
  content = content || '';\n\
  attrs = attrs || {};\n\
\n\
  classes = tag.split('.');\n\
  tag = classes.shift() || 'div';\n\
  if (classes.length) {\n\
    classes = classes.join(' ');\n\
    if (attrs['class']) {\n\
      attrs['class'] += ' ' + classes;\n\
    } else {\n\
      attrs['class'] = classes;\n\
    }\n\
  }\n\
  ids = tag.split('#');\n\
  if (ids.length > 1) {\n\
    tag = ids[0] || 'div';\n\
    attrs.id = ids[1];\n\
  }\n\
\n\
  attrStr = Object.keys(attrs).map(function(attr) {\n\
    return attr +  '=\"' + attrs[attr] + '\"';\n\
  }).join(' ');\n\
\n\
\n\
  text = ['<',\n\
    tag,\n\
    attrStr ? ' ' + attrStr :  '',\n\
    '>'\n\
  ];\n\
  if(voids.indexOf(tag) < 0) {\n\
    text = text.concat([\n\
      content,\n\
      '</',\n\
      tag,\n\
      '>'\n\
    ]);\n\
  }\n\
  return text.join('');\n\
}//@ sourceURL=code42day-el/index.js"
));
require.register("component-event/index.js", Function("exports, require, module",
"var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',\n\
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',\n\
    prefix = bind !== 'addEventListener' ? 'on' : '';\n\
\n\
/**\n\
 * Bind `el` event `type` to `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, type, fn, capture){\n\
  el[bind](prefix + type, fn, capture || false);\n\
\n\
  return fn;\n\
};\n\
\n\
/**\n\
 * Unbind `el` event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  el[unbind](prefix + type, fn, capture || false);\n\
\n\
  return fn;\n\
};//@ sourceURL=component-event/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `Emitter`.\n\
 */\n\
\n\
module.exports = Emitter;\n\
\n\
/**\n\
 * Initialize a new `Emitter`.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Emitter(obj) {\n\
  if (obj) return mixin(obj);\n\
};\n\
\n\
/**\n\
 * Mixin the emitter properties.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function mixin(obj) {\n\
  for (var key in Emitter.prototype) {\n\
    obj[key] = Emitter.prototype[key];\n\
  }\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Listen on the given `event` with `fn`.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.on =\n\
Emitter.prototype.addEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
  (this._callbacks[event] = this._callbacks[event] || [])\n\
    .push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Adds an `event` listener that will be invoked a single\n\
 * time then automatically removed.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.once = function(event, fn){\n\
  var self = this;\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  function on() {\n\
    self.off(event, on);\n\
    fn.apply(this, arguments);\n\
  }\n\
\n\
  on.fn = fn;\n\
  this.on(event, on);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove the given callback for `event` or all\n\
 * registered callbacks.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.off =\n\
Emitter.prototype.removeListener =\n\
Emitter.prototype.removeAllListeners =\n\
Emitter.prototype.removeEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  // all\n\
  if (0 == arguments.length) {\n\
    this._callbacks = {};\n\
    return this;\n\
  }\n\
\n\
  // specific event\n\
  var callbacks = this._callbacks[event];\n\
  if (!callbacks) return this;\n\
\n\
  // remove all handlers\n\
  if (1 == arguments.length) {\n\
    delete this._callbacks[event];\n\
    return this;\n\
  }\n\
\n\
  // remove specific handler\n\
  var cb;\n\
  for (var i = 0; i < callbacks.length; i++) {\n\
    cb = callbacks[i];\n\
    if (cb === fn || cb.fn === fn) {\n\
      callbacks.splice(i, 1);\n\
      break;\n\
    }\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Emit `event` with the given args.\n\
 *\n\
 * @param {String} event\n\
 * @param {Mixed} ...\n\
 * @return {Emitter}\n\
 */\n\
\n\
Emitter.prototype.emit = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  var args = [].slice.call(arguments, 1)\n\
    , callbacks = this._callbacks[event];\n\
\n\
  if (callbacks) {\n\
    callbacks = callbacks.slice(0);\n\
    for (var i = 0, len = callbacks.length; i < len; ++i) {\n\
      callbacks[i].apply(this, args);\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return array of callbacks for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.listeners = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  return this._callbacks[event] || [];\n\
};\n\
\n\
/**\n\
 * Check if this emitter has `event` handlers.\n\
 *\n\
 * @param {String} event\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.hasListeners = function(event){\n\
  return !! this.listeners(event).length;\n\
};\n\
//@ sourceURL=component-emitter/index.js"
));
require.register("pager/index.js", Function("exports, require, module",
"var Emitter = require('emitter');\n\
var events = require('event');\n\
var el = require('el');\n\
\n\
module.exports = Pager;\n\
\n\
function Pager(el) {\n\
  if (!(this instanceof Pager)) {\n\
    return new Pager(el);\n\
  }\n\
  this._total = 0;\n\
  this._current = 0;\n\
  this.el = el;\n\
  events.bind(el, 'click', this.onclick.bind(this));\n\
}\n\
\n\
Emitter(Pager.prototype);\n\
\n\
\n\
Pager.prototype.total = function total(t) {\n\
  this._total = t;\n\
  return this;\n\
};\n\
\n\
Pager.prototype.onclick = function onclick(e) {\n\
  var page, target = e.target || e.srcElement;\n\
  page = Array.prototype.indexOf.call(this.el.children, target);\n\
  if (page < 0) {\n\
    return;\n\
  }\n\
  e.preventDefault();\n\
  e.stopPropagation();\n\
  this.select(page);\n\
};\n\
\n\
Pager.prototype.select = function select(page, opts) {\n\
  var silent = opts && opts.silent;\n\
  if (page === this._current) {\n\
    return;\n\
  }\n\
  Array.prototype.forEach.call(this.el.children, function(a, i) {\n\
    a.className = (i == page) ? 'active' : 'inactive';\n\
  });\n\
  this._current = page;\n\
  if (!silent) {\n\
    this.emit('show', this._current);\n\
  }\n\
  return this;\n\
};\n\
\n\
Pager.prototype.render = function render() {\n\
  var i, html = [];\n\
  for(i = 0; i < this._total; i++) {\n\
    html.push(i !== this._current ? 'a.inactive' : 'a.active');\n\
  }\n\
  this.el.innerHTML = html.map(function(item) {\n\
    return el(item);\n\
  }).join('');\n\
  return this;\n\
};\n\
\n\
\n\
\n\
\n\
\n\
\n\
\n\
\n\
//@ sourceURL=pager/index.js"
));



require.alias("code42day-el/index.js", "pager/deps/el/index.js");
require.alias("code42day-el/index.js", "pager/deps/el/index.js");
require.alias("code42day-el/index.js", "el/index.js");
require.alias("code42day-el/index.js", "code42day-el/index.js");
require.alias("component-event/index.js", "pager/deps/event/index.js");
require.alias("component-event/index.js", "event/index.js");

require.alias("component-emitter/index.js", "pager/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");

require.alias("pager/index.js", "pager/index.js");