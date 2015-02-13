define(function * (exports, module) {

  var delayedObject = yield require('delayedObject'),
    co = yield require('../vendor/co');

  console.log('[CO][FIRST]' + new Date().toLocaleString());

  function f1(resolved) {
    var promise = co(function * () {
      return yield delayedObject(resolved);
    });
    promise.then(function (val) {
      return val;
    }, function (err) {
      return err;
    });
    return promise;
  }

  module.exports = f1(false).catch(function (err) {
    console.error('[CO][SECOND]' + new Date().toLocaleString(), err);
    var promise = f1(true);
    promise.then(function(moduleValue){
      console.log('[CO][FINAL]' + new Date().toLocaleString(), moduleValue);
    });
    return promise;
  });
});