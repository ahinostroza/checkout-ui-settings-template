'use strict'

// PLUGINS GULP
const gulp = require('gulp'),
      uglify = require('gulp-uglify'),
      rename = require('gulp-rename'),
      postcss = require('gulp-postcss'),
      sprite = require('gulp.spritesmith'),
      streamify = require('gulp-streamify'),
      sourcemaps = require('gulp-sourcemaps'),
      sass = require('gulp-sass')(require('sass'))

// PLUGINS POSTCSS
const autoprefixer = require('autoprefixer'),
      cssnano = require('cssnano')

// PLUGINS OTHERS
const del = require('del'),
      browserify = require('browserify'),
      randomStr = require('randomstring'),
      source = require('vinyl-source-stream')

// VARIABLES
const imgDir = 'src/arquivos/sprite/*.*'
const sassDir = 'src/sass/**/*.scss'
const jsDir = 'src/js/index.js'
const spriteDir = 'src/arquivos'
const configDir = 'src/sass/_config'
const outDir = 'checkout-ui-custom'
const fileName = 'checkout6-custom'

gulp.task('clean', function () {
    return del([`${spriteDir}/*.png`], { force: true })
})

gulp.task('sprite', done => {
    const imgName = randomStr.generate({
        length: 6,
        capitalization: 'lowercase'
    })

    const spriteData = gulp.src(imgDir)
        .pipe(sprite({
            imgName: `sprite-${imgName}.png`,
            cssName: '_sprite.scss',
            algorithm: 'binary-tree',
            imgPath: `/arquivos/sprite-${imgName}.png`,
            cssVarMap: function (sprite) {
                sprite.name = 'sprite-' + sprite.name;
            }
        }))
    spriteData.img.pipe(gulp.dest(spriteDir))
    spriteData.css.pipe(gulp.dest(configDir))
    
    done()
})

gulp.task('sass', function() {
    var plugins = [
        autoprefixer(),
        cssnano()
    ]
    return gulp.src(sassDir)
        .pipe(sourcemaps.init())
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(postcss(plugins))
        .pipe(sourcemaps.write())
        .pipe(rename({ basename: fileName }))
        .pipe(gulp.dest(outDir))
})

gulp.task('js', function() {
    return browserify(jsDir, { debug: true })
            .transform('babelify', {
                presets: ['@babel/preset-env']
            })
            .bundle()
        .pipe(source(fileName + '.js'))
        .pipe(streamify(uglify()))
        .pipe(gulp.dest(outDir))
})

gulp.task('watch', function() {
    gulp.watch(imgDir, gulp.series('clean', 'sprite', 'sass'))
    gulp.watch(sassDir, gulp.series('sass'))
    gulp.watch(jsDir, gulp.series('js'))
})

gulp.task('default', gulp.series('clean', 'sprite', 'js', 'sass', 'watch'))
