/* global describe, it, expect, spyOn, beforeEach */

define(["jasmine-html", "base"], function(jasmine, Base) {
  "use strict";

  describe("Base.Region", function() {
    var $el, $el2, r, v;

    beforeEach(function() {
      $el = jasmine.createSpyObj("$el", ["empty", "append"]);
      $el.empty.andReturn($el);
      $el2 = jasmine.createSpyObj("$el2", ["empty", "append"]);
      $el2.empty.andReturn($el);
      r = new Base.Region({$el: $el});
      v = new Backbone.View();
    });


    it("debería llamar a super-constructor (Base.Class)", function() {
      var classConst = Base.Class.prototype.constructor, child;
      spyOn(Base.Class.prototype, "constructor");
      child = new Base.Region();
      expect(Base.Class.prototype.constructor).toHaveBeenCalled();
      expect(Base.Class.prototype.constructor.calls[0].object).toBe(child);
      Base.Class.prototype.constructor = classConst;
    });

    it("debería poder recibir el parámetro {$el: <nodo jquery>}", function() {
      var obj = {},
          r = new Base.Region({$el: obj});
      expect(r.$el).toBe(obj);
    });

    describe("Base.Region#show", function() {

      it("debería llamar a .close() si la región ya tenía una vista mostrada", function() {
        spyOn(r, "close");
        r.show(v);
        expect(r.close).not.toHaveBeenCalled();
        var v2 = new Backbone.View();
        r.show(v2);
        expect(r.close).toHaveBeenCalled();
      });

      it("debería disparar el evento 'remove' en la vista a cerrar", function() {
        r.show(v);
        spyOn(v, "trigger");
        var v2 = new Backbone.View();
        r.show(v2);
        expect(v.trigger).toHaveBeenCalledWith("remove");
      });

      it("debería invocar el método #onRemove de la vista cerrada (si existe)", function() {
        r.show(v);
        v.onRemove = jasmine.createSpy("onRemove");
        var v2 = new Backbone.View();
        r.show(v2);
        expect(v.onRemove).toHaveBeenCalled();
      });

      it("debería llamar a .open() con la nueva vista", function() {
        spyOn(r, "open");
        r.show(v);
        expect(r.open).toHaveBeenCalledWith(v);
      });

      it("debería disparar el evento 'show' en la nueva vista", function() {
        spyOn(v, "trigger");
        r.show(v);
        expect(v.trigger).toHaveBeenCalledWith("show");
      });

      it("debería invocar el método #onShow de la nueva vista (si existe)", function() {
        v.onShow = jasmine.createSpy("onShow");
        r.show(v);
        expect(v.onShow).toHaveBeenCalled();
      });

      it("debería invocar el método #delegateEvents de la vista mostrada", function() {
        spyOn(v, "delegateEvents");
        r.show(v);
        expect(v.delegateEvents).toHaveBeenCalled();
      });

    });

    describe("Base.Region#open", function() {

      it("debería vaciar el contenedor y añadir la nueva vista", function() {
        r.show(v);
        expect($el.empty).toHaveBeenCalled();
        expect($el.append).toHaveBeenCalledWith(v.el);
      });

    });

    describe("Base.Region#close", function() {

      it("debería llamar al metodo .remove() de la vista a cerrar", function() {
        r.show(v);
        spyOn(v, "remove");
        var v2 = new Backbone.View();
        r.show(v2);
        expect(v.remove).toHaveBeenCalled();
      });

    });

    describe("Base.Region#setElement", function() {

      it("debería permitir modificar el nodo asociado a la region", function() {
        r.setElement($el2);
        expect(r.$el).toBe($el2);
      });

      it("debería eliminar la vista activa del nodo viejo y añadirla al nuevo nodo", function() {
        r.show(v);
        spyOn(v.$el, "detach");
        r.setElement($el);
        expect(v.$el.detach).toHaveBeenCalled();
        expect($el.append).toHaveBeenCalledWith(v.$el);
      });

      it("si añadimos alguna vista antes de tener $el definido, debería guardarse y añadirse en .setElement()", function() {
        var r2 = new Base.Region();
        spyOn(r2, "open");
        r2.show(v);
        expect(r2.open).not.toHaveBeenCalled();
        r2.setElement($el);
        expect(r2.open).toHaveBeenCalledWith(v);
      });

    });

    describe("Base.Region#delegateEvents", function() {

      it("debería llamar a .currentView#delegateEvents (si existe)", function() {
        spyOn(v, "delegateEvents");
        r.show(v);
        r.delegateEvents();
        expect(v.delegateEvents).toHaveBeenCalled();
      });

    });

  });
});
