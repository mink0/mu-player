import blessed from 'blessed';
import _ from 'lodash';
import Promise from 'bluebird';
import * as lfmActions from './../actions/lastfm-actions';

export default (screen, artist) => {
  let layout;
  let list;

  let layoutOpts = {
    parent: screen,
    label: 'Choose Artist',
    top: 'center',
    left: 'center',
    width: '50%',
    height: '50%',
    content: 'Loading...',
    tags: true,
    border: {
      type: 'line'
    }
  };

  let listOpts = {
    top: 0,
    tags: true,
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
      selected: {
        bg: 'yellow'
      }
    }
  };

  let clear = () => {
    layout.destroy();
    screen.blockEsc = false;
    screen.restoreFocus();
  };

  screen.blockEsc = true;
  list = blessed.list(listOpts);
  list.key(['escape', 'left', 'right', 'tab'], () => clear());

  lfmActions.getSimilar(artist).then((artists) => {
    global.Logger.screen.log('{green-fg}Found {/green-fg}' + artists.artist.length +
      ' similar artists for ' + artist);
    list.setItems(_.pluck(artists.artist, 'name'));
    layout = blessed.box(layoutOpts);
    layout.append(list);
    screen.saveFocus();
    list.focus();
    screen.render();
  });

  return new Promise((resolve, reject) => {
    list.on('select', (selected, index) => {
      clear();
      resolve(selected.content);
    });
  });
};
