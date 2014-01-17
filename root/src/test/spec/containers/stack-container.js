/* global describe, it, expect, spyOn, beforeEach */
define(["jasmine-html", "base", "containers", "templates"], function(jasmine, Base, Containers, JST) {
  "use strict";

  describe("Containers.StackContainer", function() {
    var StackContainer = Containers.StackContainer,
        DefaultNavBarView = StackContainer.DefaultNavBarView;

    describe("Containers.StackContainer.DefaultNavBarView", function() {
      var navBar;

      beforeEach(function() {
        navBar = new DefaultNavBarView();
      });

      it("debería ser una subclase de Base.Layout", function() {
        expect(navBar).toEqual(jasmine.any(Base.Layout));
      });

      describe("Inicialización", function() {

        it("debería utilizar el template JST['containers/stack/navbar']", function() {
          var temp = DefaultNavBarView.prototype.template;
          expect(temp).toBeTruthy();
          expect(temp).toBe(JST["containers/stack/navbar"]);
        });

        it("debería crear una región 'rightButton' (en .right)", function() {
          expect(navBar.regions.rightButton).toEqual(
            jasmine.any(Base.Region)
          );
        });

      });

      describe("Datos", function() {

        it("debería guardar el título de la vista mostrada con #show()", function() {
          var fakeView = {title: "Test"};
          navBar.show(fakeView);
          expect(navBar.title.trim()).toEqual("Test");
        });

        it("debería guardar el texto del botón 'back' configurado con #backButton()", function() {
          navBar.backButton("Back");
          expect(navBar.backButtonText.trim()).toEqual("Back");
        });

        it("debería devolver el título y el texto del botón back desde #serializeModel()", function() {
          navBar.show({title: "Test"});
          navBar.backButton("Back");
          expect(navBar.serializeModel()).toEqual({
            title: "Test",
            backButtonText: "Back"
          });
        });

      });

      describe("Rendeado", function() {

        it("debería crar un elemento tipo <header class='topcoat-navigation-bar'>", function() {
          expect(navBar.el.tagName.toLowerCase()).toEqual("header");
          expect(navBar.el.className).toEqual("topcoat-navigation-bar");
        });

        it("debería actualizar el texto del título desde #show()", function() {
          navBar.render();
          expect(navBar.$(".title").text().trim()).toEqual("");
          navBar.show({title: "Test"});
          expect(navBar.$(".title").text().trim()).toEqual("Test");
        });

        it("debería actualizar el texto del botón 'back' desde #backButton()", function() {
          navBar.render();
          expect(navBar.$(".back-button").text().trim()).toEqual("");
          navBar.backButton("Back");
          expect(navBar.$(".back-button").text().trim()).toEqual("Back");
        });

      });

      describe("Interacción", function() {

        it("debería lanzar el evento 'navigation:back' al hacer click/tap en el botón 'back'", function() {
          var spy = jasmine.createSpy("handler");
          navBar.render();
          navBar.on("navigation:back", spy);
          navBar.$(".back-button").trigger("touchstart");
          expect(spy).toHaveBeenCalled();
        });
      });

    });

    describe("Containers.StackContainer", function() {
      var sc, view, view2;

      beforeEach(function() {
        sc = new StackContainer();
        view = new Base.ItemView();
        view.title = "Test";
        view2 = new Base.ItemView();
        view2.title = "Vista 2";
        view.template = view2.template = _.template("");
      });

      it("debería ser una subclase de Base.Layout", function() {
        expect(sc).toEqual(jasmine.any(Base.Layout));
      });

      describe("Inicialización", function() {

        it("debería utilizar el template JST['containers/stack/layout']", function() {
          var temp = StackContainer.prototype.template;
          expect(temp).toBeTruthy();
          expect(temp).toBe(JST["containers/stack/layout"]);
        });

        it("debería crear dos regiones: content (en .content) y navBar (en .navbar)", function() {
          expect(sc.regions.content).toEqual(jasmine.any(Base.Region));
          expect(sc.regions.navBar).toEqual(jasmine.any(Base.Region));
        });

        it("debería crear una instancia de .navBarType y mostrarla en la región 'navBar'", function() {
          var spy = jasmine.createSpy("show");
          var CustomStackContainer = StackContainer.extend({
            initialize: function() {
              this.regions.navBar.show = spy;
              CustomStackContainer["__super__"].initialize.call(this);
            }
          });
          new CustomStackContainer();
          expect(spy).toHaveBeenCalled();
          expect(spy.calls[0].args[0]).toEqual(
            jasmine.any(DefaultNavBarView)
          );
        });

      });

      describe("Datos", function() {

        describe("Containers.StackContainer#show", function() {

          it("debería mostrar la vista en la región 'content'", function() {
            spyOn(sc.regions.content, "show");
            sc.show(view);
            expect(sc.regions.content.show).toHaveBeenCalledWith(view);
          });

          it("debería actualizar la barra de navegación", function() {
            sc.render();
            sc.show(view);
            expect(sc.$(".title").text()).toEqual("Test");
          });

        });

        describe("Containers.StackContainer#push", function() {

          it("debería añadir una nueva vista a la pila y mostrarla", function() {
            spyOn(sc, "show");
            sc.push(view);
            expect(sc.show).toHaveBeenCalledWith(view);
          });

          it("debería añadir varias vistas si se invoca varias veces", function() {
            spyOn(sc, "show");
            sc.push(view);
            sc.push(view2);
            expect(sc.show.callCount).toEqual(2);
            expect(sc.show.calls[1].args[0]).toBe(view2);
          });

          it("debería modificar el botón 'back' de la barra de navegación con el título de la vista anterior", function() {
            sc.render();
            sc.push(view);
            sc.push(view2);
            expect(sc.$(".back-button").text().trim()).toEqual("Test");
          });

        });

        describe("Containers.StackContainer#pop", function() {

          it("debería descartar la vista actual y mostrar la anterior vista de la pila", function() {
            sc.push(view);
            sc.push(view2);
            spyOn(sc, "show");
            sc.pop();
            expect(sc.show).toHaveBeenCalledWith(view);
          });

          it("no debería hacer nada si no quedan más vistas en la pila", function() {
            sc.push(view);
            spyOn(sc, "show");
            sc.pop();
            expect(sc.show).not.toHaveBeenCalled();
          });

          it("debería ocultar el botón 'back' si estamos en la última vista de la pila", function() {
            sc.render();
            sc.push(view);
            sc.push(view2);
            sc.pop();
            expect(sc.$(".back-button").css("display")).toEqual("none");
          });

        });

      });

      describe("Rendeado", function() {

        it("debería crear un elemento del tipo <div class='component stackvc'>", function() {
          expect(sc.el.tagName.toLowerCase()).toEqual("div");
          expect(sc.el.className).toEqual("component stackvc");
        });

      });

      describe("Interacción", function() {

        it("debería escuchar al evento 'navigation:back' de la barra de navegación e invocar a #pop()", function() {
          var fakeRegion = new Base.Region({$el: $("<div/>")});
          spyOn(sc, "pop");
          sc.push(view);
          sc.push(view2);
          fakeRegion.show(sc);
          sc.$(".back-button").trigger("touchstart");
          expect(sc.pop).toHaveBeenCalled();
        });

      });

    });
  });

});
