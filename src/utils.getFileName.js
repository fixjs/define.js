define([
  './utils'
], function (utils) {
  var files = {},
    cleanUrlRgx = /[\?|#]([^]*)$/,
    fileNameRgx = /\/([^/]*)$/,
    cleanExtRgx = /.*?(?=\.|$)/;
  utils.matchUrl = function (url) {
    var fileName,
      matchResult;
    url = url.replace(cleanUrlRgx, '');
    fileName = (matchResult = url.match(fileNameRgx)) ? matchResult[1] : url;
    fileName = fileName.match(cleanExtRgx)[0];
    return fileName;
  };
  utils.getFileName = function (url) {
    return files[url] || (files[url] = utils.matchUrl(url));
  };
  return utils;
});