'use strict';
var rest = require('rest');
var mime = require('rest/interceptor/mime');
var errorCode = require('rest/interceptor/errorCode');

module.exports = [{
    method: 'GET',
    path: '/cart',
    handler: function(req, reply) {
        // get mini cart :)
        var token = req.state.basket;
        var client = rest.wrap(mime).wrap(errorCode);
        client({
            method: 'GET',
            path: 'http://10.9.1.45/api/v0/fp-us/basket?include_product=False',
            headers: {
                'Content-Type': 'application/json',
                'X-Urbn-Auth-Token': token
            }
        })
            .then(function(response) {
                reply.view('./cart/views/index', {
                    items: response.entity.cart.items
                });
            })
            .otherwise(function(err) {
                reply('Error: ' + err.entity.message).code(err.status.code);
            });
    }
}];