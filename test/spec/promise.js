define(function () {
  'use strict';

  var $ = global.jQuery;

  function getPromisedString() {
    return Promise.resolve('simple promised string!');
  }

  function * getString() {
    var str = yield getPromisedString();
    return 'This is just a ' + str;
  }

  function * asyncThrowFN1() {
    var str = yield getPromisedString();
    throw new Error('This is just a ' + str);
  }

  function * asyncThrowFN2() {
    var obj;
    obj.name = 'Object';
    /* jshint ignore:start */
    throw new Error('This is just a simple error message!');
    /* jshint ignore:end */
    yield getPromisedString();
  }

  function * asyncTryCatchFN1() {
    var result;
    try {
      result = yield asyncThrowFN1.go();
    } catch (e) {
      result = e;
    }
    return result;
  }

  function * asyncTryCatchFN2() {
    var result;
    try {
      result = yield asyncThrowFN2.go();
    } catch (e) {
      result = e;
    }
    return result;
  }

  function asyncPromiseFN(Promise) {
    return new Promise(function * (fulfill) {
      var str = yield getPromisedString();
      str = 'This is just a ' + str;
      fulfill(str);
      return str;
    });
  }

  // function asyncRejectedPromiseFN(Promise) {
  //   return new Promise(function * (fulfill, reject) {
  //     var str = yield getPromisedString();
  //     str = 'This is just a ' + str;
  //     reject(str);
  //   });
  // }

  FIX.test('promise', {
    message: 'promise module provides a means to deal with function generators',
    resolver: function (assert, Promise) {
      global.NativePromise = global.Promise;
      global.Promise = Promise;

      var asyncValue = getString.go(),
        asyncPromiseValue = asyncPromiseFN(Promise),
        asyncTryCatch1,
        asyncTryCatch2;
      // rejectedPromise = asyncRejectedPromiseFN(Promise);

      // rejectedPromise
      //   .then(function () {
      //     console.log('WTF??');
      //   }, function (str) {
      //     console.log('HHHHH:', str);
      //     return str;
      //   })
      //   .catch(function (str) {
      //     return 'Error: ' + str;
      //   });

      // asyncTryCatch1 = asyncTryCatchFN1(Promise)()
      //   .catch(function (err) {
      //     return err;
      //   });

      // asyncTryCatch2 = asyncTryCatchFN2(Promise)()
      //   .catch(function (err) {
      //     return err;
      //   });
      // return Promise.all([asyncValue, asyncPromiseValue, rejectedPromise, asyncTryCatch1, asyncTryCatch2]);
      return Promise.all([asyncValue, asyncPromiseValue]);
    },
    require: ['./promise']
  }).then(function (assert, Promise, promisedArray) {

    assert.strictEqual(typeof Promise, 'function', 'async is actually a function');
    assert.strictEqual(typeof Promise.async, 'function', 'async.Promise is also a function');

    assert.ok($.isArray(promisedArray), 'both promised values are present');
    assert.strictEqual(promisedArray.length, 2, 'promisedArray has two member as we expect');

    assert.strictEqual(promisedArray[0], 'This is just a simple promised string!', 'async works as expected!');
    assert.strictEqual(promisedArray[0], promisedArray[1], 'async and async.Promise both work as expected!');

    // assert.strictEqual(promisedArray[2], 'Error: ' + promisedArray[0], 'async handles promise rejection');

    // assert.ok(promisedArray[3] instanceof Error, 'async handles errors and exceptions:1');
    // assert.strictEqual(promisedArray[3].message, 'This is just a simple promised string!', 'async handles errors and exceptions:message1');

    // assert.ok(promisedArray[4] instanceof Error, 'async handles errors and exceptions:2');
    // assert.strictEqual(promisedArray[4].message, 'This is just a simple error message!', 'async handles errors and exceptions:message2');

    var genFN,
      asyncGen1,
      asyncGen2;

    genFN = function * () {
      var str = yield 'str';
      return str;
    };

    asyncGen1 = Promise.async(genFN);
    asyncGen2 = Promise.async(genFN);

    assert.strictEqual(asyncGen1, asyncGen2, 'async caches the async alternative of function generators!');

    global.Promise = global.NativePromise;
  });
});