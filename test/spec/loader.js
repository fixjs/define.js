define(function () {
  'use strict';

  var moduleObject = {
      name: 'a sample moduleObject for testing: moduleName'
    },
    moduleObject2 = {
      name: 'a sample moduleObject for testing: moduleName2'
    };

  function testInstallSuccess(assert, loader, info) {
    var moduleName = 'firstModule',
      fakeWaitingList = [],
      callback = sinon.stub();

    info.waitingList = {};
    info.installed = {};
    info.failedList = {};

    fakeWaitingList.push(callback);
    info.waitingList[moduleName] = fakeWaitingList;

    loader.install(moduleName, 'success');

    assert.strictEqual(typeof info.installed[moduleName], 'boolean', 'info.installed[moduleName] exists after loader.install(...)');
    assert.strictEqual(info.installed[moduleName], true, 'info.installed[moduleName] sets to true');

    assert.strictEqual(typeof info.failedList[moduleName], 'undefined', 'in successful operations failedList is empty');

    assert.strictEqual(info.waitingList[moduleName], fakeWaitingList, 'waitingList keeps the original array object when clearing');
    assert.strictEqual(fakeWaitingList.length, 0, 'waiting-list gets empty after installation');

    assert.ok(callback.calledOnce, 'loader.install calles all the callbacks in the waiting-list each exactly once!');
    assert.ok(callback.calledWith('success'), 'loader.install calles the callback with the specified status:success');

  }

  function testInstallFailure(assert, loader, info) {
    var moduleName = 'secondModule',
      fakeWaitingList = [],
      callback = sinon.stub();

    info.waitingList = {};
    info.installed = {};
    info.failedList = {};

    fakeWaitingList.push(callback);
    info.waitingList['secondModule'] = fakeWaitingList;

    loader.install(moduleName, 'failure');

    assert.strictEqual(typeof info.failedList[moduleName], 'boolean', 'moduleName goes to info.failedList after failed process');
    assert.strictEqual(info.failedList[moduleName], true, 'info.failedList[moduleName] sets to true');

    assert.strictEqual(typeof info.installed[moduleName], 'undefined', 'in unsuccessful operations failedList is empty');

    assert.strictEqual(info.waitingList[moduleName], fakeWaitingList, 'waitingList keeps the original array object when clearing');
    assert.strictEqual(fakeWaitingList.length, 0, 'waiting-list gets empty after installation');

    assert.ok(callback.calledOnce, 'loader.install calles all the callbacks in the waiting-list each exactly once!');
    assert.ok(callback.calledWith('failure'), 'loader.install calles the callback with the specified status:failure');
  }

  function testLoad(assert, loader, info, utils) {
    info.waitingList = {};
    info.installed = {};
    info.failedList = {};

    var callback = sinon.stub(),
      anotherCallback = sinon.stub(),
      theOtherCallback = sinon.stub();

    // assert.stub(loader, 'install');
    assert.stub(utils, 'getScript');

    loader.load('moduleName', callback);

    assert.ok($.isArray(info.waitingList['moduleName']), 'loader.install calles all the callbacks in the waiting-list each exactly once!');
    assert.strictEqual(info.waitingList['moduleName'][0], callback, 'loader.load stores callback functions in waitingList');
    assert.ok(utils.getScript.calledOnce, 'utils.getScript gets called just once!');

    loader.load('moduleName', anotherCallback);

    assert.strictEqual(info.waitingList['moduleName'][1], anotherCallback, 'loader.load stores callback functions in waitingList');
    assert.ok(utils.getScript.calledOnce, 'utils.getScript gets called just once!');

    loader.install('moduleName', 'success');
    assert.ok(callback.calledOnce, 'utils.getScript gets called just once!');
    assert.ok(callback.calledWith('success'), 'loader.install calles the callback with the specified status:success');

    assert.ok(anotherCallback.calledOnce, 'utils.getScript gets called just once!');
    assert.ok(anotherCallback.calledWith('success'), 'loader.install calles the callback with the specified status:success');

    assert.strictEqual(info.waitingList['moduleName'].length, 0, 'loader.install clears the waitingList');


    //FAKE VALUE SETUP
    info.modules['moduleName'] = moduleObject;

    loader.load('moduleName', theOtherCallback);
    assert.ok(theOtherCallback.calledOnce, 'callback gets called just once!');
    assert.ok(theOtherCallback.calledWith(moduleObject), 'loader.load calles the callback with the module value if it exists if not it will only pass the status');

    assert.ok(utils.getScript.calledOnce, 'utils.getScript gets called just once for several load calls!');

    utils.getScript.restore();
  }

  function testLoadAll(assert, loader, info) {
    var callback = sinon.stub();

    //ANOTHER FAKE VALUE SETUP
    info.modules['moduleName2'] = moduleObject2;
    info.installed['moduleName2'] = true;

    loader.loadAll(['moduleName', 'moduleName2'], callback);

    assert.ok(callback.calledOnce, 'callback gets called just once!');
    assert.propEqual(callback.getCall(0).args[0], [moduleObject, moduleObject2], 'callback gets eventually called with true!');

    assert.stub(loader, 'load');

    loader.loadAll(['moduleName', 'moduleName2'], callback);

    assert.ok(loader.load.calledTwice, 'callback gets called twice!');

    assert.strictEqual(loader.load.getCall(0).args[0], 'moduleName', 'loadAll calls loader.load with correct args:0');
    assert.strictEqual(loader.load.getCall(1).args[0], 'moduleName2', 'loadAll calls loader.load with correct args:1');

    loader.load.restore();
  }

  function testLoader(assert, loader, info, utils) {
    var origWaitingList = info.waitingList,
      origInstalled = info.installed,
      origFailedList = info.failedList;

    assert.strictEqual(typeof loader.install, 'function', 'loader.install is a function');
    testInstallSuccess(assert, loader, info);
    testInstallFailure(assert, loader, info);

    assert.strictEqual(typeof loader.load, 'function', 'loader.load is a function');
    testLoad(assert, loader, info, utils);

    assert.strictEqual(typeof loader.loadAll, 'function', 'loader.loadAll is a function');
    testLoadAll(assert, loader, info);

    info.waitingList = origWaitingList;
    info.installed = origInstalled;
    info.failedList = origFailedList;
  }

  fix.test('loader', {
    message: 'loader provides a means for loading modules asyncrounously',
    require: ['./loader', './var/info', './utils']
  }).then(function (assert, loader, info, utils) {

    assert.strictEqual(typeof loader, 'object', 'loader is an object');
    testLoader(assert, loader, info, utils);

  });
});