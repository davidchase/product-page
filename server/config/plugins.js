'use strict';
var Good = require('good');
module.exports = function(server) {
    var options = {
        reporters: [{
            reporter: Good.GoodConsole,
            args: [{
                events: {
                    log: ['error', 'medium']
                }
                }]
            }]
    };

    server.pack.register({
        plugin: require('good'),
        options: options
    }, function(err) {
        if (err) {
            throw err;
        }
    });
};