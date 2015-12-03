import blessed from 'blessed';

export default () => {
  let screen = blessed.screen({
    smartCSR: true,
    //useBCE: true,
    //docBorders: true,
    // cursor: {
    //   artififcal: true,
    //   blink: true,
    //   shape: 'underline'
    // },
    debug: true,
    log: '../../app.log',
    dump: true
  });

  return screen;
};
