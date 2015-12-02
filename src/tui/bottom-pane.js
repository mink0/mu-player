import blessed from 'blessed';
import style from './list-style';

export default (parent) => {
  let logger = blessed.log({
    ...style,
      top: '100%-2',
      left: '0',
      width: '100%',
      height: 2,
      style: {
        fg: '#928374',
        bg: '#000000',
      },
      items: ['Loading']
  });

  parent.append(logger);

  logger.log('Logger initialized');

  return {
    logger: logger
  };
};
