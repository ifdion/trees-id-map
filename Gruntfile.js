'use strict';
module.exports = function(grunt) {
  // Load all tasks
  require('load-grunt-tasks')(grunt);
  // Show elapsed time
  require('time-grunt')(grunt);

  var vendorList = [
    'bower_components/underscore/underscore.js',
  ];

  var pluginList = [
    'bower_components/leaflet/dist/leaflet.js',
    'bower_components/leaflet-heat/index.js',
  ];

  grunt.initConfig({
    // the sass block
    sass: {
      dist: {
        options: {
          style: 'expanded'
        },
        files: {
          'css/main.css': 'sass/trees-id-map.scss'
        }
      }
    },
    cssmin: {
        dist: {
            files: {
                'css/trees-id-map.min.css': [
                    'css/trees-id-map.css'
                ]
            }
        }
    },
    concat: {
      options: {
        separator: ';',
      },
      vendors: {
        src: [vendorList],
        dest: 'js/vendors.js',
      },
      plugins: {
        src: [pluginList],
        dest: 'js/plugins.js',
      },
    },
    uglify: {
      vendors: {
        files: {
          'js/vendors.min.js': [vendorList]
        }
      },
      plugins: {
        files: {
          'js/plugins.min.js': [pluginList]
        }
      },
      main: {
        files: {
          'js/trees-id-map.min.js': ['js/trees-id-map.js']
        }
      },
    },
    watch: {
      css: {
        files: '**/*.scss',
        tasks: ['sass']
      },
      js: {
        files: [
          pluginList,
          '<%= jshint.all %>'
        ],
        tasks: ['concat']
      },
      livereload: {
        // Browser live reloading
        // https://github.com/gruntjs/grunt-contrib-watch#live-reloading
        options: {
          livereload: true
        },
        files: [
          'css/trees-id-map.css',
          'js/*.js',
          '*/*.php',
          '*.php',
          '*.html'
        ]
      }
    }
  });

  // Register tasks
  grunt.registerTask('default', [
    'dev'
  ]);
  grunt.registerTask('dev', [
    'sass',
    'cssmin',
    'concat'
  ]);
  grunt.registerTask('build', [
    'sass',
    'cssmin',
    'concat',
    'uglify',
  ]);
};
