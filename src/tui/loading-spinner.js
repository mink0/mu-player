import blessed from 'blessed';

export default (screen, message, lockKeys = true, label = 'Loading') => {
  var loading = blessed.loading({
    parent: screen,
    border: 'line',
    height: 'shrink',
    width: 'half',
    top: 'center',
    left: 'center',
    label: label,
    tags: true,
    keys: true,
    hidden: true,
    vi: true
  });

  loading.load(message);

  screen.lockKeys = lockKeys;

  screen.blockEsc = true;
  
  let clear = () => {
    screen.blockEsc = false;
    screen.lockKeys = false;
  };

  screen.onceKey(['escape', 'q'], () => {
    clear();
    loading.stop();
  });

  loading.on('hide', () => {
    clear();
  });

  return loading;
};
