import blessed from 'blessed';
import _ from 'lodash';
import storage from './../storage/storage';

export default (screen) => {
  var msg = blessed.message({
    parent: screen,
    border: 'line',
    height: 'shrink',
    width: 'half',
    top: 'center',
    left: 'center',
    label: 'Help',
    tags: true,
    keys: true,
    hidden: true,
    vi: true
  });

  var lines = [];
  var addHotkey = (key, description) => {
    lines.push(_.padRight(key, 8) + '{yellow-fg}' + description + '{/yellow-fg}');
  };

  addHotkey('enter', 'play');
  addHotkey('space', 'play/pause');
  addHotkey('s', 'stop');
  addHotkey('>', 'seek forward');
  addHotkey('<', 'seek backward');
  addHotkey('+', 'volume up');
  addHotkey('-', 'volume down');

  lines.push('');

  addHotkey('tab', 'switch focused pane');
  addHotkey('left', 'select media browser');
  addHotkey('right', 'select playlist');

  lines.push('');

  addHotkey('q, esc', 'exit');

  lines.push('');

  lines.push(`Config file: "${storage.path}"`);

  lines.push('');
  lines.push('{right}{green-fg}Press any key to hide this window{/green-fg}{/right}');

  msg.display(lines.join('\n'), 0, function(err) {
    global.Logger.error(err);
  });
};
