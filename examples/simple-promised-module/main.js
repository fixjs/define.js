require(['promisedModule'],
  function(promisedModule){
    console.log(promisedModule.log);//=>This is just a sample promised object!
    console.log(promisedModule.app);

    promisedModule.app.lunch();
  });