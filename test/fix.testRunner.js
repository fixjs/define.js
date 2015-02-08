(function (g) {
  'use strict';

  var global = g(),
    fix = {},
    QUNIT_BDD_OPTIONS,
    $ = global.jQuery;

  QUNIT_BDD_OPTIONS = {
    GLOBALS: {
      lazy: false, // don't use lazy
      expect: true // use the regular QUnit assertions (or another set altogether)
    }
  };

  global.global = global;
  global.fix = fix;
  global.QUNIT_BDD_OPTIONS = QUNIT_BDD_OPTIONS;

  /*
   * fix.testRunner('utils', {
   *    message: 'testMessage',
   *    expect : 21,
   *    import: [],
   *    module: {},
   *    callback: function(assert, utils){}
   * })
   * .then(function(assert, utils){
   *
   * });
   */
  fix.testRunner = function runTest(moduleName, options) {
    var deferred = $.Deferred();

    QUnit.module(moduleName, options.module);

    QUnit.test(options.message, function (assert) {
      var done = assert.async();

      if (typeof options.expect === 'number') {
        assert.expect(options.expect);
      }
      var requireType = typeof options.require,
        path;

      if (requireType === 'undefined') {
        path = [moduleName];
      } else if (requireType === 'string') {
        path = [options.require];
      } else if ($.isArray(options.require)) {
        path = options.require;
      } else {
        console.error('Invalid options.require attribute');
        return false;
      }
      require(path, function () {
        var args;

        if ($.isFunction(options.callback)) {
          options.callback.apply(assert, arguments);
        }

        args = [assert];
        Array.prototype.push.apply(args, arguments);

        deferred.done(function () {
          done();
        });
        deferred.resolve.apply(deferred, args);
      });
    });
    console.log(moduleName + '.js');
    return deferred;
  };
}(function () {
  return this;
}));