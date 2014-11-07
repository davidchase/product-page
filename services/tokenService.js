'use strict';

var TokenService = function() {
    this.rest = require('rest');
    this.mime = require('rest/interceptor/mime');
    this.errorCode = require('rest/interceptor/errorCode');
};

var TSProto = TokenService.prototype;

TSProto.getAnonymousToken = function() {
    var client = this.rest.wrap(this.mime).wrap(this.errorCode);
    return client({
        method: 'POST',
        path: process.env.AUTH_TOKEN_URL
    });
};

module.exports = new TokenService();