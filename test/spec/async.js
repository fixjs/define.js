define([
  '../../src/async'
], function (async) {
  'use strict';

  QUnit.module('async');

  function testAsync(assert) {
    console.log('typeof async:' + typeof async);
    var getPromisedString = function () {
      return new Promise(function (fulfill) {
        fulfill('simple promised string!');
      });
    }

    var gen = function *() {
      var str = yield getPromisedString();

      console.log('Hello:' + str);

      assert.strictEqual(typeof str, 'string', 'yield returns the actual promised string');
    };

    // var asyncGen = async(gen);

    // asyncGen();
  }

  QUnit.test('test for async module', function (assert) {

    assert.strictEqual(typeof async, 'function', 'async is an object');

    testAsync(assert);

  });
});