'use strict';

var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var entries = ['./src/app/index.js'];
var libs = require('./vendor').libs;
var html = require('partialify');

gulp.task('browserify', function() {
    var bundleStream = browserify({
        entries: entries
    });
    bundleStream
        .external(libs)
        .transform(html)
        .bundle()
        .pipe(source('app.js'))
        .on('error', function(err) {
            console.log(err);
        })
        .pipe(gulp.dest('./dist/js'));
});