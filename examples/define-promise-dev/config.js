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