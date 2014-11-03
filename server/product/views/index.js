'use strict';

var productCtrl = require('../controllers/productCtrl');

module.exports = [{
    // index
    method: 'GET',
    path: '/pdp/{productId?}',
    handler: productCtrl
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
}, {
    method: 'GET',
    path: '/',
    handler: function(req, reply) {
        reply.redirect('/pdp').code('301');
    }
}];