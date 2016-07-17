import * as vkActions from './../actions/vk-actions';
import * as scActions from './../actions/sc-actions';
import Playlist from './playlist';
import * as player from './../player/player-control';
import loadingSpinner from '../tui/loading-spinner';
import Promise from 'bluebird';
import {
  getRemoteBitrate
}
from '../actions/music-actions';
import storage from '../storage/storage';
import * as lfmActions from './../actions/lastfm-actions';

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
  Logger.error(err);
  if (typeof err === 'object') {
    if (err.code == 14) {
      Logger.screen.error('VKontakte API limits reached');
    // } else if (err.code === 'ETIMEDOUT') {
    //   Logger.screen.err('ETIMEDOUT');
    } else if (err.cause) {
      Logger.screen.error('ERROR:', err.cause);
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
          trackInfo.status = 'play';
        }).catch(errorHandler);
      } else {
        playlist.moveNext();
      }
    }
  }
};

export let favToggle = () => {
  var track = playlist.getSelected();
  lfmActions.favToggle({
    title: track.title,
    artist: track.artist
  });
};

export let stop = () => {
  screen.title = ':mu';
  playlist.stop();
  trackInfo.stop();
};

let appendTracks = (tracks) => {
  plistPane.focus();
  playlist.appendPlaylist(tracks);
  return tracks;
};

let sortAndResumePlay = (sortQuery) => {
  let status = trackInfo.status;
  let cur = playlist.getCurrent();
  playlist.sort(sortQuery);

  let resumePlay = (system) => {
    Logger.info(system);
    if (system === 'playlist') {
      let id = null;
      for (var i = 0; i < playlist.data.length; i++) {
        if (playlist.data[i].url === cur.url) {
          id = playlist.data[i].mpdId;
          break;
        }
      }
      if (id !== null) player.play(cur.url, id);

      playlist.mpd.removeListener('changed', resumePlay);
    }
  };

  if (status === 'play') {
    playlist.mpd.on('changed', resumePlay);
  }
};

let loadBitrates = (tracks, spinner) => {
  let msg = 'Loading bitrates...';
  Logger.screen.log(msg);
  spinner.setContent(msg);

  let bitrates = [];
  tracks.forEach((track) => {
    bitrates.push(getBitrateAsync(track.url, track.duration).then((bitrate) => {
      track.bitrate = bitrate;
    }).catch((err) => {
      if (err.code === 'ETIMEDOUT') errorHandler(new Error('BITRATE ETIMEDOUT: ' + track.url));
      else errorHandler(err);
    }));
  });

  return Promise.all(bitrates).then(() => {
    let msg = 'Bitrates are loaded!';
    Logger.screen.log(msg);
    spinner.setContent(msg);
    return tracks;
  });
};

export let setPlaylist = (tracks) => {
  let spinner = loadingSpinner(screen, 'Loading tracks...', false);
  playlist.clearOnAppend = true;
  plistPane.focus();
  appendTracks(tracks);
  return loadBitrates(tracks, spinner).then(() => spinner.stop());
};

export let search = (payload) => {
  let sc;
  let vk;
  let spinner = loadingSpinner(screen, 'Searching for tracks...', false, payload.query);
  let tryTimeout = storage.data.search.timeout;
  let tryAttempts = storage.data.search.retries;

  stop();

  if (payload.type === 'search' || payload.type === 'tagsearch') {
    playlist.clearOnAppend = true;
    sc = scActions.getSearch(payload.query, {tryTimeout: tryTimeout, tryAttempts: tryAttempts}).then(appendTracks);
    vk = vkActions.getSearch(payload.query, {tryTimeout: tryTimeout, tryAttempts: tryAttempts}).then((tracks) => {
      appendTracks(tracks);
      return loadBitrates(tracks, spinner);
    });

  } else if (payload.type === 'searchWithArtist') {
    playlist.clearOnAppend = true;
    sc = scActions.getSearchWithArtist(payload.track, payload.artist, {tryTimeout: tryTimeout, tryAttempts: tryAttempts}).then(appendTracks);
    vk = vkActions.getSearchWithArtist(payload.track, payload.artist, {tryTimeout: tryTimeout, tryAttempts: tryAttempts}).then((tracks) => {
      appendTracks(tracks);
      return loadBitrates(tracks, spinner);
    });
  }

  // smart sorting
  Promise.all([vk, sc]).then(() => {
    let count = 0;

    if (sc && sc.isFulfilled() && Array.isArray(sc.value()))
      count += sc.value().length;
    if (vk && vk.isFulfilled() && Array.isArray(vk.value()))
      count += vk.value().length;

    Logger.screen.log(`Found: ${count} result(s)`);

    if (count > 1) sortAndResumePlay(payload);

    spinner.stop();
  }).catch((err) => {
    errorHandler(err);
    spinner.stop();
  });
};

let getBatchSearch = (tracklist, spinner) => {
  let apiDelay = storage.data.batchSearch.apiDelay;
  let maxApiDelay = storage.data.batchSearch.maxApiDelay;
  let limit = storage.data.batchSearch.bitrateSearchLimit;
  let tryAttempts = storage.data.batchSearch.retries;
  let tryTimeout = storage.data.batchSearch.timeout;
  let isUserStop = false;

  spinner.once('destroy', () => isUserStop = true);

  let localError = (err) => {
    if (err && err.message && err.message.indexOf(':NotFound') === -1) {
      errorHandler(err);

      apiDelay = apiDelay * 2;
      if (apiDelay > maxApiDelay) apiDelay = maxApiDelay;

      Logger.screen.info('search', 'increasing delay - ', apiDelay + 'ms');
    } else {
      Logger.screen.info(err.message, 'nothing found');
    }
  };

  return Promise.reduce(tracklist, (total, current, index) => {
    if (isUserStop) throw new Error('Stopped by User');

    let delay = Promise.delay(apiDelay); // new unresolved delay promise

    spinner.setLabel(`${index + 1} / ${tracklist.length}: ${current.track}`);
    spinner.setContent('Searching for "' + current.track + '"...');
    return delay.then(() => {
      let sc = scActions.getSearchWithArtist(current.track, current.artist,
        { limit: 10, tryTimeout: tryTimeout, tryAttempts: tryAttempts })
          .catch(localError);
      let vk = vkActions.getSearchWithArtist(current.track, current.artist,
        { limit: limit, tryTimeout: tryTimeout, tryAttempts: tryAttempts })
          .catch(localError);

      return Promise.all([sc, vk]).then((data) => {
        let vkTracks = [];
        let scTracks = [];

        if (sc && sc.isFulfilled() && Array.isArray(sc.value()) && sc.value().length > 0)
          scTracks = sc.value();
        if (vk && vk.isFulfilled() && Array.isArray(vk.value()) && vk.value().length > 0)
          vkTracks = vk.value();

        return loadBitrates(vkTracks, spinner).then(() => {
          let sorted = playlist.sorter([].concat(vkTracks, scTracks), {
            track: current.track,
            artist: current.artist,
            type: 'batch'
          });

          if (typeof sorted[0] === 'object') {
            sorted[0].index = (index + 1);
            playlist.appendPlaylist([sorted[0]]);
          }
        });
      });
    });
  }, 0); // initial value for the reduce!
};

export let batchSearch = (payload) => {
  let spinner = loadingSpinner(screen, 'Loading top tracks...', false);

  playlist.clearOnAppend = true;

  stop();

  getBatchSearch(payload.tracklist, spinner).then(() => {
    Logger.screen.log('Batch search complete!');
    spinner.stop();
  }).catch((err) => {
    errorHandler(err);
    spinner.stop();
  });
};

export let updatePlaying = (status) => {
  Logger.info(status);

  if (status.error) Logger.screen.error('MPD:', status.error);

  if (status.state === 'play') {
    if (playlist.setCurrentById(status.songid) === null) {
      Logger.screen.error('Playlist:', 'Can\'t find track with id', status.songid);
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
    Logger.info('Playing:', cur.url);
    player.metadata(cur.url, (err, info) => {
      if (err) return errorHandler(err);

      for (var k in info) {
        Logger.screen.info(`info`, `${k}: ${info[k]}`);
      }
    });

    Logger.screen.status('Play:', cur.artist, '-', cur.title, '[' + status.bitrate + ' kbps]');

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
