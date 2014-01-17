/* global describe, it, expect */

define(["jasmine-html", "base"], function(jasmine, Base) {
  "use strict";

  describe("Backbone.Events.triggerMethod", function() {

    it("debe mezclarse en Backbone.Events, Backbone.View.prototype, Backbone.Model.prototype y Backbone.Collection.prototype", function() {
      expect(typeof Backbone.Events.triggerMethod).toBe("function");
      expect(typeof Backbone.View.prototype.triggerMethod).toBe("function");
      expect(typeof Backbone.Model.prototype.triggerMethod).toBe("function");
      expect(typeof Backbone.Collection.prototype.triggerMethod).toBe("function");
    });

    it("debe invocar a #trigger con los parámetros pasados", function() {
      var vent = new Base.Vent(),
          spy = jasmine.createSpy("handler");
      vent.on("test:event", spy);
      vent.triggerMethod("test:event", 1, 2,3);
      expect(spy).toHaveBeenCalledWith(1, 2, 3);
    });

    it("debe invocar al método con nombre equivalente (si existe)", function() {
      var vent = new Base.Vent(),
          spy = jasmine.createSpy("handler");
      vent.onTestEvent = spy;
      vent.triggerMethod("test:event", 1, 2,3);
      expect(spy).toHaveBeenCalledWith(1, 2, 3);
    });

  });
});
