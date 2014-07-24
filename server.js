'use strict';
// Express v4
var express = require('express');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');
var morgan = require('morgan');
var app = module.exports = express();
var env = process.env.NODE_ENV || 'development';
var routes = require('./server/routes');
var api = require('./server/routes/api');

// Config
if (env === 'development') {
    app.use(errorhandler());
}
app.use('/api/product', bodyParser.json());
app.use(express.static(__dirname + '/client'));
app.use(morgan('dev'));

// Routes
app.get('/', routes.index);

// JSON Data
app.get('/api/product', api.product);

// Start Server 
app.listen(3000, function() {
    console.log("Express server listening on port %d", this.address().port);
});