define(function () {
  'use strict';

  return {
    runTest: function runTest(moduleName, testMessage, modulePath, testRunner) {
      var callback;
      if ($.isFunction(testRunner)) {
        callback = testRunner;
      } else if ($.isPlainObject(testRunner) && $.isFunction(testRunner.run)) {
        callback = testRunner.run;
      }

      QUnit.module("moduleName", testRunner.module);

      QUnit.test(testMessage, function (assert) {
        // assert.expect(3);
        var done = assert.async();
        var path = $.isArray(modulePath) ? modulePath : [modulePath];
        require(path, function () {
          callback.apply(assert, arguments);
          done();
        });
      });
    }
  };
});