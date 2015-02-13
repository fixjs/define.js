define(function () {
  'use strict';

  function testExposedAttributes(assert, definejs, GLOB) {
    definejs(GLOB);

    assert.strictEqual(typeof GLOB.define, 'function', 'GLOB.define is a function');
    assert.strictEqual(typeof GLOB.require, 'function', 'GLOB.require is a function');
    assert.strictEqual(typeof GLOB.config, 'function', 'GLOB.config is a function');
    assert.strictEqual(typeof GLOB.use, 'function', 'GLOB.use is a function (Nonstandard)');
    assert.strictEqual(typeof GLOB.options, 'object', 'GLOB.options is an Object');
    assert.strictEqual(typeof GLOB.info, 'object', 'GLOB.info is an Object');
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