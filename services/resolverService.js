'use strict';
// @todo Create an npm module
// with more features

module.exports = function(directory, lookUp) {

    var glob = require('glob');
    var path = require('path');
    var resolvedPaths = [];
    var getPaths = glob.sync(path.join(directory, lookUp));

    getPaths.forEach(function(paths) {
        require(paths).forEach(function(resolved) {
            resolvedPaths.push(resolved);
        });
    });

    return resolvedPaths;
};