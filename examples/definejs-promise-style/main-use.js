config({
  baseUrl: 'lib',
  paths: {
    'util': '../util',
    'vendor': '../vendor'
  }
});

use(['app'])
  .then(function (app) {
    console.log('Before lunch: [app.loaded = ' + app.loaded + ']');
    return app;
  })
  .then(function (app) {
    app.lunch();
    return app;
  })
  .then(function (app) {
    console.log('After lunch: [app.loaded = ' + app.loaded + ']');

    //return whatever needed in the next steps
    return app.core;
  })
  .then(function (core) {

    console.log('[core.getVersion() => ' + core.getVersion() + ']');

    return core.utils;
  })
  .then(function (utils) {

    console.log('[utils.isObject(null) => ' + utils.isObject(null) + ']');

  });
