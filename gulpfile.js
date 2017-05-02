var gulp = require('gulp');
var lambda = require('gulp-awslambda');
var merge = require('merge2');
var tap = require('gulp-tap');
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var zip = require('gulp-zip');


/**
 * For uploading the first time.
 * Subsequent updates on a function that has already been created only
 * require the name of the function (see task below).
 */
var lambda_params = {
    FunctionName: 'mountain-top'
};

if (!process.env.AWS_PROFILE) {
  console.log('Please provide AWS_PROFILE!');
  return;
}

var opts = {
    region: 'us-east-1',
    profile: process.env.AWS_PROFILE
};

gulp.task('lambda', function() {
  return merge(
    tsProject.src().pipe(tsProject()),
    gulp.src(['' +
    'src/node_modules/**'
    ], {base: 'src'})
  ).pipe(tap(function(file) {
    if (file.isDirectory()) {
      file.stat.mode = parseInt('40777', 8);
    }
  })).pipe(zip('archive.zip'))
  //.pipe(lambda(lambda_params, opts))
    .pipe(lambda(lambda_params.FunctionName, opts))
    .pipe(gulp.dest('dist/'));
});
