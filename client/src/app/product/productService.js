'use strict';

var ProductService = function() {
    this.rest = require('rest');
    this.mime = require('rest/interceptor/mime');
    this.errorCode = require('rest/interceptor/errorCode');
};

var ProductProto = ProductService.prototype;

ProductProto.getProducts = function() {
var client = this.rest.wrap(this.mime).wrap(this.errorCode);
    return client({
        path: 'http://localhost:9000/api/product'
    });
};

module.exports = new ProductService();
