import blessed from 'blessed';
import contrib from 'blessed-contrib';

import treeWidget from './tree-widget';
import playInfo from './play-info-widget';

export default (screen) => {
  let grid = new contrib.grid({
    rows: 100,
    cols: 100,
    screen: screen
  });

  let mediaBrowserBoxOpts = {
    label: 'Media',
    style: {
      border: {
        fg: 'brightblack'
      }
    },
  };

  let playlistBoxOpts = {
    label: 'Playlist',
    style: {
      border: {
        fg: 'brightblack'
      }
    },
  };

  let loggerOpts = {
    label: 'Log',
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
  };

  let qprefixOpts = {
    bottom: 0,
    left: 0,
    height: 1,
    width: 1,
    content: '>',
  };

  let qsearchOpts = {
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
  };

  let playlistOpts = {
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
  };

  let mediaTreeOpts = {
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
      fg: 'white',
      selected: {
        fg: 'ligthwhite'
      }
    }
  };

  let playInfoOpts = {
    height: 3,
    tags: true,
    style: {
      border: {
        fg: 'brightblack'
      }
    }
  };

  let plistCountOpts = {
    top: -1,
    width: 'shrink',
    right: 1,
    height: 1,
    tags: true
  };


  let layout = {};

  layout.mediaBrowserBox = grid.set(0, 0, 80, 40, blessed.box, mediaBrowserBoxOpts);
  layout.playlistBox = grid.set(0, 40, 99, 60, blessed.box, playlistBoxOpts);
  layout.logger = grid.set(80, 0, 19, 40, blessed.log, loggerOpts);
  layout.playInfo = grid.set(92, 40, 8, 60, playInfo, playInfoOpts);
  layout.playInfo.hide();

  layout.qprefix = blessed.box(qprefixOpts);
  layout.qsearch = blessed.textbox(qsearchOpts);
  
  layout.playlist = blessed.list(playlistOpts);
  layout.plistCount = blessed.box(plistCountOpts);
  layout.playlistBox.append(layout.playlist);
  layout.playlistBox.append(layout.plistCount);

  layout.mediaTree = treeWidget(mediaTreeOpts);
  layout.mediaBrowserBox.append(layout.mediaTree);


  screen.append(layout.qprefix);
  screen.append(layout.qsearch);

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
