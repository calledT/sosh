'use strict'

var $               = require('gulp-load-plugins')();
var _               = require('lodash');
var fs              = require('fs');
var del             = require('del');
var gulp            = require('gulp');
var path            = require('path');
var merge           = require('merge-stream');
var runSequence     = require('run-sequence');
var browserSync     = require('browser-sync');
var autoprefixer    = require('autoprefixer');
var pkg             = require('./package.json');

var SRC_PATH         = 'src';
var ICONPREFIX       = 'icon';
var ICONFONTNAME     = 'soshfont';
var ICONFONTTEMPLATE = 'foundation-style';

// STATS
var SRC = _.mapKeys(pkg.src, function(value, key) {
  value.globext = path.join('*' + value.ext);
  value.globpath = path.join(value.dir, '**', value.globext);
  return key;
});

gulp.task('sass', function() {
  var processors = [autoprefixer({browsers: pkg.browsers})];

	var stream = gulp.src(SRC.scss.globpath)
			.pipe($.sourcemaps.init())
			.pipe($.sass({
				includePaths: [SRC.scss.dir],
				precision: 8
			}).on('error', $.sass.logError))
			.pipe($.postcss(processors))
			.pipe($.sourcemaps.write('./maps'))
			.pipe(gulp.dest(SRC.css.dir))
			.pipe($.if(SRC.css.globext, browserSync.stream()));

	return stream;
});

gulp.task('package', function() {
  var jsStream = gulp.src(['src/js/qrcode.js', 'src/js/sosh.js']);
  var cssStream = gulp.src('src/css/sosh.css')
      .pipe($.cssnano({compatibility: 'ie7'}))
      .pipe($.replace('../iconfont', './iconfont'))
      .pipe($.cssToJs());

  var stream = merge(jsStream, cssStream)
      .pipe($.concat('sosh.js'))
      .pipe($.uglify())
      .pipe(gulp.dest('dist'));

  return stream;
});

gulp.task('packagem', function() {
  var jsStream = gulp.src('src/js/msosh.js');
  var cssStream = gulp.src('src/css/msosh.css')
      .pipe($.cssnano())
      .pipe($.replace('../iconfont', './iconfont'))
      .pipe($.cssToJs());

  var stream = merge(jsStream, cssStream)
      .pipe($.concat('msosh.js'))
      .pipe($.uglify())
      .pipe(gulp.dest('dist'));

  return stream;
});

gulp.task('iconfont', function() {
  var stream = gulp.src(SRC.iconsvg.globpath)
      .pipe($.imagemin({
        svgoPlugins: [{transformsWithOnePath: true}]
      }))
      .pipe($.iconfont({
        fontName: ICONFONTNAME,
        appendUnicode: true,
        formats: ['ttf', 'eot', 'woff', 'woff2', 'svg'],
        timestamp: 0
      }))
      .on('glyphs', function(glyphs) {
        var options = {
          glyphs: glyphs.map(function(glyph) {
            return {name: glyph.name, codepoint: glyph.unicode[0].charCodeAt(0)}
          }),
          fontName: ICONFONTNAME,
          fontPath: '../iconfont/',
          className: ICONPREFIX
        };

        // 创建iconfont scss模块
        var cssTmplPath = path.join(SRC.iconsvg.dir, 'template', ICONFONTTEMPLATE + '.css');
        var htmlTmplPath = path.join(SRC.iconsvg.dir, 'template', ICONFONTTEMPLATE + '.html');
        gulp.src(cssTmplPath)
          .pipe($.consolidate('lodash', options))
          .pipe($.rename({basename: '_' + ICONFONTNAME, extname: '.scss'}))
          .pipe(gulp.dest(path.join(SRC.scss.dir, 'component')));

        // 创建示例页面
        gulp.src(cssTmplPath)
          .pipe($.consolidate('lodash', options))
          .pipe($.rename({basename: ICONFONTNAME}))
          .pipe(gulp.dest('src/sample'));

        gulp.src(htmlTmplPath)
          .pipe($.consolidate('lodash', options))
          .pipe($.rename({basename:'sample'}))
          .pipe(gulp.dest('src/sample'));
      })
      .pipe(gulp.dest(SRC.iconfont.dir));

  return stream;
});

gulp.task('move', function() {
  var iconfontStream = gulp.src(SRC.iconfont.globpath, {base: 'src'})
      .pipe(gulp.dest('dist'));

  var imgStream = gulp.src(SRC.img.globpath, {base: 'src'})
      .pipe($.imagemin())
      .pipe(gulp.dest('dist'));

  return merge(iconfontStream, imgStream);
})

gulp.task('clean', function(cb) {
  del('dist', cb());
})

gulp.task('serve', ['iconfont'], function(cb) {
	browserSync.init({
		open: 'external',
    startPath: 'html',
		server: {baseDir: ['src', 'dist']}
	});

	gulp.watch(SRC.scss.globpath, ['sass']);
  gulp.watch(SRC.js.globpath, browserSync.reload);
	gulp.watch(SRC.html.globpath, browserSync.reload);
});

gulp.task('build', function(cb) {
  runSequence(['iconfont', 'sass', 'clean'], ['package', 'packagem', 'move'], cb);
});
