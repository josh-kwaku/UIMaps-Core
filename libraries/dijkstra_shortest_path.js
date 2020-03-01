const PriorityQueue = require('../data_structures/priority_queue_for_dijkstra');

let Parent = {}

let scanned_nodes = [];

function shortestPath(graph, source, edge_lengths, target) {
    // console.log(graph, edge_lengths);
    // if(graph[source].length == 0  || graph[target].length == 0) return null; // determining whether a path exists at all. NOT SURE THOUGH .... MAY BE WRONG. I'm assuming the graph is undirected and so any node that doesn't have any neighbors is simply useless (assigned []) as it can't be reached

    const pq = new PriorityQueue();
    let discovered = [];
    let distances = [];
    let paths = [];

    // initialization
    Parent[source] = null;
    for (let i = 0; i < graph.length; i++) {
        discovered[i] = false;
        paths[i] = [];
        if(i != source) {
            pq.insert({index: i, distance: Number.MAX_SAFE_INTEGER});
        } else pq.insert({index: i, distance: 0});
    }
    discovered[source] = true;
    
    while(pq.size > 0) {
        let current_node = pq.extractMin();
        scanned_nodes.push(current_node);
        /**
         * stop dijkstra search once target node is selected for exploration
         * guarentee: Dijkstra's algo never alters the length of a node popped off the queue, hence the guarantee that the distance so far is the shortest there can be
         */
        if(current_node.index === target){
            printPath(target, current_node.distance); // UNCOMMENT HERE
            return current_node.distance == Number.MAX_SAFE_INTEGER ? null : current_node.distance;
        }
        
        distances[current_node.index] = current_node.distance;
        discovered[current_node.index] = true;

        // NB: graph[current_node.index][i] represents the neighbor of the node currently being explored
        for (let i = 0; i < graph[current_node.index].length; i++) {
            let neighbor = graph[current_node.index][i];
    
            if (discovered[neighbor] === false) {
                let neighbor_object = buildNeighbor(neighbor, edge_lengths[current_node.index][i], current_node.distance);
                let distance_is_updated = pq.decreaseKey(neighbor, neighbor_object);
                // console.log("list size=>", pq.heap.size)
                // console.log("list=>", pq.heap.list)
                // record (u,v) edge for which the d(neighbor) is minimized
                if(distance_is_updated) Parent[neighbor] = current_node;   
            }
        }
    }
    return distances;
}

function convertNonExistenPathToZero(shortest_path_distances) {
    shortest_path_distances.forEach((distance, index) => {
        if(distance == Number.MAX_SAFE_INTEGER) shortest_path_distances[index] = 0;
    });
    return shortest_path_distances;
}

function buildNeighbor(node_index, distance, calculated_distance) {
    return {
        index: node_index,
        distance: distance + calculated_distance
    }
}

function printPath(target, shortest_distance) {
    constructPath(target, shortest_distance);
    console.log({index: target, distance: shortest_distance})
}

function constructPath(target, shortest_distance) {
    if (target == null || Parent[target] == null) return
    else {
        let parent = Parent[target].index;
        constructPath(parent, shortest_distance);
        console.log(Parent[target]);
    }
}

module.exports = shortestPath;