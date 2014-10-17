'use strict';

module.exports = [{
    method: 'GET',
    path: '/api/product',
    handler: {
        file: './server/api/fixtures.json'
    }
}];