/* global describe, it, expect, spyOn, beforeEach */
define(["jasmine-html", "base", "containers", "templates"], function(jasmine, Base, Containers, JST) {
  "use strict";

  describe("Containers.TabContainer", function() {
    var DefaultTabBarView = Containers.TabContainer.DefaultTabBarView,
        DefaultTabView = Containers.TabContainer.DefaultTabView,
        TabContainer = Containers.TabContainer;
    // TODO: Really, really need to complement this with some slides
    // TODO: And some USAGE EXAMPLES!


    describe("Containers.TabContainer.DefaultTabView", function() {
      var tabView;

      beforeEach(function() {
        tabView = DefaultTabView.createWith({title: "Title"});
      });

      it("debería ser una subclase de Base.ItemView", function() {
        expect(tabView).toEqual(jasmine.any(Base.ItemView));
      });

      describe("Inicialización", function() {

        it("debería crear instancias con la factoría #createWith", function() {
          var tv = DefaultTabView.createWith({title: "Test"});
          expect(tv).toEqual(jasmine.any(Base.ItemView));
        });

      });

      describe("Datos", function() {

        it("debería devolver un objeto con los datos de la pestaña desde #serializeModel", function() {
          expect(tabView.serializeModel()).toEqual({
            title: "Title",
            image: undefined,
            selectedImage: undefined
          });

          tabView = DefaultTabView.createWith({
            title: "asdf",
            image: "/tab.png",
            selectedImage: "/tab-selected.png"
          });
          expect(tabView.serializeModel()).toEqual({
            title: "asdf",
            image: "/tab.png",
            selectedImage: "/tab-selected.png"
          });
        });

      });

      describe("Rendeado", function() {

        it("debería utilizar el template JST['containers/tabs/tab']", function() {
          var temp = DefaultTabView.prototype.template;
          expect(temp).toBeTruthy();
          expect(temp).toBe(JST["containers/tabs/tab"]);
        });

        it("debería crear un .el del tipo <label class='topcoat-tab-bar__item'>", function() {
          expect(tabView.el.tagName.toLowerCase()).toEqual("label");
          expect(tabView.el.className.toLowerCase()).toEqual("topcoat-tab-bar__item");
        });

      });

      describe("Interacción", function() {

        it("debería lanzar el evento 'tab:selected' cuando el usuario hace click/tap en la pestaña", function() {
          var handler = jasmine.createSpy("handler");
          tabView.on("tab:selected", handler);
          tabView.$el.click();
          expect(handler).toHaveBeenCalledWith(tabView);
          tabView.$el.trigger("touchstart");
          expect(handler.callCount).toBe(2);
        });

      });

    });

    describe("Containers.TabContainer.DefaultTabBarView", function() {
      var tbv;

      beforeEach(function() {
        tbv = new DefaultTabBarView();
      });

      it("debería ser una subclase de Base.CollectionView", function() {
        expect(tbv).toEqual(jasmine.any(Base.CollectionView));
      });

      describe("Rendeado", function() {

        it("debería utilizar el template JST['containers/tabs/tab-bar']", function() {
          var temp = DefaultTabBarView.prototype.template;
          expect(temp).toBeTruthy();
          expect(temp).toBe(JST["containers/tabs/tab-bar"]);
        });

        it("debería crear un .el del tipo <section class='component'>", function() {
          expect(tbv.el.tagName.toLowerCase()).toEqual("section");
          expect(tbv.el.className.toLowerCase()).toEqual("component");
        });

        it("debería rendear las pestañas en .content", function() {
          expect(tbv.itemContainer).toEqual(".content");
        });

      });

      describe("Datos", function() {

        it("debería poder añadir tabs con #addTab", function() {
          tbv.addTab(DefaultTabView.createWith({title: "test"}));
        });

        it("debería poder recuperar los tabs añadidos con #getTabs", function() {
          var tab = DefaultTabView.createWith({title: "test"});
          tbv.addTab(tab);
          expect(tbv.getTabs()).toEqual([tab]);
        });

        it("debería recorrer los tabs con #collectionIterator", function() {
          var tab = DefaultTabView.createWith({title: "test"}),
              spy = jasmine.createSpy("iterator");
          tbv.addTab(tab);
          tbv.collectionIterator(spy, {});
          expect(spy).toHaveBeenCalled();
          expect(spy.calls[0].args[0]).toBe(tab);
        });

        it("debería rendear los tabs añadidos", function() {
          /* CUIDADO! Este test es más compliado de lo que parece... */
          /* Revisa el método Base.CollectionView#render */
          var tab = DefaultTabView.createWith({title: "test"});
          tbv.addTab(tab);
          tbv.render();
          expect(tbv.$(".content").text().trim()).toEqual("test");
        });

      });

      describe("Interacción", function() {

        it("debería disparar el evento tab:selected por .childVent cuando se haga click/tap en alguna de las pestañas", function() {
          var tab = DefaultTabView.createWith({title: "test"}),
              handler = jasmine.createSpy("handler");
          tbv.addTab(tab);
          tbv.render();
          tbv.childVent.on("tab:selected", handler);
          tab.$el.trigger("touchstart");
          expect(handler).toHaveBeenCalled();
          expect(handler.calls[0].args[0]).toBe(tab);
        });

      });
    });

    // And finally put everything in the right place

    describe("Containers.TabContainer", function() {
      var tb, testView, testView2;

      beforeEach(function() {
        testView = new Base.ItemView();
        testView.template = _.template("test view");

        testView2 = new Base.ItemView();
        testView2.template = _.template("test view 2");

        tb = new Containers.TabContainer();
        tb.addTab({
          name: "Test",
          icon: "img/test.png",
          view: testView
        });
        tb.addTab({
          name: "Test2",
          icon: "img/test2.png",
          view: testView2
        });
      });

      it("debería ser una subclase Base.Layout", function() {
        expect(tb).toEqual(jasmine.any(Base.Layout));
      });

      describe("Inicialización", function() {

        describe("TabContainer#initialize", function() {

          it("debería crear dos regiones: 'content' y 'controls' (en '.content' y '.controls')", function() {
            var tc = new TabContainer();
            expect(tc.regions.controls).toEqual(jasmine.any(Base.Region));
            expect(tc.regions.content).toEqual(jasmine.any(Base.Region));
          });

          it("debería crear una instancia de .tabBarViewType, guardarla en .tabBar y mostrarla en la region 'controls'", function() {
            var instance;
            var CustomTabBarView = Base.CollectionView.extend({
              initialize: function() { instance = this; },
              template: _.template(""),
              collection: new Backbone.Collection()
            });
            spyOn(CustomTabBarView.prototype, "initialize").andCallThrough();
            var CustomTabContainer = TabContainer.extend({
              tabBarViewType: CustomTabBarView,
              template: _.template("<div class='controls'></div>"),
            });
            var ctb = new CustomTabContainer();
            ctb.render();
            expect(CustomTabBarView.prototype.initialize).toHaveBeenCalled();
            expect(ctb.tabBar).toBe(instance);
            expect(ctb.regions.controls.currentView).toBe(instance);
          });

          it("debería crear una instancia de Containers.TabContainer.DefaultTabBarView si no se espeficica otro constructor", function() {
            var tc = new TabContainer();
            expect(tc.tabBar).toEqual(jasmine.any(DefaultTabBarView));
          });

        });

      });

      describe("Datos", function() {

        describe("TabContainer#addTab", function() {
          var tc, contentView, tab;

          beforeEach(function() {
            tc = new TabContainer();
            contentView = new Base.ItemView();
            contentView.template = _.template("");
            tc.addTab({title: "Test"}, contentView);
            tab = tc.tabBar.getTabs()[0];
          });

          it("debería recibir (<tab data>, <content view>) y añadir la pestaña a la barra de pestañas", function() {
            expect(tab.serializeModel().title).toEqual("Test");
          });

          it("debería crear la pestaña con .tabViewType#createWith()", function() {
            expect(tab).toEqual(jasmine.any(tc.tabViewType));
          });

          it("debería asociar la pestaña al contenido para poder recuperar el contenido con #getContentForTab(tab)", function() {
            expect(tc.getContentForTab(tab)).toBe(contentView);
          });

        });

      });

      describe("Rendeado", function() {

        it("debería utilizar el template JST['containers/tabs/layout']", function() {
          var temp = TabContainer.prototype.template;
          expect(temp).toBeTruthy();
          expect(temp).toBe(JST["containers/tabs/layout"]);
        });

        it("debería crear un .el del tipo <div class='controls tabvc'>", function() {
          var tc = new TabContainer();
          expect(tc.el.tagName.toLowerCase()).toEqual("div");
          expect(tc.el.className.toLowerCase()).toEqual("controls tabvc");
        });

      });

      describe("Interacción", function() {
        var tc, tab, contentView;

        beforeEach(function() {
          spyOn(TabContainer.prototype, "onSelectedTab").andCallThrough();
          spyOn(TabContainer.prototype, "showContent").andCallThrough();
          tc = new TabContainer();
          contentView = new Base.ItemView();
          contentView.template = _.template("");
          tc.addTab({title: "test"}, contentView);
          tab = tc.tabBar.getTabs()[0];
          tc.render();
        });

        it("debería ejecutar #onSelectedTab cuando se haga click/tap en una pestaña", function() {
          tab.$el.trigger("touchstart");
          expect(tc.onSelectedTab).toHaveBeenCalled();
          expect(tc.onSelectedTab.calls[0].args[0]).toBe(tab);
        });

        it("debería ejecutar #showContent(<content view>) desde #onSelectedTab con el contenido a mostrar (vista)", function() {
          tab.$el.trigger("touchstart");
          expect(tc.showContent).toHaveBeenCalledWith(contentView);
        });

        it("debería mostrar el contenido asociado a la pestaña en la región 'content'", function() {
          tab.$el.trigger("touchstart");
          expect(tc.regions.content.currentView).toBe(contentView);
        });

        it("debería seleccionar por defecto la primera pestaña", function() {
          expect(tc.regions.content.currentView).toBe(contentView);
        });

      });

    });

  });

});

/*

Posibles mejoras:

- Guardar el estado (activa/inactiva) de cada pestaña
- Mostrar en el template image y selectedImage
- Animar las transiciones entre pestañas
- Añadir scroll horizontal para alojar más pestañas

*/
