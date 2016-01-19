import blessed from 'blessed';

export default (screen, message, lockKeys = true, label = 'Loading') => {
  let spinner = blessed.loading({
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

  spinner.load(message);

  screen.lockKeys = lockKeys;
  screen.blockEsc = true;

  let clear = () => {
    screen.blockEsc = false;
    screen.lockKeys = false;
    screen.unkey(['escape'], stop);
  };

  let stop = ()  => {
    clear();
    spinner.destroy();
  };

  screen.key(['escape'], stop);

  // HACK: on spinner stop
  spinner.on('hide', () => {
    clear();
  });

  return spinner;
};
