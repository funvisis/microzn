'use strict';
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-symlink');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),

	clean: {
	    build: ['build/*', '!build/components']
	},

	symlink: {
	    options: {
		overwrite: true,
	    },
	    build: {
		expand: true,
		src: ['styles', 'scripts'],
		cwd: 'src',
		dest: 'build',
		filter: 'isDirectory'
	    }
	},

	watch: {
	    livereload: {
		options: {
		    livereload: LIVERELOAD_PORT
		},
		files: [
		    '{,templates/}styles/{,*/}*.{css,less}',
		    '{,templates/}scripts/{,*/}*.{js,cofee,py}',
		    '{,templates/}markup/{,*/}*.{html,rst,md}'
		]
	    }
	},

	connect: {
	    options: {
		port: 9000,
		hostname: 'localhost'
	    },
	    livereload: {
		options: {
		    middleware: function(connect) {
			return [
			    mountFolder(connect, 'build'),
			    lrSnippet
			];
		    }
		}
	    }
	}
    });

    grunt.registerTask('server', function(target) {
	grunt.task.run([
	    'connect:livereload',
	    'watch'
	]);
    });
};
