'use strict';

var ProductService = function() {
    this.rest = require('rest');
    this.mime = require('rest/interceptor/mime');
    this.errorCode = require('rest/interceptor/errorCode');
};

var ProductProto = ProductService.prototype;

ProductProto.getProducts = function(productId) {
    var client = this.rest.wrap(this.mime).wrap(this.errorCode);
    productId = productId || '30889687';
    return client({
        path: 'http://10.9.1.45/api/v1/product/' + productId
    });
};

module.exports = new ProductService();