'use strict';


test('product module should have productService', inject(function(productService) {
    return productService.should.be.ok;
}));

test('productService should have getProduct method', inject(function(productService) {
    return productService.should.have.property('getProduct');
}));


var httpBackend;
setup(inject(function($httpBackend) {
    httpBackend = $httpBackend;
    httpBackend.when("GET", "/api/product").respond({
        productId: "31592843"
    });
}));

test('should GET product', function() {
    httpBackend.expectGET('/api/product');
    httpBackend.flush();
});