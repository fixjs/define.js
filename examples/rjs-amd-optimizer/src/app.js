define(['utils'],
  function (utils) {

    var app = {
      version: '0.2.3',
      options: {},
      lunch: function () {
        console.log('App just got lunched!');
      },
      utils: utils
    };

    return app;
  });
