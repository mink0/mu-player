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
  screen.onceKey(['escape'], () => {
    screen.blockEsc = false;
    screen.lockKeys = false;
    loading.stop();
  });

  return loading;
};
