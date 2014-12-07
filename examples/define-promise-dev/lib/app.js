fix.define(['utils'],
  function (utils) {

    var app = {
      utils: utils,
      lunch: function () {
        console.log('App just got lunched!');
      }
    };

    return app;
  });
