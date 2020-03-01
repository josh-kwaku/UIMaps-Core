const Heap = require('./min_heap_for_alt');

class PQ {
    constructor() {
        this.heap = new Heap();
    }

    insert(node) {
        this.heap.insert(node);
    }

    get min() {
        return this.heap.min();
    }

    get size() {
        return this.heap.size;
    }

    extractMin() {
        return this.heap.extractMin();
    }


    decreaseKey(index, key) {
        return this.heap.decreaseKey(index, key);
    }

    peek() {
        this.heap.peek();
    }

    showSore() {
        this.heap.showStore()
    }

    list() {
        return this.heap.list;
    }
}

// const pq = new PQ();
// pq.insert(0);
// pq.insert(1);
// pq.insert(3);
// pq.insert(4);
// pq.insert(2);
// pq.insert(5);
// pq.extractMin();
// pq.extractMin();
// pq.insert(7);
// pq.insert(6);
// pq.insert(10);
// pq.extractMin();
// pq.insert(9);
// pq.extractMin();
// pq.peek();
module.exports = PQ;