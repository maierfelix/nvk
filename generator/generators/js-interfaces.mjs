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
  getHexaByteOffset
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

function getConstructorMemberInitializer(member) {
  let jsType = getJavaScriptType(ast, member);
  let {type, value, isReference} = jsType;
  switch (type) {
    case JavaScriptType.OBJECT: {
      if (isReference) {
        return `this._${member.name} = null;`;
      } else {
        let byteOffset = getStructureMemberByteOffset(member);
        let memoryOffset = getHexaByteOffset(byteOffset);
        return `this._${member.name} = new ${member.type}({ $memoryBuffer: this.memoryBuffer, $memoryOffset: ${memoryOffset} });`;
      }
    }
    case JavaScriptType.ARRAY_OF_OBJECTS: {
      let length = parseInt(member.length);
      let byteOffset = getStructureMemberByteOffset(member);
      let memoryOffset = getHexaByteOffset(byteOffset);
      let byteLength = getHexaByteOffset(parseInt(getStructureMemberByteLength(member)) / length);
      return `this._${member.name} = [...Array(${length})].map((v, i) => new ${member.type}({ $memoryBuffer: this.memoryBuffer, $memoryOffset: ${memoryOffset} + (i * ${byteLength}) }));`;
    }
    case JavaScriptType.ARRAY_OF_NUMBERS: {
      let length = parseInt(member.length);
      return `this._${member.name} = [...Array(${length})].fill(0x0);`;
    }
  };
  warn(`Cannot handle instantiation initializer for ${currentStruct.name}.${member.name}, ${jsType.type}`);
  return ``;
};

function getConstructorInitializer(member) {
  let jsType = getJavaScriptType(ast, member);
  if (member.needsInitializationAtInstantiation) {
    return getConstructorMemberInitializer(member);
  }
  if (jsType.isNumeric) return ``; // no reflection needed
  if (jsType.isBoolean) return ``; // no reflection needed
  if (jsType.isString && jsType.isStatic) return ``; // no reference needed
  if (jsType.isJavaScriptArray) {
    if (jsType.isStatic) {
      return `this._${member.name} = null;`;
    } else {
      return `this._${member.name} = null;
    this._${member.name}Native = null;`;
    }
  }
  if (jsType.isNullable) return `this._${member.name} = null;`;
  warn(`Cannot resolve constructor initializer for ${member.name}`);
  return ``;
};

function getStructureMemberByteOffset(member) {
  if (!memoryLayouts) return `0x0`;
  let byteOffset = memoryLayouts[currentStruct.name][member.name].byteOffset;
  return getHexaByteOffset(byteOffset);
};

function getStructureMemberByteLength(member) {
  if (!memoryLayouts) return `0x0`;
  let byteLength = memoryLayouts[currentStruct.name][member.name].byteLength;
  return getHexaByteOffset(byteLength);
};

function getStructureByteLength() {
  if (!memoryLayouts) return `0x0`;
  let byteLength = memoryLayouts[currentStruct.name].byteLength;
  return getHexaByteOffset(byteLength);
};

function getHandleByteLength() {
  return getHexaByteOffset(8);
};

function getEnumInlineValue(name) {
  let value = enumLayouts[name];
  if (value === void 0) {
    let value_KHR = enumLayouts[name + "_KHR"];
    // try different extension names
    if (value_KHR !== void 0) return getHexaByteOffset(value_KHR);
    warn(`Cannot inline enum value of '${name}'`);
    return name;
  }
  return getHexaByteOffset(value);
};

function getEnumInlineStypeValue(name) {
  let value = getEnumInlineValue(name);
  if (Number.isNaN(parseInt(value))) return `VkStructureType.${value}`;
  return value;
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
      (type === JavaScriptType.OBJECT ||
      (type === JavaScriptType.STRING && !jsType.isStatic) ||
      type === JavaScriptType.TYPED_ARRAY) &&
      isFillableMember(struct, member)
    ) {
      if (viewTypes.indexOf("BigInt64") <= -1) viewTypes.push("BigInt64");
    }
    else if (
      isPNextMember(member)
    ) {
      if (viewTypes.indexOf("BigInt64") <= -1) viewTypes.push("BigInt64");
    }
    else if (
      type === JavaScriptType.ARRAY_OF_NUMBERS
    ) {
      let viewInstr = getDataViewInstruction(member);
      if (viewTypes.indexOf(viewInstr) <= -1) viewTypes.push(viewInstr);
    }
  });
  viewTypes.map(type => {
    out += `    this.memoryView${type} = new ${type}Array(this.memoryBuffer);\n`;
  });
  out += `
  if (typeof opts === "object") {\n`;
  viewTypes.map(type => {
    let byteStride = getHexaByteOffset(global[type + "Array"].BYTES_PER_ELEMENT);
    let byteLength = getStructureByteLength();
    out += `      this.memoryView${type} = new ${type}Array(this.memoryBuffer).subarray(opts.$memoryOffset / ${byteStride}, (opts.$memoryOffset + ${byteLength}) / ${byteStride});\n`;
  });
  out += `
  }\n`;
  return out;
};

function getGetterProcessor(member) {
  let jsType = getJavaScriptType(ast, member);
  let {type, value} = jsType;
  let byteOffset = getStructureMemberByteOffset(member);
  switch (type) {
    case JavaScriptType.NUMBER:
    case JavaScriptType.BIGINT: {
      let instr = getDataViewInstruction(member);
      let byteStride = getDataViewInstructionStride(instr);
      let offset = getHexaByteOffset(byteOffset / byteStride);
      return `
    return this.memoryView${instr}[${offset}];`;
    }
    case JavaScriptType.BOOLEAN: {
      let instr = getDataViewInstruction(member);
      let byteStride = getDataViewInstructionStride(instr);
      let offset = getHexaByteOffset(byteOffset / byteStride);
      return `
    return this.memoryView${instr}[${offset}] !== 0;`;
    }
    case JavaScriptType.OBJECT: {
      return `
    return this._${member.name};`;
    }
    case JavaScriptType.STRING: {
      let byteOffsetBegin = getStructureMemberByteOffset(member) | 0;
      let byteOffsetEnd = byteOffsetBegin + (getStructureMemberByteLength(member) | 0);
      let hxByteOffsetBegin = getHexaByteOffset(byteOffsetBegin);
      let hxByteOffsetEnd = getHexaByteOffset(byteOffsetBegin + byteOffsetEnd);
      if (jsType.isStatic) {
        return `
    return decodeNullTerminatedUTF8String(
      new Uint8Array(this.memoryBuffer).subarray(${hxByteOffsetBegin}, ${hxByteOffsetEnd})
    ) || null;`;
      }
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
      if (currentStruct.returnedonly) {
        if (!jsType.isStatic) {
          warn(`Cannot process non-static array of numbers for ${currentStruct.name}.${member.name}`);
        }
        if (!member.length) {
          warn(`Cannot resolve length for static array of numbers for ${currentStruct.name}.${member.name}`);
        }
        let length = parseInt(member.length);
        let out = `\n    return [\n`;
        for (let ii = 0; ii < length; ++ii) {
          let instr = getDataViewInstruction(member);
          let byteStride = getDataViewInstructionStride(instr);
          let offset = getHexaByteOffset((byteOffset / byteStride) + ii);
          let comma = ii < length - 1 ? `,\n` : ``;
          out += `      this.memoryView${instr}[${offset}]${comma}`;
        };
        out += `\n    ];`;
        return out;
      }
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
  let {type, value, isReference} = jsType;
  let byteOffset = getStructureMemberByteOffset(member);
  let byteLength = getStructureMemberByteLength(member);
  switch (type) {
    case JavaScriptType.NUMBER:
    case JavaScriptType.BIGINT: {
      let instr = getDataViewInstruction(member);
      let byteStride = getDataViewInstructionStride(instr);
      let offset = getHexaByteOffset(byteOffset / byteStride);
      return `
    this.memoryView${instr}[${offset}] = value;`;
    }
    case JavaScriptType.BOOLEAN: {
      let instr = getDataViewInstruction(member);
      let byteStride = getDataViewInstructionStride(instr);
      let offset = getHexaByteOffset(byteOffset / byteStride);
      return `
    this.memoryView${instr}[${offset}] = value | 0;`;
    }
    case JavaScriptType.OBJECT: {
      let instr = "BigInt64";
      let byteStride = getDataViewInstructionStride(instr);
      let offset = getHexaByteOffset(byteOffset / byteStride);
      if (member.isStructType) {
        console.log(currentStruct.name + "." + member.name, isReference);
      }
      return `
    if (value !== null && value.constructor === ${member.type}) {
      ${member.isStructType ? `value.flush();` : ``}
      this._${member.name} = value;
      ${member.isStructType && isReference ? `this.memoryView${instr}[${offset}] = value.memoryAddress;` : ``}
      ${member.isHandleType ? `this.memoryView${instr}[${offset}] = value.memoryViewBigInt64[0];` : ``}
    } else if (value === null) {
      this._${member.name} = null;
      ${((member.isStructType && isReference) || member.isHandleType) ? `this.memoryView${instr}[${offset}] = BI0;` : ``}
    } else {
      throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}': Expected '${member.type}' but got '" + value.constructor.name + "'");
    }`;
    }
    case JavaScriptType.STRING: {
      let instr = "BigInt64";
      let byteStride = getDataViewInstructionStride(instr);
      let offset = getHexaByteOffset(byteOffset / byteStride);
      return `
    if (value !== null && value.constructor === String) {
      this._${member.name} = textEncoder.encode(value + NULLT).buffer;
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
      let offset = getHexaByteOffset(byteOffset / byteStride);
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
        case ${getEnumInlineStypeValue(structExt.sType)}:`;
    });
    let instr = "BigInt64";
    let byteStride = getDataViewInstructionStride(instr);
    let offset = getHexaByteOffset(byteOffset / byteStride);
    return `
    if (value !== null && (value instanceof Object)) {
      let {sType} = value;
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
  let {type, value, isReference} = jsType;
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
      if (member.isStructType && !isReference) {
        return `if (this._${member.name} !== null) this._${member.name}.flush();`;
      }
      return ``;
    }
    case JavaScriptType.STRING: {
      return ``; // not needed
    }
    case JavaScriptType.ARRAY_OF_STRINGS: {
      let {length} = member;
      let isNumber = Number.isInteger(parseInt(length));
      let instr = "BigInt64";
      let byteStride = getDataViewInstructionStride(instr);
      let offset = getHexaByteOffset(byteOffset / byteStride);
      return `
  if (this._${member.name} !== null) {
    let array = this._${member.name};
    // validate length
    if (array.length !== ${isNumber ? length : `this.${length}`}) {
      throw new RangeError("Invalid array length, expected length of '${length}' for '${currentStruct.name}.${member.name}'");
      return false;
    }
    // validate type
    for (let ii = 0; ii < array.length; ++ii) {
      if (array[ii].constructor !== String) {
        throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}[" + ii + "]': Expected 'String' but got '" + array[ii].constructor.name + "'");
        return false;
      }
    };
    let nativeArray = new NativeStringArray(this._${member.name});
    this._${member.name}Native = nativeArray;
    this.memoryView${instr}[${offset}] = nativeArray.address;
  } else {
    this.memoryView${instr}[${offset}] = BI0;
  }`;
    }
    case JavaScriptType.ARRAY_OF_NUMBERS: {
      let {length} = member;
      let isNumber = Number.isInteger(parseInt(length));
      let instr = getDataViewInstruction(member);
      let byteStride = getDataViewInstructionStride(instr);
      let offset = getHexaByteOffset(byteOffset / byteStride);
      return `
  if (this._${member.name} !== null) {
    let array = this._${member.name};
    // validate length
    if (array.length !== ${isNumber ? length : `this.${length}`}) {
      throw new RangeError("Invalid array length, expected length of '${length}' for '${currentStruct.name}.${member.name}'");
      return false;
    }
    // validate type
    for (let ii = 0; ii < array.length; ++ii) {
      if (array[ii].constructor !== Number) {
        throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}[" + ii + "]': Expected 'Number' but got '" + array[ii].constructor.name + "'");
        return false;
      }
    };
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
        let offset = getHexaByteOffset(byteOffset / byteStride);
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

function getReflectorProcesssor(member) {
  let jsType = getJavaScriptType(ast, member);
  let {type, value} = jsType;
  let byteOffset = getStructureMemberByteOffset(member) | 0;
  let byteLength = getStructureMemberByteLength(member) | 0;
  switch (type) {
    case JavaScriptType.OBJECT: {
      return ``;
    }
    case JavaScriptType.ARRAY_OF_NUMBERS: {
      return ``;
    }
    case JavaScriptType.ARRAY_OF_OBJECTS: {
      let struct = getNodeByName(member.type, ast).returnedonly;
      if (jsType.isStatic) {
        
      } else {
        
      }
      return ``;
    }
    case JavaScriptType.ARRAY_OF_STRINGS: {
      return ``;
    }
  };
  if (isPNextMember(member)) {
    return ``;
  }
  warn(`Cannot resolve reflector processor for ${member.name} of type ${type}`);
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
  if (sType) return `this.sType = ${getEnumInlineStypeValue(sType)};`;
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
  let globalEnums = {};
  if (enumLayoutTable) {
    for (let key in enumLayoutTable) {
      let json = stringifyJSONQuoteless(enumLayoutTable[key]);
      for (let key2 in enumLayoutTable[key]) {
        if (globalEnums[key2] !== void 0) {
          warn(`Enum ${key}.${key2} already exists`);
        }
        globalEnums[key2] = enumLayoutTable[key][key2];
      };
      output += `\nconst ${key} = ${json};\n`;
    };
    // create function which returns all enums globally
  }
  output += `\nfunction getGlobalEnumerations() {
    return (${stringifyJSONQuoteless(globalEnums)});
  };\n`;
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
      getReflectorProcesssor,
      getStructureByteLength,
      getStructureMemoryViews,
      getConstructorInitializer,
      getStructureMemberByteOffset,
      getStructureMemberByteLength
    });
  });
  return output;
};
