import blessed from 'blessed';
import _ from 'lodash';
import Promise from 'bluebird';
import * as lfmActions from './../actions/lastfm-actions';

export default (screen_name, artist) => {
  var layout = blessed.box({
    parent: screen,
    label: 'Choose Artist',
    top: 'center',
    left: 'center',
    width: '50%',
    height: '50%',
    tags: true,
    border: {
      type: 'line'
    }
  });

  var list = blessed.list({
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
  });

  let clean = () => {
    layout.destroy();
    screen.blockEsc = false;
  };

  screen.blockEsc = true;
  list.key(['escape'], () => {
    clean();
  });

  layout.append(list);
  list.focus();
  screen.render();

  lfmActions.getSimilar(artist).then((artists) => {
    global.Logger.screen.log('{green-fg}Found {/green-fg}' + artists.artist.length +
      ' similar artists for ' + artist);
    list.setItems(_.pluck(artists.artist, 'name'));
    list.focus();
    screen.render();
  });

  return new Promise((resolve, reject) => {
    list.on('select', (selected, index) => {
      clean();
      resolve(selected.content);
    });
  });
};
