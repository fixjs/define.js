define([
  './loadPromise',
  './getShim',
  './utils/isObject'
], function (loadPromise, getShim, isObject) {
  var globalPromise = new Promise(function (fulfill) {
      fulfill(global);
    }),
    promiseStorage = {
      global: globalPromise,
      g: globalPromise
    },
    loader;

  loader = {
    load: function load(modulePath) {
      if (promiseStorage[modulePath] === undefined) {
        promiseStorage[modulePath] = loadPromise(modulePath);
      }
      return promiseStorage[modulePath];
    },
    loadAll: function loadAll(list) {
      return Promise.all(list.map(loader.load));
    },
    loadShim: function (moduleName, modulePath, dfd) {
      var shim = fix.options.shim && fix.options.shim[moduleName];
      if (isObject(shim)) {
        if (shim.deps && shim.deps.length) {
          loader
            .loadAll(shim.deps)
            .then(function () {
              getShim(moduleName, modulePath, dfd);
            });
        } else {
          getShim(moduleName, modulePath, dfd);
        }
        return true;
      }
      return false;
    }
  };
  return loader;
});