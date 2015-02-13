module.exports = function (grunt) {
  'use strict';

  var examples = [
    'regular-amd-style',
    'definejs-promised-modules',
    'define-promise-dev',
    'rjs-amd-optimizer',
    'simple-promised-module',
    // 'dev',
    'define-module-mapping'
  ];

  function prepareExample(name) {
    var definelib = (name === 'define-promise-dev') ? 'define.promise.js' : 'define.js';
    return {
      src: definelib,
      dest: 'examples/' + name + '/' + definelib
    };
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: (function () {
      var task = {
        options: {}
      };
      examples.forEach(function (name) {
        task[name.replace(/-/g, '_')] = prepareExample(name);
      });
      return task;
    }()),

    jshint: {
      options: {
        reporter: require('jshint-stylish'),
        // ignores: ['src/old/{,*/}*.js'],
        esnext: true
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/{,*/}*.js']
      },
      src: ['src/{,*/}*.js'],
      all: ['src/{,*/}*.js', 'Gruntfile.js', 'test/{,*/}*.js']
    },

    uglify: {
      options: {
        banner: '/*! DefineJS v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      callback: {
        src: 'define.js',
        dest: 'define.min.js'
      },
      promise: {
        options: {
          mangle: false,
          compress: false
        },
        src: 'tmp/define.promise.js',
        dest: 'tmp/define.promise.min.js'
      }
    },

    fix: {
      callback: {},
      promise: {}
    },

    replace: {
      removeStars: {
        options: {
          patterns: [{
            match: /function \* /g,
            replacement: 'function $star$_'
          }, {
            match: / yield /g,
            replacement: ' $yield$_'
          }]
        },
        files: [{
          expand: true,
          flatten: true,
          src: ['define.promise.js'],
          dest: 'tmp'
        }]
      },
      backToStars: {
        options: {
          patterns: [{
            match: /\$star\$_/g,
            replacement: '* '
          }, {
            match: /\$yield\$_/g,
            replacement: 'yield '
          }]
        },
        files: [{
          expand: true,
          flatten: true,
          src: ['tmp/define.promise.min.js'],
          dest: ''
        }]
      }
    },

    qunit: {
      files: ['test/**/*.html']
    },

    clean: {
      tmp: ['tmp/{,*/}*.js', 'tmp']
    },

    coveralls: {
      options: {
        debug: true,
        coverageDir: 'coverage',
        dryRun: false,
        force: true,
        recursive: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-karma-coveralls');

  grunt.registerMultiTask('fix', require('./build/define.tasks')(grunt));

  grunt.registerTask('build:callback', [
    'fix:callback',
    'uglify:callback'
  ]);

  grunt.registerTask('build:promise', [
    'fix:promise',
    'replace:removeStars',
    'uglify:promise',
    'replace:backToStars',
    'clean:tmp'
  ]);

  grunt.registerTask('build:examples', examples.map(function (name) {
    return 'copy:' + name.replace(/-/g, '_');
  }));

  grunt.registerTask('build', [
    'jshint:src',
    'build:callback',
    'build:promise',
    'build:examples'
  ]);

  grunt.registerTask('default', [
    'jshint:all'
  ]);
};