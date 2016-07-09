import * as vk from 'vk-universal-api';
import inquirer from 'inquirer-question';
import storage from './../storage/storage';
import open from 'open';

let authUrl = 'http://www.last.fm/api/account/create';

let lfmApiKeyExample = '27be0fs25db87c9a32b8d53620634a1e';
let lfmSecretExample = '4g4e024c45b87c9a3g2b2h7d20634a1e';

let lfmUser = {
  name: 'lfmUser',
  type: 'input',
  message: 'Last.FM user name (for playing favorites and toptracks)'
};

let lfmApiKey = {
  name: 'lfmApiKey',
  type: 'input',
  message: `Open "${authUrl}" in browser. Register your app.
            \nCopy and paste lastfm api key here. It should look like "${lfmApiKeyExample}"
            \nlfmApiKey> `
};

let lfmSecret = {
  name: 'lfmSecret',
  type: 'input',
  message: `Copy and paste lastfm secret key here. It should look like "${lfmSecretExample}"
            \nlfmSecret> `
};

export let hasData = () => (typeof storage.data.lfmApiKey !== 'undefined' && typeof storage.data.lfmSecret !== 'undefined');
export let init = () => hasData() ? Promise.resolve(true) : Promise.resolve(false);
export let getInfo = () => {
  return [
    storage.data.favs.username,
    storage.data.lfmSecret,
    storage.data.lfmApiKey
  ].join(' ');
};

storage.vkHasData = hasData;

export let dialog = () => {
  open(authUrl);

  return inquirer.prompt([lfmUser, lfmApiKey, lfmSecret]).then((credentials) => {
    storage.data.favs = {
      username: credentials.lfmUser
    };
    storage.data.lfmSecret = credentials.lfmSecret;
    storage.data.lfmApiKey = credentials.lfmApiKey;
    storage.save();

    return Promise.resolve(true);
  }).catch((err) => {
    console.log('Wrong data:');
    console.log(err.message);
  });
};
