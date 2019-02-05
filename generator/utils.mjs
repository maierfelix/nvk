import fs from "fs";
import toposort from "toposort";

export function warn() {
  let args = [];
  for (let ii = 0; ii < arguments.length; ++ii) args.push(arguments[ii]);
  let str = args.join(", ");
  console.log(`\x1b[33m%s\x1b[0m`, `Warning: ${str}`);
};

export function error() {
  let args = [];
  for (let ii = 0; ii < arguments.length; ++ii) args.push(arguments[ii]);
  let str = args.join(", ");
  process.stderr.write(`\x1b[31mError: ${str}\n\x1b[0m`);
};

export function formatIntToHex(n) {
  let h = parseInt(n.toString(16));
  let sign = h < 0 ? `-` : ``;
  let abs = Math.abs(h);
  return `${sign}0x${abs}`;
};

export function getFileNameFromPath(path) {
  let filePath = path.substr(path.lastIndexOf("/") + 1);
  let fileName = filePath.substr(0, filePath.indexOf("."));
  return fileName;
};

export function formatVkVersion(version) {
  let split = version.split(".");
  if (split.length > 3) {
    let subv = split[3];
    // .0 at version end is ignored, pop it
    if (subv === "0" || subv === "1") {
      split.pop();
      return split.join(".");
    } else {
      warn(`Version ${version} has unsupported formatting`);
    }
  }
  return version;
};

export function getLunarVkVersion(version) {
  let split = version.split(".");
  if (split.length === 3) {
    // insert a .0 at end
    split.push("0");
    return split.join(".");
  }
  return version;
};

export function getLunarVkSDKPath() {
  let envSDKPath = process.env.VK_SDK_PATH;
  let path = envSDKPath.substr(0, envSDKPath.lastIndexOf(`\\`));
  return path.replace(/\\/g, `/`);
};

export function resolveLunarVkSDKPath(vkVersion) {
  let VK_SDK_PATH = getLunarVkSDKPath();
  let indices = [...Array(10)].map((v, i) => i);
  let sdkPath = VK_SDK_PATH + `/` + vkVersion;
  if (!fs.existsSync(sdkPath)) {
    // x.x.x.0-9
    for (let index of indices) {
      sdkPath = VK_SDK_PATH + `/` + vkVersion + `.${index}`;
      if (fs.existsSync(sdkPath)) return sdkPath;
    };
  }
  return sdkPath;
};

export function removeDuplicates(array, condition) {
  let out = array.filter((item, index, self) =>
    index === self.findIndex((t) => condition(item, t))
  );
  array.length = 0;
  out.map(item => { array.push(item); });
};

export function getSortedIncludes(includes) {
  let out = [];
  removeDuplicates(
    includes,
    (item, t) => t.name === item.name && t.include === item.include
  );
  includes = includes.map(item => [item.name, item.include]);
  out = toposort(includes).reverse();
  return out;
};

export function getNodeByName(name, nodes) {
  for (let ii = 0; ii < nodes.length; ++ii) {
    let node = nodes[ii];
    if (node.name === name) return node;
  };
  return null;
};

// shouldnt be necessary, but this method
// auto-generates the sType name by a struct's name
export function getAutoStructureType(name) {
  let out = ``;
  // ohhohoo ahhaaahaa iiiiiiididfsndfrg
  let rx = /(?<!(^|[A-Z0-9]))(?=[A-Z0-9])|(?<!(^|[^A-Z]))(?=[0-9])|(?<!(^|[^0-9]))(?=[A-Za-z])|(?<!^)(?=[A-Z][a-z])/gm;
  let values = [];
  let splits = name.split(rx);
  splits.map(v => {
    if (v) {
      if (v === `Vk`) out += `VK_STRUCTURE_TYPE_`;
      else values.push(v);
    }
  });
  out += values.join(`_`).toUpperCase();
  // merge e.g. 8_BIT => 8BIT
  out = out.replace(/(_BIT)/gm, `BIT`);
  return out;
};

export function isNumericReferenceType(type) {
  switch (type) {
    case "float *":
    case "int8_t *":
    case "int16_t *":
    case "int32_t *":
    case "uint8_t *":
    case "uint16_t *":
    case "uint32_t *":
    case "uint64_t *":
    case "const float *":
    case "const int8_t *":
    case "const int16_t *":
    case "const int32_t *":
    case "const uint8_t *":
    case "const uint16_t *":
    case "const uint32_t *":
    case "const uint64_t *":
      return true;
    break;
  };
  return false;
};

export function isIgnoreableType(obj) {
  let type = obj.rawType;
  // dont ignore
  if (isPNextMember(obj)) return false;
  // ignore just for now
  if (type.substr(0, 4) === "PFN_") return true;
  if (type.substr(type.length - 4, type.length) === "2KHR") return true;
  return (
    type === "const SECURITY_ATTRIBUTES *" ||
    type === "struct AHardwareBuffer *" ||
    type === "void *" ||
    type === "const void *" ||
    type === "struct ANativeWindow *" ||
    type === "MirSurface *" ||
    type === "MirConnection *" ||
    type === "struct wl_display *" ||
    type === "struct wl_surface *" ||
    type === "Window" ||
    type === "xcb_connection_t *" ||
    type === "xcb_window_t" ||
    type === "Display *" ||
    type === "HWND" ||
    type === "HANDLE" ||
    type === "HANDLE *" ||
    type === "DWORD" ||
    type === "LPCWSTR" ||
    type === "HINSTANCE"
  );
};

export function isPNextMember(member) {
  return member.name === `pNext` && member.isVoidPointer;
};
