import _ from 'lodash';
import storage, {
  LASTFM_SEARCH, SEARCH_VK, OPEN_VK
}
from './../storage';

import Toast from './../tui/toast';
import SimilarPrompt from './../tui/similar-prompt.js';

import * as vkActions from './../actions/vk-actions';
import * as lfmActions from './../actions/lastfm-actions';


let screen = null;
let menuPane = null;
let treeData = {};
//let lfmMenu = {};

export default (_screen, _menuPane) => {
  screen = _screen;
  menuPane = _menuPane;
  //renderPane();

  storage.on(SEARCH_VK, vkSearchFn);
  storage.on(LASTFM_SEARCH, lfmSearchFn);
  menuPane.on('select', function(item, index) {
    //console.log(index);
    Logger.bottom.log(item);
    if (item.fn) item.fn();
  });
  // menuPane.key('enter', function(data){
  //   //console.log(data);
  // });
};

// let mediaTreeSelect = (node) => {
//   //Logger.bottom.log(node.data);
//   if (node.fn) node.fn();
// };

let vkSearchFn = (data) => {
  storage.emit(OPEN_VK, {
    type: 'search',
    query: data.query
  });
};

let lfmSearchFn = (data) => {
  lfmActions.getSearch(data.query).then((searchData) => {

    function TrackItem(track, artist) {
      this.track = track;
      this.artist = artist;
      this.name = '[' + artist + '] ' + track;
    }
    TrackItem.prototype.fn = function() {
      storage.emit(OPEN_VK, {
        type: 'searchWithArtist',
        track: this.track,
        artist: this.artist
      });
    };

    function ArtistItem(artist) {
      this.artist = artist;
      this.name = '[' + artist + ']';
      this.extended = true;
      this.children = {
        'alltracks': {
          name: 'All tracks for ' + this.artist, // all nodes must have unique names for tree
          artist: this.artist, // save link for fn
          fn: function() {
            let self = this;
            storage.emit(OPEN_VK, {
              type: 'search',
              query: self.artist,
              opts: {
                strict: true
              }
            });
          }
        },
        'top10': {
          name: 'Top tracks for ' + this.artist,
          artist: this.artist,
          fn: function() {
            let self = this;
            lfmActions.getTopTracks(self.artist).then((tracks) => {
              Logger.bottom.log('Last.fm found ' + tracks.track.length + ' track(s)');
              let tracklist = '';
              tracks.track.forEach((track) => {
                tracklist += self.artist + ' - ' + track.name + '\n';
              });

              storage.emit(OPEN_VK, {
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
            SimilarPrompt(screen, self.artist).then((artist) => {
              storage.emit(OPEN_VK, {
                type: 'search',
                query: artist,
              });
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
  // let lfmMenu = {
  //   extended: true,
  //   children: {
  //     'Albums': {
  //       extended: true,
  //     },
  //     'Tracks': {
  //       extended: true,
  //     },
  //     'Tags': {
  //       extended: true,
  //     }
  //   }
  // };

  //console.log(lfmMenu);

  menuPane.setData(treeData);
  screen.render();
};
