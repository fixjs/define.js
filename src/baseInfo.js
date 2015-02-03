define([
  './var/doc'
], function (doc) {
  var currentScript = document.currentScript,
    filePathRgx = /^(.*[\\\/])/,
    //script injection when using BASE tag is now supported
    baseInfo = {
      head: doc.head || doc.getElementsByTagName('head')[0],
      baseElement: doc.getElementsByTagName('base')[0]
    };

  if (baseInfo.baseElement) {
    baseInfo.head = baseInfo.baseElement.parentNode;
  }

  //phantomjs does not provide the "currentScript" property in global document object
  if (currentScript) {
    baseInfo.baseUrl = currentScript.getAttribute('base') || currentScript.src.match(filePathRgx)[1];
    baseInfo.baseGlobal = currentScript.getAttribute('global');
  }

  return baseInfo;
});