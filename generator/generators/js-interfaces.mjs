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
let validate = false;
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
        return `this._${member.name} = new ${member.type}({ $memoryBuffer: this.memoryBuffer, $memoryOffset: this.$memoryOffset + ${memoryOffset} });`;
      }
    }
    case JavaScriptType.ARRAY_OF_OBJECTS: {
      let length = parseInt(member.length);
      let byteOffset = getStructureMemberByteOffset(member);
      let memoryOffset = getHexaByteOffset(byteOffset);
      let byteLength = getHexaByteOffset(parseInt(getStructureMemberByteLength(member)) / length);
      return `this._${member.name} = [...Array(${length})].map((v, i) => new ${member.type}({ $memoryBuffer: this.memoryBuffer, $memoryOffset: this.$memoryOffset + ${memoryOffset} + (i * ${byteLength}) }));`;
    }
    case JavaScriptType.ARRAY_OF_NUMBERS: {
      if (currentStruct.isUnionType) return `this._${member.name} = null;`;
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
  if (!enumLayouts) return ``;
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
  if (!enumLayouts) return ``;
  let value = getEnumInlineValue(name);
  if (Number.isNaN(parseInt(value))) return `VkStructureType.${value}`;
  return value;
};

function getStructureMemoryViews(passedByReference) {
  let out = ``;
  let struct = currentStruct;
  let viewTypes = [];
  struct.children.map(member => {
    let jsType = getJavaScriptType(ast, member);
    let {type, isReference} = jsType;
    if (
      type === JavaScriptType.NUMBER ||
      type === JavaScriptType.BIGINT ||
      type === JavaScriptType.BOOLEAN
    ) {
      let viewInstr = getDataViewInstruction(member);
      if (viewTypes.indexOf(viewInstr) <= -1) viewTypes.push(viewInstr);
    }
    else if (
      ((type === JavaScriptType.OBJECT && (isReference || member.isHandleType)) ||
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
  if (passedByReference) {
    viewTypes.map(type => {
      out += `      this.memoryView${type} = new ${type}Array(this.memoryBuffer);\n`;
    });
  // passed by-value, share memoryBuffer of top-structure
  } else {
    viewTypes.map(type => {
      let byteStride = getHexaByteOffset(global[type + "Array"].BYTES_PER_ELEMENT);
      let byteLength = getStructureByteLength();
      out += `      this.memoryView${type} = new ${type}Array(this.memoryBuffer).subarray(opts.$memoryOffset / ${byteStride}, (opts.$memoryOffset + ${byteLength}) / ${byteStride});\n`;
    });
  }
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
      new Uint8Array(this.memoryBuffer).subarray(this.$memoryOffset + ${hxByteOffsetBegin}, ${hxByteOffsetEnd})
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
    case JavaScriptType.NUMBER: {
      let instr = getDataViewInstruction(member);
      let byteStride = getDataViewInstructionStride(instr);
      let offset = getHexaByteOffset(byteOffset / byteStride);
      return `
    ${ validate ? `if (typeof value !== "number") {
      throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}': Expected 'Number' but got '" + value.constructor.name + "'");
    }` : `` }
    this.memoryView${instr}[${offset}] = value;`;
    }
    case JavaScriptType.BIGINT: {
      let instr = getDataViewInstruction(member);
      let byteStride = getDataViewInstructionStride(instr);
      let offset = getHexaByteOffset(byteOffset / byteStride);
      return `
    ${ validate ? `if (typeof value !== "bigint" && typeof value !== "number") {
      throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}': Expected 'BigInt' or 'Number' but got '" + value.constructor.name + "'");
    }` : `` }
    this.memoryView${instr}[${offset}] = BigInt(value);`;
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
      return `
    if (value !== null ${ validate ? `&& value.constructor === ${member.type}` : ``}) {
      ${member.isStructType ? `value.flush();` : ``}
      this._${member.name} = value;
      ${member.isStructType && isReference ? `this.memoryView${instr}[${offset}] = value.memoryAddress;` : ``}
      ${member.isHandleType ? `this.memoryView${instr}[${offset}] = value.memoryViewBigInt64[0];` : ``}
    } else if (value === null) {
      this._${member.name} = null;
      ${((member.isStructType && isReference) || member.isHandleType) ? `this.memoryView${instr}[${offset}] = BI0;` : ``}
    } ${ validate ? `else {
      throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}': Expected '${member.type}' but got '" + value.constructor.name + "'");
    }`: `` }
    `;
    }
    case JavaScriptType.STRING: {
      let instr = "BigInt64";
      let byteStride = getDataViewInstructionStride(instr);
      let offset = getHexaByteOffset(byteOffset / byteStride);
      return `
    if (value !== null ${ validate ? `&& value.constructor === String` : `` }) {
      this._${member.name} = textEncoder.encode(value + NULLT).buffer;
      this.memoryView${instr}[${offset}] = getAddressFromArrayBuffer(this._${member.name});
    } else if (value === null) {
      this._${member.name} = null;
      this.memoryView${instr}[${offset}] = BI0;
    } ${ validate ? `else {
      throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}': Expected 'String' but got '" + value.constructor.name + "'");
    }` : `` }
    `;
    }
    case JavaScriptType.ARRAY_OF_STRINGS: {
      return `
    if (value !== null ${ validate ? `&& value.constructor === Array` : `` }) {
      this._${member.name} = value;
    } else if (value === null) {
      this._${member.name} = null;
    } ${ validate ? `else {
      throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}': Expected 'Array ${member.type}' but got '" + value.constructor.name + "'");
    }`: `` }
    `;
    }
    case JavaScriptType.ARRAY_OF_NUMBERS: {
      return `
    if (value !== null ${ validate ? `&& value.constructor === Array` : `` }) {
      this._${member.name} = value;
    } else if (value === null) {
      this._${member.name} = null;
    } ${ validate ? `else {
      throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}': Expected 'Array ${member.type}' but got '" + value.constructor.name + "'");
    }` : `` }
    `;
    }
    case JavaScriptType.ARRAY_OF_OBJECTS: {
      return `
    if (value !== null ${ validate ? `&& value.constructor === Array` : `` }) {
      this._${member.name} = value;
    } else if (value === null) {
      this._${member.name} = null;
    } ${ validate ? `else {
      throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}': Expected 'Array ${member.type}' but got '" + value.constructor.name + "'");
    } ` : `` }
    `;
    }
    case JavaScriptType.TYPED_ARRAY: {
      let instr = "BigInt64";
      let byteStride = getDataViewInstructionStride(instr);
      let offset = getHexaByteOffset(byteOffset / byteStride);
      return `
    if (value !== null ${ validate ? `&& value.constructor === ${member.jsTypedArrayName}` : `` }) {
      this._${member.name} = value;
      this.memoryView${instr}[${offset}] = getAddressFromArrayBuffer(value.buffer);
    } else if (value === null) {
      this._${member.name} = null;
      this.memoryView${instr}[${offset}] = BI0;
    } ${ validate ? `else {
      throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}': Expected '${member.jsTypedArrayName}' but got '" + value.constructor.name + "'");
    }` : `` }
    `;
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
    if (value !== null ${ validate ? `&& (value instanceof Object)` : `` }) {
      let {sType} = value;
      ${ validate ? `if (sType <= -1) throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}'");` : `` }
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
    } ${ validate ? `else {
      throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}'");
    }` : `` }
    `;
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
        return `
  if (this._${member.name} !== null) {
    this._${member.name}.flush();
    if (this.memoryBuffer !== this._${member.name}.memoryBuffer) {
      let srcView = new Uint8Array(this._${member.name}.memoryBuffer);
      let dstView = new Uint8Array(this.memoryBuffer);
      dstView.set(srcView, ${byteOffset});
      ${ validate ? `if (ENABLE_SHARED_MEMORY_HINTS) console.warn("'${currentStruct.name}.${member.name}' isn't used as shared-memory");` : `` }
    }
  }`;
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
    ${ validate ? `
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
    };` : `` }
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
    ${ validate ? `
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
    };` : `` }
    for (let ii = 0; ii < array.length; ++ii) {
      this.memoryView${instr}[${offset} + ii] = array[ii];
    };
  } else {
    ${!currentStruct.isUnionType ? `this.memoryView${instr}[${offset}] = 0x0;` : ``}
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
    ${ validate ? `
    if (array.length !== ${isNumber ? length : `this.${length}`}) {
      throw new RangeError("Invalid array length, expected length of '${length}' for '${currentStruct.name}.${member.name}'");
      return false;
    }` : `` }
    for (let ii = 0; ii < array.length; ++ii) {
      ${ validate ? `
      if (array[ii].constructor !== ${member.type}) {
        throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}[" + ii + "]': Expected '${member.type}' but got '" + array[ii].constructor.name + "'");
        return false;
      }` : `` }
      ${member.isStructType ? `if (!array[ii].flush()) return false;` : ``}
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

export default function(astReference, includeValidations, calls, handles, structs) {
  ast = astReference;
  validate = includeValidations;
  enumLayouts = getEnumLayouts();
  enumLayoutTable = getEnumLayoutTable();
  memoryLayouts = getMemoryLayouts();
  let output = `
"use strict";

const {platform} = process;
const nvk = require("./build/Release/addon-" + platform + ".node");

let ENABLE_SHARED_MEMORY_HINTS = !!process.env.npm_config_enable_shared_memory_hints;
if (!ENABLE_SHARED_MEMORY_HINTS) {
  process.argv.map(arg => {
    if (arg.match("enable-shared-memory-hints")) ENABLE_SHARED_MEMORY_HINTS = true;
  });
}

const getAddressFromArrayBuffer = nvk.getAddressFromArrayBuffer;
const getArrayBufferFromAddress = nvk.getArrayBufferFromAddress;

global.ArrayBuffer.prototype.getAddress = function() {
  return getAddressFromArrayBuffer(this);
};

global.ArrayBuffer.fromAddress = function(address, byteLength) {
  return getArrayBufferFromAddress(address, BigInt(byteLength));
};

const BI0 = BigInt(0);
const NULLT = String.fromCharCode(0x0);

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function decodeNullTerminatedUTF8String(view) {
  let terminator = view.indexOf(0x0);
  let subview = view.subarray(0, terminator > -1 ? terminator : view.length);
  return textDecoder.decode(subview);
};

class NativeStringArray {
  constructor(array) {
    this.array = array;
    this.address = BI0;
    let stringBuffers = [];
    let addressView = new BigInt64Array(array.length);
    let addressBuffer = addressView.buffer;
    let addressBufferAddress = getAddressFromArrayBuffer(addressBuffer);
    for (let ii = 0; ii < array.length; ++ii) {
      let strBuffer = textEncoder.encode(array[ii] + NULLT).buffer;
      addressView[ii] = getAddressFromArrayBuffer(strBuffer);
      stringBuffers.push(strBuffer);
    };
    this.address = addressBufferAddress;
    // keep references to prevent deallocation
    this.addressBuffer = addressBuffer;
    this.stringBuffers = stringBuffers;
  }
};

class NativeObjectArray {
  constructor(array) {
    this.array = array;
    this.address = BI0;
    let byteStride = array[0].memoryBuffer.byteLength;
    let objectBuffer = new ArrayBuffer(array.length * byteStride);
    let objectBufferView = new Uint8Array(objectBuffer);
    let objectBufferAddress = getAddressFromArrayBuffer(objectBuffer);
    for (let ii = 0; ii < array.length; ++ii) {
      let byteOffset = ii * byteStride;
      let srcView = new Uint8Array(array[ii].memoryBuffer);
      let dstView = objectBufferView.subarray(byteOffset, byteOffset + byteStride);
      dstView.set(srcView, 0x0);
    };
    this.address = objectBufferAddress;
    // keep reference to prevent deallocation
    this.objectBuffer = objectBuffer;
  }
};

class NativeObjectReferenceArray {
  constructor(array) {
    this.array = array;
    this.address = BI0;
    let addressView = new BigInt64Array(array.length);
    let addressBuffer = addressView.buffer;
    let addressBufferAddress = getAddressFromArrayBuffer(addressBuffer);
    for (let ii = 0; ii < array.length; ++ii) {
      let object = array[ii];
      let objectAddress = object.address;
      addressView[ii] = objectAddress;
    };
    this.address = addressBufferAddress;
    // keep reference to prevent deallocation
    this.addressBuffer = addressBuffer;
  }
};
`;
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
  output += `\nmodule.exports = {\n`;
  // add additional c++ content
  output += `  ...(nvk.$getVulkanEnumerations()),\n`;
  output += `  VK_MAKE_VERSION: nvk.VK_MAKE_VERSION,\n`;
  output += `  VK_VERSION_MAJOR: nvk.VK_VERSION_MAJOR,\n`;
  output += `  VK_VERSION_MINOR: nvk.VK_VERSION_MINOR,\n`;
  output += `  VK_VERSION_PATCH: nvk.VK_VERSION_PATCH,\n`;
  output += `  VK_API_VERSION_1_0: nvk.VK_API_VERSION_1_0,\n`;
  output += `  VK_API_VERSION_1_1: nvk.VK_API_VERSION_1_1,\n`;
  output += `  vkUseDevice: nvk.vkUseDevice,\n`;
  output += `  vkUseInstance: nvk.vkUseInstance,\n`;
  // add VulkanWindow
  output += `  VulkanWindow: nvk.VulkanWindow,\n`;
  calls.map(call => {
    output += `  ${call.name}: nvk.${call.name},\n`;
  });
  handles.map(handle => {
    output += `  ${handle.name},\n`;
  });
  structs.map((struct, index) => {
    let comma = index < structs.length - 1 ? `,\n` : ``;
    output += `  ${struct.name}${comma}`;
  });
  output += `\n};\n`;
  return output;
};
