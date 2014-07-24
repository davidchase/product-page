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