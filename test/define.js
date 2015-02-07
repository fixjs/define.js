define([
  './testUtils',
  './spec/utils',
  './spec/baseInfo',
  './spec/utils.setup.js'
], function (testUtils, utils, baseInfo) {
  'use strict';

  QUnit.start();

  function testExposedAttributes(assert, definejs, GLOB) {
    definejs(GLOB);

    assert.strictEqual(typeof GLOB.define, 'function', 'GLOB.define is a function');
    assert.strictEqual(typeof GLOB.require, 'function', 'GLOB.require is a function');
    assert.strictEqual(typeof GLOB.config, 'function', 'GLOB.config is a function');
    assert.strictEqual(typeof GLOB.use, 'function', 'GLOB.use is a function (Nonstandard)');
    assert.strictEqual(typeof GLOB.options, 'object', 'GLOB.options is an Object');
    assert.strictEqual(typeof GLOB.info, 'object', 'GLOB.info is an Object');
  }

  testUtils.runTest('utils', 'utils helper functions', 'utils', utils);

  testUtils.runTest('baseInfo', 'baseInfo provides the correct DOM information', ['baseInfo', 'var/doc'], baseInfo);

  testUtils.runTest('DefineJS', 'is a function', 'definejs', function (definejs) {
    var TEST = {},
      assert = this;

    assert.strictEqual(typeof definejs, 'function', 'definejs is a function');

    testExposedAttributes(assert, definejs, TEST);

    TEST = function () {};

    testExposedAttributes(assert, definejs, TEST);
  });
});