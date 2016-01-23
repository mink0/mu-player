import blessed from 'blessed';

import treeWidget from './tree-widget';
import trackInfo from './track-info-widget';

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
    input: true,
    vi: true,
    mouse: true,
    scrollable: true,
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
    height: '100%',
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

  layout.trackInfo = trackInfo({
    bottom: 0,
    height: 3,
    border: 'line',
    tags: true,
    hidden: true,
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
    mouse: true,
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
  layout.rightPane.append(layout.trackInfo);
  layout.playlist.append(layout.plistCount);
  layout.playlist.append(layout.plistLabel);

  // footer
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

  // FIX: Hacky fix of overlaping playinfo and playlist
  layout.trackInfo.on('show', () => layout.playlist.height = '100%-2');
  layout.trackInfo.on('hide', () => layout.playlist.height = '100%');

  return layout;
};
