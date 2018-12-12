const { resolve } = require('path')
const { src, dest, watch, series, parallel } = require('gulp')
const ifG = require('gulp-if')
const Autoprefixer = require('gulp-autoprefixer')
const Babel = require('gulp-babel')
const CleanCSS = require('gulp-clean-css')
const Sass = require('gulp-sass')
const Pug = require('gulp-pug')
const Uglify = require('gulp-uglify')
const SourceMaps = require('gulp-sourcemaps')
const Critical = require('critical').stream
const Delete = require('delete')

const browserList = ['last 5 versions', 'ie >= 9', 'safari >= 7']
const destination = 'dist'

const ifProd = m => ifG(process.env.NODE_ENV === 'production', m)

Sass.compiler = require('node-sass')

const htmlPath = 'src/**/*.pug'
const html = () =>
  src(htmlPath)
    .pipe(Pug())
    .pipe(dest(destination))

const cssPath = 'src/**/*.scss'
const css = () =>
  src(cssPath)
    .pipe(SourceMaps.init())
    .pipe(Sass().on('error', Sass.logError))
    .pipe(CleanCSS())
    .pipe(Autoprefixer({ browsers: browserList }))
    .pipe(SourceMaps.write('.'))
    .pipe(dest(destination))

const jsPath = 'src/**/*.ts'
const js = () =>
  src(jsPath)
    .pipe(SourceMaps.init())
    .pipe(Babel())
    .pipe(
      ifProd(
        Uglify({
          toplevel: true,
        }),
      ),
    )
    .pipe(SourceMaps.write('.'))
    .pipe(dest(destination))

const restPaths = ['src/**/*.svg', 'src/**/*.ico']
const rest = () => src(restPaths).pipe(dest(destination))

const critical = () =>
  src('dist/*.html')
    .pipe(
      Critical({
        base: 'dist/',
        inline: true,
        width: 1800,
        height: 900,
      }),
    )
    .pipe(dest('dist'))

const clean = () => Delete.promise('dist/*')

exports.clean = clean

const ignoreInitial = false
exports.watch = cb => {
  watch(htmlPath, { ignoreInitial }, html)
  watch(cssPath, { ignoreInitial }, css)
  watch(jsPath, { ignoreInitial }, js)
  watch(restPaths, { ignoreInitial }, rest)
  cb()
}

exports.default = series(clean, parallel(html, css, js, rest))
