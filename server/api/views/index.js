'use strict';
// Temp solution/hack while there's
// a Access Origin issue, this
// can be removed once on preview via jenkins
// or if the Access Origin issues is addressed
var rest = require('rest');
var mime = require('rest/interceptor/mime');
var errorCode = require('rest/interceptor/errorCode');

module.exports = [{
    method: 'POST',
    path: '/api/cart',
    handler: function(req, reply) {
        var payload = JSON.parse(req.payload);
        var client = rest.wrap(mime).wrap(errorCode);
        client({
            method: 'POST',
            path: 'http://10.9.1.45/api/v0/fp-us/basket/item',
            headers: {
                'Content-Type': req.headers['content-type'],
                'X-Urbn-Auth-Token': req.headers['x-urbn-auth-token']
            },
            entity: {
                skuId: payload.skuId,
                quantity: parseInt(payload.quantity, 10)
            }
        })
            .then(function(response) {
                reply(response.entity);
            })
            .otherwise(function(err) {
                reply(err.entity);
            });
    }
}];