'use strict';
var Janitor = function() {};
var JProto = Janitor.prototype;

JProto.preventNonNumericInput = function(e) {
    var key = e.keyCode || e.which;
    // prevent a-z and other non-numeric inputs
    if (key < 48 || key > 57) {
        e.preventDefault();
    }
    // prevent pasting
    if (e.type === 'paste') {
        e.preventDefault();
    }
};

JProto.sanitizeInput = function(el) {
    var adjusted = parseInt(el.value, 10);
    // If value is NaN or eql to 0 then it set to 1
    // otherwise return value
    adjusted = isNaN(adjusted) || adjusted === 0 ? 1 : adjusted;
    el.value = adjusted;
};

module.exports = new Janitor();