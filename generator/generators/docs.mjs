/**

  Converts documentation and AST data into their relative JS types

**/
import fs from "fs";
import yauzl from "yauzl";
import nunjucks from "nunjucks";
import pkg from "../../package.json";
import parseDocumentation from "../doc-parser";

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

const CALLS_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/docs/calls.njk`, "utf-8");
const ENUMS_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/docs/enums.njk`, "utf-8");
const HANDLES_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/docs/handles.njk`, "utf-8");
const STRUCTS_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/docs/structs.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

class JavaScriptType {
  constructor(opts) {
    this.type = null;
    this.value = null;
    this.isArray = false;
    this.isEnum = false;
    this.isBitmask = false;
    if (opts.type !== void 0) this.type = opts.type;
    if (opts.value !== void 0) this.value = opts.value;
    if (opts.isArray !== void 0) this.isArray = opts.isArray;
    if (opts.isEnum !== void 0) this.isEnum = opts.isEnum;
    if (opts.isBitmask !== void 0) this.isBitmask = opts.isBitmask;
  }
};

// static types
{
  let idx = 0;
  JavaScriptType.UNKNOWN = idx++;
  JavaScriptType.OBJECT = idx++;
  JavaScriptType.NULL = idx++;
  JavaScriptType.STRING = idx++;
  JavaScriptType.NUMBER = idx++;
  JavaScriptType.ENUM = idx++;
  JavaScriptType.BITMASK = idx++;
  JavaScriptType.OBJECT_INOUT = idx++;
  JavaScriptType.TYPED_ARRAY = idx++;
  JavaScriptType.ARRAY_OF_STRINGS = idx++;
  JavaScriptType.ARRAY_OF_NUMBERS = idx++;
  JavaScriptType.ARRAY_OF_OBJECTS = idx++;
}

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

function getNumericTypescriptType({type, isEnum, isBitmask} = _) {
  switch (type) {
    case "int":
    case "float":
    case "size_t":
    case "int32_t":
    case "uint8_t":
    case "uint32_t":
    case "uint64_t":
      return new JavaScriptType({
        type: JavaScriptType.NUMBER,
        isNullable: true
      });
  };
  let type = (
    isEnum ? JavaScriptType.ENUM :
    isBitmask ? JavaScriptType.BITMASK :
    JavaScriptType.UNKNOWN
  );
  return new JavaScriptType({
    type,
    isNullable: true
  });
};

function getJavaScriptType(member) {
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
        return new JavaScriptType({
          type: JavaScriptType.OBJECT_INOUT,
          value: "Number",
          isNullable: true
        });
    };
  }
  if (member.isBaseType) rawType = member.baseType;
  if (member.isTypedArray) {
    return new JavaScriptType({
      type: JavaScriptType.TYPED_ARRAY,
      value: member.jsTypedArrayName,
      isArray: true,
      isNullable: true
    });
  }
  if (member.enumType) return getNumericTypescriptType({ type: member.enumType, isEnum: true });
  if (member.isBitmaskType) {
    let bitmask = getBitmaskByName(member.bitmaskType);
    // future reserved bitmask, or must be 0
    if (!bitmask) return JavaScriptType.NULL;
    return getNumericTypescriptType({ type: member.bitmaskType, isBitmask: true });
  }
  if (member.isStaticArray) {
    // string of chars
    if (member.type === "char") {
      return new JavaScriptType({
        type: JavaScriptType.ARRAY_OF_STRINGS,
        isArray: true,
        isNullable: true
      });
    }
    else {
      return new JavaScriptType({
        type: JavaScriptType.ARRAY_OF_NUMBERS,
        isArray: true,
        isNullable: true
      });
    }
  }
  if (member.isArray && (member.isStructType || member.isHandleType)) {
    return new JavaScriptType({
      type: JavaScriptType.ARRAY_OF_OBJECTS,
      value: member.type,
      isArray: true,
      isNullable: true
    });
  }
  if (member.isStructType || member.isHandleType || member.isBaseType) {
    if (member.isStructType || member.isHandleType || member.dereferenceCount > 0) {
      return new JavaScriptType({
        type: JavaScriptType.OBJECT,
        value: member.type,
        isNullable: true
      });
    }
  }
  switch (rawType) {
    case "void *":
    case "const void *":
      return new JavaScriptType({
        type: JavaScriptType.NULL,
        isNullable: true
      });
    case "const char *":
      return new JavaScriptType({
        type: JavaScriptType.STRING,
        isNullable: true
      });
    case "const char * const*":
      return new JavaScriptType({
        type: JavaScriptType.ARRAY_OF_STRINGS,
        isArray: true,
        isNullable: true
      });
    case "int":
    case "float":
    case "size_t":
    case "int32_t":
    case "uint8_t":
    case "uint16_t":
    case "uint32_t":
    case "uint64_t":
      return new JavaScriptType({
        type: JavaScriptType.NUMBER,
        isNullable: true
      });
    case "void **":
      return new JavaScriptType({
        type: JavaScriptType.OBJECT_INOUT,
        value: "BigInt",
        isNullable: true
      });
    default: {
      warn(`Cannot handle member ${member.rawType} in doc generator!`);
      return ``;
    }
  };
};

function processCall(call) {
  return `42`;
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
    isStructInclude
  };
  let out = {
    source: null
  };
  // calls
  {
    let template = CALLS_TEMPLATE;
    let output = nunjucks.renderString(template, vars);
    //console.log(output);
  }
  return new Promise(resolve => {
    resolve(ast);
  });
};
