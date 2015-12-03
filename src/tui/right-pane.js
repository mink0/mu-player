import blessed from 'blessed';
import listStyle from './list-style';
import headerStyle from './header-style';

export default (parent) => {
  let box = blessed.list({
    ...listStyle,
    right: 0,
    width: '70%',
    bottom: 2,
    // style: {
    //   fg: '#fe8019'
    // },
    items: ['{bold}Loading{/bold}, please wait']
  });

  let h = blessed.text({
    ...headerStyle,
    //parent: box,
    top: 0,
    right: 0,
    height: 1,
    width: '70%',
    align: 'center',
    content: 'Playlist'
  });

  let hHover = blessed.text({
    ...headerStyle,
    //parent: parent,
    top: 0,
    right: 0,
    height: 1,
    width: '70%',
    align: 'center',
    content: 'Playlist',
    style: {
      fg: '#fffffe',
      bg: '#d65d0e',
    }
  });

  let qsearch = blessed.textbox({
    //parent: parent,
    top: 0,
    right: 0,
    height: 1,
    width: '35%',
    align: 'right',
    label: 'qsearch:',
    content: 'qsearch:',
    inputOnFocus: true,
    style: {
      fg: '#fffffe',
      bg: '#d65d0e',
      label: {
        bg: 'red'
      }
    }
  });

  //line.setText('Pla')
  parent.append(box);
  parent.append(h);
  parent.append(hHover);
  parent.append(qsearch);

  return {
    box,
    h,
    hHover,
    qsearch
  };
};
