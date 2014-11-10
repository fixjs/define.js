// Karma configuration file
//
// For all available config options and default values, see:
// https://github.com/karma-runner/karma/blob/stable/lib/config.js#L54

module.exports = function (config) {
  'use strict';

  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    frameworks: [
      'mocha'
    ],

    // list of files / patterns to load in the browser
    files: [
      'bower_components/chai/chai.js',
      'define.debug.js',
      'test/define.js'
    ],

    // use dots reporter, as travis terminal does not support escaping sequences
    // possible values: 'dots', 'progress', 'junit', 'teamcity'
    // CLI --reporters progress
    reporters: ['dots'],

    // enable / disable watching file and executing tests whenever any file changes
    // CLI --auto-watch --no-auto-watch
    autoWatch: true,

    // start these browsers
    // CLI --browsers Chrome,Firefox,Safari
    browsers: [
      'Chrome',
      'Firefox',
      'PhantomJS'
    ],

    // if browser does not capture in given timeout [ms], kill it
    // CLI --capture-timeout 5000
    captureTimeout: 20000,

    // auto run tests on start (when browsers are captured) and exit
    // CLI --single-run --no-single-run
    singleRun: false,

    plugins: [
      'karma-mocha',
      'karma-requirejs',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-ie-launcher',
      'karma-safari-launcher',
      'karma-phantomjs-launcher'
    ]
  });
};
