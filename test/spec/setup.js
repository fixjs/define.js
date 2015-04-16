define(function () {
  'use strict';

  function testSetup(assert, setup, fix) {
    assert.strictEqual(typeof setup, 'function', 'setup is a function');

    assert.strictEqual(typeof fix, 'object', 'fix is the shared object which stores the shared information');
    assert.notEqual(fix, null, 'fix is not null');

    //The actual tests for setup function
  }

  FIX.test('setup/promised', {
    message: 'setup works for promised modules',
    require: ['./setup', './var/fix'],
    resolver: function (assert, setup, fix) {

      testSetup(assert, setup, fix);
      
      return new Promise(function (fulfill) {
        setTimeout(function () {
          fulfill('resolver works as expected');
        }, 0);
      });
    }
  }).then(function (assert, setup, fix, message) {

    assert.strictEqual(typeof message, 'string', 'resolved message is a string');
    assert.strictEqual(message, 'resolver works as expected', 'resolver works as expected');

  });
});