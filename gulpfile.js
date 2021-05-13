const {
  src,
  dest,
  parallel,
  series,
  watch
} = require('gulp');
const browserSync = require('browser-sync').create();
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const replace = require('gulp-replace');
const rename = require('gulp-rename');
const fs = require('fs');
const del = require('del');
const newer = require('gulp-newer');
const pug = require('gulp-pug');
const pugLinter = require('gulp-pug-linter');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const groupMedia = require("gulp-group-css-media-queries");
const csso = require('gulp-csso');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const imagemin = require('gulp-imagemin');
const svgSprite = require('gulp-svg-sprite');
const yargs = require('yargs');
const gulpif = require('gulp-if');
const argv = yargs.argv;
const production = !!argv.production;

const path = {
  pages: {
    src: ['./src/pages/*.pug',
      '!./src/pages/**/_*.pug'
    ],
    dist: "./dist",
    watch: './src/pages/**/*.pug',
  },
  styles: {
    src: './src/styles/main.{scss,sass}',
    dist: './dist/styles/',
    watch: './src/styles/**/*.{scss,sass}',
  },
  scripts: {
    src: './src/js/main.js',
    dist: './dist/js',
    watch: './src/js/**/*.js',
  },
  resources: {
    src: './src/resources/**',
    dist: './dist',
    watch: './src/resources/**',
  },
  fonts: {
    src: './src/fonts/**.ttf',
    dist: './dist/fonts/',
    watch: './src/fonts/**.ttf',
  },
  images: {
    src: [
      './src/images/**/*.{jpg,jpeg,png,svg,gif,ico,webp}',
      '!./src/images/sprites/**'
    ],
    dist: './dist/images',
    watch: './src/images/**/*.{jpg,jpeg,png,svg,gif,ico,webp}',
  },
  sprites: {
    src: './src/images/sprites/**.svg',
    dist: './dist/images/',
    watch: './src/images/sprites/**.svg',
  }
};

// Pages
const pages = () => {
  return src(path.pages.src)
    .pipe(plumber({
      errorHandler: onError
    }))

    .pipe(pugLinter({
      reporter: 'default'
    }))
    .pipe(pug())
    .pipe(gulpif(production, replace(".css", ".min.css")))
    .pipe(gulpif(production, replace(".js", ".min.js")))
    .pipe(dest(path.pages.dist))
    .pipe(browserSync.stream());
}

// Styles
const styles = () => {
  return src(path.styles.src)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(gulpif(!production, sourcemaps.init()))
    .pipe(sass({
      includePaths: ['node_modules'],
      outputStyle: 'expanded'
    }))
    .pipe(autoprefixer({
      cascade: false,
    }))
    .pipe(gulpif(!production, sourcemaps.write()))
    .pipe(groupMedia())
    .pipe(gulpif(production, csso()))
    .pipe(gulpif(production, rename({
      suffix: ".min"
    })))
    .pipe(dest(path.styles.dist))
    .pipe(browserSync.stream());
}

// Scripts
webpackConfig.mode = production ? "production" : "development";
webpackConfig.devtool = production ? false : "source-map";

const scripts = () => {
  return src(path.scripts.src)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(webpackStream(webpackConfig), webpack)
    .pipe(gulpif(production, rename({
      suffix: ".min"
    })))
    .pipe(dest(path.scripts.dist))
    .pipe(browserSync.stream());
}

// Resources
const resources = () => {
  return src(path.resources.src)
    .pipe(dest(path.resources.dist))
}

// Fonts
const fonts = () => {
  src(path.fonts.src)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(dest(path.fonts.dist))
    .pipe(ttf2woff())
    .pipe(dest(path.fonts.dist))
  return src(path.fonts.src)
    .pipe(ttf2woff2())
    .pipe(dest(path.fonts.dist))
}

// Fonts to font-face
const checkWeight = (fontname) => {
  let weight = 400;
  switch (true) {
    case /Thin/.test(fontname):
      weight = 100;
      break;
    case /ExtraLight/.test(fontname):
      weight = 200;
      break;
    case /Light/.test(fontname):
      weight = 300;
      break;
    case /Regular/.test(fontname):
      weight = 400;
      break;
    case /Medium/.test(fontname):
      weight = 500;
      break;
    case /SemiBold/.test(fontname):
      weight = 600;
      break;
    case /Semi/.test(fontname):
      weight = 600;
      break;
    case /Bold/.test(fontname):
      weight = 700;
      break;
    case /ExtraBold/.test(fontname):
      weight = 800;
      break;
    case /Heavy/.test(fontname):
      weight = 700;
      break;
    case /Black/.test(fontname):
      weight = 900;
      break;
    default:
      weight = 400;
  }
  return weight;
}

const cb = () => {}

let srcFonts = './src/styles/base/_fonts.scss';
let distFonts = './dist/fonts/';

const fontStyle = (done) => {
  let file_content = fs.readFileSync(srcFonts);

  fs.writeFile(srcFonts, '', cb);
  fs.readdir(distFonts, function (err, items) {
    if (items) {
      let c_fontname;
      for (var i = 0; i < items.length; i++) {
        let fontname = items[i].split('.');
        fontname = fontname[0];
        let font = fontname.split('-')[0];
        let weight = checkWeight(fontname);

        if (c_fontname != fontname) {
          fs.appendFile(srcFonts, '@include font-face("' + font + '", "' + fontname + '", ' + weight + ');\r\n', cb);
        }
        c_fontname = fontname;
      }
    }
  })

  done();
}

// Images
const images = () => {
  return src(path.images.src)
    .pipe(newer(path.images.dist))
    .pipe(imagemin([
      imagemin.gifsicle({
        interlaced: true
      }),
      imagemin.mozjpeg({
        quality: 75,
        progressive: true
      }),
      imagemin.optipng({
        optimizationLevel: 5
      }),
      imagemin.svgo({
        plugins: [{
            removeViewBox: false
          },
          {
            cleanupIDs: false
          }
        ]
      })
    ]))
    .pipe(dest(path.images.dist))
}

// SVG sprites
const sprites = () => {
  return src(path.sprites.src)
    .pipe(imagemin([
      imagemin.svgo({
        plugins: [{
            removeViewBox: false
          },
          {
            removeUselessStrokeAndFill: true
          }
        ]
      })
    ]))
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: "../sprite.svg"
        }
      }
    }))
    .pipe(dest(path.sprites.dist))
}

// Error handling
const onError = function (err) {
  notify.onError({
    title: "Error in " + err.plugin,
    message: err.message
  })(err);
  this.emit('end');
}

// Clean
const clean = () => {
  return del(['./dist'])
}

// Watch files
const watchFiles = (cb) => {
  browserSync.init({
    server: {
      baseDir: "./dist"
    },
    port: 3000,
    notify: false
  })

  watch(path.pages.watch, pages);
  watch(path.styles.watch, styles);
  watch(path.scripts.watch, scripts);
  watch(path.resources.watch, resources);
  watch(path.fonts.watch, fonts);
  watch(path.fonts.watch, fontStyle);
  watch(path.images.watch, images)
  watch(path.sprites.watch, sprites);

  return cb()
}

// Exports
exports.clean = clean;
exports.pages = pages;
exports.styles = styles;
exports.scripts = scripts;
exports.fonts = fonts;
exports.fontStyle = fontStyle;
exports.watchFiles = watchFiles;

exports.default = series(clean, parallel(pages, scripts, fonts, resources, images, sprites), fontStyle, styles, watchFiles);
exports.prod = series(clean, parallel(pages, scripts, fonts, resources, images, sprites), fontStyle, styles);
