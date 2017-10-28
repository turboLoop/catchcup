var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var browserSync = require('browser-sync').create();
var minifyCSS = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minify = require('gulp-minify');

/* Theme Root Directory*/
var themeRoot = "./";

/* Bower */
gulp.task('js', function(){
    gulp.src([
            themeRoot + 'js/lib/*.js',
            themeRoot + 'js/main.js'
        ])
        .pipe(concat('app.js'))
        .pipe(gulp.dest(themeRoot + 'js/build/'));
});

gulp.task('compress', function() {
    gulp.src(themeRoot + 'js/build/app.js')
        .pipe(minify({
            ext:{
                src:'.js',
                min:'.min.js'
            }
        }))
        .pipe(gulp.dest(themeRoot + 'js/build/'))
});


var plumberErrorHandler = { errorHandler: notify.onError({
    title: 'Gulp',
    message: 'Error: <%= error.message %>'
})};

gulp.task('sass', function () {
    gulp.src(themeRoot + '*.scss')
        .pipe(plumber(plumberErrorHandler))
        .pipe(sass())
        .pipe(minifyCSS())
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9'))
        .pipe(gulp.dest(themeRoot + '/'))
        .pipe(browserSync.stream());
});

// Static Server + watching scss/html files
gulp.task('serve', ['sass', 'js', 'compress'], function() {

    browserSync.init({
        proxy: "localhost:8080"
    });

    gulp.watch(themeRoot + "**/*.scss", ['sass']);
    gulp.watch(themeRoot + "js/**/*.js", ['js']);
    gulp.watch(themeRoot + "*.html").on('change', browserSync.reload);
});

gulp.task('default', ['serve']);