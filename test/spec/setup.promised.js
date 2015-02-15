define(function () {
  'use strict';

  function testSetupForPromisedModules(assert, setup, info, loader) {
    var testPromise = new Promise(function (fulfill) {
        setTimeout(function () {
          fulfill({
            name: 'moduleName:promised:object',
            loader: loader
          });
        }, 2000);
      }),
      moduleDefinition,
      deps = ['dependencies', 'as', 'args', 'come', 'here'];

    moduleDefinition = sinon.stub();
    moduleDefinition.returns(testPromise);

    setup('promisedAMDModuleName', moduleDefinition, loader, deps);

    assert.ok(moduleDefinition.calledOnce, 'moduleDefinition gets called once to provide the module definition');
    assert.ok(moduleDefinition.calledWith('dependencies', 'as', 'args', 'come', 'here'));

    return testPromise;
  }

  fix.test('setup/promised', {
    message: 'setup works for promised modules',
    require: ['./setup', './var/info'],
    resolver: function (assert, setup, info) {
      var loader = {
        install: sinon.stub()
      };

      loader.install.returns(undefined);

      return testSetupForPromisedModules(assert, setup, info, loader);
    }
  }).then(function (assert, setup, info, promisedObject) {
    var loader = promisedObject.loader;

    assert.notEqual(info.modules, null, 'info.modules is not null');
    assert.notStrictEqual(typeof info.modules.promisedAMDModuleName, 'undefined', 'module:promisedAMDModuleName is setup now');

    assert.deepEqual(info.modules.promisedAMDModuleName, {
      name: 'moduleName:promised:object',
      loader: loader
    }, 'promisedModules store the promise value as the moduleDefinition');

    assert.ok(loader.install.calledOnce, 'moduleDefinition gets called once to provide the module definition');
    assert.ok(loader.install.calledWith('promisedAMDModuleName', 'success'));

  });
});