import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

import {
  warn,
  isFillableMember,
  isIgnoreableType,
  isFlushableMember
} from "../utils";

import {
  JavaScriptType,
  getJavaScriptType
} from "../javascript-type";

let ast = null;
let currentStruct = null;

const JS_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/js/struct-js.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

function getDataWriterNumeric(member) {
  let writer = ``;
  switch (member.type) {
    case "int": writer = `setInt32`; break;
    case "float": writer = `setFloat32`; break;
    case "size_t": writer = `setBigInt64`; break;
    case "int32_t": writer = `setInt32`; break;
    case "uint8_t": writer = `setUint8`; break;
    case "uint32_t": writer = `setUint32`; break;
    case "uint64_t": writer = `setBigUint64`; break;
    default:
      warn(`Cannot resolve numeric data writer for ${member.name}`);
  };
  return writer;
};

function getConstructorInitializer(member) {
  let jsType = getJavaScriptType(ast, member);
  if (jsType.isNumeric) {
    if (jsType.type === JavaScriptType.BIGINT) return `0n`;
    return `0`;
  }
  if (jsType.isNullable) return `null`;
  warn(`Cannot resolve constructor initializer for ${member.name}`);
};

function getSetterProcessor(member) {
  let struct = currentStruct;
  let {type, value} = getJavaScriptType(ast, member);
  let byteOffset = `$${struct.name}.${member.name}.byteOffset`;
  switch (type) {
    case JavaScriptType.NUMBER: {
      return `
this.memoryView.${getDataWriterNumeric(member)}(${byteOffset}, value);
this._${member.name} = value;`;
    }
    case JavaScriptType.OBJECT: {
      
    }
    case JavaScriptType.STRING: {
      return `String`;
    }
    case JavaScriptType.FUNCTION: {
      
    }
    case JavaScriptType.BIGINT: {
      
    }
    case JavaScriptType.OBJECT_INOUT: {
      
    }
    case JavaScriptType.ARRAY_OF_STRINGS: {
      
    }
    case JavaScriptType.ARRAY_OF_NUMBERS: {
      
    }
    case JavaScriptType.ARRAY_OF_OBJECTS: {
      
    }
    case JavaScriptType.TYPED_ARRAY: {
      
    }
  };
  return ``;
  warn(`Cannot resolve setter processor for ${object.name}`);
  return ``;
};

export default function(astReference, struct) {
  ast = astReference;
  currentStruct = struct;
  let vars = {
    struct,
    isFillableMember,
    isIgnoreableType,
    isFlushableMember,
    getSetterProcessor,
    getConstructorInitializer
  };
  let template = JS_TEMPLATE;
  let output = nunjucks.renderString(template, vars);
  return output;
};
