(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var angular = require('angular');
var productImages = require('./product-images');
var productInfo = require('./product-info');
var suggestions = require('./suggestions');

angular.module('product-details', [
    productImages.name,
    productInfo.name,
    suggestions.name
]);
},{"./product-images":4,"./product-info":5,"./suggestions":6,"angular":"iBmHg2"}],2:[function(require,module,exports){
module.exports = '<div>Color Swatch Template: {{fromCtrl}} yeah</div>';
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
        controller: function($scope) {
            $scope.fromCtrl = 'Loaded from controller';
        },
        template: colorSwatch,
        link: function(scope, element) {
            scope.el = element[0];
        }
    };
};
},{"./color-swatch.tpl.html":2}],4:[function(require,module,exports){
/* globals angular */
'use strict';
var colorSwatch = require('./colorSwatch');

module.exports = angular.module('product-images', [])
    .directive('colorSwatch', colorSwatch);
},{"./colorSwatch":3}],5:[function(require,module,exports){
/* globals angular */
'use strict';

module.exports = angular.module('product-info', []);
},{}],6:[function(require,module,exports){
'use strict';

module.exports = angular.module('suggestions', []);
},{}]},{},[1])