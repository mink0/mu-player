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
//lfm.userAsync = Promise.promisifyAll(lfm.user);

let limit = 10;

let handleData = (result) => {
  return result;
};

export let getSearch = (query) => {
  Logger.screen.info(`last.fm`, `search("${query}")`);
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

export let getTagSearch = (query) => {
  Logger.screen.info(`last.fm`, `tagSearch("${query}")`);
  let menu = {};

  // lfm.tag.getTopTracks({ tag: 'Disco' }, (err, topTracks) => {
  //   if (err) Logger.info(err);

  //   Logger.info('result', topTracks);
  // });



  return Promise.join(
    getTracksByTag(query),
    getArtistsByTag(query),
    function(tracks, artists /*, albums*/ ) {
      Logger.info(query, tracks);

      menu.tracks = tracks.toptracks.track;
      //menu.artists = artists.topartists.artist;
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
  }).then((res) => {
    let out = res.track.filter(obj => obj.name);
    if (out.length === 0) throw new Error('No tracks found for ' + artist);

    return out;
  });
};

export let getTopAlbums = (artist, limit) => {
  Logger.screen.info(`last.fm`, `topAlbums("${artist}")`);
  return lfm.artistAsync.getTopAlbumsAsync({
    artist: artist,
    limit: limit
  }).then((res) => {
    let out = res.album.filter(obj => obj.mbid);
    if (out.length === 0) throw new Error('No albums found for ' + artist);

    return out;
  });
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
  }).then((res) => {
    Logger.info(res);
    return res.tracks.track;
  });
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

export let getTracksByTag = (query, limit=10) => {
  Logger.screen.info(`last.fm`, `getTracksByTag("${query}")`);
  return lfm.tagAsync.getTopTracksAsync({
    tag: query,
    limit: limit
  });
};

export let getArtistsByTag = (query, limit=10) => {
  Logger.screen.info(`last.fm`, `getArtistsByTag("${query}")`);
  return lfm.tagAsync.getTopArtistsAsync({
    tag: query,
    limit: limit
  });
};

export let getUserFavs = () => {
  Logger.screen.info(`last.fm`, `getLoved()`);
  return lfm.userAsync.getLovedTracksAsync({
    user: 'minkolazer',
    limit: limit
  });
};
