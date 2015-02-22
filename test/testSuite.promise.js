var requirejs = require('requirejs');

requirejs.config({
  baseUrl: 'src',
  nodeRequire: require
});

requirejs([
  // './utils',
  // './main',
  '../test/spec/async'
], function (async) {

  // console.log('typeof utils:' + typeof utils);
  // console.log('typeof async:' + typeof async);

  // QUnit.module('utils');

  // QUnit.test('initial test', function (assert) {

  //   assert.strictEqual(typeof function(){}, 'object', 'utils is an object');
  //   // assert.strictEqual(typeof utils.isObject, 'function', 'utils.isObject is a function');
  //   // assert.strictEqual(typeof utils.isFunction, 'function', 'utils.isFunction is a function');

  //   // assert.strictEqual(typeof main, 'function', 'main is a function');

  //   // assert.strictEqual(main, utils.main, 'main and utils.main are the same!');

  // });
});