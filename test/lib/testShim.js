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
      'shimModule2': {
        exports: 'shimModule2',
        deps: ['shimModule']
      },
      'jQuery': {
        exports: 'jQuery'
      }
    }
  });

  fixjs.define('testShimDeps', ['shimModule2', 'jQuery'], function (shimModule2, $) {
    return {
      shimModule2: shimModule2,
      $: $,
      body: $('body'),
      name: 'testModule'
    };
  });

  function testShimRequire() {
    fixjs.require(['jQuery', 'testShimDeps', 'shimModule'], function ($, testShimDeps, shimModule) {
      console.log('fixjs.require("jQuery"):', $);
      console.log('fixjs.require("testShimDeps"):', testShimDeps);
      console.log('fixjs.require("shimModule"):', shimModule());
    });
  }

  fixjs.require(['shimModule2', 'jQuery', 'shimModule'], function (shimModule2, $, shimModule) {
    console.log('fixjs.require("shimModule2"):', shimModule2);
    console.log('fixjs.require("jQuery"):', $);
    console.log('fixjs.require("shimModule"):', shimModule());

    //require the testShimDeps module in the next turn
    setTimeout(testShimRequire, 0);
  });

}(window));