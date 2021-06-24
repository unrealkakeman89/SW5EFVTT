const gulp = require("gulp");
const less = require("gulp-less");

/* ----------------------------------------- */
/*  Constants
/* ----------------------------------------- */

const src = "./src/"
const dest = "./dist/"

/* ----------------------------------------- */
/*  Compile LESS
/* ----------------------------------------- */

const SW5E_LESS = [src + "less/**/*.less"];

function compileLESS() {
  return gulp.src(src + "less/original/sw5e.less")
      .pipe(less())
      .pipe(gulp.dest(dest));
}

function compileGlobalLess() {
  return gulp.src(src + "less/update/sw5e-global.less")
      .pipe(less())
      .pipe(gulp.dest(dest));
}

function compileLightLess() {
  return gulp.src(src + "less/update/sw5e-light.less")
      .pipe(less())
      .pipe(gulp.dest(dest));
}

function compileDarkLess() {
  return gulp.src(src + "less/update/sw5e-dark.less")
      .pipe(less())
      .pipe(gulp.dest(dest));
}

const css = gulp.parallel(compileLESS, compileGlobalLess, compileLightLess, compileDarkLess);

/* ----------------------------------------- */
/*  Copy Files
/* ----------------------------------------- */

const SW5E_COPY = [src + "**", "!" + src + "less/**/*.less"]

async function copy() {
  return new Promise((resolve, reject) => {
    gulp.src("README.md").pipe(gulp.dest(dest));
    gulp.src(src + "system.json").pipe(gulp.dest(dest));
    gulp.src(src + "template.json").pipe(gulp.dest(dest));
    gulp.src(src + "sw5e.js").pipe(gulp.dest(dest));
    gulp.src(src + "fonts/**").pipe(gulp.dest(dest + "fonts/"));
    gulp.src(src + "lang/**").pipe(gulp.dest(dest + "lang/"));
    gulp.src(src + "module/**").pipe(gulp.dest(dest + "module/"));
    gulp.src(src + "packs/**").pipe(gulp.dest(dest + "packs/"));
    gulp.src(src + "templates/**").pipe(gulp.dest(dest + "templates/"));
    gulp.src(src + "ui/**").pipe(gulp.dest(dest + "ui/"));
    resolve();
  });
}

/* ----------------------------------------- */
/*  build
/* ----------------------------------------- */

const build = gulp.parallel(css, copy)

/* ----------------------------------------- */
/*  Watch Updates
/* ----------------------------------------- */

function watchUpdates() {
  gulp.watch(SW5E_LESS, css);
  gulp.watch(SW5E_COPY, copy);
}

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

exports.default = build;
exports.watch = watchUpdates;
