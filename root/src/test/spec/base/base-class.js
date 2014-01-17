/* global describe, it, expect */

define(["jasmine-html", "base"], function(jasmine, Base) {
  "use strict";

  describe("Base.Class", function() {
    var Subclass = Base.Class.extend({
      metodo: function() { return 42; }
    });

    var Subsubclass = Subclass.extend({
      metodoHijo: function() { return "hijo"; }
    });

    it("debe crear subclases con Class.extend", function() {
      expect(typeof Subclass).toBe("function");
    });

    it("debe crear subclases con los métodos especificados en su parámetro", function() {
      var subinst = new Subclass();
      expect(subinst).toEqual(jasmine.any(Subclass));
      expect(typeof subinst.metodo).toBe("function");
      expect(subinst.metodo()).toBe(42);
    });

    it("debe crear subclases que a su vez sean extensibles", function() {
      expect(typeof Subclass.extend).toBe("function");
    });

    it("debe crear subclases que hereden los metodos del padre", function() {
      var subsubinst = new Subsubclass();
      expect(typeof subsubinst.metodo).toBe("function");
      expect(subsubinst.metodo()).toBe(42);
    });

    it("debe ejecutar la propiedad 'constructor' como constructor si se espeficica", function() {
      var ran = false;
      var CustomConst = Base.Class.extend({
        constructor: function() { ran = true; }
      });
      new CustomConst();
      expect(ran).toBe(true);
    });

    it("debe ejecutar el metodo 'initialize' tras las construcción", function() {
      var ran = false;
      var CustomInit = Base.Class.extend({
        initialize: function() {
          ran = true;
        }
      });
      new CustomInit();
      expect(ran).toBe(true);
    });

    it("debe dejar la propiedad __super__ del constructor apuntando a la propiedad 'prototype' de su padre", function() {
      expect(Subsubclass["__super__"]).toEqual(Subclass.prototype);
    });

  });
});
