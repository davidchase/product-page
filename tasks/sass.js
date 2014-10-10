'use strict';
var gulp = require('gulp');
var sass = require('gulp-sass');
var bourbon = require('node-bourbon');

gulp.task('sass', function() {
    return gulp.src('./client/src/scss/**/*.scss')
        .pipe(sass({
            includePaths: bourbon.with('./node_modules/foundation/scss', './client/src/scss'),
            outputStyle: 'compressed',
            errLogToConsole: true
        }))
        .pipe(gulp.dest('./client/dist/css'));
});

// simple watcher for libsass :)
gulp.task('sass-watch', function() {
    var watcher = gulp.watch('./client/src/scss/**/*.scss', ['sass']);
    return watcher.on('change', function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running sass compile...');
    });
});