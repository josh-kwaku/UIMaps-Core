const bidirectional_alt = require('../../../libraries/bidirectional_alt');
const Datastore = require('../../../libraries/redis');
let datastore = new Datastore();
datastore = datastore.connect();

class SearchService {
    constructor () {}

    getShortestPath(payload) {
        console.log(payload);
        return new Promise((resolve, reject) => {
            SearchService.getRoadNetworkData().then((result) => {
                if (result == null) reject("Error fetching road network");
                let road_graph = JSON.parse(result.graph);
                let road_edgelengths = JSON.parse(result.edge_lengths);
                let road_time = JSON.parse(result.time);
                let coords = JSON.parse(result.coords);
                let images = JSON.parse(result.images);
                let names = JSON.parse(result.names);
                SearchService.shortestPath(road_graph, road_edgelengths, payload, road_time).then(result => {
                    result["coords"] = coords;
                    result["images"] = images;
                    result["names"] = names;
                    resolve(result);
                }).catch(error => {
                    reject(error);
                })
            }).catch(error => {
                reject(error);
            })
        })
    }

    /**
     * 
     * @param {Array} graph 
     * @param {Array} edge_lengths 
     * @param {Object} payload - source, destination
     */
    static shortestPath(graph, edge_lengths, payload, time) {
        return new Promise((resolve, reject) => {
            bidirectional_alt(graph, payload.source, edge_lengths, payload.destination, time).then(result => {
                resolve(result);
            }).catch(error => {
                reject(error.message);
            })
        })
    }

    static getRoadNetworkData() {
        return new Promise((resolve, reject) => {
            datastore.hgetall('road_network_data', (err, result) => {
                if (err) reject(err);
                resolve(result);
            })
        })
    }

    static getLocationNode(name) {
        const session = dbDriver.session();
        return new Promise((resolve, reject) => {
            const readTx = session.readTransaction((tx) => {
                
            })
        })
    }
}

module.exports = SearchService;
