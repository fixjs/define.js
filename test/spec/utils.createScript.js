define(function () {
  'use strict';

  function testCreateScript(assert, utils, info, doc, baseInfo) {

    assert.strictEqual(typeof utils.getUrl, 'function', 'utils.getUrl is a dependency');

    var callback = sinon.stub(),
      errorCallback = sinon.stub(),
      el,
      origType = info.options.scriptType,
      origBaseElement = baseInfo.baseElement,
      url = 'lib/testModule';

    info.options.scriptType = undefined;
    baseInfo.baseElement = undefined;

    el = utils.createScript(url, callback, errorCallback);
    assert.equal(typeof el, 'object', 'utils.createScript works ...');

    assert.equal(typeof el.nodeName, 'string', 'utils.createScript works ...');
    assert.equal(el.nodeName.toLowerCase(), 'script', 'utils.createScript works ...');

    assert.equal(typeof el.tagName, 'string', 'utils.createScript works ...');
    assert.equal(el.tagName.toLowerCase(), 'script', 'utils.createScript works ...');

    assert.strictEqual(el.async, true, 'utils.createScript works ...');
    assert.strictEqual(el.type, 'text/javascript', 'utils.createScript works ...');
    assert.strictEqual(el.charset, 'utf-8', 'utils.createScript works ...');

    info.options.scriptType = 'my-own-datatype/javascript';

    el = utils.createScript(url, callback, errorCallback);
    assert.strictEqual(el.type, 'my-own-datatype/javascript', 'utils.createScript reads dataType from options ...');

    //tests for baseElement

    info.options.scriptType = origType;
    baseInfo.baseElement = origBaseElement;

    //more DOM tests
  }

  fix.test('utils.createScript', {
    message: 'utils.createScript works as a helper utils functions',
    module: {
      beforeEach: function (assert) {
        fix.stubInsertAndAppend();
      },
      afterEach: function () {
        fix.restoreInsertAndAppend();
      }
    },
    require: ['./utils.createScript', './var/info', './var/doc', './baseInfo']
  }).then(function (assert, utils, info, doc, baseInfo) {

    assert.strictEqual(typeof utils.createScript, 'function', 'utils.createScript is a function');
    testCreateScript(assert, utils, info, doc, baseInfo);

    global.utils = utils;

  });
});