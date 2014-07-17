'use strict';

require('../client/src/app');
var scope, element;

setup(angular.mock.module('product-details'));
setup(inject(function($compile, $rootScope) {
    scope = $rootScope;
    element = $compile('<div data-color-swatch></div>')(scope);
    scope.$digest();
}));

test("color swatch directive that it works properly", function() {
    (element.text()).should.equal('Color Swatch Template: Loaded from controller');
});