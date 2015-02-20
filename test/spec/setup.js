define(function () {
  'use strict';

  function testSetup(assert, setup, info, loader) {
    assert.strictEqual(typeof setup, 'function', 'setup is a function');

    assert.strictEqual(typeof info, 'object', 'info is the shared object which stores the shared information');
    assert.notEqual(info, null, 'info is not null');

    assert.strictEqual(typeof loader, 'object', 'loader is used for testing setup function');
    assert.notEqual(loader, null, 'loader is not null');
  }

  fix.test('setup/promised', {
    message: 'setup works for promised modules',
    require: ['./setup', './var/info', './loader'],
    resolver: function (assert, setup, info, loader) {

      testSetup(assert, setup, info, loader);
      
      return new Promise(function (fulfill) {
        setTimeout(function () {
          fulfill('resolver works as expected');
        }, 0);
      });
    }
  }).then(function (assert, setup, info, loader, message) {

    assert.strictEqual(typeof message, 'string', 'resolved message is a string');
    assert.strictEqual(message, 'resolver works as expected', 'resolver works as expected');

  });
});