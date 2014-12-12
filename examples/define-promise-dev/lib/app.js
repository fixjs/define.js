define(function* () {

  var utils = yield require('utils'),
    $ = yield require('../vendor/jquery');

  var app = {
    body: $('body').get(0),
    utils: utils,
    lunch: function () {
      console.log('App just got lunched!');
    }
  };

  return app;
});
