define(function () {
  'use strict';
  var Promise = global.Promise,
    $ = global.jQuery;

  function testUse(assert, g) {
    var thePerfectModule = {
      name: 'my.perfect.module'
    };

    assert.stub(g, 'require');

    var returnValue = g.use(['any.moduleName', 'could.be.used.here']);

    assert.ok(g.require.calledOnce, 'g.use calles g.require to require the module!');
    assert.ok(returnValue instanceof Promise, 'g.use returns a Promise!');

    g.use('my.perfect.module')
      .then(function (myPerfectModule) {

        assert.strictEqual(typeof myPerfectModule, 'object', 'g.use passes the promise-values/module-definitions to callbacks');

        return myPerfectModule.module;
      })
      .then(function (module) {

        assert.strictEqual(module, thePerfectModule, 'g.use passes the correct promise-values/module-definitions to callbacks');

        return module.name;
      })
      .then(function (name) {

        assert.strictEqual(name, 'my.perfect.module', 'g.use passes the promise values to chained callbacks:last chained then');

        return 'success';
      })
      .done(function (status) {

        assert.strictEqual(status, 'success', 'g.use passes the promise values to chained callbacks:done');

        assert.done();
      });

    var fulfillCallbackArg = g.require.getCall(1).args[1];

    assert.ok($.isFunction(fulfillCallbackArg), 'g.use passes the fulfill function as the require callback.');

    fulfillCallbackArg({
      module: thePerfectModule
    });

    g.require.restore();
  }

  FIX.test('amd/use', {
    message: 'use is a promise based helper function to require AMD modules',
    done: false,
    require: ['./amd']
  }).then(function (assert, amd) {
    var g = {},
      definejs;

    assert.strictEqual(typeof amd, 'function', 'amd has a function definition');
    
    definejs = amd();

    assert.strictEqual(typeof definejs, 'function', 'definition:amd returns the main definejs function:use tests');

    definejs(g);

    // testUse(assert, g);
  });

});