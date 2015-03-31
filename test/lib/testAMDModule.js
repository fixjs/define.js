fixjs.define(function () {
  'use strict';

  var testAMDModule = {
    name: 'testAMDModule.js',
    desc: 'testAMDModule: This is really a test amd module!'
  };

  //To be used in shimModule
  global.testAMDModule = testAMDModule;

  return testAMDModule;
});