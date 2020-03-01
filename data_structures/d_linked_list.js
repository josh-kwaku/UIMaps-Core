const Item = {
    value: null,
    next: null,
    prev:null,
}

class DList {
    constructor() {
        this.head = null;
        this.tail = null;
    }

    insert(key){
        const node = Object.assign({}, Item);
        node.value = key;
        if(this.head == null) { // list is empty
            this.head = node;
            this.tail = node;
        } else {
            node.prev = this.tail;
            this.tail.next = node;
            this.tail = node;
        }
        return node;
    }

    deleteNode(node) {
        if(node == this.head && node == this.tail) {
            this.head = null;
            this.tail = null;
        } else if(node == this.head) {
            this.head = this.head.next;
            this.head.prev = null;
        } else if(node == this.tail) {
            this.tail = this.tail.prev;
            this.tail.next = null;
        } else {
            node.prev.next = node.next;
            node.next.prev = node.prev;
        }
        return node;
    }

    delete(element) { 
        if(this.isNode(element)) {
            return this.deleteNode(element);
        } else {
            let node = this.search(element);
            return node === null ? null : this.deleteNode(node);
        }
    }

    search(key) {
        if(key === null) return null;
        let node = this.head;
        while (node != null) {
            if(node.value == key) return node;
            node = node.next;
        }
        return null;
    }

    get size() {
        let count = 0;
        let node = this.head;
        while (node != null) {
            count++;
            node = node.next;
        }
        return count;
    }

    isNode(value) {
        var type = typeof value;
        return type === 'function' || type === 'object' && !!value;
    }

    print() {
        let node = this.head;
        while (node != null) {
            console.log(node);
            node = node.next
        }
    }
}

module.exports = {
    item: Item,
    list: DList
};


// let list = new DList();
// list.insert(9);
// list.insert(8);
// list.insert(7);
// list.insert(6);
// list.insert(5);
// list.delete(5);
// list.delete(9);
// list.insert(10);
// list.insert(11);
// list.delete(7);
// list.delete(11);
// list.delete(list.search(7));
// list.insert(13);
// list.insert(14);
// list.insert(7);
// list.insert(6);
// list.insert(15);
// list.print();