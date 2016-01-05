import * as vk from 'vk-universal-api';
import inquirer from 'inquirer-question';

import storage from './../storage/storage';

let authUrl = 'http://soundcloud.com/you/apps';

let scClientIdExample = '27be0fs25db87c9a32b8d53620634a1e';
let scClientSecretExample = '4g4e024c45b87c9a3g2b2h7d20634a1e';

let scClientId = {
  name: 'scClientId',
  type: 'input',
  message: `Open "${authUrl}" in browser. Register new app there.
  \nCopy and paste api key here. It should look like "${scClientIdExample}"
  \nscClientId> `
};

let scClientSecret = {
  name: 'scClientSecret',
  type: 'input',
  message: `Copy and paste lastfm secret key here. It should look like "${scClientSecretExample}"
  \nscClientSecret> `
};

export let hasData = () => (typeof storage.data.scClientId !== 'undefined' && typeof storage.data.lfmSecret !== 'undefined');
export let init = () => hasData() ? Promise.resolve(true) : Promise.resolve(false);
export let getInfo = () => {
  return storage.data.scClientSecret + ' ' + storage.data.scClientId;
};

storage.vkHasData = hasData;

export let dialog = () => {
  return inquirer.prompt([scClientId, scClientSecret]).then((credentials) => {
    storage.data.scClientId = credentials.scClientId;
    storage.data.scClientSecret = credentials.scClientSecret;
    storage.save();
    //init();
    return Promise.resolve(true);
  }).catch((err) => {
    console.log('wrong data');
  });
};
