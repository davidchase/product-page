'use strict';

var productService = require('../../../client/src/app/product/productService');
// Need to find a place for the helpers
// maybe will remove helpers in general
// but for now its here....
var Handlebars = require('handlebars');
Handlebars.registerHelper('lookup', function(obj, field) {
  return obj[field];
});

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