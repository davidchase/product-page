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
            path: './templates/',
            layoutPath: './templates/layout/',
            helpersPath: './templates/helpers',
            partialsPath: './templates/partials',
            layout: true,
            isCached: true
        }
    }

};