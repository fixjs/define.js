define([
  './loader',
  './setup'
], function (loader, setup) {
  function fixDefine(name, list, definition) {
    fix.definedModules[name] = true;
    return loader
      .loadAll(list)
      .then(function (deps) {
        return setup(name, definition, deps);
      });
  }
  return fixDefine;
});