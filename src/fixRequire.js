define([
  './loader',
  './execute',
  './utils/each',
  './utils/isArray'
], function (loader, execute, each, isArray) {
  function setDepsHash(list, deps) {
    if (isArray(deps) && deps.length) {
      each(list, function (dep, index) {
        deps[dep] = deps[index];
      });
    }
  }

  function fixRequire(list, fn) {
    return loader
      .loadAll(list)
      .then(function (deps) {
        setDepsHash(list, deps);
        return execute(fn, deps);
      });
  }
  return fixRequire;
});