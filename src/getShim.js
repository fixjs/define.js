define([
  './createScript',
  './install',
  './getShimObject'
], function (createScript, install, getShimObject) {
  function getShim(moduleName, modulePath, dfd) {
    return createScript(modulePath)
      .then(function (status) {
        fix.modules[moduleName] = getShimObject(moduleName);
        fix.waitingList[moduleName].push(dfd);
        install(moduleName, status);
      });
  }
  return getShim;
});