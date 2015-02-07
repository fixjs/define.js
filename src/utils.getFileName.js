define([
  './utils'
], function (utils) {
  var files = {},
    cleanUrlRgx = /[\?|#]([^]*)$/,
    fileNameRgx = /\/([^/]*)$/,
    cleanExtRgx = /.*?(?=\.|$)/;
  utils('getFileName', function (url) {
    var fileName = files[url],
      matchResult;
    if (typeof fileName === 'string') {
      return fileName;
    }
    url = url.replace(cleanUrlRgx, '');
    matchResult = url.match(fileNameRgx);
    if (matchResult) {
      fileName = matchResult[1];
    } else {
      fileName = url;
    }
    fileName = fileName.match(cleanExtRgx)[0];
    files[url] = fileName;
    return fileName;
  });
  return utils;
});