const SearchService = require('./service');
const service = new SearchService();
const Response = require('../../../libraries/response');
const Validator = require('./validator');
const Errors = require('../../../libraries/errors');
const Transformer = require('./transformer');

class SearchController {
    constructor() {}

    getShortestPath(payload) {
        return new Promise((resolve, reject) => {
            service.getShortestPath(payload).then((result) => {
                resolve(new Response('success', null, result, 200));
            }).catch(error => {
                reject(error);
            })
        })
    }
}

module.exports = SearchController;
