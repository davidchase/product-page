'use strict';

var productImages = require('./product-images.tpl.html');
module.exports = function() {
    return {
        scope: true,
        restrict: 'EA',
        template: productImages,
        link: function(scope) {
            scope.color = {
                index: 0
            };
            scope.active = {
                index: 0
            };
            scope.getIndex = function(index) {
                scope.active = {
                    index: index
                };
            };
        }
    };
};