require("babel-register")({
    presets: [ 'es2015' ]
});
const _ = require('lodash');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const watch = require('gulp-watch');
const gulpif = require('gulp-if');
const debug = require('gulp-debug');
const size = require('gulp-size');
const notify = require('gulp-notify');
const connect = require('gulp-connect');
const gutil = require('gulp-util');

const connectLiveReload = require('connect-livereload');
const liveReload = require('gulp-livereload');
// user api stuff, search and check if exists in 100k
// mounted in connect
// const app = require('./server');

const del = require('del');
const path = require('path');
const join = path.join,
        resolve = path.resolve;

const sass = require('gulp-sass');
const csso = require('gulp-csso');
const cmq = require('gulp-combine-mq');
const autoprefixer = require('gulp-autoprefixer');
const base64 = require('gulp-base64');

const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');

// js builds
const watchify = require('watchify');
const browserify = require('browserify');
const babelify = require('babelify');
const uglify = require('gulp-uglify');
const envify = require('envify/custom');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');

const BROWSER_CONFIG = ['> 1%', 'IE 9'];
const LIVERELOAD_PORT = process.env.LIVERELOAD_PORT || 35729;
const SERVER_PORT = process.env.PORT || 8080;


const ASSETS_DIR = './assets';
const ASSETS_SASS = join(ASSETS_DIR,'sass');

const ASSETS_SASS_MAIN = join(ASSETS_SASS, 'main.scss');

const ASSETS_JS = join(ASSETS_DIR,'js');
const ASSETS_JS_MAIN = join(ASSETS_JS, 'index.js');

// const ASSETS_HTML = join(ASSETS_DIR, 'html');
const ASSETS_IMG = join(ASSETS_DIR, 'images');
const ASSETS_FONTS = join(ASSETS_DIR, 'fonts');

const STATIC_DIR = './static';
const STATIC_CSS = join(STATIC_DIR, 'css');
const STATIC_IMG = join(STATIC_DIR, 'images');
const STATIC_FONTS = join(STATIC_DIR, 'fonts');
const STATIC_JS = join(STATIC_DIR, 'js');



const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function mountFolder(server, dir) {
    return server.static(resolve(dir));
}

const baseBrowserifyOptions = {
    // application entry points - if not using index, add here!
    entries: ASSETS_JS_MAIN,
    debug: !IS_PRODUCTION,
    cache: {},
    packageCache: {},
    plugin: [],
    // transform: [envify()]
};

if (!IS_PRODUCTION) {
    baseBrowserifyOptions.plugin = [watchify];
}

const compiler = browserify(baseBrowserifyOptions);

compiler.transform('babelify', {
    plugins: ['transform-object-rest-spread'],
    presets: ['es2015', 'react']
});
compiler.transform(envify({
    global: true,
    NODE_ENV: process.env.NODE_ENV,
    _: 'purge'
}),{
    global: true
});


compiler.on('log', gutil.log);
compiler.on('error', gutil.log);

compiler.on('update', function() {
    console.log.apply(console, ['Updated: '].concat([].slice.call(arguments)));
    bundle();
});

function bundle (){
    return compiler.bundle()
        // handle errors
        .on('error', notify.onError('Error: <%= error.message %>'))
        .on('error', function(err) {
            gutil.log(gutil.colors.red(`Error (${err.plugin}) - ${err.message}`));
            this.emit('end');
        })
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(gulpif(IS_PRODUCTION, uglify()))
        .pipe(size())
        .pipe(gulp.dest(STATIC_JS))
        .pipe(liveReload());
}

gulp.task('js', ['clean:js'],function(){
    return bundle();
    // return gulp.src(ASSETS_JS_MAIN)
    //         .pipe(sourcemaps.init())
    //         .pipe(traceur({
    //             // modules: 'commonjs'
    //         }))
    //         .pipe(concat('bundle.js'))
    //         .pipe(sourcemaps.write())
    //         .pipe(gulp.dest(STATIC_JS))
    //         .pipe(liveReload());
});



gulp.task('serve', ['watch'], function () {
    // connect.use(app);
    connect.server({
        root: STATIC_DIR,
        port: SERVER_PORT,
        middleware: function (server) {
            return [
                function (req, res, next) {
                    const isImage = (req.headers.accept.indexOf('image') !== -1);
                    if (isImage) {
                        res.setHeader('Expires', new Date(Date.now() + 86400000));
                        res.setHeader('Last-Modified', new Date(Date.now() - 86400000));
                        res.setHeader('Cache-Control', 'public');
                    }
                    next();
                },
                connectLiveReload({
                    port: LIVERELOAD_PORT
                }),
                mountFolder(server, STATIC_DIR),
            ]
        }
    });
});

function makeCleaner(path) {
    return function(done){
        del([
            path
        ]).then(function(paths) {
            console.log('Deleted files and folders:\n', paths.join('\n'));
            done();
        });
    }
}

// gulp.task('clean:html', makeCleaner(STATIC_DIR +'/**/*.html'));
gulp.task('clean:css', makeCleaner(STATIC_CSS +'/**/*'));
gulp.task('clean:img', makeCleaner(STATIC_IMG +'/**/*'));
gulp.task('clean:js', makeCleaner(STATIC_JS +'/**/*'));
gulp.task('clean:fonts', makeCleaner(STATIC_FONTS +'/**/*'));

gulp.task('clean', ['clean:css','clean:img','clean:fonts', 'clean:js']);

// gulp.task('html', ['clean:html'], function(){
//     return gulp.src(ASSETS_HTML+'/**/*.html')
//             .pipe(size())
//             .pipe(gulp.dest(STATIC_DIR))
//             .pipe(liveReload({port: LIVERELOAD_PORT}));
// });

gulp.task('assets', ['images','fonts']);

gulp.task('images', ['clean:img'], function() {
    return gulp.src(ASSETS_IMG + '/**/*.*')
                .pipe(gulp.dest(STATIC_IMG))
                .pipe(liveReload({port: LIVERELOAD_PORT}));
});

gulp.task('fonts', ['clean:fonts'], function() {
    return gulp.src(ASSETS_FONTS + '/**/*.*')
                .pipe(gulp.dest(STATIC_FONTS))
                .pipe(liveReload({port: LIVERELOAD_PORT}));
});

gulp.task('sass', ['clean:css'], function(){
    return gulp.src(ASSETS_SASS_MAIN)
            .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
            .on('error', function(err) {
                gutil.log(gutil.colors.red(`Error (${err.plugin}) - ${err.message}`));
                this.emit('end');
            })
            .pipe(sourcemaps.init())
            .pipe(sass())
            .pipe(base64({
                maxImageSize: 5000,
                extensions: ['svg', 'png', 'jpg', /\.jpg#datauri$/i]
            }))
            .pipe(autoprefixer(BROWSER_CONFIG))
            .pipe(cmq({
                beautify: false
            }))
            .pipe(csso())
            .pipe(size())
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(STATIC_CSS))
            .pipe(liveReload({port: LIVERELOAD_PORT}))

});

gulp.task('watch', function(){
    liveReload.listen();
    gulp.watch(ASSETS_SASS + '/**/*.scss',   ['sass']);
    gulp.watch(ASSETS_FONTS + '/**/*',       ['fonts']);
    // gulp.watch(ASSETS_HTML + '/**/*.html',   ['html']);
    gulp.watch(ASSETS_IMG + '/**/*',         ['images']);
    // gulp.watch(ASSETS_JS + '/**/*',          ['js']);
});


gulp.task('build', ['clean', 'js','sass', 'assets']);
gulp.task('default', ['sass','js','assets','serve', 'watch']);
