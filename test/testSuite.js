(function () {
  'use strict';

  var specs = [
    './spec/var/info',
    './spec/utils',
    './spec/baseInfo',
    './spec/utils.setup.js',
    './spec/moduleLoader',
    './spec/define'
  ];

  QUnit.start();

  console.log('\nTestSuite started to load written tests for:');

  define(specs, function () {
    console.log('TestSuite just kicked of the all the tests!!\nWait for the result!\nHopefully they will all pass!');
  });

}());