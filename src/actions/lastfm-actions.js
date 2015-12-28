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
  // Logger.screen.log(`last.fm search("${query}")`);
  let menu = {};
  return Promise.join(
    getSearchTrack(query),
    getSearchArtist(query),
    //getSearchAlbum(query),
    //getSearchTag(query),
    function(tracks, artists /*, artists/*, tags*/) {
      menu.tracks = tracks.trackmatches.track;
      menu.artists = artists.artistmatches.artist;
      //menu.albums = albums.albummatches.album;
      //menu.tags = tags.tagmatches.tag;
      return handleData(menu);
    });
};

export let getSearchTrack = (query) => {
  Logger.screen.log(`last.fm trackSearch("${query}")`);
  return lfm.trackAsync.searchAsync({
    track: query,
    limit: limit
  });
};

export let getSearchAlbum = (query) => {
  Logger.screen.log(`last.fm albumSearch("${query}")`);
  return lfm.albumAsync.searchAsync({
    album: query,
    limit: limit
  });
};

export let getSearchArtist = (query) => {
  Logger.screen.log(`last.fm artistSearch("${query}")`);
  return lfm.artistAsync.searchAsync({
    artist: query,
    limit: limit
  });
};

export let getTopTracks = (artist) => {
  Logger.screen.log(`last.fm topTracks("${artist}")`);
  return lfm.artistAsync.getTopTracksAsync({
    artist: artist,
    limit: 30
  });
};

export let getSimilar = (artist) => {
  Logger.screen.log(`last.fm getSimilar("${artist}")`);
  return lfm.artistAsync.getSimilarAsync({
    artist: artist,
    //limit: 50
  });
};

export let getSearchTag = (query) => {
  Logger.screen.log(`last.fm tagSearch("${query}")`);
  return lfm.tagAsync.searchAsync({
    tag: query,
    limit: limit
  });
};
