import inquirer from 'inquirer-question';
import Promise from 'bluebird';

export const CONFIG_PATH = '.murc';

let storage = require('dot-file-config')(CONFIG_PATH, {
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

storage.data.favs = storage.data.favs || {};
storage.data.favs.username = storage.data.favs.username || 'minkolazer';

storage.data.search = storage.data.search || {};
storage.data.search.timeout = storage.data.search.timeout || 5000;
storage.data.search.retries = storage.data.search.retries || 5;

storage.data.qsearch = storage.data.qsearch || {};
storage.data.qsearch.maxitems = storage.data.qsearch.maxitems || 7;

export let updateConfig = () => {
  var pkg = require('../../package.json');

  // check version
  if (!storage.isFirstRun && pkg.mu_player.updateConfig && storage.data.version !== pkg.version) {
    return inquirer.prompt([{
      name: 'setup',
      type: 'confirm',
      message: 'New version of mu-player has been detected!' +
      '\nIn order to have all functionality you should remove your should' +
      'run "mu --setup" and update your credentials.' +
      '\n\nDo you want to setup credentials?'
    }]).then((ans) => {
      // if (ans.remove) {
      //   fs.renameSync(storage.path, storage.path + '.old');
      //   console.log('Old config file is stored at: ' + storage.path + '.old');
      //   process.exit();
      // }

      storage.data.version = pkg.version;
      storage.save();

      return Promise.resolve(ans.setup);
    });
  } else {
    return Promise.resolve(false);
  }
};

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
