/* globals angular */
'use strict';
var colorSwatch = require('./colorSwatch');

module.exports = angular.module('product-images', [])
    .directive('colorSwatch', colorSwatch);