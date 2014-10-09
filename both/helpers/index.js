// Temp storage of handlebar helpers
// may need to relocate if becomes wayward
var Handlebars = require('handlebars');
Handlebars.registerHelper('lookup', function(obj, field) {
  return obj[field];
});