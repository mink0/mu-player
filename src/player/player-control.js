import komponist from 'komponist';
import * as playlistCtrl from '../components/playlist-ctrl';
import errorHandler from '../helpers/error-handler';

let poller;

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
  mpd.playid(id, errorHandler);
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
    global.Logger.screen.log('Volume: ' + vol + '%');
    mpd.setvol(vol);
  });
};

export let volumeDown = () => {
  mpd.status((err, status) => {
    if (err) return errorHandler(err);

    let vol = parseInt(status.volume) - 2;
    if (vol < 0) vol = 0;
    global.Logger.screen.log('Volume: ' + vol + '%');
    mpd.setvol(vol);
  });
};

export let seekFwd = () => {
  let seek = '+10';
  global.Logger.screen.log('Seek: ' + seek + 's');
  mpd.seekcur(seek, errorHandler);
};

export let seekBwd = () => {
  let seek = '-10';
  global.Logger.screen.log('Seek: ' + seek + 's');
  mpd.seekcur(seek, errorHandler);
};

export let getMpdClient = () => mpd;
