define(function * (exports, module) {

  var $ = yield require('../vendor/jquery');

  function delayedObject(resolved) {
    var deferred = $.Deferred();

    setTimeout(function () {
      if (resolved) {
        deferred.resolve('Actual value of delayedObject');
      } else {
        deferred.reject(new Error('rejected delayedObject'));
      }
    }, 2000);

    return deferred.promise();
  }

  module.exports = delayedObject;
});