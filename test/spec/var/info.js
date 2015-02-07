define(function () {
  'use strict';

  function testInfoAttributes(assert, info) {
    assert.strictEqual(typeof info.options, 'object', 'var/info.options is an Object');
    assert.strictEqual(typeof info.modules, 'object', 'var/info.modules is an Object');
    assert.strictEqual(typeof info.installed, 'object', 'var/info.installed is an Object');
    assert.strictEqual(typeof info.waitingList, 'object', 'var/info.waitingList is an Object');
    assert.strictEqual(typeof info.failedList, 'object', 'var/info.failedList is an Object');
    assert.strictEqual(typeof info.definedModules, 'object', 'var/info.definedModules is an Object');
  }

  fix.testRunner('var info', {
    message: 'is a shared object for all the modules to store the data needed for the moduleLoader!',
    require: './var/info'
  }).then(function (assert, info) {
    
    assert.strictEqual(typeof info, 'object', 'var/info is an Object');
    
    testInfoAttributes(assert, info);

  });
});