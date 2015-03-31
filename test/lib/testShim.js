(function (global) {
  'use strict';

  var fixjs = {},
    definejs = global.definejs;

  //expose to be used in another files as the AMD API holder
  global.fixjs = fixjs

  //expose the API
  definejs(fixjs);

  fixjs.require.config({
    shim: {
      'shimModule': {
        exports: 'shimModule',
        deps: ['testAMDModule']
      },
      'jQuery': {
        exports: 'jQuery'
      }
    }
  });

  fixjs.require(['shimModule'], function (shimModule) {
    console.log('fixjs.require("shimModule"):', shimModule());
  });

  //for those type of modules that are already loaded in the page
  fixjs.require(['jQuery'], function (fixJQuery) {
    console.log('fixjs.require("fixJQuery"):', fixJQuery);
  });

}(window));