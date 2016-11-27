'use strict';

var path = require('path');
var config = require('../config.json');
var targetURL = (
    process.env.CI ? config.testing.target : config.local.target
);
global.TEST_API_URL = path.join(targetURL, 'api');

exports.config = {
  capabilities: [
    {browserName: 'phantomjs'},
  ],
  services: ['phantomjs'],
  specs: [
    './test/e2e/*.js',
    './test/unit/*.js',
  ],
  exclude: [],
  maxInstances: 2,
  sync: true,
  logLevel: 'error',
  coloredLogs: true,
  waitforTimeout: 20000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 30000,
  },
};
