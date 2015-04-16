define([
  './var/fix',
  './utils/isObject',
  './utils/isFunction',
  './utils/extract'
], function (fix, isObject, isFunction, extract) {
  function getShimObject(moduleName) {
    var shim = fix.options.shim && fix.options.shim[moduleName];
    if (!shim) {
      return false;
    }
    if (!isObject(shim.object)) {
      if (isFunction(shim.init)) {
        shim.object = shim.init.apply(global, arguments);
      }
      if (!isObject(shim.object)) {
        shim.object = extract(global, shim.exports);
      }
    }
    return shim.object;
  }
  return getShimObject;
});