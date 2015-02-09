module.exports = function (config) {
  'use strict';

  config.set({
    basePath: '',

    frameworks: ['qunit', 'requirejs'],
    files: [
      'test/polyfills/promise-6.0.0.min.js',
      'test/polyfills/promise-done-5.0.0.js',
      'bower_components/jquery/dist/jquery.js',
      'test/fix.testRunner.js',
      'test/karma.main.js', {
        pattern: 'src/{,*/}*.js',
        included: false
      }, {
        pattern: 'test/testSuite.js',
        included: false
      }, {
        pattern: 'define.amd.js',
        included: false
      }, {
        pattern: 'test/spec/{,*/}*.js',
        included: false
      }
    ],
    exclude: [
      'src/*.promise.js'
    ],

    // use dots reporter, as travis terminal does not support escaping sequences
    // possible values: 'dots', 'progress', 'junit', 'teamcity'
    // CLI --reporters progress
    reporters: ['progress', 'coverage'],

    preprocessors: {
      'src/{,*/}*.js': 'coverage'
    },
    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/'
    },

    // enable / disable watching file and executing tests whenever any file changes
    // CLI --auto-watch --no-auto-watch
    autoWatch: true,

    // start these browsers
    // CLI --browsers Chrome,Firefox,Safari
    browsers: [
      'PhantomJS',
      'Firefox',
      'Chrome',
      'Safari'
    ],

    // if browser does not capture in given timeout [ms], kill it
    // CLI --capture-timeout 5000
    captureTimeout: 20000,

    // auto run tests on start (when browsers are captured) and exit
    // CLI --single-run --no-single-run
    singleRun: true,

    plugins: [
      'karma-qunit',
      'karma-requirejs',
      'karma-coverage',
      'karma-phantomjs-launcher',
      'karma-firefox-launcher',
      'karma-chrome-launcher',
      'karma-safari-launcher'
    ]
  });
};