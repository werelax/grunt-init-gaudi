/* global describe, it, expect */

define(["jasmine-html", "base"], function(jasmine, Base) {
  "use strict";

  describe("Base.Vent", function() {
    it("debe ser un constructor", function() {
      expect(typeof Base.Vent).toBe("function");
    });

    it("debe proveer una implementación del patron pub/sub", function() {
      var vent = new Base.Vent(),
          ran = 0;
      vent.on("test:event", function() { ran += 1; });
      vent.on("test:event", function() { ran += 1; });
      vent.trigger("test:event");
      vent.off("test:event");
      vent.trigger("test:event");
      expect(ran).toBe(2);
    });

    it("debe pasar los parámetros con los que dispara el evento a los observadores", function() {
      var vent = new Base.Vent(),
          param;
      vent.on("test:event", function(p) { param = p; });
      vent.trigger("test:event", 42);
      expect(param).toBe(42);
    });

  });
});
