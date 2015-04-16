define([
  './matchUrl'
], function (matchUrl) {
  var files = {};
  function getFileName(url) {
    return files[url] || (files[url] = matchUrl(url));
  }
  return getFileName;
});