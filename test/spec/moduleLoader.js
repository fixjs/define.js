define(function () {
  'use strict';

  function testInstall(assert, moduleLoader) {

  }

  function testLoad(assert, moduleLoader) {

  }

  function testLoadAll(assert, moduleLoader) {

  }

  function testModuleLoader(assert, moduleLoader, info) {

    assert.strictEqual(typeof moduleLoader.install, 'function', 'moduleLoader.install is a function');
    testInstall(assert, moduleLoader, info);

    assert.strictEqual(typeof moduleLoader.load, 'function', 'moduleLoader.load is a function');
    testLoad(assert, moduleLoader);

    assert.strictEqual(typeof moduleLoader.loadAll, 'function', 'moduleLoader.loadAll is a function');
    testLoadAll(assert, moduleLoader);
  }

  fix.testRunner('moduleLoader', {
    message: 'moduleLoader provides a means for loading modules asyncrounously',
    require: ['./moduleLoader', './var/info']
  }).then(function (assert, moduleLoader, info) {

    assert.strictEqual(typeof moduleLoader, 'object', 'moduleLoader is an object');

    testModuleLoader(assert, moduleLoader, info);

  });
});