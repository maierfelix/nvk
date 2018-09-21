import addon from "./generated/1.1.82.0/build/Release/addon.node";

const enums = addon.getVulkanEnumerations();

let out = {};

Object.assign(out, addon);
Object.assign(out, enums);

export default out;
