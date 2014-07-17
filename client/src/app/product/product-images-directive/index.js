'use strict';


var productImages = require('./product-images.tpl.html');
module.exports = function() {
    return {
        scope: true,
        restrict: 'EA',
        template: productImages,
        controller: ['$scope',
            function($scope) {
                $scope.image = {
                    selectedColor: 'White',
                    activeIndex: 0,
                    colorIndex: 0
                };
                $scope.changeThumbnail = function(index) {
                    $scope.active = {
                        index: index
                    };
                };
                $scope.changeColor = function(index) {
                    $scope.selected = {
                        color: this.color.displayName
                    };
                    $scope.color = {
                        index: index
                    };
                };
            }
        ],
    };
};