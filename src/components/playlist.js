import _ from 'lodash';

function Playlist(listPane) {
  let self = this;
  this.list = listPane;
  this.curIndex = 0;
  this.prevIndex = null;
  this.data = null;
  this.clearOnAppend = null;

  listPane.on('select', (item, index) => self.setCurrent(index));
}

Playlist.prototype.setPlaylist = function(tracks) {
  this.data = tracks;
  this.curIndex = 0;
  this.prevIndex = 0;
  this.update();
};

Playlist.prototype.appendPlaylist = function(tracks) {
  if (typeof tracks !== 'object' ||
    (Array.isArray(tracks) && tracks.length === 0)) return;

  if (this.clearOnAppend) {
    this.data = [];
    this.curIndex = 0;
    this.prevIndex = 0;
    this.clearOnAppend = false;
  }

  this.data = this.data.concat(tracks);
  this.update();
};

Playlist.prototype.update = function() {
  //this.removeDuplicates();
  this.list.setItems(_.pluck(this.data, 'trackTitleFull'));
};

Playlist.prototype.push = function(track) {
  this.data.push(track);
  this.list.addItem(track.trackTitleFull);
};

Playlist.prototype.getCurrent = function() {
  return this.data[this.curIndex % this.data.length];
};

Playlist.prototype.setCurrent = function(index) {
  this.prevIndex = this.curIndex;
  this.curIndex = index;
};

Playlist.prototype.moveNext = function() {
  this.setCurrent((this.curIndex + 1) % this.data.length);
  this.list.select(this.curIndex);
};

Playlist.prototype.removeDuplicates = function() {
  let out = {}, arr = [];
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
