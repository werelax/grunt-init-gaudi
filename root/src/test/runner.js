require.config({
  baseUrl: "/js",
  paths: {
    backbone: "../../bower_components/backbone/backbone",
    jquery: "../../bower_components/jquery/jquery",
    handlebars: "../../bower_components/handlebars/handlebars",
    "handlebars.runtime": "../../bower_components/handlebars/handlebars.runtime",
    underscore: "../../bower_components/underscore/underscore",
    hammer: "../../bower_components/hammerjs/dist/hammer",
    "hammer-jquery": "../../bower_components/hammerjs/dist/jquery.hammer",
    "jasmine": "../../bower_components/jasmine/lib/jasmine-core/jasmine",
    "jasmine-html": "../../bower_components/jasmine/lib/jasmine-core/jasmine-html",
  },
  shim: {
    jquery: {
      exports: "jQuery"
    },
    underscore: {
      exports: "_"
    },
    backbone: {
      deps: [
        "jquery",
        "underscore"
      ],
      exports: "Backbone"
    },
    handlebars: {
      exports: "Handlebars"
    },
    jasmine: {
      exports: "jasmine"
    },
    "jasmine-html": {
      deps: [ "jasmine" ],
      exports: "jasmine"
    }
  }
});

require(
  ["jquery",
   "jasmine-html",
   "/test/spec/base.js",
   "/test/spec/containers.js",
  ],
  function($, jasmine) {
    "use strict";
    var jasmineEnv = jasmine.getEnv(),
        htmlReporter = new jasmine.HtmlReporter();
    jasmineEnv.updateInterval = 250;
    jasmineEnv.addReporter(htmlReporter);
    jasmineEnv.specFilter = _.bind(htmlReporter.specFilter, htmlReporter);
    $(_.bind(jasmineEnv.execute, jasmineEnv));
  });
