import blessed from 'blessed';
import _ from 'lodash';
import Promise from 'bluebird';
import * as lfmActions from './../actions/lastfm-actions';

export default (screen, artist) => {
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
    //alwaysScroll: true,
    scrollbar: {
      ch: ' ',
      inverse: true,
      fg: 'gray'
    },
    style: {
      //bg: 'brightblack',
      selected: {
        bg: 'gray',
        fg: 'brightyellow'
      }
    }
  });

  screen.blockEsc = true;
  list.key(['escape'], () => {
    screen.remove(layout);
    screen.blockEsc = false;
    // screen.render();
  });

  layout.append(list);
  list.focus();

  list.on('action', () => screen.render());

  lfmActions.getSimilar(artist).then((artists) => {
    Logger.screen.log('Found ' + artists.artist.length + ' similar artists for ' + artist);
    list.setItems(_.pluck(artists.artist, 'name'));
    list.focus();
    screen.render();
  });

  screen.render();

  return new Promise((resolve, reject) => {
    list.on('select', (selected, index) => {
      screen.remove(layout);
      //screen.render();
      resolve(selected.content);
    });
  });
};
