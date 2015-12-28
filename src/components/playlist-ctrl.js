import * as vkActions from './../actions/vk-actions';
import * as scActions from './../actions/sc-actions';

import Playlist from './playlist';

import * as player from './../player/player-control';

import _ from 'lodash';

import LoadingSpinner from '../tui/loading-spinner';
import pbarWidget from '../tui/pbar-widget';

import Promise from 'bluebird';
import splitTracklist from 'split-tracklist';

let screen = null;
let rightPane = null;
let playlist = null;
let pbarOpts = null;
let pbar = null;

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

export let init = (_screen, _rightPane, _pbarOpts) => {
  screen = _screen;
  rightPane = _rightPane;
  pbarOpts = _pbarOpts;
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
  global.Logger.info(status);

  if (status.error) Logger.screen.error('MPD:', status.error);

  if (status.state === 'play') {
    playlist.setCurrentById(status.songid);
    global.Logger.info(playlist.getCurrent().url);
    global.Logger.screen.log('{green-fg}Play:{/green-fg}', playlist.getCurrent().artist, '-',
      playlist.getCurrent().title, '[' + status.bitrate +' kbps]');

    screen.title = playlist.getCurrent().artist + ' - ' + playlist.getCurrent().title;

    if (pbar) pbar.destroy();
    let opts = _.cloneDeep(pbarOpts);
    opts.duration = playlist.getCurrent().duration;

    pbar = pbarWidget(opts);
    screen.append(pbar);

  } else if (status.state === 'stop') {
    screen.title = ':mu';
    playlist.stop();
    if (pbar) pbar.destroy();
  }
};

export let updatePbar = (elapsed) => {
  if (!pbar) return;

  pbar.setProgress(elapsed);
};
