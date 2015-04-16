require.config({
  baseUrl: 'src'
});
require(['app'], function (app) {

  if (app.utils.isObject(app.options)) {
    console.log('1. utils.isObject(...) function is working as expected.');
  }

  if (app.utils.isString(app.version)) {
    console.log('2. utils.isString(...) function is working as expected.');
  }

  app.lunch();

});