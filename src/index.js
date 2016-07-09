import tui from './tui/screen';
import drawLayout from './tui/layout';

import setupCredentials from './helpers/credentials';
import startApp from './components/main';
import meow from 'meow';
import * as player from '../src/player/player-control';
import * as lfmActions from './actions/lastfm-actions';
lfmActions.init();

import storage, {
  updateConfig,
  VK_SEARCH,
  PAUSE,
  ADD_TO_PROFILE,
  SHOW_HELP,
  SWITCH_PANE,
  MOVE_TO_PLAYING,
  FOCUS_LEFT_PANE,
  FOCUS_RIGHT_PANE,
  LOCAL_SEARCH
} from './storage/storage';

let cli = meow(`
  Usage:
    ./cli.js [options]

  Options:
    --setup Setup login credentials
`, {
  pkg: './../package.json'
});

updateConfig().then((setupConfig) => {
  setupCredentials(cli.flags.setup || setupConfig).then(() => {
    let screen = tui();
    let layout = drawLayout(screen);

    startApp(screen, layout);

    screen.key(['space'], () => player.pause());
    screen.key(['s'], () => player.stop());
    screen.key(['f'], () => player.favToggle());

    screen.key(['left'], () => layout.mediaTree.focus());
    screen.key(['right'], () => layout.playlist.focus());

    screen.key(['+', '='], () => player.volumeUp());
    screen.key(['-', '_'], () => player.volumeDown());

    screen.key(['>', '.'], () => player.seekFwd());
    screen.key(['<', ','], () => player.seekBwd());

    screen.key(['/', '?'], () => storage.emit(SHOW_HELP));

    layout.qsearch.key(['left'], () => {
      layout.qsearch.cancel();
      layout.mediaTree.focus();
      screen.render();
    });
    layout.qsearch.key(['right'], () => {
      layout.qsearch.cancel();
      layout.playlist.focus();
      screen.render();
    });
    layout.qsearch.key(['tab'], () => {
      layout.qsearch.cancel();
      layout.mediaTree.focus();
      screen.render();
    });

    layout.mediaTree.rows.key(['tab'], () => {
      layout.playlist.focus();
      screen.render();
    });
    layout.playlist.key(['tab'], () => {
      layout.qsearch.focus();
      screen.render();
    });

    layout.playlist.key(['pageup'], () => {
      layout.playlist.up(layout.playlist.height - 2);
      screen.render();
    });
    layout.playlist.key(['pagedown'], () => {
      layout.playlist.down(layout.playlist.height - 2);
      screen.render();
    });

    layout.mediaTree.rows.key(['pageup'], () => {
      layout.mediaTree.rows.up(layout.mediaTree.rows.height);
      screen.render();
    });
    layout.mediaTree.rows.key(['pagedown'], () => {
      layout.mediaTree.rows.down(layout.mediaTree.rows.height);
      screen.render();
    });

    screen.key(['escape', 'q', 'C-c'], () => {
      if (!screen.blockEsc) {
        storage.data.lastQuery = layout.qsearch.getValue();
        storage.save();
        process.exit(0);
      }
    });

    screen.title = ':mu';
    process.title = ':mu';

    screen.render();
  });
});
