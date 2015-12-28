import _ from 'lodash';
import * as player from '../player/player-control';
import errorHandler from '../helpers/error-handler';

function Playlist(listPane) {
  let self = this;
  this.list = listPane;
  this.mpd = player.getMpdClient();
  this.curIndex = 0;
  this.prevIndex = null;
  this.data = null;
  this.clearOnAppend = null;

  listPane.on('select', (item, index) => self.setCurrent(index));
}

Playlist.prototype.setPlaylist = function(tracks) {
  this.reset();
  this.addItems(tracks);
};

Playlist.prototype.appendPlaylist = function(tracks) {
  if (typeof tracks !== 'object' ||
    (Array.isArray(tracks) && tracks.length === 0)) return;

  if (this.clearOnAppend) {
    this.reset();
    this.clearOnAppend = false;
  }

  this.addItems(tracks);
};

Playlist.prototype.reset = function() {
  this.data = [];
  this.curIndex = 0;
  this.prevIndex = 0;
  this.mpd.clear();
  this.list.clearItems();
};

Playlist.prototype.addItems = function(tracks) {
  //this.removeDuplicates();
  for (var i = 0; i < tracks.length; i++) {
    this.list.addItem(tracks[i].trackTitleFull);
    this.mpdAdd(tracks[i]);
  }

  this.data = this.data.concat(tracks);
};

Playlist.prototype.mpdAdd = function(track) {
  this.mpd.addid(track.url, (err, id) => {
    if (err) return player.errHandler(err);

    track.mpdId = id.Id;
    // HACK: this tags don't streamed, so we have to add it manually
    this.mpd.command('addtagid', [id.Id, 'artist', track.artist], errorHandler);
    this.mpd.command('addtagid', [id.Id, 'title', track.title], errorHandler);
  });
};

Playlist.prototype.getCurrent = function() {
  return this.data[this.curIndex % this.data.length];
};

Playlist.prototype.setCurrentById = function(mpdId) {
  let index = null;
  for (var i = 0; i < this.data.length; i++) {
    if (this.data[i].mpdId == mpdId) {
      index = i;
      break;
    }
  }

  if (!index) return Logger.screen.error('Can\'t find track with id', mpdId);

  this.setCurrent(index);
};

Playlist.prototype.setCurrent = function(index) {
  this.prevIndex = this.curIndex;
  this.curIndex = index;

  this.list.setItem(this.prevIndex, this.data[this.prevIndex].trackTitleFull);
  this.list.setItem(this.curIndex,
    '{yellow-fg}' + this.getCurrent().trackTitleFull + '{/yellow-fg}');
  this.list.render();
};

Playlist.prototype.stop = function() {
  this.list.setItem(this.curIndex, this.data[this.prevIndex].trackTitleFull);
  this.list.render();
};

Playlist.prototype.moveNext = function() {
  this.setCurrent((this.curIndex + 1) % this.data.length);
  this.list.select(this.curIndex);
};

Playlist.prototype.removeDuplicates = function() {
  let out = {},
    arr = [];
  for (var i = 0; i < this.data.length; i++) {
    out[this.data[i].trackTitleFull.toLowerCase()] = this.data[i];
  }

  for (var k in out) {
    arr.push(out[k]);
  }

  if (this.data.length - arr.length > 0) {
    Logger.screen.log('> removed ' + (this.data.length - arr.length) + ' duplicate(s)');
  }

  this.data = arr;
};

module.exports = Playlist;

// Playlist.prototype.get = (index) => this.data[index];

//Playlist.prototype.getCurrentItem = () => this.data[this.curIndex % this.data.length];
// getCurrentIndex: () => current,
// getPreviousItem: () => playlist[previous % playlist.length],
// getPreviousIndex: () => previous,

// filter: (pattern) => {
//   if (!pattern || pattern.length === 0) {
//     playlist = originalPlaylist;
//   } else {
//     let s = pattern.toLowerCase();
//     playlist = originalPlaylist.filter((track) => {
//       return track.artist.toLowerCase().indexOf(s) > -1 ||
//         track.title.toLowerCase().indexOf(s) > -1;
//     });
//   }

//   return playlist;
// },

// Playlist.prototype.push = function(track) {
//   this.data.push(track);
//   this.list.addItem(track.trackTitleFull);
// };
