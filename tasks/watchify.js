'use strict';

var gulp = require('gulp');
var source = require('vinyl-source-stream');
var libs = require('./vendor').libs;
var index = ['./client/src/app'];
var watchify = require('watchify');
var html = require('partialify');

gulp.task('watchify', function() {
    var bundleStream = watchify(index);
    var firstTime = true;

    // First time run
    // needs to externals
    // may need to revisit this concept later
    if (firstTime) {
        bundleStream.external(libs);
        rebundle();
        firstTime = false;
    }

    function rebundle() {
        bundleStream
            .transform(html)
            .bundle()
            .pipe(source('app.js'))
            .pipe(gulp.dest('./client/dist/js'))
            .on('error', function(err) {
                console.log(err);
            });

    }

    bundleStream.on('update', rebundle);
    bundleStream.on('log', console.log);

    return rebundle();
});