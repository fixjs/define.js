define([
  './var/info',
  './loader.promise',
  './async',
  './utils.isGenerator',
  './amd.core'
], function (info, loader, async, utils, core) {
  function amd() {
    if (amd.definejs) {
      return amd.definejs;
    }

    var definejs = function (_) {
      _ = core(_, amd);

      //the new CommonJS style
      function CJS(asyncFN) {
        return async(function * cjs() {
          var exportsObj = {},
            moduleObj = {
              exports: exportsObj
            };

          var data = yield asyncFN(exportsObj, moduleObj);
          if (data) {
            return data;
          }

          if (moduleObj.exports !== exportsObj || Object.keys(exportsObj).length > 0) {
            return moduleObj.exports;
          }
        });
      }

      amd.define = function (moduleName, array, definition) {
        if (utils.isGenerator(definition)) {
          return _.define(CJS(async(definition)));
        }
        async(loader.define)(moduleName, array, definition);
      };

      amd.require = function (array, fn) {
        if (typeof array === 'function' && utils.isGenerator(array)) {
          return async(array)();
        }
        if (typeof array === 'string' && typeof fn === 'undefined') {
          return async(loader.loadGenerator)(array);
        }
        async(loader.require)(array, fn);
      };
    };

    amd.definejs = definejs;
    return definejs;
  }

  return amd;
});