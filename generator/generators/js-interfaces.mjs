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
  getDataViewInstruction
} from "../utils";

import {
  JavaScriptType,
  getJavaScriptType
} from "../javascript-type";

let ast = null;
let currentStruct = null;

const JS_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/js/struct-js.njk`, "utf-8");

let memoryLayouts = null;

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
  warn(`Cannot resolve constructor initializer for ${member.name}`);
  return ``;
};

function getStructureMemberByteOffset(member) {
  if (!memoryLayouts) return `0x0`;
  let byteOffset = memoryLayouts[currentStruct.name][member.name].byteOffset;
  return `0x` + byteOffset.toString(16).toUpperCase();
};

function getStructureMemberByteLength(member) {
  if (!memoryLayouts) return `0x0`;
  let byteLength = memoryLayouts[currentStruct.name][member.name].byteLength;
  return `0x` + byteLength.toString(16).toUpperCase();
};

function getStructureByteLength() {
  if (!memoryLayouts) return `0x0`;
  let byteLength = memoryLayouts[currentStruct.name].byteLength;
  return `0x` + byteLength.toString(16).toUpperCase();
};

function getGetterProcessor(member) {
  let {type, value} = getJavaScriptType(ast, member);
  let byteOffset = getStructureMemberByteOffset(member);
  switch (type) {
    case JavaScriptType.NUMBER:
    case JavaScriptType.BIGINT: {
      return `
    return this.memoryView.get${getDataViewInstruction(member)}(${byteOffset});`;
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
      return `
    this.memoryView.set${getDataViewInstruction(member)}(${byteOffset}, value);`;
    }
    case JavaScriptType.OBJECT: {
      return `
    if (value !== null && value.constructor === ${member.type}) {
      value.flush();
      this._${member.name} = value;
      this.memoryView.setBigInt64(${byteOffset}, value.memoryAddress);
    } else if (value === null) {
      this._${member.name} = null;
      this.memoryView.setBigInt64(${byteOffset}, 0n);
    } else {
      throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}': Expected '${member.type}' but got '" + value.constructor.name + "'");
    }`;
    }
    case JavaScriptType.STRING: {
      return `
    if (value !== null && value.constructor === String) {
      this._${member.name} = textEncoder.encode(value + String.fromCharCode(0x0)).buffer;
      this.memoryView.setBigInt64(${byteOffset}, getAddressFromArrayBuffer(this._${member.name}));
    } else if (value === null) {
      this._${member.name} = null;
      this.memoryView.setBigInt64(${byteOffset}, 0n);
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
      return `
    if (value !== null && value.constructor === ${member.jsTypedArrayName}) {
      this._${member.name} = value;
      this.memoryView.setBigInt64(${byteOffset}, getAddressFromArrayBuffer(value.buffer));
    } else if (value === null) {
      this._${member.name} = null;
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
        case ${structExt.sType}:`;
    });
    return `
    if (value !== null) {
      if (value.sType <= -1) throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}'");
      switch (value.sType) {
          ${conditions}
          break;
        default:
          throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}'");
      };
      this._${member.name} = value;
      this.memoryView.setBigInt64(${byteOffset}, value.memoryAddress);
    } else if (value === null) {
      this.memoryView.setBigInt64(${byteOffset}, 0n);
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
    case JavaScriptType.OBJECT: {
      return ``;
    }
    case JavaScriptType.STRING: {
      return ``; // not needed
    }
    case JavaScriptType.ARRAY_OF_STRINGS: {
      return `
  if (this._${member.name} !== null) {
    let nativeArray = new NativeStringArray(this._${member.name});
    this._${member.name}Native = nativeArray;
    this.memoryView.setBigInt64(${byteOffset}, nativeArray.address);
  }`;
    }
    case JavaScriptType.ARRAY_OF_NUMBERS: {
      return `
  if (this._${member.name} !== null) {
    let array = this._${member.name};
    for (let ii = 0; ii < array.length; ++ii) {
      this.memoryView.set${getDataViewInstruction(member)}(${byteOffset}, array[ii]);
    };
  }`;
    }
    case JavaScriptType.ARRAY_OF_OBJECTS: {
      // TODO: static
      let {length} = member;
      let isNumber = Number.isInteger(parseInt(length));
      return `
  if (this._${member.name} !== null) {
    let array = this._${member.name};
    if (array.length !== ${isNumber ? length : `this.${length}`}) {
      throw new RangeError("Invalid array length, expected length of '${length}' for '${currentStruct.name}.${member.name}'");
      return false;
    }
    for (let ii = 0; ii < array.length; ++ii) {
      if (!array[ii].flush()) return false;
    };
    let nativeArray = new NativeObjectArray(array);
    this._${member.name}Native = nativeArray;
    this.memoryView.setBigInt64(${byteOffset}, nativeArray.address);
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
  if (sType) return `this.sType = ${sType};`;
  return ``;
};

export default function(astReference, struct) {
  ast = astReference;
  currentStruct = struct;
  let memoryLayoutsPath = (
    `${pkg.config.GEN_OUT_DIR}/${global.vkVersion}/${process.platform}/memoryLayouts.json`
  );
  if (!fs.existsSync(memoryLayoutsPath)) {
    if (!global.MEMORY_LAYOUT_RECOMPILATION) {
      warn(`Module needs recompilation:
Memory layouts aren't resolved yet, module needs to be re-compiled this time
The code generater can only inline required memory layout offets after second compilation
      `);
      global.MEMORY_LAYOUT_RECOMPILATION = true;
    }
  } else {
    memoryLayouts = JSON.parse(fs.readFileSync(memoryLayoutsPath, "utf-8"));
  }
  let vars = {
    struct,
    isFillableMember,
    isIgnoreableType,
    isFlushableMember,
    getGetterProcessor,
    getSetterProcessor,
    getFlusherProcessor,
    getStructureAutoSType,
    getStructureByteLength,
    getConstructorInitializer,
    getStructureMemberByteOffset,
    getStructureMemberByteLength
  };
  let template = JS_TEMPLATE;
  let output = nunjucks.renderString(template, vars);
  return output;
};
