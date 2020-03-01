const Datastore = require('./redis');
const datastore = new Datastore();
const client = datastore.connect();

client.on('error', (err) => {
    console.log("Error " + err);
});

function storeLandmarkDistances(landmark_info) {
    for (const landmark in landmark_info.from) {
        let key = landmark.toString();
        for (const distance of landmark_info.from[landmark]) {
            client.rpush(key, distance)
        }
        client.sadd('ui_landmarks', key)
    }
    client.quit();
}
 
module.exports = storeLandmarkDistances;