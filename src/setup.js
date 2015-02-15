define([
  './var/info',
  './utils.execute'
], function (info, utils) {
  function setup (moduleName, moduleDefinition, loader, args) {
    var moduleData = utils.execute(moduleDefinition, args);

    function setupModule(value) {
      if (value) {
        info.modules[moduleName] = value;
      } else {
        info.modules[moduleName] = moduleData;
      }
      loader.install(moduleName, 'success');
    }

    if (utils.isPromiseAlike(moduleData)) {
      moduleData.then(setupModule);
    } else {
      setTimeout(setupModule, 0);
    }
  }
  return setup;
});