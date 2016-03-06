import storage, { PAUSE, SHOW_HELP } from './../storage/storage';

import HelpBox from './../tui/help-box';
import * as leftPane from './media-browser-ctrl';
import * as rightPane from './playlist-ctrl';
import * as player from './../player/player-control';
import * as qsearch from './qsearch';

export default (screen, layout) => {
  layout.logger.error = (msg, ...args) => {
    args.splice(0, 0, '{red-fg}' + msg + '{/red-fg}');

    layout.logger.log.apply(layout.logger, args);
  };

  layout.logger.info = (msg, ...args) => {
    args.splice(0, 0, '{cyan-fg}' + msg + '{/cyan-fg}');

    layout.logger.log.apply(layout.logger, args);
  };

  layout.logger.status = (msg, ...args) => {
    args.splice(0, 0, '{green-fg}' + msg + '{/green-fg}');

    layout.logger.log.apply(layout.logger, args);
  };

  // logger should be first
  Logger.screen = layout.logger;
  leftPane.init(screen, layout.mediaTree, layout.qsearch);
  rightPane.init(screen, layout);
  qsearch.init(screen, layout);

  storage.on(PAUSE, () => player.pause());
  storage.on(SHOW_HELP, () => HelpBox(screen));
};
