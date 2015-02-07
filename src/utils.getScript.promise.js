define([
  './utils.createScript'
], function (utils) {
  utils('getScript', function (url) {
    return new Promise(function (fulfill, reject) {
      return utils.createScript(url, fulfill, reject);
    });
  });
  return utils;
});