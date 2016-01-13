import tui from './tui/screen';
import drawLayout from './tui/layout';

import setupCredentials from './helpers/credentials';
import startApp from './components/main';
import meow from 'meow';
import * as player from '../src/player/player-control';

import storage, { VK_SEARCH, PAUSE, ADD_TO_PROFILE, SHOW_HELP, SWITCH_PANE,
  MOVE_TO_PLAYING, FOCUS_LEFT_PANE, FOCUS_RIGHT_PANE, LOCAL_SEARCH } from './storage/storage';

let cli = meow(`
  Usage
    $ badtaste

  Options
    --setup Setup vk and google music login credentials
`, {
  pkg: './../package.json'
});

setupCredentials(cli.flags.setup).then(() => {
  let screen = tui();
  let layout = drawLayout(screen);

  //startApp(screen, layout);

  screen.key(['space'], () => player.pause());
  screen.key(['s'], () => player.stop());

  screen.key(['left'], () => layout.mediaTree.focus());
  screen.key(['right'], () => layout.playlist.focus());

  screen.key(['+', '='], () => player.volumeUp());
  screen.key(['-', '_'], () => player.volumeDown());

  screen.key(['>', '.'], () => player.seekFwd());
  screen.key(['<', ','], () => player.seekBwd());

  screen.key(['/', '?'], () => storage.emit(SHOW_HELP));

  layout.qsearch.key(['left'], () => { layout.mediaTree.focus(); screen.render(); });
  layout.qsearch.key(['right'], () => { layout.playlist.focus(); screen.render(); });
  layout.qsearch.key(['tab'], () => { layout.mediaTree.focus(); screen.render(); });
  layout.mediaTree.rows.key(['tab'], () => { layout.playlist.focus(); screen.render(); });
  layout.playlist.key(['tab'], () => { layout.qsearch.focus(); screen.render(); });

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
