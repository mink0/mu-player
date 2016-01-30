var storage = require('dot-file-config')('.murc', {
  cloudSync: false
});

// defaults
storage.data.vkLinks = storage.data.vkLinks || [];
storage.data.gmLinks = storage.data.gmLinks || [];
storage.data.fs = storage.data.fs || [];
storage.data.bitrateTimeout = storage.data.bitrateTimeout || 3000;

storage.data.mpd = storage.data.mpd || {};
storage.data.mpd.host = storage.data.mpd.host || 'localhost';
storage.data.mpd.port = storage.data.mpd.port || 6600;

storage.data.batchSearch = storage.data.batchSearch || {};
storage.data.batchSearch.timeout = storage.data.batchSearch.timeout || 5000;
storage.data.batchSearch.retries = storage.data.batchSearch.retries || 3;
storage.data.batchSearch.results = storage.data.batchSearch.results || 30;
storage.data.batchSearch.bitrateSearchLimit = storage.data.batchSearch.bitrateSearchLimit || 20;
storage.data.batchSearch.apiDelay = storage.data.batchSearch.apiDelay || 250; // 350
storage.data.batchSearch.maxApiDelay = storage.data.batchSearch.maxApiDelay || 3000;

storage.data.search = storage.data.search || {};
storage.data.search.timeout = storage.data.search.timeout || 5000;
storage.data.search.retries = storage.data.search.retries || 5;

import events from 'events';

let EventEmitter = events.EventEmitter;
let emitter = new EventEmitter();

storage.emit = emitter.emit.bind(emitter);
storage.on = emitter.on.bind(emitter);

export const OPEN_VK = 'OPEN_VK';
export const VK_SEARCH = 'VK_SEARCH';
export const PAUSE = 'PAUSE';
export const ADD_TO_PROFILE = 'ADD_TO_PROFILE';
export const SWITCH_PANE = 'SWITCH_PANE';
export const FOCUS_LEFT_PANE = 'FOCUS_LEFT_PANE';
export const FOCUS_RIGHT_PANE = 'FOCUS_RIGHT_PANE';
export const MOVE_TO_PLAYING = 'MOVE_TO_PLAYING';
export const OPEN_FS = 'OPEN_FS';
export const OPEN_GM_ALBUM = 'OPEN_GM_ALBUM';
export const OPEN_GM_THUMBS_UP = 'OPEN_GM_THUMBS_UP';
export const OPEN_GM_ALL_TRACKS = 'OPEN_GM_ALL_TRACKS';
export const LOCAL_SEARCH = 'LOCAL_SEARCH';
export const LASTFM_SEARCH = 'LASTFM_SEARCH';
export const SC_SEARCH = 'SC_SEARCH';

export default storage;
