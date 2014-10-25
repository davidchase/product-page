'use strict';

module.exports = {
    engines: {
        hbs: require('handlebars')
    },
    path: './templates/',
    layoutPath: './templates/layout/',
    helpersPath: './templates/helpers',
    partialsPath: './templates/partials',
    layout: true,
    isCached: true
};