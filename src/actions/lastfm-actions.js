import LastfmAPI from 'lastfmapi';
import storage, {
  LASTFM_SEARCH
}
from './../storage/storage';

import Promise from 'bluebird';
import {
  format
}
from './music-actions';

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
  Logger.bottom.log('OK');
  return result;
};

export let getSearch = (query) => {
  let menu = {};
  Logger.bottom.log('lastfmSearch(', query, ')');

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
  Logger.bottom.log('lfmSearch(', query, ')');
  return lfm.trackAsync.searchAsync({
    track: query,
    limit: limit
  });
};

export let getSearchAlbum = (query) => {
  Logger.bottom.log('lfmSearchAlbum(', query, ')');
  return lfm.albumAsync.searchAsync({
    album: query,
    limit: limit
  });
};

export let getSearchArtist = (query) => {
  Logger.bottom.log('lfmSearchArtist(', query, ')');
  return lfm.artistAsync.searchAsync({
    artist: query,
    limit: limit
  });
};

export let getTopTracks = (artist) => {
  Logger.bottom.log('lfmGetTopTracks(', artist, ')');
  return lfm.artistAsync.getTopTracksAsync({
    artist: artist,
    //limit: 50
  });
};

export let getSimilar = (artist) => {
  Logger.bottom.log('lfmGetSimilar(', artist, ')');
  return lfm.artistAsync.getSimilarAsync({
    artist: artist,
    //limit: 50
  });
};

export let getSearchTag = (query) => {
  Logger.bottom.log('lfmSearchTag(', query, ')');
  return lfm.tagAsync.searchAsync({
    tag: query,
    limit: limit
  });
};
