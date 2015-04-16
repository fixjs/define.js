define(function () {
  'use strict';

  function testIsFunction(assert, isFunction) {

    assert.strictEqual(typeof isFunction, 'function', 'isFunction is a function');

    //tests for environments that return incorrect `typeof` operator results.
    assert.equal(isFunction(/x/), false, 'isFunction works for regexps');

    if (navigator.userAgent.search('PhantomJS') === -1) {
      assert.equal(isFunction(global.Uint8Array), true, 'isFunction works for Uint8Array');
    }

    assert.strictEqual(isFunction(/x/), false, 'isFunction is a function');

    var global1 = FIX.testFrame.contentWindow,
      f = global.Function(''),
      f1 = global1.Function('');

    assert.notEqual(global, global1, 'Two different window objects');
    assert.strictEqual(f1 instanceof global.Function, false, 'Functions are instances from within global objects:f1 in global');
    assert.strictEqual(f1 instanceof global1.Function, true, 'Functions are instances from within global objects:f1 in global1');
    assert.strictEqual(f instanceof global1.Function, false, 'Functions are instances from within global objects:f in global1');
    assert.strictEqual(f instanceof global.Function, true, 'Functions are instances from within global objects:f in global');
    assert.strictEqual(isFunction(f), true, 'isFunction works for all functions even from different globals:f');
    assert.strictEqual(isFunction(f1), true, 'isFunction works for all functions even from different globals:f1');
  }

  FIX.test('isFunction', {
    message: 'isFunction works as a helper utils function',
    require: ['./utils/isFunction']
  }).then(function (assert, isFunction) {

    assert.strictEqual(typeof isFunction, 'function', 'utils is a function');
    testIsFunction(assert, isFunction);

  });
});