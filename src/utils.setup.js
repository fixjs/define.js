define([
  './var/info',
  './utils.execute'
], function (info, utils) {
  utils('setup', function (moduleName, moduleDefinition, install, args) {
    var moduleData = utils.execute(moduleDefinition, args);

    function setupModule(value) {
      if (value) {
        info.modules[moduleName] = value;
      } else {
        info.modules[moduleName] = moduleData;
      }
      install(moduleName, 'success');
    }

    if (utils.isPromiseAlike(moduleData)) {
      moduleData.then(setupModule);
    } else {
      setTimeout(setupModule, 0);
    }
  });
  return utils;
});