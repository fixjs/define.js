define([
  './var/fix',
  './loadDemand',
  './defer',
  './getFileName',
  './utils/isArray'
], function (fix, loadDemand, defer, getFileName, isArray) {
  function loadPromise(modulePath) {
    var dfd = defer(),
      isFirstLoadDemand = false,
      moduleName = getFileName(modulePath);

    if (fix.installed[moduleName]) {
      if (fix.modules[moduleName] !== undefined) {
        dfd.resolve(fix.modules[moduleName]);
      } else {
        dfd.reject(new Error(moduleName + ': has no returned module definition.'));
      }
    } else {
      if (!isArray(fix.waitingList[moduleName])) {
        fix.waitingList[moduleName] = [];
        isFirstLoadDemand = true;
      }
      fix.waitingList[moduleName].push(dfd);
      if (isFirstLoadDemand) {
        loadDemand(moduleName, modulePath, dfd);
      }
    }
    return dfd.promise;
  }
  return loadPromise;
});