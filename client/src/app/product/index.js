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