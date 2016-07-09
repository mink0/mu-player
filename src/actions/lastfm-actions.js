import LastFmNode from 'lastfm';
import storage from './../storage/storage';
import Promise from 'bluebird';

export var lfm = lfm;

let handleData = (result) => {
  return result;
};

export let init = () => {
  lfm = new LastFmNode.LastFmNode({
    api_key: storage.data.lfmApiKey,
    secret: storage.data.lfmSecret
  });
};

export let getTrackInfo = (track) => {
  //Logger.screen.info(`last.fm`, `trackSearch("${query}")`);
  return new Promise((resolve, reject) => {
    lfm.request('track.getInfo', {
      track: track.title,
      artist: track.artist,
      username: storage.data.favs.username,
      autocorrect: 1,
      handlers: {
        success: resolve,
        error: reject
      }
    });
  });
};

export let love = (track, type = 'love') => {
  Logger.screen.info(`last.fm`, `${type}("${track.title}, ${track.artist}")`);

  if (!storage.data.lfmSessionKey) {
    Logger.screen.error('You need to setup Last.FM Session Key first. Run `mu --setup` from console and get your session key.');
    return Promise.resolve(false);
  }

  return new Promise((resolve, reject) => {
    lfm.request('track.' + type, {
      track: track.title,
      artist: track.artist,
      sk: storage.data.lfmSessionKey,
      handlers: {
        success: resolve,
        error: reject
      }
    });
  }).then((res) => {
    Logger.screen.info('last.fm', type + ' successful');
  });
};

export let favToggle = (track) => {
  return getTrackInfo(track).then((res) => {
    let type = res.track.userloved === '1' ? 'unlove' : 'love';
    return love({
      title: res.track.name,
      artist: res.track.artist.name
    }, type);
  }).catch((err) => {
    Logger.screen.error('last.fm', err);
  });
};

export let getUserFavs = (username = storage.data.favs.username,
  limit = storage.data.batchSearch.results) => {
  Logger.screen.info(`last.fm`, `getLovedTracks(${username}, ${limit})`);
  return new Promise((resolve, reject) => {
    lfm.request('user.getLovedTracks', {
      user: username,
      limit: limit,
      handlers: {
        success: resolve,
        error: reject
      }
    });
  }).then((res) => {
    let out = res.lovedtracks.track.filter(obj => obj.name).map((track) => {
      return {
        track: track.name,
        artist: track.artist.name || 'Various Artists'
      };
    });

    if (out.length === 0) throw new Error('No favorites found for ' + username);

    return out;
  });
};


export let getUserTopTracks = (
  username = storage.data.favs.username,
  period = '6month',
  limit = storage.data.batchSearch.results
) => {
  Logger.screen.info(`last.fm`, `getUserTopTracks(${username}, ${period}, ${limit})`);
  return new Promise((resolve, reject) => {
    lfm.request('user.getTopTracks', {
      user: username,
      period: period,
      limit: limit,
      handlers: {
        success: resolve,
        error: reject
      }
    });
  }).then((res) => {
    let out = res.toptracks.track.filter(obj => obj.name).map((track) => {
      return {
        track: track.name,
        artist: track.artist.name || 'Various Artists'
      };
    });

    if (out.length === 0) throw new Error('No toptracks found for ' + username);

    return out;
  });
};

export let getUserRecentTracks = (
  username = storage.data.favs.username,
  limit = storage.data.batchSearch.results
) => {
  Logger.screen.info(`last.fm`, `getUserRecentTracks(${username}, ${limit})`);
  return new Promise((resolve, reject) => {
    lfm.request('user.getRecentTracks', {
      user: username,
      limit: limit,
      handlers: {
        success: resolve,
        error: reject
      }
    });
  }).then((res) => {
    let out = res.recenttracks.track.filter(obj => obj.name).map((track) => {
      return {
        track: track.name,
        artist: track.artist['#text'] || 'Various Artists'
      };
    });

    if (out.length === 0) throw new Error('No recenttracks found for ' + username);

    return out;
  });
};

export let getSearch = (query, limit = 10) => {
  //Logger.screen.info(`last.fm`, `search("${query}")`);
  let menu = {};

  return Promise.join(
    getSearchTrack(query, limit),
    getSearchArtist(query, limit),
    function(tracks, artists /*, albums*/ ) {
      if (tracks && tracks.results) menu.tracks = tracks.results.trackmatches.track;
      if (artists && artists.results) menu.artists = artists.results.artistmatches.artist;
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
  //Logger.screen.info(`last.fm`, `trackSearch("${query}")`);
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
  //Logger.screen.info(`last.fm`, `artistSearch("${query}")`);
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
