var blessed = require('blessed');
var Node = blessed.Node;
var ProgressBar = blessed.ProgressBar;


function Pbar(options) {
  if (!(this instanceof Node)) return new Pbar(options);

  options = options || {};

  ProgressBar.call(this, options);

  this.duration = options.duration || 0;
  this.elapsed = options.elapsed || 0;
  this.progress(0);
}

Pbar.prototype.render = function() {
  var ret = this._render();
  if (!ret) return;

  var xi = ret.xi,
    xl = ret.xl,
    yi = ret.yi,
    yl = ret.yl,
    dattr;

  if (this.border) xi++, yi++, xl--, yl--;

  if (this.orientation === 'horizontal') {
    xl = xi + ((xl - xi) * (this.filled / 100)) | 0;
  } else if (this.orientation === 'vertical') {
    yi = yi + ((yl - yi) - (((yl - yi) * (this.filled / 100)) | 0));
  }

  dattr = this.sattr(this.style.bar);

  this.screen.fillRegion(dattr, this.pch, xi, xl, yi, yl);

  if (this.content) {
    var line = this.screen.lines[yi];
    var startpos = ret.xl - this.content.length - 1;
    for (var i = 0; i < this.content.length; i++) {
      line[startpos + i][1] = this.content[i];
    }
    line.dirty = true;
  }

  this.screen.lines[yi][xi + 0][1] = '[';
  this.screen.lines[yi][ret.xl - 1][1] = ']';

  return ret;
};

Pbar.prototype.progress = function(seconds) {
  var percent = (seconds / this.duration) * 100;

  this.filled += percent;
  this.elapsed += seconds;
  if (this.filled < 0)
    this.filled = 0;
  else if (this.filled > 100)
    this.filled = 100;

  if (this.filled === 100) this.emit('complete');

  this.value = this.filled;
  this.content = timeConvert(this.elapsed) + '/' + timeConvert(this.duration);
};

Pbar.prototype.setProgress = function(seconds) {
  this.filled = 0;
  this.elapsed = 0;
  this.progress(seconds);
};

function timeConvert(_seconds) {
  var sec_num = parseInt(_seconds, 10); // don't forget the second param
  var hours   = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  var seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (hours   < 10) {hours   = "0"+hours;}
  if (minutes < 10) {minutes = "0"+minutes;}
  if (seconds < 10) {seconds = "0"+seconds;}

  var time = hours === "00" ? minutes+':'+seconds : hours+':'+minutes+':'+seconds;
  return time;
}

Pbar.prototype.__proto__ = ProgressBar.prototype;

Pbar.prototype.type = 'pbar';

module.exports = Pbar;
