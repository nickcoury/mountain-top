var gulp = require('gulp');
var lambda = require('gulp-awslambda');
var merge = require('merge2');
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var zip = require('gulp-zip');


/**
 * For uploading the first time.
 * Subsequent updates on a function that has already been created only
 * require the name of the function (see task below).
 */
var lambda_params = {
    FunctionName: 'mountain-top-0-2',
    Role: '[YOUR LAMBDA EXEC ROLE HERE]'
};

var opts = {
    region: 'us-east-1'
};

gulp.task('lambda', function() {
    return merge(
        tsProject.src().pipe(tsProject()),
        gulp.src(['src/node_modules/**'], {base: 'src'})
    ).pipe(zip('archive.zip'))
        //.pipe(lambda(lambda_params, opts))
        .pipe(lambda(lambda_params.FunctionName, opts))
        .pipe(gulp.dest('dist/'));
});
