define(function * (exports, module) {

  var utils = yield require('utils'),
    definejsSLN = yield require('definejs-sln'),
    coSLN = yield require('co-sln'),
    $ = yield require('../vendor/jquery');

  console.log('definejsSLN>', definejsSLN);
  console.log('coSLN>', coSLN);

  var app = {
    body: $('body').get(0),
    utils: utils,
    lunch: function () {
      console.log('App just got lunched!:' + this.body);
    }
  };

  module.exports = app;
});