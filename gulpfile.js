var gulp = require('gulp')
var nunjucks = require('gulp-nunjucks')
var sass = require('gulp-sass')
var sourcemap = require('gulp-sourcemaps')
var autoprefixer = require('gulp-autoprefixer')
// var scssLint = require('gulp-scss-lint')
var browserify = require('browserify')
var sourceStream = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var uglify = require('gulp-uglify')
var babelify = require('babelify')
var browserSync = require('browser-sync').create()
var gtil = require('gulp-util')
var clean = require('gulp-clean')
var runSequence = require('run-sequence')
var plumber = require('gulp-plumber')

var init = {
  srcPath: './src',
  destPath: './public'
}

gulp.task('html', () => {
  gulp.src([`${init.srcPath}/html/**/*.html`, `!${init.srcPath}/html/layout/*`])
      .pipe(nunjucks.compile().on('error', () => {
        gtil.log(`[${err.plugin}] There is an error from ${err.fileName}`)
      }))
      .pipe(gulp.dest(`${init.destPath}/`))
})

gulp.task('css', () => {
  gulp.src(`${init.srcPath}/scss/**/*.scss`)
      .pipe(plumber({
        handleError: err => {
        console.log(err)
        this.emit('end')
        }
      }))
      // .pipe(scssLint({ 'config': '.scss-lint.yml' }))
      .pipe(sourcemap.init())
      .pipe(sass({ outputStyle: 'compressed' }))
      .pipe(autoprefixer(['last 2 versions','ie > 9']))
      .pipe(sourcemap.write())
      .pipe(gulp.dest(`${init.destPath}/css`))
      .pipe(browserSync.stream())
})

gulp.task('js', () => {
  browserify({
    entries: `${init.srcPath}/js/main.js`,
    debug: false
  })
  .transform(babelify, { 'presets': ['@babel/preset-env'] })
  .transform(['glslify', { global: true }])
  .bundle().on('error', err => {
    console.log(err)
  })
  .pipe(sourceStream('main.js'))
  .pipe(buffer())
  .pipe(sourcemap.init())
  .pipe(uglify())
  .pipe(sourcemap.write())
  .pipe(gulp.dest(`${init.destPath}/js`))
})

gulp.task('browserSync', () => {
  browserSync.init({
    server: {
      baseDir: `${init.destPath}`
    },
    port: 8001
  })
})

gulp.task('watch', ['browserSync', 'css'], () => {
  gulp.watch(`${init.srcPath}/scss/**/*.scss`, ['css'])
  gulp.watch(`${init.srcPath}/js/**/*.js`, ['js']).on('change', () => browserSync.reload())
  gulp.watch(`${init.srcPath}/html/**/*.html`, ['html']).on('change', () => browserSync.reload())
  gulp.watch(`${init.srcPath}/js/**/**/*.vert`, ['js']).on('change', () => browserSync.reload())
  gulp.watch(`${init.srcPath}/js/**/**/*.frag`, ['js']).on('change', () => browserSync.reload())
})

gulp.task('clean', () => {
  gulp.src(`${init.destPath}/*`)
      .pipe(clean())
})

gulp.task('default', ['html', 'css', 'js'])

gulp.task('deploy', (callback) => {
  runSequence('clean', 'html', 'css', 'js', callback)
})