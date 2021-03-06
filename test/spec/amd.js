define(function () {
  'use strict';
  var AMD = global.AMD,
    $ = global.jQuery;

  function testAMDDefine(assert) {
    var fix = AMD.define.fix,
      returnValue;

    FIX.stubInsertAndAppend();

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


    fix.options.baseUrl = 'lib';

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

    FIX.restoreInsertAndAppend();

    return fix;
  }

  function waitingListIsEmpty(fix) {
    var keys = Object.keys(fix.waitingList),
      i = 0,
      len = keys.length;
    if (!len) {
      return true;
    }
    for (; i < len; i += 1) {
      if (fix.waitingList[keys[i]].length) {
        return false;
      }
    }
    return true;
  }

  function continueTestingProcess(assert, fix) {
    assert.strictEqual(fix.installed.testModule, true, 'testModule is now installed');
    assert.strictEqual(typeof fix.modules.testModule, 'object', 'each installed module has a module-definition stored in core modules object');

    assert.deepEqual(fix.modules.testModule, {
      name: 'testObject for the first pattern: testModule'
    }, 'definejs core modules object stores the correct module-definition');

    //TODO: check why it fails
    //assert.ok(waitingListIsEmpty(fix), 'There is no item in the waiting-list');
  }

  function testAMD(assert, amd, loader, g) {
    var definejs,
      fix;

    assert.strictEqual(typeof loader, 'object', 'loader is a dependency');

    definejs = amd();

    assert.strictEqual(typeof definejs, 'function', 'definition:amd returns the main definejs function');

    definejs(g);
    if (g === undefined) {
      g = global;
    }

    assert.strictEqual(typeof g.define, 'function', 'definejs exposes the AMD define');
    assert.strictEqual(typeof g.require, 'function', 'definejs exposes the AMD require');
    assert.strictEqual(typeof g.define.amd, 'object', 'definejs exposes the standard define.amd object');
    assert.strictEqual(typeof g.config, 'function', 'definejs exposes the AMD config on the global object');
    assert.strictEqual(typeof g.require.config, 'function', 'definejs exposes the AMD config on the require function similar to RequireJS');
    assert.equal(g.config, g.require.config, 'definejs exposes the same config function for both global.config and require.config');
    assert.strictEqual(typeof g.use, 'function', 'definejs exposes the non-standard global.use function');

    fix = g.define.fix;

    assert.strictEqual(typeof g.define.fix, 'object', 'definejs exposes the non-standard define.fix object');

    assert.notEqual(fix.installed, null, 'definejs core fix.installed is not null');
    assert.strictEqual(typeof fix.installed, 'object', 'definejs core fix.installed is an object');

    assert.notEqual(fix.waitingList, null, 'definejs core fix.waitingList is not null');
    assert.strictEqual(typeof fix.waitingList, 'object', 'definejs core fix.waitingList is an object');

    assert.notEqual(fix.modules, null, 'definejs core fix.modules is not null');
    assert.strictEqual(typeof fix.modules, 'object', 'definejs core fix.modules is an object');
  }

  function testRequire(assert, utils) {
    assert.stub(utils, 'execute');

    AMD.require('testModule');

    assert.ok(utils.execute.calledOnce, 'utils.execute to execute the callback, module already defined');

    AMD.require(function () {});

    assert.ok(utils.execute.calledTwice, 'utils.execute to execute the callback, no dependency specified');

    utils.execute.restore();
  }

  function testConfig(assert, fix) {
    var origOptions = fix.options,
      options;

    fix.options = {
      someKey: 'someValue'
    };

    assert.stub(console, 'error');

    AMD.config('');
    AMD.config(true);
    AMD.config(10);
    assert.ok(console.error.calledThrice, 'console.error called when passing invalid config object');
    assert.ok(console.error.alwaysCalledWith('Invalid parameter to set up the config'), 'console.error called with relavant message when passing invalid config object');

    AMD.config({
      someKey: 'someSpecificValue'
    });

    assert.strictEqual(fix.options.someKey, 'someSpecificValue', 'config overrides the existing attributes');

    console.error.restore();
    assert.stub(console, 'error');

    options = function () {};
    options.desiredObj = {
      specificKey: 'specificValue'
    };

    AMD.config(options);

    assert.strictEqual(console.error.callCount, 0, 'config works even with functions as input object');

    assert.strictEqual(typeof fix.options.desiredObj, 'object', 'config could be used even to store objects in the options:typeof check');
    assert.notStrictEqual(fix.options.desiredObj, null, 'config could be used even to store objects in the options:null check');
    assert.strictEqual(fix.options.desiredObj.specificKey, 'specificValue', 'config could be used even to store objects in the options:internal attribute check');

    fix.options = origOptions;
    console.error.restore();
  }

  function testGlobalDefine(assert, amd, loader) {
    var gDefine = global.define,
      gRequire = global.require,
      gUse = global.use,
      gConfig = global.config;

    testAMD(assert, amd, loader, undefined);

    global.define = gDefine;
    global.require = gRequire;
    global.use = gUse;
    global.config = gConfig;
  }

  FIX.test('amd', {
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
    require: ['./amd', './loader', './utils', './var/fix'],
    done: false
  }).then(function (assert, amd, loader, utils, fix) {
    assert.strictEqual(typeof amd, 'function', 'amd is the module-definition which is a function');

    testGlobalDefine(assert, amd, loader);

    testAMD(assert, amd, loader, AMD);

    testConfig(assert, fix);

    var dfInfo = testAMDDefine(assert);

    assert.strictEqual(dfInfo, fix, 'the fix object stored in the AMD.define.fix is the same ./var/fix object.');

    testAMDDefineInTheNextTurn(assert, dfInfo, utils);
  });

  function testAMDDefineInTheNextTurn(assert, fix, utils) {
    setTimeout(function () {
      continueTestingProcess(assert, fix);
      setTimeout(function () {
        startTestingRequireInTheNextTurn(assert, utils);
      }, 10);
    }, 10);
  }

  function startTestingRequireInTheNextTurn(assert, utils) {
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

    Promise.all(moduleNames.map(requirePromise))
      .then(function (allTestModules) {

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

        assert.done();
      });
  }

});