export default (err) => {
  if (err) {
    Logger.error(err);
    Logger.screen.error(err);
  }
};
