define([], function() {
  "use strict";

  var locks = {};

  return {
    lock: function(id) {
      id = id || Math.floor(1000 * Math.random());
      locks[id] = true;
      return id;
    },
    free: function(id) {
      locks[id] = false;
    },
    isLocked: function(id) {
      return id && locks[id];
    },
    isFree: function(id) {
      return !this.isLocked(id);
    }
  };
});
