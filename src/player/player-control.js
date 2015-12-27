import komponist from 'komponist';
import * as playlistCtrl from '../components/playlist-ctrl';
import errorHandler from '../helpers/error-handler';

let poller;

let mpd = komponist.createConnection(6600, 'localhost', function(err) {
  if (err) {
    console.log('You should start Music Player Daemon (MPD) first');
    console.error(err);
    process.exit(1);
  }

  poller = setInterval(() => {
    mpd.status((err, status) => {
      if (err) return errorHandler(err);
      playlistCtrl.updatePbar(status.elapsed);
    });
  }, 1000);
});

mpd.on('changed', function(system) {
  Logger.info('Subsystem changed: ', system);
  if (system === 'player') {
    mpd.status((err, status) => {
      if (err) return errorHandler(err);
      playlistCtrl.updatePlaying(status);
    });
  }
});

export let play = (url, id) => {
  // mpd.clear();
  // mpd.add(url, (err) => {
  //   if (err) return errHandler(err);
  //   mpd.play(errHandler);
  // });

  mpd.playid(id);

};

export let pause = () => {
  mpd.toggle();
};

export let getMpdClient = () => mpd;

export let setOnNextSong = () => {};
