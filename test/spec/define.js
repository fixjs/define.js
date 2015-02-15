define(function () {
  'use strict';

  function testExposedAttributes(assert, definejs, GLOB) {
    definejs(GLOB);

    assert.strictEqual(typeof GLOB.define, 'function', 'GLOB.define is a function');
    assert.strictEqual(typeof GLOB.require, 'function', 'GLOB.require is a function');
    assert.strictEqual(typeof GLOB.require.config, 'function', 'GLOB.require.config is a function');
    assert.strictEqual(typeof GLOB.config, 'function', 'GLOB.config is a function');
    assert.equal(GLOB.config, GLOB.require.config, 'GLOB.config and GLOB.require.config are the same');
    assert.strictEqual(typeof GLOB.use, 'function', 'GLOB.use is a function (Nonstandard)');
    assert.strictEqual(typeof GLOB.define.info, 'object', 'GLOB.define.info is an Object');
    assert.strictEqual(typeof GLOB.define.info.options, 'object', 'GLOB.define.info has an Object attribute named options');
  }

  fix.test('definejs', {
    message: 'is a expose function for AMD functions and more DefineJS attributes'
  }).then(function (assert, definejs) {
    var TEST = {};

    assert.strictEqual(typeof definejs, 'function', 'definejs is a function');

    testExposedAttributes(assert, definejs, TEST);

    TEST = function () {};

    testExposedAttributes(assert, definejs, TEST);
  });
});