#!/usr/bin/env node

'use strict';
// Hapi v6.11.1
var Hapi = require('hapi');
var Good = require('good');
var server = new Hapi.Server('localhost', 3000);

// Product Page + API + static files
server.route([{
    method: 'GET',
    path: '/',
    handler: function(req, reply) {
        reply.file('./client/index.html');
    }
}, {
    method: 'GET',
    path: '/api/product',
    handler: {
        file: './server/fixtures.json'
    }
}, {
    method: 'GET',
    path: '/{path*}',
    handler: {
        directory: {
            path: './client/',
            index: true
        }
    }
}]);

// Pack for logs
server.pack.register(Good, function(err) {
    if (err) {
        throw err;
    }

    server.start(function() {
        server.log('info', 'Server running at: ' + server.info.uri);
    });
});

server.start();