(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/*  
 *  Can be done with
 *  require('angularjs/angular');
 *  which exposes angular to the window.
 *  This is a current stable build from
 *  angular hosted as a bower package.
 *
 */
var angular = require('angular');
var product = require('./product');
var suggestions = require('./suggestions');

angular.module('product-details', [
    product.name,
    suggestions.name
]);
},{"./product":2,"./suggestions":7,"angular":"iBmHg2"}],2:[function(require,module,exports){
'use strict';
// Maybe symlink our modules to node_modules
// in order to avoid relative hell like so ../../.. 
// >:|

require('angular-sanitize/angular-sanitize');
var productCtrl = require('./productCtrl');
var productImages = require('./product-images-directive');
var productService = require('./productService');
var capitalizeFilter = require('../../common/filters/capitalizeFilter');

module.exports = angular.module('product', ['ngSanitize'])
    .value('imageUrl', 'http://images.urbanoutfitters.com/is/image/UrbanOutfitters/')
    .value('swatchUrl', 'http://www.urbanoutfitters.com/images/swatches/')
    .filter('capitalize', capitalizeFilter)
    .controller('productCtrl', productCtrl)
    .directive('productImages', productImages)
    .service('productService', productService);
},{"../../common/filters/capitalizeFilter":8,"./product-images-directive":3,"./productCtrl":5,"./productService":6,"angular-sanitize/angular-sanitize":"Qb7U43"}],3:[function(require,module,exports){
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
},{"./product-images.tpl.html":4}],4:[function(require,module,exports){
module.exports = '<div class="main-product">\n    <img data-ng-src="{{imageUrl}}{{product.colors[image.colorIndex].id}}_{{product.colors[0].viewCode[image.activeIndex]}}" />\n</div>\n<ul class="thumbnails">\n    <li data-ng-repeat="color in product.colors">\n        <img\n            ng-click="changeThumbnail($index)"\n            class="image"\n            data-ng-src="{{imageUrl}}{{product.colors[image.colorIndex].id}}_{{color.viewCode[$index]}}?$detailthumb$"\n        />\n    </li>\n</ul>\n<p>Color: {{image.selectedColor | capitalize}}</p>\n<img\n    class="color-swatch"\n    ng-click="changeColor($index)"\n    data-ng-repeat="color in product.colors"\n    data-ng-src="{{swatchUrl}}{{color.id}}_s.png"\n    data-color-name="{{color.displayName}}" \n/>';
},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
'use strict';

/*
 * Data driven in from express layer
 * $http returns a promise to the controller
 * $q rejects any errors
 *
 */
module.exports = ['$http', '$q',
    function($http, $q) {
        this.getProduct = function() {
            return $http.get('/api/product')
                .then(function(res) {
                    return typeof res.data === 'object' ? res.data : $q.reject('Not correct format');
                })
                .catch(function(err) {
                    return $q.reject(err);
                });
        };
    }
];
},{}],7:[function(require,module,exports){
'use strict';

module.exports = angular.module('suggestions', []);
},{}],8:[function(require,module,exports){
'use strict';

module.exports = function() {
    return function(input) {
        input = input.toLowerCase();
        return input.charAt(0).toUpperCase() + input.slice(1);
    };
};
},{}]},{},[1])