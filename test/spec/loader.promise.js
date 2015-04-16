define(function () {
  'use strict';

  function testLoader(assert, loader) {
    assert.strictEqual(typeof loader.install, 'function', 'loader.install is a function');

    assert.strictEqual(typeof loader.load, 'function', 'loader.load is a function');

    assert.strictEqual(typeof loader.loadAll, 'function', 'loader.loadAll is a function');
  }

  FIX.test('loader.promise', {
    message: 'loader.promise provides a promise based solution for loading modules asyncrounously',
    require: ['./loader.promise']
  }).then(function (assert, loader) {

    assert.strictEqual(typeof loader, 'object', 'loader is an object');
    testLoader(assert, loader);

  });
});