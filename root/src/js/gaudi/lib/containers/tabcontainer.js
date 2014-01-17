define(["gaudi/base", "templates"], function(Base, JST) {
  "use strict";

  var TabView = Base.ItemView.extend({
    initialize: function() { },
    tagName: "label",
    className: "topcoat-tab-bar__item",
    template: JST["containers/tabs/tab"],
    events: {
      "touchstart": "reportSelected",
    },
    serializeModel: function() {
      return this.model;
    },
    reportSelected: function() {
      this.$("input").prop("checked", "checked");
      this.trigger("tab:selected", this);
    },
  }, {
    createWith: function(options) {
      var Const = this;
      options = _.extend({ title: "" }, options);
      return new Const({model: options});
    }
  });

  var TabBarView = Base.CollectionView.extend({
    initialize: function() {
      this.tabs = [];
    },
    itemContainer: ".content",
    template: JST["containers/tabs/tab-bar"],
    tagName: "section",
    className: "component",
    collectionIterator: function(fn, ctx) {
      _.each(this.tabs, fn, ctx);
    },
    createItemView: function(tab) {
      return tab;
    },
    addTab: function(tab) {
      this.tabs.push(tab);
    },
    getTabs: function() {
      return this.tabs;
    }
  });

  var TabContainer = Base.Layout.extend({
    initialize: function() {
      this.vent = new Base.Vent();
      this.tabBar = new this.tabBarViewType();
      this.regions.controls.show(this.tabBar);
      this.tabBar.childVent.on("tab:selected", this.onSelectedTab, this);
      this._tabsContent = {};
    },
    tabBarViewType: TabBarView,
    tabViewType: TabView,
    regions: {
      content: ".content",
      controls: ".controls"
    },
    className: "controls tabvc",
    template: JST["containers/tabs/layout"],
    addTab: function(tabDescription, content) {
      tabDescription.name = this.cid;
      var tab = this.tabViewType.createWith(tabDescription);
      this.tabBar.addTab(tab);
      this.setContentForTab(tab, content);
      if (this.tabBar.getTabs().length === 1) {
        this.showContent(content);
        tab.model.active = true;
      }
    },
    setContentForTab: function(tab, content) {
      this._tabsContent[tab.cid] = content;
    },
    getContentForTab: function(tab) {
      return this._tabsContent[tab.cid];
    },
    onSelectedTab: function(tab) {
      this.showContent(this.getContentForTab(tab));
    },
    showContent: function(content) {
      this.regions.content.show(content);
    }
  });

  TabContainer.DefaultTabView = TabView;
  TabContainer.DefaultTabBarView = TabBarView;

  return TabContainer;
});
