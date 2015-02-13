(function () {
  'use strict';

  var qTest = QUnit.test,
    $ = global.jQuery;

  if (QUnit.config.karmaIsInCharge && $.isFunction(define._amd)) {
    define._amd();
  }
  sinon.assert.fail = function (msg) {
    QUnit.ok(false, msg);
  };

  sinon.assert.pass = function (assertion) {
    QUnit.ok(true, assertion);
  };

  sinon.config = {
    injectIntoThis: true,
    injectInto: null,
    properties: ['spy', 'stub', 'mock', 'clock', 'sandbox'],
    useFakeTimers: false,
    useFakeServer: false
  };
  QUnit.test = function (testName, expected, callback, async) {
    var func = sinon.test(function(){
      return callback.apply(this, arguments);
    });

    if (arguments.length === 2) {
      callback = expected;
      expected = null;
    }
    return qTest(testName, expected, func, async);
  };

}());