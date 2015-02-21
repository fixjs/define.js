(function () {
  'use strict';

  var specs = [
    './spec/var/emptyArray',
    './spec/var/doc',
    './spec/var/info',
    './spec/utils',
    './spec/baseInfo',
    './spec/utils.execute',
    './spec/setup',
    './spec/setup.regular',
    './spec/setup.promised',
    './spec/utils.getFileName',
    './spec/utils.getUrl',
    './spec/utils.createScript',
    './spec/loader',
    './spec/amd',
    // './spec/amd.define.patterns',
    './spec/define'
  ];

  if(!QUnit.config.karmaIsInCharge){
    QUnit.start();
  }

  // console.log('\nTestSuite started to run unit tests for:');

  define(specs, function () {
    // console.log('TestSuite just kicked of the all the tests!!\nWait for the result!\nHopefully they will all pass!');
  });

}());