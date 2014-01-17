/* global describe, it, expect, spyOn, beforeEach */

define(["jasmine-html", "base"], function(jasmine, Base) {
  "use strict";

  describe("Base.View", function() {
    var $el, model, col, v;

    beforeEach(function() {
      $el = jasmine.createSpyObj("$el", ["empty", "append"]);
      $el.empty.andReturn($el);
      model = jasmine.createSpyObj("model", ["toJSON"]);
      model.toJSON.andReturn({un: "dato"});
      col = jasmine.createSpyObj("col", ["toJSON"]);
      col.toJSON.andReturn([{un: "dato"}, {un: "dato mas"}]);
      v = new Base.View();
    });

    it("debería llamar a super-constructor (Backbone.View)", function() {
      var viewConst = Backbone.View.prototype.constructor;
      spyOn(Backbone.View.prototype, "constructor");
      new Base.View();
      expect(Backbone.View.prototype.constructor).toHaveBeenCalled();
      Backbone.View.prototype.constructor = viewConst;
    });

    describe("Base.View#serializeModel", function() {

      it("debería devolver un objeto vacío si la vista no tiene modelo", function() {
        expect(v.serializeModel()).toEqual({});
      });

      it("debería devolver el modelo serializado si tiene modelo", function() {
        v.model = model;
        expect(v.serializeModel()).toEqual({un: "dato"});
      });

      it("debería devolver la colección serializada si tiene colección", function() {
        var serialCol = col.toJSON();
        v.collection = col;
        expect(v.serializeData()).toEqual(serialCol);
      });

    });

    describe("Base.View#serializeData", function() {

      it("debería llamar a .serializeModel()", function() {
        spyOn(v, "serializeModel");
        v.serializeData();
        expect(v.serializeModel).toHaveBeenCalled();
      });

      it("debería devolver lo mismo que .serializeModel() si la vista no tiene helpers", function() {
        expect(v.serializeData()).toEqual(v.serializeModel());
        v.model = model;
        expect(v.serializeData()).toEqual(v.serializeModel());
        delete v.model;
        v.collection = col;
        expect(v.serializeData()).toEqual(v.serializeModel());
      });

      it("debería mezclar los helpers de la vista en el resultado", function() {
        var helper = function() {};
        v.helpers = {h: helper};
        expect(v.serializeData().h).toBe(helper);
      });

      it("debería mezclar el resultado de llamar a .helpers() (si es una función)", function() {
        var helper = function() {};
        v.helpers = function() { return {h: helper, ctx: this}; };
        expect(v.serializeData().h).toBe(helper);
        expect(v.serializeData().ctx).toBe(v);
      });

    });

    describe("Base.View#render", function() {

      it("debería llamar a .template() con el resultado de .serializeData()", function() {
        v.model = model;
        v.template = jasmine.createSpy("template");
        v.render();
        expect(v.template).toHaveBeenCalledWith({un: "dato"});
      });

      it("debería vacíar .$el y añadir lo que genere .template()", function() {
        v.template = jasmine.createSpy("template").andReturn("generated-html");
        v.$el = $el;
        v.render();
        expect($el.empty).toHaveBeenCalled();
        expect($el.append).toHaveBeenCalledWith("generated-html");
      });

    });

  });

});
