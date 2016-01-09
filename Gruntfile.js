module.exports = function(grunt) {

  grunt.initConfig({

    "jsbeautifier" : {
      files : ["server/**/*.js", "client/**/*.js"],
      options : {}
    },

    watch: {
      files: ['<%= jsbeautifier.files %>'],
      tasks: ['jsbeautifier']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks("grunt-jsbeautifier");

  grunt.registerTask('default', ["jsbeautifier"]);
};
