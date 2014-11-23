define([/*'dependency'*/],
  function(/*dependency*/){
    return new Promise(function (fulfill, reject) {
      //Here you expect to have a global variable named: myApp after 2 seconds
      //otherwise your module definition gets rejected
      setTimeout(function(){
        if(window.myApp !== undefined){
          //fulfill when succeeded and pass the fulfillment value
          fulfill({
            app: window.myApp,
            log: 'This is just a sample promised object to serve as a promised module!'
          });
        } else {
          //reject in case of error or unsuccessful operations
          reject(new Error('No global myApp object found!!'));
        }
      }, 2000);
    });
  });