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
var productImages = require('./product-images');
var productInfo = require('./product-info');
var suggestions = require('./suggestions');

angular.module('product-details', [
    productImages.name,
    productInfo.name,
    suggestions.name
]);