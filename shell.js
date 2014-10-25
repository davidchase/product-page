'use strict';

var shell = require('shelljs');
var symlinkDir = './node_modules/freepeople';

if (!shell.test('-L', symlinkDir)) {
    shell.exec('ln -s ../services' + ' ' + symlinkDir, function() {
        console.log('Symlink created');
    });
}