import autocomplete from '../tui/autocomplete';
import storage, { PAUSE, SHOW_HELP } from '../storage/storage';
import * as leftPane from './media-browser-ctrl';
import * as rightPane from './playlist-ctrl';
import * as lfm from '../actions/lastfm-actions';

let screen = null;
let layout = null;
let qsearch = null;

export let init = (_screen, _layout) => {
  screen = _screen;
  layout = _layout;
  qsearch = layout.qsearch;

  qsearch.on('submit', () => {
    let type = 'search';
    let query = qsearch.value.trim();

    if (query[0] === '#') {
      type = 'tagsearch';
      query = query.slice(1);
    }

    rightPane.search({ type: type, query: query });
    leftPane.search({ type: type, query: query });
  });

  qsearch.source = source;

  qsearch.setValue(storage.data.lastQuery || 'The Beatles');
  qsearch.emit('submit');
};

let source = (text, cb) => {
  let len = storage.data.qsearch.maxitems;
  let out = [];

  lfm.getSearch(text, len).then((data) => {
    if (data.artists) {
      data.artists.forEach((artist) => {
        out.push(artist.name);
      });
    }

    if (data.tracks) {
      data.tracks.forEach((track) => {
        out.push(track.name);
      });
    }

    cb(null, out.slice(0, len).reverse());
  });
};

