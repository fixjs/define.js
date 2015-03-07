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

      function * defineGenerator(moduleName, array, definition) {
        var args;
        info.definedModules[moduleName] = true;
        if (utils.isArray(array) && array.length) {
          args = yield loader.loadAll(array);
        }
        loader.setup(moduleName, definition, args);
      }

      function * requireGenerator(array, fn) {
        var args;
        if (utils.isArray(array) && array.length) {
          args = yield loader.loadAll(array);
        }
        utils.execute(fn, args);
      }

      function * loadModuleGenerator(modulePath) {
        var args = yield loader.loadAll([modulePath]);
        return args[0];
      }

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
        async(defineGenerator)(moduleName, array, definition);
      };

      amd.require = function (array, fn) {
        if (typeof array === 'function' && utils.isGenerator(array)) {
          return async(array)();
        }
        if (typeof array === 'string' && typeof fn === 'undefined') {
          return async(loadModuleGenerator)(array);
        }
        async(requireGenerator)(array, fn);
      };
    };

    amd.definejs = definejs;
    return definejs;
  }

  return amd;
});