import komponist from 'komponist';
import * as playlist from '../components/playlist-ctrl';
import errorHandler from '../helpers/error-handler';

let mpd = komponist.createConnection(6600, 'localhost', function(err) {
  if (err) {
    console.log('You should start Music Player Daemon (MPD) first');
    console.error(err);
    process.exit(1);
  }
});

mpd.on('changed', function(system, data) {
  Logger.info('Subsystem changed: ', system, data);
  if (system === 'player') {
    mpd.status((err, status) => {
      if (err) return errorHandler(err);
      playlist.updatePlaying(status);
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
