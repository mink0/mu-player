import storage, {
  PAUSE, SHOW_HELP, SWITCH_PANE, FOCUS_LEFT_PANE, FOCUS_RIGHT_PANE, SEARCH_VK, LASTFM_SEARCH
}
from './../storage';

import HelpBox from './../tui/help-box';

//import LeftPane from './../tui/left-pane';
// import RightPane from './../tui/right-pane';
// import BottomPane from './../tui/bottom-pane.js';

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


  layout.qsearch.focus();
  
  // FIXME:
  //layout.qsearch.submit();
  //storage.emit(SEARCH_VK, layout.qsearch.value);
  storage.emit(LASTFM_SEARCH, { type: 'search', query: layout.qsearch.value });

  layout.qsearch.on('submit', () => {
    storage.emit(SEARCH_VK, layout.qsearch.value);
    storage.emit(LASTFM_SEARCH, layout.qsearch.value);
  });

  storage.on(SWITCH_PANE, () => {
    layout.qsearch.focus();
  });


  // let focusPane = (pane1, pane2) => {
  //   pane1.hHover.show();
  //   pane1.box.focus();
  //   screen.render();
   
  //   pane2.hHover.hide();
  //   screen.render();
  // };

  // storage.on(SWITCH_PANE, () => {
  //   if (leftPane.hHover.hidden) {
  //     focusPane(leftPane, rightPane);
  //   } else {
  //     focusPane(rightPane, leftPane);
  //   }
  // });

  // storage.on(FOCUS_LEFT_PANE, () => {
  //   focusPane(layout.leftPane, rightPane);
  //   //rightPane.qsearch.focus();
  // });

  // storage.on(FOCUS_RIGHT_PANE, () => {
  //   focusPane(rightPane, leftPane);
  // });
};
