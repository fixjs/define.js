(function (global) {
  'use strict';

  function * shimModule2(message) {
    var testAMDModule = yield require('testAMDModule');

    console.log('shimModule2 doesnt do anything specific it is just a function!');
    console.log('shimModule2: => testAMDModule:', testAMDModule);

    if(message){
      testAMDModule.message = message;
    }

    return testAMDModule;
  }

  shimModule2.label = 'shimModule2';
  global.shimModule2 = shimModule2;
}(window));