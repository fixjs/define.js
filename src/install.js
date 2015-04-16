define([
  './var/fix',
  './utils/each',
  './utils/isArray'
], function (fix, each, isArray) {
  function install(moduleName, status) {
    var callbacks;
    if (status === 'success') {
      if (fix.installed[moduleName]) {
        console.warn('[DefineJS][install][' + moduleName + ']: this module is already installed!');
        return;
      }
      fix.installed[moduleName] = true;
    } else {
      fix.failedList[moduleName] = true;
    }
    callbacks = fix.waitingList[moduleName];
    if (isArray(callbacks)) {
      each(callbacks, function (dfd) {
        try {
          dfd.resolve(fix.modules[moduleName]);
        } catch (err) {
          dfd.reject(err);
        }
      });
      callbacks.length = 0;
    }
  }
  return install;
});