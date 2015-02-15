(function (g) {
  'use strict';

  var global = g(),
    fix = {},
    QUNIT_BDD_OPTIONS,
    $ = global.jQuery,
    gKarma = global.__karma__;

  QUNIT_BDD_OPTIONS = {
    GLOBALS: {
      lazy: false, // don't use lazy
      expect: true // use the regular QUnit assertions (or another set altogether)
    }
  };

  function FN(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }

  global.global = global;
  global.fix = fix;
  global.QUNIT_BDD_OPTIONS = QUNIT_BDD_OPTIONS;

  QUnit.config.karmaIsInCharge = gKarma && typeof gKarma === 'object';
  /*
   * fix.test('utils', {
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
  fix.test = function test(moduleName, options) {
    var deferred = $.Deferred(),
      module = options.module;

    QUnit.module(moduleName, module);

    QUnit.test(options.message, function (assert) {
      var done = assert.async();

      assert.spy = FN(this.spy, this);
      assert.stub = this.stub; //FN(this.stub, this);
      assert.mock = FN(this.mock, this);
      assert.sandbox = this.sandbox;

      if (typeof options.expect === 'number') {
        assert.expect(options.expect);
      }
      var requireType = typeof options.require,
        path;

      function callback() {
        var args = [assert],
          dfdResult;

        Array.prototype.push.apply(args, arguments);

        if ($.isFunction(options.resolver)) {
          dfdResult = options.resolver.apply(undefined, args);
          dfdResult.done(function (value) {
            args.push(value);
            deferred.then(function () {
              done();
            });
            deferred.resolve.apply(deferred, args);
          });
        } else {
          deferred.then(function () {
            done();
          });
          deferred.resolve.apply(deferred, args);
        }
      }

      if (requireType === 'boolean' && !options.require) {
        callback();
      } else {
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
        require(path, callback);
      }
    });
    // console.log(moduleName + '.js');

    deferred.fail(function (moduleName) {
      return function () {
        console.log('((((fail on :' + moduleName + '))))');
        console.log('fail args:', arguments);
      };
    }(moduleName));

    return deferred;
  };

  //this hack is used for loading sinon in global mode when karma is in charge
  //using requirejs in karma.conf as a framework makes it difficult to load global sinon
  if (QUnit.config.karmaIsInCharge && typeof define === 'function') {
    define._amd = (function (amdObj) {
      return function () {
        define.amd = amdObj;
      };
    }(define.amd));

    define.amd = false;
  }

}(function () {
  return this;
}));