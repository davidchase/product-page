'use strict';

var path = require('path');
var rootPath = path.normalize(path.join(__dirname, '/..'));

module.exports = {
    root: rootPath,
    port: parseInt(process.env.PORT, 10) || 8080,
    options: {
        debug: {
            request: ['error']
        },
        cors: true,
        files: {
            etagsCacheMaxSize: 50000
        }
    }

};
