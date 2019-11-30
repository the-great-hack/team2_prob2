const assign = require('101/assign');

const PriorityQueue = function() {
  this.nodes = [];
};

assign(PriorityQueue.prototype, {
  enqueue: function(priority, key) {
    this.nodes.push({ key: key, priority: priority });
    this.sort.call(this);
  },
  dequeue: function() {
    return this.nodes.shift().key;
  },
  sort: function() {
    this.nodes.sort(function(a, b) {
      return a.priority - b.priority;
    });
  },
  isEmpty: function() {
    return !this.nodes.length;
  },
});

export default PriorityQueue;
