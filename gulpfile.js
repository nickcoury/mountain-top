var gulp   = require('gulp');
var lambda = require('gulp-awslambda');
var zip    = require('gulp-zip');


/**
 * For uploading the first time.
 * Subsequent updates on a function that has already been created only
 * require the name of the function (see task below).
 */
var lambda_params = {
    FunctionName: 'strava-alexa',
    Role: '[YOUR LAMBDA EXEC ROLE HERE]'
};

var opts = {
    region: 'us-east-1'
};

gulp.task('lambda', function() {
    return gulp.src(['src/**'])
        .pipe(zip('archive.zip'))
        //.pipe(lambda(lambda_params, opts))
        .pipe(lambda(lambda_params.FunctionName, opts))
        .pipe(gulp.dest('.'));
});