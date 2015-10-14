'use strict';

var del = require('del');
var gulp = require('gulp');
var rename = require('gulp-rename');
var ts = require('gulp-typescript');
var tslint = require('gulp-tslint');

gulp.task('default', ['build']);

gulp.task('build', ['clean', 'compile', 'libs', 'config', 'html']);

gulp.task('clean', function () {
  del.sync([
    'app/js/**/*',
    'app/js'
  ]);
});

gulp.task('html', function () {
  return gulp.src('app/ts/**/*.html', { base: 'app/ts/' })
    .pipe(gulp.dest('app/js/'));
});

gulp.task('libs', function () {
  return gulp.src('app/ts/batarangle/frontend/libs/**/*.js', { base: 'app/ts/batarangle/frontend/libs/' })
    .pipe(gulp.dest('app/js/batarangle/frontend/libs'));
});

gulp.task('config', function () {
  return gulp.src([
    'app/ts/batarangle/frontend/batarangle.config.js',
    'app/ts/batarangle/backend/batarangle-backend.config.js'
    ], { base: 'app/ts/' })
    .pipe(gulp.dest('app/js/'));
});

// gulp.task('images', function () {
//   return gulp.src('source/images/**/*', { base: 'source' })
//     .pipe(gulp.dest('package/'));
// });

// gulp.task('manifest', function () {
//   return gulp.src('source/manifest.json', { base: 'source' })
//     .pipe(gulp.dest('package/'));
// });

gulp.task('lint', function(){
  return gulp.src('source/ts/**/*.ts')
    .pipe(tslint({ configuration: "tslint.json" }))
    .pipe(tslint.report("verbose"))
    .on('error', function handleError(err) {
      this.emit('end');
    });
});

gulp.task('compile', ['lint'], function (done) {
  var tsProject = ts.createProject('tsconfig.json', {
    typescript: require('typescript')
  });
  
  return tsProject.src()
    .pipe(ts(tsProject))
    .js
    .pipe(rename(function (path) {
      path.dirname = path.dirname.replace('app/ts', 'js');
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('flow', ['build'], function () {
  gulp.watch('./app/ts/**/*.html', ['html']);
  gulp.watch([
    'app/ts/batarangle/frontend/batarangle.config.js',
    'app/ts/batarangle/backend/batarangle-backend.config.js'
    ], ['config']);
  gulp.watch('./app/ts/**/*.ts', ['compile']);
  
  // gulp.watch('source/images/**/*', ['images']);
  // gulp.watch('source/manifest.json', ['manifest']);
});

