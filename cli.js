#!/usr/bin/env node

var events = require('events');
var eventEmitter = new events.EventEmitter();

var intel = require('intel');
intel.addHandler(new intel.handlers.File(process.env.HOME + '/.mu.log'));
global.Logger = intel;
global.Logger.bottom = { log: function() {} }; // will be initialized soon

var updateNotifier = require('update-notifier');
var pkg = require('./package.json');
updateNotifier({ pkg: pkg }).notify();

require('babel/register')({ only: __dirname + '/src' });
require('./src/index');
