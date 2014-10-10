// Temp storage of handlebar helpers
// may need to relocate if becomes wayward
var Handlebars = require('handlebars');
Handlebars.registerHelper('lookup', function(obj, field) {
    return obj[field];
});
Handlebars.registerHelper('equal', function(v1, v2, options) {
    if (v1 === v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});