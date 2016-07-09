import * as vk from 'vk-universal-api';
import inquirer from 'inquirer-question';
import open from 'open';
import LastFmNode from 'lastfm';
import Promise from 'bluebird';

import storage from '../storage/storage';
import { lfm } from '../actions/lastfm-actions';

let authUrl = `http://www.last.fm/api/auth/`;

export let hasData = () => (typeof storage.data.lfmSessionKey !== 'undefined' && storage.data.lfmSessionKey !== '');
export let init = () => hasData() ? Promise.resolve(true) : Promise.resolve(false);
export let getInfo = () => {
  return storage.data.lfmSessionKey;
};

export let dialog = () => {
  if (!storage.data.lfmApiKey)
    throw new Error('First, you need to get lastfm api key at previous steps!');

  return new Promise((resolve, reject) => {
    lfm.request('auth.getToken', {
      handlers: {
        success: resolve,
        error: reject
      }
    });
  }).then((res) => {
    let token = res.token;
    //console.log('New token recieved:', token);

    authUrl += '?api_key=' + storage.data.lfmApiKey + '&token=' + token;

    open(authUrl);

    return inquirer.prompt([{
      name: 'lfmSessionKey',
      type: 'confirm',
      message: `Open "${authUrl}" in your browser. Register mu-palyer app at Last.FM.
            \nDo you register this application in browser?`
    }]).then((credentials) => {
      return new Promise((resolve, reject) => {
        lfm.request('auth.getSession', {
          token: token,
          handlers: {
            success: resolve,
            error: reject
          }
        });
      }).then((res) => {
        if (!res.session || !res.session.key) {
          console.log(res);
          throw new Error();
        }

        storage.data.lfmSessionKey = res.session.key;
        storage.save();

        return Promise.resolve(true);
      }).catch((err) => {
        console.log('Can\'t get session:');
        console.log(err.message);
      });
    });
  }).catch((err) => {
    console.log('Can\'t get token:');
    console.log(err.message);
  });
};
