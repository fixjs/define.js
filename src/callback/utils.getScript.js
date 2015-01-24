define([
  '../utils.createScript'
], function (utils) {
  utils('getScript', function (url, callback) {
    return utils.createScript(url, callback, callback);
  });
  return utils;
});