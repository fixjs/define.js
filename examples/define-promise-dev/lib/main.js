'use strict';
/*
 * The starting code block has the same exact lifecycle that `sameLifecycle` function has
 * calling then on Function Generators allows to reduce the amount of code
 * both ways has its own pros and cons but more importantly
 * both ways are much cleaner than their older brothers in pyramid
 */
config.go()
  .then(firstPhase)
  .then(secondPhase)
  .then(finalPhase)
  .catch(lifecycleInterruption)
  .done(theEnd);

function * sameLifecycle() {
  var message;
  try {
    var packageInfo = yield config.go();
    var app = yield firstPhase.go(packageInfo);
    var shimModule2 = yield secondPhase.go(app);
    message = yield finalPhase.go(shimModule2);
  } catch (err) {
    message = yield lifecycleInterruption.go(err);
  }
  theEnd(message);
}

function * getPackageInfo() {
  var packageInfo,
    $ = yield require('jQuery');

  console.log('getPackageInfo: => $:', $);

  packageInfo = yield $.getJSON('/package.json');

  console.log('getPackageInfo: => packageInfo:', packageInfo);

  return packageInfo;
}

function * config() {
  require.config({
    paths: {
      'jQuery': '../vendor/jquery'
    },
    shim: {
      'shimModule': {
        exports: 'shimModule',
        deps: ['testAMDModule']
      },
      'shimModule2': {
        exports: 'shimModule2'
      }
    }
  });

  var packageInfo = yield getPackageInfo();

  console.log('config: => packageInfo:', packageInfo);

  return packageInfo;
}

function * firstPhase(packageInfo) {
  console.log('**********************firstPhase********************');

  var deps = yield require(['app', 'shimModule']);

  console.log('firstPhase: => packageInfo:', packageInfo);

  console.log('firstPhase: => app:', deps[0]);
  console.log('firstPhase: => shimModule():', deps[1]());

  console.log('firstPhase: => app:', deps.app);
  console.log('firstPhase: => shimModule():', deps.shimModule());

  return deps.app.lunch.go();
}

function * secondPhase(app) {
  console.log('**********************secondPhase********************');
  var shimModule2 = yield app.getShimModule2.go();

  console.log('secondPhase: => app.label:' + app.label);
  console.log('secondPhase: => shimModule2:' + shimModule2);

  return shimModule2;
}

function * finalPhase(shimModule2) {
  console.log('**********************finalPhase********************');
  var testAMDModule = yield shimModule2.go();

  console.log('finalPhase: => testAMDModule.label:' + testAMDModule.label);
  console.log('finalPhase: => testAMDModule.desc:' + testAMDModule.desc);

  return testAMDModule.message;
}

function * lifecycleInterruption(err) {
  console.log('**********************lifecycleInterruption********************');
  var shimModule2 = yield require('shimModule2'),
    testAMDModule = yield shimModule2.go(err.message);

  console.log('lifecycleInterruption: => err:' + err);
  console.log('lifecycleInterruption: => testAMDModule.desc:' + testAMDModule.desc);

  return testAMDModule.message;
}

function theEnd(message) {
  console.log(message);
  console.log('<<<<<finalPhase: The End!>>>>>');
}