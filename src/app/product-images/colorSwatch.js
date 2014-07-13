'use strict';
// is it better to use templateUrl with fragile relative path
// or use a partial transform with browserfiy and
// also "pre-compiling" the template
// it should depend on the amount of writes done to the template
// var colorSwatch = require('./color-swatch.tpl.html');
module.exports = function() {
    return {
        scope: true,
        restrict: 'EA',
        controller: function($scope) {
            $scope.fromCtrl = 'Loaded from controller';
        },
        template: 'colorSwatch',
        link: function(scope, element) {
            scope.el = element[0];
        }
    };
};