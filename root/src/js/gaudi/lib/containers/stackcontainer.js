define(["gaudi/base", "templates"], function(Base, JST) {
  "use strict";

  var BackButtonView = Base.ItemView.extend({
    initialize: function(options) {
      this.setCaption(options.caption || false);
    },
    className: "topcoat-button back-button",
    template: JST["containers/stack/backbutton"],
    serializeData: function() {
      return {caption: this.caption};
    },
    setCaption: function(caption) {
      this.caption = caption;
      if (caption) {
        this.render();
        this.$el.show();
      } else {
        this.$el.hide();
      }
    }
  });

  var NavTitleView = Base.ItemView.extend({
    initialize: function(options) {
      this.text = options.text;
    },
    className: "topcoat-navigation-bar__title",
    tagName: "h1",
    render: function() {
      this.el.innerHTML = this.text;
      return this;
    },
    setText: function(text) {
      this.text = text;
      this.render();
    }
  });

  var NavBarView = Base.Layout.extend({
    initialize: function(options) {
      this.navTitle = new NavTitleView(options);
      this.backButton = new BackButtonView(options);
      this.initRegions();
      this.regions.title.show(this.navTitle);
      this.regions.leftButton.show(this.backButton);
    },
    initRegions: function() {
      this.addRegions({
        leftButton: {
          selector: ".left",
          regionType: this.leftButtonRegionType || this.regionType,
        },
        rightButton: {
          selector: ".right",
          regionType: this.rightButtonRegionType || this.regionType,
        },
        title: {
          selector: ".title",
          regionType: this.titleRegionType || this.regionType,
        },
      });
    },
    triggers: {
      "touchstart .back-button": "navigation:back"
    },
    template: JST["containers/stack/navbar"],
    tagName: "header",
    className: "topcoat-navigation-bar",
    show: function(title, dir) {
      this.navTitle = new NavTitleView({text: title});
      this.regions.title.show(this.navTitle, dir);
    },
    setBackButton: function(text) {
      this.backButton = new BackButtonView({caption: text});
      this.regions.leftButton.show(this.backButton);
    },
  });

  var StackContainer = Base.FrameLayout.extend({
    initialize: function() {
      this._viewStack = [];
      this.navBar = new this["navBarType"]();
      this.initRegions();
      this.regions.navBar.show(this.navBar);
    },
    onResize: function(box) {
      var navH = 60,
          navFrame = this.regions.navBar.getFrame(),
          contentFrame = this.regions.content.getFrame();
      navFrame.setBox({width: box.width, height: navH});
      contentFrame.setBox({
        width: box.width,
        height: box.height - navH,
        x: box.x,
        y: box.y + navH
      });
    },
    onShow: function() {
      this.listenTo(this.navBar, "navigation:back", this.pop);
    },
    regionType: Base.FrameRegion,
    initRegions: function() {
      this.addRegion({
        selector: ".content",
        regionType: this.contentRegionType || this.regionType,
      }, "content");
      this.addRegion({
        selector: ".navbar",
        regionType: this.navBarRegionType || this.regionType
      }, "navBar");
    },
    template: JST["containers/stack/layout"],
    className: "component stackvc",
    navBarType: NavBarView,
    push: function(view) {
      this._viewStack.push(view);
      this.show(view);
    },
    pop: function() {
      if (this._viewStack.length > 1) {
        this._viewStack.pop();
        this.show(_.last(this._viewStack), true);
      }
    },
    show: function(view, dir) {
      var prevView = this._viewStack[this._viewStack.length - 2];
      this.navBarShow(view.title, (prevView? prevView.title: false), dir);
      this.regions.content.show(view, dir);
    },
    navBarShow: function(title, backButtonText, dir) {
      this.navBar.setBackButton(backButtonText);
      this.navBar.show(title, dir);
    }
    /* TODO: check the iOS/Android interface */
  });

  StackContainer.DefaultNavBarView = NavBarView;
  StackContainer.DefaultBackButtonView = BackButtonView;

  return StackContainer;

});
