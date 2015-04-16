define([
  './var/fix',
  './var/urlCache',
  './loader',
  './loadMap',
  './getShimObject',
  './createScript',
  './install'
], function (fix, urlCache, loader, loadMap, getShimObject, createScript, install) {
  function loadDemand(name, url, dfd) {
    var shimObject;
    //This solves #10 issue
    url = loadMap(url);

    //for those which are already loaded in the page
    shimObject = getShimObject(name);
    if (shimObject) {
      fix.modules[name] = shimObject;
      fix.installed[name] = true;
      dfd.resolve(shimObject);
    } else {
      if (urlCache[url] || fix.definedModules[name] || loader.loadShim(name, url, dfd)) {
        return;
      } else {
        createScript(url).then(function (status) {
          if (!fix.definedModules[name]) {
            install(name, status);
            dfd.resolve(fix.modules[name]);
          }
        });
      }
    }
  }
  return loadDemand;
});