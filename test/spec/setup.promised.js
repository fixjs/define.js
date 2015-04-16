define(function () {
  'use strict';

  function testSetupForPromisedModules(assert, setup, fix, Promise, loader) {
    function testPromiseFN(fulfill) {
      setTimeout(function () {
        fulfill({
          name: 'moduleName:promised:object',
          loader: loader
        });
      }, 100);
    }
    var testPromise = new Promise(testPromiseFN),
      moduleDefinition,
      deps = ['dependencies', 'as', 'args', 'come', 'here'];

    moduleDefinition = sinon.stub();
    moduleDefinition.returns(testPromise);

    setup(loader, 'promisedAMDModuleName', moduleDefinition, deps, deps);

    assert.ok(moduleDefinition.calledOnce, 'moduleDefinition gets called once to provide the module definition');
    assert.ok(moduleDefinition.calledWith('dependencies', 'as', 'args', 'come', 'here'));

    window._testPromise = testPromise;
    return testPromise;
  }

  FIX.test('setup/promised', {
    message: 'setup works for promised modules',
    require: ['./setup', './var/fix', './promise'],
    resolver: function (assert, setup, fix, Promise) {
      var loader = {
        install: sinon.stub()
      };
      setup.add(loader);

      loader.install.returns(undefined);

      return testSetupForPromisedModules(assert, setup, fix, Promise, loader);
    }
  }).then(function (assert, setup, fix, promisedObject) {
    var loader = fix.modules.promisedAMDModuleName.loader;

    assert.notEqual(fix.modules, null, 'fix.modules is not null');
    assert.notStrictEqual(typeof fix.modules.promisedAMDModuleName, 'undefined', 'module:promisedAMDModuleName is setup now');

    assert.equal(fix.modules.promisedAMDModuleName.name, 'moduleName:promised:object', 'promisedModules store the promise value as the moduleDefinition');

    assert.deepEqual(fix.modules.promisedAMDModuleName, {
      name: 'moduleName:promised:object',
      loader: loader
    }, 'promisedModules store the promise value as the moduleDefinition');

    assert.ok(loader.install.calledOnce, 'moduleDefinition gets called once to provide the module definition');
    assert.ok(loader.install.calledWith('promisedAMDModuleName', 'success'));

  });
});