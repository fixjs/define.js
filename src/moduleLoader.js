define([
  './var/info',
  './utils.execute',
  './utils.getScript'
], function (info, utils) {
  var moduleLoader = {
    install: function install(moduleName, status) {
      var callbacks, fn,
        i, len;

      if (status === 'success') {
        if (!info.installed[moduleName]) {
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
        info.waitingList[moduleName] = [];
      }
    },
    load: function load(modulePath, callback) {
      var isFirstLoadDemand = false,
        moduleName = utils.getFileName(modulePath),
        fileName,
        modulesList;

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
          utils.getScript(modulePath, function (status) {
            if (info.definedModules[moduleName] === true) {
              //Do not need to do anything so far
            } else {
              //This code block allows using this library for regular javascript files
              //with no "define" or "require"
              moduleLoader.install(moduleName, status);
            }
          });
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
        moduleLoader.load(array[i], pCallback);
      }
    }
  };
  return moduleLoader;
});