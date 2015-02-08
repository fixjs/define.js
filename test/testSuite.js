(function () {
  'use strict';

  var specs = [
    './spec/var/info',
    './spec/utils',
    './spec/baseInfo',
    './spec/utils.setup',
    './spec/moduleLoader',
    './spec/define'
  ];

  console.log('\nTestSuite started to run unit tests for:');

  define(specs, function () {
    console.log('TestSuite just kicked of the all the tests!!\nWait for the result!\nHopefully they will all pass!');
  });

}());