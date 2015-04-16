define(function * (exports, module) {

  var definejsSLN = yield require('definejs-sln'),
    coSLN = yield require('co-sln'),
    $ = yield require('../vendor/jquery');

  console.log('definejsSLN>', definejsSLN);
  console.log('coSLN>', coSLN);

  var app = {
    label: 'definePromiseDevApp',
    body: $('body').get(0),
    getShimModule2: function * () {
      var shimModule2 = yield require('shimModule2');

      console.log('app.getShimModule2(): => shimModule2:', shimModule2);

      return shimModule2;
    },
    lunch: function * () {
      var utils = yield require('utils');

      console.log('app.lunch(): => this.body:' + this.body);
      console.log('app.lunch(): => utils:' + utils);

      return app;
    }
  };

  module.exports = app;
});