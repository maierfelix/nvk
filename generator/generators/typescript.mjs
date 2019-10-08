/**

  Generates a typescript type definition file

**/
import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

import {
  warn,
  isIgnoreableType,
  getFunctionByFunctionName
} from "../utils.mjs";

import {
  JavaScriptType,
  getJavaScriptType
} from "../javascript-type.mjs";

let ast = null;
let calls = null;
let functionPointers = null;
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

function getEnumByName(name) {
  for (let ii = 0; ii < enums.length; ++ii) {
    if (enums[ii].name === name) return enums[ii];
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

function getTypescriptType(object) {
  let jsType = getJavaScriptType(ast, object);
  let {type} = jsType;
  switch (type) {
    case JavaScriptType.UNKNOWN: {
      return ``;
    }
    case JavaScriptType.NULL: {
      return `null`;
    }
    case JavaScriptType.BOOLEAN: {
      return `boolean`;
    }
    case JavaScriptType.NUMBER: {
      if (jsType.isEnum || jsType.isBitmask) {
        return `${jsType.value}`;
      }
      return `number`;
    }
    case JavaScriptType.OBJECT: {
      return `${object.type} | null`;
    }
    case JavaScriptType.STRING: {
      return `string | null`;
    }
    case JavaScriptType.FUNCTION: {
      let relativeFunction = getFunctionByFunctionName(ast, object.type);
      return `${relativeFunction.name} | null`;
    }
    case JavaScriptType.BIGINT: {
      return `bigint | number`;
    }
    case JavaScriptType.OBJECT_INOUT: {
      return (jsType.value === `BigInt` ? `VkInoutAddress` : `VkInout`) + ` | null`;
    }
    case JavaScriptType.ARRAY_OF_STRINGS: {
      return `string[] | null`;
    }
    case JavaScriptType.ARRAY_OF_NUMBERS: {
      return `number[] | null`;
    }
    case JavaScriptType.ARRAY_OF_OBJECTS: {
      return `${object.type}[] | null`;
    }
    case JavaScriptType.TYPED_ARRAY: {
      return `${object.jsTypedArrayName} | null`;
    }
  };
  warn(`Cannot resolve doc type ${type} for ${object.name}`);
  return ``;
};

function processStructMembers(name, optional) {
  let out = [];
  let struct = getStructByName(name);
  struct.children.map((member, index) => {
    let type = getTypescriptType(member);
    let newLine = (index <= struct.children.length - 2) ? "\n" : "";
    let readonly = struct.returnedonly ? "readonly " : "";
    let txt = `
    /**
     *${getObjectDescription(member)}
     */
`;
    txt += `    ${readonly}${member.name}${optional ? "?" : ""}: ${type};${newLine}`;
    out.push(txt);
  });
  return out.join("");
};

function processCallParameters(call) {
  let out = [];
  call.params.map(param => {
    let {name} = param;
    let type = getTypescriptType(param);
    // ignore
    if (name === "pAllocator") type = `null`;
    out.push(`${name}: ${type}`);
  });
  return out.join(", ");
};

function processCallReturn(call) {
  let type = call.rawType;
  if (call.enumType) return call.enumType;
  switch (type) {
    case "void":
      return `void`;
    case "int8_t":
    case "int16_t":
    case "int32_t":
    case "uint8_t":
    case "uint16_t":
    case "uint32_t":
      return "number";
    case "uint64_t":
      return "bigint";
    default:
      warn(`Cannot handle call param return type ${type} in ts-call-return!`);
  };
  return `void`;
};

function processCall(call) {
  if (isIgnoreableType(call)) return ``;
  let params = processCallParameters(call);
  let ret = processCallReturn(call);
  let paramDescrs = [];
  call.params.map(param => {
     paramDescrs.push(`   * @param ${param.name}${getObjectDescription(param)}`); 
  });
  let out = `
  /**
   * ${getObjectDescription(call)}
${paramDescrs.join("\n")}
   */
  export function ${call.name}(${params}): ${ret};`;
  return out;
};

function processFunctionPointerReturn(functionPtr) {
  let type = functionPtr.rawType;
  if (functionPtr.enumType) return functionPtr.enumType;
  if (functionPtr.isBoolean) return "boolean";
  switch (type) {
    case "void":
      return `void`;
    case "int8_t":
    case "int16_t":
    case "int32_t":
    case "uint8_t":
    case "uint16_t":
    case "uint32_t":
      return "number";
    case "uint64_t":
      return "bigint";
    default:
      warn(`Cannot handle function pointer param return type ${type} in ts-function-pointer-return!`);
  };
  return `void`;
};

function processFunctionPointerParameters(functionPtr) {
  let out = [];
  functionPtr.params.map(param => {
    let {name} = param;
    let type = getTypescriptType(param);
    // ignore
    if (name === "pUserData") type = `null`;
    out.push(`${name}: ${type}`);
  });
  return out.join(",\n      ");
};

function processFunctionPointer(functionPtr) {
  let params = processFunctionPointerParameters(functionPtr);
  let ret = processFunctionPointerReturn(functionPtr);
  let paramDescrs = [];
  functionPtr.params.map(param => {
     paramDescrs.push(`   * @param ${param.name}${getObjectDescription(param)}`); 
  });
  let out = `
  /**
   * ${getObjectDescription(functionPtr)}
${paramDescrs.join("\n")}
   */
  export interface ${functionPtr.name} {
    (
      ${params}
    ) : ${ret}
  }`;
  return out;
};

function processEnumMemberDescriptions(enu, member) {
  return `* @member ${member.name}${getObjectDescription(member)}`;
};

function expandMacro(macro, macroIndex, text) {
  let {kind, value} = macro;
  let match = text.match(`{#${macroIndex}#}`);
  if (!match) {
    warn(`Failed to expand '${kind}' macro for: ${text}`);
    return text;
  }
  let replacement = null;
  switch (kind) {
    case "slink":
    case "sname":
    case "flink":
    case "fname": {
      replacement = `'${value}'`;
    } break;
    case "pname":
    case "ename":
    case "elink":
    case "dlink":
    case "tlink":
      replacement = `'${value}'`;
    break;
    case "etext":
      switch (value) {
        case "SINT":
        case "UINT":
          replacement = `'${value}'`;
        break;
      };
    break;
    case "code":
    case "basetype":
      replacement = `'${value}'`;
    break;
    case "can":
    case "cannot":
    case "may":
    case "must":
    case "should":
    case "optional":
    case "required":
    case "undefined":
      replacement = `'${kind}'`;
    break;
  };
  if (replacement !== null) {
    text = text.replace(match[0], replacement);
  } else {
    warn(`Failed to expand macro ${kind}:${value}`);
  }
  return text;
};

function getMacroExpandedDescription(doc) {
  if (!doc) return ``;
  let {macros, description} = doc;
  let out = doc.description;
  macros.map((macro, index) => {
    out = expandMacro(macro, index, out);
  });
  return out;
};

function getObjectDescription(obj) {
  let {documentation} = obj;
  let description = getMacroExpandedDescription(documentation);
  return description;
};

function getObjectDocumentation(name) {
  let enu = getEnumByName(name);
  let struct = getStructByName(name);
  let handle = getHandleByName(name);
  let object = enu || struct || handle;
  return `
  /**
   * ${getObjectDescription(object)}
   */`;
};

export default function(astReference, data) {
  ast = astReference;
  calls = data.calls;
  enums = data.enums;
  structs = data.structs;
  handles = data.handles;
  includes = data.includes;
  functionPointers = data.functionPointers;
  let vars = {
    calls,
    enums,
    structs,
    handles,
    includes,
    functionPointers,
    processCall,
    getEnumByName,
    getStructByName,
    isHandleInclude,
    isStructInclude,
    processStructMembers,
    getObjectDescription,
    getObjectDocumentation,
    processFunctionPointer,
    processEnumMemberDescriptions
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
