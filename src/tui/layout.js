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
        fg: 'magenta'
      },
      fg: 'white',
      bg: 'brown',
    },
  };

  let playlistBoxOpts = {
    label: 'Playlist',
    style: {
      border: {
        fg: 'magenta'
      },
      fg: 'white',
      bg: 'brown',
    },
  };

  let loggerOpts = {
    label: 'Logger',
    inputOnFocus: true,
    style: {
      border: {
        fg: 'magenta'
      },
      fg: 'white',
      bg: 'brown',
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
        fg: 'magenta'
      },
    }
  };

  let playlistOpts = {
    top: 0,
    tags: true,
    width: '98%',
    //border: 'line',
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
      fg: 'red'
    },
    style: {
      bg: 'brown',
      fg: 'white',
      selected: {
        fg: 'yellow',
        bg: 'magenta'
      }
    }
  };

  let mediaTreeOpts = {
    top: 0,
    tags: true,
    padding: {
      left: 1,
      right: 1
    },
    input: true,
    // scrollable: true,
    // keys: true,
    vi: true,
    mouse: true,
    template: {
      //lines: false,
      spaces: true
    },
    scrollbar: {
      ch: ' ',
      inverse: true,
      fg: 'yellow'
    },
    style: {
      fg: 'cyan',
      selected: {
        fg: 'white',
        bg: 'cyan'
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

  return layout;
};
