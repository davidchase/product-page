'use strict';
var express = require('express');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');
var app = module.exports = express();
var env = process.env.NODE_ENV || 'development';
var api = require('./routes/api');

app.use('/api/product', bodyParser.json());
app.get('/api/product', api.product);
app.listen(3000, function() {
    console.log("Express server listening on port %d", this.address().port);
});

if (env === 'development') {
    app.use(errorhandler());
}