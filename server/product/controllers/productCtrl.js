'use strict';

// symlinked into the node_modules dir freepeople
var productService = require('freepeople/productService');
var tokenService = require('freepeople/tokenService');

module.exports = function(req, reply) {
    var session = req.state.basket;
    if (!session) {
        tokenService
            .getAnonymousToken()
            .then(function(response) {
                session = response.entity.auth_token;
            })
            .otherwise(function(err) {
                console.error(err);
            });
    }
    productService
        .getProducts(req.params.productId)
        .then(function(response) {
            var thumbnails = response.entity.product.colors[0].viewCode;
            var care = response.entity.product.care &&
                response.entity.product.care.split('*').filter(Boolean);
            reply.view('./product/views/index', {
                product: response.entity.product,
                thumbnails: thumbnails,
                url: 'http://img5.fpassets.com/is/image/FreePeople/',
                swatchUrl: 'http://img2.fpassets.com/is/image/FreePeople/',
                care: care
            }).state('basket', session);
        })
        .otherwise(function(err) {
            console.error(err);
        });
};