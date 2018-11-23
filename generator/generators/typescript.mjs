import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

let ast = null;
let structs = null;
let handles = null;
let includes = null;

const TS_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/typescript-ts.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

function getHandleByName(name) {
  for (let ii = 0; ii < handles.length; ++ii) {
    if (handles[ii].name === name) return handles[ii];
  };
  return null;
};

function getStructByName(name) {
  for (let ii = 0; ii < structs.length; ++ii) {
    if (structs[ii].name === name) return structs[ii];
  };
  return null;
};

function isHandleInclude(name) {
  return getHandleByName(name) !== null;
};

function isStructInclude(name) {
  return getStructByName(name) !== null;
};

function getStructMemberTsType(member) {
  let {rawType} = member;
  if (member.isBaseType) rawType = member.baseType;
  if (member.isStaticArray) {
    // string of chars
    if (member.type === "char") return `string | null`;
    else return `number[] | null`;
  }
  if (member.isArray && (member.isStructType || member.isHandleType)) return `${member.type}[] | null`;
  if (member.isStructType || member.isHandleType || member.isBaseType) {
    if (member.isStructType || member.isHandleType || member.dereferenceCount > 0) {
      return `${member.type} | null`;
    }
  }
  switch (rawType) {
    case "const void *":
      return `null`;
    case "const char *":
      return `string | null`;
    case "const char * const*":
      return `string[] | null`;
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
      return `${member.jsTypedArrayName} | null`;
    case "int":
    case "float":
    case "size_t":
    case "int32_t":
    case "uint8_t":
    case "uint32_t":
    case "uint64_t":
      return `number`;
    default: {
      console.warn(`Cannot handle member ${member.rawType} in member-ts-type!`);
      return ``;
    }
  };
};

function processStructMembers(name, optional) {
  let out = [];
  let struct = getStructByName(name);
  struct.children.map((member, index) => {
    let type = getStructMemberTsType(member);
    let newLine = (index <= struct.children.length - 2) ? "\n" : "";
    let readonly = struct.returnedonly ? "readonly " : "";
    out.push(`  ${readonly}${member.name}${optional ? "?" : ""}: ${type};${newLine}`);
  });
  return out.join("");
}

export default function(astReference, data) {
  ast = astReference;
  structs = data.structs;
  handles = data.handles;
  includes = data.includes;
  let vars = {
    structs,
    handles,
    includes,
    getStructByName,
    isHandleInclude,
    isStructInclude,
    processStructMembers
  };
  let out = {
    source: null
  };
  // ts
  {
    let template = TS_TEMPLATE;
    let output = nunjucks.renderString(template, vars);
    out.source = output;
  }
  return out;
};
