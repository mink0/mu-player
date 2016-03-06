/**
 * Modules
 */

var blessed = require('blessed'),
  Node = blessed.Node,
  Textbox = blessed.Textbox;

/**
 * Autocomplete
 */

function Autocomplete(options) {
  if (!(this instanceof Node)) {
    return new Autocomplete(options);
  }

  options = options || {};

  options.scrollable = false;

  Textbox.call(this, options);

  this.source = options.source;
  this.delay = options.delay || 500;
  this.ts = 0;
  this.sourceTimer = null;
  this.maxresults = options.maxresults || 7;
  this.placement = 'top';

  this.on('blur', function() {
    if (this.cmbox) {
      this.cmbox.destroy();
      this.cmbox = null;
    }
  });
}

Autocomplete.prototype.__proto__ = Textbox.prototype;

Autocomplete.prototype.type = 'autocomplete';

Autocomplete.prototype.__olistener2 = Autocomplete.prototype._listener;
Autocomplete.prototype._listener = function(ch, key) {
  var self = this;

  if (key.name === 'up') {
    if (self.cmbox) {
      this.cmbox.up(1);
      this.screen.render();
      return;
    }
  } else if (key.name === 'down') {
    if (self.cmbox) {
      this.cmbox.down(1);
      this.screen.render();
      return;
    }
  }

  this.__olistener2(ch, key);

  if (['tab', 'escape', 'left', 'right'].indexOf(key.name) !== -1) return;

  if (this.sourceTimer === null) {
    this.getItems(this.value);
  } else {
    clearTimeout(this.sourceTimer);
    this.sourceTimer = setTimeout(function() {
      self.getItems();
    }, Math.max(this.delay - (Date.now() - this.ts), 100));
  }
};

Autocomplete.prototype.getItems = function(text) {
  var self = this;
  var text = text || this.value;

  this.ts = Date.now();
  this.source(text, function(err, res) {
    clearTimeout(self.sourceTimer);
    self.sourceTimer = setTimeout(function() {
      self.sourceTimer = null;
    }, self.delay);

    if (self.cmbox) {
      self.cmbox.destroy();
      self.cmbox = null;
    }

    if (err || !res || res.length === 0) return;

    if (!self.focused) return;

    if (self.placement === 'top') res = res.reverse();

    self.cmbox = self.drawMenu(res.slice(0, self.maxresults));
    self.cmbox.on('select item', function(val, index) {
      self.value = val.content;
    });

    self.screen.append(self.cmbox);
  });
};

Autocomplete.prototype.drawMenu = function(items) {
  var list = blessed.list({
    height: items.length,
    width: calcLen(),
    // bottom: 1,
    // left: 2,
    left: this.lpos.xi,
    top: this.lpos.yi - items.length,
    tags: true,
    padding: {
      left: 1,
    },
    items: items,
    // input: true,
    // inputOnFocus: true,
    // scrollable: true,
    // keys: true,
    // vi: true,
    // mouse: true,
    scrollbar: {
      ch: ' ',
      inverse: true,
      fg: 'gray'
    },
    style: {
      bg: 'white',
      fg: 'black',
      selected: {
        bg: 'yellow',
        // fg: 'white'
      }
    }
  });

  function calcLen() {
    return items.sort(function (a, b) { return b.length - a.length; })[0].length + 2;
  }

  if (this.placement === 'top') list.selected = items.length - 1;

  return list;
};

/**
 * Expose
 */

module.exports = Autocomplete;
