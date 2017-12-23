var Emitter = require('emitter');
var el = require('el');

module.exports = Pager;

function Pager(el) {
  if (!(this instanceof Pager)) {
    return new Pager(el);
  }
  this._total = 0;
  this._current = 0;
  this.el = el;
  el.addEventListener('click', this.onclick.bind(this));
}

Emitter(Pager.prototype);


Pager.prototype.total = function total(t) {
  this._total = t;
  return this;
};

Pager.prototype.onclick = function onclick(e) {
  var page, target = e.target || e.srcElement;
  page = Array.prototype.indexOf.call(this.el.children, target);
  if (page < 0) {
    return;
  }
  e.preventDefault();
  e.stopPropagation();
  this.select(page);
};

Pager.prototype.select = function select(page, opts) {
  var silent = opts && opts.silent;
  if (page === this._current) {
    return;
  }
  Array.prototype.forEach.call(this.el.children, function(a, i) {
    a.className = (i == page) ? 'active' : 'inactive';
  });
  this._current = page;
  if (!silent) {
    this.emit('show', this._current);
  }
  return this;
};

Pager.prototype.render = function render() {
  var i, html = [];
  for(i = 0; i < this._total; i++) {
    html.push(i !== this._current ? 'a.inactive' : 'a.active');
  }
  this.el.innerHTML = html.map(function(item) {
    return el(item);
  }).join('');
  return this;
};








