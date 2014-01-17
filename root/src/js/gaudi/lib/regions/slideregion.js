define(["gaudi/base"], function(Base) {
  "use strict";

  var SlideRegion = Base.FrameRegion.extend({
    show: function(view, dir) {
      this.forward = !dir; // true or false
      SlideRegion["__super__"].show.call(this, view);
    },
    animationClass: "slide",
    open: function(view) {
      this.el = this.$el.get(0);
      var from = this.currentView,
          anim = this.animationClass,
          inName = (this.forward? "in" : "out"),
          outName = (this.forward? "out" : "in"),
          offsetWidth;

      view.$el.addClass("trans");

      if (!from) {
        SlideRegion["__super__"].open.call(this, view);
      } else {
        _.result(view, "willShow");
        _.result(from, "willBeRemoved");

        this.$el.append(view.render().el);
        view.$el.removeClass("center " + outName).addClass(anim + " trans " + inName);
        view.el.scrollTop = 0;

        /* Force reflow */
        offsetWidth = view.el.offsetWidth;

        from.$el.one("webkitTransitionEnd", _.bind(function() {
          from.stopListening();
          from.$el.detach();
          _.result(from, "wasRemoved");
        }, this));
        view.$el.one("webkitTransitionEnd", function() {
          view.$el.removeClass("center").addClass("final");
          _.result(view, "didShow");
        });

        _.delay(function() {
          view.$el.removeClass(inName).addClass("center");
          from.$el.removeClass("center " + inName).addClass(anim + " trans " + outName);
        }, 30);
      }
    },
    close: function() {
      return "Here to override parent";
    }
  });

  return SlideRegion;
});
