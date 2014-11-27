(function (global) {

  setTimeout(function () {

    global.myApp = {
      title: 'A Simple Promised Module',
      lunch: function(){
      	console.log('We are about to lunch the application!');
      	//actual code to lunch the app
      	console.log('Application is lunched now!');
      }
    };

  }, 1500);

}(window));
