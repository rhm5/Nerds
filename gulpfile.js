"use strict";



var gulp = require("gulp"),
    sync = require("browser-sync").create(),
    less = require("gulp-less"),
    postcss = require("gulp-postcss"),
    prefixer = require("autoprefixer"),
    mqpacker = require("css-mqpacker"),
    csso = require("gulp-csso"),
    uglify = require("gulp-uglify"),
    imagemin = require("gulp-imagemin"),
    imageminJpegRecompress = require('imagemin-jpeg-recompress'),
    pngquant = require('imagemin-pngquant'),
    cache = require('gulp-cache'),
    spritesmith = require("gulp.spritesmith"),
    svgmin = require("gulp-svgmin"),
    svgstore = require("gulp-svgstore"),
    posthtml = require("gulp-posthtml"),
    include = require("posthtml-include"),
    rigger = require("gulp-rigger"),
    webp = require("gulp-webp"),
    rename = require("gulp-rename"),
    plumber = require("gulp-plumber"),
    run = require("run-sequence"),
    newer = require("gulp-newer"),
    del = require("del"),
    log = require("fancy-log");
    //ghPages = require("gulp-gh-pages");



var path = {
  build:{
    html: "build/",
    css: "build/css/",
    js: "build/js/",
    img: "build/img/",
    fonts: "build/fonts/"
  },
  src:{
    html: "src/*.html",
    less: "src/less/style.less",
    js: "src/js/**/*.js",
    img: ["!src/img/icons/**/*.*", "src/img/**/*.*"],
    sprite: "src/img/icons/*.png",
    spritesvg: "src/img/*.svg",
    fonts: "src/fonts/**/*.{woff,woff2}"
  },
  watch:{
    html: "src/*.html",
    less: "src/less/**/*.less",
    js: "src/js/**/*.js",
    img: ["!src/img/icons/**/*.*", "src/img/**/*.*"],
    sprite: "src/img/icons/*.png",
    spritesvg: "src/img/*.svg",
    fonts: "src/fonts/**/*.{woff,woff2}"
  },
  clean: ["build/**/*.*"]
  //deploy: ["build/**/*.*"]
};


gulp.task("html", function(){
  return gulp.src(path.src.html)
  .pipe(gulp.dest(path.build.html))
  .on("end", sync.reload);
});


gulp.task("style", function(){
  return gulp.src(path.src.less)
  .pipe(plumber(function(error){
    log.error(error);
    this.emit("end");
  }))
  .pipe(less())
  .pipe(postcss([
    prefixer({browsers: ["last 5 versions"]}),
    mqpacker({sort: true})
  ]))
  .pipe(gulp.dest(path.build.css))
  .pipe(csso())
  .pipe(rename({suffix: ".min"}))
  .pipe(gulp.dest(path.build.css))
  .pipe(sync.stream());
});

 

gulp.task("js", function(){
  gulp.src(path.src.js)
  .pipe(rigger())
  .pipe(gulp.dest(path.build.js))
  .pipe(rename({ suffix: ".min" }))
  .pipe(uglify())
  .pipe(gulp.dest(path.build.js))
  .pipe(sync.stream());
});



gulp.task("img", function(){
  return gulp.src(path.src.img)
  .pipe(newer(path.build.img))
  .pipe(gulp.dest(path.build.img))
  .pipe(sync.stream());
});

 
gulp.task("imgmin", ["img"], function() {
  return gulp.src("build/img/**/*.{jpg,png}")
    .pipe(cache(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imageminJpegRecompress({
        loops: 5,
        min: 80,
        max: 85,
        quality:"medium"
      }),
      imagemin.svgo(),
      imagemin.optipng({optimizationLevel: 3}),
      pngquant({quality: "80-85", speed: 5})
    ],{
      verbose: true
    })))
    .pipe(gulp.dest(path.build.img));
});

gulp.task("webp", function() {
  return gulp.src("img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build/img"));
});


gulp.task("clear", function (done) {
  return cache.clearAll(done);
});


gulp.task("sprite", function(){
    var spriteData =
    gulp.src(path.src.sprite)
    .pipe(spritesmith({
      imgName: "sprite.png",
      imgPath: "../img/" + "sprite.png",
      cssName: "sprite.less",
      cssFormat: "less",
      algorithm: "top-down",
      padding: 25,
      cssVarMap: function(sprite){
        sprite.name = "icon-" + sprite.name
      },
    }));
    spriteData.img.pipe(gulp.dest("src/img/"));
    spriteData.css.pipe(gulp.dest("src/less/"));
    return (spriteData.img, spriteData.css);
});


gulp.task("spritesvg", function(){
  return gulp.src(path.src.spritesvg)
  .pipe(svgmin())
  .pipe(svgstore({inlineSvg: true}))
  .pipe(rename("sprite.svg"))
  .pipe(gulp.dest(path.build.img))
  .pipe(sync.stream());
});


gulp.task("fonts", function(){
  return gulp.src(path.src.fonts)
  .pipe(newer(path.build.fonts))
  .pipe(gulp.dest(path.build.fonts))
  .pipe(sync.stream());
});


gulp.task("posthtml", function() {
  return gulp.src("*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build"))
    .pipe(sync.stream());
});


gulp.task("clean", function(){
  return del(path.clean, {read: false});
});



gulp.task("build", function(fn){
  run("clean", "html", "sprite", "style", "js", "imgmin", "clear", "spritesvg", "webp", "fonts", "posthtml", fn);
});



gulp.task("serve", function(){
  sync.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });
  gulp.watch(path.watch.html, ["html"]);
  gulp.watch(path.watch.less, ["style"]);
  gulp.watch(path.watch.js, ["js"]);
});


gulp.task("observer", function(){
  sync.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });
  gulp.watch(path.watch.html, ["html"]);
  gulp.watch(path.watch.less, ["style"]);
  gulp.watch(path.watch.js, ["js"]);
  gulp.watch(path.watch.img, ["imgmin"]);
  gulp.watch(path.watch.sprite, ["sprite"]);
  gulp.watch(path.watch.spritesvg, ["spritesvg"]);
  gulp.watch(path.watch.webp, ["webp"]);
  gulp.watch(path.watch.fonts, ["fonts"]);
});



gulp.task("deploy", function(fn){
  return gulp.src(path.deploy)
 .pipe(ghPages());
});



gulp.task("default", function(fn){
  run("build", "observer", fn);
});
