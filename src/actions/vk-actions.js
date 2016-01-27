import * as vk from 'vk-universal-api';
import errorHandler from '../helpers/error-handler';
import Promise from 'bluebird';
import storage from '../storage/storage';

const SEARCH_LIMIT = 1000;

let handleData = (result) => {
  return result.filter(obj => obj.artist && obj.title).map(obj => {
    obj.source = 'vk';
    obj.artist = obj.artist.replace(/&amp;/g, '&').trim();
    obj.title = obj.title.replace(/&amp;/g, '&').trim();

    return obj;
  });
};

export let getSearch = (query, opts={}) => {
  if (!opts.quite) Logger.screen.info('vk.com', `audio.search("${query}")`);

  let limit = opts.limit || SEARCH_LIMIT;
  let offset = opts.offset || 0;
  let tryTimeout = opts.tryTimeout || storage.data.search.timeout;
  let tryAttempts = opts.tryAttempts || storage.data.search.retries;
  let tryCounter = 0;

  let queryOpts = {
    count: limit,
    offset: offset * limit,
    q: query,
    sort: 2
  };

  return new Promise((resolve, reject) => {
    let localError = (err) => {
      if (tryCounter++ >= tryAttempts) return reject(err);

      Logger.screen.info('vk.com', `retrying audio.search(${query}) ...${tryCounter} of ${tryAttempts}`);
      doSearch();
    };

    let done = (result) => {
      if (!result || !result.items) return localError(new Error('Unknown answer: ' + result));

      resolve(Promise.resolve(handleData(result.items)));
    };

    let doSearch = () => {
      vk.method('audio.search', queryOpts)
        .timeout(tryTimeout)
           .then((res) => done(res))
              .catch((err) => localError(err));
    };

    doSearch();
  });

  // let request = vk.method('audio.search', queryOpts);
  // return request.then(response => handleData(response.items));
};

export let getOldSearch = (query, opts={}) => {
  Logger.screen.info('vk.com', `audio.search("${query}")`);

  let limit = opts.limit || SEARCH_LIMIT;
  let offset = opts.offset || 0;

  let queryOpts = {
    count: limit,
    offset: offset * limit,
    q: query,
    sort: 2
  };

  let request = vk.method('audio.search', queryOpts);
  return request.then(response => handleData(response.items));
};


export let getSearchWithArtist = (track, artist, opts) => {
  Logger.screen.info('vk.com', `audio.search("${track}", "${artist}")`);
  let query = artist + ' ' + track;
  opts.quite = true;
  return getSearch(query, opts);
};

export let getSearchWithArtistExact = (track, artist) => {
  // TODO: need to fetch ALL results using pagination
  Logger.screen.info('vk.com', `audio.search("${track}", "${artist}")`);
  let request = vk.method('audio.search', {
    count: SEARCH_LIMIT,
    offset: 0,
    performer_only: 1,
    q: artist
  });
  return request.then(response => {
    let items = [];
    response.items.forEach((item) => {
      if (item.title.toLowerCase().indexOf(track.toLowerCase()) !== -1) items.push(item);
    });

    // if (items.length === 0) {
    //   Logger.screen.error(`vk.com`, `not found "${artist}"-"${track}"`);
    //   throw new Error('NotFound');
    // }

    // Logger.screen.info('vk.com', 'found:', items.length, 'track(s)');

    return handleData(items);
  });
};
