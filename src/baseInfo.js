define([
  './var/doc'
], function (doc) {
  function baseInfo() {
    var currentScript = doc.currentScript,
      filePathRgx = /^(.*[\\\/])/;
    //script injection when using BASE tag is now supported
    baseInfo.head = doc.head || doc.getElementsByTagName('head')[0];
    baseInfo.baseElement = doc.getElementsByTagName('base')[0];

    if (baseInfo.baseElement) {
      baseInfo.head = baseInfo.baseElement.parentNode;
    }

    //phantomjs does not provide the "currentScript" property in global document object
    if (currentScript) {
      baseInfo.baseUrl = currentScript.getAttribute('base') || currentScript.src.match(filePathRgx)[1];
      baseInfo.baseGlobal = currentScript.getAttribute('global');
    } else {
      baseInfo.baseUrl = '';
    }
  }
  
  baseInfo();

  return baseInfo;
});