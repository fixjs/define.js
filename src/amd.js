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
        info.definedModules[moduleName] = true;
        if (utils.isArray(array) && array.length) {
          loader.loadAll(array, function () {
            var args = [],
              i = 0,
              len = array.length;
            for (; i < len; i += 1) {
              args.push(info.modules[utils.getFileName(array[i])]);
            }
            loader.setup(moduleName, moduleDefinition, args);
          });
        } else {
          loader.setup(moduleName, moduleDefinition);
        }
      };

      amd.require = function (array, fn) {
        if (typeof array === 'string') {
          array = [array];
        } else if (typeof array === 'function') {
          fn = array;
          array = [];
        }

        if (utils.isArray(array) && array.length) {
          loader.loadAll(array, function () {
            var args = [],
              i = 0,
              len = array.length;
            for (; i < len; i += 1) {
              args.push(info.modules[utils.getFileName(array[i])]);
            }
            utils.execute(fn, args);
          });
        } else {
          utils.execute(fn);
        }
      };
    };

    amd.definejs = definejs;
    return definejs;
  }
  return amd;
});