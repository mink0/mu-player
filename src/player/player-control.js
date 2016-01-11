import komponist from 'komponist';
import * as playlistCtrl from '../components/playlist-ctrl';
import errorHandler from '../helpers/error-handler';
import {
  timeConvert
}
from '../actions/music-actions';

const SEEK_TIMEOUT = 1000;
const SEEK_VALUE = 10;

let poller;
let seekTimer = null;
let seekPos = 0;
let seekVal = SEEK_VALUE;

let mpd = komponist.createConnection(6600, 'localhost', function(err, clinet) {
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

export let play = (url, id) => {
  mpd.playid(id, (err) => {
    if (err) return errorHandler(err);
    metadata(url);
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
    global.Logger.screen.log('{cyan-fg}Volume:{/cyan-fg} ' + vol + '%');
    mpd.setvol(vol);
  });
};

export let volumeDown = () => {
  mpd.status((err, status) => {
    if (err) return errorHandler(err);

    let vol = parseInt(status.volume) - 2;
    if (vol < 0) vol = 0;
    global.Logger.screen.log('{cyan-fg}Volume:{/cyan-fg} ' + vol + '%');
    mpd.setvol(vol);
  });
};

export let seekFwd = () => {
  seekPos = '+' + (parseInt(seekPos, 10) + seekVal);
  seekWithDelay();
};

export let seekBwd = () => {
  seekPos = '' + (parseInt(seekPos, 10) - seekVal);
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

    global.Logger.screen.log('Seek to: ', seekPos >= 0 ?
      '+' + timeConvert(seekPos) : timeConvert(seekPos));

    //playlistCtrl.updatePbar(null, seekPos);
  }
};

export let metadata = (url, cb=()=>{}) => {
  mpd.command('lsinfo', [url], (err, info) => {
    if (err) return cb(err);

    for (var k in info) {
      global.Logger.screen.log(`{cyan-fg}info{/cyan-fg} ${k}: ${info[k]}`);
    }

    return cb(null, info);
  });

};

function seek() {
  global.Logger.screen.log('{cyan-fg}Seeking:{/cyan-fg} ', seekPos >= 0 ?
    '+' + timeConvert(seekPos) : timeConvert(seekPos));

  playlistCtrl.updatePbar(null, seekPos);

  mpd.seekcur(seekPos, (err) => {
    if (err) return errorHandler(err);

    // wait for switching to new playback position
    //seekTimer = setTimeout(() => {
      seekTimer = null;
      seekPos = 0;
      seekVal = SEEK_VALUE;
    //}, SEEK_TIMEOUT);
  });
}

export let getMpdClient = () => mpd;
