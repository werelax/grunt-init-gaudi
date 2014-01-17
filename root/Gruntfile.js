"use strict";

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON("package.json"),
    banner: "/* */",
    // Task configuration.
    jshint: {
      options: {
        jshintrc: ".jshintrc",
        ignores: ["src/js/templates.js", "src/js/lib/md5.js"]
      },
      all: ["Gruntfile.js", "src/js/**/*.js"]
    },
    bower: {
      target: {
        rjsConfig: "src/js/config.js",
        options: {
          baseUrl: "src/js",
          exclude: ["almond", "requirejs"]
        }
      },
    },
    handlebars: {
      compile: {
        options: {
          namespace: "JST",
          amd: true,
          processName: function(filePath) {
            return filePath.split("/templates/")[1].replace(".hbc", "");
          }
        },
        files: {
          "src/js/templates.js": "src/js/templates/**/*.hbc"
        }
      }
    },
    requirejs: {
      compile: {
        options: {
          name: "app",
          mainConfigFile: "src/js/config.js",
          insertRequire: ["app"],
          out: "www/js/app.js",
          optimize: "none"
        }
      }
    },
    concat: {
      options: {
        separator: ";",
      },
      ugly: {
        src: ["bower_components/almond/almond.js", "www/js/app.js"],
        dest: "www/js/build.js"
      },
      plain: {
        src: ["bower_components/almond/almond.js", "www/js/app.js"],
        dest: "www/js/final.js"
      }
    },
    uglify: {
      all: {
        files: {
          "www/js/final.js": ["www/js/build.js"]
        }
      }
    },
    clean: ["www/js/build.js", "www/js/app.js"],
    watch: {
      templates: {
        files: ["src/js/templates/**/*.hbc"],
        tasks: ["handlebars"],
        options: {
          spawn: false
        }
      },
      jshint: {
        files: ["src/js/**/*.js"],
        tasks: ["jshint"],
        options: {
          spawn: false
        }
      }
    },
    copy: {
      assets: {
        expand: true,
        cwd: "src",
        src: "assets/**",
        dest: "www/"
      }
    },
    phonegap: {
      config: {
        root: "www",
        config: "config.xml",
        cordova: ".cordova",
        path: "phonegap",
        plugins: ["com.jamiestarke.webviewdebug", "https://github.com/phonegap-build/PushPlugin.git"],
        platforms: ["android"],
        verbose: true
      }
    },
  });

  grunt.loadNpmTasks("grunt-bower-requirejs");
  grunt.loadNpmTasks("grunt-contrib-requirejs");
  grunt.loadNpmTasks("grunt-contrib-handlebars");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-phonegap");

  grunt.registerTask("default", ["jshint", "bower", "handlebars", "requirejs", "concat:plain", "clean", "copy"]);
  grunt.registerTask("build", ["jshint", "bower", "handlebars", "requirejs", "concat:ugly", "uglify", "clean", "copy"]);
  grunt.registerTask("run", ["default", "phonegap:run:android"]);

  grunt.registerTask("server", function(mode) {
    var connect = require("connect"),
        done = this.async(),
        dir = (mode === "build") ? "/www" : "/src";
    connect()
      .use(connect.logger("dev"))
      .use(connect.static(__dirname + dir))
      .use(connect.static(__dirname))
      .listen(3000)
      .on("error", done.bind({}, false));
    grunt.log.writeln("Server listening in http://localhost:3000");
  });

};
