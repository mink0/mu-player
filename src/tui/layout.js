import blessed from 'blessed';
import contrib from 'blessed-contrib';

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
      bg: 'white',
      border: {
        fg: 'brightblack'
      }
    },
  });

  layout.leftPane = blessed.box({
    left: 0,
    width: '40%',
    style: {
      bg: 'yellow',
      border: {
        fg: 'brightblack'
      }
    },
  });

  layout.rightPane = blessed.box({
    right: 0,
    width: '60%',
    style: {
      bg: 'yellow',
      border: {
        fg: 'brightblack'
      }
    },
  });

  /**
   * Left pane
   */

  layout.mediaBrowserBox = blessed.box({
    height: '70%',
    label: 'Media',
    style: {
      bg: 'black',
      border: {
        fg: 'brightblack'
      }
    },
  });

  layout.mediaTree = treeWidget({
    top: 0,
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
      bg: 'green',
      fg: 'white',
      selected: {
        fg: 'ligthwhite'
      }
    }
  });

  layout.logger = blessed.log({
    bottom: 0,
    height: '30%',
    label: 'Log',
    inputOnFocus: true,
    tags: true,
    input: true,
    scrollable: true,
    keys: true,
    vi: true,
    mouse: true,
    style: {
      bg: 'magenta',
      border: {
        fg: 'brightblack'
      }
    },
  });

  /**
   * Right pane
   */

  layout.playlistBox = blessed.box({
    label: 'Playlist',
    style: {
      bg: 'cyan',
      border: {
        fg: 'brightblack'
      }
    },
  });

  layout.playlist = blessed.list({
    top: 0,
    left: 0,
    tags: true,
    width: '100%-2',
    padding: {
      left: 1,
      right: 1,
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
      selected: {
        //bg: 'yellow',
        fg: 'ligthwhite'
      }
    }
  });

  layout.playInfo = playInfo({
    height: 3,
    tags: true,
    style: {
      border: {
        fg: 'brightblack'
      }
    }
  });

  layout.plistCount = blessed.box({
    top: -1,
    width: 'shrink',
    right: 1,
    height: 1,
    tags: true
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
  layout.mediaBrowserBox.append(layout.mediaTree);
  layout.leftPane.append(layout.mediaBrowserBox);
  layout.leftPane.append(layout.logger);

  // right pane
  layout.playlistBox.append(layout.playlist);
  layout.rightPane.append(layout.playlistBox);
  
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
