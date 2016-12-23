const gulp        = require('gulp'),
    sourcemaps  = require('gulp-sourcemaps'),
    source      = require('vinyl-source-stream'),
    buffer      = require('vinyl-buffer'),
    browserify  = require('browserify'),
    notify      = require('gulp-notify'),
    babel       = require('babelify'),
    chalk       = require('chalk'),
    sass        = require('gulp-sass'),
    sassImport  = require('sass-module-importer'),
    plumber     = require('gulp-plumber'),
    watch       = require('gulp-watch'),
    glob        = require('glob'),
    browserSync = require('browser-sync').create();

var handleError = function(err) {
    notify.onError("Check iTerm for details!")(err);
    console.log(chalk.white.bgRed(' <error> ------------------------ '));
    console.log(chalk.white(err.message));
    console.log(chalk.white.bgRed(' </error> ----------------------- '));
    this.emit('end');
}

// Converts SASS into CSS
gulp.task('sass', () => {
    gulp.src('./webapp/styles/main.scss')
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sass({ importer: sassImport() }).on('error', handleError))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./webapp/build/styles/css'));
});

// Converts ES2015+ to ES5 & Supports Modules
gulp.task('browserify', () => {
    var files = glob.sync('./webapp/src/**/*.js');
    return browserify({entries: files}, {debug: true})
        .transform(babel)
        .bundle()
        .on('error', handleError)
        .pipe(source('./bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./webapp/build/src'));
});

gulp.task('watch', () => {
    watch('./webapp/styles/**/*.scss', () => { gulp.start('sass'); });
    watch(['./webapp/src/**/*.js', './package.json'], () => { gulp.start('browserify'); });
    watch('./webapp/**/**', () => { browserSync.reload(); });
});

// Runs a simple browser sync server
gulp.task('server', function(done) {
    browserSync.init({
        server: "./webapp",
        port: 8085,
        // open: false,
        notify: false
    });
});

// Builds our app
gulp.task('build', ['sass', 'browserify']);

// Starts the development process
gulp.task('start', ['build', 'watch', 'server']);