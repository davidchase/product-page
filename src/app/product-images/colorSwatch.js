'use strict';

module.exports = function() {
    return {
        scope: true,
        restrict: 'EA',
        template: 'color-swatch.tpl.html',
        link: function(scope, element) {
            scope.el = element[0];
        }
    };
};