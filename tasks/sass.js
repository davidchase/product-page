'use strict';
var gulp = require('gulp');
var sass = require('gulp-sass');
var bourbon = require('node-bourbon');

gulp.task('sass', function() {
    return gulp.src('./src/scss/**/*.scss')
        .pipe(sass({
            includePaths: bourbon.with(
                './src/bower_components/foundation5-sass/scss',
                './src/scripts/modules',
                './src/scss'
            ),
            errLogToConsole: true
        }))
        .pipe(gulp.dest('./public/css'));
});