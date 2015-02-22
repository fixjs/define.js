define(function () {
  'use strict';

  fix.test('SAMPLE', {
    message: 'A SAMPLE TEST',
    require: false
  }).then(function (assert) {

    assert.strictEqual(typeof 'string', 'string', 'just a string');

    function * gen() {
      var x = yield 12;
      return x;
    }
    
    assert.strictEqual(typeof gen, 'function', 'gen is a function');
  });
});