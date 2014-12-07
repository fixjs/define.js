fix.main(function* (require) {

  var app = yield require('app');

  console.log('required app object:', app);
  
  app.lunch();

});
