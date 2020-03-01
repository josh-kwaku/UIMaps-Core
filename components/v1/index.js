const express = require('express');
const router = express.Router();
const Datastore = require('../../libraries/redis');
let datastore = new Datastore();
datastore = datastore.connect();

const search = require('./search');


const csv_read = require('../../libraries/csv_reader');

const landmark_generator = require('../../libraries/preprocess_graph');

// preprocess_graph();

function saveGraphData(graph, edge_lengths, time, coords, images, names) {
    datastore.hmset('road_network_data', {
        graph: JSON.stringify(graph),
        edge_lengths: JSON.stringify(edge_lengths),
        time: JSON.stringify(time),
        coords: JSON.stringify(coords),
        images: JSON.stringify(images),
        names: JSON.stringify(names),
    });
}

function preprocess_graph() {
    csv_read().then(result => {
        saveGraphData(result.graph, result.edge_lengths, result.time, result.coords, result.images, result.names);
        landmark_generator(result.graph, result.edge_lengths); // generates landmarks and saves them in redis
    });
}

router.use('/search', search);

module.exports = router;
