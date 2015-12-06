import blessed from 'blessed';

export default () => {
  let screen = blessed.screen({
    smartCSR: true,
    //useBCE: true,
    docBorders: true,
    cursor: {
      artificial: true,
      shape: 'underline',
      blink: true,
      color: null // null for default
    },
    debug: true,
    //log: './app.log',
    //dump: true
  });

  return screen;
};
