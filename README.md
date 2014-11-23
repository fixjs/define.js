# DefineJS

[![Build Status](https://secure.travis-ci.org/fixjs/define.js.png?branch=master)](http://travis-ci.org/fixjs/define.js)

WORK IN PROGRESS!!

DefineJS is a lightweight implementation of [AMD](https://github.com/amdjs/amdjs-api) module format.

> The Asynchronous Module Definition (AMD) API specifies a mechanism for defining modules such that the module and its dependencies can be asynchronously loaded.

## Installation

Install with [Bower](http://bower.io):

```
bower install --save definejs
```

The component can be used as a Common JS module, an AMD module, or a global.


## API
###AMD Module format
To use DefineJS in your JavaScript code, you could simply add it as a script tag.
```
<script src="define.js"></script>
```
Then you should call the fixDefine function to expose the amd modules functions to your desired global object.
```
fixDefine(myGlobal);
```
The easier approach is to pass your desired global object to the global attribute of the script tag:
```
<script gloabl="myGlobal" src="define.js"></script>
```
Now you can define and require your modules like:
```
myGlobal.define([/*'dependency'*/], function(/*dependency*/]){
  function moduleFunction(){
    //...
  }
  return moduleFunction;
});
```
```
myGlobal.require([/*'moduleName'*/], function(/*moduleName*/]){
  
});
```
###Global define and require functions
To use AMD module definition functions(define and require) like what you have seen so far, as global functions, you could simply add the script tag like:
```
<script gloabl="window" src="define.js"></script>
```
Then it could load any standard amd modules in your page.

Other than regular AMD module pattern, DefineJS also offers couple of nonstandard but usefull modular coding patterns.

##Promised Modules
Using the same AMD module style you can have privileged promise based modules. 
All you need to do is just returning a promise in your modules, to make them promised modules. 
To see how it works, just check out the `simple-promised-module example` in the examples folder.

In this example we have a promised module named: promisedModule.js 
which is responsible to wait for a specific global variable, and serves it as the module's promised value.
```
//promisedModule.js
define([ /*'dependency'*/ ], function ( /*dependency*/ ) {

  return new Promise(function (fulfill, reject) {
    //Here you expect to have a global variable named: myApp after 2 seconds
    //otherwise your module definition gets rejected

    setTimeout(function () {
      if (window.myApp !== undefined) {

        //fulfill when succeeded and pass the fulfillment value
        fulfill({
          app: window.myApp,
          log: 'This is just a sample promised object to serve as a promised module!'
        });

      } else {

        //reject in case of error or unsuccessful operations
        reject(new Error('No global myApp object found!!'));
      }

    }, 2000);
  });

});
```
Now you could easily require it, or add it as a dependency. What will happen is, it waits for your promise to get resolved then you will have the promised module object.
```
//main.js
require(['promisedModule'],
  function(promisedModule){
    console.log(promisedModule.log);//=>This is just a sample promised object!
    console.log(promisedModule.app);
  });
```

###Note:
we are still discussing about the proper way of handling the rejected state of a promised module. Any feedback or proposal is really appreciated.

##use() vs require()
You can also have the same modules flow using a new offered syntax by DefineJS:
```
use(['dependency1', 'dependency2'])
  .then(function(dependency1, dependency2){
    //...
    return dependency1.util;
  })
  .then(function(util){
    //...
    //use util object if it has any useful functionality
    return util.map([/*...*/]);
  })
  .catch(function(e){
    //in case of having a rejected promised module or any async error
    console.error(e);
  });
```

## Testing

Install [Node](http://nodejs.org) (comes with npm) and Bower.

From the repo root, install the project's development dependencies:

```
npm install
bower install
```

Testing relies on the Karma test-runner. If you'd like to use Karma to
automatically watch and re-run the test file during development, it's easiest
to globally install Karma and run it from the CLI.

```
npm install -g karma
karma start
```

To run the tests in Firefox, just once, as CI would:

```
npm test
```


## Browser support

* Google Chrome (latest)
* Opera (latest)
* Firefox 4+
* Safari 5+
* Internet Explorer 8+
