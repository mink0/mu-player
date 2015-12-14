import blessed from 'blessed';
import contrib from 'blessed-contrib';

import treeWidget from './tree-widget.js';

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
    label: 'Logger',
    inputOnFocus: true,
    tags: true,
    style: {
      border: {
        fg: 'brightblack'
      },
      //fg: 'white'
    },
  };

  let qprefixOpts = {
    bottom: 0,
    left: 0,
    height: 1,
    width: 1,
    align: 'left',
    content: '>',
  };

  let qsearchOpts = {
    bottom: 0,
    left: 2,
    height: 1,
    width: '100%',
    align: 'left',
    //value: 'Ariel',
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
    tags: true,
    width: '98%',
    padding: {
      left: 1,
      right: 1
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
    //top: 0,
    tags: true,
    // padding: {
    //   left: 1,
    //   right: 1
    // },
    // input: true,
    // vi: true,
    // mouse: true,
    template: {
      spaces: true
    },
    scrollbar: {
      ch: ' ',
      inverse: true,
      fg: 'yellow'
    },
    style: {
      fg: 'white',
      selected: {
        //bg: 'yellow',
        fg: 'ligthwhite'
      }
    }
  };

  let layout = {};

  layout.mediaBrowserBox = grid.set(0, 0, 80, 40, blessed.box, mediaBrowserBoxOpts);
  layout.playlistBox = grid.set(0, 40, 99, 60, blessed.box, playlistBoxOpts);
  layout.logger = grid.set(80, 0, 19, 40, blessed.log, loggerOpts);
  layout.qprefix = blessed.box(qprefixOpts);
  layout.qsearch = blessed.textbox(qsearchOpts);
  layout.playlist = blessed.list(playlistOpts);
  layout.playlistBox.append(layout.playlist);
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
