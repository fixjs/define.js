define([
  './var/info',
  './utils'
], function (info, utils) {

  utils.getShimObject = function (moduleName) {
    var ret,
      shim = info.options.shim && info.options.shim[moduleName];
    if (!utils.isObject(shim)) {
      return false;
    }
    if (shim.object) {
      return shim.object;
    }
    if (shim.init) {
      shim.object = shim.init.apply(global, arguments);
    }
    if (!shim.object && shim.exports) {
      shim.object = utils.getNested(global, shim.exports);
    }
    return shim.object;
  };

  utils.hasShimObject = function (moduleName) {
    return utils.isObject(info.options.shim[moduleName]);
  };

  utils.getShimObject.make = function (moduleName, callback) {
    return function () {
      var shimObject = utils.getShimObject(moduleName);
      callback(shimObject);
      return shimObject;
    };
  };

  return utils;
});