'use strict';

var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var ugilfy = require('gulp-uglify');
var index = ['./client/src/app'];
var libs = require('./vendor').libs;
var html = require('partialify');

gulp.task('bro', function() {
    var bundleStream = browserify({
        entries: index
    });
    bundleStream
        .external(libs)
        .transform(html)
        .bundle()
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(ugilfy())
        .pipe(gulp.dest('./client/dist/js'))
        .on('error', function(err) {
            console.log(err);
        });
});

gulp.task('bro-watch', function() {
    var watcher = gulp.watch('./client/src/app/**/*.js', ['bro']);
    watcher.on('change', function(event) {
        return console.log('File ' + event.path + ' was ' + event.type + ', running browserify...');
    });
});