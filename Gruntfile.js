'use strict';
module.exports = function(grunt) {
  // Load all tasks
  require('load-grunt-tasks')(grunt);
  // Show elapsed time
  require('time-grunt')(grunt);

  var vendorList = [
    'bower_components/jquery/dist/jquery.js',
    'bower_components/underscore/underscore.js',
  ];

  var pluginList = [
    'bower_components/leaflet/dist/leaflet.js',
    'bower_components/leaflet-heat/index.js',
    // 'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/alert.js',
    // 'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/button.js',
    // 'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/carousel.js',
    // 'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/collapse.js',
    // 'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/dropdown.js',
    // 'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/modal.js',
    // 'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/tooltip.js',
    // 'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/popover.js',
    // 'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/scrollspy.js',
    // 'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/tab.js',
    // 'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/affix.js',
    // 'bower_components/magicsuggest/magicsuggest.js',
    // 'bower_components/velocity/velocity.js',
    // 'bower_components/chartjs/Chart.js',
  ];

  grunt.initConfig({
    // jshint: {
    //   options: {
    //     jshintrc: '.jshintrc'
    //   },
    //   all: [
    //     'Gruntfile.js',
    //     '!js/main.js',
    //     '!**/*.min.*'
    //   ]
    // },
    // the sass block
    // sass: {
    //   dist: {
    //     options: {
    //       style: 'expanded'
    //     },
    //     files: {
    //       'css/main.css': 'sass/main.scss'
    //     }
    //   }
    // },
    cssmin: {
        dist: {
            files: {
                'css/main.min.css': [
                    'css/main.css'
                ]
            }
        }
    },
    // the less block
    // less: {
    //   dev: {
    //     files: {
    //       'css/main.css': [
    //         'less/main.less'
    //       ]
    //     },
    //     options: {
    //       compress: false,
    //     }
    //   },
    //   build: {
    //     files: {
    //       'css/main.min.css': [
    //         'less/main.less'
    //       ]
    //     },
    //     options: {
    //       compress: true
    //     }
    //   }
    // },
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
          'js/main.min.js': ['js/main.js']
        }
      },
    },
    modernizr: {
      build: {
        devFile: 'bower_components/modernizr/modernizr.js',
        outputFile: 'js/modernizr.min.js',
        files: {
          'src': [
            ['js/vendors.min.js', 'js/plugins.min.js', 'js/main.min.js'],
            ['css/main.min.css']
          ]
        },
        uglify: true,
        parseFiles: true
      }
    },
    watch: {
      // do it with less
      // less: {
      //   files: [
      //     'less/*.less',
      //     'less/**/*.less'
      //   ],
      //   tasks: ['less:dev']
      // },
      // do it with sass
      // css: {
      //   files: '**/*.scss',
      //   tasks: ['sass']
      // },
      js: {
        files: [
          pluginList,
          vendorList,
          // '<%= jshint.all %>'
        ],
        tasks: [
          // 'jshint',
          'concat'
        ]
      },
      livereload: {
        // Browser live reloading
        // https://github.com/gruntjs/grunt-contrib-watch#live-reloading
        options: {
          livereload: true
        },
        files: [
          'css/main.css',
          'js/main.js',
          '*/*.php',
          '*.php',
          'Gruntfile.js',
        ]
      }
    }
  });

  // Register tasks
  grunt.registerTask('default', [
    'dev',
    'concat'
  ]);
  grunt.registerTask('dev', [
    // 'jshint',
    // 'less:dev',
    // 'sass',
    'cssmin',
    'concat'
  ]);
  grunt.registerTask('build', [
    // 'jshint',
    // 'less:build',
    // 'sass',
    'cssmin',
    'uglify',
    'modernizr',
  ]);
};
