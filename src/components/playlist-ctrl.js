import * as vkActions from './../actions/vk-actions';
import * as scActions from './../actions/sc-actions';

import Playlist from './playlist';

import * as player from './../player/player-control';

import LoadingSpinner from '../tui/loading-spinner';

import Promise from 'bluebird';
import splitTracklist from 'split-tracklist';

let screen = null;
let layout = null;
let plistPane = null;
let playlist = null;
let playInfo = null;
let songid = null;

export let init = (_screen, _layout) => {
  screen = _screen;
  layout = _layout;
  plistPane = _layout.playlist;
  playInfo = _layout.playInfo;

  playlist = new Playlist(plistPane, layout.plistCount);

  plistPane.on('select', () => playCurrent());
};

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

export let stop = () => {
  screen.title = ':mu';
  playlist.stop();
  playInfo.hide();
};

export let search = (payload) => {
  stop();
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
      return spinner.setContent(`${index + 1} / ${length}: ${query}`);
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

let appendAudio = (audio) => {
  plistPane.focus();
  playlist.appendPlaylist(audio);
};

export let updatePlaying = (status) => {
  global.Logger.info(status);

  if (status.error) global.Logger.screen.error('MPD:', status.error);

  if (status.state === 'play') {
    if (playlist.setCurrentById(status.songid) === null) {
      global.Logger.screen.error('Playlist:', 'Can\'t find track with id', status.songid);
      stop();
      return;
    }

    if (status.songid === songid) {
      // resume from pause
      playInfo.updateStatus('play');
      return;
    }

    // new song
    songid = status.songid;
    global.Logger.info(playlist.getCurrent().url);
    global.Logger.screen.log('{green-fg}Play:{/green-fg}',
      playlist.getCurrent().artist, '-', playlist.getCurrent().title, '[' + status.bitrate + ' kbps]');

    screen.title = playlist.getCurrent().artist + ' - ' + playlist.getCurrent().title;

    playInfo.init({
      duration: playlist.getCurrent().duration,
      title: playlist.getCurrent().title,
      artist: playlist.getCurrent().artist,
      status: 'play'
    });
  } else if (status.state === 'stop') {
    stop();
  } else if (status.state === 'pause') {
    playInfo.updateStatus('pause');
  }
};

export let updatePbar = (elapsed) => {
  if (playInfo === null || playInfo.hidden) return;

  playInfo.setProgress(elapsed);
};
