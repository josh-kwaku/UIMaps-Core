const { promisify } = require('util');

const Datastore = require('./redis');
const datastore = new Datastore();
const client = datastore.connect();

client.on('error', (err) => {
    console.log("Error " + err);
});

const membersAsync = promisify(client.smembers).bind(client);
const lrangeAsync = promisify(client.lrange).bind(client);

class LandmarkInfo {
    constructor() {
        this.distance_from_landmark = {};
        this.distance_to_landmark = {};
        this.landmarks = [];
    }
}

function retrieveLandmarkDistances() {
    let landmarkInfo = new LandmarkInfo();
    return new Promise(async (resolve, reject) => {
        const landmarks = await membersAsync('ui_landmarks');
        for (const landmark of landmarks) {
            landmarkInfo.landmarks.push(landmark);
            let distance_from_landmark = await lrangeAsync(landmark, 0, -1);
            landmarkInfo.distance_from_landmark[landmark] = distance_from_landmark;
        }
        // client.quit();
        resolve(landmarkInfo);
    });
}

module.exports = retrieveLandmarkDistances;