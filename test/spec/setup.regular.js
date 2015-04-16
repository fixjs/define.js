define(function () {
  'use strict';

  function testSetupForRegularAMD(assert, setup, fix, loader) {
    var testModuleObject = {
        name: 'moduleName:amd:object'
      },
      moduleDefinition,
      deps = ['dependencies', 'as', 'args', 'come', 'here'];

    moduleDefinition = sinon.stub();
    moduleDefinition.returns(testModuleObject);

    setup(loader, 'regularAMDModuleName', moduleDefinition, deps, deps);

    assert.ok(moduleDefinition.calledOnce, 'moduleDefinition gets called once to provide the module definition');
    assert.ok(moduleDefinition.calledWith('dependencies', 'as', 'args', 'come', 'here'));
  }

  FIX.test('setup/regular', {
    message: 'setup works for regular AMD modules',
    require: ['./setup', './var/fix'],
    resolver: function (assert, setup, fix) {
      var loader = {
        install: sinon.stub()
      };
      loader.install.returns(undefined);

      testSetupForRegularAMD(assert, setup, fix, loader);

      return new Promise(function (fulfill) {
        setTimeout(function () {
          fulfill(loader);
        }, 0);
      });
    }
  }).then(function (assert, setup, fix, loader) {

    assert.notEqual(fix.modules, null, 'fix.modules is not null');
    assert.notStrictEqual(typeof fix.modules.regularAMDModuleName, 'undefined', 'module:regularAMDModuleName is setup now');

    assert.ok(loader.install.calledOnce, 'moduleDefinition gets called once to provide the module definition');
    assert.ok(loader.install.calledWith('regularAMDModuleName', 'success'));

  });
});