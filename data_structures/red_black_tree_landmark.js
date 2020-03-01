// if parent is null, node is the root node
// if left_child is null, node has no children and is hence a leaf
const Stack = require('./stack');
class Node {
    constructor(value, distance = 0, weight = 0, size = 0, left = null, right = null, parent=null) {
        this.value = value;
        this.distance = distance;
        this.weight = weight;
        this.size = size;
        this.leftChild = left;
        this.rightChild = right;
        this.parent = parent;
        this.isLeftChild = false; // we dnt know if it's a left or right child;
        this.isBlack = false; // since new node additions are by default red
        this.lowerBoundDistance = 0;
    }
}

class RedBlackTree {
    constructor() {
        this.size = 0;
        this.root = null;
    }

    /**
     * 
     * @param {Number} value 
     * @param {{distance: 0, size: 0, weight: 0}} node_property 
     */
    add(value, node_property) {
        let node = new Node(value, node_property.distance, node_property.weight, node_property.size);
        if (this.root == null) {
            this.root = node;
            this.root.isBlack = true;
            this.size++;
            return;
        } else {
            this.size++;
            this._add(this.root, node);
            // console.log("after adding => ", node.value);
            this.checkColor(node);
            return;
        }
    }

    /**
     * 
     * @param {Node} parent 
     * @param {Node} new_node 
     * @param {{distance: 0, size: 0, weight: 0}} node_property 
     */
    _add(parent, new_node) {
        while (true) {
            if (new_node.distance > parent.distance) { // add node to right
                if (parent.rightChild == null) {
                    parent.rightChild = new_node;
                    new_node.parent = parent;
                    new_node.isLeftChild = false;
                    return;
                } 
                parent = parent.rightChild
            } 
        
            if (parent.leftChild == null) {
                parent.leftChild = new_node;
                new_node.parent = parent;
                new_node.isLeftChild = true;
                return;
            }
            parent = parent.leftChild
        }
    }

    /**
     * 
     * @param {Node} node 
     */
    checkColor(node) {
        if (node === null || (node.value === this.root.value)) return; // we are at the root
        
        // check for two consecutive reds
        // console.log(node.value, node.isBlack, node.parent.value, node.parent.isBlack);
        if(!node.isBlack && !node.parent.isBlack) {
            this.correctTree(node);
        } else return; 

        this.root.isBlack = true;
        this.checkColor(node.parent);
    }

    /**
     * 
     * @param {Node} node 
     * NB: null nodes are black
     */
    correctTree(node) {
        if (node.parent.isLeftChild) {
            // aunt is node.parent.parent.right
            let grandparent = node.parent.parent;
            let aunt = grandparent.rightChild;
            if(aunt == null || aunt.isBlack) { 
                // aunt is black; do rotation
                return this.rotate(node);
            }
            // else aunt is red; do color flip.
            // set aunt to black
            // set parent to black
            // set grandparent to red
            if(aunt !== null) {
                aunt.isBlack = true;
            }
            node.parent.isBlack = true;
            grandparent.isBlack = false;
            return;
        }

        // aunt is node.parent.parent.left
        // console.log("gp => ", node.value, node.parent.value);
        let grandparent = node.parent.parent;
        let aunt = grandparent.leftChild;
        if(aunt == null || aunt.isBlack) {
            // aunt is black; do rotation
            return this.rotate(node);
        }
        // else aunt is red; do color flip.
        // set aunt to black
        // set parent to black
        // set grandparent to red
        if(aunt !== null) {
            aunt.isBlack = true;
        }
        node.parent.isBlack = true;
        grandparent.isBlack = false;
        return;
    }

    /**
     * 
     * @param {Node} node 
     * when violations occur, we manipulate the node's grandparent
     */
    rotate(node) {
        // case 1: both the node and it's parent are left children
        if (node.isLeftChild) {
            if (node.parent.isLeftChild) { //right rotation
                this.rightRotate(node.parent.parent) // when violations occur, we manipulate the node's grandparent
                // correct colors after rotation
                node.isBlack = false; // node is red
                node.parent.isBlack = true; // node's parent is black
                if(node.parent.rightChild !== null) node.parent.rightChild.isBlack = false; // node's sibling is red
                return;
            } 
            this.rightLeftRotate(node.parent.parent); 
            // after a rightLeft rotate, the node with the issue becomes the new parent
            node.isBlack = true;
            node.rightChild.isBlack = false;
            node.leftChild.isBlack = false; 
            return;
        }
        // case 2: node is rightChild 
        if (node.parent.isLeftChild) { //leftRight rotation
            this.leftRightRotate(node.parent.parent) // when violations occur, we manipulate the node's grandparent
            // correct colors after rotation
            // after a leftRight rotate, the node with the issue becomes the new parent
            node.isBlack = true;
            node.rightChild.isBlack = false;
            node.leftChild.isBlack = false; 
            return;
        } 

        this.leftRotate(node.parent.parent);
        // correct colors after rotation
        node.isBlack = false; // node is black
        node.parent.isBlack = true; // node's parent is red
        if(node.parent.leftChild !== null) node.parent.leftChild.isBlack = false; // node's sibling is red
        return;
    }

    /**
     * Performs a left rotation. Making grandparent.child the new grandparent
     * @param {Node} node - grandparent of a node
     */
    leftRotate(node) {
        let temp = node.rightChild; 
        node.rightChild = temp.leftChild;
        if(node.rightChild !== null) {
            node.rightChild.parent = node;
            node.rightChild.isLeftChild = false;
        }
        if(node.parent == null) { // root node;
            this.root = temp;
            temp.parent = null;
        } else {
            temp.parent = node.parent; 
            if(node.isLeftChild) {
                temp.isLeftChild = true;
                temp.parent.leftChild = temp;
            } else {
                temp.isLeftChild = false;
                temp.parent.rightChild = temp;
            }
        }
        temp.leftChild = node;
        node.isLeftChild = true;
        node.parent = temp;
    }

    /**
     * Performs a right rotation. Making grandparent.child the new grandparent
     * @param {Node} node  - grandparent of a node
     *
     */
    rightRotate(node) {
        let temp = node.leftChild; 
        node.leftChild = temp.rightChild;
        if(node.leftChild !== null) {
            node.leftChild.parent = node;
            node.leftChild.isLeftChild = true;
        }
        if(node.parent == null) { // root node;
            this.root = temp;
            temp.parent = null;
        } else {
            temp.parent = node.parent; 
            if(node.isLeftChild) {
                temp.isLeftChild = true;
                temp.parent.leftChild = temp;
            } else {
                temp.isLeftChild = false;
                temp.parent.rightChild = temp;
            }
        }
        temp.rightChild = node;
        node.isLeftChild = false;
        node.parent = temp;
    }

    /**
     * performs a left right rotation
     * Step 1: perform a leftRotate on the node's (grandparent) left child (i.e the parent of the problematic node)
     * Step 2: perform a rightRotate on the node (grandparent)
     * @param {Node} node 
     */
    leftRightRotate(node) {
        this.leftRotate(node.leftChild);
        this.rightRotate(node);
    }

    /**
     * performs a right left rotation
     * Step 1: perform a rightRotate on the node's (grandparent) right child (i.e the parent of the problematic node)
     * Step 2: perform a leftRotate on the node (grandparent)
     * @param {Node} node 
     */
    rightLeftRotate(node) {
        this.rightRotate(node.rightChild);
        this.leftRotate(node);
    }


    height(node) {
        let left_count, right_count = 0;
        let Cache = {}
        let stack = new Stack();
        stack.push(node.value);
        Cache[node.value] = node;
        while(stack.size > 0) {
            let popped_node = stack.pop();
            if (Cache[popped_node] !== null) {
                if (Cache[popped_node].rightChild !== null) {
                    right_count++
                    stack.push(Cache[popped_node].rightChild.value);
                    Cache[Cache[popped_node].rightChild.value] = Cache[popped_node].rightChild;
                }

                if (Cache[popped_node].leftChild !== null) {
                    left_count++
                    stack.push(Cache[popped_node].leftChild.value);
                    Cache[Cache[popped_node].leftChild.value] = Cache[popped_node].leftChild;
                }

            }
        }

        return left_count > right_count ? left_count : right_count;
        // if (this.root === null) return 0
        // return this._height(this.root) - 1;
    }

    /**
     * calculate the height of the tree
     * @param {Node} node - root
     * height is the number of edges not the number of nodes
     */
    _height(node) {
        if (node === null) return 0;
        let leftHeight = this._height(node.leftChild) + 1;
        let rightHeight = this._height(node.rightChild) + 1;

        if(leftHeight > rightHeight) return leftHeight;
        return rightHeight;
    }

    /**
     * 
     * @param {Node} node - root
     */
    blackNodes(node) {
        if (node == null) return 1;
        let rightBlackNodes = this.blackNodes(node.rightChild);
        let leftBlackNodes = this.blackNodes(node.leftChild);
        if(rightBlackNodes != leftBlackNodes) {
            // throw error or fix tree
            console.log(rightBlackNodes, leftBlackNodes, node);
            throw new Error("invalid no of black nodes")
        }
        if(node.isBlack) leftBlackNodes++;
        return leftBlackNodes;
    }

    search(node, value) {
        let Cache = {}
        let stack = new Stack();
        stack.push(node.value);
        Cache[node.value] = node;
        while(stack.size > 0) {
            let popped_node = stack.pop();
            if (Cache[popped_node] == null || Cache[popped_node].value == value) {
                return Cache[popped_node]  
            } 

            if (value < Cache[popped_node].value) {
                if (Cache[popped_node].leftChild !== null) {
                    stack.push(Cache[popped_node].leftChild.value);
                    Cache[Cache[popped_node].leftChild.value] = Cache[popped_node].leftChild;
                }
            } else {
                if (Cache[popped_node].rightChild !== null) {
                    stack.push(Cache[popped_node].rightChild.value);
                    Cache[Cache[popped_node].rightChild.value] = Cache[popped_node].rightChild;
                }
            }
        }
        return null;
        // if (rootNode === null || rootNode.value == key) return rootNode;
        // if (key < rootNode.value) return this.search(rootNode.left, key);
        // else return this.search(rootNode.right, key);
    }

    searchAndSum(node, value) {
        let Cache = {}
        let stack = new Stack();
        stack.push(node.value);
        Cache[node.value] = node;
        while(stack.size > 0) {
            let popped_node = stack.pop();
            if (Cache[popped_node] == null || Cache[popped_node].value == value) {
                return Cache[popped_node]  
            } 

            if (value < Cache[popped_node].value) {
                if (Cache[popped_node].leftChild !== null) {
                    stack.push(Cache[popped_node].leftChild.value);
                    Cache[Cache[popped_node].leftChild.value] = Cache[popped_node].leftChild;
                }
            } else {
                if (Cache[popped_node].rightChild !== null) {
                    stack.push(Cache[popped_node].rightChild.value);
                    Cache[Cache[popped_node].rightChild.value] = Cache[popped_node].rightChild;
                }
            }
        }
        return null;
        // if (rootNode === null || rootNode.value == key) return rootNode;
        // if (key < rootNode.value) return this.search(rootNode.left, key);
        // else return this.search(rootNode.right, key);
    }

    /**
     * 
     * @param {Node} node 
     */
    print(node) {
        let Cache = {}
        let stack = new Stack();
        stack.push(node.value);
        Cache[node.value] = node;
        while(stack.size > 0) {
            let popped_node = stack.pop();
            if (Cache[popped_node] !== null) {
                console.log(Cache[popped_node].value, Cache[popped_node].distance, Cache[popped_node].weight, Cache[popped_node].size);

                if (Cache[popped_node].rightChild !== null) {
                    stack.push(Cache[popped_node].rightChild.value);
                    Cache[Cache[popped_node].rightChild.value] = Cache[popped_node].rightChild;
                }

                if (Cache[popped_node].leftChild !== null) {
                    stack.push(Cache[popped_node].leftChild.value);
                    Cache[Cache[popped_node].leftChild.value] = Cache[popped_node].leftChild;
                }

            }
        }
        // if (node !== null) {
        //     console.log(node);
        //     this.print(node.leftChild)
        //     this.print(node.rightChild);
        // }
    }

    get rootNode() {
        return this.root;
    }
}

module.exports = RedBlackTree;