define(function () {
  var cleanUrlRgx = /[\?|#]([^]*)$/,
    fileNameRgx = /\/([^/]*)$/,
    cleanExtRgx = /.*?(?=\.|$)/;
  function matchUrl(url) {
    var fileName,
      matchResult;
    url = url.replace(cleanUrlRgx, '');
    fileName = (matchResult = url.match(fileNameRgx)) ? matchResult[1] : url;
    fileName = fileName.match(cleanExtRgx)[0];
    return fileName;
  }
  return matchUrl;
});