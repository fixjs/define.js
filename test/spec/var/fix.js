define(function () {
  'use strict';

  function testInfoAttributes(assert, fix) {
    assert.strictEqual(typeof fix.options, 'object', 'var/fix.options is an Object');
    assert.strictEqual(typeof fix.modules, 'object', 'var/fix.modules is an Object');
    assert.strictEqual(typeof fix.installed, 'object', 'var/fix.installed is an Object');
    assert.strictEqual(typeof fix.waitingList, 'object', 'var/fix.waitingList is an Object');
    assert.strictEqual(typeof fix.failedList, 'object', 'var/fix.failedList is an Object');
    assert.strictEqual(typeof fix.definedModules, 'object', 'var/fix.definedModules is an Object');
  }

  FIX.test('var fix', {
    message: 'is a shared object for all the modules to store the data needed for the moduleLoader!',
    require: './var/fix'
  }).then(function (assert, fix) {
    assert.strictEqual(typeof fix, 'object', 'var/fix is an Object');
    testInfoAttributes(assert, fix);
  });
});