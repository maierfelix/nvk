import fs from "fs";

import generateEnums from "./generate-enums";
import generateIndex from "./generate-index";
import generateStruct from "./generate-struct";
import generateHandle from "./generate-handle";

let vk = JSON.parse(fs.readFileSync("./vk.json", "utf-8"));

let enums = vk.filter(node => node.kind === "ENUM");
let structs = vk.filter(node => node.kind === "STRUCT");
let handles = vk.filter(node => node.kind === "HANDLES")[0].children;

let includes = [];
let includeNames = [];

let baseIncludePath = `${` `.repeat(9)}"./generate/generated`;

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

function ignoreStruct(struct) {
  return !structWhiteList.includes(struct.name + ".h");
};

// generate structs
{
  structs.map(struct => {
    if (ignoreStruct(struct)) return;
    let result = generateStruct(struct);
    result.includes.map(incl => includes.push(incl));
    if (includes.indexOf(struct.name) <= -1) includes.push({ name: struct.name, include: "" });
    fs.writeFileSync(`./generated/${struct.name}.h`, result.header, "utf-8");
    fs.writeFileSync(`./generated/${struct.name}.cpp`, result.source, "utf-8");
  });
}

// generate handles
{
  handles.map(handle => {
    let result = generateHandle(handle);
    if (includes.indexOf(handle) <= -1) includes.push({ name: handle, include: "" });
    fs.writeFileSync(`./generated/${handle}.h`, result.header, "utf-8");
    fs.writeFileSync(`./generated/${handle}.cpp`, result.source, "utf-8");
  });
}

// generate enums
{
  let name = `enums`;
  let result = generateEnums(enums);
  fs.writeFileSync(`./generated/${name}.h`, result.source, "utf-8");
  includeNames.push(`${baseIncludePath}/${name}.h"`);
}

// generate includes
{
  structs.map(struct => {
    if (ignoreStruct(struct)) return;
    includeNames.push(`${baseIncludePath}/${struct.name}.cpp"`);
  });
  handles.map(handle => {
    includeNames.push(`${baseIncludePath}/${handle}.cpp"`);
  });
  // also add the index.cpp
  includeNames.push(`${baseIncludePath}/index.cpp"`);
  fs.writeFileSync(`./includeNames.txt`, includeNames.join(",\n"), "utf-8");
}

// generate index
{
  let indexFile = generateIndex(includes);
  fs.writeFileSync(`./generated/index.h`, indexFile.header, "utf-8");
  fs.writeFileSync(`./generated/index.cpp`, indexFile.source, "utf-8");
}
