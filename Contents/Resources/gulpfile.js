const gulp = require('gulp');
const babel = require("gulp-babel");
const rename = require('gulp-rename');


gulp.task('src', function () {
    return gulp.src('app/src/**/*.js')
        .pipe(babel())
        .pipe(gulp.dest('app/dist/'));
});

gulp.task('main', function () {
    return gulp.src('app/main.js')
        .pipe(babel())
        .pipe(rename('main-compiled.js'))
        .pipe(gulp.dest('app'));
});

gulp.task('watch', () => {
    return gulp.watch('app/**/*.js', ['main', 'src']);
});