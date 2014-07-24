'use strict';

module.exports = function() {
    return function(input) {
        input = input.toLowerCase();
        return input.charAt(0).toUpperCase() + input.slice(1);
    };
};