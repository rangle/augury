'use strict';

var del = require('del');
var gulp = require('gulp');
var rename = require('gulp-rename');
var ts = require('gulp-typescript');
var tslint = require('gulp-tslint');

gulp.task('default', ['build']);

gulp.task('build', ['clean', 'compile']);

gulp.task('clean', function () {
  del.sync([
    'app/js/**/*',
    'app/js'
  ]);
});

// gulp.task('html', function () {
//   return gulp.src('source/**/*.html', { base: 'source' })
//     .pipe(gulp.dest('package/'));
// });

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
  // gulp.watch('source/**/*.html', ['html']);
  // gulp.watch('source/images/**/*', ['images']);
  // gulp.watch('source/manifest.json', ['manifest']);
  gulp.watch('./app/ts/**/*.ts', ['compile']);
});

