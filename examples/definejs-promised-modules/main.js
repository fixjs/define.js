config({
  baseUrl: 'lib',
  paths: {
    'util': '../util',
    'vendor': '../vendor'
  }
});
require(['app'], function (app) {

  var core = app.core,
    utils = core.utils;

  console.log('Before lunch: [app.loaded = ' + app.loaded + ']');

  app.lunch();

  console.log('After lunch: [app.loaded = ' + app.loaded + ']');

  console.log('[core.getVersion() => ' + core.getVersion() + ']');

  console.log('[utils.isObject(null) => ' + utils.isObject(null) + ']');

});
