import storage, { PAUSE, SHOW_HELP } from './../storage/storage';

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

  layout.logger.info = (msg, ...args) => {
    args.splice(0, 0, '{cyan-fg}' + msg + '{/cyan-fg}');

    layout.logger.log.apply(layout.logger, args);
  };

  layout.logger.status = (msg, ...args) => {
    args.splice(0, 0, '{green-fg}' + msg + '{/green-fg}');

    layout.logger.log.apply(layout.logger, args);
  };

  Logger.screen = layout.logger;

  storage.on(PAUSE, () => player.pause());
  storage.on(SHOW_HELP, () => HelpBox(screen));

  layout.qsearch.on('submit', () => {
    let type = 'search';
    let query = layout.qsearch.value.trim();

    if (query[0] === '#') {
      type = 'tagsearch';
      query = query.slice(1);
    }

    rightPane.search({ type: type, query: query });
    leftPane.search({ type: type, query: query });
  });

  layout.qsearch.setValue(storage.data.lastQuery || 'The Beatles');
  layout.qsearch.emit('submit');
};
