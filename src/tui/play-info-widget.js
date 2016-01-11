import blessed from 'blessed';
import { timeConvert } from '../actions/music-actions';

let Node = blessed.Node;
let Box = blessed.Box;

var pbarOpts = {
  bottom: 0,
  left: 1,
  height: 1,
  width: '100%-14',
  inputOnFocus: true,
  pch: '>',
  bch: '.',
  style: {
    fg: 'brightblack',
    bar: {
      fg: 'white'
    }
  }
};

var prefix = {
  bottom: 0,
  left: 0,
  height: 1,
  width: 1,
  content: '[',
};

var suffix = {
  bottom: 0,
  right: 0,
  height: 1,
  width: 1,
  content: ']',
};

var curTimeOpts = {
  bottom: 0,
  right: 1,
  height: 1,
  width: 11,
  align: 'right',
  content: '--/--',
};

function PlayInfo(options={}) {
  if (!(this instanceof Node)) return new PlayInfo(options);

  Box.call(this, options);

  this.pbar = blessed.progressbar(pbarOpts);
  this.curTime = blessed.box(curTimeOpts);

  this.append(this.pbar);
  this.append(this.curTime);
  this.append(blessed.box(prefix));
  this.append(blessed.box(suffix));
}

PlayInfo.prototype.init = function(opts) {
  this.duration = opts.duration;
  this.artist = opts.artist;
  this.title = opts.title;
  this.elapsed = 0;
  this.status = opts.status;
  this.setProgress(0);

  if (this.duration < 3600) this.curTime.width = 11;
  else this.curTime.width = 14;
  this.pbar.style.width = this.width - this.curTime.width - 2;

  this.updateStatus();

  this.show();
};

PlayInfo.prototype.setProgress = function(elapsed, seek) {
  if (elapsed) this.elapsed = parseFloat(elapsed);
  if (seek) this.elapsed = parseFloat(this.elapsed) + parseFloat(seek);

  this.curTime.setContent(timeConvert(this.elapsed) + '/' + timeConvert(this.duration));
  this.pbar.setProgress((this.elapsed / this.duration) * 100);
  this.curTime.width = this.curTime.content.length;
  // this.render(); // high cpu load
};

PlayInfo.prototype.updateStatus = function(status) {
  if (status) this.status = status;

  if (this.status === 'play') this.statusText = '{green-fg}Playing{/green-fg}';
  if (this.status === 'stop') this.statusText = '{light-red-fg}Stopped{/right-red-fg}';
  if (this.status === 'pause') this.statusText = '{cyan-fg}Paused{/cyan-fg}';

  this.updateLabel();
  if (this.hidden) this.show();
};

PlayInfo.prototype.updateLabel = function() {
  this.setLabel('[' + this.statusText + '] {light-yellow-fg}' + this.artist + ' - ' + this.title + '{/light-yellow-fg}');
};

PlayInfo.prototype.__proto__ = Box.prototype;

PlayInfo.prototype.type = 'pbar';

module.exports = PlayInfo;
