define([
  './var/info',
  './var/emptyArray',
  './loader',
  './utils'
], function (info, emptyArray, loader, utils) {
  function amd() {
    if (amd.definejs) {
      return amd.definejs;
    }

    var definejs = function (_) {
      if (!utils.isObject(_)) {
        _ = global;
      }

      _.define = function (moduleName, array, moduleDefinition) {
        //define(moduleDefinition)
        if (typeof moduleName === 'function') {
          moduleDefinition = moduleName;
          moduleName = undefined;
          array = emptyArray;
        }
        //define(array, moduleDefinition)
        else if (utils.isArray(moduleName)) {
          moduleDefinition = array;
          array = moduleName;
          moduleName = undefined;
        }
        /*
         * Note: (Not a good practice)
         * You can explicitly name modules yourself, but it makes the modules less portable
         * if you move the file to another directory you will need to change the name.
         */
        else if (typeof moduleName === 'string') {
          //define(moduleName, moduleDefinition)
          if (typeof array === 'function') {
            moduleDefinition = array;
            array = emptyArray;
          }
        }

        if (typeof moduleDefinition !== 'function') {
          console.error('Invalid input parameter to define a module');
          return false;
        }

        if (moduleName === undefined) {
          moduleName = utils.getFileName(document.currentScript.src);
        }

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

      _.require = function (array, fn) {
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

      _.use = function (array) {
        return new Promise(function (fulfill) {
          //need to come up with a solution for rejected states
          _.require(array, fulfill);
        });
      };

      _.config = function (cnfOptions) {
        if (!utils.isObject(cnfOptions)) {
          console.error('Invalid parameter to set up the config');
          return;
        }

        var key;
        for (key in cnfOptions) {
          if (cnfOptions.hasOwnProperty(key)) {
            info.options[key] = cnfOptions[key];
          }
        }
      };

      _.require.config = _.config;
      _.define.amd = {};
      _.define.info = info;
    };

    amd.definejs = definejs;
    return definejs;
  }
  return amd;
});