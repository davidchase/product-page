'use strict';

var gulp = require('gulp');
var compass = require('gulp-compass');

// Converting scss into browser friendly css
gulp.task('compass', function() {
    gulp.src('./client/src/scss/**/*.scss')
        .pipe(compass({
            config_file: './config.rb',
            css: 'client/dist/css',
            sass: 'client/src/scss'
        }))
        .pipe(gulp.dest('./client/dist/css'));
});

// Watch task to covert scss to css 
// on file change or modify
gulp.task('watch-compass', function() {
    gulp.watch(['dev/scss/**'], ['compass']);
});