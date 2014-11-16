(function (global) {

  var fix = global.fix,

    // comment out the tests you don't need
    implemented = {
      basic: true,

      anon: false,
      funcString: false,
      namedWrapped: false,

      require: true,

      // plugin support
      plugins: false,
      pluginDynamic: false,

      // config proposal
      pathsConfig: true,
      packagesConfig: false,
      mapConfig: false,
      moduleConfig: true,
      shimConfig: false
    };

  // config is a way to set up configuration for AMD tests
  function config(options) {

    return fix.config(options);

  }

  // map this to your loader's entry point
  function go(dependencies, callback) {

    return fix.require(dependencies, callback);

  }

  function exposeImpl(g) {
    g.implemented = implemented;
    g.config = config;
    g.go = go;
  }

  exposeImpl(global);

}(this));
