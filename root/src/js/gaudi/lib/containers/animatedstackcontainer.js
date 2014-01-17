define(["gaudi/base", "gaudi/lib/containers/stackcontainer", "gaudi/lib/regions"], function(Base, StackContainer, Regions) {
  "use strict";

  var AnimatedNavBar = StackContainer.DefaultNavBarView.extend({
    titleRegionType: Regions.SlideItemRegion,
    leftButtonRegionType: Regions.FadeItemRegion
  });

  var AnimatedStackContainer = StackContainer.extend({
    contentRegionType: Regions.SlideRegion,
    navBarRegionType: Base.FrameRegion,
    navBarType: AnimatedNavBar,
  });

  return AnimatedStackContainer;
});
