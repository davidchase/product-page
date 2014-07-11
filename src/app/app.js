'use strict';

var angular = require('angular');
var productImages = require('product-images');
var productInfo = require('product-info');
var suggestions = require('suggestions');

angular.module('product-details', [
    productImages.name,
    productInfo.name,
    suggestions.name
]);