define([
  "gaudi/lib/containers/tabcontainer",
  "gaudi/lib/containers/stackcontainer",
  "gaudi/lib/containers/animatedstackcontainer",
  "gaudi/lib/containers/simplescrollcontainer",
  "gaudi/lib/containers/inertialscrollcontainer",
  "gaudi/lib/containers/listcontainer",
], function(TabContainer, StackContainer, AnimatedStackContainer, SimpleScrollContainer, InertialScrollContainer, ListContainer) {
  "use strict";
  return {
    TabContainer: TabContainer,
    StackContainer: StackContainer,
    AnimatedStackContainer: AnimatedStackContainer,
    SimpleScrollContainer: SimpleScrollContainer,
    InertialScrollContainer: InertialScrollContainer,
    ListContainer: ListContainer,
  };
});
