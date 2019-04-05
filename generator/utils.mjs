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

export function getLunarEnvironmentVariable() {
  let {platform} = process;
  return process.env.VULKAN_SDK;
};

export function getLunarVkSDKPath() {
  let {platform} = process;
  let envSDKPath = getLunarEnvironmentVariable();
  if (!envSDKPath) warn("Cannot resolve Vulkan SDK environment variable");
  if (platform === "win32") {
    let path = envSDKPath.substr(0, envSDKPath.lastIndexOf(`\\`));
    return path.replace(/\\/g, `/`);
  }
  else if (platform === "linux") {
    return envSDKPath;
  }
  else if (platform === "darwin") {
    let path = envSDKPath;
    path = path.substr(0, path.lastIndexOf(`/`) + 1);
    return path;
  }
  return "";
};

export function resolveLunarVkSDKPath(vkVersion) {
  let {platform} = process;
  let VK_SDK_PATH = getLunarVkSDKPath();
  let indices = [...Array(10)].map((v, i) => i);
  let sdkPath = VK_SDK_PATH + `/` + vkVersion;
  if (platform === "win32") {
    if (!fs.existsSync(sdkPath)) {
      // x.x.x.0-9
      for (let index of indices) {
        sdkPath = VK_SDK_PATH + `/` + vkVersion + `.${index}`;
        if (fs.existsSync(sdkPath)) return sdkPath;
      };
    }
  }
  else if (platform === "linux") {
    sdkPath = VK_SDK_PATH;
  }
  else if (platform === "darwin") {
    sdkPath = VK_SDK_PATH + `/macOS`;
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

// auto-generates the sType name by a struct's name
export function getAutoStructureType(name) {
  let out = ``;
  // ohhohoo ahhaaahaa iiiiiiididfsndfrg
  let rx = /(?<!(^|[A-Z0-9]))(?=[A-Z0-9])|(?<!(^|[^A-Z]))(?=[0-9])|(?<!(^|[^0-9]))(?=[A-Za-z])|(?<!^)(?=[A-Z][a-z])/gm;
  let values = [];
  let splits = name.split(rx);
  splits.map(value => {
    if (value) {
      if (value === `Vk`) out += `VK_STRUCTURE_TYPE_`;
      else values.push(value);
    }
  });
  out += values.join(`_`).toUpperCase();
  // merge e.g. 8_BIT => 8BIT
  out = out.replace(/(_BIT)/gm, `BIT`);
  return out;
};

export function getObjectInstantiationName(object) {
  let {name} = object;
  if (name.substr(0, 2).toUpperCase() !== `VK`) {
    warn(`Cannot extract instantiation name for object ${name}`);
    return ``;
  }
  let out = name.substr(2, name.length);
  if (object.kind === `STRUCT`) {
    let isInfo = out.match(`Info`);
    // remove 'CreateInfo' from name
    out = out.replace(`CreateInfo`, ``);
    // remove name'Info' from end
    if (out.substr(out.length - 4, out.length) === `Info`) {
      out = out.substr(0, out.length - 4);
    }
    out = out[0].toLowerCase() + out.slice(1);
    if (isInfo) out = out + `Info`;
  }
  else if (object.kind === `HANDLE`) {
    out = out[0].toLowerCase() + out.slice(1);
  }
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
    type === "struct AHardwareBuffer *" ||
    type === "struct ANativeWindow *" ||
    type === "MirSurface *" ||
    type === "MirConnection *" ||
    type === "struct wl_display *" ||
    type === "struct wl_surface *" ||
    type === "xcb_connection_t *" ||
    type === "xcb_window_t" ||
    type === "xcb_visualid_t" ||
    type === "Display *" ||
    type === "const SECURITY_ATTRIBUTES *" ||
    type === "DWORD"
  );
};

export function isPNextMember(member) {
  return member.name === `pNext` && member.isVoidPointer;
};

export function isCurrentPlatformSupportedExtension(extPlatform) {
  switch (process.platform) {
    case "win32":
      return isWin32SupportedExtension(extPlatform);
    case "linux":
      return isLinuxSupportedExtension(extPlatform);
    case "darwin":
      return isDarwinSupportedExtension(extPlatform);
  };
  warn(`Cannot resolve platform extension support for ${extPlatform}. Currently running on: ${process.platform}`);
  return false;
};

export function isDefaultPlatformSupportedExtension(platform) {
  return (
    platform === "default"
  );
};

export function isWin32SupportedExtension(platform) {
  return (
    isDefaultPlatformSupportedExtension(platform) ||
    platform === "win32"
  );
};

export function isLinuxSupportedExtension(platform) {
  return (
    isDefaultPlatformSupportedExtension(platform) ||
    isSupportedWSI(platform)
  );
};

export function isDarwinSupportedExtension(platform) {
  return (
    isDefaultPlatformSupportedExtension(platform) ||
    platform === "macos"
  );
};

export function isSupportedWSI(wsi) {
  let {platform} = process;
  // windows
  if (platform === "win32") {
    if (
      !wsi ||
      wsi === "win32"
    ) return true;
  }
  // linux
  if (platform === "linux") {
    if (
      wsi === "xcb" ||
      wsi === "xlib" ||
      wsi === "wayland"
    ) {
      let WSI = process.env.npm_config_wsi;
      if (WSI !== wsi) return false;
      return true;
    }
  }
  // darwin
  if (platform === "darwin") {
    if (
      !wsi ||
      wsi === "macos"
    ) return true;
  }
  return false;
};

export function getRequiredPlatformNativeInclude(ast) {
  let out = null;
  let {platform} = process;
  let includes = ast.filter(node => node.kind === "PLATFORM_INCLUDE");
  // windows
  if (platform === "win32") {
    let include = includes.filter(incl => incl.platform === platform)[0] || null;
    out = include;
  }
  // linux
  else if (platform === "linux") {
    let WSI = process.env.npm_config_wsi;
    let include = includes.filter(incl => incl.platform === WSI)[0] || null;
    out = include;
  }
  // darwin
  else if (platform === "darwin") {
    let include = includes.filter(incl => incl.platform === "macos")[0] || null;
    out = include;
  }
  if (!out) {
    warn(`Cannot resolve required platform includes for ${platform}`);
  }
  return out;
};

export function getPlatformRelevantGLFWIncludes() {
  let {platform} = process;
  // windows
  if (platform === "win32") {
    return `#define GLFW_EXPOSE_NATIVE_WIN32`;
  }
  // linux
  else if (platform === "linux") {
    let WSI = process.env.npm_config_wsi;
    if (WSI === "xcb") return `#define GLFW_EXPOSE_NATIVE_X11`;
    if (WSI === "xlib") return `#define GLFW_EXPOSE_NATIVE_X11`;
    if (WSI === "wayland") return `#define GLFW_EXPOSE_NATIVE_WAYLAND`;
  }
  return ``;
};

export function getPlatformRelevantIncludes(ast) {
  let out = ``;
  let incl = getRequiredPlatformNativeInclude(ast);
  if (incl) {
    out += `
${getPlatformRelevantGLFWIncludes()}
#include <GLFW/glfw3native.h>

#define ${incl.include}
#include <vulkan/vulkan_${incl.platform}.h>`;
  }
  return out;
};

export function getJavaScriptTypedArrayName(type) {
  switch (type) {
    case "void *":
    case "const void *":
      return `ArrayBuffer`;
    case "float *":
    case "const float *":
      return "Float32Array";
    case "int8_t *":
    case "const int8_t *":
      return "Int8Array";
    case "int16_t *":
    case "const int16_t *":
      return "Int16Array";
    case "int32_t *":
    case "const int32_t *":
      return "Int32Array";
    case "int64_t *":
    case "const int64_t *":
      return "BigInt64Array";
    case "uint8_t *":
    case "const uint8_t *":
      return "Uint8Array";
    case "uint16_t *":
    case "const uint16_t *": 
      return "Uint16Array";
    case "uint32_t *":
    case "const uint32_t *":
      return "Uint32Array";
    case "uint64_t *":
    case "const uint64_t *":
      return "BigUint64Array";
  };
  warn(`Cannot resolve equivalent JS typed array name for ${type}`);
  return null;
};

export function getNapiTypedArrayName(type) {
  switch (type) {
    case "ArrayBuffer":
      return `ArrayBuffer`;
    case "Float32Array":
      return "napi_float32_array";
    case "Int8Array":
      return "napi_int8_array";
    case "Int16Array":
      return "napi_int16_array";
    case "Int32Array":
      return "napi_int32_array";
    case "BigInt64Array":
      return "napi_bigint64_array";
    case "Uint8Array":
      return "napi_uint8_array";
    case "Uint16Array": 
      return "napi_uint16_array";
    case "Uint32Array":
      return "napi_uint32_array";
    case "BigUint64Array":
      return "napi_biguint64_array";
  };
  warn(`Cannot resolve equivalent NAPI JS typed array name for ${type}`);
  return null;
};

export function isReferenceableMember(member) {
  let {rawType} = member;
  if (member.isStaticArray) return true;
  if (member.isArray && (member.isStructType || member.isHandleType)) return true;
  if (member.isStructType || member.isHandleType || member.dereferenceCount > 0) return true;
  if (isPNextMember(member)) return true;
  if (member.isVoidPointer) return true;
  if (member.isWin32Handle) return false;
  if (member.isWin32HandleReference) return true;
  switch (rawType) {
    case "LPCWSTR":
    case "const char *":
    case "const char * const*":
      return true;
    case "float *":
    case "int32_t *":
    case "uint8_t *":
    case "uint32_t *":
    case "uint64_t *":
    case "const float *":
    case "const int32_t *":
    case "const uint8_t *":
    case "const uint32_t *":
    case "const uint64_t *":
      return true;
    case "int":
    case "float":
    case "size_t":
    case "int32_t":
    case "uint8_t":
    case "uint16_t":
    case "uint32_t":
    case "uint64_t":
      return false;
    default: {
      warn(`Cannot resolve resolvability ${member.rawType} for ${member.name}!`);
    }
  };
  return false;
};

export function getBitmaskByName(ast, name) {
  for (let ii = 0; ii < ast.length; ++ii) {
    let child = ast[ii];
    if (child.kind === "ENUM" && child.type === "BITMASK") {
      if (child.name === name) return child;
    }
  };
  return null;
};