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

  function asyncTryCatchFN(async) {
    return async(function * () {
      var str = yield getPromisedString();
      throw new Error('This is just a ' + str);
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

  function asyncRejectedPromiseFN(async) {
    return async.Promise(function * (fulfill, reject) {
      var str = yield getPromisedString();
      str = 'This is just a ' + str;
      reject(str);
      return str;
    });
  }

  fix.test('async', {
    message: 'async module provides a means to deal with function generators',
    resolver: function (assert, async) {
      var asyncValue = asyncFN(async)(),
        asyncPromiseValue = asyncPromiseFN(async),
        rejectedPromise,
        asyncTryCatch;

      rejectedPromise = asyncRejectedPromiseFN(async)
        .catch(function (str) {
          return 'Error: ' + str;
        });

      asyncTryCatch = asyncTryCatchFN(async)()
        .catch(function (err) {
          return err;
        });

      return Promise.all([asyncValue, asyncPromiseValue, rejectedPromise, asyncTryCatch]);
    }
  }).then(function (assert, async, promisedArray) {

    assert.strictEqual(typeof async, 'function', 'async is actually a function');

    assert.strictEqual(typeof async.Promise, 'function', 'async.Promise is also a function');

    assert.ok($.isArray(promisedArray), 'both promised values are present');

    assert.strictEqual(promisedArray.length, 4, 'promisedArray has two member as we expect');

    assert.strictEqual(promisedArray[0], 'This is just a simple promised string!', 'async works as expected!');

    assert.strictEqual(promisedArray[0], promisedArray[1], 'async and async.Promise both work as expected!');

    assert.strictEqual(promisedArray[2], 'Error: ' + promisedArray[0], 'async handles promise rejection');

    assert.ok(promisedArray[3] instanceof Error, 'async handles errors and exceptions');
    assert.strictEqual(promisedArray[3].message, 'This is just a simple promised string!', 'async handles errors and exceptions:message');

    var genFN,
      asyncGen1,
      asyncGen2;

    genFN = function * () {
      var str = yield 'str';
      return str;
    };

    asyncGen1 = async(genFN);
    asyncGen2 = async(genFN);

    assert.strictEqual(asyncGen1, asyncGen2, 'async caches the async alternative of function generators!');

  });
});