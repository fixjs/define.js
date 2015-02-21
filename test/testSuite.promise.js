(function () {
  'use strict';

  var specs = [
    './spec/var/emptyArray',
    './spec/var/doc',
    './spec/var/info'
  ];

  if(!QUnit.config.karmaIsInCharge){
    QUnit.start();
  }

  // console.log('\nTestSuite started to run unit tests for:');

  define(specs, function () {
    // console.log('TestSuite just kicked of the all the tests!!\nWait for the result!\nHopefully they will all pass!');
  });

}());