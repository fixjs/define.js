define(function () {
  'use strict';

  function testSetupForRegularAMD(assert, setup, info, loader) {
    var testModuleObject = {
        name: 'moduleName:amd:object'
      },
      moduleDefinition,
      deps = ['dependencies', 'as', 'args', 'come', 'here'];

    moduleDefinition = sinon.stub();
    moduleDefinition.returns(testModuleObject);

    setup('regularAMDModuleName', moduleDefinition, loader, deps);

    assert.ok(moduleDefinition.calledOnce, 'moduleDefinition gets called once to provide the module definition');
    assert.ok(moduleDefinition.calledWith('dependencies', 'as', 'args', 'come', 'here'));
  }

  fix.test('setup/regular', {
    message: 'setup works for regular AMD modules',
    require: ['./setup', './var/info'],
    resolver: function (assert, setup, info) {
      var loader = {
        install: sinon.stub()
      };
      loader.install.returns(undefined);

      testSetupForRegularAMD(assert, setup, info, loader);

      return new Promise(function (fulfill) {
        setTimeout(function () {
          fulfill(loader);
        }, 0);
      });
    }
  }).then(function (assert, setup, info, loader) {

    assert.notEqual(info.modules, null, 'info.modules is not null');
    assert.notStrictEqual(typeof info.modules.regularAMDModuleName, 'undefined', 'module:regularAMDModuleName is setup now');

    assert.ok(loader.install.calledOnce, 'moduleDefinition gets called once to provide the module definition');
    assert.ok(loader.install.calledWith('regularAMDModuleName', 'success'));

  });
});