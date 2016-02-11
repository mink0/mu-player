import LastFmNode from 'lastfm';
import storage from './../storage/storage';

import Promise from 'bluebird';

export let lfm = new LastFmNode.LastFmNode({
  api_key: storage.data.lfmApiKey,
  secret: storage.data.lfmSecret
});

let handleData = (result) => {
  return result;
};

export let getSearch = (query) => {
  Logger.screen.info(`last.fm`, `search("${query}")`);
  let menu = {};

  return Promise.join(
    getSearchTrack(query),
    getSearchArtist(query),
    function(tracks, artists /*, albums*/ ) {
      menu.tracks = tracks.results.trackmatches.track;
      menu.artists = artists.results.artistmatches.artist;
      return handleData(menu);
    });
};

export let getTagSearch = (query) => {
  Logger.screen.info(`last.fm`, `tagSearch("${query}")`);
  let menu = {};

  return Promise.join(
    getTracksByTag(query),
    getArtistsByTag(query),
    function(tracks, artists) {
      menu.tracks = tracks.tracks.track;
      menu.tracks.forEach((track) => {
        track.artist = track.artist.name;
      });

      if (artists) menu.artists = artists.topartists.artist;
      return handleData(menu);
    });
};

export let getSearchTrack = (query, limit = 10) => {
  Logger.screen.info(`last.fm`, `trackSearch("${query}")`);
  return new Promise((resolve, reject) => {
    lfm.request('track.search', {
      track: query,
      limit: limit,
      handlers: {
        success: resolve,
        error: reject
      }
    });
  });
};

export let getSearchAlbum = (query, limit = 10) => {
  Logger.screen.info(`last.fm`, `albumSearch("${query}")`);
  return new Promise((resolve, reject) => {
    lfm.request('album.search', {
      album: query,
      limit: limit,
      handlers: {
        success: resolve,
        error: reject
      }
    });
  });
};

export let getSearchArtist = (query, limit = 10) => {
  Logger.screen.info(`last.fm`, `artistSearch("${query}")`);
  return new Promise((resolve, reject) => {
    lfm.request('artist.search', {
      artist: query,
      limit: limit,
      handlers: {
        success: resolve,
        error: reject
      }
    });
  });
};

export let getTopTracks = (artist, limit = 30) => {
  Logger.screen.info(`last.fm`, `topTracks("${artist}")`);
  return new Promise((resolve, reject) => {
    lfm.request('artist.getTopTracks', {
      artist: artist,
      limit: limit,
      handlers: {
        success: resolve,
        error: reject
      }
    });
  }).then((res) => {
    let out = res.toptracks.track.filter(obj => obj.name);
    if (out.length === 0) throw new Error('No tracks found for ' + artist);

    return out;
  });
};

export let getTopAlbums = (artist, limit = 100) => {
  Logger.screen.info(`last.fm`, `topAlbums("${artist}")`);
  return new Promise((resolve, reject) => {
    lfm.request('artist.getTopAlbums', {
      artist: artist,
      limit: limit,
      handlers: {
        success: resolve,
        error: reject
      }
    });
  }).then((res) => {
    let out = res.topalbums.album.filter(obj => obj.mbid);
    if (out.length === 0) throw new Error('No albums found for ' + artist);

    return out;
  });
};

export let getAlbumInfo = (opts) => {
  Logger.screen.info(`last.fm`, `getAlbumInfo("${opts.mbid}")`);
  return new Promise((resolve, reject) => {
    lfm.request('album.getInfo', {
      // artist: opts.artist,
      // album: opts.album,
      mbid: opts.mbid,
      handlers: {
        success: resolve,
        error: reject
      }
    });
  }).then((res) => {
    return res.album.tracks.track;
  });
};

export let getSimilar = (artist) => {
  Logger.screen.info(`last.fm`, `getSimilar("${artist}")`);
  return new Promise((resolve, reject) => {
    lfm.request('artist.getSimilar', {
      artist: artist,
      //limit: 50
      handlers: {
        success: resolve,
        error: reject
      }
    });
  }).then((res) => {
    if (res.similarartists.artist.length === 0)
      throw new Error('Similar artists not found for "' + artist + '"');

    return res.similarartists.artist;
  });
};

export let getTracksByTag = (tag, limit = 10) => {
  Logger.screen.info(`last.fm`, `getTracksByTag("${tag}")`);
  return new Promise((resolve, reject) => {
    lfm.request('tag.getTopTracks', {
      tag: tag,
      limit: limit,
      handlers: {
        success: resolve,
        error: reject
      }
    });
  });
};

export let getArtistsByTag = (tag, limit = 10) => {
  Logger.screen.info(`last.fm`, `getArtistsByTag("${tag}")`);
  return new Promise((resolve, reject) => {
    lfm.request('tag.getTopArtists', {
      tag: tag,
      limit: limit,
      handlers: {
        success: resolve,
        error: reject
      }
    });
  });
};

// export let getTopAlbumsWithInfo = (artist, limit) => {
//   Logger.screen.info(`last.fm`, `topAlbums("${artist}")`);
//   return lfm.artistAsync.getTopAlbumsAsync({
//     artist: artist,
//     limit: limit
//   }).then((res) => {
//     let albums = res.album.filter(obj => obj.mbid);

//     let promises = [];
//     albums.forEach((album) => {
//       promises.push(getAlbumInfo({
//         mbid: album.mbid
//       }));
//     });

//     return Promise.all(promises).then((data) => {
//       return data.map((album) => {
//         Logger.info(album);
//         if (album.releasedate) album.name = album.releasedate + ' - ' + album.name;
//         return album;
//       });
//     });
//   });
// };

// export let getUserFavs = () => {
//   Logger.screen.info(`last.fm`, `getLoved()`);
//   return lfm.userAsync.getLovedTracksAsync({
//     user: 'minkolazer',
//     limit: limit
//   });
// };
