class MinHeap {
    constructor(array) {
        this.node_index_store = {} // holds the indices of the nodes in the pq as their key decreases (i.e as their positions change)
        if ( array == null || array == undefined || array.size == 0) {
            this.list = [];
            this.size = 0;
        } else {
            this.list = Object.assign([], array);
            this.size = 0;
            this.buildHeap(this.list);

            // fill the node indices with their start values
            this.list.forEach((node, index) => {
                this.node_index_store[node.index] = index;
            });
        }
    }

    parent(index) {
        return index % 2 == 0 ? Math.floor(index / 2) - 1 : Math.floor(index / 2);
    }

    left(index) {
        return (2 * index) + 1;
    }

    right(index) {
        return this.left(index) + 1;
    }

    buildHeap(array) {
        this.size = array.length;
        for (let i = Math.floor(array.length / 2) - 1; i > -1; i--) {
            this.heapify(i);
        }
    }

    heapify(index) {
        let smallest = index;
        let leftChild = this.left(index);
        let rightChild = this.right(index);

        if ( leftChild < this.size && this.list[leftChild] < this.list[index] ) smallest = leftChild 
        else smallest = index

        if ( rightChild < this.size && this.list[rightChild] < this.list[smallest] ) smallest = rightChild

        if ( smallest != index ) {
            let temp = this.list[index];
            this.list[index] = this.list[smallest];
            this.list[smallest] = temp;
            this.heapify(smallest);
        }
    }


    heapify(index) {
        let smallest = index;
        let leftChild = this.left(index);
        let rightChild = this.right(index);

        if ( leftChild < this.size && this.list[leftChild].distance < this.list[index].distance ) smallest = leftChild 
        else smallest = index

        if ( rightChild < this.size && this.list[rightChild].distance < this.list[smallest].distance ) smallest = rightChild

        if ( smallest != index ) {
            let temp = this.list[index];
            this.list[index] = this.list[smallest];
            this.list[smallest] = temp;

            // update the swapped node indices to the current one
            this.updateIndex(this.list[index], index, this.list[smallest], smallest);

            this.heapify(smallest);
        }
    }

    updateIndex(node1, new_index1, node2, new_index2) {
        this.node_index_store[node1.index] = new_index1;
        this.node_index_store[node2.index] = new_index2;
    }

    min() {
        return this.list[0];
    }

    extractMin() {
        if (this.size < 1) throw new Error("heap is empty");
        let min = this.list[0];
        this.list[0] = this.list[this.size - 1];
        // this.node_index_store[this.size - 1] = 0;
        this.node_index_store[this.list[0].index] = 0;
        this.size -= 1;
        this.heapify(0);
        return min;
    }

    decreaseKey(index, node) {
        index = this.node_index_store[index]; // get current position of the node in the queue
        if ( node.distance > this.list[index].distance ) return false; // new value is greater than existing value, no need to update it
        
        this.list[index].distance = node.distance;

        // attempt to maintain min-heap property

        if(this.parent(index) <= -1) { // smallest node is already at the root. Decreasing it won't violate the min-heap property
            return true;
        }

        while (index > 0 && this.list[this.parent(index)].distance > this.list[index].distance) {
            let temp = this.list[index];
            this.list[index] = this.list[this.parent(index)];
            this.list[this.parent(index)] = temp;

            // update the swapped node indices to the current one
            this.updateIndex(this.list[index], index, this.list[this.parent(index)], this.parent(index));

            index = this.parent(index);
        }
        return true;
    }

    insert(node) {
        this.list[node.index] = node;
        this.node_index_store[node.index] = node.index; // store index of node for easy retrieval
        this.size += 1;
        this.decreaseKey(node.index, node);
    }

    peek() {
        console.log("peek =>", this.list.slice(0, this.size));
    }

    showStore() {
        console.log(this.node_index_store)
    }
}

module.exports = MinHeap;

// let a = [6, 9, 11, 5, 3, 4, 2, 1];
// let h = new MinHeap();
// h.insert(0); 
// h.insert(7); 
// h.insert(8); 
// h.insert(10); 
// h.insert(12); 
// h.peek();