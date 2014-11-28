module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    //We only have two active files under development, define.debug.js and test/define.debug.js
    //The rest are only auto generated files with our grunt tasks
    preprocess: {
      options: {
        context: {
          DEBUG: false,
          NODE: false
        }
      },
      node: {
        src: 'define.debug.js',
        dest: 'define.node.js',
        options: {
          context: {
            DEBUG: false,
            NODE: true
          }
        }
      },
      js: {
        src: 'define.debug.js',
        dest: 'define.js'
      },
      example_regular: {
        src: 'define.debug.js',
        dest: 'examples/regular-amd-style/define.js'
          // options: {
          //   context: {
          //     DEBUG: true
          //   }
          // }
      },
      example_promise: {
        src: 'define.debug.js',
        dest: 'examples/definejs-promised-modules/define.js'
      },
      example_rjs: {
        src: 'define.debug.js',
        dest: 'examples/rjs-amd-optimizer/define.js'
      },
      example_simple_promised: {
        src: 'define.debug.js',
        dest: 'examples/simple-promised-module/define.js'
      },
      example_dev: {
        src: 'define.debug.js',
        dest: 'examples/dev/define.js'
      } //,
      // test: {
      //   src: 'test/define.debug.js',
      //   dest: 'test/define.js'
      // },
      // debugtest: {
      //   src: 'test/define.debug.js',
      //   dest: 'test/define.js',
      //   options: {
      //     context: {
      //       DEBUG: true
      //     }
      //   }
      // }
    },

    jshint: {
      options: {
        reporter: require('jshint-stylish')
      },
      debug: ['define.debug.js'],
      js: ['define.js'],
      test: ['test/**/*.js'],
      all: ['define.debug.js', 'define.js', 'Gruntfile.js', 'test/**/*.js']
    },

    uglify: {
      options: {
        banner: '/*! DefineJS v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'define.js',
        dest: 'define.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('build:examples', [
    'preprocess:example_regular',
    'preprocess:example_promise',
    'preprocess:example_rjs',
    'preprocess:example_simple_promised'
    //'preprocess:example_dev',
  ]);

  grunt.registerTask('build', [
    'jshint:debug',
    'preprocess:js',
    'build:examples',
    //'preprocess:node',
    'jshint:js',
    'uglify'
  ]);

  grunt.registerTask('default', [
    'jshint:all'
  ]);
};
