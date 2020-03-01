const PQ = require('../data_structures/priority_queue_for_alt');

const retrieveLandmarkDistances = require('./retrieve_landmarks');

class Node {
    constructor(index, distance = 0, lowerbound = 0) {
        this.index = index;
        this.distance = distance;
        this.lowerbound = lowerbound
    }
}

let forward_discovered = [];
let backward_discovered = [];
let ForwardParent = {}
let BackwardParent = {}
let ForwardDiscovered = {};
let BackwardDiscovered = {};

let shortest_distance = Number.MAX_SAFE_INTEGER;
let eta = 0;

// delete
let forward_scanned_nodes = [];
let backward_scanned_nodes = [];

let path = []

/**
 * 
 * @param {Array} graph 
 * @param {Number} source 
 * @param {Array} edge_lengths 
 * @param {Number} target 
 * @param {Array} time 
 */
function bidirectionalDijkstra(graph, source, edge_lengths, target, time) {
    if (source === target) return 0;

    if(graph[source].length == 0  || graph[target].length == 0) {
        return 0;
    } // determining whether a path exists at all. NOT SURE THOUGH .... MAY BE WRONG. I'm assuming the graph is undirected and so any node that doesn't have any neighbors is simply useless (assigned []) as it can't be reached

    let forward_pq = new PQ();
    let backward_pq = new PQ();

    init(forward_pq, backward_pq, graph, source, target, {forward: forward_discovered, backward: backward_discovered});

    return new Promise((resolve, reject) => {
        retrieveLandmarkDistances().then(landmark_info => {
            while(forward_pq.size > 0 || backward_pq.size > 0) {
                let current_forward_node = null;
                let current_backward_node = null;
                
                // when the shortest distance covered so far is the same from the forward and backward seach, expand both searches simultaneously
                if(forward_pq.min.distance === backward_pq.min.distance) {
                    current_forward_node = forward_pq.extractMin();
                    current_backward_node = backward_pq.extractMin();
        
                    forward_discovered[current_forward_node.index] = true;
                    ForwardDiscovered[current_forward_node.index] = current_forward_node;
        
                    // the current vertex about to be scanned has a greater distance that the shortest distance so far then we have found the shortest distance
                    if (current_forward_node.distance >= shortest_distance) {
                        showResult(time)
                        return shortest_distance;
                    }
        
                    visitForwardNeighbor(graph, edge_lengths, current_forward_node, forward_pq, target, landmark_info);
    
                    forward_scanned_nodes.push(current_forward_node);
        
                    backward_discovered[current_backward_node.index] = true;
                    BackwardDiscovered[current_backward_node.index] = current_backward_node;
        
                    // the current vertex about to be scanned has a greater distance that the shortest distance so far then we have found the shortest distance
                    if (current_backward_node.distance >= shortest_distance) {
                        showResult()
                        return shortest_distance;
                    }
        
                    visitBackwardNeighbor(graph, edge_lengths, current_backward_node, backward_pq, target, landmark_info);
    
                    backward_scanned_nodes.push(current_backward_node)
        
                } else if (forward_pq.min.distance < backward_pq.min.distance) {
                    current_forward_node = forward_pq.extractMin();
        
                    // the current vertex about to be scanned has a greater distance that the shortest distance so far then we have found the shortest distance
                    if (current_forward_node.distance >= shortest_distance) {
                        showResult()
                        return shortest_distance;
                    }
        
                    forward_discovered[current_forward_node.index] = true;
                    ForwardDiscovered[current_forward_node.index] = current_forward_node;
        
                    visitForwardNeighbor(graph, edge_lengths, current_forward_node, forward_pq, target, landmark_info, time);
    
                    forward_scanned_nodes.push(current_forward_node);
        
                } else {
                    current_backward_node = backward_pq.extractMin();
        
                    // the current vertex about to be scanned has a greater distance that the shortest distance so far then we have found the shortest distance
                    if (current_backward_node.distance >= shortest_distance) {
                        showResult()
                        return shortest_distance;
                    }
        
                    backward_discovered[current_backward_node.index] = true;
                    BackwardDiscovered[current_backward_node.index] = current_backward_node;
        
                    visitBackwardNeighbor(graph, edge_lengths, current_backward_node, backward_pq, target, landmark_info, time);
    
                    backward_scanned_nodes.push(current_backward_node)
        
                }
        
            }
        }).then(distance => {
            resolve({
                path,
                distance,
                eta
            });
        })
    });
}


/**
 * 
 * @param {Object} time - hold the time taken for each edge connection 
 */
function showResult(time) {
    let node = forward_scanned_nodes.pop()
    constructForwardPath(node.index, shortest_distance, time)
    console.log(node);
    path.push(node);
    constructBackwardPath(node.index, shortest_distance, time)
}


/**
 * explores the neighbors of the current node with min distance from the source. The shortest path distance could be found during this exploration
 * @param {Array} graph 
 * @param {Array} edge_lengths 
 * @param {*} current_forward_node 
 * @param {PQ} forward_pq 
 * @param {PQ} backward_pq 
 */
function visitForwardNeighbor(graph, edge_lengths, current_forward_node, forward_pq, target, landmark_info, time) {
    // console.log("got here");
    for (let i = 0; i < graph[current_forward_node.index].length; i++) {
        let neighbor = graph[current_forward_node.index][i];

        if (forward_discovered[neighbor] === false) {
            let lowerbound = heuristicFunction(landmark_info, neighbor, target);

            let tentative_shorter_distance = edge_lengths[current_forward_node.index][i] + current_forward_node.distance;
                    
            let neighbor_object = new Node(neighbor, tentative_shorter_distance, lowerbound + tentative_shorter_distance);

            let distance_is_updated = forward_pq.decreaseKey(neighbor, neighbor_object);
            
            // record (u,v) edge for which the d(neighbor) is minimized
            if(distance_is_updated) {
                ForwardParent[neighbor] = current_forward_node;
                ForwardDiscovered[neighbor] = new Node(neighbor, tentative_shorter_distance, lowerbound + tentative_shorter_distance)
            }

            /**
             * Once a node w that has been scanned by the backward node before is being examined, check if the sum of the shortest distance from the source to w and from w to the target is less than the current shortest distance. update accordingly
             */
            if (backward_discovered[neighbor] === true) {
                if (ForwardDiscovered[neighbor].distance + BackwardDiscovered[neighbor].distance <= shortest_distance) {
                    shortest_distance = ForwardDiscovered[neighbor].distance + BackwardDiscovered[neighbor].distance;
                }
            }
        }
    }
}

/**
 * explores the neighbors of the current node with min distance from the target. The shortest path distance could be found during this exploration
 * @param {Array} graph 
 * @param {Array} edge_lengths 
 * @param {*} current_backward_node 
 * @param {PQ} forward_pq 
 * @param {PQ} backward_pq 
 */
function visitBackwardNeighbor(graph, edge_lengths, current_backward_node, backward_pq, target, landmark_info, time) {

    for (let i = 0; i < graph[current_backward_node.index].length; i++) {
        let neighbor = graph[current_backward_node.index][i];

        if (backward_discovered[neighbor] === false) {
            let lowerbound = heuristicFunction(landmark_info, neighbor, target);

            let tentative_shorter_distance = edge_lengths[current_backward_node.index][i] + current_backward_node.distance;
                    
            let neighbor_object = new Node(neighbor, tentative_shorter_distance, lowerbound + tentative_shorter_distance);

            let distance_is_updated = backward_pq.decreaseKey(neighbor, neighbor_object);
            
            // record (u,v) edge for which the d(neighbor) is minimized
            if(distance_is_updated) {
                BackwardParent[neighbor] = current_backward_node;
                BackwardDiscovered[neighbor] = new Node(neighbor, tentative_shorter_distance, lowerbound + tentative_shorter_distance);
            } 
            
            /**
             * Once a node w that has been scanned by the forward node before is being examined, check if the sum of the shortest distance from the source to w and from w to the target is less than the current shortest distance. update accordingly
             */
            if (forward_discovered[neighbor] === true) {
                if (BackwardDiscovered[neighbor].distance + ForwardDiscovered[neighbor].distance <= shortest_distance) {
                    shortest_distance = BackwardDiscovered[neighbor].distance + ForwardDiscovered[neighbor].distance;
                }
                
            }
        }
    }    
}


function buildNeighbor(node_index, distance, calculated_distance) {
    return {
        index: node_index,
        distance: distance + calculated_distance
    }
}


/**
 * 
 * @param {PQ} forward_pq 
 * @param {PQ} backward_pq 
 * @param {Array} graph 
 * @param {Number} source 
 * @param {Number} target 
 * @param {Object} explored
 */
function init(forward_pq, backward_pq, graph, source, target, explored) {
    shortest_distance = Number.MAX_SAFE_INTEGER;
    scanned_nodes = [];
    eta = 0;
    path = []

    ForwardParent[source] = null;
    BackwardParent[target] = null;
    forward_discovered[source] = true;
    ForwardDiscovered[source] = new Node(source);
    backward_discovered[target] = true;
    BackwardDiscovered[target] = new Node(target);

    fillQueue(forward_pq, graph, source, explored.forward);
    fillQueue(backward_pq, graph, target, explored.backward);
    // console.log(explored.backward);
}

/**
 * 
 * @param {PQ} queue 
 * @param {Array} graph 
 * @param {Number} start 
 */
function fillQueue(queue, graph, start, explored) {
    for (let i = 0; i < graph.length; i++) {
        explored[i] = false;
        if(i != start) {
            queue.insert(new Node(i, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER));
        } else queue.insert(new Node(i));
    }
}

let LowerboundCache = {}

function heuristicFunction(landmark_info, neighbor, target) {
    if(LowerboundCache[neighbor] !== undefined) return LowerboundCache[neighbor];
    let lowerbound = 0;
    for (const landmark of landmark_info.landmarks) {
        let t = Number(landmark_info.distance_from_landmark[landmark][target]);
        let u = Number(landmark_info.distance_from_landmark[landmark][neighbor]);
        lowerbound = Math.max(lowerbound, Math.abs(t - u))
    }
    LowerboundCache[neighbor] = lowerbound;
    return lowerbound;
}

function printPath(node, target, shortest_distance) {
    constructForwardPath(node, shortest_distance);
    constructBackwardPath(node, shortest_distance);
    console.log(new Node(target, shortest_distance, 0));
}

function constructForwardPath(node, shortest_distance, time) {
    // console.log(node, ForwardParent, time);
    if (node == null || ForwardParent[node] == null) return
    else {
        let parent = ForwardParent[node].index;
        constructForwardPath(parent, shortest_distance, time);
        path.push(ForwardParent[node]);
        console.log(ForwardParent[node])
        // console.log("ttt => ", ForwardParent[node], time[ForwardParent[node].index])
        eta += Number(time[ForwardParent[node].index][node]);
    }
}

function constructBackwardPath(node, shortest_distance, time) {
    if (node == null || BackwardParent[node] == null) return
    else {
        path.push(BackwardParent[node]);
        console.log(BackwardParent[node])
        eta += Number(time[BackwardParent[node].index][node]);
        let parent = BackwardParent[node].index;
        constructBackwardPath(parent, shortest_distance, time);
    }
}
module.exports = bidirectionalDijkstra;