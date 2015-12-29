import storage, {
  OPEN_VK, PAUSE, SHOW_HELP, SWITCH_PANE, FOCUS_LEFT_PANE, FOCUS_RIGHT_PANE, VK_SEARCH, LASTFM_SEARCH, SC_SEARCH
}
from './../storage/storage';

import HelpBox from './../tui/help-box';
import * as leftPane from './media-browser-ctrl';
import * as rightPane from './playlist-ctrl';

import * as player from './../player/player-control';
//import playlist from './../storage/playlist';

export default (screen, layout) => {
  leftPane.init(screen, layout.mediaTree, layout.qsearch);
  rightPane.init(screen, layout);

  layout.logger.error = (msg, ...args) => {
    args.splice(0, 0, '{red-fg}' + msg + '{/red-fg}');

    layout.logger.log.apply(layout.logger, args);
  };
  global.Logger.screen = layout.logger;

  storage.emit(FOCUS_RIGHT_PANE);

  storage.on(PAUSE, () => player.pause());
  storage.on(SHOW_HELP, () => HelpBox(screen));

  layout.qsearch.on('submit', () => {
    rightPane.search({ type: 'search', query: layout.qsearch.value });
    leftPane.search({ type: 'search', query: layout.qsearch.value });
  });

  // FIXME:
  layout.qsearch.setValue('yagya');
  layout.qsearch.emit('submit');
  layout.mediaTree.focus();

};
