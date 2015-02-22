define(function () {
  'use strict';

  var $ = global.jQuery;

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

  function asyncPromiseFN(async) {
    return async.Promise(function * (fulfill) {
      var str = yield getPromisedString();
      str = 'This is just a ' + str;
      fulfill(str);
      return str;
    });
  }

  fix.test('async', {
    message: 'async module provides a means to deal with function generators',
    resolver: function (assert, async) {
      var asyncValue = asyncFN(async)(),
        asyncPromiseValue = asyncPromiseFN(async);

      return Promise.all([asyncValue, asyncPromiseValue]);
    }
  }).then(function (assert, async, promisedArray) {

    assert.strictEqual(typeof async, 'function', 'async is actually a function');

    assert.strictEqual(typeof async.Promise, 'function', 'async.Promise is also a function');

    assert.ok($.isArray(promisedArray), 'both promised values are present');

    assert.strictEqual(promisedArray.length, 2, 'promisedArray has two member as we expect');

    assert.strictEqual(promisedArray[0], 'This is just a simple promised string!', 'async works as expected!');

    assert.strictEqual(promisedArray[0], promisedArray[1], 'async and async.Promise both work as expected!');

  });
});