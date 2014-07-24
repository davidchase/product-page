'use strict';

/*
 * Data driven in from express layer
 * $http returns a promise to the controller
 * $q rejects any errors
 *
 */
module.exports = ['$http', '$q',
    function($http, $q) {
        this.getProduct = function() {
            return $http.get('/api/product')
                .then(function(res) {
                    return typeof res.data === 'object' ? res.data : $q.reject('Not correct format');
                })
                .catch(function(err) {
                    return $q.reject(err);
                });
        };
    }
];