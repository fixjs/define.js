define(function () {
  'use strict';
  var AMD = global.AMD,
    $ = global.jQuery;

  function testAMDDefine(assert) {
    var info = AMD.define.info,
      returnValue;

    fix.stubInsertAndAppend();

    assert.stub(console, 'error');
    //Invalid Patterns
    returnValue = AMD.define('invalidModuleName', ['testModule'], {});
    assert.strictEqual(returnValue, false, 'For invalid define calls returnValue is false:0');
    returnValue = undefined;

    returnValue = AMD.define(['testModule'], {});
    assert.strictEqual(returnValue, false, 'For invalid define calls returnValue is false:1');
    returnValue = undefined;

    returnValue = AMD.define({});
    assert.strictEqual(returnValue, false, 'For invalid define calls returnValue is false:2');
    returnValue = undefined;

    assert.ok(console.error.calledThrice, 'Three console.error calls for each of above define calls');
    assert.ok(console.error.alwaysCalledWith('Invalid input parameter to define a module'), 'All console.error calls with relavant message');

    console.error.restore();


    info.options.baseUrl = 'lib';

    //Valid Patterns:
    /*
     * define(moduleName, definitionFunction)
     * file: could be anywhere, this pattern is used for script concatenation
     */
    returnValue = AMD.define('testModule', function () {
      return {
        name: 'testObject for the first pattern: testModule'
      };
    });
    assert.strictEqual(typeof returnValue, 'undefined', 'if define call is valid returnValue should be undefined:testModule');
    returnValue = undefined;

    /*
     * define(moduleName, dependenciesArray, definitionFunction)
     * file: could be anywhere, this pattern is used for script concatenation
     */
    returnValue = AMD.define('testModule1', ['testModule'], function (testModule) {
      return {
        name: 'testObject for the second pattern: testModule1',
        deps: [testModule]
      };
    });
    assert.strictEqual(typeof returnValue, 'undefined', 'if define call is valid returnValue should be undefined:testModule1');
    returnValue = undefined;

    /*
     * define(definitionFunction)
     * file: lib/testModule2.js
     */
    returnValue = AMD.define(function () {
      return {
        name: 'testObject for the 3th pattern: lib/testModule2.js'
      };
    });
    assert.strictEqual(typeof returnValue, 'undefined', 'if define call is valid returnValue should be undefined:testModule2');
    returnValue = undefined;


    AMD.testHelper.currentTestModule = 'lib/testModule3.js';
    /*
     * define(dependenciesArray, definitionFunction)
     * file: lib/testModule3.js
     */
    returnValue = AMD.define(['testModule1', 'testModule2'], function (testModule1, testModule2) {
      return {
        name: 'testObject for the 4th pattern: lib/testModule3.js',
        deps: [testModule1, testModule2]
      };
    });
    assert.strictEqual(typeof returnValue, 'undefined', 'if define call is valid returnValue should be undefined:testModule3');
    returnValue = undefined;

    fix.restoreInsertAndAppend();

    return info;
  }

  function waitingListIsEmpty(info) {
    var keys = Object.keys(info.waitingList),
      i = 0,
      len = keys.length;
    if (!len) {
      return true;
    }
    for (; i < len; i += 1) {
      if (info.waitingList[keys[i]].length) {
        return false;
      }
    }
    return true;
  }

  function continueTestingProcess(assert, info) {
    assert.strictEqual(info.installed.testModule, true, 'testModule is now installed');
    assert.strictEqual(typeof info.modules.testModule, 'object', 'each installed module has a module-definition stored in core modules object');

    assert.deepEqual(info.modules.testModule, {
      name: 'testObject for the first pattern: testModule'
    }, 'definejs core modules object stores the correct module-definition');

    assert.ok(waitingListIsEmpty(info), 'There is no item in the waiting-list');
  }

  function testAMD(assert, amd, loader) {
    var definejs,
      info;

    assert.strictEqual(typeof loader, 'object', 'loader is a dependency');

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

    info = AMD.define.info;

    assert.strictEqual(typeof AMD.define.info, 'object', 'definejs exposes the non-standard define.info object');

    assert.notEqual(info.installed, null, 'definejs core info.installed is not null');
    assert.strictEqual(typeof info.installed, 'object', 'definejs core info.installed is an object');

    assert.notEqual(info.waitingList, null, 'definejs core info.waitingList is not null');
    assert.strictEqual(typeof info.waitingList, 'object', 'definejs core info.waitingList is an object');

    assert.notEqual(info.modules, null, 'definejs core info.modules is not null');
    assert.strictEqual(typeof info.modules, 'object', 'definejs core info.modules is an object');
  }

  function testRequire(assert, utils){
    assert.stub(utils, 'execute');
    
    AMD.require('testModule');

    assert.ok(utils.execute.calledOnce, 'utils.execute to execute the callback, module already defined');

    AMD.require(function(){});

    assert.ok(utils.execute.calledTwice, 'utils.execute to execute the callback, no dependency specified');

    utils.execute.restore();
  }

  fix.test('amd', {
    message: 'amd is the main definejs module',
    module: {
      beforeEach: function () {
        AMD.testHelper.currentTestModule = 'lib/testModule2.js';
        Object.defineProperty(document, 'currentScript', {
          get: function () {
            return $('<script>', {
              'src': AMD.testHelper.currentTestModule
            }).get(0);
          },
          configurable: true
        });
      },
      afterEach: function () {
        AMD.testHelper.currentTestModule = undefined;
        delete document.currentScript;
      }
    },
    require: ['./amd', './loader', './utils']
  }).then(function (assert, amd, loader, utils) {
    assert.strictEqual(typeof amd, 'function', 'amd is the module-definition which is a function');
    testAMD(assert, amd, loader);

    var info = testAMDDefine(assert);
    testAMDDefineInTheNextTurn(info, utils);
  });

  function testAMDDefineInTheNextTurn(info, utils) {
    fix.test('amd/define', {
      message: 'define:standard AMD functions work as they should',
      require: false
    }).then(function (assert) {
      continueTestingProcess(assert, info);
      startTestingRequireInTheNextTurn(utils);
    });
  }

  function startTestingRequireInTheNextTurn(utils) {
    fix.test('amd/require', {
      message: 'require:standard AMD functions work as they should',
      require: false,
      resolver: function () {
        var moduleNames = [
          'testModule',
          'testModule1',
          'testModule2',
          'testModule3',
        ];

        function requirePromise(moduleName) {
          return new Promise(function (fulfill) {
            AMD.require([moduleName], fulfill);
          });
        }

        return Promise.all(moduleNames.map(requirePromise));
      }
    }).then(function (assert, allTestModules) {

      var testModuleObject = {
          name: 'testObject for the first pattern: testModule'
        },
        testModuleObject1 = {
          name: 'testObject for the second pattern: testModule1',
          deps: [testModuleObject]
        },
        testModuleObject2 = {
          name: 'testObject for the 3th pattern: lib/testModule2.js'
        },
        testModuleObject3 = {
          name: 'testObject for the 4th pattern: lib/testModule3.js',
          deps: [testModuleObject1, testModuleObject2]
        };

      assert.ok($.isArray(allTestModules), 'allTestModules is an array');
      assert.strictEqual(allTestModules.length, 4, 'allTestModules.length is 4');

      assert.deepEqual(allTestModules[0], testModuleObject, 'AMD require works perfectly:0');
      assert.deepEqual(allTestModules[1], testModuleObject1, 'AMD require works perfectly:1');
      assert.deepEqual(allTestModules[2], testModuleObject2, 'AMD require works perfectly:2');
      assert.deepEqual(allTestModules[3], testModuleObject3, 'AMD require works perfectly:3');

      testRequire(assert, utils);

    });
  }

});