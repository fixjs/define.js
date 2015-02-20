define([
  './var/info',
  './var/emptyArray',
  './setup',
  './async',
  './utils.getScript.promise'
], function (info, emptyArray, setup, async, utils) {
  var globalPromise = new Promise(function (fulfill) {
      fulfill(global);
    }),
    promiseStorage = {
      global: globalPromise,
      g: globalPromise
    },
    loader;

  loader = {
    install: function install(moduleName, status) {
      var callbacks,
        fulfill, reject,
        i,
        len;

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
          fulfill = callbacks[i][0];
          reject = callbacks[i][1];
          try {
            fulfill(info.modules[moduleName]);
          } catch (e) {
            reject(e);
          }
        }
        info.waitingList[moduleName] = [];
      }
    },
    load: function load(modulePath) {
      if (promiseStorage[modulePath] === undefined) {
        promiseStorage[modulePath] = loader.loadPromise(modulePath);
      }
      return promiseStorage[modulePath];
    },
    loadPromise: function loadPromise(modulePath) {
      return async.Promise(function * (fulfill, reject) {
        var isFirstLoadDemand = false,
          moduleName = utils.getFileName(modulePath),
          status,
          fileName,
          modulesList;

        if (info.installed[moduleName]) {
          if (info.modules[moduleName] !== undefined) {
            fulfill(info.modules[moduleName]);
          } else {

            //REVIEW NEEDED
            info.installed[moduleName] = undefined;

            reject(new Error(moduleName + ': has no returned module definition.'));
          }
        } else {
          if (!utils.isArray(info.waitingList[moduleName])) {
            info.waitingList[moduleName] = [];
            isFirstLoadDemand = true;
          }

          info.waitingList[moduleName].push([fulfill, reject]);

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
            status = yield utils.getScript(modulePath);
            if (info.definedModules[moduleName] === true) {
              //Do not need to do anything so far
            } else {
              //This code block allows using this library for regular javascript files
              //with no "define" or "require"
              loader.install(moduleName, status);
            }
          }
        }
      });
    },
    loadAll: function loadModules(array) {
      return Promise.all(array.map(loader.load));
    },
    setup: function (moduleName, moduleDefinition, args) {
      setup(moduleName, moduleDefinition, this, args);
    }
  };
  return loader;
});