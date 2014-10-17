'use strict';

var productCtrl = require('../controllers/productCtrl');

module.exports = [{
    // index
    method: 'GET',
    path: '/',
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
}];