import toposort from "toposort";

export function formatVkVersion(version) {
  let split = version.split(".");
  if (split.length > 3) {
    // .0 at version end is ignored, pop it
    if (split[3] === "0") {
      split.pop();
      return split.join(".");
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
  if (type === "const void *" && obj.name === "pNext") return true;
  // ignore just for now
  if (type.substr(0, 4) === "PFN_") return true;
  if (type.substr(type.length - 4, type.length) === "2KHR") return true;
  return (
    type === "const SECURITY_ATTRIBUTES *" ||
    type === "struct AHardwareBuffer *" ||
    type === "void" ||
    type === "void *" ||
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
