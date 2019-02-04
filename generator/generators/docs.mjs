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

let objects = [];

const {DOCS_DIR, TEMPLATE_DIR} = pkg.config;

const INDEX_TEMPLATE = fs.readFileSync(`${TEMPLATE_DIR}/docs/index.njk`, "utf-8");
const CALLS_TEMPLATE = fs.readFileSync(`${TEMPLATE_DIR}/docs/calls.njk`, "utf-8");
const ENUMS_TEMPLATE = fs.readFileSync(`${TEMPLATE_DIR}/docs/enums.njk`, "utf-8");
const HANDLES_TEMPLATE = fs.readFileSync(`${TEMPLATE_DIR}/docs/handles.njk`, "utf-8");
const STRUCTS_TEMPLATE = fs.readFileSync(`${TEMPLATE_DIR}/docs/structs.njk`, "utf-8");

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
  let jsType = (
    isEnum ? JavaScriptType.ENUM :
    isBitmask ? JavaScriptType.BITMASK :
    JavaScriptType.UNKNOWN
  );
  return new JavaScriptType({
    type: jsType,
    isNullable: true
  });
};

function getJavaScriptType(member) {
  let {rawType} = member;
  if (isIgnoreableType(member)) {
    return new JavaScriptType({
      type: JavaScriptType.NULL,
      isNullable: true
    });
  }
  if (member.kind === "COMMAND_PARAM") {
    if (member.isTypedArray) {
      return new JavaScriptType({
        type: JavaScriptType.TYPED_ARRAY,
        value: member.jsTypedArrayName,
        isArray: true,
        isNullable: true
      });
    }
    // handle inout parameters
    switch (member.rawType) {
      case "size_t *":
      case "int *":
      case "int32_t *":
      case "uint32_t *":
      case "uint64_t *":
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
    if (!bitmask) return new JavaScriptType({
      type: JavaScriptType.NUMBER,
      isNullable: true
    });
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
  };
  warn(`Cannot handle member ${member.rawType} in doc generator!`);
  return null;
};

function getType(object) {
  let folder = getObjectFolder(object);
  let {type} = getJavaScriptType(object);
  switch (type) {
    case JavaScriptType.UNKNOWN: return `N/A`;
    case JavaScriptType.OBJECT: return `<a href="../${folder}/${object.type}.html">${object.type}</a>`;
    case JavaScriptType.NULL: return `null`;
    case JavaScriptType.STRING: return `String`;
    case JavaScriptType.NUMBER: return `Number`;
    case JavaScriptType.ENUM: return `Number`;
    case JavaScriptType.BITMASK: return `Number`;
    case JavaScriptType.OBJECT_INOUT: return `Object`;
    case JavaScriptType.ARRAY_OF_STRINGS: {
      return `Array<vk-property-type type="string">[String]</vk-property-type>`;
    }
    case JavaScriptType.ARRAY_OF_NUMBERS: {
      return `Array<vk-property-type type="number">[Number]</vk-property-type>`;
    }
    case JavaScriptType.ARRAY_OF_OBJECTS: {
      return `Array<vk-property-type type="object">[<a href="../${folder}/${object.type}.html">${object.type}]</a></vk-property-type>`;
    }
    case JavaScriptType.TYPED_ARRAY: {
      return `<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/${object.jsTypedArrayName}">${object.jsTypedArrayName}</a>`;
    }
  };
  warn(`Cannot resolve doc type ${type} for ${object.name}`);
  return ``;
};

function getCSSType(member) {
  let {type} = getJavaScriptType(member);
  switch (type) {
    case JavaScriptType.UNKNOWN: return `N/A`;
    case JavaScriptType.OBJECT: return `object`;
    case JavaScriptType.NULL: return `null`;
    case JavaScriptType.STRING: return `string`;
    case JavaScriptType.NUMBER: return `number`;
    case JavaScriptType.ENUM: return `number`;
    case JavaScriptType.BITMASK: return `number`;
    case JavaScriptType.OBJECT_INOUT: return `object`;
    case JavaScriptType.ARRAY_OF_STRINGS: return `array`;
    case JavaScriptType.ARRAY_OF_NUMBERS: return `array`;
    case JavaScriptType.ARRAY_OF_OBJECTS: return `array`;
    case JavaScriptType.TYPED_ARRAY: return `typedarray`;
  };
  warn(`Cannot resolve CSS doc type ${type} for ${member.name}`);
  return ``;
};

function getCategories({ calls, structs, handles } = _) {
  let out = [];
  calls.map(call => { if (out.indexOf(call.category) <= -1) out.push(call.category); });
  structs.map(struct => { if (out.indexOf(struct.category) <= -1) out.push(struct.category); });
  handles.map(handle => { if (out.indexOf(handle.category) <= -1) out.push(handle.category); });
  return out;
};

function getObjectsByCategory(category) {
  let out = [];
  // collect objects matching category
  {
    calls.map(call => { if (call.category === category) out.push(call); });
    structs.map(struct => { if (struct.category === category) out.push(struct); });
    handles.map(handle => { if (handle.category === category) out.push(handle); });
  }
  // sort alphabetically
  out = out.sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });
  return out;
};

function getObjectFolder(obj) {
  if (obj.isHandleType) return "handles";
  if (obj.isStructType) return "structs";
  switch (obj.kind) {
    case "STRUCT":
      return "structs";
    case "COMMAND_PROTO":
      return "calls";
    case "HANDLE":
      return "handles";
  };
  return ``;
};

function getObjectLabel(obj) {
  switch (obj.kind) {
    case "STRUCT":
      return "s";
    case "COMMAND_PROTO":
      return "f";
    case "HANDLE":
      return "h";
  };
  return ``;
};

function getCallReturnType(call) {
  let type = call.rawType;
  if (call.enumType) return call.enumType;
  switch (type) {
    case "void":
      return "void";
    case "int8_t":
    case "int16_t":
    case "int32_t":
    case "uint8_t":
    case "uint16_t":
    case "uint32_t":
      return "Number";
    case "uint64_t":
      return "BigInt";
  };
  return `N/A`;
};

export default function(astReference, data, version) {
  ast = astReference;
  calls = data.calls;
  enums = data.enums;
  structs = data.structs;
  handles = data.handles;
  includes = data.includes;
  calls.map(call => { objects.push(call); });
  structs.map(struct => { objects.push(struct); });
  handles.map(handle => { objects.push(handle); });
  let categories = getCategories({ calls, structs, handles });
  // reserve write dirs
  {
    // docs/x/
    if (!fs.existsSync(`${DOCS_DIR}/${version}`)) fs.mkdirSync(`${DOCS_DIR}/${version}`);
    // docs/x/calls/
    if (!fs.existsSync(`${DOCS_DIR}/${version}/calls`)) fs.mkdirSync(`${DOCS_DIR}/${version}/calls`);
    // docs/x/handles
    if (!fs.existsSync(`${DOCS_DIR}/${version}/handles`)) fs.mkdirSync(`${DOCS_DIR}/${version}/handles`);
    // docs/x/structs
    if (!fs.existsSync(`${DOCS_DIR}/${version}/structs`)) fs.mkdirSync(`${DOCS_DIR}/${version}/structs`);
  }
  // index
  {
    let output = nunjucks.renderString(INDEX_TEMPLATE, {
      objects,
      categories,
      getObjectLabel,
      getObjectFolder,
      getObjectsByCategory
    });
    fs.writeFileSync(`${DOCS_DIR}/${version}/index.html`, output, `utf-8`);
  }
  // search json
  {
    let out = [];
    objects.map(obj => {
      out.push({
        name: obj.name,
        label: getObjectLabel(obj),
        folder: getObjectFolder(obj)
      });
    });
    fs.writeFileSync(`${DOCS_DIR}/${version}/search.json`, JSON.stringify(out), `utf-8`);
  }
  // categories json
  {
    let out = [];
    categories.map(name => {
      let category = { category: name, objects: [] };
      let objects = getObjectsByCategory(name);
      objects.map(obj => {
        category.objects.push({
          name: obj.name,
          label: getObjectLabel(obj),
          folder: getObjectFolder(obj)
        });
      });
      out.push(category);
    });
    fs.writeFileSync(`${DOCS_DIR}/${version}/categories.json`, JSON.stringify(out), `utf-8`);
  }
  // structs
  {
    structs.map(struct => {
      let output = nunjucks.renderString(STRUCTS_TEMPLATE, {
        struct,
        structs,
        objects,
        members: struct.children,
        categories,
        getType,
        getCSSType,
        getObjectLabel,
        getObjectFolder,
        getObjectsByCategory
      });
      fs.writeFileSync(`${DOCS_DIR}/${version}/structs/${struct.name}.html`, output, `utf-8`);
    });
  }
  // handles
  {
    handles.map(handle => {
      let output = nunjucks.renderString(HANDLES_TEMPLATE, {
        handle,
        handles,
        objects,
        members: handle.children,
        categories,
        getType,
        getCSSType,
        getObjectLabel,
        getObjectFolder,
        getObjectsByCategory
      });
      fs.writeFileSync(`${DOCS_DIR}/${version}/handles/${handle.name}.html`, output, `utf-8`);
    });
  }
  // calls
  {
    calls.map(call => {
      let output = nunjucks.renderString(CALLS_TEMPLATE, {
        call,
        calls,
        objects,
        params: call.params,
        categories,
        getType,
        getCSSType,
        getObjectLabel,
        getObjectFolder,
        getCallReturnType,
        getObjectsByCategory
      });
      fs.writeFileSync(`${DOCS_DIR}/${version}/calls/${call.name}.html`, output, `utf-8`);
    });
  }
  return null;
};
