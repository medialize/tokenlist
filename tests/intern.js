define([], function() {
  'use strict';

  return {
    proxyPort: 9000,
    proxyUrl: 'http://localhost:9000/',

    loaderOptions: {
      packages: [
        { name: 'src', location: 'src/' },
      ],
    },

    reporters: [
      'Runner',
      {
        id: 'LcovHtml',
        directory: 'reports/coverage/',
        watermarks: {
          statements: [ 50, 80 ],
          lines: [ 50, 80 ],
          functions: [ 50, 80 ],
          branches: [ 50, 80 ],
        },
      },
      {
        id: 'Lcov',
        filename: 'reports/lcov.info',
        watermarks: {
          statements: [ 50, 80 ],
          lines: [ 50, 80 ],
          functions: [ 50, 80 ],
          branches: [ 50, 80 ],
        },
      },
    ],

    // Unit test suites to run in each browser
    suites: [
      'tests/unit/*.test',
    ],

    // Functional test suites to run in each browser once unit tests are completed
    functionalSuites: [],

    // A regular expression matching URLs to files that should not be included in code coverage analysis
    excludeInstrumentation: /^(?:tests|node_modules)\//,
  };
});
