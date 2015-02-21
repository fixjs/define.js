define(function () {
  'use strict';

  function testAsync(assert, async) {
    var getPromisedString = function () {
      return new Promise(function (fulfill) {
        fulfill('simple promised string!');
      });
    }

    // var gen = function *() {
    //   var str = yield getPromisedString();

    //   console.log('Hello:' + str);

    //   assert.strictEqual(typeof str, 'string', 'yield returns the actual promised string');
    // };

    // var asyncGen = async(gen);

    // asyncGen();
  }

  fix.test('async', {
    message: 'test if async module provides the right tool for dealing with function generators'
  }).then(function (assert, async) {

    assert.strictEqual(typeof async, 'function', 'async is a function');
    assert.strictEqual(typeof async.Promise, 'function', 'async.Promise is also a function');

    testAsync(assert, async);
  });
});