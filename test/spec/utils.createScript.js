define(function () {
  'use strict';

  var $ = global.jQuery;

  function stubCreateElement(assert, el){
    assert.stub(document, 'createElementNS')
      .withArgs('http://www.w3.org/1999/xhtml', 'script')
      .returns(el);
    assert.stub(document, 'createElement')
      .withArgs('script')
      .returns(el);
  }

  function restoreCreateElement(){
    document.createElementNS.restore();
    document.createElement.restore();
  }

  function testCreateScript(assert, utils, info, doc, baseInfo) {

    assert.strictEqual(typeof utils.getUrl, 'function', 'utils.getUrl is a dependency');

    var callback = sinon.stub(),
      errorCallback = sinon.stub(),
      el = $('<script>', {
        src: 'lib/testModule.js'
      }).get(0),
      origType = info.options.scriptType,
      origBaseElement = baseInfo.baseElement,
      url = 'lib/testModule',
      callbackArg0,
      callbackArg1;

    // assert.stub(el, 'attachEvent');
    assert.stub(el, 'addEventListener');
    assert.stub(el, 'removeEventListener');

    // utils.createScript.withArgs('lib/testModule', callback, callback).returns(el);

    info.options.scriptType = undefined;
    baseInfo.baseElement = undefined;

    stubCreateElement(assert, el);
    el = utils.createScript(url, callback, errorCallback);
    restoreCreateElement();

    assert.ok(el.addEventListener.calledTwice, 'el.addEventListener for load and error');

    callbackArg0 = el.addEventListener.getCall(0).args[1];
    callbackArg1 = el.addEventListener.getCall(1).args[1];
    assert.strictEqual(typeof callbackArg0, 'function', 'callbackArg0 is a function');
    assert.strictEqual(typeof callbackArg1, 'function', 'callbackArg1 is a function');

    var e = {
      currentTarget: el,
      type: 'load'
    };

    // el.readyState = 'complete' or el.readyState = 'loaded'
    callbackArg0(e);

    assert.ok(callback.calledOnce, 'callback gets called with event callback');
    assert.ok(callback.calledWith('success'), 'callback gets called with event callback');
    assert.ok(el.removeEventListener.calledOnce, 'el.removeEventListener gets called to remove the load event');

    callbackArg1(e);

    assert.ok(errorCallback.calledOnce, 'callback gets called with event callback:error');
    assert.ok(errorCallback.calledWith('error'), 'callback gets called with event callback:error');
    assert.ok(el.removeEventListener.calledTwice, 'el.removeEventListener gets called to remove the load event:error');

    assert.strictEqual(el.async, true, 'utils.createScript works ...');
    assert.strictEqual(el.type, 'text/javascript', 'utils.createScript works ...');
    assert.strictEqual(el.charset, 'utf-8', 'utils.createScript works ...');

    info.options.scriptType = 'my-own-datatype/javascript';

    stubCreateElement(assert, el);
    el = utils.createScript(url, callback, errorCallback);
    restoreCreateElement();

    assert.strictEqual(el.type, 'my-own-datatype/javascript', 'utils.createScript reads dataType from options ...');

    //tests for baseElement

    info.options.scriptType = origType;
    baseInfo.baseElement = origBaseElement;

    // el.attachEvent.restore();
    el.addEventListener.restore();
  }

  fix.test('utils.createScript', {
    message: 'utils.createScript works as a helper utils functions',
    module: {
      beforeEach: function () {
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