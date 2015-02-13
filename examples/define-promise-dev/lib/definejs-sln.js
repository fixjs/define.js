define(function * (exports, module) {

  var delayedObject = yield require('delayedObject'),
    moduleValue;

  console.log('[FIRST]' + new Date().toLocaleString());

  try {
    moduleValue = yield delayedObject(false);
  } catch (err) {
    moduleValue = err;
    console.error('[SECOND]' + new Date().toLocaleString(), err);
  }

  try {
    moduleValue = yield delayedObject(true);
  } catch (err) {
    moduleValue = err;
  }

  console.log('[FINAL]' + new Date().toLocaleString(), moduleValue);

  module.exports = moduleValue;
});