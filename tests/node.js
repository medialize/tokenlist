define(function(require) {
  'use strict';

  var config = require('./intern');

  // in node we can't run any of the DOM tests
  config.suites = [
    'tests/unit/tokenlist.test',
  ];

  return config;
});
