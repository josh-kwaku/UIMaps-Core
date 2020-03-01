const router = require('express').Router();
const SearchController = require('./controller');
const controller = new SearchController();
const Misc = require('../../../libraries/misc');
const Response = require('../../../libraries/response');
const Errors = require('../../../libraries/errors');
const requireTokenAuth = require('../auth_middleware');

/**
 * Middleware to append request params to request body
 * @param req
 * @param res
 * @param next
 */
function appendParamToRequestBody(req, res, next) {
    const params = Object.keys(req.params);
    if (params.length === 0) next();
    else if (params.length === 1) {
        req.body[params[0]] = req.params[params];
    } else {
        for (let param of params) {
            req.body[param] = req.params[param];
        }
    }
    next();
}

function appendQueryParamsToRequestBody(req, res, next) {
    const queryParams = Object.keys(req.query);
    console.log(queryParams);
    if (queryParams.length === 0) next();
    else if (queryParams.length === 1) {
        req.body[queryParams[0]] = req.query[queryParams];
    } else {
        for (let queryParam of queryParams) {
            req.body[queryParam] = req.query[queryParam];
        }
    }
    next();
}

router.get('/', (req, res) => {

});

router.post('/', (req, res) => { 
    controller.getShortestPath(req.body).then(response => {
        res.status(response.status_code).send(Misc.formattedResponse(response))
    }).catch(error => {
        res.status(500).send(Misc.formattedResponse(new Response('error', Errors.server_error, error.message, 500)));
    })
});

module.exports = router;
