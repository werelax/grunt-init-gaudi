/*global exports*/

"use strict";

exports.description = "Gaudi + Backbone + Cordova + Require + Handlebars boilerplate";

exports.notes = "[TODO]";

// Template-specific notes to be displayed after question prompts.
exports.after = "[TODO]";

exports.warnOn = "*";

exports.template = function(grunt, init, done) {

  init.process({type: "baseapp"}, [
    init.prompt("name"),
    init.prompt("title"),
    init.prompt("description", "My Great App"),
  ], function(err, props) {
    var files = init.filesToCopy(props);
    init.copyAndProcess(files, props, {noProcess: "libs/**"});
    init.writePackageJSON("package.json", {
      name: props.name,
      version: "0.0.1",
      "node_version": ">= 0.8.0",
      devDependencies: {
        "connect": "*",
        "grunt-contrib-requirejs": "~0.4.1",
        "grunt-bower-requirejs": "~0.7.1",
        "grunt-contrib-handlebars": "~0.5.11",
        "grunt-contrib-jshint": "~0.6.4",
        "grunt-contrib-concat": "~0.3.0",
        "grunt-contrib-clean": "~0.5.0",
        "grunt-contrib-uglify": "~0.2.4",
        "grunt-contrib-watch": "~0.5.3",
        "grunt-contrib-copy": "~0.4.1",
        "grunt-phonegap": "~0.3.0"
      },
    });

    // All done!
    done();
  });

};
