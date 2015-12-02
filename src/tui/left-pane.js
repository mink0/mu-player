import blessed from 'blessed';
import style from './list-style';

export default (parent) => {
  let box = blessed.list({
    ...style,
    left: '0',
    width: '30%',
    bottom: 2,
    items: ['Loading']
  });

  let line = blessed.line({
    parent: parent,
    type: 'line',
    orientation: 'horizontal',
    left: 1,
    width: '30%-3',
    top: 0,
    style: {
      fg: '#fb4934'
    }
  });

  parent.append(box);

  return {
    box,
    line
  };
};
