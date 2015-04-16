(function () {
  'use strict';

  var shimModule = global.shimModule;

  //depends on shimModule
  var shimModule2 = {
    shimModule: shimModule
  };

  global.shimModule2 = shimModule2;

}());