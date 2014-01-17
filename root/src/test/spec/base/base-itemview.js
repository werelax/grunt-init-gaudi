/* global describe, it, expect, spyOn */

define(["jasmine-html", "base"], function(jasmine, Base) {
  "use strict";

  describe("Base.ItemView", function() {

    it("debería llamar a super-constructor (Base.View)", function() {
      var viewConst = Base.View.prototype.constructor;
      spyOn(Base.View.prototype, "constructor");
      new Base.ItemView();
      expect(Base.View.prototype.constructor).toHaveBeenCalled();
      Base.View.prototype.constructor = viewConst;
    });

  });

});
