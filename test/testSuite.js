(function () {
  'use strict';

  var specs = [
    './spec/var/emptyArray',
    './spec/var/doc',
    './spec/var/info',
    './spec/utils',
    './spec/utils.isFunction',
    './spec/baseInfo',
    './spec/utils.execute',
    './spec/setup',
    './spec/setup.regular',
    './spec/setup.promised',
    './spec/utils.getFileName',
    './spec/utils.getUrl',
    './spec/utils.createScript',
    './spec/utils.getScript',
    './spec/loader'
  ];

  if (!QUnit.config.karmaIsInCharge) {
    QUnit.start();
  } else {
    specs.push(
      './spec/async'
    );
  }

  specs.push(
    './spec/amd',
    './spec/define'
  );

  // console.log('\nTestSuite started to run unit tests for:');

  define(specs, function () {
    // console.log('TestSuite just kicked of the all the tests!!\nWait for the result!\nHopefully they will all pass!');
  });

}());