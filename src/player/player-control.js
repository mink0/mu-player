import komponist from 'komponist';
import * as playlistCtrl from '../components/playlist-ctrl';
import errorHandler from '../helpers/error-handler';
import {
  timeConvert
}
from '../actions/music-actions';
import storage from '../storage/storage';

const SEEK_TIMEOUT = 1000;
const SEEK_VALUE = 10;

let poller;
let seekTimer = null;
let seekPos = 0;
let seekVal = SEEK_VALUE;
let host = storage.data.mpd.host;
let port = storage.data.mpd.port;

let mpd = komponist.createConnection(port, host, function(err, clinet) {
  poller = setInterval(() => {
    mpd.status((err, status) => {
      if (err) return errorHandler(err);
      playlistCtrl.updatePbar(status.elapsed);
    });
  }, 1000);
});

mpd.on('error', (err) => {
  // FIXME: no proper error handling on createConnection
  if (err.code === 'ECONNREFUSED') {
    console.log('You should start Music Player Daemon (MPD) first!');
    console.log('Visit http://mpd.wikia.com/wiki/Install for the installation instructions.');
    console.error(err);
    process.exit(1);
  }

  errorHandler(err);
});

mpd.on('changed', function(system) {
  if (system === 'player') {
    mpd.status((err, status) => {
      if (err) return errorHandler(err);
      playlistCtrl.updatePlaying(status);
    });
  }
});

export let favToggle = () => {
  playlistCtrl.favToggle();
};

export let play = (url, id) => {
  mpd.playid(id, (err) => {
    if (err) return errorHandler(err);
    // FIX: mpd didn't send play event sometimes on linux
    setTimeout(() => {
      mpd.emit('changed', 'player');
    }, 1000);
  });
};

export let stop = () => {
  mpd.stop(errorHandler);
};

export let pause = () => {
  mpd.toggle(errorHandler);
};

export let volumeUp = () => {
  mpd.status((err, status) => {
    if (err) return errorHandler(err);

    let vol = parseInt(status.volume) + 2;
    if (vol > 100) vol = 100;
    Logger.screen.log('{cyan-fg}Volume:{/cyan-fg} ' + vol + '%');
    mpd.setvol(vol);
  });
};

export let volumeDown = () => {
  mpd.status((err, status) => {
    if (err) return errorHandler(err);

    let vol = parseInt(status.volume) - 2;
    if (vol < 0) vol = 0;
    Logger.screen.log('{cyan-fg}Volume:{/cyan-fg} ' + vol + '%');
    mpd.setvol(vol);
  });
};

export let seekFwd = () => {
  seekPos = seekPos + seekVal;
  playlistCtrl.updatePbar(null, seekVal);
  seekWithDelay();
};

export let seekBwd = () => {
  seekPos = seekPos - seekVal;
  playlistCtrl.updatePbar(null, -1 * seekVal);
  seekWithDelay();
};

export let seekWithDelay = () => {
  // wait for previous call
  if (seekTimer === null) {
    seekTimer = setTimeout(seek, SEEK_TIMEOUT);
  } else {
    if (seekVal < SEEK_VALUE * 5) seekVal = seekVal * 2;

    clearTimeout(seekTimer);
    seekTimer = setTimeout(seek, SEEK_TIMEOUT);

    Logger.screen.info('Seek to: ', seekPos >= 0 ?
      '+' + timeConvert(seekPos) : timeConvert(seekPos));

  }
};

export let metadata = (url, cb=()=>{}) => {
  mpd.command('lsinfo', [url], (err, info) => {
    if (err) return cb(err);
    cb(null, info);
  });
};

export let seek = (absSeek) => {
  let seekPosMpd, text;
  if (absSeek) {
    seekPosMpd = absSeek;
    text = timeConvert(seekPosMpd);
  } else {
    seekPosMpd = seekPos > 0 ? '+' + seekPos : '' + seekPos;
    text = seekPos >= 0 ? '+' + timeConvert(seekPos) : timeConvert(seekPos);
  }

  Logger.screen.status('Seeking:', text);

  mpd.seekcur(seekPosMpd, (err) => {
    if (err) return errorHandler(err);

    //FIXME: On Linux you should wait for switching to new playback position
    seekTimer = null;
    seekPos = 0;
    seekVal = SEEK_VALUE;
  });
};

export let getMpdClient = () => mpd;
