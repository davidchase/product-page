'use strict';

module.exports = ['$scope', 'productService', 'imageUrl', 'swatchUrl',
    function($scope, productService, imageUrl, swatchUrl) {
        productService
            .getProduct()
            .then(function(data) {
                $scope.data = data.product;
            })
            .catch(function(err) {
                throw new Error(err.status + ' ' + err.data);
            });

        // Product Images + Options
        this.imageUrl = imageUrl;
        this.swatchUrl = swatchUrl;

        this.image = {
            selectedColor: 'White',
            activeIndex: 0,
            colorIndex: 0,
            activeSwatch: 0
        };

        this.changeThumbnail = function(index) {
            this.image.activeIndex = index;
        };
        this.changeColor = function(index, color) {
            this.image.selectedColor = color.displayName;
            this.image.colorIndex = index;
            this.image.activeSwatch = index;
        };

        $scope.product = this;
    }
];