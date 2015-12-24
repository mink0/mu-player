import * as vkActions from './../actions/vk-actions';
import * as scActions from './../actions/sc-actions';

import Playlist from './playlist';

import * as player from './../player/player-control';

import _ from 'lodash';

import LoadingSpinner from './../tui/loading-spinner';

import Promise from 'bluebird';
import splitTracklist from 'split-tracklist';

let screen = null;
let rightPane = null;
let playlist = null;

let errorHandler = (err) => {
  global.Logger.error(err);
  if (typeof err === 'object') {
    if (err.code == 14) {
      Logger.screen.error('VKontakte API limits reached');
    } else {
      if (err.error_msg) Logger.screen.error('ERR_MSG', err.error_msg);
      if (err.code) Logger.screen.error('ERR_CODE', err.code);
      Logger.screen.error('ERROR:', err);
    }
  }
};

let playCurrent = () => {
  let urlFinded = false;
  if (playlist.list.items.length > 0) {
    while (!urlFinded) {
      let url = playlist.getCurrent().url;
      let id = playlist.getCurrent().mpdId;
      if (url) {
        urlFinded = true;
        (typeof url === 'function' ? url() : Promise.resolve(url)).then((url) => {
          player.play(url, id);
        }).catch(errorHandler);
      } else {
        playlist.moveNext();
      }
    }
  }
};

export let search = (payload) => {
  if (payload.type === 'search') {
    playlist.clearOnAppend = true;
    vkActions.getSearch(payload.query).then(appendAudio).catch(errorHandler);
    scActions.getSearch(payload.query).then(appendAudio).catch(errorHandler);

  } else if (payload.type === 'searchWithArtist') {
    playlist.clearOnAppend = true;
    scActions.getSearchWithArtist(payload.track, payload.artist).then(appendAudio).catch(errorHandler);
    vkActions.getSearchWithArtist(payload.track, payload.artist).then(appendAudio).catch(errorHandler);

  } else if (payload.type === 'tracklist') {
    playlist.clearOnAppend = true;

    let spinner = LoadingSpinner(screen, 'Searching for tracks...', false);

    let onTrack = (track, index, length, query) => {
      playlist.appendPlaylist(track);
      return spinner.setContent(`${index + 1} / ${length}: ${query}\nPress ESC to close this window...`);
    };

    let getBatchSearch = (text, onTrack) => {
      let apiDelay = 350;
      let maxApiDelay = 2000;
      let tracklist = splitTracklist(text);
      global.Logger.screen.log('getBatchSearch(', tracklist, ')');

      return Promise.reduce(tracklist, (total, current, index) => {
        let delay = Promise.delay(apiDelay); // new unresolved delay promise
        return delay.then(Promise.join(
          scActions.getSearch(current.track, {
            limit: 1
          }).catch(errorHandler),
          vkActions.getSearch(current.track, {
            limit: 1
          }).catch((err) => {
            Logger.error(err);
            apiDelay = maxApiDelay;
            //apiDelay = apiDelay >= maxApiDelay ? maxApiDelay: apiDelay * 2;
            Logger.screen.log('vk.com paranoid throttling enabled: delay', apiDelay);
          }),
          function(scTracks, vkTracks) {
            let tracks = [];
            if (scTracks && scTracks.length > 0) tracks = tracks.concat(scTracks);
            if (vkTracks && vkTracks.length > 0) tracks = tracks.concat(vkTracks);

            return onTrack(tracks, index, tracklist.length, current.track);
          }));
      });
    };

    getBatchSearch(payload.tracklist, onTrack).then(() => {
      spinner.stop();
    }).catch((err) => {
      spinner.stop();
      global.Logger.error(err);
    });
  }
};

export let init = (_screen, _rightPane) => {
  screen = _screen;
  rightPane = _rightPane;
  playlist = new Playlist(rightPane);

  rightPane.on('select', () => {
    playCurrent();
  });

  player.setOnNextSong(() => {
    playlist.moveNext();
    playCurrent();
  });
};

let appendAudio = (audio) => {
  rightPane.focus();
  playlist.appendPlaylist(audio);
};

export let updatePlaying = (status) => {
  Logger.info(status);
  if (status.state === 'play') {
    global.Logger.info(playlist.getCurrent().url);
    global.Logger.screen.log('{green-fg}Playing:{/green-fg}', playlist.getCurrent().title,
      '-', status.bitrate, 'kbps');
    playlist.setCurrentById(status.songid);
  } else if (status.state === 'stop')
    playlist.stop();

};

// let setListElements = (elements) => {
//   rightPane.clearItems();
//   rightPane.setItems(elements);

//   storage.emit(FOCUS_RIGHT_PANE);
// };

// let setAudio = (audio) => {
//   setListElements(_.pluck(audio, 'trackTitleFull'));
//   storage.emit(FOCUS_RIGHT_PANE);
// };

// let loadAudio = (audio) => {
//   rightPane.focus();
//   playlist.setPlaylist(audio);
// };

// storage.on(LOCAL_SEARCH, (data) => {
//   prompt(screen, 'Search', '').then((query) => {
//     setAudio(playlist.filter(query));
//     playlist.setCurrent(0);

//     playCurrent();
//   });
// });

// storage.on(SC_SEARCH, (payload) => {
//   if (payload.type === 'search') {
//     scActions.getSearch(payload.query).then(loadAudio).catch((err) => Logger.error(err));
//   }
// });

// storage.on(OPEN_VK, (payload) => {
//   if (payload.type === 'profile') {
//     vkActions.getProfileAudio().then(loadAudio).catch((err) => Logger.error(err));
//   } else if (payload.type === 'audio') {
//     vkActions.getGroupAudio(payload.owner_id, payload.album_id).then(loadAudio).catch((err) => Logger.error(err));
//   } else if (payload.type === 'wall') {
//     vkActions.getWallAudio(payload.id).then(loadAudio).catch((err) => Logger.error(err));
//   } else if (payload.type === 'search') {
//     vkActions.getSearch(payload.query, payload.opts).then(loadAudio).catch((err) => Logger.error(err));
//   } else if (payload.type === 'searchWithArtist') {
//     vkActions.getSearchWithArtist(payload.track, payload.artist).then(loadAudio).catch((err) => Logger.error(err));
//   } else if (payload.type === 'list') {
//     vkActions.getSearchList(payload.track, payload.artist).then(loadAudio).catch((err) => Logger.error(err));
//   } else if (payload.type === 'recommendations') {
//     vkActions.getRecommendations().then(loadAudio).catch((err) => Logger.error(err));
//   } else if (payload.type === 'tracklist') {
//     setListElements([]);
//     playlist.setPlaylist([]);

//     let spinner = LoadingSpinner(screen, 'Adding...', false);
//     let onTrack = (track, index, length) => {
//       rightPane.pushItem(track.trackTitleFull);
//       storage.emit(FOCUS_RIGHT_PANE);

//       playlist.push(track);
//       spinner.setContent(`${index + 1} / ${length}. press z to cancel`);
//     };

//     vkActions.getBatchSearch(payload.tracklist, onTrack).then(() => {
//       spinner.stop();
//     }).catch((err) => {
//       spinner.stop();
//       Logger.error(err);
//     });
//   }
// });

// storage.on(ADD_TO_PROFILE, () => {
//   let selected = playlist.get(rightPane.selected);
//   let listEl = rightPane.items[rightPane.selected];

//   let addToProfile = () => {
//     let spinner = LoadingSpinner(screen, 'Adding...');

//     return vkActions.addToProfile(selected).then((selected) => {
//       rightPane.setItem(listEl, selected.trackTitleFull);
//       storage.emit(FOCUS_RIGHT_PANE);

//       InfoBox(screen, 'Successfully added to your profile');
//       spinner.stop();
//     }).catch((err) => {
//       Logger.error(err);
//       spinner.stop();
//     });
//   };

//   let addOnTop = () => {
//     let spinner = LoadingSpinner(screen, 'Moving...');

//     return vkActions.addOnTop(selected).then((result) => {
//       spinner.stop();
//     }).catch((err) => {
//       Logger.error(err);
//       spinner.stop();
//     });
//   };

//   if (selected.isAdded) {
//     addOnTop();
//   } else {
//     addToProfile();
//   }
// });

// storage.on(OPEN_FS, (data) => {
//   let folder = fsActions.getFolder(data.path);

//   fsActions.getTags(folder).then((result) => {
//     var collection = fsActions.flattenCollection(result);
//     loadAudio(collection);
//   });
// });

// storage.on(MOVE_TO_PLAYING, (data) => {
//   //rightPane.select(playlist.getCurrentIndex());
//   storage.emit(FOCUS_RIGHT_PANE);
// });

// let processGmError = (err) => {
//   Logger.error(err);

//   if (err.message === 'error getting album tracks: Error: 401 error from server') {
//     Toast(screen, 'Auth error');
//   }
// };

// storage.on(OPEN_GM_ALBUM, (data) => {
//   gmActions.getAlbum(data.albumId).then((result) => {
//     loadAudio(result);
//   }).catch(processGmError);
// });

// storage.on(OPEN_GM_THUMBS_UP, (data) => {
//   gmActions.getThumbsUp().then((result) => {
//     loadAudio(result);
//   }).catch(processGmError);
// });

// storage.on(OPEN_GM_ALL_TRACKS, (data) => {
//   gmActions.getAllTracks().then((result) => {
//     loadAudio(result);
//   }).catch(processGmError);
// });
