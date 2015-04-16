define([
  './var/emptyArray',
  './defer',
  './utils/isFunction',
  './utils/isGenerator',
  './utils/isArray'
], function (emptyArray, defer, isFunction, isGenerator, isArray) {
  function execute(fn, args) {
    var fnData,
      dfd = defer();
    if (!isArray(args)) {
      args = emptyArray;
    }
    if (isGenerator(fn)) {
      fn.invokeWith(args).then(dfd.resolve, dfd.reject);
    } else if (isFunction(fn)) {
      try {
        fnData = fn.apply(undefined, args);
        dfd.resolve(fnData);
      } catch (err) {
        dfd.reject(err);
      }
    } else {
      dfd.resolve(args);
    }
    return dfd.promise;
  }
  return execute;
});