import storage, {
  OPEN_VK, PAUSE, SHOW_HELP, SWITCH_PANE, FOCUS_LEFT_PANE, FOCUS_RIGHT_PANE, VK_SEARCH, LASTFM_SEARCH, SC_SEARCH
}
from './../storage';

import HelpBox from './../tui/help-box';
import * as leftPane from './lastfm-browser';
import * as rightPane from './playlist';

import * as player from './../player/player-control';
import playlist from './../playlist-service';

export default (screen, layout) => {
  leftPane.init(screen, layout.mediaTree);
  rightPane.init(screen, layout.playlist);

  global.Logger.bottom = layout.logger;

  storage.emit(FOCUS_RIGHT_PANE);

  storage.on(PAUSE, () => player.pause());
  storage.on(SHOW_HELP, () => HelpBox(screen));

  //FIXME:
  storage.on(VK_SEARCH, (data) => {
    storage.emit(OPEN_VK, {
      type: 'search',
      query: data.query
    })
  });

  //layout.qsearch.focus();
  // FIXME:
  layout.qsearch.setValue('murcof');
  layout.mediaTree.focus();

  storage.emit(LASTFM_SEARCH, {
    type: 'search',
    query: layout.qsearch.value
  });
  storage.emit(VK_SEARCH, {
    type: 'search',
    query: layout.qsearch.value
  });
  storage.emit(SC_SEARCH, {
    type: 'search',
    query: layout.qsearch.value
  });

  layout.qsearch.on('submit', () => {
    storage.emit(VK_SEARCH, {
      type: 'search',
      query: layout.qsearch.value
    });
    storage.emit(LASTFM_SEARCH, {
      type: 'search',
      query: layout.qsearch.value
    });
    storage.emit(SC_SEARCH, {
      type: 'search',
      query: layout.qsearch.value
    });
  });
};
