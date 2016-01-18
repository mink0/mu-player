import _ from 'lodash';
import * as player from '../player/player-control';
import errorHandler from '../helpers/error-handler';

function Playlist(plistPane, countPane) {
  let self = this;
  this.list = plistPane;
  this.mpd = player.getMpdClient();
  this.curIndex = 0;
  this.prevIndex = null;
  this.data = null;
  this.clearOnAppend = null;
  this.counter = countPane;

  this.list.on('select', (item, index) => self.setCurrent(index));
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
  this.counter.hide();
};

Playlist.prototype.addItems = function(tracks) {
  //this.removeDuplicates();
  for (var i = 0; i < tracks.length; i++) {
    this.list.addItem(tracks[i].trackTitleFull);
    this.mpdAdd(tracks[i]);
  }

  this.data = this.data.concat(tracks);
  this.updateCounter();
};

Playlist.prototype.updateCounter = function() {
  this.counter.setContent(`{bright-black-fg}${this.curIndex + 1}/${this.data.length}`);
  if (this.counter.hidden) this.counter.show();
};

Playlist.prototype.mpdAdd = function(track) {
  this.mpd.addid(track.url, (err, id) => {
    if (err) return errorHandler(err);

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

  if (index !== null) this.setCurrent(index);

  return index;
};

Playlist.prototype.setCurrent = function(index) {
  this.prevIndex = this.curIndex;
  this.curIndex = index;

  this.list.setItem(this.prevIndex, this.data[this.prevIndex].trackTitleFull);
  this.list.setItem(this.curIndex,
    '{yellow-fg}' + this.getCurrent().trackTitleFull + '{/yellow-fg}');
  this.updateCounter();
  this.list.render();
};

Playlist.prototype.stop = function() {
  if (this.data === null) return;

  this.list.setItem(this.curIndex, this.data[this.prevIndex].trackTitleFull);
  this.list.render();
};

Playlist.prototype.moveNext = function() {
  this.setCurrent((this.curIndex + 1) % this.data.length);
  this.list.select(this.curIndex);
};

Playlist.prototype.sort = function(query) {
  let vkTracks = [];
  let scTracks = [];

  let WEIGHTS = {
    vk: 10,
    artistExact: 10,
    trackExact: 8,
    artistContains: 6,
    trackContains: 4,
    bitrate: 10,
    pos: 10
  };

  let calcWeight = (track) => {
    if (track.bitrate) track.weight += (track.bitrate / 320) * WEIGHTS.bitrate;
    
    if (track.artist) {
      if (track.artist.trim().toLowerCase() === query.trim().toLowerCase())
        track.weight += WEIGHTS.artistExact;

      if (track.artist.trim().toLowerCase().indexOf(query.trim().toLowerCase()) !== -1)
        track.weight += WEIGHTS.artistContains;
    }

  };

  // to calculate order weight
  this.data.forEach((track) => {
    track.weight = calcWeight(track);
    if (track.source === 'vk') vkTracks.push(track);
    if (track.source === 'sc') scTracks.push(track);
  });

  scTracks.forEach((track, index) => {
    track.weight += ((scTracks.length - index) / scTracks.length) * WEIGHTS.pos;
  });
  
  vkTracks.forEach((track, index) => {
    track.weight += ((vkTracks.length - index) / vkTracks.length) * WEIGHTS.pos;
  });



  // let posWeight;
  // let bitWeight;
  // this.data.forEach((track, index) => {
  //   if (track.source === 'vk') {
  //     posWeight = (vkTracks.length - index)/vkTracks.length;
  //     if (posWeight <= 0) {
  //       posWeight = (vkTracks.length + scTracks.length - index) / vkTracks.length;
  //     }
  //   } else if (track.source === 'sc') {
  //     posWeight = (scTracks.length - index)/scTracks.length;
  //     if (posWeight <= 0) {
  //       posWeight = (scTracks.length + vkTracks.length - index) / scTracks.length;
  //     }
  //   }
  //   track.weight += posWeight * WEIGHTS.pos;

  //   // track.weight += (track.bitrate / 320) * WEIGHTS.bitrate;

  //   // if (track.artist.trim().toLowerCase() === query.trim().toLowerCase())
  //   //   track.weight += WEIGHTS.artistExact;

  //   // if (track.artist.trim().toLowerCase().indexOf(query.trim().toLowerCase()) !== -1)
  //   //   track.weight += WEIGHTS.artistContains;


  //   Logger.screen.log(track.source, posWeight);
  // });

  this.setPlaylist(this.data.sort(function(a, b) {
    return parseFloat(a.weight, 10) < parseFloat(b.weight, 10);
  }));

  Logger.screen.log('Sorted!');
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
