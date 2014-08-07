'use strict';

require('../client/src/app');
var productDetails = angular.module('product-details');


var hasModule = function(m) {
    var deps = productDetails.requires;
    return deps.indexOf(m) >= 0;
};

test('angular is loaded on the page', function() {
    return angular.should.be.ok;
});


test('product details module exists', function() {
    return productDetails.should.not.equal(null);
});

test("product as a dependency of productDetails", function() {
    return hasModule('product').should.be.true;
});

test("suggestions as a dependency of productDetails", function() {
    return hasModule('suggestions').should.be.true;
});