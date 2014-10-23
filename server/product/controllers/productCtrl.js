'use strict';

// symlinked into the node_modules dir freepeople
var productService = require('freepeople/productService');

module.exports = function(req, reply) {
    productService
        .getProducts()
        .then(function(response) {
            var thumbnails = response.entity.product.colors[0].viewCode;
            reply.view('./product/views/index', {
                product: response.entity.product,
                thumbnails: thumbnails,
                url: 'http://img5.fpassets.com/is/image/FreePeople/',
                swatchUrl: 'http://img2.fpassets.com/is/image/FreePeople/'
            });
        })
        .otherwise(function(err) {
            console.error(err);
        });
};