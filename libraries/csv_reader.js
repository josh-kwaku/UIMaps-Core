const csv = require('csv-parser');
const fs = require('fs')
// const road_network = require('../road_network/Ui_Edgelist.csv');
console.log(process.cwd())
let graph = [];
let edge_lengths = [];
let estimated_time = {};
let coords = {};
let node_name = {};
let node_image = {};

class RoadData {
    constructor(data) {
        this.XCoord = data.XCoord;
        this.YCoord = data.YCoord;
        this.START_NODE = data.START_NODE;
        this.END_NODE = data.END_NODE;
        this.EDGE = data.EDGE;
        this.LENGTH = Math.round(data.LENGTH);
        this.TIME = data.TIME;
        this.IMAGE = data.IMAGE;
        this.NAME = data.NAME + " (" + data.LOCAL_NAME + ")";
    }
}

function read() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(process.cwd() + '/Unibadan_Edgelist.csv')
        .pipe(csv())
        .on('data', (data) => {
            let row = new RoadData(data);
            let start_node = row.START_NODE;

            if (coords[start_node] === undefined) coords[start_node] = {lat: row.XCoord, lon: row.YCoord}

            if (node_image[start_node] === undefined) node_image[start_node] = row.IMAGE;

            if (node_name[start_node] === undefined) node_name[start_node] = row.NAME;
            
            let end_node = row.END_NODE;
            let length = row.LENGTH;
            let time = row.TIME;

            if(graph[start_node] == undefined) {
                graph[start_node] = [];
            }
            if(edge_lengths[start_node] == undefined) {
                edge_lengths[start_node] = [];
            }

            if(estimated_time[start_node] == undefined) {
                estimated_time[start_node] = {};
            }
            
            graph[start_node].push(end_node);
            edge_lengths[start_node].push(length);
            estimated_time[start_node][end_node] = time;
        })
        .on('end', () => {
            for (let i = 0; i < graph.length; i++) {
                if(graph[i] == undefined) graph[i] = [];
            }
            for (let i = 0; i < edge_lengths.length; i++) {
                if(edge_lengths[i] == undefined) edge_lengths[i] = [];
            }
            for (let i = 0; i < estimated_time.length; i++) {
                if(estimated_time[i] == undefined) estimated_time[i] = {};
            }
            
            resolve({graph, edge_lengths, time: estimated_time, coords, images: node_image, names: node_name});
        });
    });
}

module.exports = read;