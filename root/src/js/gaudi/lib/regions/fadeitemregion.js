define(["gaudi/base"], function(Base) {
  "use strict";

  var FadeItemRegion = Base.Region.extend({
    open: function(view) {
      view.$el.css({"opacity": 0, "-webkit-transition": "opacity .3s"});
      FadeItemRegion["__super__"].open.call(this, view);
      _.defer(function() { view.$el.css({"opacity": 1}); });
    }
  });

  return FadeItemRegion;
});
