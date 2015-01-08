require(['utils', 'def-a-2', 'def-b-3'],
  function (utils, defA2, defB3) {
    console.log([utils.moduleName, defA2.moduleName, defB3.moduleName]);
  });