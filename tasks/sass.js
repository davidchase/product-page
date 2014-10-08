'use strict';
var gulp = require('gulp');
var sass = require('gulp-sass');
var bourbon = require('node-bourbon');

gulp.task('sass', function() {
    return gulp.src('./client/src/scss/**/*.scss')
        .pipe(sass({
            includePaths: bourbon.with('./client/src/scss'),
            outputStyle: 'compressed',
            errLogToConsole: true
        }))
        .pipe(gulp.dest('./client/dist/css'));
});