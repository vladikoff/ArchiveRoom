'use strict';

var APP_SRC = "app/client/src/";
var APP_OUT = "app/client/out/";

module.exports = function(grunt) {

  grunt.initConfig({
    clean: {
      build: [APP_OUT]
    },
    less: {
      production: {
        options: {
          paths: [APP_SRC + '/less'],
          yuicompress: true
        },
        files: {
          "app/client/out/css/front.css": APP_SRC + 'less/front.less',
          "app/client/out/css/main.css": APP_SRC + 'less/main.less',
          "app/client/out/css/ratchet.css": APP_SRC + 'less/main.less'
        }
      }
    },
    copy: {
      main: {
        files: [
          { expand: true, cwd: APP_SRC, src: ['img/**', 'textures/**', '*.html', '*.png', 'js/lib/**'], dest: APP_OUT }
        ]
      },
      br: {
        files: [
          {expand: true, cwd: 'app/client/tmp', src: ['voxel-bundle.js'], dest: APP_OUT + 'js', filter: 'isFile'}
        ]
      }
    },
    browserify: {
      voxelbundle: {
        src: APP_SRC + 'js/voxel-bundle.js',
        dest: APP_OUT + 'js/voxel-bundle.js'
      },
      dev: {
        src: APP_SRC + 'js/test.js',
        dest: APP_OUT + 'js/bundle.js'
      }
    },
    shell: {
      br: {
        command: [
          'mkdir app/client/tmp',
          'node_modules/.bin/browserify app/client/src/js/voxel-bundle.js > app/client/tmp/voxel-bundle.js'].join('&&'),
        options: {
          stdout: true
        }
      }
    },
    watch: {
      less: {
        files: [APP_SRC + '**/*'],
        tasks: ['default']
      },
      front: {
        files: [APP_SRC + '**/*'],
        tasks: ['front']
      }
    },
    uglify: {
      min: {
        options: {
          mangle: false
        },
        files: [
          {src: APP_OUT + 'js/bundle.js', dest: APP_OUT + 'js/bundle.js'},
          {src: APP_OUT + 'js/voxel-bundle.js', dest: APP_OUT + 'js/voxel-bundle.js'}
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['browserify:dev', 'less', 'copy']);
  grunt.registerTask('prod', ['default', 'uglify']);
  grunt.registerTask('front', ['less', 'copy']);
  grunt.registerTask('dev', ['default', 'watch']);
};
