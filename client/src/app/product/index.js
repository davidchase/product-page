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