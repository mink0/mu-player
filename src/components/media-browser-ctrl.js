import _ from 'lodash';
import storage, {
  LASTFM_SEARCH, VK_SEARCH, OPEN_VK
}
from './../storage/storage';

// import Toast from './../tui/toast';
import similarPrompt from './../tui/similar-prompt.js';

// import * as vkActions from './../actions/vk-actions';
// import * as scActions from './../actions/sc-actions';
import * as lfmActions from './../actions/lastfm-actions';

import * as playlist from './playlist-ctrl';

let screen = null;
let menuPane = null;
let treeData = {};
let qsearch = null;

export let init = (_screen, _menuPane, _qsearch) => {
  screen = _screen;
  menuPane = _menuPane;
  qsearch = _qsearch;

  menuPane.on('select', function(item) {
    if (item.fn) item.fn();
  });
};

export let search = (data) => {
  lfmActions.getSearch(data.query).then((searchData) => {

    function TrackItem(track, artist) {
      this.track = track;
      this.artist = artist;
      this.name = '{bold}[' + artist + ']{/bold} ' + track;
    }
    TrackItem.prototype.fn = function() {
      playlist.search({
        type: 'searchWithArtist',
        track: this.track,
        artist: this.artist
      });
    };

    function ArtistItem(artist) {
      this.artist = artist;
      this.name = '{bold}[' + artist + ']{/bold}';
      this.extended = true;
      this.children = {
        'alltracks': {
          name: 'All tracks for ' + this.artist, // all nodes must have unique names for tree
          artist: this.artist, // save link for fn
          fn: function() {
            let self = this;
            playlist.search({
              type: 'search',
              query: self.artist
            });
          }
        },
        'top10': {
          name: 'Top tracks for ' + this.artist ,
          artist: this.artist,
          fn: function() {
            let self = this;
            let limit = storage.data.topTracks.results;
            lfmActions.getTopTracks(self.artist, limit).then((tracks) => {
              Logger.screen.log('Last.fm found ' + tracks.track.length + ' track(s)');
              let tracklist = [];
              tracks.track.forEach((track) => {
                tracklist.push({
                  artist: self.artist,
                  track: track.name
                });
              });

              playlist.batchSearch({
                type: 'tracklist',
                tracklist: tracklist,
              });
            });
          }
        },
        'similar': {
          name: 'Similar artists for ' + this.artist,
          artist: this.artist, // save link for fn
          fn: function() {
            let self = this;
            similarPrompt(screen, self.artist).then((artist) => {
              qsearch.setValue(artist);
              qsearch.emit('submit');
            });
          }
        },
      };
    }

    function ItemFactory(type, data) {
      if (type === 'tracks')
        return new TrackItem(data.name, data.artist);
      else if (type === 'artists')
        return new ArtistItem(data.name);
    }

    let title = '',
      rootKey, fn;
    let menu = {
      extended: true,
      children: {}
    };

    for (var key in searchData) {
      rootKey = key.charAt(0).toUpperCase() + key.slice(1);
      menu.children[rootKey] = {
        name: '{bold}{light-white-fg}' + rootKey + '{/light-white-fg}{/bold}',
        extended: true,
        children: {}
      };
      searchData[key].forEach((data, id) => {
        menu.children[rootKey].children[id] = ItemFactory(key, data);
      });
    }

    treeData = menu;
    renderPane();

  });
};

let renderPane = () => {
  menuPane.setData(treeData);
  screen.render();
};
