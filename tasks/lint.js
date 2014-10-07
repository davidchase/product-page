'use strict';
var eslint = require('gulp-eslint');
var gulp = require('gulp');

gulp.task('lint', function() {
    return gulp.src([
            'gulpfile.js',
            'tasks/**/*.js',
            '/client/src/**/*.js',
            'test/**/*.js'
        ])
        .pipe(eslint())
        .pipe(eslint.format('stylish', process.stdout));
});