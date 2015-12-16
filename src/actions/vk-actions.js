import * as vk from 'vk-universal-api';

import splitTracklist from 'split-tracklist';
import Promise from 'bluebird';

import {
  formatTrack
}
from './music-actions';

const SEARCH_LIMIT = 1000;

let formatTrackFull = (track) => formatTrack(track);

let handleData = (result) => {
  return result.filter(obj => obj.artist && obj.title).map(obj => {
    obj.source = 'vk';
    obj.artist = obj.artist.replace(/&amp;/g, '&');
    obj.title = obj.title.replace(/&amp;/g, '&');

    obj.trackTitleFull = formatTrackFull(obj);
    return obj;
  });
};

export let getSearch = (query, opts) => {
  var opts = opts || {};
  opts.limit = opts.limit || SEARCH_LIMIT;
  opts.offset = opts.offset || 0;

  global.Logger.bottom.log('vkSearch(', query, ')');
  let queryOpts = {
    count: opts.limit,
    offset: opts.offset * opts.limit,
    q: query,
    sort: 2
  };

  let request = vk.method('audio.search', queryOpts);
  return request.then(response => handleData(response.items));
};

export let getSearchWithArtist = (track, artist) => {
  Logger.bottom.log('vkSearchWArtist(', track, artist, ')');
  let request = vk.method('audio.search', {
    count: SEARCH_LIMIT,
    offset: 0,
    performer_only: 1,
    q: artist
  });
  return request.then(response => {
    let items = [];
    response.items.forEach((item) => {
      if (item.title.indexOf(track) > 0) items.push(item);
    });
    if (items.length === 0) {
      Logger.bottom.log('vkNotFound', track, artist);
      return undefined;
    }
    Logger.bottom.log('vkFound: ' + items.length + ' track(s)');

    return handleData(items);
  });
};


/*
export let getProfileAudio = () => {
  Logger.bottom.log('getProfileAudio => ');
  let request = vk.method('audio.get', { need_user: 1, count: count, offset: offset * count });
  return request.then(response => {
    response.items.forEach(track => {
      profileAudious[track.artist + track.title] = true;
    });

    return response.items;
  }).then(response => handleData(response));
};

export let getGroupAudio = (groupId, albumId) => {
  Logger.bottom.log('getGroupAudio => ', groupId, albumId);
  let request = vk.method('audio.get', { need_user: 1, count: count, offset: offset * count, owner_id: groupId, album_id: albumId });
  return request.then(response => handleData(response.items));
};

export let getWallAudio = (id) => {
  Logger.bottom.log('getWallAudio(%s)', id);
  let request = vk.method('wall.getById', { posts: [id] }, { transformResponse: false });
  return request.then((result) => {
    let attachments = result.body.response[0].attachments.filter(a => a.type === 'audio').map(a => a.audio);
    return handleData(attachments);
  });
};

export let getRecommendations = () => {
  Logger.bottom.log('getRecommendations()');
  return vk.method('audio.getRecommendations').then((response) => handleData(response.items));
};

export let getAlbums = () => {
  Logger.bottom.log('getAlbums()');
  return vk.method('audio.getAlbums').then((response) => response.items);
};


export let addToProfile = (selected) => {
  Logger.bottom.log('addToProfile(%s)', selected);
  return vk.method('audio.add', { audio_id: selected.aid , owner_id: selected.owner_id }).then((track) => {
    selected.isAdded = true;
    selected.trackTitleFull = formatTrackFull(selected);

    return selected;
  });
};

export let addOnTop = (selected) => {
  Logger.bottom.log('addOnTop(%s)', selected);
  return vk.method('audio.get', { need_user: 1, count: 1 }).then((result) => {
    let currentTopTrack = result.items[0];
    return vk.method('audio.reorder', { audio_id: selected.aid, before: currentTopTrack.aid });
  });
};

export let detectUrlType = (url) => {
  let match = null;

  let album = /.*vk.com\/audios([-\d]+)\?album_id=([\d]+)/;
  match = album.exec(url);
  if (match) {
    return Promise.resolve({
      type: 'audio',
      owner_id: match[1],
      album_id: match[2]
    });
  }

  let wall = /.*vk.com\/wall([\S]+)/;
  match = wall.exec(url);
  if (match) {
    return Promise.resolve({
      type: 'wall',
      id: match[1]
    });
  }

  let community = /.*vk.com\/([\S]+)/;
  match = community.exec(url);
  if (match) {
    return vk.method('utils.resolveScreenName', { screen_name: match[1] }).then((response) => {
      return {
        type: 'audio',
        owner_id: (response.type === 'group' ? '-' : '') + response.object_id
      };
    });
  }
};
*/
