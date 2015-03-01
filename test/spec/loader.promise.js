define(function () {
  'use strict';

  fix.test('loader.promise', {
    message: 'loader.promise provides a promise based solution for loading modules asyncrounously',
    require: ['./loader.promise', './var/info', './utils']
  }).then(function (assert, loader, info, utils) {

    assert.strictEqual(typeof loader, 'object', 'loader is an object');
    testLoader(assert, loader, info, utils);

  });
});