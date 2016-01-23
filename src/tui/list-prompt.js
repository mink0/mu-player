import blessed from 'blessed';
import _ from 'lodash';
import Promise from 'bluebird';
import * as lfmActions from './../actions/lastfm-actions';
import errorHandler from '../helpers/error-handler';

export default (screen, items, displayProp, label) => {
  let layout;
  let list;

  let layoutOpts = {
    parent: screen,
    top: 'center',
    left: 'center',
    width: '50%',
    height: '50%',
    content: 'Loading...',
    tags: true,
    label: label,
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
  list.key(['pageup'], () => {
    list.up(list.height);
    screen.render();
  });
  list.key(['pagedown'], () => {
    list.down(list.height);
    screen.render();
  });

  list.setItems(_.pluck(items, displayProp));
  layout = blessed.box(layoutOpts);
  layout.append(list);
  screen.saveFocus();
  list.focus();
  screen.render();

  return new Promise((resolve, reject) => {
    list.on('select', (selected, index) => {
      clear();
      resolve(items[index]);
    });
  });
};
