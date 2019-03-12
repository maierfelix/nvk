import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

import {
  warn,
  isPNextMember,
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
  if (jsType.isNumeric) {
    if (jsType.type === JavaScriptType.BIGINT) return `this._${member.name} = 0n;`;
    return ``; // no reflection needed
  }
  if (jsType.isNullable) return `this._${member.name} = null;`;
  warn(`Cannot resolve constructor initializer for ${member.name}`);
  return ``;
};

function getStructureMemberByteOffset(member) {
  if (!memoryLayouts) return 0;
  let byteOffset = memoryLayouts[currentStruct.name][member.name].byteOffset;
  return `0x` + byteOffset.toString(16).toUpperCase();
};

function getStructureMemberByteLength(member) {
  if (!memoryLayouts) return 0;
  let byteLength = memoryLayouts[currentStruct.name][member.name].byteLength;
  return `0x` + byteLength.toString(16).toUpperCase();
};

function getStructureByteLength() {
  if (!memoryLayouts) return 0;
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
      return `String`;
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
  let {type, value} = getJavaScriptType(ast, member);
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
      this._${member.name} = value;
    } else if (value === null) {
      this._${member.name} = null;
    } else {
      throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}': Expected '${member.type}' but got '" + value.constructor.name + "'");
    }`;
    }
    case JavaScriptType.STRING: {
      return `String`;
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
    if (value !== null && value.constructor === ${member.jsType}) {
      this._${member.name} = value;
    } else if (value === null) {
      this._${member.name} = null;
    } else {
      throw new TypeError("Invalid type for '${currentStruct.name}.${member.name}': Expected '${member.jsType}' but got '" + value.constructor.name + "'");
    }`;
    }
  };
  return ``;
  warn(`Cannot resolve setter processor for ${member.name} of type ${type}`);
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
    warn(`
! Module needs recompilation !
Memory layouts aren't resolved yet, module needs to be re-compiled this time
The code generater can only inline required memory layout offets after second compilation
`);
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
