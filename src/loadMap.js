define([
  './var/fix',
  './utils/forOwn'
], function (fix, forOwn) {
  //This function solves #10 issue
  function loadMap(modulePath) {
    var depMap = fix.options.dependencyMap;
    forOwn(depMap, function (modulesList, fileName) {
      if (modulesList.indexOf(modulePath) > -1) {
        modulePath = fileName;
        return false;
      }
    });
    return modulePath;
  }
  return loadMap;
});