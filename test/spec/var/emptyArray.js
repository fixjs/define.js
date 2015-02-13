define(function () {
  'use strict';

  fix.test('var emptyArray', {
    message: 'is a shared empty array!',
    require: './var/emptyArray'
  }).then(function (assert, emptyArray) {

    assert.strictEqual(typeof emptyArray, 'object', 'var/emptyArray is an Object');

    assert.strictEqual(Object.prototype.toString.call(emptyArray), '[object Array]', 'var/emptyArray is an Array');

    assert.strictEqual(emptyArray.length, 0, 'var/emptyArray is really empty!');

  });
});