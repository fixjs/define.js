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

  var AMD = {
    testHelper: {}
  };

  global.AMD = AMD;
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
      testObserver,
      module = options.module;

    QUnit.module(moduleName, module);

    QUnit.test(options.message, function (assert) {
      var done = assert.async();

      assert.spy = FN(this.spy, this);
      assert.stub = this.stub; //FN(this.stub, this);
      assert.mock = FN(this.mock, this);
      assert.sandbox = this.sandbox;

      assert.stop = function(){
        //assert.done
        if(!assert.stopped){
          done();
          assert.stopped = true;
        }
      };

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
          
          try{
            dfdResult = options.resolver.apply(undefined, args);
          } catch(err){
            console.log('[[Error on invoking the resolver function]]');
          }
          
          dfdResult.done(function (value) {
            args.push(value);
            deferred.then(assert.stop);
            deferred.resolve.apply(deferred, args);
          });
        } else {
          deferred.then(assert.stop);
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

    function wrap(moduleName, callback) {
      return function () {
        var result;
        try {
          result = callback.apply(undefined, arguments);
        } catch (err) {
          console.log('\n' + '[[' + moduleName + ']][[RuntimeException]][DEV]:', err);
          result = err;
        }
        return result;
      };
    }

    testObserver = {
      deferred: deferred,
      then: function (callback) {
        return deferred.then(wrap(moduleName, callback));
      },
      catch: function (callback) {
        return deferred.fail(wrap(moduleName, callback));
      }
    };

    testObserver.fail = testObserver.catch;

    return testObserver;

    // return deferred;
  };

  fix.stubInsertAndAppend = function () {
    if (AMD.testHelper.headIsStubbed) {
      return;
    }

    var noop = function () {},
      helper = AMD.testHelper;

    var baseElement = document.getElementsByTagName('base')[0];
    helper.head = document.head || document.getElementsByTagName('head')[0];
    if (baseElement) {
      helper.head = baseElement.parentNode;
    }

    Object.defineProperty(helper.head, 'insertBefore', {
      get: function () {
        return noop;
      },
      configurable: true
    });

    Object.defineProperty(helper.head, 'appendChild', {
      get: function () {
        return noop;
      },
      configurable: true
    });
    AMD.testHelper.headIsStubbed = true;
  };

  fix.restoreInsertAndAppend = function () {
    if (AMD.testHelper.headIsStubbed) {
      try {
        delete AMD.testHelper.head.insertBefore;
        delete AMD.testHelper.head.appendChild;
      } catch (e) {
        console.warn('Exception when removing the noop function for insertBefore and appendChild');
      }
      AMD.testHelper.headIsStubbed = false;
    }
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