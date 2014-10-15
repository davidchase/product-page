'use strict';
var debounce = function(fn, threshold, isAsap) {
    var timeout;
    var result;

    var debounced = function() {
        var args = arguments;
        var _this = this;

        var delayed = function() {
            if (!isAsap) {
                result = fn.apply(_this, args);
            }
            timeout = null;
        };
        if (timeout) {
            clearTimeout(timeout);
        } else if (isAsap) {
            result = fn.apply(_this, args);
        }
        timeout = setTimeout(delayed, threshold);
        return result;
    };
    debounced.cancel = function() {
        clearTimeout(timeout);
    };
    return debounced;
};

module.exports = debounce;