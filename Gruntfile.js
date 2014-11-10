module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    //We only have two active files under development, define.debug.js and test/define.debug.js
    //The rest could be considered auto generated files with our grunt tasks
    preprocess: {
      options: {
        context: {
          DEBUG: false
        }
      },
      js: {
        src: 'define.debug.js',
        dest: 'define.js'
      },
      dist: {
        src: 'define.debug.js',
        dest: 'dist/define.js'
      },
      debugdist: {
        src: 'define.debug.js',
        dest: 'dist/define.debug.js',
        options: {
          context: {
            DEBUG: true
          }
        }
      },
      test: {
        src: 'test/define.debug.js',
        dest: 'test/define.js'
      },
      debugtest: {
        src: 'test/define.debug.js',
        dest: 'test/define.js',
        options: {
          context: {
            DEBUG: true
          }
        }
      }
    },

    exec: {
      test: 'npm test'
    },

    jshint: {
      options: {
        reporter: require('jshint-stylish')
      },
      debug: ['define.debug.js'],
      js: ['define.js'],
      dist: ['dist/define.debug.js', 'dist/define.js'],
      test: ['test/**/*.js'],
      all: ['define.debug.js', 'define.js', 'Gruntfile.js', 'test/**/*.js']
    },

    uglify: {
      options: {
        banner: '/*! define.js <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'dist/define.js',
        dest: 'dist/define.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('build', [
    'jshint:debug',
    'preprocess:js',
    'jshint:js'
  ]);

  grunt.registerTask('test', [
    'preprocess:test',
    'exec:test'
  ]);

  grunt.registerTask('test:debug', [
    'preprocess:debugtest',
    'exec:test'
  ]);

  grunt.registerTask('build:dist', [
    'jshint:debug',
    'preprocess:debugdist',
    'preprocess:dist',
    'jshint:dist',
    'uglify'
  ]);

  grunt.registerTask('default', [
    'jshint:all'
  ]);
};
