import _ from 'lodash';
import storage from './../storage/storage';
import similarPrompt from './../tui/similar-prompt';
import listPrompt from './../tui/list-prompt';
import * as lfmActions from './../actions/lastfm-actions';
import * as playlist from './playlist-ctrl';
import errorHandler from '../helpers/error-handler';

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
        'top': {
          name: 'Top tracks for ' + this.artist ,
          artist: this.artist,
          fn: function() {
            let self = this;
            let limit = storage.data.topTracks.results;
            lfmActions.getTopTracks(self.artist, limit).then((tracks) => {
              Logger.screen.info('last.fm', 'found ' + tracks.track.length + ' track(s)');
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
        'albums': {
          name: 'Top albums for ' + this.artist,
          artist: this.artist, // save link for fn
          fn: function() {
            let self = this;
            return lfmActions.getTopAlbums(self.artist).then((albums) => {
              Logger.screen.info('last.fm', 'found ' + albums.length + ' album(s)');
              return listPrompt(screen, albums, 'name', 'Choose the Album').then((album) => {
                return lfmActions.getAlbumInfo({
                  // artist: self.artist,
                  // album: album.name,
                  mbid: album.mbid
                }).then((tracks) => {
                  Logger.screen.info('last.fm', 'found ' + tracks.length + ' track(s)');
                  let tracklist = [];
                  tracks.forEach((track) => {
                    tracklist.push({
                      artist: track.artist.name,
                      track: track.name,
                      album: album.name
                    });
                  });

                  return playlist.batchSearch({
                    type: 'tracklist',
                    tracklist: tracklist,
                  });
                });
              });
            }).catch(errorHandler);
          }
        },
        'similar': {
          name: 'Similar artists for ' + this.artist,
          artist: this.artist, // save link for fn
          fn: function() {
            let self = this;
            return lfmActions.getSimilar(this.artist).then((artists) => {
              Logger.screen.info('last.fm', 'found ' + artists.length + ' artist(s)');
              return listPrompt(screen, artists, 'name', 'Choose the Artist').then((artist) => {
                qsearch.setValue(artist.name);
                qsearch.emit('submit');
              });
            }).catch(errorHandler);
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
