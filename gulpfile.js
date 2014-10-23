'use strict';

var fs = require('fs');
var dir = './tasks/';
var tasks = fs.readdirSync(dir);

tasks.forEach(function(task) {
    require(dir + task);
});