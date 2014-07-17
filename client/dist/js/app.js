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
},{"./product":4,"./suggestions":9,"angular":"iBmHg2"}],2:[function(require,module,exports){
module.exports = '<div>Color Swatch Template: {{fromCtrl}}</div>';
},{}],3:[function(require,module,exports){
'use strict';
// is it better to use templateUrl with fragile relative path
// or use a partial transform with browserfiy and
// also "pre-compiling" the template
// it should depend on the amount of writes done to the template
var colorSwatch = require('./color-swatch.tpl.html');
module.exports = function() {
    return {
        scope: true,
        restrict: 'EA',
        controller: ['$scope',
            function($scope) {
                $scope.fromCtrl = 'Loaded from controller';
            }
        ],
        template: colorSwatch,
        link: function(scope, element) {
            scope.el = element[0];
        }
    };
};
},{"./color-swatch.tpl.html":2}],4:[function(require,module,exports){
'use strict';

require('angular-sanitize/angular-sanitize');
var productCtrl = require('./productCtrl');
var productImages = require('./product-images-directive');
var colorSwatch = require('./color-swatch-directive');
var productService = require('./productService');

module.exports = angular.module('product', ['ngSanitize'])
    .value('imageUrl', 'http://images.urbanoutfitters.com/is/image/UrbanOutfitters/')
    .value('swatchUrl', 'http://www.urbanoutfitters.com/images/swatches/')
    .controller('productCtrl', productCtrl)
    .directive('productImages', productImages)
    .directive('colorSwatch', colorSwatch)
    .service('productService', productService);
},{"./color-swatch-directive":3,"./product-images-directive":5,"./productCtrl":7,"./productService":8,"angular-sanitize/angular-sanitize":"Qb7U43"}],5:[function(require,module,exports){
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
},{"./product-images.tpl.html":6}],6:[function(require,module,exports){
module.exports = '<div class="main-product">\n    <img data-ng-src="{{imageUrl}}{{product.colors[color.index].id}}_{{product.colors[0].viewCode[active.index]}}" />\n</div>\n<ul>\n    <li data-ng-repeat="image in product.colors">\n        <img\n        ng-click="getIndex($index)"\n        class="image"\n        data-ng-src="{{imageUrl}}{{product.colors[color.index].id}}_{{image.viewCode[$index]}}?$detailthumb$"\n        />\n    </li>\n</ul>';
},{}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
'use strict';

module.exports = angular.module('suggestions', []);
},{}]},{},[1])