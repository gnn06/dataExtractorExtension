module.exports = function(grunt) {
	grunt.initConfig({
		copy: {
			main: {
				src: 'bower_components/jquery/dist/jquery.min.js',
				dest: 'js/contentscript/jquery.min.js'
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-copy');
	
	grunt.registerTask('default', ['copy']);
}
