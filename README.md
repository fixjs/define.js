# DefineJS
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/fixjs/define.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://secure.travis-ci.org/fixjs/define.js.png?branch=master)](http://travis-ci.org/fixjs/define.js)
[![Code Climate](https://codeclimate.com/github/fixjs/define.js/badges/gpa.svg)](https://codeclimate.com/github/fixjs/define.js)
[![Coverage Status](https://coveralls.io/repos/fixjs/define.js/badge.svg?branch=master)](https://coveralls.io/r/fixjs/define.js?branch=master)

DefineJS is a lightweight implementation of [AMD](https://github.com/amdjs/amdjs-api) module format.

> The Asynchronous Module Definition (AMD) API specifies a mechanism for defining modules such that the module and its dependencies can be asynchronously loaded.

## Installation

Install with [Bower](http://bower.io):

```
bower install --save definejs
```

The component can be used as a Common JS module, an AMD module, or a global.

## API
To use DefineJS in your JavaScript code, you could simply add it as a script tag:
```html
<script src="define.js"></script>
```
Then you should call the definejs function to expose the amd modules functions to your desired global object:
```javascript
definejs(myGlobal);
```
The easier way of achieving this, is to pass your desired global object to the `global` attribute of the script tag:
```html
<script global="myGlobal" src="define.js"></script>
```
Or in case you need define and require functions as globals:
```html
<script global="window" src="define.js"></script>
```
Based on the known JavaScript bad practice when defining global objects, this way with explicitly assigning the AMD functions to a specific global object or to the global scope you could be aware of the state of your global scope and also the possible consequences.

**Note**:
- **define.promise.js**: To be able to use the latest DefineJS feature, which allows to use ES6 generators, instead of `define.js` you should add `define.promise.js` to your page:
    ```html
    <script global="window" src="define.promise.js"></script>
    ```
    The other parts are exactly the same.

- **Promises polyfill**: DefineJS doesn't provide you with any polyfills **YET** and in order to use its promise based features you are free to either add your own implementation of **Promises polyfill** or use a Modern browser with native **Promise** support.

- **ES6 generators support**: The same is true for **ES6 generators** and as far as **ES6 generators** needs a new ES6 syntax to be supported in your page you could either use a **ES6 generators transpiler** or use a Modern browser with ES6 generators support.

#Features
Other than regular AMD module pattern, DefineJS also offers couple of nonstandard but usefull modular coding patterns. To make it more readable and getting to know the new features once they get released here we have top down list of DefineJS features list.

- [CommonJS/AMD Hybrid Format](#commonjsamd-hybrid-format): This hybrid format allows to write modules with a CommonJS similar syntax.
- [ES6 generators](#es6-generators): which allows to write asynchronous lazy loaded modules in a synchronous looking way of coding.
  - [**Open Discussion**](https://github.com/fixjs/define.js/issues/9): This feature is still in its early days so that it needs more feedback from JavaScript community. There is an open issue ([#9](https://github.com/fixjs/define.js/issues/9)) to discuss the feedbacks, feel free to drop a line and bring up your ideas regarding this feature.
- [Promised Modules](#promised-modules): Using the same AMD module style you can have privileged promise based modules.
  - [**Open Discussion**](https://github.com/fixjs/define.js/issues/4): **Rejection state** of promised modules is still one of the open discussions, there is an open issue ([#4](https://github.com/fixjs/define.js/issues/4)) to discuss it, feel free to drop your comments.
- [use() vs require()](#use-vs-require): another nonstandard function called `use()` with a similar approach to the standard `require()` function  which allows to have partial execution code blocks without having to use different main files.
- [AMD Module format](#amd-module-format)

##CommonJS/AMD Hybrid Format
This hybrid syntax allows to write modules with a new syntax similar to CommonJS. This feature is now possible thanks to the ES6 generators.

Let's imagine a CommonJS module like:
```javascript
//app.js
var utils = require('utils'),
  $ = require('../vendor/jquery');

var app = {
  //...
};

module.exports = app;
```

The DefineJS alternative is:

```javascript
//app.js
define(function* (exports, module) {
  var utils = yield require('utils'),
    $ = yield require('../vendor/jquery');

  var app = {
    //...
  };

  module.exports = app;
});
```

As mentioned the new syntax is similar to the CommonJS coding style, with two specific differences. First the `yield` keyword and the next is the `define` wrapper with a `ES6 function generator`.

##ES6 generators
This library provides you with a the possiblity of using ES6 generators and the `yield` keyword along with promises. You can use `yield` keyword to load your desired dependencies without getting through the callback hell.
```javascript
//app.js
define(function* () {
  var _,
    app;
  
  if(loadashIsNeeded){
    _ = yield require('../vendor/lodash');
  } else {
    _ = yield require('../vendor/underscore');
  }
  
  app = {
    //...
  };
  
  return app;
});
```
Then in order to require this module, you could `require` it as a regular AMD module:
```javascript
//main.js
require(['app'],
  function (app) {
    app.lunch();
  });
```
Or use the new `require` function like:
```javascript
//main.js
require(function* () {
  var app = yield require('app');
  app.lunch();
});
```
Give that a try and let us know how it feels to implement an asynchronous module definition with a fully synchronous looking code.

##Promised Modules
Using the same AMD module style you can have privileged promise based modules. 
All you need to do is just returning a promise in your modules, to make them promised modules. 
To see how it works, just check out the [simple-promised-module](https://github.com/fixjs/define.js/tree/master/examples/simple-promised-module) example in the examples folder.

In this example we have a promised module named: [promisedModule.js](https://github.com/fixjs/define.js/blob/master/examples/simple-promised-module/promisedModule.js)
which is responsible to wait for a specific global variable, then serve it as part of module's promised value.
```javascript
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
```javascript
//main.js
require(['promisedModule'],
  function(promisedModule){
    console.log(promisedModule.log);//=>This is just a sample promised object!
    console.log(promisedModule.app);
  });
```
**Note**: we are still discussing about the proper way of handling the rejected state of a promised module. Any feedback or proposal is really appreciated.

##use() vs require()
You can also have the same modules flow using a new offered syntax by DefineJS:
```javascript
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

###AMD Module format
You can `define` and `require` your modules using the regular AMD format:
```javascript
myGlobal.define([/*'dependency'*/], function(/*dependency*/]){
  function moduleFunction(){
    //...
  }
  return moduleFunction;
});
```
```javascript
myGlobal.require([/*'moduleName'*/], function(/*moduleName*/]){
  
});
```
###Global define and require functions
To use AMD module definition functions(define and require) like what you have seen so far, as global functions, you could simply add the script tag like:
```html
<script global="window" src="define.js"></script>
```
Then it could load any standard amd modules in your page.

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
