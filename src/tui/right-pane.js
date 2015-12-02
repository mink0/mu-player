import blessed from 'blessed';
import style from './list-style';

export default (parent) => {
  let box = blessed.list({
    ...style,
    right: '0',
    width: '70%',
    bottom: 2,
    // style: {
    //   fg: '#fe8019'
    // },
    items: ['{bold}Loading{/bold}, please wait']
  });

  let line = blessed.line({
    parent: parent,
    type: 'line',
    orientation: 'horizontal',
    left: '30%+1',
    width: '70%-3',
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
