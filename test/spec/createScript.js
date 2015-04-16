define(function () {
  'use strict';

  var $ = global.jQuery;

  function stubCreateElement(assert, el) {
    assert.stub(document, 'createElementNS')
      .withArgs('http://www.w3.org/1999/xhtml', 'script')
      .returns(el);
    assert.stub(document, 'createElement')
      .withArgs('script')
      .returns(el);
  }

  function restoreCreateElement() {
    document.createElementNS.restore();
    document.createElement.restore();
  }

  function testCreateScriptWithAttach(assert, utils) {
    var callback = sinon.stub(),
      errorCallback = sinon.stub(),
      el = $('<script>', {
        src: 'lib/testModule2.js'
      }).get(0),
      url = 'lib/testModule2',
      callbackArg0,
      origOpera = global.opera,
      attachEventSupport = $.isFunction(el.attachEvent);

    global.opera = undefined;

    if (attachEventSupport) {
      assert.stub(el, 'attachEvent');
      assert.stub(el, 'detachEvent');
    } else {
      el.attachEvent = sinon.stub();
      el.detachEvent = sinon.stub();
    }

    stubCreateElement(assert, el);
    el = utils.createScript(url, callback, errorCallback);
    restoreCreateElement();

    assert.ok(el.attachEvent.calledOnce, 'el.attachEvent called with onreadystatechange');
    assert.strictEqual(el.attachEvent.getCall(0).args[0], 'onreadystatechange', 'el.attachEvent adds the callback to onreadystatechange event queue');

    callbackArg0 = el.attachEvent.getCall(0).args[1];

    assert.strictEqual(typeof callbackArg0, 'function', 'callbackArg0 is a function');

    var e = {
      currentTarget: el
    };
    el.readyState = 'complete'; //el.readyState = 'loaded'

    callbackArg0(e);

    assert.ok(callback.calledOnce, 'callback gets called with event callback');
    assert.ok(callback.calledWith('success'), 'callback gets called with event callback');

    assert.ok(el.detachEvent.calledOnce, 'el.detachEvent gets called to remove the load event');
    assert.strictEqual(el.detachEvent.getCall(0).args[0], 'onreadystatechange', 'el.detachEvent removes the callback from onreadystatechange event queue');

    assert.strictEqual(errorCallback.callCount, 0, 'errorCallback doesnt get called when attachEvent exist, the whole flow actually works with readyState');

    assert.strictEqual(el.async, true, 'utils.createScript works ...');
    assert.strictEqual(el.type, 'text/javascript', 'utils.createScript works ...');
    assert.strictEqual(el.charset, 'utf-8', 'utils.createScript works ...');

    if (attachEventSupport) {
      el.attachEvent.restore();
      el.detachEvent.restore();
    }
    global.opera = origOpera;
  }

  function testCreateScript(assert, utils, fix, doc, baseInfo) {

    assert.strictEqual(typeof utils.getUrl, 'function', 'utils.getUrl is a dependency');

    var callback = sinon.stub(),
      errorCallback = sinon.stub(),
      el = $('<script>', {
        src: 'lib/testModule.js'
      }).get(0),
      origType = fix.options.scriptType,
      origBaseElement = baseInfo.baseElement,
      url = 'lib/testModule',
      callbackArg0,
      callbackArg1,
      stubbed,
      headInsertLastCall;

    // assert.stub(el, 'attachEvent');
    assert.stub(el, 'addEventListener');
    assert.stub(el, 'removeEventListener');

    // utils.createScript.withArgs('lib/testModule', callback, callback).returns(el);

    fix.options.scriptType = undefined;
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

    fix.options.scriptType = 'my-own-datatype/javascript';
    fix.options.xhtml = true;

    //tests for baseElement
    //<base href="http://www.w3schools.com/images/" target="_blank">
    baseInfo.baseElement = $('<base>', {
      href: '/baseUrl'
    }).appendTo(baseInfo.head).get(0);

    stubCreateElement(assert, el);
    el = utils.createScript(url, callback, errorCallback);
    stubbed = document.createElementNS;
    restoreCreateElement();
    $(baseInfo.baseElement).remove();

    assert.strictEqual(el.type, 'my-own-datatype/javascript', 'utils.createScript reads dataType from options ...');

    //el, baseInfo.baseElement
    headInsertLastCall = baseInfo.head.insertBefore.lastCall;
    assert.strictEqual(headInsertLastCall.args[0], el, 'utils.createScript reads dataType from options ...');
    assert.strictEqual(headInsertLastCall.args[1], baseInfo.baseElement, 'utils.createScript reads dataType from options ...');

    assert.ok(stubbed.calledOnce, 'document.createElementNS gets called when { xhtml: true }');

    fix.options.scriptType = origType;
    baseInfo.baseElement = origBaseElement;

    // el.attachEvent.restore();
    el.addEventListener.restore();
  }

  FIX.test('createScript', {
    message: 'createScript works as a helper utils functions',
    module: {
      beforeEach: function () {
        FIX.stubInsertAndAppend();
      },
      afterEach: function () {
        FIX.restoreInsertAndAppend();
      }
    },
    require: ['./utils', './createScript', './var/fix', './var/doc', './baseInfo']
  }).then(function (assert, utils, createScript, fix, doc, baseInfo) {

    assert.strictEqual(typeof createScript, 'function', 'utils.createScript is a function');

    testCreateScript(assert, utils, fix, doc, baseInfo);

    testCreateScriptWithAttach(assert, utils);

    global.utils = utils;

  });
});