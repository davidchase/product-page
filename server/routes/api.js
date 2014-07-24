'use strict';
var fs = require("fs");
var data;

function _readJsonFileSync(file, encoding) {
    if (typeof(encoding) === 'undefined') {
        encoding = 'utf8';
    }
    var filepath = __dirname + '/../' + file;
    var json = fs.readFileSync(filepath, encoding);
    return JSON.parse(json);
}

data = _readJsonFileSync('fixtures.json');


exports.product = function(req, res) {
    res.json({
        product: data.product
    });
};