define(function () {
  'use strict';

  function getPromisedString() {
    return new Promise(function (fulfill) {
      fulfill('simple promised string!');
    });
  }

  function asyncFN(async) {
    return async(function * () {
      var str = yield getPromisedString();
      return 'This is just a ' + str;
    });
  }

  fix.test('async', {
    message: 'async module provides a means to deal with function generators',
    resolver: function(assert, async){
      return asyncFN(async)();
    }
  }).then(function (assert, async, promisedString) {

    assert.strictEqual(typeof async, 'function', 'async is actually a function');

    assert.strictEqual(typeof async.Promise, 'function', 'async.Promise is also a function');

    assert.strictEqual(promisedString, 'This is just a simple promised string!', 'async works as expected!');

  });
});