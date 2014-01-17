define(["gaudi/base"], function(Base) {
  "use strict";

  var SlideItemRegion = Base.Region.extend({
    show: function(view, dir) {
      this.forward = !dir; // true or false
      SlideItemRegion["__super__"].show.call(this, view);
    },
    open: function(view) {
      var from = this.currentView,
          dir = (this.forward? "+100%" : "-100%");

      if (!from) {
        SlideItemRegion["__super__"].open.call(this, view);
      } else {
        view.$el.css({
          "-webkit-transform": "translate3d("+dir+",0,0)",
          "opacity":0,
          "-webkit-transition": "-webkit-transform .2s, opacity .5s",
        });
        SlideItemRegion["__super__"].open.call(this, view);
        _.defer(function() {
          view.$el.css({"-webkit-transform": "translate(0)", opacity: 1});
        });
      }
    },
    close: function() {}
  });

  return SlideItemRegion;
});
