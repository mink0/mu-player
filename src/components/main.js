import storage, {
  PAUSE, SHOW_HELP, SWITCH_PANE, FOCUS_LEFT_PANE, FOCUS_RIGHT_PANE, SEARCH_VK, LASTFM_SEARCH
}
from './../storage';

import HelpBox from './../tui/help-box';
import LeftMenu from './lastfm-browser.js';
import RightMenu from './right-menu';

import * as player from './../player/player-control';
import playlist from './../playlist';

export default (screen, layout) => {
  LeftMenu(screen, layout.mediaTree);
  RightMenu(screen, layout.playlist);

  global.Logger.bottom = layout.logger;

  storage.emit(FOCUS_RIGHT_PANE);

  storage.on(PAUSE, () => player.pause());
  storage.on(SHOW_HELP, () => HelpBox(screen));

  //layout.qsearch.focus();
  // FIXME:
  layout.qsearch.setValue('murcof');
  layout.mediaTree.focus();

  storage.emit(SEARCH_VK, { type: 'search', query: layout.qsearch.value });
  storage.emit(LASTFM_SEARCH, { type: 'search', query: layout.qsearch.value });

  layout.qsearch.on('submit', () => {
    storage.emit(SEARCH_VK, { type: 'search', query: layout.qsearch.value });
    storage.emit(LASTFM_SEARCH, { type: 'search', query: layout.qsearch.value });
  });
};
