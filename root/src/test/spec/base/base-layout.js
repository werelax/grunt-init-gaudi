/* global describe, it, expect, spyOn, beforeEach, document */

define(["jasmine-html", "base"], function(jasmine, Base) {
  "use strict";

  describe("Base.Layout", function() {
    var l, view, CustomRegion;

    beforeEach(function() {
      CustomRegion = Base.Region.extend({ });
      view = new Base.View({});
      view.template =  _.template("aquí está la vista");
      l = new Base.Layout({});
      l.template = _.template("<div id='main'></div> <div class='menu'></div>");
    });

    it("debería llamar a super-constructor (Base.View)", function() {
      var classConst = Base.View.prototype.constructor, child;
      spyOn(Base.View.prototype, "constructor");
      child = new Base.Layout();
      expect(Base.View.prototype.constructor).toHaveBeenCalled();
      expect(Base.View.prototype.constructor.calls[0].object).toBe(child);
      Base.View.prototype.constructor = classConst;
    });

    describe("Base.Layout#addRegion", function() {

      it("debería añadir una region al layout [ addRegion(selector, nombre) ]", function() {
        l.addRegion("#main", "main");
        expect(l.regions.main).toEqual(jasmine.any(Base.Region));
      });

      it("debería añadir una region al layout [ addRegion({ selector:\"\", type: RegionType }, nombre) ]", function() {
        l.addRegion({selector: "#main", regionType: CustomRegion}, "main");
        expect(l.regions.main).toEqual(jasmine.any(CustomRegion));
      });

      it("debería pasarle a la región su .$el", function() {
        l.render();
        l.addRegion("#main", "main");
        expect(l.regions.main.$el.get(0)).toBe(l.$("#main").get(0));
      });

    });

    describe("Base.Layout#addRegions", function() {

      it("debería llamar a .addRegion con cada par clave/valor", function() {
        var menuOptions = {
          selector: ".menu",
          regionType: CustomRegion
        };
        spyOn(l, "addRegion").andCallThrough();
        l.addRegions({
          "main": "#main",
          "menu": menuOptions
        });
        expect(l.addRegion.calls[0].args[0]).toEqual("#main");
        expect(l.addRegion.calls[0].args[1]).toEqual("main");
        expect(l.addRegion.calls[1].args[0]).toEqual(menuOptions);
        expect(l.addRegion.calls[1].args[1]).toEqual("menu");
      });

    });

    describe("Base.Layout#reattachRegions", function() {

      it("debería llamar a region#setElement(regionEl) para cada region definida", function() {
        var args;
        l.render();
        l.addRegions({ "main": "#main", "menu": ".menu" });
        spyOn(l.regions.main, "setElement");
        spyOn(l.regions.menu, "setElement");
        l.reattachRegions();
        // main
        expect(l.regions.main.setElement).toHaveBeenCalled();
        args = l.regions.main.setElement.calls[0].args;
        expect(args[0].get(0)).toBe(l.$("#main").get(0));
        // menu
        expect(l.regions.menu.setElement).toHaveBeenCalled();
        args = l.regions.menu.setElement.calls[0].args;
        expect(args[0].get(0)).toBe(l.$(".menu").get(0));
      });

    });

    describe("Base.Layout#render", function() {

      it("debería llamar a Base.View#render", function() {
        var viewRender = Base.View.prototype.render;
        spyOn(Base.View.prototype, "render").andCallThrough();
        l.render();
        expect(Base.View.prototype.render).toHaveBeenCalled();
        expect(Base.View.prototype.render.calls[0].object).toBe(l);
        Base.View.prototype.render = viewRender;
      });

      it("debería actualizar sus regiones con los nuevos nodos", function() {
        var oldEl;
        l.render();
        l.addRegion("#main", "main");
        oldEl = l.regions.main.$el.get(0);
        l.render();
        expect(l.regions.main.$el.get(0)).not.toBe(oldEl);
        expect(l.regions.main.$el.get(0)).toBe(l.$("#main").get(0));
      });

    });

    describe("Base.Layout#setElement", function() {

      it("debería llamar a Base.View#setElement", function() {
        var viewSetElement = Base.View.prototype.setElement,
            el = document.createElement("div");
        spyOn(Base.View.prototype, "setElement").andCallThrough();
        l.setElement(el);
        expect(Base.View.prototype.setElement).toHaveBeenCalled();
        expect(Base.View.prototype.setElement.calls[0].object).toBe(l);
        Base.View.prototype.setElement = viewSetElement;
      });

      it("debería actualizar los nodos de sus regions", function() {
        var el = document.createElement(el),
            oldRegionEl;
        l.render();
        l.addRegion("#main", "main");
        oldRegionEl = l.regions.main.$el.get(0);
        l.setElement(el);
        expect(l.regions.main.$el.get(0)).not.toBe(oldRegionEl);
        expect(l.regions.main.$el.get(0)).toBe(l.$("#main").get(0));
      });

    });

    describe("Base.Layout#delegateEvents", function() {

      it("debería invocar a la implementación del padre", function() {
        var superMethod = Base.Layout["__super__"].delegateEvents;
        spyOn(Base.Layout["__super__"], "delegateEvents");
        l.delegateEvents();
        expect(Base.Layout["__super__"].delegateEvents).toHaveBeenCalled();
        Base.CollectionView["__super__"].delegateEvents = superMethod;
      });

      it("debería invocar al método #delegateEvents de todas sus regiones", function() {
        l.addRegion("#main", "main");
        spyOn(l.regions.main, "delegateEvents");
        l.delegateEvents();
        expect(l.regions.main.delegateEvents).toHaveBeenCalled();
      });

    });

    describe("Base.Layout#constructor", function() {

      it("debería leer la propiedad .regions y crear las regiones definidas", function() {
        var CustomLayout = Base.Layout.extend({
          template: _.template("<div id='main'></div>"),
          regions: { "main": "#main" }
        });
        var l = new CustomLayout();
        expect(l.regions.main).toEqual(jasmine.any(Base.Region));
      });

    });

  });

});

