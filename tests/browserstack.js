define(function(require) {
  'use strict';

  var config = require('./intern');

  config.capabilities = {
    project: 'TokenList.js',
  };

  // https://theintern.github.io/intern/#option-environments
  // see https://www.browserstack.com/automate/capabilities
  /*eslint-disable camelcase */
  config.environments = [
    { browser: 'Edge', browser_version: '13.0', os: 'WINDOWS', os_version: '10', platform: 'WIN', browserName: 'Edge13' },

    { browser: 'IE', browser_version: '11', os: 'WINDOWS', os_version: '8.1', platform: 'WIN', browserName: 'IE11' },
    { browser: 'IE', browser_version: '10', os: 'WINDOWS', os_version: '8', platform: 'WIN', browserName: 'IE10', nativeEvents: true },
    { browser: 'IE', browser_version: '9', os: 'WINDOWS', os_version: '7', platform: 'WIN', browserName: 'IE9' },

    { browser: 'Firefox', browser_version: '44', os: 'WINDOWS', os_version: '8.1', platform: 'WIN', browserName: 'Firefox 42' },
    { browser: 'Chrome', browser_version: '48', os: 'WINDOWS', os_version: '8.1', platform: 'WIN', browserName: 'Chrome 47' },

    { browser: 'Firefox', browser_version: '44', os: 'OS X', os_version: 'Yosemite', platform: 'MAC', browserName: 'Firefox 42' },
    { browser: 'Chrome', browser_version: '48', os: 'OS X', os_version: 'Yosemite', platform: 'MAC', browserName: 'Chrome 47' },

    {
      browser: 'Safari',
      browser_version: '9.0',
      os: 'OS X',
      os_version: 'El Capitan',
      platform: 'MAC',
      browserName: 'Safari 9',
      'browserstack.safari.driver': '2.48',
    },
    {
      browser: 'Safari',
      browser_version: '8',
      os: 'OS X',
      os_version: 'Yosemite',
      platform: 'MAC',
      browserName: 'Safari 8',
      'browserstack.safari.driver': '2.48',
    },
    {
      browser: 'Safari',
      browser_version: '7.1',
      os: 'OS X',
      os_version: 'Mavericks',
      platform: 'MAC',
      browserName: 'Safari 7',
      'browserstack.safari.driver': '2.48',
    },
    {
      browser: 'Safari',
      browser_version: '6.2',
      os: 'OS X',
      os_version: 'Mountain Lion',
      platform: 'MAC',
      browserName: 'Safari 6',
      'browserstack.safari.driver': '2.48',
    },
  ];
  /*eslint-enable camelcase */

  config.maxConcurrency = 2;
  config.tunnel = 'BrowserStackTunnel';

  return config;
});
