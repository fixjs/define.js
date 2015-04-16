define(function () {
  'use strict';

  var global = window,
    testAMDModule = {
      label: 'testAMDModule.js',
      desc: 'testAMDModule: This is just a test amd module!',
      message: 'Lifecycle finished without any interruption!'
    };

  //To be used in shimModule
  global.testAMDModule = testAMDModule;

  return testAMDModule;
});