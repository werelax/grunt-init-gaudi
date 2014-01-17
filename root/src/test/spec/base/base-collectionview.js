/* global describe, it, expect, spyOn, beforeEach */

define(["jasmine-html", "base", "backbone"], function(jasmine, Base, Backbone) {
  "use strict";

  describe("Base.CollectionView", function() {
    var cv, model, col, MockView;

    beforeEach(function() {
      model = jasmine.createSpyObj("model", ["toJSON"]);
      model.toJSON.andReturn({un: "dato"});

      col = new Backbone.Collection([{otro: "dato"}]);
      spyOn(col, "each").andCallThrough();

      cv = new Base.CollectionView({model: model, collection: col});
      cv.template = function() { return ""; };

      MockView = Base.View.extend({
        template: _.template("<%= otro %>"),
        tagName: "li"
      });
      spyOn(MockView.prototype, "initialize");
      cv.itemView = MockView;
    });

    it("debería llamar a super-constructor (Base.View)", function() {
      var classConst = Base.View.prototype.constructor, child;
      spyOn(Base.View.prototype, "constructor");
      child = new Base.CollectionView();
      expect(Base.View.prototype.constructor).toHaveBeenCalled();
      expect(Base.View.prototype.constructor.calls[0].object).toBe(child);
      Base.View.prototype.constructor = classConst;
    });

    describe("Base.CollectionView#serializeModel", function() {

      it("no debería serializar la colección", function() {
        col.toJSON = jasmine.createSpy("col#toJSON");
        cv.serializeModel();
        expect(col.toJSON).not.toHaveBeenCalled();
      });

      it("debería serializar el modelo", function() {
        expect(cv.serializeModel()).toEqual({un: "dato"});
        expect(model.toJSON).toHaveBeenCalled();
      });

      it("debería devolver un objeto vacío si el modelo no existe", function() {
        cv.model = null;
        expect(cv.serializeModel()).toEqual({});
      });

    });

    describe("Base.CollectionView#render", function() {

      it("debería llamar a Base.View#render pasándose a sí mismo como contexto", function() {
        var viewRender = Base.View.prototype.render;
        spyOn(Base.View.prototype, "render").andCallThrough();
        cv.render();
        expect(Base.View.prototype.render).toHaveBeenCalled();
        expect(Base.View.prototype.render.calls[0].object).toBe(cv);
        Base.View.prototype.render = viewRender;
      });

      it("debería recorrer la colección con #collectionIterator", function() {
        var args;
        spyOn(cv, "collectionIterator");
        cv.render();
        expect(cv.collectionIterator).toHaveBeenCalled();
        args = cv.collectionIterator.calls[0].args;
        expect(args[0]).toEqual(jasmine.any(Function));
        expect(args[1]).toBe(cv);
      });

      it("debería crear una instancia de .itemView para cada individuo de la colección", function() {
        var args;
        cv.render();
        expect(MockView.prototype.initialize).toHaveBeenCalled();
        // args: { model: <col item>, parent: CollectionView }
        args = MockView.prototype.initialize.calls[0].args;
        expect(args[0].model.toJSON()).toEqual({otro: "dato"});
        expect(args[0].parent).toBe(cv);
      });

      it("debería rendear las instancias de .itemView en .itemContainer", function() {
        cv.template = _.template(
          "<div class='no'>Aquí no</div> <ul class='container'></ul>'"
        );
        cv.itemContainer = ".container";
        cv.render();
        expect(cv.$(".no").text()).toEqual("Aquí no");
        expect(cv.$(".container").html()).toEqual("<li>dato</li>");
      });

      it("debería rendear las instancias de .itemView en .$el si no existe .itemContainer", function() {
        cv.template = _.template(
          "<div class='no'>Aquí no</div> <ul class='container'></ul>'"
        );
        cv.render();
        expect(cv.$(".no").length).toEqual(0);
        expect(cv.$el.html()).toEqual("<li>dato</li>");
      });

    });

    describe("Base.CollectionView#collectionIterator", function() {

      it("debería llamar al .collection.each pasándole el iterador y el contexto", function() {
        var args;
        cv.render();
        expect(cv.collection.each).toHaveBeenCalled();
        args = cv.collection.each.calls[0].args;
        expect(args[0]).toEqual(jasmine.any(Function));
        expect(args[1]).toBe(cv);
      });

      it("el iterador debería recibir cada uno de los modelos de la colección y ejecutarse con el contexto especificado", function() {
        var collectionIterator = cv.collectionIterator,
            spy = jasmine.createSpy("iterator");
        cv.collectionIterator = function(fn, ctx) {
          spy.andCallFake(fn);
          collectionIterator.call(this, spy, ctx);
        };
        cv.render();
        expect(spy).toHaveBeenCalled();
        expect(spy.calls.length).toEqual(1);
        expect(spy.calls[0].args[0].toJSON()).toEqual({otro: "dato"});
        expect(spy.calls[0].object).toBe(cv);
      });

    });

    describe("Base.Collection.childVent", function() {

      it("debería redireccionar los eventos de sus itemViews", function() {
        var childView,
            spy = jasmine.createSpy("eventHandler");
        var CustomMockView = MockView.extend({
          initialize: function() { childView = this; }
        });
        cv.itemView = CustomMockView;
        cv.render();
        cv.childVent.on("test:event", spy);
        childView.trigger("test:event", 1, 2);
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[0].args[0]).toBe(childView);
        expect(spy.calls[0].args[1]).toEqual(1);
        expect(spy.calls[0].args[2]).toEqual(2);
      });

    });

    describe("Base.Collection.collection", function() {

      it("debería añadir una vista .itemView cuando se añada un modelo a la colección", function() {
        var firstItemView;
        cv.render();
        firstItemView = cv.$("li").get(0);
        cv.collection.add({otro: "modelo"});
        expect(cv.$("li").length).toEqual(2);
        expect(cv.$("li").get(0)).toBe(firstItemView);
      });

    });

    describe("Base.Collection#createItemView", function() {

      it("debería devolver una instancia del tipo .itemView", function() {
        expect(cv.createItemView({})).toEqual(jasmine.any(cv.itemView));
      });

      it("debería asignar pasar {parent: this, model: <param>} al constructor .itemView", function() {
        var data = {};
        spyOn(cv, "itemView");
        cv.createItemView(data);
        expect(cv.itemView).toHaveBeenCalledWith({parent: cv, model: data});
      });

    });

    describe("Base.Collection#addChildView", function() {

      it("debería invocarse desde #render para cada modelo", function() {
        spyOn(cv, "addChildView").andCallThrough();
        cv.render();
        expect(cv.addChildView).toHaveBeenCalled();
        expect(cv.addChildView.calls[0].args[0].toJSON()).toEqual({
          otro: "dato"
        });
      });

      it("debería llamar a #createItemView para construir la instancia del individuo", function() {
        spyOn(cv, "createItemView").andCallThrough();
        cv.render();
        expect(cv.createItemView).toHaveBeenCalledWith(cv.collection.at(0));
      });

      it("debería devolver la nueva instancia de .itemView creada", function() {
        var origAddChildView = cv.addChildView,
            returned;
        cv.addChildView = function() {
          returned = origAddChildView.apply(this, arguments);
        };
        cv.render();
        expect(returned).toEqual(jasmine.any(MockView));
      });
    });

    describe("Base.CollectionView#delegateEvents", function() {

      it("debería invocar a la implementación del padre", function() {
        var superMethod = Base.CollectionView["__super__"].delegateEvents;
        spyOn(Base.CollectionView["__super__"], "delegateEvents");
        cv.render();
        cv.delegateEvents();
        expect(Base.CollectionView["__super__"].delegateEvents).toHaveBeenCalled();
        Base.CollectionView["__super__"].delegateEvents = superMethod;
      });

      it("debería invocar al método #delegateEvents de todas sus vistas hijas (de individuo)", function() {
        var mockView = new Base.ItemView();
        mockView.template = _.template("");
        spyOn(mockView, "delegateEvents");
        cv.createItemView = function() { return mockView; };
        cv.render();
        cv.delegateEvents();
        expect(mockView.delegateEvents).toHaveBeenCalled();
      });

    });

  });

});
