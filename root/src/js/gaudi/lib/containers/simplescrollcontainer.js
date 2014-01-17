define(["gaudi/base", "gaudi/lib/components"], function(Base, Components) {
  "use strict";

  /* REFACTOR:
  *
  * PARTS:
  *   - Gesture detection
  *     * vtouchstart, vtouchend, vtouchmove, vtouchdrag (with speed + direction)
  *       (keep the gestures managed in only one place?)
  *   - State Management
  *     * position
  *     * speed
  *     * boundaries
  *     * overflow
  *   - Scroll negotiation
  *     * globak locks
  *   - Movement
  *     * moveTo (direct) + scrollTo ("animated")
  *   - Client hooks
  *     * onScroll + onStart + onStop
  */

  /* TODO:
  *
  * 1. add a this.gestureManager to handle all touch interactions and rely on it
  *   - onTouchStart
  *   - onTouchEnd
  *   - onTouchMove (speed, handle references, deltas, etc...)
  * 2. Improve Base.Animation to handle inertia
  *   - So, to make InertialScrollContainer, I only need to switch the animation
  * 3. Keep every class under 100 lines
  *
  */

  /* NOTE:
  *  Each subclass should override only the methods without _:
  *
  *   SCROLL MECHANICS
  *   - getPosition()
  *   - getBoundaries()
  *   - scrolTo()
  *   - moveTo()
  *   - direction
  *
  *   FANCY CLIENTS/FX
  *   - onScroll()
  *   - onStop()
  *   - onStart()
  */

  var SimpleScrollContainer = Base.FrameLayout.extend({
    constructor: function() {
      SimpleScrollContainer["__super__"].constructor.apply(this, arguments);
      this.gestureManager = new Components.GestureManager({el: this.el});
      this.speed = {x: 0, y: 0};
    },
    events: {
      "touchstart": "_onTouchStart",
      "touchmove": "_onTouchMove",
      "touchend": "_onTouchEnd",
      "touchcancel": "_onTouchEnd",
    },
    regions: {
      "main": ".scroll-main"
    },
    template: _.template("<div class='scroll-main'></div>"),
    show: function(view) {
      this.$content = view.$el;
      this.regions.main.show(view);
      this.currentView = view;
    },
    // touch
    threshold: {
      x: 1,
      y: 1
    },
    _onTouchStart: function(e) {
      var ev = e.originalEvent,
          touch = ev.touches? ev.touches[0] : ev;
      this._locked = false;
      this._ignore = false;
      if (this.regions.main.$el &&
          (this.$el.width() < (this.contentHeight || this.$content.width()) ||
           this.$el.height() < (this.contentWidth || this.$content.height()))) {
        this._setReference({x: touch.pageX, y: touch.pageY});
        this.onStart(e);
      } else {
        this._ignore = true;
      }
    },
    _onTouchMove: _.throttle(function(e) {
      if (this._ignore) { return; }
      e.preventDefault();
      e.stopImmediatePropagation();
      var ev = e.originalEvent,
          touch = ev.touches? ev.touches[0] : ev;
      if (this._isLocked(touch)) {
        this._scrollAction({x: touch.pageX, y: touch.pageY});
        return false;
      } else {
        return true;
      }
    }, 30),
    _onTouchEnd: function(e) {
      if (this._ignore) { return; }
      this.onStop(e);
      this._locked = false;
    },
    // onScroll
    direction: -1,
    getPosition: function() {
      return {
        x: this.$el.scrollLeft(),
        y: this.$el.scrollTop()
      };
    },
    getBoundaries: function() {
      var deltaW = this.$content.width() - this.$el.width(),
          deltaH = this.$content.height() - this.$el.height();
      return {
        min: { x: 0, y: 0 },
        max: {
          x: deltaW > 0? deltaW : 0,
          y: deltaH > 0? deltaH + 50 : 0
        }
      };
    },
    _setReference: function(point) {
      // Calculate the expensive CSS things only once per touch cycle
      this.boundaries = this.getBoundaries();
      this.position = this.getPosition();
      this.reference = point;
      this.startPoint = point;
      this.speed = {x: 0, y: 0};
    },
    _isLocked: function(touch) {
      if (this._locked) { return true; }
      var distance = {
        x: Math.abs(touch.pageX - this.reference.x),
        y: Math.abs(touch.pageY - this.reference.y)
      };
      this._locked = distance.x > this.threshold.x || distance.y > this.threshold.y;
      return this._locked;
    },
    _scrollAction: function(newPoint) {
      // TODO: this method does TOO much
      // (I had difficulties overwriting some of this behaviour)
      var delta = {
          x: newPoint.x - this.reference.x,
          y: newPoint.y - this.reference.y
        },
        d = this.direction,
        newPos = {
          x: this.position.x + delta.x * d,
          y: this.position.y + delta.y * d
        },
        box = this.boundaries;
      // till here is one thing
      if (newPos.x >= box.min.x && newPos.x < box.max.x ||
          newPos.y >= box.min.y && newPos.y < box.max.y) {
        newPos.x = Math.min(box.max.x, Math.max(box.min.x, newPos.x));
        newPos.y = Math.min(box.max.y, Math.max(box.min.y, newPos.y));
      // till here is another
        this.reference = newPoint;
        this.destination = newPos;
        this.speed = delta;
        this.scrollTo(this.destination, delta);
      // and then one more
      }
    },
    scrollTo: function(destination, speed) {
      this.position = destination;
      this.moveTo(destination, speed);
      this.onScroll(destination, speed);
    },
    onStart: function() {
    },
    onScroll: function() {
    },
    onStop: function() {
    },
    // movement
    moveTo: function(newPoint) {
      this.$el.scrollLeft(newPoint.x);
      this.$el.scrollTop(newPoint.y);
    },
  });

  return SimpleScrollContainer;
});
