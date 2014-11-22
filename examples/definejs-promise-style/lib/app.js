define(['core/core', 'util/utils', 'conf', 'Qconf', 'RSVPconf'],
  function (core, utils, conf, Qconf, RSVPconf) {

    console.log('conf file successfully got loaded [as a promise module]:', conf);

    console.log('Qconf file successfully got loaded [as a promise module]:', Qconf);

    console.log('RSVPconf file successfully got loaded [as a promise module]:', RSVPconf);

    var app = {
      conf: conf,
      Qconf: Qconf,
      RSVPconf:RSVPconf,
      
      core: core,
      version: qconf.version,

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
