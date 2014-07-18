'use strict';
var productImages = require('./product-images.tpl.html');

module.exports = function() {
    return {
        scope: true,
        restrict: 'EA',
        template: productImages,
        controller: ['$scope',
            function($scope) {
                // Setup some defaults
                $scope.image = {
                    selectedColor: 'White',
                    activeIndex: 0,
                    colorIndex: 0,
                    selectedSwatch: 0
                };
                $scope.changeThumbnail = function(index) {
                    $scope.image.activeIndex = index;
                };
                $scope.changeColor = function(index) {
                    $scope.image.selectedColor = this.color.displayName;
                    $scope.image.colorIndex = index;
                    $scope.image.selectedSwatch = index;
                };
            }
        ],
    };
};