/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50 */
/*global exports, module, require, define, tern */

module.exports = function (grunt) {
    "use strict";

    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.initConfig({

        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['tests/*.js']
            }
        }
    });

    grunt.registerTask('default', 'mochaTest');
};
