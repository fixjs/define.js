(function () {
  'use strict';

  var specs = [
    './spec/var/emptyArray',
    './spec/var/doc',
    './spec/var/fix',
    './spec/utils',
    './spec/utils.isFunction',
    './spec/baseInfo',
    './spec/execute',
    './spec/setup',
    // './spec/setup.regular',
    // './spec/setup.promised',
    './spec/getFileName'
    // './spec/getUrl',
    // './spec/createScript',
    // './spec/getScript',
    //'./spec/loader'
  ];

  if (!QUnit.config.karmaIsInCharge) {
    QUnit.start();
  }

  if (FIX.isGeneratorSupported()) {
    specs.push(
      // './spec/loader.promise',
      //'./spec/promise'
    );
  }

  specs.push(
    // './spec/amd',
    // './spec/amd.use',
    //'./spec/define'
  );

  // console.log('\nTestSuite started to run unit tests for:');

  define(specs, function () {
    // console.log('TestSuite just kicked of the all the tests!!\nWait for the result!\nHopefully they will all pass!');
  });

}());