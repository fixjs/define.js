define(function () {
  'use strict';

  function testExecute(assert, utils, emptyArray) {

    var args = ['args', 'passing', 'to', 'the', 'fn.apply'],
      result,
      exp,
      callback;

    callback = sinon.stub();
    callback.withArgs('test').returns('return value');
    callback.withArgs('args', 'passing', 'to', 'the', 'fn.apply').returns(args);
    callback.withArgs('error').throws('TypeError');
    callback.returns('done');

    result = utils.execute(callback, ['test']);

    assert.ok(callback.calledOnce, 'utils.execute executes the callback exactly once:1');
    assert.equal(result, 'return value', 'utils.execute returns the actual return value:1');

    result = utils.execute(callback, args);
    assert.ok(callback.calledTwice, 'utils.execute executes the callback exactly once:2');
    assert.equal(result, args, 'utils.execute returns the actual return value:2');

    try {
      utils.execute(callback, ['error']);
      exp = false;
    } catch (err) {
      exp = err;
    }

    assert.strictEqual(exp, false, 'utils.execute ignores the exception if the passed function throws any');
    assert.ok(callback.calledThrice, 'utils.execute returns the actual return value:3');

    /*******************second*callback********************/
    callback = function (){
      return arguments;
    };
    emptyArray.push('This shouldnt happen in the real world, emptyArray is just to prevent us from making new empty arrays!');
    
    result = utils.execute(callback);
    
    assert.equal(result.length, 1, 'utils.execute returns the arguments with one single member (we made it to do that of course).');
    assert.equal(result[0], emptyArray[0], 'utils.execute correctly passes emptyArray to apply');
    emptyArray.splice(0, 1);

    result = utils.execute(callback);
    assert.strictEqual(typeof result, 'object', 'utils.execute no args, no return value');
    assert.strictEqual(result.length, 0, 'utils.execute no args, no return value');
    assert.strictEqual(typeof result[0], 'undefined', 'utils.execute no args, no return value');
  }

  fix.test('utils.execute', {
    message: 'utils.execute works as a helper utils functions',
    require: ['utils.execute', './var/emptyArray']
  }).then(function (assert, utils, emptyArray) {

    assert.strictEqual(typeof utils.execute, 'function', 'utils.execute is a function');

    testExecute(assert, utils, emptyArray);

  });
});