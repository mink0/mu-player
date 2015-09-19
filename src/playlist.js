let playlist = [];
let current = 0;

export default {
  setPlaylist: (_playlist) => {
    playlist = _playlist;
  },
  getCurrent: () => playlist[current].url,
  getCurrentIndex: () => current,
  getNext: () => playlist[++current].url,
  moveNext: () => current++,
  setCurrent: (index) => {
    current = index
  }
};