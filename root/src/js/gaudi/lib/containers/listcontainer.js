/* REFACTOR:
*
* PARTS:
*
* 1. Collection management
*   - insertion/deletion/update hooks
*   - sane itemView rendering interface (based on BBone.Model)
*
* 2. Position calculation
*   - measure somehow
*   - decide the items to show for a given position
*
* 3. Rendering and Updating
*
* 4. View pools and management
*
*
* THINGS I WANT TO DO:
*
* - A way to access a portion of the item views, for example to animate an insertion or deletion
* - Clean, quick way to update the data shown
* - Clean, quick way to measure and reposition
* - Multiple itemViewTypes and variable height
* - Manage rendering and re-rendering efficiently
* - Respond to changes in the collection
* - Default animations for insertion/deletion/substitution
* - A much cleaner way to overwrite the default itemViewTypes
* - Good, sane itemViewTypes by default
*
* NICE TO HAVE / FUTURE:
* - Editable lists?
*/


define(["gaudi/base", "gaudi/lib/containers/inertialscrollcontainer", "templates"], function(Base, InertialScrollContainer, JST) {
  "use strict";

  var ListItemView = Base.ItemView.extend({
    initialize: function(options) {
      this.vent = options.vent;
    },
    events: {
      "vtap": "select",
    },
    select: function() {
      this.vent.trigger("list:item:selected", this.data, this);
    },
    className: "list-item button",
    template: JST["ejercicios/listitem"],
    setData: function(data) {
      if (!this.rendered) {
        this.render();
        this.rendered = true;
      }
      this.data = data;
      this.$(".tiny").text(data.tiny);
      this.$(".text").text(data.text);
      this.$(".subtext").text(data.subtext);
      if (data.img) { this.$("img").attr("src", data.img); }
    }
  });


  var ListScrollContainer = InertialScrollContainer.extend({
    constructor: function(options) {
      this.ItemView = options.itemView || this.itemViewType;
      this.dataProvider = options.dataProvider;
      if (!this.dataProvider) {
        throw new Error("Not enough options");
      }
      this.position = { x: 0, y: 0 };
      this.itemViews = [];
      this.itemViewPool = [];
      this.shown = {min: 0, max: 0};
      this.vent = new Base.Vent();
      ListScrollContainer["__super__"].constructor.apply(this, arguments);
    },
    itemViewType: ListItemView,
    itemViewAt: function(index) {
      var data = this.dataAt(index),
          view = this.getViewFor(data);
      view.setData(data);
      return view;
    },
    getViewFor: function() {
      return this.getItemViewInstance();
    },
    getItemViewInstance: function() {
      if (this.itemViewPool.length > 0) {
        return this.itemViewPool.pop();
      } else {
        return new this.ItemView({vent: this.vent});
      }
    },
    dataAt: function(index) {
      var data = this.dataProvider.at(index);
      return data;
    },
    freeItemViews: function(from, to) {
      var freed = this.itemViews.splice(from, to-from);
      this.itemViewPool.push.apply(this.itemViewPool, freed);
    },
    allocateItemViews: function(minIndex, maxIndex, before) {
      var views = [];
      for (var i=minIndex; i<=Math.min(this.dataProvider.length, maxIndex); i++) {
        views.push(this.itemViewAt(i));
      }
      [][before? "unshift" : "push"].apply(this.itemViews, views);
    },
    start: function() {
      this.renderItemViews(true);
    },
    onResize: _.debounce(function(box) {
      if (!this.prevHeight || this.prevHeight !== box.height) {
        this.prevHeight = box.height;
        this.renderItemViews(true);
      }
    }, 300),
    onRemove: function() {
      // Stash and recover the childs when removed/resotred on a region
      this.stash = this.$el.children().detach();
    },
    onShow: function() {
      if (this.stash) {
        this.$el.append(this.stash);
        this.stash = undefined;
      }
    },
    renderItemView: function(index, containerWidth) {
      var itemView = this.itemViewAt(index);
      itemView.$el.css({position: "absolute", top: 0, width: containerWidth+"px"});
      this.$el.append(itemView.el);
      return itemView;
    },
    renderItemViews: function(animated) {
      var itemView,
          dataItems = this.dataProvider.length,
          minShown = this.shown.min,
          maxShown = dataItems,
          containerHeight = this.$el.height(),
          containerWidth = this.$el.width();
      if (this.itemsPerScreen && (this.shown.max - minShown) < this.itemsPerScreen) {
        minShown = Math.max(0, dataItems - this.itemsPerScreen - 1);
      }
      this.$el.children().detach();
      this.itemHeight = 0;
      this.freeItemViews(0, this.itemViews.length);
      for (var i=minShown, _len=maxShown; i<_len; i++) {
        itemView = this.renderItemView(i, containerWidth);
        this.itemViews.push(itemView);
        if (!this.itemHeight) {
          this.itemHeight = itemView.el.offsetHeight;
          this.itemsPerScreen = Math.ceil(containerHeight / this.itemHeight) + 1;
          this.itemsPerScreen = Math.min(this.itemsPerScreen, dataItems);
          this.shown.max = Math.min(this.shown.min + this.itemsPerScreen, _len) - 1;
          this.shown.min = (this.shown.max - this.itemsPerScreen) + 1;
        }
        if (i >= this.shown.max) { break; }
      }
      this.contentHeight = (this.dataProvider.length + 1) * this.itemHeight;
      if (minShown > 0) {
        for (i=minShown-1; i >= this.shown.min; i--) {
          this.itemViews.unshift(this.renderItemView(i, containerWidth));
        }
      }

      if (animated) {
        this.animatedMoveTo(this.position);
      } else {
        this.moveTo(this.position);
      }
      this.onStop();
    },
    getContentSize: function() {
      var offsetY = this.$el.height() - this.contentHeight;
      return {
        max: { x: 0, y: 0 },
        min: { x: 0, y: offsetY < 0? offsetY : 0 }
      };
    },
    animatedMoveTo: function(pos) {
      var children = this.$el.children(),
          offW;
      children.css({"-webkit-transition": "-webkit-transform .5s ease-out"});
      offW = this.el.offsetWidth;
      this.moveTo(pos);
      $(children[0]).one("webkitTransitionEnd", function() {
        children.css("-webkit-transition", "");
      });
    },
    getPosition: function() {
      return this.position;
    },
    refresh: function(quiet) {
      this.$el.empty();
      this.itemViews = [];
      this.itemViewPool = [];
      this.renderItemViews(!quiet);
    },
    moveTo: function(newPoint) {
      if (this.dataProvider.length === 0) { return; }
      var posY = newPoint.y || 0,
          view,
          maxElement = this.dataProvider.length - 1,
          topElement = (-posY / this.itemHeight)<<0,
          lastElement = topElement + this.itemsPerScreen - 1;
      this.position.y = posY;
      posY = posY % this.itemHeight;
      if (topElement < 0) {
        posY += (-topElement) * this.itemHeight;
        topElement = 0;
        lastElement = this.itemsPerScreen - 1;
      } else if (lastElement > maxElement) {
        posY -= (lastElement - maxElement) * this.itemHeight;
        lastElement = this.dataProvider.length - 1;
        topElement = (lastElement - this.itemsPerScreen) + 1;
      }
      if (topElement > this.shown.min) {
        this.freeItemViews(0, topElement - this.shown.min);
        this.allocateItemViews(this.shown.max+1, lastElement);
      } else if (lastElement < this.shown.max) {
        this.freeItemViews(this.itemsPerScreen - (this.shown.max - lastElement), this.itemsPerScreen);
        if (this.shown.min > 0) {
          this.allocateItemViews(topElement, this.shown.min-1, true);
        }
      }
      this.shown.min = topElement;
      this.shown.max = lastElement;
      for (var i=0, _len=this.itemViews.length; i<_len; i++) {
        view = this.itemViews[i];
        // view.el.style.webkitTransform = "translate(0,"+posY+"px)";
        view.el.style.webkitTransform = "translate3d(0,"+posY+"px,0)";
        posY += this.itemHeight;
      }
    },
  });

  ListScrollContainer.DefaultListItemView = ListItemView;

  return ListScrollContainer;
});
