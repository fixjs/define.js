define(['utils'],
  function (utils) {

    var app = {
      version: '0.2.4',
      options: {},
      lunch: function () {
        console.log('App just got lunched!');
      },
      utils: utils
    };

    return app;
  });
