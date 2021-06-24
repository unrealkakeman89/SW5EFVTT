const gulp = require("gulp");
const less = require("gulp-less");
const through = require('through2');
const fs = require('fs');

/* ----------------------------------------- */
/*  Constants
/* ----------------------------------------- */

const src = "./src/"
const dest = "./dist/"

const foundryDest = process.env.LOCALAPPDATA + "/FoundryVTT/Data/systems/sw5e";

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
/*  Compile packs
/* ----------------------------------------- */

const SW5E_PACKS = [src + "packs/packs/**"]

function jsonToDB() {
  return through.obj(async (chunk, enc, cb) => {
    let result = "";

    const files = await fs.promises.readdir(chunk.path);

    for( const file of files ) {
      result += JSON.stringify(JSON.parse(fs.readFileSync(chunk.path + "/" + file, "utf-8"))) + "\n";
    }

    chunk.contents = new Buffer(result);
    cb(null, chunk)
  })
}

function compilePacks() {
  return gulp.src(src + "packs/packs/*").pipe(jsonToDB()).pipe(gulp.dest(dest + "packs/packs"));
}

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
    gulp.src(src + "packs/icons/**").pipe(gulp.dest(dest + "packs/Icons"));
    gulp.src(src + "templates/**").pipe(gulp.dest(dest + "templates/"));
    gulp.src(src + "ui/**").pipe(gulp.dest(dest + "ui/"));
    resolve();
  });
}

/* ----------------------------------------- */
/*  build
/* ----------------------------------------- */

const build = gulp.parallel(css, compilePacks, copy)

/* ----------------------------------------- */
/*  Send to foundry
/* ----------------------------------------- */

async function copyToFoundry() {
  gulp.src(dest + "/**").pipe(gulp.dest(foundryDest));
}

const foundry = gulp.series(build, copyToFoundry);

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
exports.foundry = foundry;
exports.watch = watchUpdates;
