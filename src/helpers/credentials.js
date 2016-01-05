import * as vkCredentials from './vk-credentials';
import * as lfmCredentials from './lfm-credentials';
import * as scCredentials from './sc-credentials';

import menu from 'inquirer-menu';
import Promise from 'bluebird';

export default (force) => {
	var createMenu = () => {
		var result = {
			message: 'Setup login credentials',
			choices: {}
		};

		result.choices['vk.com credentials ' + (vkCredentials.hasData() ? 
			' (' + vkCredentials.getUser() + ')': '')] = vkCredentials.dialog;
		result.choices['last.fm credentials ' + (lfmCredentials.hasData() ? 
			' (' + lfmCredentials.getInfo() + ')' : '')] = lfmCredentials.dialog;
		result.choices['soundcloud.com credentials ' + (lfmCredentials.hasData() ? 
			' (' + scCredentials.getInfo() + ')' : '')] = scCredentials.dialog;

		return result;
	};

	vkCredentials.init();
	scCredentials.init();
	lfmCredentials.init();
	
	if (!force && (vkCredentials.hasData() || scCredentials.hasData())) {
		return Promise.resolve(true);
	} else {
		return menu(createMenu).then(() => process.exit(0));
	}
};

