'use strict';
// ClassList polyfill made to work with zombie testing
// @todo add support for multiple add and remove of classes
// challenge not to use Regex
var ClassListPoly = function() {};

var CLProto = ClassListPoly.prototype;

CLProto.addClass = function(el, classToAdd) {
    if (el.className.indexOf(classToAdd) > -1) {
        return;
    }
    el.className = el.className += ' ' + classToAdd;
};

CLProto.removeClass = function(el, classToRem) {
    var classes = el && el.className.split(' ');
    var position = classes && classes.indexOf(classToRem);
    if (position === -1 || !position) {
        return;
    }
    classes.splice(position, 1);
    el.className = classes.join(' ');
};

module.exports = new ClassListPoly();