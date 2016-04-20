
var gulp = require('gulp');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');

var sourceFiles = './src/**/*.js';

gulp.task('build', function() {
    var babelCompiler = babel({
        presets: ['es2015']
    });
    babelCompiler.on('error', function(e) {
        console.log(e);
        babelCompiler.end();
    });
    return gulp.src(sourceFiles)
        .pipe(sourcemaps.init())
        .pipe(babelCompiler)
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('.'));
});

gulp.task('watch', ['build'], function() {
	gulp.watch(sourceFiles, ['build']);
});
