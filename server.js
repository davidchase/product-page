#!/usr/bin/env node

'use strict';
var Hapi = require('hapi');
var config = require('./server/config');
var server = new Hapi.Server('localhost', config.port, config.options);
var routes = require('./server/config/routes');

// Requires plugins
require('./server/config/plugins')(server);

// Product Page + API + static files
server.route(routes);

//Start the server
server.start(function() {
    console.log('Server started at: ' + server.info.uri);
});