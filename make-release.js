const fs = require("fs");
const path = require("path");
const targz = require("targz");

const pkg = require("./package.json");

let vkVersion = process.env.npm_config_vkversion;
if (!vkVersion) throw `No specification version --vkversion specified!`;

let platform = process.env.npm_config_platform;
if (!platform) throw `No platform --platform specified!`;

function createRelease(platform) {
  console.log(`Creating ${platform} release..`);
  return new Promise(resolve => {
    let input = `${pkg.config.GEN_OUT_DIR}/${vkVersion}/${platform}`;
    let output = `releases/${vkVersion}/${pkg.version}/${platform}/${platform}.tar.gz`;

    if (!fs.existsSync(input)) throw `Invalid input directory: ${input}`;

    // reserve
    if (!fs.existsSync(`releases`)) fs.mkdirSync(`releases`);
    if (!fs.existsSync(`releases/${vkVersion}`)) fs.mkdirSync(`releases/${vkVersion}`);
    if (!fs.existsSync(`releases/${vkVersion}/${pkg.version}`)) fs.mkdirSync(`releases/${vkVersion}/${pkg.version}`);
    if (!fs.existsSync(`releases/${vkVersion}/${pkg.version}/${platform}`)) fs.mkdirSync(`releases/${vkVersion}/${pkg.version}/${platform}`);

    function ignore(name) {
      let ext = path.extname(name);
      switch (ext) {
        case ".json":
          if (path.basename(name) === "ast.json") {
            return true;
          }
        case ".gyp":
        case ".ts":
        case ".dylib":
        case ".node":
        case ".a":
        case ".dll":
          return false;
      };
      if (ext[0] === `.`) return true;
    };

    targz.compress({
      src: input,
      dest: output,
      tar: { ignore }
    }, err => {
      if (err) console.log(err);
      resolve();
    });
  });
};

(async function main() {

  if (platform === `*`) {
    await createRelease("win32");
    await createRelease("linux");
    await createRelease("darwin");
  } else {
    await createRelease(platform);
  }

  console.log("Done!");

})();
