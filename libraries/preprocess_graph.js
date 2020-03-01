const shortestPath = require('./dijkstra_shortest_path');
const RedBlackTree = require('../data_structures/red_black_tree_landmark');
const Stack = require('../data_structures/stack');

const saveLandmarkInfo = require('./save_landmarks');

let set_of_landmarks = new Set();

function randomVertex(graph) {
    let v = Math.floor(Math.random() * graph.length);
    while(graph[v].length <= 0) {
        v =  Math.floor(Math.random() * graph.length);
    }
    
    return v;
}

function print(text) {
    console.log(text);
}

/**
 * represents the vertex with the max size so far
 */
let max_size_vertex = {
    vertex: null,
    size: 0
}

let ShortestPathCache = {

}

function init() {
    max_size_vertex = {
        vertex: null,
        size: 0,
    }
}

/**
 * 
 * @param {Array} graph 
 * @param {Array} edge_lengths 
 */
function generateLandmarks(graph, edge_lengths) {
    while(set_of_landmarks.size < 3) {
        // first pick a random start vertex
        // let v = 0;
        let v = randomVertex(graph);
        init();

        // compute shortest path tree rooted at v
        let tree = shortestPathTree(v, graph, edge_lengths);
        
        calculateVertexWeight(tree.rootNode, graph, edge_lengths);
        
        computeVertexSize(tree, tree.rootNode);
    
        getLandmarkFromTree(max_size_vertex.vertex);
    }
   
    computeDistanceFromLandmark(set_of_landmarks, graph, edge_lengths);
    
    saveLandmarkInfo(LandmarkDistances);
    print("Preprocessing complete");
    
    // return {
    //     landmarks: set_of_landmarks,
    //     distance_to_landmark: LandmarkDistances.to,
    //     distance_from_landmark: LandmarkDistances.from,
    // };
}

function shortestPathTree(vertex, graph, edge_lengths) {
    print("computing shortest path tree");
    let shortest_path_lengths = shortestPath(graph, vertex, edge_lengths);

    let tree = new RedBlackTree();
    tree.add(vertex, {distance: 0, weight: 0, size: 0});
    for (let i = 0; i < shortest_path_lengths.length; i++) {
        if (i === vertex) continue; // don't add the root of the tree to the tree anymore.
        let shortest_path_length = shortest_path_lengths[i];

        if (shortest_path_length == Number.MAX_SAFE_INTEGER) continue; // don't add unreachable nodes to the tree;

        tree.add(i, {distance: shortest_path_length, weight: 0, size: 0});
        // tree.add(i, shortest_path_length, 0, 0);
    }
    print("shortest path tree computed");
    return tree;
}

// let rootNode;

/**
 * calculates the vertex weight of each vertex: difference between dist(r, v)
and the lower bound for dist(r, v) given by S.
 * @param {*} rootNode 
 * @param {*} graph 
 * @param {*} edge_lengths 
 */
function calculateVertexWeight(node, graph, edge_lengths) {  
    print("computing vertex weight");
    let max = 0;
    let rootNode = node;
    let shortest_paths = [];

    let Cache = {}
    let stack = new Stack();
    stack.push(node.value);
    Cache[node.value] = node;

    while(stack.size > 0) {
        let popped_node = stack.pop();
        if (Cache[popped_node] !== null) {
            if (set_of_landmarks.size == 0) {
                Cache[popped_node].weight = Cache[popped_node].distance;
            } else {
                // compute lower bound distance from the root vertex v to arbitrary vertex w using the landmarks in set S
                for (const landmark of set_of_landmarks) {
                    // check if shortest path for landmark has been calculated already;
                    if (ShortestPathCache[landmark] !== undefined) {
                        shortest_paths = ShortestPathCache[landmark]
                    } else {
                        shortest_paths = shortestPath(graph, landmark, edge_lengths);
                        ShortestPathCache[landmark] = shortest_paths;
                    } 

                    max = Math.max(max, Math.abs(shortest_paths[rootNode.value] - shortest_paths[Cache[popped_node].value]))
                }
                Cache[popped_node].weight = Cache[popped_node].distance - max;
            }

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
    print("vertex weight computed");
}
/**
 * Computes the size of all vertices in the shortest path tree of the chosen r (root vertex).
 * The size s(v) of a vertex depends on Tv, the subtree of Tr rooted at v.
 * If Tv contains a landmark, s(v) = 0; otherwise, s(v) is the sum of the weights of all vertices in Tv.
 * @param {BST} tree 
 * @param {*} root
 * @param {Array} graph
 * @param {Array} edge_lengths
 */
function computeVertexSize(tree, node) {
    print("computing vertex size");
    let already_explored_nodes = [];
    let Parent = {};

    let Cache = {}
    let stack = new Stack();
    stack.push(node.value);
    Cache[node.value] = node;
    Parent[node.value] = null;

    while(stack.size > 0) {
        let popped_node = stack.pop();
        if (Cache[popped_node] !== null) {

            // see if it has a landmark in its subtree
            if(set_of_landmarks.size === 0) Cache[popped_node].size = Cache[popped_node].weight;

            for (let landmark of set_of_landmarks) {
                if (tree.search(Cache[popped_node], landmark) !== null) {
                    Cache[popped_node].size = 0;
                    break;
                }
                Cache[popped_node].size = Cache[popped_node].weight;
            }
            
            let checking_node = Cache[popped_node];
            if(already_explored_nodes.length > 0) {
                for (let i = already_explored_nodes.length - 1; i > 0; i--) {
                    if(checking_node.size === 0) break;
                    if (Parent[checking_node.value].value === already_explored_nodes[i].value) {
                        already_explored_nodes[i].size += Cache[popped_node].size;
                        // console.log("checkpoint => ",already_explored_nodes[i]);
                        if(max_size_vertex.vertex == null) {
                            max_size_vertex.vertex = Cache[popped_node];
                            max_size_vertex.size = Cache[popped_node].size;
                        }

                        if(already_explored_nodes[i].size > max_size_vertex.size) {
                            max_size_vertex.size = already_explored_nodes[i].size;
                            max_size_vertex.vertex = already_explored_nodes[i];
                        }
    
                        checking_node = already_explored_nodes[i];
                    }
                }
            }

            already_explored_nodes.push(Cache[popped_node]);

            if (Cache[popped_node].rightChild !== null) {
                stack.push(Cache[popped_node].rightChild.value);
                Cache[Cache[popped_node].rightChild.value] = Cache[popped_node].rightChild;
                Parent[Cache[popped_node].rightChild.value] = Cache[popped_node];
            }

            if (Cache[popped_node].leftChild !== null) {
                stack.push(Cache[popped_node].leftChild.value);
                Cache[Cache[popped_node].leftChild.value] = Cache[popped_node].leftChild;
                Parent[Cache[popped_node].leftChild.value] = Cache[popped_node];
            }
        }
    }
    print("vertex size computed")
}


/**
 * Traverses the tree Tw whose root is the vertex w with maximum size
 * starting from w and always following the child with the largest size, until a leaf is reached. Make this leaf a new landmark.
 * @param {*} root 
 */
function getLandmarkFromTree(node) {
    print("generating landmarks")
    // console.log("gen", node);
    let Cache = {}
    let stack = new Stack();
    stack.push(node.value);
    Cache[node.value] = node;

    while(stack.size > 0) {
        let popped_node = stack.pop();
        if (Cache[popped_node] !== null) {
            // console.log(Cache[popped_node]);
            let leftChild = Cache[popped_node].leftChild
            let rightChild = Cache[popped_node].rightChild
            // check if leaf has been encountered. If a leaf has been encountered. A new landmark has been found. Thus add it to the set of landmarks
            if (leftChild == null && rightChild == null) {
                set_of_landmarks.add(Cache[popped_node].value);
                return;
            }

            if (leftChild == null) {
                stack.push(rightChild.value);
                Cache[rightChild.value] = rightChild;
            } else if (rightChild == null) {
                stack.push(leftChild.value);
                Cache[leftChild.value] = leftChild;
            } else {
                if (leftChild.size >= rightChild.size) {
                    stack.push(leftChild.value);
                    Cache[leftChild.value] = leftChild;
                }
                else {
                    stack.push(rightChild.value);
                    Cache[rightChild.value] = rightChild;
                }
            }
        }
    }
    print("landmarks computed")
}


let LandmarkDistances = {
    from: {},
    to: {}
}

/**
 * 
 * @param {Set} set_of_landmarks 
 */
function computeDistanceFromLandmark(set_of_landmarks, graph, edge_lengths) {
    print("computing distance from landmarks")
    for (const landmark of set_of_landmarks) {
        LandmarkDistances.from[landmark] = shortestPath(graph, landmark, edge_lengths);
    }
    print("distance from landmarks computed")
}

/**
 * 
 * @param {Set} set_of_landmarks 
 */
function computeDistanceToLandmark(set_of_landmarks, graph, edge_lengths) {
    print("computing distance to landmarks")
    let distances = {};
    graph.forEach((_, index) => {
        distances[index] = {};
        for (const landmark of set_of_landmarks) {
            distances[index][landmark] = shortestPathWithTarget(graph, index, edge_lengths, landmark);
        }
    });
    LandmarkDistances.to = distances;
    print("distance to landmarks computed")
}

module.exports = generateLandmarks;