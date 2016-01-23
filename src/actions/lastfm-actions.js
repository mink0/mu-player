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
    function(tracks, artists/*, albums*/) {
      menu.tracks = tracks.trackmatches.track;
      menu.artists = artists.artistmatches.artist;
      return handleData(menu);
    });
};

export let getSearchTrack = (query) => {
  Logger.screen.info(`last.fm`, `trackSearch("${query}")`);
  return lfm.trackAsync.searchAsync({
    track: query,
    limit: limit
  });
};

export let getSearchAlbum = (query) => {
  Logger.screen.info(`last.fm`, `albumSearch("${query}")`);
  return lfm.albumAsync.searchAsync({
    album: query,
    limit: limit
  });
};

export let getSearchArtist = (query) => {
  Logger.screen.info(`last.fm`, `artistSearch("${query}")`);
  return lfm.artistAsync.searchAsync({
    artist: query,
    limit: limit
  });
};

export let getTopTracks = (artist, limit=30) => {
  Logger.screen.info(`last.fm`, `topTracks("${artist}")`);
  return lfm.artistAsync.getTopTracksAsync({
    artist: artist,
    limit: limit
  });
};

export let getTopAlbums = (artist, limit=100) => {
  Logger.screen.info(`last.fm`, `topAlbums("${artist}")`);
  return lfm.artistAsync.getTopAlbumsAsync({
    artist: artist,
    limit: limit
  }).then((res) => {
    if (res.album.length === 0)
      throw new Error('Albums not found for "' + artist + '"');

    return res.album;
  });
};

export let getAlbumInfo = (artist, album) => {
  Logger.screen.info(`last.fm`, `getAlbumInfo("${artist}", "${album}")`);
  return lfm.albumAsync.getInfoAsync({
    artist: artist,
    album: album,
  }).then((res) => res.tracks.track);
};

export let getSimilar = (artist) => {
  Logger.screen.info(`last.fm`, `getSimilar("${artist}")`);
  return lfm.artistAsync.getSimilarAsync({
    artist: artist,
    //limit: 50
  }).then((res) => {
    if (res.artist.length === 0)
      throw new Error('Similar artists not found for "' + artist + '"');

    return res.artist;
  });
};

export let getSearchTag = (query) => {
  Logger.screen.info(`last.fm`, `tagSearch("${query}")`);
  return lfm.tagAsync.searchAsync({
    tag: query,
    limit: limit
  });
};
