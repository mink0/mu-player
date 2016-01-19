import * as vkActions from './../actions/vk-actions';
import * as scActions from './../actions/sc-actions';

import Playlist from './playlist';

import * as player from './../player/player-control';

import loadingSpinner from '../tui/loading-spinner';

import Promise from 'bluebird';
import splitTracklist from 'split-tracklist';
import { getRemoteBitrate } from '../actions/music-actions';

let screen = null;
let layout = null;
let plistPane = null;
let playlist = null;
let trackInfo = null;
let songid = null;
let getBitrateAsync = Promise.promisify(getRemoteBitrate);

export let init = (_screen, _layout) => {
  screen = _screen;
  layout = _layout;
  plistPane = _layout.playlist;
  trackInfo = _layout.trackInfo;

  playlist = new Playlist(plistPane, layout.plistCount);

  plistPane.on('select', () => playCurrent());
};

let errorHandler = (err) => {
  global.Logger.error(err);
  if (typeof err === 'object') {
    if (err.code == 14) {
      Logger.screen.error('VKontakte API limits reached');
    } else if (err.cause) {
      Logger.screen.error('ERROR:', err.cause);
    }else {
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
  trackInfo.hide();
};

let appendAudio = (audio) => {
  plistPane.focus();
  playlist.appendPlaylist(audio);
};

export let search = (payload) => {
  stop();
  if (payload.type === 'search') {
    let spinner = loadingSpinner(screen, 'Searching...', false);

    playlist.clearOnAppend = true;
    let sc = scActions.getSearch(payload.query).then(appendAudio).catch(errorHandler);

    let vkBitrates;
    let vk = vkActions.getSearch(payload.query).then((tracks) => {
      let promises = [];

      global.Logger.screen.log('Loading bitrates...');
      spinner.setContent('Loading bitrates...');
      tracks.forEach((track) => {
        promises.push(getBitrateAsync(track.url, track.duration).then((bitrate) => {
          track.bitrate = bitrate;
        }).catch(errorHandler));
      });

      vkBitrates = Promise.all(promises);
      vkBitrates.then(() => {
        spinner.setContent('Apply smart sorting...');
      });
      appendAudio(tracks);
    }).catch(errorHandler);

    let searchDone = () => {
      global.Logger.screen.log('Apply smart sorting...');
      playlist.sort(payload.query);
      spinner.stop();
    };

    Promise.all([vk, sc]).then(() => {
      global.Logger.screen.info('Found:', `${playlist.data.length} results`);
      
      if (vkBitrates !== undefined) 
        vkBitrates.then(() => searchDone());
      else 
        searchDone();
    });

  } else if (payload.type === 'searchWithArtist') {
    playlist.clearOnAppend = true;
    scActions.getSearchWithArtist(payload.track, payload.artist).then(appendAudio).catch(errorHandler);
    vkActions.getSearchWithArtist(payload.track, payload.artist).then(appendAudio).catch(errorHandler);

  } else if (payload.type === 'tracklist') {
    playlist.clearOnAppend = true;

    let spinner = loadingSpinner(screen, 'Searching for tracks...', false);

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
      // resume from pause or from stop
      trackInfo.updateStatus('play');
      return;
    }

    // new song
    songid = status.songid;
    let cur = playlist.getCurrent();
    global.Logger.info('Open: ', cur.url);
    global.Logger.screen.info('Play:',
      cur.artist, '-', cur.title, '[' + status.bitrate + ' kbps]');

    screen.title = cur.artist + ' - ' + cur.title;

    trackInfo.init({
      duration: cur.duration,
      title: cur.title,
      artist: cur.artist,
      bitrate: cur.bitrate,
      status: 'play'
    });
  } else if (status.state === 'stop') {
    stop();
  } else if (status.state === 'pause') {
    trackInfo.updateStatus('pause');
  }
};

export let updatePbar = (elapsed, seek) => {
  if (trackInfo === null || trackInfo.hidden) return;

  trackInfo.setProgress(elapsed, seek);
};
