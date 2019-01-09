const path = require("path");
const pkg = require("./package.json");
const readline = require("readline");
const { spawn } = require("child_process");

let logo = `32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,95,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,95,32,95,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,32,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,32,124,32,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,32,95,95,95,95,32,32,32,95,95,95,32,32,32,95,32,124,32,124,32,95,95,95,95,32,32,32,32,32,32,32,32,32,32,32,95,32,32,32,95,32,95,32,32,32,95,124,32,124,32,124,32,32,95,32,95,95,95,95,32,95,95,95,95,32,32,10,124,32,32,95,32,92,32,47,32,95,32,92,32,47,32,124,124,32,124,47,32,95,32,32,41,32,32,32,95,95,95,32,32,32,124,32,124,32,124,32,124,32,124,32,124,32,124,32,124,32,124,32,47,32,41,32,95,32,32,124,32,32,95,32,92,32,10,124,32,124,32,124,32,124,32,124,95,124,32,40,32,40,95,124,32,40,32,40,47,32,47,32,32,32,40,95,95,95,41,32,32,32,92,32,86,32,47,124,32,124,95,124,32,124,32,124,32,124,60,32,40,32,40,32,124,32,124,32,124,32,124,32,124,10,124,95,124,32,124,95,124,92,95,95,95,47,32,92,95,95,95,95,124,92,95,95,95,95,41,32,32,32,32,32,32,32,32,32,32,32,92,95,47,32,32,92,95,95,95,95,124,95,124,95,124,32,92,95,41,95,124,124,95,124,95,124,32,124,95,124,10,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32`;

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let isAnswerNo = answer => {
  answer = answer.toUpperCase();
  return answer === "N" || answer === "NO";
};
let isAnswerYes = answer => {
  answer = answer.toUpperCase();
  return answer === "Y" || answer === "YES";
};
let isVulkanVersion = version => {
  let split = version.split(".");
  if (split.length === 3) {
    return (!Number.isNaN(split[0]) && !Number.isNaN(split[1]) && !Number.isNaN(split[2]));
  }
  return false;
};

function blankLine() {
  console.log(``);
};

function goodbye() {
  blankLine();
  console.log(`If you want to manually build the bindings, navigate to nvk's package and follow the Install instructions in the README.md`);
  rl.close();
};

function setupBindings(version) {
  console.log(`Setting up bindings for version ${version} ..`);
  rl.close();
  generateBindings(version, success => {
    if (success) buildBindings(version, success => {
      if (success) {
        blankLine();
        console.log(`Complete!`);
        goodbye();
      }
    });
  });
};

function generateBindings(version, resolve) {
  blankLine();
  let cmd = `cd ${__dirname} & npm run generate -vkversion=${version}`;
  let shell = spawn(cmd, { shell: true, stdio: "inherit" }, { stdio: "pipe" });
  shell.on("exit", error => {
    if (!error) {
      console.log(`Successfully generated bindings!`);
      resolve(true);
    } else {
      console.log("Binding generation failed!");
      resolve(false);
    }
  });
};

function buildBindings(version, resolve) {
  blankLine();
  let cmd = `cd ${__dirname} & npm run build -vkversion=${version}`;
  let shell = spawn(cmd, { shell: true, stdio: "inherit" }, { stdio: "pipe" });
  shell.on("exit", error => {
    if (!error) {
      resolve(true);
    } else {
      console.log("Binding compilation failed!");
      resolve(false);
    }
  });
};

function askBindingsVersion() {
  let defaultVersion = pkg.config.POST_DEFAULT_BINDING_VERSION;
  blankLine();
  console.log(`The recommended Vulkan version to generate bindings for currently is: ${defaultVersion}`);
  rl.question(`Press [ENTER] to use the recommended version, or type in another version: [x.x.x] `, answer => {
    if (!answer.length) {
      setupBindings(defaultVersion);
    } else if (isVulkanVersion(answer)) {
      setupBindings(answer);
    } else {
      goodbye();
    }
  });
};

(function greet() {
  let chars = [];
  logo = logo.split(",").map(ch => ch | 0);
  let text = logo.map(ch => String.fromCharCode(ch)).join("");
  console.log(text);
})();

(function askAutoBuild() {
  console.log(`It seems like you just installed nvk v${pkg.version}`);
  rl.question(`Do you want me to automatically setup bindings for you? [y/N] `, answer => {
    if (isAnswerYes(answer)) {
      askBindingsVersion();
    } else {
      goodbye();
    }
  });
})();
