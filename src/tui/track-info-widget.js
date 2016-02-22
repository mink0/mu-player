import blessed from 'blessed';
import { timeConvert } from '../actions/music-actions';
import * as player from '../player/player-control';

let Node = blessed.Node;
let Box = blessed.Box;
let pTimeout = null;

var pbarOpts = {
  bottom: 0,
  left: 1,
  height: 1,
  width: '100%-14',
  inputOnFocus: true,
  mouse: true,
  pch: '\u25AC', //'░',
  bch: '.',
  style: {
    fg: 'brightblack',
    bar: {
      fg: 'white'
    }
  }
};

var pbarPrefixOpts = {
  bottom: 0,
  left: 0,
  height: 1,
  width: 1,
  content: '[',
};

var pbarSuffixOpts = {
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
  content: '-- --/-- --',
};

var topRightOpts = {
  top: -1,
  right: 1,
  height: 1,
  tags: true,
  width: 'shrink',
  //content: '[{light-black-fg}128kbps{/light-black-fg}]',
};

function TrackInfo(options={}) {
  if (!(this instanceof Node)) return new TrackInfo(options);

  Box.call(this, options);

  this.pbar = blessed.progressbar(pbarOpts);
  this.curTime = blessed.box(curTimeOpts);
  this.topRight = blessed.box(topRightOpts);

  this.append(this.pbar);
  this.append(this.curTime);
  this.append(this.topRight);
  this.append(blessed.box(pbarPrefixOpts));
  this.append(blessed.box(pbarSuffixOpts));

  // mouse click support
  this.pbar.on('click', (data) => {
    this.elapsed = this.pbar.value * 0.01 * this.duration;
    player.seek(this.elapsed);
    this.setProgress();
  });
}

TrackInfo.prototype.init = function(opts) {
  this.duration = opts.duration;
  this.artist = opts.artist;
  this.title = opts.title;
  this.bitrate = opts.bitrate;
  this.elapsed = 0;
  this.status = opts.status;
  this.setProgress(0);

  if (this.duration < 3600) this.curTime.width = 11;
  else this.curTime.width = 14;
  this.pbar.style.width = this.width - this.curTime.width - 2;

  this.updateStatus();

  this.show();
};

TrackInfo.prototype.setProgress = function(elapsed, seek) {
  if (seek) {
    this.elapsed = parseFloat(this.elapsed) + parseFloat(seek);

    // prevent pbar reset on track seek
    if (pTimeout) clearTimeout(pTimeout);
    pTimeout = setTimeout(() => {
      pTimeout = null;
    }, 1000);
  }

  if (elapsed) {
    if (pTimeout !== null) return;
    this.elapsed = parseFloat(elapsed);
  }

  if (this.elapsed < 0) this.elapsed = 0;

  this.curTime.setContent(timeConvert(this.elapsed) + '/' + timeConvert(this.duration));
  this.pbar.setProgress((this.elapsed / this.duration) * 100);
  this.curTime.width = this.curTime.content.length;
  // this.render(); // high cpu load
};

TrackInfo.prototype.updateStatus = function(status) {
  if (status) this.status = status;

  if (this.status === 'play') this.statusText = '{green-fg}Playing{/green-fg}';
  if (this.status === 'stop') this.statusText = '{light-red-fg}Stopped{/right-red-fg}';
  if (this.status === 'pause') this.statusText = '{cyan-fg}Paused{/cyan-fg}';

  this.updateLabel();
  if (this.hidden) this.show();

  this.topRight.setContent(
    `{light-black-fg}[{/light-black-fg}${this.bitrate}kbps{light-black-fg}]{/light-black-fg}`
  );
};

TrackInfo.prototype.updateLabel = function() {
  let label = '[' + this.statusText + '] {light-yellow-fg}' +
    this.artist.trim()+ ' - ' + this.title.trim();

  let notags = label.replace(/\{(?:.|\n)*?\}/gm, '');

  if (notags.length > this.width - 15)
    label = label.substring(0, this.width + (label.length - notags.length) - 15) + '~';

  this.setLabel(label);
};

TrackInfo.prototype.stop = function() {
  this.status = 'stop';
  this.hide();
};

TrackInfo.prototype.__proto__ = Box.prototype;

TrackInfo.prototype.type = 'pbar';

module.exports = TrackInfo;
