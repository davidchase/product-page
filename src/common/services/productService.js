'use strict';

module.exports = function($http) {
    $http.get('/api/posts')
        .success(function(data, status, headers, config) {
            return data;
        });
};