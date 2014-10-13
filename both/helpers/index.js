// Temp storage of handlebar helpers
// may need to relocate if becomes large..
var Handlebars = require('handlebars');
Handlebars.registerHelper('lookup', function(obj, field) {
    return obj[field];
});
Handlebars.registerHelper('when', function(left, operator, right, options) {
    var operators = {
        'eq': function() {
            return left === right ? options.fn(this) : '';
        },
        'lt': function() {
            return left < right ? options.fn(this) : '';
        },
        'gt': function() {
            return left > right ? options.fn(this) : '';
        },
        'lte': function() {
            return left <= right ? options.fn(this) : '';
        },
        'gte': function() {
            return left >= right ? options.fn(this) : '';
        }
    };
    return operators[operator].call(this);
});
Handlebars.registerHelper('between', function(left, middle, right, options) {
    if (left <= middle && middle <= right) {
        return options.fn(this);
    }
});