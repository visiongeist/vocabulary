module.exports = function(grunt) {

    var pkg = require('./package.json'),
        cfg = require('./config.json'),
        buildTime =  new Date().toISOString();

    grunt.initConfig({
        replace: {
            build: {
                files: [{
                    src: ['vocabulary.js'],
                    dest: 'build/'
                }],
                options: {
                    patterns: [{
                        json: cfg
                    }, {
                        json: {
                            version: pkg.version,
                            debug: false,
                            date: buildTime
                        }
                    }]
                }
            },
            debug: {
                files: [{
                    src: ['vocabulary.js'],
                    dest: 'build/vocabulary.debug.js'
                }],
                options: {
                    patterns: [{
                        json: cfg
                    }, {
                        json: {
                            version: pkg.version,
                            debug: true,
                            date: buildTime
                        }
                    }]
                }
            }
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                eqnull: true,
                browser: true,
                globals: {
                    'console': true
                }
            },
            all: ['build/vocabulary.js']
        },
        uglify: {
            min: {
                options: {
                    preserveComments: 'some'
                },
                files : {
                    'build/vocabulary.min.js' : ['build/vocabulary.js']
                }
            }
        },
        jsdoc : {
            dist : {
                src: ['build/vocabulary.js'],
                options: {
                    destination: 'docs'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-jsdoc');

    grunt.registerTask('default', ['replace', 'jshint', 'uglify', 'jsdoc']);
};
