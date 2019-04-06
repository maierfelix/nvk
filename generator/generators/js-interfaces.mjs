import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

import {
  warn,
  isPNextMember,
  getNodeByName,
  isFillableMember,
  isIgnoreableType,
  isFlushableMember,
  getAutoStructureType,
  getDataViewInstruction,
  getDataViewInstructionStride,
  stringifyJSONQuoteless,
  getHexadecimalFromNumber,
  getHexadecimalByteOffsetFromNumber
} from "../utils";

import {
  JavaScriptType,
  getJavaScriptType
} from "../javascript-type";

let ast = null;
let currentHandle = null;
let currentStruct = null;

const JS_HANDLE_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/js/handle-js.njk`, "utf-8");
const JS_STRUCT_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/js/struct-js.njk`, "utf-8");

let enumLayouts = null;
let memoryLayouts = null;

let enumLayoutTable = null;

nunjucks.configure({ autoescape: true });

function getConstructorInitializer(member) {
  let jsType = getJavaScriptType(ast, member);
  if (jsType.isNumeric) return ``; // no reflection needed
  if (jsType.isJavaScriptArray) {
    if (jsType.isStatic) {
      return `this._${member.name} = null;`;
    } else {
      return `this._${member.name} = null;
    this._${member.name}Native = null;`;
    }
  }
  if (jsType.isNullable) return `this._${member.name} = null;`;
  if (jsType.isBoolean) return `this._${member.name} = false;`;
  warn(`Cannot resolve constructor initializer for ${member.name}`);
  return ``;
};

function getStructureMemberByteOffset(member) {
  if (!memoryLayouts) return `0x0`;
  let byteOffset = memoryLayouts[currentStruct.name][member.name].byteOffset;
  return getHexadecimalByteOffsetFromNumber(byteOffset);
};

function getStructureMemberByteLength(member) {
  if (!memoryLayouts) return `0x0`;
  let byteLength = memoryLayouts[currentStruct.name][member.name].byteLength;
  return getHexadecimalByteOffsetFromNumber(byteLength);
};

function getStructureByteLength() {
  if (!memoryLayouts) return `0x0`;
  let byteLength = memoryLayouts[currentStruct.name].byteLength;
  return getHexadecimalByteOffsetFromNumber(byteLength);
};

function getHandleByteLength() {
  return getHexadecimalByteOffsetFromNumber(8);
};

function getEnumInlineValue(name) {
  let value = enumLayouts[name];
  if (value === void 0) {
    let value_KHR = enumLayouts[name + "_KHR"];
    // try different extension names
    if (value_KHR !== void 0) return getHexadecimalByteOffsetFromNumber(value_KHR);
    warn(`Cannot inline enum value of '${name}'`);
    return name;
  }
  return getHexadecimalByteOffsetFromNumber(value);
};

function getStructureMemoryViews() {
  let out = ``;
  let struct = currentStruct;
  let viewTypes = [];
  struct.children.map(member => {
    let jsType = getJavaScriptType(ast, member);
    let {type} = jsType;
    if (
      type === JavaScriptType.NUMBER ||
      type === JavaScriptType.BIGINT ||
      type === JavaScriptType.BOOLEAN
    ) {
      let viewInstr = getDataViewInstruction(member);
      if (viewTypes.indexOf(viewInstr) <= -1) viewTypes.push(viewInstr);
    }
    else if (
      type === JavaScriptType.OBJECT ||
      type === JavaScriptType.STRING ||
      type === JavaScriptType.TYPED_ARRAY
    ) {
      if (viewTypes.indexOf("BigInt64") <= -1) viewTypes.push("BigInt64");
    }
    else if (
      isPNextMember(member)
    ) {
      if (viewTypes.indexOf("BigInt64") <= -1) viewTypes.push("BigInt64");
    }
  });
  viewTypes.map(type => {
    out += `    this.memoryView${type} = new ${type}Array(this.memoryBuffer);\n`;
  });
  return out;
};

function getGetterProcessor(member) {
  let {type, value} = getJavaScriptType(ast, member);
  let byteOffset = getStructureMemberByteOffset(member);
  switch (type) {
    case JavaScriptType.NUMBER:
    case JavaScriptType.BIGINT: {
      let instr = getDataViewInstruction(member);
      let byteStride = getDataViewInstructionStride(instr);
      let offset = getHexadecimalByteOffsetFromNumber(byteOffset / byteStride);
      return `
    return this.memoryView${instr}[${offset}];`;
    }
    case JavaScriptType.BOOLEAN: {
      let instr = getDataViewInstruction(member);
      let byteStride = getDataViewInstructionStride(instr);
      let offset = getHexadecimalByteOffsetFromNumber(byteOffset / byteStride);
      return `
    return this.memoryView${instr}[${offset}] !== 0;`;
    }
    case JavaScriptType.OBJECT: {
      return `
    return this._${member.name};`;
    }
    case JavaScriptType.STRING: {
      return `
    if (this._${member.name} !== null) {
      let str = textDecoder.decode(this._${member.name});
      return str.substr(0, str.length - 1);
    } else {
      return null;
    }`;
    }
    case JavaScriptType.ARRAY_OF_STRINGS: {
      return `
    return this._${member.name};`;
    }
    case JavaScriptType.ARRAY_OF_NUMBERS: {
      return `
    return this._${member.name};`;
    }
    case JavaScriptType.ARRAY_OF_OBJECTS: {
      return `
    return this._${member.name};`;
    }
    case JavaScriptType.TYPED_ARRAY: {
      return `
    return this._${member.name};`;
    }
  };
  if (isPNextMember(member)) {
    return `
    return this._${member.name};`;
  }
  warn(`Cannot resolve getter processor for ${member.name} of type ${type}`);
  return ``;
};

function getSetterProcessor(member) {
  let jsType = getJavaScriptType(ast, member);
  let {type, value} = jsType;
  let byteOffset = getStructureMemberByteOffset(member);
  switch (type) {
    case JavaScriptType.NUMBER:
    case JavaScriptType.BIGINT: {
      let instr = getDataViewInstruction(member);
      let byteStride = getDataViewInstructionStride(instr);
      let offset = getHexadecimalByteOffsetFromNumber(byteOffset / byteStride);
      return `
    this.memoryView${instr}[${offset}] = value;`;
    }
    case JavaScriptType.BOOLEAN: {
      let instr = getDataViewInstruction(member);
      let byteStride = getDataViewInstructionStride(instr);
      let offset = getHexadecimalByteOffsetFromNumber(byteOffset / byteStride);
      return `
    this.memoryView${instr}[${offset}] = value | 0;`;
    }
    case JavaScriptType.OBJECT: {
      let instr = "BigInt64";
      let byteStride = getDataViewInstructionStride(instr);
      let offset = getHexadecimalByteOffsetFromNumber(byteOffset / byteStride);
      return `
    if (value !== null && value.constructor === ${member.type}) {
      value.flush();
      this._${member.name} = value;
      this.memoryView${instr}[${offset}] = value.memoryAddress;
    } else if (value === null) {
      this._${member.name} = null;
      this.memoryView${instr}[${offset}] = BI0;
    } else {
      throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}': Expected '${member.type}' but got '" + value.constructor.name + "'");
    }`;
    }
    case JavaScriptType.STRING: {
      let instr = "BigInt64";
      let byteStride = getDataViewInstructionStride(instr);
      let offset = getHexadecimalByteOffsetFromNumber(byteOffset / byteStride);
      return `
    if (value !== null && value.constructor === String) {
      this._${member.name} = textEncoder.encode(value + String.fromCharCode(0x0)).buffer;
      this.memoryView${instr}[${offset}] = getAddressFromArrayBuffer(this._${member.name});
    } else if (value === null) {
      this._${member.name} = null;
      this.memoryView${instr}[${offset}] = BI0;
    } else {
      throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}': Expected 'String' but got '" + value.constructor.name + "'");
    }`;
    }
    case JavaScriptType.ARRAY_OF_STRINGS: {
      return `
    if (value !== null && value.constructor === Array) {
      this._${member.name} = value;
    } else if (value === null) {
      this._${member.name} = null;
    } else {
      throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}': Expected 'Array' but got '" + value.constructor.name + "'");
    }`;
    }
    case JavaScriptType.ARRAY_OF_NUMBERS: {
      return `
    if (value !== null && value.constructor === Array) {
      this._${member.name} = value;
    } else if (value === null) {
      this._${member.name} = null;
    } else {
      throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}': Expected 'Array' but got '" + value.constructor.name + "'");
    }`;
    }
    case JavaScriptType.ARRAY_OF_OBJECTS: {
      return `
    if (value !== null && value.constructor === Array) {
      this._${member.name} = value;
    } else if (value === null) {
      this._${member.name} = null;
    } else {
      throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}': Expected 'Array' but got '" + value.constructor.name + "'");
    }`;
    }
    case JavaScriptType.TYPED_ARRAY: {
      let instr = "BigInt64";
      let byteStride = getDataViewInstructionStride(instr);
      let offset = getHexadecimalByteOffsetFromNumber(byteOffset / byteStride);
      return `
    if (value !== null && value.constructor === ${member.jsTypedArrayName}) {
      this._${member.name} = value;
      this.memoryView${instr}[${offset}] = getAddressFromArrayBuffer(value.buffer);
    } else if (value === null) {
      this._${member.name} = null;
      this.memoryView${instr}[${offset}] = BI0;
    } else {
      throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}': Expected '${member.jsTypedArrayName}' but got '" + value.constructor.name + "'");
    }`;
    }
  };
  if (isPNextMember(member)) {
    let {extensions} = currentStruct;
    let conditions = ``;
    if (!extensions) {
      return `
    throw new TypeError("'${currentStruct.name}.${member.name}' isn't allowed to be filled");`;
    }
    extensions.map((extensionName, index) => {
      let structExt = getNodeByName(extensionName, ast);
      if (!structExt || !structExt.sType) warn(`Cannot resolve struct by extension name '${extensionName}'`);
      conditions += `
        case ${getEnumInlineValue(structExt.sType)}:`;
    });
    let instr = "BigInt64";
    let byteStride = getDataViewInstructionStride(instr);
    let offset = getHexadecimalByteOffsetFromNumber(byteOffset / byteStride);
    return `
    if (value !== null) {
      let sType = value.sType | 0;
      if (sType <= -1) throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}'");
      switch (sType) {
          ${conditions}
          break;
        default:
          throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}'");
      };
      this._${member.name} = value;
      this.memoryView${instr}[${offset}] = value.memoryAddress;
    } else if (value === null) {
      this._${member.name} = null;
      this.memoryView${instr}[${offset}] = BI0;
    } else {
      throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}'");
    }`;
  }
  warn(`Cannot resolve setter processor for ${member.name} of type ${type}`);
  return ``;
};

function getFlusherProcessor(member) {
  let jsType = getJavaScriptType(ast, member);
  let {type, value} = jsType;
  let byteOffset = getStructureMemberByteOffset(member);
  switch (type) {
    case JavaScriptType.NUMBER:
    case JavaScriptType.BIGINT: {
      return ``; // not needed
    }
    case JavaScriptType.BOOLEAN: {
      return ``; // not needed
    }
    case JavaScriptType.OBJECT: {
      return ``;
    }
    case JavaScriptType.STRING: {
      return ``; // not needed
    }
    case JavaScriptType.ARRAY_OF_STRINGS: {
      let instr = "BigInt64";
      let byteStride = getDataViewInstructionStride(instr);
      let offset = getHexadecimalByteOffsetFromNumber(byteOffset / byteStride);
      return `
  if (this._${member.name} !== null) {
    let nativeArray = new NativeStringArray(this._${member.name});
    this._${member.name}Native = nativeArray;
    this.memoryView${instr}[${offset}] = nativeArray.address;
  } else {
    this.memoryView${instr}[${offset}] = BI0;
  }`;
    }
    case JavaScriptType.ARRAY_OF_NUMBERS: {
      let instr = getDataViewInstruction(member);
      let byteStride = getDataViewInstructionStride(instr);
      let offset = getHexadecimalByteOffsetFromNumber(byteOffset / byteStride);
      return `
  if (this._${member.name} !== null) {
    let array = this._${member.name};
    for (let ii = 0; ii < array.length; ++ii) {
      this.memoryView${instr}[${offset}] = array[ii];
    };
  } else {
    this.memoryView${instr}[${offset}] = 0x0;
  }`;
    }
    case JavaScriptType.ARRAY_OF_OBJECTS: {
      // TODO: returnedonly
      let {length} = member;
      let isNumber = Number.isInteger(parseInt(length));
      let byteOffset = getStructureMemberByteOffset(member);
      let byteLength = getStructureMemberByteLength(member);
      let write = ``;
      if (!jsType.isStatic) {
        let instr = "BigInt64";
        let byteStride = getDataViewInstructionStride(instr);
        let offset = getHexadecimalByteOffsetFromNumber(byteOffset / byteStride);
        write = `
    let nativeArray = new NativeObjectArray(array);
    this._${member.name}Native = nativeArray;
    this.memoryView${instr}[${offset}] = nativeArray.address;`;
      // do a memcpy for static objects
      } else {
        write = `
    let dstView = new Uint8Array(this.memoryBuffer);
    let byteOffset = ${byteOffset};
    for (let ii = 0; ii < array.length; ++ii) {
      let srcView = new Uint8Array(array[ii].memoryBuffer);
      dstView.set(srcView, byteOffset);
      byteOffset += ${member.type}.byteLength;
    };`;
      }
      return `
  if (this._${member.name} !== null) {
    let array = this._${member.name};
    if (array.length !== ${isNumber ? length : `this.${length}`}) {
      throw new RangeError("Invalid array length, expected length of '${length}' for '${currentStruct.name}.${member.name}'");
      return false;
    }
    for (let ii = 0; ii < array.length; ++ii) {
      if (array[ii].constructor !== ${member.type}) {
        throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}[" + ii + "]': Expected '${member.type}' but got '" + array[ii].constructor.name + "'");
        return false;
      }
      if (!array[ii].flush()) return false;
    };
    ${write}
  }`;
    }
    case JavaScriptType.TYPED_ARRAY: {
      return ``; // not needed
    }
  };
  if (isPNextMember(member)) {
    return `
  if (this._${member.name} !== null) {
    if (!this._${member.name}.flush()) return false;
  }`;
  }
  warn(`Cannot resolve flusher processor for ${member.name} of type ${type}`);
  return ``;
};

function getStructureAutoSType() {
  let struct = currentStruct;
  let sType = null;
  // these two are to iterate over given sType structs, ignore them
  if (struct.name === `VkBaseInStructure` || struct.name === `VkBaseOutStructure`) {
    return ``;
  }
  let filtered = struct.children.filter(member => member.name === "sType");
  let sTypeMember = null;
  if (filtered.length) sTypeMember = filtered[0];
  if (sTypeMember) sType = struct.sType || getAutoStructureType(struct.name);
  if (sType) return `this.sType = ${getEnumInlineValue(sType)};`;
  return ``;
};

function getEnumLayoutTable() {
  let json = enumLayouts;
  if (!json) return null;
  let out = {};
  for (let key in json) {
    if (typeof json[key] === "object") {
      out[key] = json[key];
    }
  };
  return out;
};

function getEnumLayouts() {
  let enumLayoutsPath = `${pkg.config.GEN_OUT_DIR}/${global.vkVersion}/${process.platform}/enumLayouts.json`;
  if (!fs.existsSync(enumLayoutsPath)) {
    if (!global.ENUM_LAYOUT_NEEDS_RECOMPILATION) {
      warn(`Module needs recompilation:
Enum layouts aren't resolved yet, module needs to be re-compiled this time
The code generater can only inline required enum layouts after second compilation
      `);
      global.ENUM_LAYOUT_NEEDS_RECOMPILATION = true;
    }
  } else {
    return JSON.parse(fs.readFileSync(enumLayoutsPath, "utf-8"));
  }
  return null;
};

function getMemoryLayouts() {
  let memoryLayoutsPath = `${pkg.config.GEN_OUT_DIR}/${global.vkVersion}/${process.platform}/memoryLayouts.json`;
  if (!fs.existsSync(memoryLayoutsPath)) {
    if (!global.MEMORY_LAYOUT_NEEDS_RECOMPILATION) {
      warn(`Module needs recompilation:
Memory layouts aren't resolved yet, module needs to be re-compiled this time
The code generater can only inline required memory layout offets after second compilation
      `);
      global.MEMORY_LAYOUT_NEEDS_RECOMPILATION = true;
    }
  } else {
    return JSON.parse(fs.readFileSync(memoryLayoutsPath, "utf-8"));
  }
  return null;
};

export default function(astReference, handles, structs) {
  ast = astReference;
  enumLayouts = getEnumLayouts();
  enumLayoutTable = getEnumLayoutTable();
  memoryLayouts = getMemoryLayouts();
  let output = ``;
  if (enumLayoutTable) {
    for (let key in enumLayoutTable) {
      let json = stringifyJSONQuoteless(enumLayoutTable[key]);
      output += `\nconst ${key} = ${json};\n`;
    };
  }
  handles.map(handle => {
    currentHandle = handle;
    output += nunjucks.renderString(JS_HANDLE_TEMPLATE, {
      handle,
      getHandleByteLength
    });
  });
  structs.map(struct => {
    currentStruct = struct;
    output += nunjucks.renderString(JS_STRUCT_TEMPLATE, {
      struct,
      isFillableMember,
      isIgnoreableType,
      isFlushableMember,
      getGetterProcessor,
      getSetterProcessor,
      getFlusherProcessor,
      getStructureAutoSType,
      getStructureByteLength,
      getStructureMemoryViews,
      getConstructorInitializer,
      getStructureMemberByteOffset,
      getStructureMemberByteLength
    });
  });
  return output;
};
