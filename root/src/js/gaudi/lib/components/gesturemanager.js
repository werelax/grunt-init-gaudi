define(["gaudi/base"], function(Base) {
  "use strict";

  var GestureManager = Base.Vent.extend({
    constructor: function(options) {
      this.el = options.el;
      this.box = options.box;
    },
    threshold: { x: 1, y: 1 },
    onTouchStart: function(e) {
      // this.setReference({x: touch.pageX, y: touch.pageY});
      return e;
    },
    onTouchEnd: function(e) {
      return e;
    },
    onTouchMove: function(e) {
      return e;
    }
  });

  return GestureManager;
});
