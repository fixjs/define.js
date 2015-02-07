define([
  './utils'
], function (utils) {
  utils('isGenerator', function (fn) {
    if (typeof fn === 'function') {
      //Function.prototype.isGenerator is supported in Firefox 5.0 or later
      //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/isGenerator
      if (typeof fn.isGenerator === 'function') {
        return fn.isGenerator();
      }
      return /^function\s*\*/.test(fn.toString());
    }
    return false;
  });
  return utils;
});