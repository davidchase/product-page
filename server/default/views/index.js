'use strict';
// needs to be relocated
// ... relative hell is no bueno
var productService = require('../../../client/src/app/product/productService');

module.exports = [{
    // index
    method: 'GET',
    path: '/',
    handler: function(req, reply) {
        productService
            .getProducts()
            .then(function(response) {
                reply.view('./product/views/index', {
                    defaultColor: 'White',
                    product: response.entity.product,
                    url: 'http://images.urbanoutfitters.com/is/image/UrbanOutfitters/',
                    swatchUrl: 'http://www.urbanoutfitters.com/images/swatches/'
                });
            })
            .otherwise(function(err) {
                throw new Error(err);
            });
    }
}, {
    // static files
    method: 'GET',
    path: '/static/{path*}',
    handler: {
        directory: {
            path: './client/',
            index: true
        }
    }
}, {
    // 404
    method: '*',
    path: '/{path*}',
    handler: function(req, reply) {
        reply('Not found sorry').code('404');
    }
}];