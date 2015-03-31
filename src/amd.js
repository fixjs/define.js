define([
  './var/info',
  './loader',
  './utils',
  './amd.core'
], function (info, loader, utils, core) {
  function amd() {
    if (amd.definejs) {
      return amd.definejs;
    }

    var definejs = function (_) {
      _ = core(_, amd);

      amd.define = function (moduleName, array, moduleDefinition) {
        loader.define(moduleName, array, moduleDefinition);
      };

      amd.require = function (array, fn) {
        loader.require(array, fn);
      };
    };

    amd.definejs = definejs;
    return definejs;
  }
  return amd;
});