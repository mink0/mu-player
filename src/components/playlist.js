import _ from 'lodash';
import * as player from '../player/player-control';
import errorHandler from '../helpers/error-handler';

function Playlist(plistPane, countPane) {
  let self = this;
  this.list = plistPane;
  this.mpd = player.getMpdClient();
  this.curIndex = 0;
  this.prevIndex = null;
  this.data = [];
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
    tracks[i].trackTitleFull = this.formatTrackTitle(tracks[i]);

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
    // On some unicode chars this SPAM log with errors. So Logger.info is preferred.
    this.mpd.command('addtagid', [id.Id, 'artist', track.artist], (err, res) => {
      if (err) Logger.info(err);
    });
    this.mpd.command('addtagid', [id.Id, 'title', track.title], (err, res) => {
      if (err) Logger.info(err);
    });
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
  if (this.data.length === 0) return;

  this.list.setItem(this.curIndex, this.data[this.prevIndex].trackTitleFull);
  this.list.render();
};

Playlist.prototype.moveNext = function() {
  this.setCurrent((this.curIndex + 1) % this.data.length);
  this.list.select(this.curIndex);
};

Playlist.prototype.sort = function(opts) {
  let sorted = this.sorter(this.data, opts);
  this.setPlaylist(sorted);
  Logger.screen.log('Smart sorting was applied!');
};

Playlist.prototype.sorter = function(tracks, opts) {
  let vkTracks = [];
  let scTracks = [];
  let type = opts.type || 'default';
  let query = opts.query;
  let artist = opts.artist;
  let title = opts.track;

  let WEIGHTS = {
    artistExact: 3,
    artistContains: 1,
    titleExact: 2,
    titleContains: 1,
    bitrate: 20,
    pos: 10
  };

  // tuning for top artists search
  if (type === 'top10') {
    WEIGHTS = {
      artistExact: 3,
      artistContains: 1,
      titleExact: 2,
      titleContains: 1,
      bitrate: 3,
      pos: 1
    };
  }

  let calcWeight = (track) => {
    if (!track.hasOwnProperty('weight')) track.weight = 0;

    if (track.bitrate) track.weight += ((track.bitrate / 320) * WEIGHTS.bitrate);

    if (track.hasOwnProperty('artist')) {
      if (query) {
        if (track.artist.trim().toLowerCase() === query.trim().toLowerCase())
          track.weight += WEIGHTS.artistExact;
        else if (track.artist.trim().toLowerCase().indexOf(query.trim().toLowerCase()) !== -1)
          track.weight += WEIGHTS.artistContains * (1 / (track.artist.trim().length - query.trim().length));
      } else if (artist) {
        if (track.artist.trim().toLowerCase() === artist.trim().toLowerCase())
          track.weight += WEIGHTS.artistExact;
        else if (track.artist.trim().toLowerCase().indexOf(artist.trim().toLowerCase()) !== -1)
          track.weight += WEIGHTS.artistContains * (1 / (track.artist.trim().length - artist.trim().length));
      }
    }

    if (track.hasOwnProperty('title')) {
      if (query) {
        if (track.title.trim().toLowerCase() === query.trim().toLowerCase())
          track.weight += WEIGHTS.titleExact;
        else if (track.title.trim().toLowerCase().indexOf(query.trim().toLowerCase()) !== -1)
          track.weight += WEIGHTS.titleContains * (1 / (track.title.trim().length - query.trim().length));
      } else if (title) {
        if (track.title.trim().toLowerCase() === title.trim().toLowerCase())
          track.weight += WEIGHTS.titleExact;
        else if (track.title.trim().toLowerCase().indexOf(title.trim().toLowerCase()) !== -1)
          track.weight += WEIGHTS.titleContains * (1 / (track.title.trim().length - title.trim().length));
      }
    }
  };

  // to calculate order weight
  tracks.forEach((track) => {
    calcWeight(track);

    if (track.source === 'vk') vkTracks.push(track);
    if (track.source === 'sc') scTracks.push(track);
  });

  vkTracks.forEach((track, index) => {
    track.weight += ((vkTracks.length - index) / vkTracks.length) * WEIGHTS.pos;
  });

  scTracks.forEach((track, index) => {
    track.weight += ((scTracks.length - index) / scTracks.length) * WEIGHTS.pos;
  });

  let sorted = tracks.sort(function(a, b) {
    return parseFloat(b.weight, 10) - parseFloat(a.weight, 10);
  });

  return sorted;
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

Playlist.prototype.formatTrackTitle = function(track) {
  if (typeof track !== 'object') return 'Unknown track';

  if (track.label)
    return `{light-red-fg}${track.label}{/light-red-fg}`;

  let result = `{bold}${track.artist}{/bold}`;

  if (track.source) result = `[${track.source}] ` + result;

  if (track.title) result += ` - ${  track.title}`;

  if (track.duration) {
    result += '{|}';
    let duration = _.padLeft(track.duration / 60 | 0, 2, '0') + ':' + _.padLeft(track.duration % 60, 2, '0');
    //if (track.bitrate) result += ` {light-black-fg}${track.bitrate}kbps{/light-black-fg}`;
    result += ` ${duration}`;
  }

  if (!track.url) result = `Not Found: ${result}`;

  return result;
};


module.exports = Playlist;
