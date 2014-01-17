/* global window, navigator, document */
define(["jquery", "backbone", "gaudi/base", "gaudi/lib/containers", "app/activities"], function($, Backbone, Base, Containers, Activities) {
  "use strict";


  function startApp() {
    var win = Base.App.getWindow();
    return [win, Activities];
  }

  /* Initialize */

  function start() {

    $("body").on("touchstart", ".topcoat-button, .button", function(e) {
      $(e.currentTarget).addClass("active");
    }).on("touchend", ".topcoat-button, .button", function(e) {
      $(e.currentTarget).removeClass("active");
    }).on("touchcancel", ".topcoat-button, .button", function(e) {
      $(e.currentTarget).removeClass("active");
    });

    startApp();
  }

  $(function() {
    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android)/) && !window.deviceReady) {
      document.addEventListener("deviceready", start, false);
    } else if (navigator.userAgent.match(/Tizen/)) {
      /* Let the navigator initialize itself correctly... */
      setTimeout(start, 100);
    } else {
      start();
    }
  });

});
