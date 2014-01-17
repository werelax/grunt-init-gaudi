/* global window */
define([], function() {
  "use strict";

  var config = {
    longPressTime: 500,
    threshold: 12
  };

  function getTouch(e) {
    var ev = e.originalEvent;
    return ev.changedTouches? ev.changedTouches[0] : ev;
  }

  function trigger(data) {
    var selector = data.selector,
        $el = data.$el,
        event = data.event;
    _.defer(function() {
      (selector === ""? $el : $el.find(selector)).trigger(event);
    });
  }

  var touchEvents = {

    "vtap": {
      start: function(data, touch) {
        // HAVE TO copy the values, cause Safari reuses the touch reference
        data.start = {x: touch.pageX, y: touch.pageY};
        data.stamp = Date.now();
        data.threshold = 5;
      },
      check: function(data, touch) {
        return Math.abs(touch.pageX - data.start.x) < config.threshold &&
               Math.abs(touch.pageY - data.start.y) < config.threshold &&
               (Date.now() - data.stamp) < config.longPressTime;
      },
      end: function() {
        return true;
      }
    },

    "vhold": {
      start: function(data, touch) {
        data.start = {x: touch.pageX, y: touch.pageY};
        data.stamp = Date.now();
        data.fired = false;
        data.timerId = window.setTimeout(
          _.bind(this.trigger, this, data),
          config.longPressTime
        );
      },
      trigger: function(data) {
        data.fired = true;
        trigger(data);
      },
      clear: function(data) {
        window.clearTimeout(data.timerId);
      },
      check: function(data, touch) {
        var ok = Math.abs(touch.pageX - data.start.x) < config.threshold &&
                 Math.abs(touch.pageY - data.start.y) < config.threshold &&
                 !data.fired;
        if (!ok) { this.clear(data); }
        return ok;
      },
      end: function(data) {
        this.clear(data);
        return false;
      }
    }
  };

  return {
    handle: function(event, $el, selector, method) {
      var addListener,
          lastEvent;
      var data = {
        event: event,
        code: (Date.now() + Math.random().toString(26)),
        $el: $el,
        selector: selector,
        method: method
      };
      if (selector === "") {
        addListener = _.bind($el.on, $el);
      } else {
        addListener = function(eventName, listener) {
          return $el.on(eventName, selector, listener);
        };
      }
      return function(e) {
        var touch = getTouch(e),
            evData = e;
        // Because the ALERTS does funny things
        // (Chrome -> touch.identifier is always 0)
        if (lastEvent && touch.identifier === lastEvent) { return; }
        lastEvent = touch.identifier;

        touchEvents[event].start(data, getTouch(e));

        $("body")
          .on("touchmove."+data.code, _.throttle(function(e) {
            var touch = getTouch(e);
            if (!touchEvents[event].check(data, touch)) {
              $("body").off("."+data.code);
              touchEvents[event].end(data, touch);
            }
          }, 100))
          .on("touchend."+data.code, function(e) {
            $("body").off("."+data.code);
            var touch = getTouch(e);
            if (touchEvents[event].check(data, touch) &&
                touchEvents[event].end(data, touch)) {
              // trigger(data);
              method(evData, data);
            }
          });
      };
    },
    events: touchEvents
  };

});
