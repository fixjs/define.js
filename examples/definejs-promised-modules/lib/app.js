define(['core/core', 'util/utils', 'all'],
  function (core, utils, all) {

   var app = {
      configuration: all,
      
      core: core,
      version: all.mainPromise.version,

      views: [],
      controllers: [],
      models: [],

      loaded: false,

      lunch: function () {
        if (utils.isObject(core)) {

          this.loaded = true;
          console.log('app.version:', this.version);
          console.log('App just got lunched!');

        } else {

          console.warn('There is something wrong with dependencies!');

        }
      }
    };

    window._app = app;

    return app;
  });
