'use strict';

require('../client/src/app');

var $scope, product;

setup(angular.mock.module('product'));

setup(inject(function($rootScope, $controller) {
    $scope = $rootScope.$new();
    $controller('productCtrl', {
        $scope: $scope
    });
    product = $scope.product;
}));

test('$scope should exist', function() {
    $scope.should.not.equal(null);
});

test('$scope should have product', function() {
    $scope.should.have.property('product');
});

test('product image url should be contain urbanoutfitters', function() {
    product.imageUrl.should.containEql('http://images.urbanoutfitters.com/');
});

test('product swatch url should contain swatch', function() {
    product.swatchUrl.should.containEql('images/swatches/');
});

test('product thumbnail should change based on index', function() {
    var index = 2;
    product.changeThumbnail(index);
    return product.image.activeIndex.should.equal(2);
});

test('swatch should display correct label', function() {
    product.changeColor(2, {
        displayName: 'white'
    });
    product.image.colorIndex.should.equal(2);
    product.image.selectedColor.should.equal('white');
});