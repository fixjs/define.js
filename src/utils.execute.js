define([
  './var/emptyArray',
  './utils'
], function (emptyArray, utils) {
  utils('execute', function (fn, args) {
    var fnData;
    if (!utils.isArray(args)) {
      args = emptyArray;
    }
    try {
      fnData = fn.apply(undefined, args);
    } catch (ignore) {}

    return fnData;
  });
  return utils;
});