module.exports = function(grunt) {
    var pkg = grunt.file.readJSON('package.json');

    grunt.initConfig({
        connect: {
            support: {
                options: {
                    hostname: '*',
                    port: 3000,
                    base: 'support/'
                }
            }
        },
        concat: {
            options: {
                separator: '\n'
            },
            dist: {
                src: [
                    'src/Tenjoh.js',
                    'src/component/Array.js',
                    'src/component/DOM.js',
                    'src/component/Event.js',
                    'src/component/XHR.js',
                    'src/component/Router.js',
                    'src/component/Cache.js',
                    'src/component/Storage.js',
                    'src/component/ResourceManager.js',
                    'src/component/Compiler.js',
                    'src/component/UI/UIFactory.js',
                    'src/component/UI/Partial.js',
                    'src/component/UI/Fillter.js',
                    'src/component/UI/Animation.js',
                    'src/component/UI/LayeredImage.js',
                    'src/widget/Repeat.js',
                    'src/widget/LazyImage.js',
                    'src/widget/Show.js',
                    'src/widget/Hide.js',
                    'src/fillter/Element.js',
                    'src/fillter/DateFormatter.js',
                    'src/fillter/Before.js',
                    'src/fillter/NumberFormatter.js',
                    'src/RootController.js',
                    'src/Controller.js'
                ],
                dest: 'build/tenjoh.js'
            }
        },
        compass: {
            dev: {
                options: {
                    sassDir: 'support/assets/style/',
                    cssDir: 'support/css/'
                }
            }
        },
        watch: {
            build: {
                files: ['src/**/*.js'],
                tasks: ['concat'],
                options: {
                    livereload: true
                }
            },
            support: {
                files: ['support/asset/style/**/*.scss'],
                tasks: ['compass'],
                options: {
                    livereload: true
                }
            }
        }
    });

    for (var key in pkg.devDependencies) {
        if (/grunt-/.test(key)) {
            grunt.loadNpmTasks(key);
        }
    }

    grunt.registerTask('dev', ['connect', 'watch']);
};
