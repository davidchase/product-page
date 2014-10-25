#!/usr/bin/env node

'use strict';
var Hapi = require('hapi');
var config = require('./server/config');
var server = Hapi.createServer('localhost', config.port, config.options);
var routes = require('./server/config/routes');
var views = require('./server/config/views');

// Requires plugins
require('./server/config/plugins')(server);

// Product Page + API + static files
server.route(routes);

// Setup handlebars and its template locations
server.views(views);

//Start the server
server.start(function() {
    console.log('Server started at: ' + server.info.uri);
});