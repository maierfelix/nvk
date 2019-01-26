/**

  Generates a typescript type definition file

**/
import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

import {
  warn,
  isIgnoreableType
} from "../utils";

let ast = null;
let calls = null;
let enums = null;
let structs = null;
let handles = null;
let includes = null;

const TS_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/typescript-ts.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

function getBitmaskByName(name) {
  for (let ii = 0; ii < ast.length; ++ii) {
    let child = ast[ii];
    if (child.kind === "ENUM" && child.type === "BITMASK") {
      if (child.name === name) return child;
    }
  };
  return null;
};

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

function getNumericTypescriptType(type) {
  switch (type) {
    case "int":
    case "float":
    case "size_t":
    case "int32_t":
    case "uint8_t":
    case "uint32_t":
    case "uint64_t":
      return `number`;
  };
  return type;
};

function getTypescriptType(member) {
  let {rawType} = member;
  if (isIgnoreableType(member)) return `null`;
  if (member.kind === "COMMAND_PARAM") {
    // handle inout parameters
    switch (member.rawType) {
      case "size_t *":
      case "int *":
      case "int32_t *":
      case "uint32_t *":
      case "uint64_t *":
      case "const int32_t *":
      case "const uint32_t *":
      case "const uint64_t *":
      case "const float *":
      case "VkBool32 *":
        return `VkInout`;
    };
  }
  if (member.isBaseType) rawType = member.baseType;
  if (member.isTypedArray) return `${member.jsTypedArrayName} | null`;
  if (member.enumType) return getNumericTypescriptType(member.enumType);
  if (member.isBitmaskType) {
    let bitmask = getBitmaskByName(member.bitmaskType);
    // future reserved bitmask, or must be 0
    if (!bitmask) return `null`;
    return getNumericTypescriptType(member.bitmaskType);
  }
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
    case "void *":
    case "const void *":
      return `null`;
    case "const char *":
      return `string | null`;
    case "const char * const*":
      return `string[] | null`;
    case "int":
    case "float":
    case "size_t":
    case "int32_t":
    case "uint8_t":
    case "uint16_t":
    case "uint32_t":
    case "uint64_t":
      return `number`;
    case "void **":
      return `VkInoutAddress`;
    default: {
      warn(`Cannot handle member ${member.rawType} in member-ts-type!`);
      return ``;
    }
  };
};

function processStructMembers(name, optional) {
  let out = [];
  let struct = getStructByName(name);
  struct.children.map((member, index) => {
    let type = getTypescriptType(member);
    let newLine = (index <= struct.children.length - 2) ? "\n" : "";
    let readonly = struct.returnedonly ? "readonly " : "";
    out.push(`  ${readonly}${member.name}${optional ? "?" : ""}: ${type};${newLine}`);
  });
  return out.join("");
};

function processCallParameters(call) {
  let out = [];
  call.params.map(param => {
    let name = param.name;
    let type = getTypescriptType(param);
    // ignore
    if (param.name === "pAllocator") type = `null`;
    out.push(`${name}: ${type}`);
  });
  return out.join(", ");
};

function processCallReturn(call) {
  let type = call.rawType;
  switch (type) {
    case "void":
      return `void`;
    case "int32_t":
    case "uint32_t":
    case "uint64_t":
      return `number`;
    default:
      warn(`Cannot handle call param return type ${type} in ts-call-return!`);
  };
  return `void`;
};

function processCall(call) {
  if (isIgnoreableType(call)) return ``;
  let params = processCallParameters(call);
  let ret = processCallReturn(call);
  return `declare function ${call.name}(${params}): ${ret};`;
};

export default function(astReference, data) {
  ast = astReference;
  calls = data.calls;
  enums = data.enums;
  structs = data.structs;
  handles = data.handles;
  includes = data.includes;
  let vars = {
    calls,
    enums,
    structs,
    handles,
    includes,
    processCall,
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
