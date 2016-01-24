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

export let getTopAlbums = (artist, limit) => {
  Logger.screen.info(`last.fm`, `topAlbums("${artist}")`);
  return lfm.artistAsync.getTopAlbumsAsync({
    artist: artist,
    limit: limit
  }).then(res => res.album.filter(obj => obj.mbid));
};

export let getTopAlbumsWithInfo = (artist, limit) => {
  Logger.screen.info(`last.fm`, `topAlbums("${artist}")`);
  return lfm.artistAsync.getTopAlbumsAsync({
    artist: artist,
    limit: limit
  }).then((res) => {
    let albums = res.album.filter(obj => obj.mbid);
    
    let promises = [];
    albums.forEach((album) => {
      promises.push(getAlbumInfo({ mbid: album.mbid }));
    });

    return Promise.all(promises).then((data) => {
      return data.map((album) => {
        Logger.info(album);
        if (album.releasedate) album.name = album.releasedate + ' - ' + album.name;
        return album;
      });
    });
  });
};

export let getAlbumInfo = (opts) => {
  Logger.screen.info(`last.fm`, `getAlbumInfo("${opts.mbid}")`);
  return lfm.albumAsync.getInfoAsync({
    // artist: opts.artist,
    // album: opts.album,
    mbid: opts.mbid
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
