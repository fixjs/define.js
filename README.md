# DefineJS

[![Build Status](https://secure.travis-ci.org/fixjs/define.js.png?branch=master)](http://travis-ci.org/fixjs/define.js)

WORK IN PROGRESS!!

DefineJS is a lightweight implementation of [AMD](https://github.com/amdjs/amdjs-api) module format.

> The Asynchronous Module Definition (AMD) API specifies a mechanism for defining modules such that the module and its dependencies can be asynchronously loaded.

No need to discuss the definition further, it is accurately enough to see the starting point clearly.

It is all about writing clean, testable, understandable and maintainable code. There might be more descriptive adjectives here but what we actually mean when we discuss these points, to a large extent, could be summarized in one single principle which is writing modular code.

As an aged JavaScript developer I could remember debates and sometimes actual wars, around this very topic. When I hear the other team members, mostly from a more structural programming language, whispering:

> **WTF?** What the hell is he talking about! He asks us to do the impossible: writing clean code in JavaScript. **Has anyone seen it, for real?**

To be honest the last time I heard someone saying that was just two weeks ago, of course someone with a Shell/Ruby/Python background and not a JavaScript developer, but it was still a lot to me.

These days, as JavaScript developers we can implement almost anything, a [ROBOT](http://cylonjs.com/) or an end to end enterprise solution with a friendly and fun [Javascript Fullstack](http://mean.io/).
It means that JavaScript scales up as it finds more  implications in different areas. And as it goes on, we necessarily need to have a general mechanism with a shared understanding around it, a general mechanism for defining independent and interchangeable pieces which can work together perfectly. This is what modular programming, gives us:


>**Modular programming** is a software design technique that emphasizes *separating the functionality of a program into independent, interchangeable modules*, such that each contains everything necessary to execute only one aspect of the desired functionality. Conceptually, modules represent a **separation of concerns**, and improve **maintainability** by enforcing **logical boundaries** between components.

## Writing Modular JavaScript
This mechanism has already been thought out and we now have a couple of great modular coding formats, and to me these three are the most exciting ones:

* [**AMD**](https://github.com/amdjs/amdjs-api/blob/master/AMD.md): The Asynchronous Module Definition (AMD) API specifies a mechanism for defining modules such that the module and its dependencies can be asynchronously loaded. This is particularly well suited for the browser environment where synchronous loading of modules incurs performance, usability, debugging, and cross-domain access problems.
* [**CommonJS**](http://wiki.commonjs.org/wiki/CommonJS): Unfortunately, it was defined without giving browsers equal footing to other JavaScript environments **[....](http://requirejs.org/docs/commonjs.html)**
* [**ES6 Modules**](http://calculist.org/blog/2012/03/29/synchronous-module-loading-in-es6/): What we are going to have in the next version of JavaScript, **Harmony**.

These three ways each seems to have bunch of pros and cons, but more importantly each has its own syntax format, which makes it difficult to use them interchangeably.

**DefineJS** as a module loader has chosen **AMD** to provide as its underlying module format.

## Notes
There are couple of important points which I have faced with during the implementation of this module loader. All of them bring up one simple question:

> As library authors are we better off implementing everything needed, the best and the worst practices all mixed together?

**OR**

> Some might say, a great library is the one which prevents its developers from getting drowned in a bad code.

Since a module loader needs to be compatible even with possible uses of what is already known as a bad practice, my answer when implementing **DefineJS** was **YES** to the first question.

For instance, when working with an AMD module loader, you can explicitly name modules yourself, but it makes the modules less portable and if you move the file to another directory you will need to change the name. **BUT** it still is there and you can use it to define named modules.


## Installation

Install with [Bower](http://bower.io):

```
bower install --save definejs
```

The component can be used as a Common JS module, an AMD module, or a global.


## API

### fixDefine()


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
