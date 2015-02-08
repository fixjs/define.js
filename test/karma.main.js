//Karma will start the test suite
QUnit.config.autostart = false;
require.config({
  baseUrl: '/base/src',
  paths: {
    'definejs': '../define.amd'
  },
  deps: [
    '../test/testSuite'
  ],
  callback: window.__karma__.start
});