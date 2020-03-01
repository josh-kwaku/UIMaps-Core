const List = require('./d_linked_list').list;

/**
 * Implementation of a stack using a doubly linked list
 * both push and pop take O(1) time
 * a reference to the element at the top of the stack is kept to be able to perform the pop operation in O(1) time
 */
class Stack {
    constructor() {
        this.list = new List();
        this.top = null;
    }
    
    push(value) {
        let element = this.list.insert(value);
        this.top = element;
    }

    pop() {
        let node = this.list.delete(this.top);
        this.top = node.prev;
        return node.value;
    }

    peek() {
        return this.list.tail.value;
    }

    get size() {
        return this.list.size;
    }
}

module.exports = Stack;

// let s = new Stack();
// s.push(9);
// s.push(6);
// s.push(3);
// s.push(5);
// console.log(s.pop())
// console.log(s.pop())
// console.log(s.pop())
// console.log(s.pop())