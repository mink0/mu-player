import storage, { PAUSE, SHOW_HELP, FOCUS_RIGHT_PANE } from './../storage/storage';

import HelpBox from './../tui/help-box';
import * as leftPane from './media-browser-ctrl';
import * as rightPane from './playlist-ctrl';
import * as player from './../player/player-control';

export default (screen, layout) => {
  leftPane.init(screen, layout.mediaTree, layout.qsearch);
  rightPane.init(screen, layout);

  layout.logger.error = (msg, ...args) => {
    args.splice(0, 0, '{red-fg}' + msg + '{/red-fg}');

    layout.logger.log.apply(layout.logger, args);
  };
  global.Logger.screen = layout.logger;

  storage.on(PAUSE, () => player.pause());
  storage.on(SHOW_HELP, () => HelpBox(screen));

  layout.qsearch.on('submit', () => {
    rightPane.search({ type: 'search', query: layout.qsearch.value });
    leftPane.search({ type: 'search', query: layout.qsearch.value });
  });

  layout.qsearch.setValue(storage.data.lastQuery || 'The Beatles');
  layout.qsearch.emit('submit');
};
