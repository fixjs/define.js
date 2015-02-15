define(function () {
  'use strict';

  function testAMD(assert, amd, moduleLoader) {

    assert.strictEqual(typeof moduleLoader, 'object', 'moduleLoader is a dependency');
    
    var moduleDefinition = amd();

    assert.strictEqual(typeof moduleDefinition, 'function', 'amd returns the module-definition which is a function');
  }

  fix.test('amd', {
    message: 'amd is the main definejs module',
    require: ['./amd', './moduleLoader']
  }).then(function (assert, amd, moduleLoader) {

    assert.strictEqual(typeof amd, 'function', 'amd is a function');
    testAMD(assert, amd, moduleLoader);

  });
});