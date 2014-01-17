/* global window */
define(["jquery", "underscore", "backbone", "gaudi/lib/touchevents"], function($, _, Backbone, touchEvents) {
  "use strict";

  /* Clase base */

  var Class = function() {
    if (this.initialize) { this.initialize.apply(this, arguments); }
  };
  Class.extend = Backbone.Model.extend;

  /* triggerMethod */

  var triggerMethod = function(event) {
    var args = [].slice.call(arguments, 1),
        methodName = event.split(":").reduce(function(acc, el) {
          return acc + el[0].toUpperCase() + el.slice(1);
        }, "on");
    this.trigger.apply(this, [event].concat(args));
    if (typeof(this[methodName]) === "function") {
      this[methodName].apply(this, args);
    }
  };

  _.extend(Backbone.Events, {triggerMethod: triggerMethod});
  _.extend(Backbone.View.prototype, {triggerMethod: triggerMethod});
  _.extend(Backbone.Model.prototype, {triggerMethod: triggerMethod});
  _.extend(Backbone.Collection.prototype, {triggerMethod: triggerMethod});

  /* Vent */

  var Vent = Class.extend({
    forward: function(target) {
      this.listenTo(target, "all", _.bind(function() {
        return this.trigger.apply(this, arguments);
      }, this));
    },
    forwardAll: function(targets) {
      _.each(targets, this.forward, this);
    }
  });
  _.extend(Vent.prototype, Backbone.Events);

  /* Regiones */

  var Region = Class.extend({
    constructor: function(options) {
      options = options || {};
      this.$el = options.$el;
      Region["__super__"].constructor.apply(this, arguments);
    },
    setElement: function($el) {
      this.$el = $el;
      if (this.currentView) {
        this.currentView.$el.detach();
        this.$el.empty().append(this.currentView.$el);
      } else if (this._pendingView) {
        this.show(this._pendingView);
        this._pendingView = undefined;
      }
    },
    delegateEvents: function() {
      if (this.currentView) {
        this.currentView.delegateEvents();
      }
    },
    show: function(view) {
      if (!this.$el || this.$el.length === 0) { return this._pendingView = view; }
      if (this.currentView) {
        this.currentView.triggerMethod("remove");
        this.close();
      }
      this.open(view.render());
      view.delegateEvents();
      this.currentView = view;
      this.currentView.triggerMethod("show");
    },
    close: function() {
      this.currentView.remove();
    },
    open: function(view) {
      this.$el.empty().append(view.el);
    },
  });

  var FrameRegion = Region.extend({
    constructor: function() {
      this.setFrame(new UIFrame());
      FrameRegion["__super__"].constructor.apply(this, arguments);
    },
    setFrame: function(frame) {
      if (!frame) { return; }
      this.frame = frame;
      if (this.$el) { this.frame.setElement(this.$el); }
    },
    getFrame: function() {
      return this.frame;
    },
    setElement: function() {
      FrameRegion["__super__"].setElement.apply(this, arguments);
      if (this.frame && this.$el) {
        this.frame.setElement(this.$el);
      }
    },
    show: function(view) {
      if (this.frame) {
        if (view.setFrame) { view.setFrame(this.frame); }
        var viewFrame = new UIFrame(this.frame);
        viewFrame.setPosition({x: 0, y: 0}, true);
        viewFrame.setElement(view.$el);
        this.frame.on("resize", function(box) {
          _.extend(box, {x: 0, y: 0});
          viewFrame.setBox(box);
        });
      }
      return FrameRegion["__super__"].show.apply(this, arguments);
    },
  });

  var UIFrame = Vent.extend({
    constructor: function(baseFrame) {
      UIFrame["__super__"].constructor.apply(this, arguments);
      _.extend(this, {x: 0, y: 0, width: 0, height: 0});
      if (baseFrame) {
        this.setSize(baseFrame.getSize());
        this.setPosition(baseFrame.getPosition());
      }
    },
    setElement: function($el) {
      this.$el = $el;
      this.$el.css({"position":"absolute", "overflow": "hidden"});
      this.adjustElement(true);
    },
    adjustElement: function(silent) {
      if (!this.$el) { return; }
      this.$el.css({height:this.height, width:this.width, left:this.x, top:this.y});
      if (!silent) {
        this.trigger("resize", this.getBox());
      }
    },
    setSize: function(size, silent) {
      this.width = (size.width !== undefined)? size.width : this.width;
      this.height = (size.height !== undefined)? size.height : this.height;
      if (!silent) { this.adjustElement(); }
    },
    setPosition: function(pos, silent) {
      this.x = (pos.x !== undefined)? pos.x : this.x;
      this.y = (pos.y !== undefined)? pos.y : this.y;
      if (!silent) { this.adjustElement(); }
    },
    getSize: function() {
      return {width: this.width, height: this.height};
    },
    getPosition: function() {
      return {x: this.x, y: this.y};
    },
    setBox: function(box, silent) {
      if (box.x || box.y) {
        this.setPosition(box, true);
      }
      if (box.width || box.height) {
        this.setSize(box, true);
      }
      this.adjustElement(silent);
    },
    getBox: function() {
      return _.extend(this.getSize(), this.getPosition());
    },
  });

  var UIWindow = Vent.extend({
    constructor: function(options) {
      UIWindow["__super__"].constructor.apply(this, arguments);
      options = options || {};
      // Size
      $(window).on("resize", _.bind(this.recalculateSize, this));
      this.frame = new UIFrame();
      this.recalculateSize();
      // Window region
      this.region = new FrameRegion({$el: $(options.selector || "body")});
      this.region.setFrame(this.frame);
      // Phone/Tablet threeshold
      this.phoneThreeshold = 400;
    },
    show: function(view) {
      this.region.show(view);
    },
    recalculateSize: function() {
      var frame = this.getFrame();
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      frame.setSize({width: this.width, height: this.height});
      if (this.isLandscape()) {
        frame.trigger("landscape");
      } else {
        frame.trigger("portrait");
      }
      frame.trigger("resize", frame.getBox());
    },
    isPhone: function() {
      var s = Math.min(window.screen.availWidth, window.screen.availHeight);
      return s < this.phoneThreeshold;
    },
    isTablet: function() {
      return !this.isPhone();
    },
    isPortrait: function() {
      return this.width < this.height;
    },
    isLandscape: function() {
      return !this.isPortrait();
    },
    getFrame: function() {
      return this.frame;
    }
  });

  /* Vistas base */

  var View = Backbone.View.extend({
    constructor: function() {
      this.events = this.events || {};
      _.each(this.triggers, function(toTrigger, domEvt) {
        this.events[domEvt] = _.bind(this.trigger, this, toTrigger, this);
      }, this);
      View["__super__"].constructor.apply(this, arguments);
    },
    delegateEvents: function(events) {
      var delegateEventSplitter = /^(\S+)\s*(.*)$/;
      if (!(events || (events = _.result(this, "events")))) { return this; }
      _.each(events, function(method, evstring) {
        var match = evstring.match(delegateEventSplitter);
        var eventName = match[1],
            selector = match[2];
        if (!_.isFunction(method)) { method = _.bind(this[events[evstring]], this); }
        if (!_.isFunction(method)) { return this; }
        method = _.bind(method, this);
        if (eventName in touchEvents.events) {
          events["touchstart " + selector] = touchEvents.handle(
            eventName,
            this.$el,
            selector,
            method
          );
          delete events[evstring];
        }
      }, this);
      this.events = events;
      View["__super__"].delegateEvents.apply(this, arguments);
      return this;
    },
    serializeModel: function() {
      var data = {};
      if (this.model) { _.extend(data, this.model.toJSON()); }
      if (this.collection) { _.extend(data, this.collection.toJSON()); }
      return data;
    },
    serializeData: function() {
      var data = this.serializeModel();
      if (typeof(this.helpers) === "function") {
        _.extend(data, this.helpers());
      } else {
        _.extend(data, this.helpers);
      }
      return data;
    },
    render: function() {
      var data = this.serializeData(),
          html = this.template(data);
      this.$el.empty().append(html);
      return this;
    },
  });

  var ItemView = View.extend({
    constructor: function() {
      ItemView["__super__"].constructor.apply(this, arguments);
    },
  });

  var CollectionView = View.extend({
    constructor: function() {
      CollectionView.__super__.constructor.apply(this, arguments);
      this.childVent = new Vent();
      if (this.collection && this.collection.on) {
        this.listenTo(this.collection, "add", this.addChildView);
        this.listenTo(this.collection, "sort", this.render);
      }
      this._childViews = [];
    },
    serializeModel: function() {
      return this.model? this.model.toJSON() : {};
    },
    collectionIterator: function(collection, fn, ctx) {
      collection.each(fn, ctx);
    },
    createItemView: function(data) {
      return new this.itemView({model: data, parent: this});
    },
    addChildView: function(model) {
      if (!this.$container) { return; }
      var itemView = this.createItemView(model);
      this._childViews.push(itemView);
      this.childVent.stopListening(itemView);
      this.childVent.listenTo(
        itemView,
        "all",
        _.bind(this._childTrigger, this, itemView)
      );
      this.$container.append(itemView.render().el);
      itemView.triggerMethod("show");
      return itemView;
    },
    renderEmptyView: function() {
      var emptyView;
      if (this.emptyViewType) {
        emptyView = new this.emptyViewType({parent: this});
        this.$container.append(emptyView.render());
      }
    },
    render: function(collection) {
      collection = collection || this.collection;
      if (this.template) {
        CollectionView.__super__.render.apply(this, arguments);
      }
      if (this.$container) { this.$container.empty(); }
      this.$container = this.itemContainer? this.$(this.itemContainer) : this.$el;
      this._childViews = [];
      this.childVent.stopListening();
      if (collection.length > 0) {
        this.collectionIterator(collection, this.addChildView, this);
      } else {
        this.renderEmptyView();
      }
      this.trigger("render");
      return this;
    },
    _childTrigger: function(itemView, event) {
      var args = [].slice.call(arguments, 2),
          triggerArgs = [event, itemView].concat(args);
      this.childVent.trigger.apply(this.childVent, triggerArgs);
    },
    delegateEvents: function() {
      CollectionView.__super__.delegateEvents.apply(this, arguments);
      _.invoke(this._childViews, "delegateEvents");
    }
  });

  var Layout = View.extend({
    constructor: function(options) {
      options = options || {};
      var regions = options.regions || this.regions || {};
      this.regions = {};
      this._regions = [];
      _.each(regions, this.addRegion, this);
      Layout["__super__"].constructor.apply(this, arguments);
    },
    regionType: Region,
    addRegions: function(regions) {
      _.each(regions, this.addRegion, this);
    },
    addRegion: function(value, name) {
      var RegionType = value.regionType || this.regionType,
          selector = (typeof(value) === "string")? value : value.selector,
          region = new RegionType({$el: this.el? this.$(selector) : null});
      this._regions.push({region: region, selector: selector});
      this.regions[name] = region;
    },
    reattachRegions: function() {
      /* NOTE:
        I do this in two steps:
          1) Select all the $el from the template for the regions.
          2) Attach the regions to the $el's
        It's like this to AVOID COLLISION with NESTED LAYOUTS
        if the regions get attached in the same loop that looks for the
        $el's, the selector could be matched in the CONTENTs of previously
        attached regions.
      */
      _.chain(this._regions)
      .map(function(regionData) {
        return {regionData: regionData, $el: this.$(regionData.selector)};
      }, this)
      .each(function(data) {
        data.regionData.region.setElement(data.$el);
      });

    },
    render: function() {
      Layout["__super__"].render.apply(this, arguments);
      this.reattachRegions();
      this.trigger("render");
      return this;
    },
    setElement: function() {
      Layout["__super__"].setElement.apply(this, arguments);
      this.reattachRegions();
    },
    delegateEvents: function() {
      Layout["__super__"].delegateEvents.apply(this, arguments);
      _.each(this._regions, function(regionData) {
        regionData.region.delegateEvents();
      });
    }
  });

  var FrameLayout = Layout.extend({
    setFrame: function(frame) {
      if (!frame) { return; }
      this.listenTo(frame, "resize", this.onResize);
      this.onResize(frame.getBox());
    },
    onResize: function() {
    }
  });

  var Easings = {
    // no easing, no acceleration
    linear: function (t) { return t; },
    // accelerating from zero velocity
    easeInQuad: function (t) { return t*t; },
    // decelerating to zero velocity
    easeOutQuad: function (t) { return t*(2-t); },
    // acceleration until halfway, then deceleration
    easeInOutQuad: function (t) { return t<0.5 ? 2*t*t : -1+(4-2*t)*t; },
    // accelerating from zero velocity
    easeInCubic: function (t) { return t*t*t; },
    // decelerating to zero velocity
    easeOutCubic: function (t) { return (--t)*t*t+1; },
    // acceleration until halfway, then deceleration
    easeInOutCubic: function (t) { return t<0.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1; },
    // accelerating from zero velocity
    easeInQuart: function (t) { return t*t*t*t; },
    // decelerating to zero velocity
    easeOutQuart: function (t) { return 1-(--t)*t*t*t; },
    // acceleration until halfway, then deceleration
    easeInOutQuart: function (t) { return t<0.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t; },
    // accelerating from zero velocity
    easeInQuint: function (t) { return t*t*t*t*t; },
    // decelerating to zero velocity
    easeOutQuint: function (t) { return 1+(--t)*t*t*t*t; },
    // acceleration until halfway, then deceleration
    easeInOutQuint: function (t) { return t<0.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t; }
  };

  var Animation = Class.extend({
    initialize: function(options) {
      this.from = options.from;
      this.to = options.to;
      this.delta = (this.to - this.from);
      this.onStepCallback = options.onStep;
      this.onFinishCallback = options.onFinish;
      this.duration = options.duration;
      this.start = Date.now();
      this.easing = Easings[options.easing || "linear"];
      // this.tick = 35;
      this.tick = 15;
      this.intervalId = window.setInterval(_.bind(this.onStep, this), this.tick);
      this.t = 0;
      this.tStep = (1/this.duration)*this.tick;
    },
    onStep: function() {
      this.t += this.tStep;
      var finished = false,
          progress = this.easing(this.t);
      if (this.t >= 1) {
        this.value = this.to;
        finished = true;
      } else {
        this.value = this.from + (this.delta * progress);
      }
      if (this.onStepCallback) { this.onStepCallback(this.value); }
      if (finished) {
        this.stop();
      }
    },
    stop: function() {
      this.halt();
      if (this.onFinishCallback) { this.onFinishCallback(this.value); }
    },
    halt: function() {
      window.clearInterval(this.intervalId);
    }
  });

  var Fragment = Vent.extend({
    constructor: function() {
      this.vent = new Vent();
      Fragment["__super__"].constructor.apply(this, arguments);
    },
    start: function() {
      throw new Error("Abstract method!");
    },
    stop: function() {
    },
    getMainView: function() {
      return this.mainView;
    },
  });

  var Activity = Fragment.extend({
  });

  var App = Class.extend({}, {
    getWindow: function() {
      window._window = (App._window) || (App._window = new UIWindow());
      return (App._window) || (App._window = new UIWindow());
    }
  });

  return {
    Class: Class,
    Vent: Vent,
    Region: Region,
    FrameRegion: FrameRegion,
    View: View,
    ItemView: ItemView,
    CollectionView: CollectionView,
    Layout: Layout,
    FrameLayout: FrameLayout,
    UIWindow: UIWindow,
    UIFrame: UIFrame,
    Easings: Easings,
    Animation: Animation,
    Fragment: Fragment,
    Activity: Activity,
    App: App
  };
});
