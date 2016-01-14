import blessed from 'blessed';

import treeWidget from './tree-widget';
import playInfo from './play-info-widget';

export default (screen) => {
  let layout = {};

  /**
   * Main wrappers
   */

  layout.bg = blessed.box({
    height: '100%-1',
    width: '100%',
    style: {
      border: {
        fg: 'brightblack'
      }
    },
  });

  layout.leftPane = blessed.box({
    left: 0,
    width: '40%+1',
    style: {
      border: {
        fg: 'brightblack'
      }
    },
  });

  layout.rightPane = blessed.box({
    right: 0,
    width: '60%',
    style: {
      border: {
        fg: 'brightblack'
      }
    },
  });

  /**
   * Left pane
   */

  layout.mediaTree = treeWidget({
    height: '80%+1',
    label: 'Media',
    border: 'line',
    tags: true,
    // input: true,
    // vi: true,
    // mouse: true,
    template: {
      spaces: true
    },
    scrollbar: {
      ch: ' ',
      inverse: true,
      fg: 'gray'
    },
    style: {
      fg: 'white',
      border: {
        fg: 'brightblack'
      },
      selected: {
        fg: 'ligthwhite'
      }
    }
  });

  layout.logger = blessed.log({
    bottom: 0,
    height: '20%',
    label: 'Log',
    border: 'line',
    inputOnFocus: true,
    tags: true,
    input: true,
    scrollable: true,
    keys: true,
    vi: true,
    mouse: true,
    style: {
      border: {
        fg: 'brightblack'
      }
    },
  });

  /**
   * Right pane
   */

  layout.plistCount = blessed.box({
    top: -1,
    width: 'shrink',
    right: 1,
    height: 1,
    tags: true
  });

  // blessed bug - slow render with label forced me to do this workaround
  layout.plistLabel = blessed.box({
    top: -1,
    width: 'shrink',
    left: 0,
    height: 1,
    content: 'Playlist'
  });

  layout.playlist = blessed.list({
    height: '100%-2',
    tags: true,
    // label: 'Playlist', // blessed bug - slow render with label
    border: 'line',
    padding: {
      left: 1,
    },
    input: true,
    scrollable: true,
    keys: true,
    vi: true,
    mouse: true,
    scrollbar: {
      ch: ' ',
      inverse: true,
      fg: 'gray'
    },
    style: {
      fg: 'white',
      border: {
        fg: 'brightblack'
      },
      selected: {
        //bg: 'yellow',
        fg: 'ligthwhite'
      }
    }
  });

  layout.playInfo = playInfo({
    bottom: 0,
    height: 3,
    border: 'line',
    tags: true,
    style: {
      border: {
        fg: 'brightblack'
      }
    }
  });

  /**
   * Footer
   */

  layout.qprefix = blessed.box({
    bottom: 0,
    left: 0,
    height: 1,
    width: 1,
    content: '>',
  });

  layout.qsearch = blessed.textbox({
    bottom: 0,
    left: 2,
    height: 1,
    width: '100%',
    align: 'left',
    inputOnFocus: true,
    style: {
      bold: true,
      border: {
        fg: 'brightblack'
      },
    }
  });

  // main wrappers
  screen.append(layout.bg);
  layout.bg.append(layout.leftPane);
  layout.bg.append(layout.rightPane);

  // left pane  
  layout.leftPane.append(layout.mediaTree);
  layout.leftPane.append(layout.logger);

  // right pane
  layout.rightPane.append(layout.playlist);
  layout.rightPane.append(layout.playInfo);
  layout.playlist.append(layout.plistCount);
  layout.playlist.append(layout.plistLabel);

  // footer
  screen.append(layout.qprefix);
  screen.append(layout.qsearch);



  // layout.mediaBrowserBox = grid.set(0, 0, 80, 40, blessed.box, mediaBrowserBoxOpts);
  // layout.playlistBox = grid.set(0, 40, 100, 60, blessed.box, playlistBoxOpts);
  // layout.logger = grid.set(80, 0, 20, 40, blessed.log, loggerOpts);
  // layout.playInfo = grid.set(92, 40, 8, 60, playInfo, playInfoOpts);
  // layout.playInfo.hide();

  // layout.qprefix = blessed.box(qprefixOpts);
  // layout.qsearch = blessed.textbox(qsearchOpts);
  
  // layout.playlist = blessed.list(playlistOpts);
  // layout.plistCount = blessed.box(plistCountOpts);
  // layout.playlistBox.append(layout.playlist);
  // layout.playlistBox.append(layout.plistCount);

  // layout.mediaTree = treeWidget(mediaTreeOpts);
  // layout.mediaBrowserBox.append(layout.mediaTree);


  // screen.append(layout.qprefix);
  // screen.append(layout.qsearch);

  // Focus events:
  layout.playlist.on('focus', () => layout.playlist.style.selected.bg = 'yellow');
  layout.playlist.on('blur', () => layout.playlist.style.selected.bg = 'default');

  layout.mediaTree.rows.on('focus', () => layout.mediaTree.rows.style.selected.bg = 'yellow');
  layout.mediaTree.rows.on('blur', () => layout.mediaTree.rows.style.selected.bg = 'default');

  layout.qsearch.on('focus', () => {
    layout.qsearch.style.fg = 'brightyellow';
    layout.qsearch.setValue(layout.qsearch.value.trim());
  });
  layout.qsearch.on('blur', () => layout.qsearch.style.fg = 'brightwhite');

  return layout;
};
