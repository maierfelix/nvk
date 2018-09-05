import fs from "fs";

import generateAST from "./generators/ast";
import generateCalls from "./generators/calls";
import generateEnums from "./generators/enums";
import generateIndex from "./generators/index";
import generateStructs from "./generators/structs";
import generateHandles from "./generators/handles";
import generateGyp from "./generators/gyp";

// input vars
let argsVersion = null;

let args = process.argv;
for (let ii = 2; ii < args.length; ++ii) {
  if (args[ii].charAt(0) === "-") {
    let cmd = args[ii + 0].substr(1, 2);
    let value = args[ii + 1];
    switch (cmd) {
      case "v":
      case "version":
        argsVersion = value || null;
        ii++;
      break;
    };
  }
};

// args error handling
if (!argsVersion) throw `No specification version specified!`;

const baseGeneratePath = `../generated`;
const generatePath = `${baseGeneratePath}/${argsVersion}`;
const generateSrcPath = `${generatePath}/src`;
const baseIncludePath = `"./generated/<(vkVersion)`;

// generated/
if (!fs.existsSync(baseGeneratePath)) fs.mkdirSync(baseGeneratePath);
// generated/version/
if (!fs.existsSync(generatePath)) fs.mkdirSync(generatePath);
// generated/version/src/
if (!fs.existsSync(generateSrcPath)) fs.mkdirSync(generateSrcPath);

// generate AST
let ast = null;
{
  console.log("Generating Vk ast..");
  let xmlInput = fs.readFileSync(`./specifications/${argsVersion}.xml`, "utf-8");
  ast = generateAST(xmlInput);
  let str = JSON.stringify(ast, null, 2);
  writeFile(`${generateSrcPath}/ast.json`, str, "utf-8");
}

let calls = ast.filter(node => node.kind === "COMMAND_PROTO");
let enums = ast.filter(node => node.kind === "ENUM");
let structs = ast.filter(node => node.kind === "STRUCT");
let handles = ast.filter(node => node.kind === "HANDLES")[0].children;

let includes = [];
let includeNames = [];

let structWhiteList = [
  "VkPhysicalDeviceFeatures.h",
  "VkDeviceQueueCreateInfo.h",
  "VkDeviceCreateInfo.h",
  "VkBindImagePlaneMemoryInfo.h",
  "VkImageSubresourceRange.h",
  "VkApplicationInfo.h",
  "VkInstanceCreateInfo.h",
  "VkBufferCreateInfo.h",
  "VkExtent2D.h",
  "VkOffset2D.h",
  "VkRect2D.h",
  "VkClearRect.h",
  "VkImageMemoryBarrier.h"
];

// bridged to only change the change data of a file if it's really necessary
// (the compiler seems to re-compile based on file changes..)
function writeFile(path, data, encoding) {
  let source = null;
  try {
    source = fs.readFileSync(path, encoding);
  } catch(e) {};
  if (source !== data) fs.writeFileSync(path, data, encoding);
};

function ignoreStruct(struct) {
  return !structWhiteList.includes(struct.name + ".h");
};

// generate structs
{
  console.log("Generating Vk structs..");
  structs.map(struct => {
    if (ignoreStruct(struct)) return;
    let result = generateStructs(struct);
    result.includes.map(incl => includes.push(incl));
    if (includes.indexOf(struct.name) <= -1) includes.push({ name: struct.name, include: "" });
    writeFile(`${generateSrcPath}/${struct.name}.h`, result.header, "utf-8");
    writeFile(`${generateSrcPath}/${struct.name}.cpp`, result.source, "utf-8");
  });
}

// generate handles
{
  console.log("Generating Vk handles..");
  handles.map(handle => {
    let result = generateHandles(handle);
    if (includes.indexOf(handle) <= -1) includes.push({ name: handle, include: "" });
    writeFile(`${generateSrcPath}/${handle}.h`, result.header, "utf-8");
    writeFile(`${generateSrcPath}/${handle}.cpp`, result.source, "utf-8");
  });
}

// generate enums
{
  console.log("Generating Vk enums..");
  let name = `enums`;
  let result = generateEnums(enums);
  writeFile(`${generateSrcPath}/${name}.h`, result.source, "utf-8");
}

// generate calls
{
  console.log("Generating Vk calls..");
  let name = `calls`;
  let result = generateCalls(calls);
  writeFile(`${generateSrcPath}/${name}.h`, result.source, "utf-8");
}

// generate includes
{
  console.log("Generating Vk includes..");
  structs.map(struct => {
    if (ignoreStruct(struct)) return;
    includeNames.push(`"./src/${struct.name}.cpp"`);
  });
  handles.map(handle => {
    includeNames.push(`"./src/${handle}.cpp"`);
  });
  // also add the index.cpp
  includeNames.push(`"./src/index.cpp"`);
}

// generate binding.gyp
{
  console.log("Generating binding.gyp..");
  let result = generateGyp(argsVersion, includeNames);
  writeFile(`${generatePath}/binding.gyp`, result.gyp, "utf-8");
}

// generate index
{
  console.log("Generating Vk index..");
  let indexFile = generateIndex(includes, calls);
  writeFile(`${generateSrcPath}/index.h`, indexFile.header, "utf-8");
  writeFile(`${generateSrcPath}/index.cpp`, indexFile.source, "utf-8");
}
