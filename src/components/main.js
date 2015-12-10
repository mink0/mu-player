import storage, {
  PAUSE, SHOW_HELP, SWITCH_PANE, FOCUS_LEFT_PANE, FOCUS_RIGHT_PANE, SEARCH_VK, LASTFM_SEARCH
}
from './../storage';

import HelpBox from './../tui/help-box';
import LeftMenu from './lastfm-browser.js';
import RightMenu from './right-menu';

// let screen = null;
// let leftPane = null;
// let rightPane = null;
// let bottomPane = null;

import * as player from './../player/player-control';
import playlist from './../playlist';

export default (screen, layout) => {
  // leftPane = new LeftPane(screen);
  // rightPane = new RightPane(screen);
  // bottomPane = new BottomPane(screen);

  LeftMenu(screen, layout.mediaTree);
  RightMenu(screen, layout.playlist);

  global.Logger.bottom = layout.logger;

  storage.emit(FOCUS_RIGHT_PANE);

  storage.on(PAUSE, () => player.pause());
  storage.on(SHOW_HELP, () => HelpBox(screen));

  layout.qsearch.setValue('murcof');
  layout.mediaTree.focus();

  // FIXME:
  //layout.qsearch.submit();
  storage.emit(SEARCH_VK, { type: 'search', query: layout.qsearch.value });
  storage.emit(LASTFM_SEARCH, { type: 'search', query: layout.qsearch.value });

  layout.qsearch.on('submit', () => {
    storage.emit(SEARCH_VK, { type: 'search', query: layout.qsearch.value });
    storage.emit(LASTFM_SEARCH, { type: 'search', query: layout.qsearch.value });
  });

  storage.on(SWITCH_PANE, () => {
    layout.qsearch.focus();
  });

  let focusPane = (pane1, pane2) => {
    pane1.focus();
    pane1.style.selected.bg = 'yellow';
    pane2.style.selected.bg = 'default';

    if (pane1.rows) pane1.rows.style.selected.bg = 'yellow';
    if (pane2.rows) pane2.rows.style.selected.bg = 'default';

    screen.render();
  };

  // storage.on(SWITCH_PANE, () => {
  //   if (leftPane.hHover.hidden) {
  //     focusPane(leftPane, rightPane);
  //   } else {
  //     focusPane(rightPane, leftPane);
  //   }
  // });

  storage.on(FOCUS_LEFT_PANE, () => {
    focusPane(layout.mediaTree, layout.playlist);
  });

  storage.on(FOCUS_RIGHT_PANE, () => {
    focusPane(layout.playlist, layout.mediaTree);
  });
};
