import Promise from 'bluebird';
import storage from '../storage/storage';

let sc = require('node-soundcloud');
sc = Promise.promisifyAll(sc);

sc.init({
  id: storage.data.scClientId,
  secret: storage.data.scSecret,
  //uri: 'your SoundCloud redirect URI'
});

const SEARCH_LIMIT = 200;
const NOTFOUND = 'SC:NotFound';

let handleData = (result) => {
  if (!Array.isArray(result) || result.length === 0) throw new Error(NOTFOUND);

  return result.filter(obj => obj.stream_url && obj.title).map(obj => {
    obj.source = 'sc';
    if (obj.title.indexOf('-') !== -1) {
      obj.artist = obj.title.split('-')[0];
      obj.title = obj.title.substring(obj.title.indexOf('-') + 1);
    } else {
      obj.artist = obj.user.username.replace(/&amp;/g, '&');
      obj.title = obj.title.replace(/&amp;/g, '&');
    }
    obj.artist = obj.artist.trim();
    obj.title = obj.title.trim();
    obj.url = obj.stream_url + '?client_id=' + storage.data.scClientId;
    // obj.url = function() {
    //   return  req.getAsync({ url: obj.stream_url + '?client_id=' + storage.data.scClientId,
    //     json: true,
    //     followRedirect: false
    //   }).then((res) => res[1].location.replace(/^https:\/\//i, 'http://'));
    // };
    obj.duration = parseInt(obj.duration / 1000);
    obj.bitrate = 128; // fixed for all sc tracks
    return obj;
  });
};

export let getSearch = (query, opts={}) => {
  Logger.screen.info('soundcloud', `audio.search("${query}")`);

  let limit = opts.limit || SEARCH_LIMIT;
  let offset = opts.offset || 0;
  let tryTimeout = opts.tryTimeout || storage.data.search.timeout;
  let tryAttempts = opts.tryAttempts || storage.data.search.retries;
  let tryCounter = 0;

  let queryOpts = {
    limit: limit,
    offset: offset * limit,
    q: query,
  };

  return new Promise((resolve, reject) => {
    let localError = (err) => {
      if (tryCounter++ >= tryAttempts || err.message === NOTFOUND) return reject(err);

      Logger.screen.info('soundcloud', `retrying audio.search(${query}) ...${tryCounter} of ${tryAttempts}`);
      doSearch();
    };

    let done = (result) => {
      if (!result) return localError(new Error('Unknown answer: ' + result));

      resolve(Promise.resolve(handleData(result)));
    };

    let doSearch = () => {
      sc.getAsync('/tracks', queryOpts)
        .timeout(tryTimeout)
           .then((res) => done(res))
              .catch((err) => localError(err));
    };

    doSearch();
  });
};

export let getSearchOld = (query, opts={}) => {
  Logger.screen.info(`soundcloud`, `search("${query}")`);
  opts.limit = opts.limit || SEARCH_LIMIT;
  opts.offset = opts.offset || 0;

  let queryOpts = { limit: opts.limit, offset: opts.offset, q: query };
  let request = sc.getAsync('/tracks', queryOpts);

  return request.then(response => handleData(response));
};

export let getSearchWithArtist = (track, artist, opts) => {
  let query = artist + ' ' + track;
  return getSearch(query, opts).then((tracks) => {
    return tracks.filter((obj) => {
      return (obj.title.toLowerCase().indexOf(track.toLowerCase()) !== -1 &&
        (obj.title.toLowerCase().indexOf(artist.toLowerCase()) !== -1 ||
          obj.user.username.toLowerCase().indexOf(artist.toLowerCase()) !== -1));
    });
  });
};

