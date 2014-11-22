fix.define(['core/core', 'util/utils', 'conf'], function (core, utils, conf) {

  var app = {
    core: core,
    version: utils.version,
    views: [],
    controllers: [],
    models: [],
    lunch: function () {
      var that = this;

      if (utils.isObject(core)) {

        console.log('app.version:', this.version);
        console.log('App just got lunched!!!!');

        conf(function (confObject) {
          that.conf = confObject;
          console.log('conf file successfully got loaded:', confObject);
        }, function (error) {
          console.error('Couldn\'t load the conf!');
        });

      } else {

        console.warn('There is something wrong with dependencies!');

      }
    }
  };

  return app;
});
