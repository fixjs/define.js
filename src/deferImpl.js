define([
  './will',
  './utils/isPromiseAlike',
], function (will, isPromiseAlike) {
  function deferImpl(Promise) {
    function resolve(value, baseFulfill, baseReject, save) {
      var promise;
      if (isPromiseAlike(value)) {
        will(value).done(baseFulfill, baseReject);
        promise = value;
      } else {
        promise = new Promise(function (fulfill) {
          fulfill(value);
          baseFulfill(value);
        });
      }
      save(promise);
    }

    function reject(reason, baseReject, save) {
      save(new Promise(function (fulfill, reject) {
        reject(reason);
        baseReject(reason);
      }));
    }

    function defer() {
      var resolvedPromise,
        baseFulfill,
        baseReject,
        dfd = {},
        promise = new Promise(function (fulfill, reject) {
          baseFulfill = fulfill;
          baseReject = reject;
        });

      function save(newPromise) {
        resolvedPromise = newPromise;
        promise.source = newPromise;
      }
      dfd.promise = promise;
      dfd.resolve = function (value) {
        if (resolvedPromise) {
          return;
        }
        resolve(value, baseFulfill, baseReject, save);
      };
      dfd.reject = function (reason) {
        if (resolvedPromise) {
          return;
        }
        reject(reason, baseReject, save);
      };
      return dfd;
    }
    return defer;
  }
  return deferImpl;
});