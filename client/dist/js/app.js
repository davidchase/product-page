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
},{"./product":2,"./suggestions":9,"angular":"iBmHg2"}],2:[function(require,module,exports){
'use strict';
// Maybe symlink our modules to node_modules
// in order to avoid relative hell like so ../../.. 
// >:|

require('angular-sanitize/angular-sanitize');
var productCtrl = require('./productCtrl');
var productImages = require('./product-images-directive');
var productService = require('./productService');
var productOptions = require('./product-options-directive');
var capitalizeFilter = require('../../common/filters/capitalizeFilter');

module.exports = angular.module('product', ['ngSanitize'])
    .value('imageUrl', 'http://images.urbanoutfitters.com/is/image/UrbanOutfitters/')
    .value('swatchUrl', 'http://www.urbanoutfitters.com/images/swatches/')
    .filter('capitalize', capitalizeFilter)
    .controller('productCtrl', productCtrl)
    .directive('productImages', productImages)
    .directive('productOptions', productOptions)
    .service('productService', productService);
},{"../../common/filters/capitalizeFilter":10,"./product-images-directive":3,"./product-options-directive":5,"./productCtrl":7,"./productService":8,"angular-sanitize/angular-sanitize":"Qb7U43"}],3:[function(require,module,exports){
'use strict';
// is it better to use templateUrl with fragile relative path
// or use a partial transform with browserfiy and
// also "pre-compiling" the template
// it should depend on the amount of writes done to the template
module.exports = function() {
    return {
        scope: true,
        restrict: 'EA',
        template: require('./product-images.tpl.html')
    };
};
},{"./product-images.tpl.html":4}],4:[function(require,module,exports){
module.exports = '<div class="main-product">\n    <img data-ng-src="{{product.imageUrl}}{{data.colors[product.image.colorIndex].id}}_{{data.colors[0].viewCode[product.image.activeIndex]}}" />\n</div>\n<ul class="thumbnails">\n    <li data-ng-repeat="color in data.colors">\n        <img\n        ng-click="product.changeThumbnail($index)"\n        class="image"\n        data-ng-src="{{product.imageUrl}}{{data.colors[product.image.colorIndex].id}}_{{color.viewCode[$index]}}?$detailthumb$"\n        />\n    </li>\n</ul>\n';
},{}],5:[function(require,module,exports){
'use strict';
module.exports = function() {
    return {
        scope: false,
        restrict: 'EA',
        template: require('./product-options.tpl.html')
    };
};
},{"./product-options.tpl.html":6}],6:[function(require,module,exports){
module.exports = '<div class="product-options">\n    <p class="selected-swatch">\n        Color: {{product.image.selectedColor | capitalize}}\n    </p>\n    <!-- Product Swatches-->\n    <div class="swatches">\n        <img\n        data-ng-class="{selected: $index == product.image.activeSwatch}"\n        data-ng-repeat="color in data.colors"\n        data-ng-click="product.changeColor($index, color)"\n        data-ng-src="{{product.swatchUrl}}{{color.id}}_s.png"\n        data-color-name="{{color.displayName}}" />\n    </div>\n    <!-- Product Size-->\n    <div class="product-size">\n        <div \n            data-ng-repeat="color in data.colors"\n            class="sizes"\n            data-ng-class="{selected: $index == product.image.activeSwatch}" >\n            <p>Sizes:</p>\n            <p data-ng-repeat="size in color.sizes">\n                {{size.displayName}}\n            </p>\n        </div>\n    </div>\n</div>';
},{}],7:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
'use strict';

module.exports = function() {
    return function(input) {
        input = input.toLowerCase();
        return input.charAt(0).toUpperCase() + input.slice(1);
    };
};
},{}]},{},[1])