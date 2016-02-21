const path = require('path');

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        'ftp-deploy': {
            build: {
                auth: {
                    host: process.env.FTP_PHONE_IP,
                    port: process.env.FTP_PHONE_PORT,
                    authKey: 'key'
                },
                src: 'build',
                dest: '/_modpe_scripts'
            }
        },
		browserify: {
			'build/main.js': ['src/main.js']
		},
		uglify: {
			build: {
				files: {
					'build/main.min.js': ['build/main.js']
				}
			}
		},
		zip: {
			'using-router': {
				router: function(path) {
					if (m = path.match(/src\/texture\/(.*)/)) {
						return m[1];
					} else if (m = path.match(/build\/(.*)/)) {
						return 'script/' + m[1];
					}
					return path;
				},

				src: ['manifest.json', 'src/texture/*', 'build/*.min.js'],
				dest: 'build/CommandBlocks.modpkg'
			}
		}
    });

    grunt.loadNpmTasks('grunt-ftp-deploy');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-zip');

    grunt.registerTask('test', ['browserify', 'uglify', 'zip', 'ftp-deploy']);
	grunt.registerTask('default', ['browserify', 'uglify', 'zip']);

};
