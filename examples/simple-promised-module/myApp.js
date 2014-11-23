(function (global) {

  setTimeout(function () {

    global.myApp = {
      title: 'A Simple Promised Module',
      lunch: function(){
      	console.log('We are about to lunch the application!');
      }
    };

  }, 1500);

}(window));
