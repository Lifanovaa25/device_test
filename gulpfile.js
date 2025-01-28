const gulp = require("gulp");
const fileInclude = require("gulp-file-include");

const scss = require("gulp-sass")(require("sass"));

const server = require("gulp-server-livereload");

const clean = require("gulp-clean");
const fs = require("fs");

const sourceMaps = require("gulp-sourcemaps");

const groupMedia = require("gulp-group-css-media-queries");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const { error } = require("console");

const sourcemaps = require("gulp-sourcemaps"); // Source Maps
const babel = require("gulp-babel");
const concat = require("gulp-concat"); // объединение файлов в один

const ghPages = require("gulp-gh-pages"); //для git pages

const path = {
  scripts: {
    src: "./",
    dest: "./build",
  },
};

//перед каждой сборкой удаляем build
gulp.task("clean", function (done) {
  if (fs.existsSync("./build/")) {
    return gulp.src("./build/", { read: false }).pipe(clean());
  }
  done();
});
// Сборка HTML
const plumberHtmlConfig = {
  errorHeandler: notify.onError({
    title: "HTML",
    message: "Error <%= error.message %>",
    sound: false,
  }),
};
const fileIncludeSettings = {
  prefix: "@@",
  basepath: "@file",
};
gulp.task("html", function () {
  return gulp
    .src("./src/*.html")
    .pipe(plumber(plumberHtmlConfig)) //обработка ошибок
    .pipe(fileInclude(fileIncludeSettings))
    .pipe(gulp.dest("./build/"));
});

// Сборка CSS
const plumberScssConfig = {
  errorHeandler: notify.onError({
    title: "Styles",
    message: "Error <%= error.message %>",
    sound: false,
  }),
};
gulp.task("scss", function () {
  return gulp
    .src("./src/assets/scss/*.scss")
    .pipe(plumber(plumberScssConfig)) //обработка ошибок
    .pipe(sourceMaps.init())
    .pipe(scss())
    .pipe(groupMedia())
    .pipe(sourceMaps.write())
    .pipe(gulp.dest("./build/assets/css"));
});
gulp.task("css", function () {
  return gulp
    .src("./src/assets/bootstrap/scss/**/*.scss")
    .pipe(plumber(plumberScssConfig)) //обработка ошибок
    .pipe(sourceMaps.init())
    .pipe(scss())
    .pipe(groupMedia())
    .pipe(sourceMaps.write())
    .pipe(gulp.dest("./build/assets/bootstrap/css/"));
});


//сборка css bootstrap
//js
gulp.task("js", function () {
  return gulp
    .src("./src/assets/js/**/*.js")
    // .pipe(
    //   babel({
    //     presets: ["@babel/preset-env"],
    //   })
    // )
    .pipe(gulp.dest("./build/assets/js/"));
});
// Img
gulp.task("img", function () {
  return gulp
    .src("./src/assets/img/**/*")
    .pipe(gulp.dest("./build/assets/img"));
});
// fonts
gulp.task("fonts", function () {
  return gulp
    .src("./src/assets/fonts/**/*")
    .pipe(gulp.dest("./build/assets/fonts"));
});
// Сборка LiveServer
const serverOptions = {
  livereload: true,
  open: true,
};
gulp.task("server", function () {
  return gulp.src("./build/").pipe(server(serverOptions));
});

//отслеживание изменений + пересборка
gulp.task("watch", function () {
  gulp.watch("./src/assets/scss/**/*.css", gulp.parallel("css"));
  gulp.watch("./src/assets/scss/**/*.scss", gulp.parallel("scss"));
  gulp.watch("./src/assets/bootstrap/scss/**/*.scss", gulp.parallel("css"));
  gulp.watch("./src/assets/js/**/*.js", gulp.parallel("js"));
  gulp.watch("./src/**/*.html", gulp.parallel("html"));
  gulp.watch("./src/assets/img/**/*", gulp.parallel("img"));
  gulp.watch("./src/assets/fonts/**/*", gulp.parallel("fonts"));
});

// запуск сборки

gulp.task(
  "default",
  gulp.series(
    "clean",
    gulp.parallel("html",  "scss", "js", "img", "fonts"),
    gulp.parallel("server", "watch")
  )
);

gulp.task("deploy", function () {
  return gulp.src("./build/**/*").pipe(ghPages());
});
