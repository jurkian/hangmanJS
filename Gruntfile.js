"use strict";

module.exports = function(grunt) {

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Automatically load required grunt tasks
    require('jit-grunt')(grunt);

    // Configurable paths
    var config = {
        app: 'app',
        dist: 'dist'
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        config: config,

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            gruntfile: {
                files: ['Gruntfile.js']
            },
            javascript: {
                files: ['<%= config.app %>/scripts/{,*/}*.js'],
                tasks: ['jshint']
            },
            sass: {
                files: ['<%= config.app %>/styles/{,*/}*.{scss,sass}'],
                tasks: ['sass:server', 'autoprefixer:server']
            }
        },

        browserSync: {
            options: {
                notify: false,
                background: true,
                watchOptions: {
                    ignored: ''
                }
            },
            livereload: {
                options: {
                    files: [
                        '<%= config.app %>/{,*/}*.html',
                        '.tmp/styles/{,*/}*.css',
                        '<%= config.app %>/images/{,*/}*',
                        '.tmp/scripts/{,*/}*.js'
                    ],
                    port: 9000,
                    server: {
                        baseDir: ['.tmp', config.app]
                    }
                }
            },
            dist: {
                options: {
                    background: false,
                    server: '<%= config.dist %>'
                }
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= config.dist %>/*',
                        '!<%= config.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },

        // Working on CSS
        // sass: compile Sass to CSS
        // uncss: Get only the neccessary styles
        // autoprefixer: prefix them
        // cssmin: and minify to 1 file

        sass: {
            options: {
                sourceMap: false
            },
            server: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/styles',
                    src: ['*.{scss,sass}'],
                    dest: '.tmp/styles',
                    ext: '.css'
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/styles',
                    src: ['*.{scss,sass}'],
                    dest: '<%= config.dist %>/styles',
                    ext: '.css'
                }]
            }
        },

        uncss: {
            dist: {
                files: {
                    '<%= config.dist %>/styles/main.css': ['<%= config.dist %>/*.html']
                }
            }
        },

        autoprefixer: {
            options: {
                browsers: ['last 3 version']
            },
            server: {
                src: '.tmp/styles/*.css'
            },
            dist: {
                src: '<%= config.dist %>/styles/*.css'
            }
        },

        cssmin: {
            dist: {
                files: {
                    '<%= config.dist %>/styles/main.css': [
                        '<%= config.dist %>/styles/*.css',
                    ]
                }
            }
        },

        // Working on JS
        // Jshint, then Uglify

        jshint: {
            dev: {
                src: ['<%= config.app %>/scripts/{,*/}*.js', '!<%= config.app %>/scripts/vendor/*']
            }
        },

        uglify: {
            dist: {
                files: {
                    '<%= config.dist %>/scripts/vendor.min.js': ['<%= config.app %>/scripts/vendor/*.js'],
                    '<%= config.dist %>/scripts/scripts.min.js': ['<%= config.app %>/scripts/*.js']
                }
            }
        },

        // Change HTML scripts paths to correct ones, on build
        processhtml: {
          dist: {
            files: [{
                expand: true,
                cwd: '<%= config.dist %>',
                src: ['*.html'],
                dest: '<%= config.dist %>',
                ext: '.html'
            }]
          }
        },

        // Copies HTML files and images
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= config.app %>',
                    dest: '<%= config.dist %>',
                    src: [
                        '*.txt',
                        '{,*/}*.html',
                        '{,*/}*.json'
                    ]
                }, {
                    expand: true,
                    dot: true,
                    cwd: '<%= config.app %>/images',
                    src: '**/*.{jpg,jpeg,gif,png}',
                    dest: '<%= config.dist %>/images'
                }]
            }
        },

        // Run some tasks in parallel to speed up build process
        concurrent: {
            server: [
                'sass:server',
                'jshint'
            ],
            dist: [
                'sass:dist',
                'jshint'
            ]
        }
    });

    grunt.registerTask('serve', 'start the server and preview your app', function(target) {

        grunt.task.run([
            'clean:server',
            'concurrent:server',
            'autoprefixer:server',
            'browserSync:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('build', [
        'clean:dist',
        'copy:dist',
        'processhtml',
        'concurrent:dist',
        'uglify',
        'uncss',
        'autoprefixer:dist',
        'cssmin'
    ]);

    grunt.registerTask('default', 'serve');

};
