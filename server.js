#!/usr/bin/env node

'use strict';


var Hapi = require('hapi');
var dotenv = require('dotenv');
var config = require('./server/config');
var server = Hapi.createServer('localhost', config.port, config.options);
var routes = require('./server/config/routes');
var views = require('./server/config/views');

// load environment variables
dotenv.load();

// Requires plugins
require('./server/config/plugins')(server);

// Product Page + API + static files
server.route(routes);

// Setup handlebars and its template locations
server.views(views);

// set auth_token for get basket in cookie
server.state('basket', {
    ttl: (24 * 60 * 60 * 1000) * 213, // ~ 6 months
    isSecure: false,
    isHttpOnly: false
});


//Start the server
server.start(function() {
    console.log('Server started at: ' + server.info.uri);
});