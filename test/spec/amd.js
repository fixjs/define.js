define(function () {
  'use strict';

  function testAMDDefine(assert, AMD) {
    var info = AMD.define.info,
      installed = info.installed,
      waitingList = info.waitingList,
      modules = info.modules;

    AMD.define('testModule', [], function () {
      return {
        name: 'testObject'
      };
    });

    assert.notEqual(installed, null, 'definejs core installed is not null');
    assert.strictEqual(typeof installed, 'object', 'definejs core installed is an object');

    assert.notEqual(waitingList, null, 'definejs core waitingList is not null');
    assert.strictEqual(typeof waitingList, 'object', 'definejs core waitingList is an object');

    assert.notEqual(modules, null, 'definejs core modules is not null');
    assert.strictEqual(typeof modules, 'object', 'definejs core modules is an object');

    return {
      AMD: AMD,
      info: info
    };
  }

  function continueTestingProcess(assert, shared) {
    var AMD = shared.AMD,
      info = shared.info;

    assert.strictEqual(info.installed.testModule, true, 'testModule is now installed');

    assert.strictEqual(typeof info.modules.testModule, 'object', 'each installed module has a module-definition stored in core modules object');

    assert.deepEqual(info.modules.testModule, {
      name: 'testObject'
    }, 'definejs core modules object stores the correct module-definition');

    assert.strictEqual(Object.keys(info.waitingList).length, 0, 'There is no item in the waiting-list');
  }

  function testAMD(assert, amd, moduleLoader) {
    var definejs,
      AMD = {};

    //TODO: remove this line
    global.AMD = AMD;

    assert.strictEqual(typeof moduleLoader, 'object', 'moduleLoader is a dependency');

    definejs = amd();

    assert.strictEqual(typeof definejs, 'function', 'moduleDefinition:amd returns the main definejs function');

    definejs(AMD);

    assert.strictEqual(typeof AMD.define, 'function', 'definejs exposes the AMD define');

    assert.strictEqual(typeof AMD.require, 'function', 'definejs exposes the AMD require');

    assert.strictEqual(typeof AMD.define.amd, 'object', 'definejs exposes the standard define.amd object');

    assert.strictEqual(typeof AMD.config, 'function', 'definejs exposes the AMD config on the global object');
    assert.strictEqual(typeof AMD.require.config, 'function', 'definejs exposes the AMD config on the require function similar to RequireJS');
    assert.equal(AMD.config, AMD.require.config, 'definejs exposes the same config function for both global.config and require.config');

    assert.strictEqual(typeof AMD.use, 'function', 'definejs exposes the non-standard global.use function');

    assert.strictEqual(typeof AMD.define.info, 'object', 'definejs exposes the non-standard define.info object');

    return AMD;
  }

  fix.test('amd', {
    message: 'amd is the main definejs module',
    require: ['./amd', './moduleLoader']
  }).then(function (assert, amd, moduleLoader) {
    var AMD,
      shared;

    assert.strictEqual(typeof amd, 'function', 'amd is the module-definition which is a function');

    AMD = testAMD(assert, amd, moduleLoader);

    shared = testAMDDefine(assert, AMD);

    testAMDDefineInTheNextTurn(shared);
  });

  function testAMDDefineInTheNextTurn(shared) {
    fix.test('amd/define', {
      message: 'define:standard AMD functions work as they should',
      require: false
    }).then(function (assert) {
      continueTestingProcess(assert, shared);
      startTestingRequireInTheNextTurn(shared);
    });
  }

  function startTestingRequireInTheNextTurn(shared) {
    fix.test('amd/require', {
      message: 'require:standard AMD functions work as they should',
      require: false,
      resolver: function (assert) {
        return new Promise(function (fulfill) {
          shared.AMD.require(['testModule'], fulfill);
        });
      }
    }).then(function (assert, testModule) {

      assert.deepEqual(testModule, {
        name: 'testObject'
      }, 'AMD require returns the correct module-definition');

    });
  }

});