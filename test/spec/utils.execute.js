define(function () {
  'use strict';

  function testExecute(assert, utils) {
    
    var args = ['args', 'passing', 'to', 'the', 'fn.apply'],
      result;

    function func() {
      return arguments;
    }

    result = utils.execute(func, args);

    assert.equal(typeof result, 'object', 'utils.execute returns the actual return value');

    assert.equal(result.length, args.length, 'utils.execute manages the args correctly');

  }

  fix.testRunner('utils.execute', {
    message: 'utils.execute works as a helper utils functions',
  }).then(function (assert, utils) {

    assert.strictEqual(typeof utils.execute, 'function', 'utils.execute is a function');

    testExecute(assert, utils);

  });
});