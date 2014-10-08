'use strict';

var glob = require('glob');
var path = require('path');
var allRoutes = [];
var getRoutePaths = glob.sync(path.join(__dirname, '**/views/*.js'));

getRoutePaths.forEach(function(routePath) {
   require(routePath).forEach(function(route){
        allRoutes.push(route);
   });
});

module.exports = allRoutes;