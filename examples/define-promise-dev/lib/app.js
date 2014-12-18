define(function* (exports, module) {

  var utils = yield require('utils'),
    $ = yield require('../vendor/jquery');

  var app = {
    body: $('body').get(0),
    utils: utils,
    lunch: function () {
      console.log('App just got lunched!:' + this.body);
    }
  };

  module.exports = yield app;
});
