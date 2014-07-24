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