define([
  './var/emptyArray',
  './var/info',
  './setup',
  './utils.execute',
  './utils.getScript',
  './utils.shim'
], function (emptyArray, info, setup, utils) {
  var loader = {
    install: function install(moduleName, status) {
      var callbacks, fn,
        i, len;

      if (status === 'success') {
        if (info.installed[moduleName]) {
          console.warn('[DefineJS][loader.install][' + moduleName + ']: this module is already installed!');
          return;
        } else {
          info.installed[moduleName] = true;
        }
      } else {
        info.failedList[moduleName] = true;
      }

      callbacks = info.waitingList[moduleName];

      if (utils.isArray(callbacks)) {
        i = 0;
        len = callbacks.length;

        for (; i < len; i += 1) {
          fn = callbacks[i];
          try {
            fn(status);
          } catch (ignored) {}
        }
        callbacks.length = 0;
      }
    },
    getShim: function (moduleName, modulePath, callback) {
      utils.getScript(modulePath, function () {
        info.modules[moduleName] = utils.getShimObject(moduleName);
        info.waitingList[moduleName].push(callback);
        loader.install(moduleName, 'success');
      });
    },
    loadShim: function (moduleName, modulePath, callback) {
      var shim = info.options.shim && info.options.shim[moduleName];
      if (utils.isObject(shim)) {
        if (shim.deps && shim.deps.length) {
          loader.require(shim.deps, function () {
            loader.getShim(moduleName, modulePath, callback);
          });
        } else {
          loader.getShim(moduleName, modulePath, callback);
        }
        return true;
      }
      return false;
    },
    load: function load(modulePath, callback) {
      var isFirstLoadDemand = false,
        moduleName = utils.getFileName(modulePath),
        fileName,
        modulesList,
        shimObject;

      if (info.installed[moduleName]) {
        callback(info.modules[moduleName]);
      } else {
        if (!utils.isArray(info.waitingList[moduleName])) {
          info.waitingList[moduleName] = [];
          isFirstLoadDemand = true;
        }

        info.waitingList[moduleName].push(callback);

        if (isFirstLoadDemand) {
          //This code blog solves #10 issue but it still needs some review
          if (utils.isObject(info.options.dependencyMap)) {
            for (fileName in info.options.dependencyMap) {
              if (info.options.dependencyMap.hasOwnProperty(fileName)) {
                modulesList = info.options.dependencyMap[fileName];
                if (modulesList.indexOf(modulePath) > -1) {
                  modulePath = fileName;
                  break;
                }
              }
            }
          }
          //for those type of modules that are already loaded in the page
          shimObject = utils.getShimObject(moduleName);
          if (shimObject) {
            info.modules[moduleName] = shimObject;
            info.waitingList[moduleName].push(callback);
            loader.install(moduleName, 'success');
          } else if (loader.loadShim(moduleName, modulePath, callback)) {
            return;
          } else {
            utils.getScript(modulePath, function (status) {
              if (!info.definedModules[moduleName]) {
                loader.install(moduleName, status);
              }
            });
          }
        }
      }
    },
    loadAll: function loadAll(array, callback) {
      var i = 0,
        len = array.length,
        loaded = [];

      function pCallback(status) {
        loaded.push(status);
        if (loaded.length === len && typeof callback === 'function') {
          callback(loaded);
        }
      }

      for (; i < len; i += 1) {
        loader.load(array[i], pCallback);
      }
    },
    setup: function (moduleName, moduleDefinition, args) {
      setup(moduleName, moduleDefinition, loader, args);
    },
    getArgs: function (array) {
      var args = [],
        i = 0,
        len = array.length;
      for (; i < len; i += 1) {
        args.push(info.modules[utils.getFileName(array[i])]);
      }
      return args;
    },
    define: function (moduleName, array, moduleDefinition) {
      info.definedModules[moduleName] = true;
      if (utils.isArray(array) && array.length) {
        loader.loadAll(array, function () {
          // var args = [],
          //   i = 0,
          //   len = array.length;
          // for (; i < len; i += 1) {
          //   args.push(info.modules[utils.getFileName(array[i])]);
          // }
          loader.setup(moduleName, moduleDefinition, loader.getArgs(array));
        });
      } else {
        loader.setup(moduleName, moduleDefinition);
      }
    },
    require: function (array, fn) {
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
    }
  };
  return loader;
});