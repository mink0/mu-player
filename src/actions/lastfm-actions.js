import LastfmAPI from 'lastfmapi';
import storage from './../storage/storage';

import Promise from 'bluebird';

export let lfm = new LastfmAPI({
  api_key: storage.data.lfmApiKey,
  secret: storage.data.lfmSecret
});

lfm.trackAsync = Promise.promisifyAll(lfm.track);
lfm.albumAsync = Promise.promisifyAll(lfm.album);
lfm.artistAsync = Promise.promisifyAll(lfm.artist);
lfm.tagAsync = Promise.promisifyAll(lfm.tag);

let limit = 10;

let handleData = (result) => {
  return result;
};

export let getSearch = (query) => {
  let menu = {};
  return Promise.join(
    getSearchTrack(query),
    getSearchArtist(query),
    function(tracks, artists /*, artists/*, tags*/) {
      menu.tracks = tracks.trackmatches.track;
      menu.artists = artists.artistmatches.artist;
      return handleData(menu);
    });
};

export let getSearchTrack = (query) => {
  global.Logger.screen.info(`last.fm`, `trackSearch("${query}")`);
  return lfm.trackAsync.searchAsync({
    track: query,
    limit: limit
  });
};

export let getSearchAlbum = (query) => {
  global.Logger.screen.info(`last.fm`, `albumSearch("${query}")`);
  return lfm.albumAsync.searchAsync({
    album: query,
    limit: limit
  });
};

export let getSearchArtist = (query) => {
  global.Logger.screen.info(`last.fm`, `artistSearch("${query}")`);
  return lfm.artistAsync.searchAsync({
    artist: query,
    limit: limit
  });
};

export let getTopTracks = (artist) => {
  global.Logger.screen.info(`last.fm`, `topTracks("${artist}")`);
  return lfm.artistAsync.getTopTracksAsync({
    artist: artist,
    limit: 30
  });
};

export let getSimilar = (artist) => {
  global.Logger.screen.info(`last.fm`, `getSimilar("${artist}")`);
  return lfm.artistAsync.getSimilarAsync({
    artist: artist,
    //limit: 50
  });
};

export let getSearchTag = (query) => {
  global.Logger.screen.info(`last.fm`, `tagSearch("${query}")`);
  return lfm.tagAsync.searchAsync({
    tag: query,
    limit: limit
  });
};
