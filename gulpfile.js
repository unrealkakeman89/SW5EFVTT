const gulp = require("gulp");
const less = require("gulp-less");
const through = require('through2');
const fs = require('fs');

/* ----------------------------------------- */
/*  Constants
/* ----------------------------------------- */

const src = "./src/"
const dest = "./dist/"

const foundryDest = (process.platform === "win32" ? process.env.LOCALAPPDATA : process.env.HOME + (process.platform === "darwin" ? "" : "/.local/share")) + "/FoundryVTT/Data/systems/sw5e/";

/* ----------------------------------------- */
/*  Compile LESS
/* ----------------------------------------- */

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

async function copySystemTemplate() {
  return new Promise ((resolve, reject) => {
    gulp.src(src + "system.json").pipe(gulp.dest(dest));
    gulp.src(src + "template.json").pipe(gulp.dest(dest));
    resolve();
  });
}

async function copyLang() {
  return new Promise ((resolve, reject) => {
    gulp.src(src + "lang/**").pipe(gulp.dest(dest + "lang/"));
    resolve();
  });
}

async function copyJS() {
  return new Promise ((resolve, reject) => {
    gulp.src(src + "sw5e.js").pipe(gulp.dest(dest));
    gulp.src(src + "module/**").pipe(gulp.dest(dest + "module/"));
    resolve();
  });
}

async function copyTemplates() {
  return new Promise ((resolve, reject) => {
    gulp.src(src + "templates/**").pipe(gulp.dest(dest + "templates/"));
    resolve();
  });
}

async function copyRemaining() {
  return new Promise ((resolve, reject) => {
    gulp.src("README.md").pipe(gulp.dest(dest));
    gulp.src(src + "fonts/**").pipe(gulp.dest(dest + "fonts/"));
    gulp.src(src + "packs/icons/**").pipe(gulp.dest(dest + "packs/Icons"));
    gulp.src(src + "ui/**").pipe(gulp.dest(dest + "ui/"));
    resolve();
  });
}

const copy = gulp.parallel(copySystemTemplate, copyLang, copyJS, copyTemplates, copyRemaining)

/* ----------------------------------------- */
/*  build
/* ----------------------------------------- */

const build = gulp.parallel(css, compilePacks, copy)

/* ----------------------------------------- */
/*  Send to foundry
/* ----------------------------------------- */

async function sendCSSToFoundry() {
  return new Promise ((resolve, reject) => {
    gulp.src(dest + "*.css").pipe(gulp.dest(foundryDest));
    resolve();
  });
}

async function sendSystemTemplateToFoundry() {
  return new Promise ((resolve, reject) => {
    gulp.src(dest + "*.json").pipe(gulp.dest(foundryDest));
    resolve();
  });
}

async function sendLangToFoundry() {
  return new Promise ((resolve, reject) => {
    gulp.src(dest + "lang/**").pipe(gulp.dest(foundryDest + "lang"));
    resolve();
  });
}

async function sendJSToFoundry() {
  return new Promise ((resolve, reject) => {
    gulp.src(dest + "sw5e.js").pipe(gulp.dest(foundryDest));
    gulp.src(dest + "module/**").pipe(gulp.dest(foundryDest + "module"));
    resolve();
  });
}

async function sendPacksToFoundry() {
  return new Promise ((resolve, reject) => {
    gulp.src(dest + "packs/packs/**").pipe(gulp.dest(foundryDest + "packs/packs"));
    resolve();
  });
}

async function sendTemplatesToFoundry() {
  return new Promise ((resolve, reject) => {
    gulp.src(dest + "templates/**").pipe(gulp.dest(foundryDest + "templates"));
    resolve();
  });
}

async function sendRemainingToFoundry() {
  return new Promise ((resolve, reject) => {
    gulp.src(dest + "README.md").pipe(gulp.dest(foundryDest));
    gulp.src(dest + "fonts/**").pipe(gulp.dest(foundryDest + "fonts"));
    gulp.src(dest + "packs/Icons/**").pipe(gulp.dest(foundryDest + "packs/Icons"));
    gulp.src(dest + "ui/**").pipe(gulp.dest(foundryDest + "ui"));
    resolve();
  });
}

const foundry = gulp.series(build, gulp.parallel(sendCSSToFoundry, sendSystemTemplateToFoundry, sendLangToFoundry, sendJSToFoundry, sendPacksToFoundry, sendTemplatesToFoundry, sendRemainingToFoundry));

/* ----------------------------------------- */
/*  Watch Updates
/* ----------------------------------------- */

function watchUpdates() {
  gulp.watch([src + "less/**/*.less"], gulp.series(css, sendCSSToFoundry));
  gulp.watch([src + "system.json", src + "template.json"], gulp.series(copySystemTemplate, sendSystemTemplateToFoundry));
  gulp.watch([src + "lang/**"], gulp.series(copyLang, sendLangToFoundry));
  gulp.watch([src + "sw5e.js", src + "module/**"], gulp.series(copyJS, sendJSToFoundry));
  gulp.watch([src + "packs/packs/**"], gulp.series(compilePacks, sendPacksToFoundry));
  gulp.watch([src + "templates/**"], gulp.series(copyTemplates, sendTemplatesToFoundry));
}

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

exports.default = build;
exports.foundry = foundry;
exports.watch = gulp.series(foundry, watchUpdates);
