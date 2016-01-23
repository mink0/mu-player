import storage from './../storage/storage';
import Promise from 'bluebird';

let sc = require('node-soundcloud');
sc = Promise.promisifyAll(sc);

sc.init({
  id: storage.data.scClientId,
  secret: storage.data.scSecret,
  //uri: 'your SoundCloud redirect URI'
});

const SEARCH_LIMIT = 200;

let handleData = (result) => {
  if (!Array.isArray(result)) return [];

  return result.filter(obj => obj.stream_url && obj.title).map(obj => {
    obj.source = 'sc';
    if (obj.title.indexOf('-') !== -1) {
      obj.artist = obj.title.split('-')[0].trim();
      obj.title = obj.title.substring(obj.title.indexOf('-') + 1).trim();
    } else {
      obj.artist = obj.user.username.replace(/&amp;/g, '&');
      obj.title = obj.title.replace(/&amp;/g, '&');
    }
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
  Logger.screen.info(`soundcloud`, `search("${query}")`);
  opts.limit = opts.limit || SEARCH_LIMIT;
  opts.offset = opts.offset || 0;

  let queryOpts = { limit: opts.limit, offset: opts.offset, q: query };
  let request = sc.getAsync('/tracks', queryOpts);

  return request.then(response => handleData(response));
};

export let getSearchWithArtist = (track, artist, opts) => {
  Logger.screen.info(`soundcloud`, `search("${track}", "${artist}")`);
  let query = artist + ' ' + track;
  return getSearch(query, opts).then((tracks) => {
    return tracks.filter((obj) => {
      return (obj.title.toLowerCase().indexOf(track.toLowerCase()) !== -1 &&
        (obj.title.toLowerCase().indexOf(artist.toLowerCase()) !== -1 ||
          obj.user.username.toLowerCase().indexOf(artist.toLowerCase()) !== -1));
    });
  });
};

