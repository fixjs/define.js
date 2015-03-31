(function () {
  'use strict';

  //This is just a global module which depends on testAMDModule
  var testAMDModule = global.testAMDModule;

  function shimModule() {
    return '[shimModule][testAMDModule]:\n\t' + JSON.stringify(testAMDModule);
  }

  global.shimModule = shimModule;

}());