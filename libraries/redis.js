const redis = require('redis');

let redisOptions = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
}

class InMemoryDataStore {
    constructor() {
        if (InMemoryDataStore.instance) {
            return InMemoryDataStore.instance;
        }

        InMemoryDataStore.instance = this;
        this.client = {};
        return this;
    }

    connect () {
        if (InMemoryDataStore.client) {
            return InMemoryDataStore.client;
        }
        if (process.env.NODE_ENV === 'development') {
            this.client = redis.createClient(redisOptions);
        } else {
            this.client = redis.createClient(redisOptions)
        }
        InMemoryDataStore.client = this.client;
        return this.client;
    }

    closeConnection() {
        if (InMemoryDataStore.client) {
            this.client.quit();
        }
        return true;
    }
}
module.exports = InMemoryDataStore;