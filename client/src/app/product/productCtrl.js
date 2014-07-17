'use strict';

module.exports = ['$scope', 'productService', 'imageUrl', 'swatchUrl',
    function($scope, productService, imageUrl, swatchUrl) {
        $scope.imageUrl = imageUrl;
        $scope.swatchUrl = swatchUrl;
        productService
            .getProduct()
            .then(function(data) {
                $scope.product = data.product;
            })
            .catch(function(err) {
                throw new Error(err.status + ' ' + err.data);
            });
    }
];