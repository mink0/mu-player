export default (err) => {
  if (err) {
    global.Logger.error(err);
    global.Logger.screen.error(err);
  }
};
