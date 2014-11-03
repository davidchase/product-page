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
        path: 'http://10.9.1.45/api/v1/product/30889687'
    });
};

module.exports = new ProductService();