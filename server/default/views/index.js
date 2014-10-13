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