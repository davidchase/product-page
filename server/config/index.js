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
        cache: {
            engine: require('catbox-memory')
        },
        cors: true,
        files: {
            etagsCacheMaxSize: 50000
        },
        views: {
            engines: {
                hbs: require('handlebars')
            },
            path: './both/',
            layoutPath: './both/common/',
            helpersPath: './both/helpers',
            partialsPath: './both/partials',
            layout: true,
            isCached: true
        }
    }

};