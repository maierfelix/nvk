/**

  Generates a processable AST from vulkan specification files

**/
import xml from "xml-js";
import pkg from "../../package.json";
import parseDocumentation from "../doc-parser.mjs";

import {
  warn,
  isPNextMember,
  getNodeByName,
  formatIntToHex,
  isIgnoreableType,
  getAutoStructureType,
  getStructByStructName,
  isNumericReferenceType,
  getJavaScriptTypedArrayName
} from "../utils.mjs";

let xmlOpts = {
  ignoreComment: true,
  ignoreInstruction: true
};

let uidx = 0;
let TYPES = {
  STRUCT: uidx++,
  STRUCT_MEMBER: uidx++,
  HANDLE: uidx++,
  ENUM: uidx++,
  ENUM_MEMBER: uidx++,
  PLATFORM_INCLUDE: uidx++,
  ENUM_STRING: uidx++,
  COMMAND: uidx++,
  COMMAND_MEMBER: uidx++,
  COMMAND_PARAM: uidx++,
  COMMAND_PROTO: uidx++,
  EXTENSION: uidx++,
  EXTENSION_MEMBER: uidx++,
  EXTENSION_MEMBER_ENUM: uidx++,
  EXTENSION_MEMBER_COMMAND: uidx++,
  EXTENSION_MEMBER_STRUCT: uidx++,
  BITMASK: uidx++,
  UNKNOWN: uidx++,
  VALUE: uidx++,
  BITPOS: uidx++,
  ALIAS: uidx++,
  FUNCTION_POINTER: uidx++
};

for (let key in TYPES) TYPES[key] = key;

let enums = {};
let structs = {};
let bitmasks = {};
let basetypes = {};
let handles = {};

function findXMLElements(node, cond, out) {
  if (!node) return null;
  // match test
  {
    if (cond instanceof Object) {
      if (node.attributes) {
        let attr = node.attributes;
        for (let key in cond) {
          if (attr[key] && attr[key] === cond[key]) {
            out.push(node);
          }
        };
      }
    } else if (typeof cond === "string") {
      if (node.name === cond) out.push(node);
    } else {
      throw `Invalid node match condition!`;
    }
  }
  // walk
  if (node.elements) {
    node.elements.map(el => {
      findXMLElements(el, cond, out);
    });
  }
};

function parseElement(el) {
  let attr = el.attributes;
  let {elements} = el;
  if (!attr) throw `Expected element attribute, found ${attr}!`;
  //console.log(`Parsing name:${name}, type:${type}..`);
  if (attr.category === "funcpointer") {
    return parseFunctionPointerElement(el);
  }
  switch (el.name) {
    case "enums":
      return parseEnumElement(el);
    case "type":
      return parseStructElement(el);
    case "commands":
      return parseCommandElement(el);
    case "extensions":
      return parseExtensionElement(el);
    default: {
      throw `Unsupported element of type:${el.name}`;
    }
  };
  return null;
};

// super messy to parse, khronos plzzz
function parseFunctionPointerElement(parent) {
  let out = {};
  let {elements} = parent;
  if (!elements) return out;
  let name = elements.filter(child =>child.name === "name")[0].elements[0].text;
  let params = [];
  let typeElements = [];
  if (name === "PFN_vkVoidFunction") return null;
  if (name) {
    let fnType = elements[0].text;
    let match = /^(typedef?) (.*) \((.*)/gm.exec(fnType);
    if (match[1] !== "typedef") warn(`Invalid function pointer type signatur: Expected 'typedef' but got '${match[1]}'`);
    if (match[3] !== "VKAPI_PTR *") warn(`Invalid function pointer type signatur: Expected 'VKAPI_PTR *' but got '${match[3]}'`);
    // turn void* into void *
    match[2] = match[2].replace("void*", "void *");
    let typeElement = [];
    // 1. type string
    typeElement.push({ type: "element", name: "type", elements: [ { type: "text", text: match[2] } ] });
    // 2. pointer
    let dereferenceCount = match[2].split(/\*/g).length - 1;
    if (dereferenceCount > 0) {
      if (dereferenceCount > 1) throw `Unsupported dereference count!`;
      typeElement.push({ type: "text", text: "* " });
    }
    let type = parseTypeElement({
      type: "element",
      name: "member",
      attributes: {},
      elements: typeElement
    });
    // TODO: wtf?
    if (type.dereferenceCount > 1) {
      type.dereferenceCount = 1;
      type.text = type.text.replace(`void * *`, `void *`);
    }
    Object.assign(out, type);
  }
  for (let ii = 0; ii < elements.length; ii += 2) {
    if (ii <= 2) continue;
    let element = elements[ii];
    let next = elements[ii + 1] || element;
    let previous = elements[ii - 1] || element;
    let type = previous.elements[0].text;
    let memberName = "";
    let isConstant = false;
    let dereferenceCount = 0;
    // name
    {
      let str0 = element.text.trim().replace(/\n/gm, ``).replace(/ /gm, ``);
      if (elements[ii - 2] && elements[ii - 2].text) {
        isConstant = !!(elements[ii - 2].text).match("const ");
      }
      str0 = str0.replace(/,const/gm, "");
      memberName = str0.substr(0, str0.indexOf(",")).trim();
      memberName = str0.replace(/[^a-z0-9]/gi, "");
      dereferenceCount = str0.split(/\*/g).length - 1;
    }
    let typeElement = [];
    // convert into AST parser schema
    // 1. const
    if (isConstant) {
      typeElement.push({ type: "text", text: "const " });
    }
    // 2. type string
    typeElement.push({ type: "element", name: "type", elements: [ { type: "text", text: type } ] });
    // 3. pointer
    if (dereferenceCount > 0) {
      if (dereferenceCount > 1) throw `Unsupported dereference count!`;
      typeElement.push({ type: "text", text: "* " });
    }
    // 4. name
    typeElement.push({ type: "element", name: "name", elements: [ { type: "text", text: memberName } ] });
    typeElements.push(typeElement);
  };
  typeElements.map(elements => {
    let input = {
      type: "element",
      name: "member",
      attributes: {},
      elements
    };
    params.push(parseTypeElement(input));
  });
  // normalize "PFN_"
  if (name.substr(0, 4) === "PFN_") name = name.substr(4);
  else warn(`Cannot normalize function pointer name '${name}'`);
  out.kind = TYPES.FUNCTION_POINTER;
  out.name = name;
  out.params = params;
  // find 'pUserData' param and reserve it
  let pUserData = out.params.find(param => param.name === "pUserData" && param.isDynamicVoidPointer);
  if (!pUserData) {
    warn(`Cannot reserve 'pUserData' parameter for '${out.name}'`);
  }
  let pUserDataIndex = out.params.indexOf(pUserData);
  //out.params.splice(pUserDataIndex, 1);
  // TODO: what do now?
  return out;
};

function parseExtensionElement(parent) {
  let attr = parent.attributes;
  let {elements} = parent;
  let out = [];
  if (!elements) return out;
  elements.map((child, index) => {
    switch (child.name) {
      case "extension": {
        let attr = child.attributes;
        let members = [];
        let ext = {
          kind: TYPES.EXTENSION,
          name: attr.name,
          type: attr.type,
          author: attr.author,
          platform: attr.platform || "default",
          supported: attr.supported,
          members
        };
        let exts = parseExtensionMembers(parent, child);
        exts.map(ext => {
          members.push(ext);
        });
        out.push(ext);
      } break;
      default: throw `Unsupported extension member ${child.name}`;
    };
  });
  return out;
};

function parseExtensionMembers(parent, child) {
  let out = [];
  let {elements} = child;
  if (!elements) return out;
  let baseNum = child.name === "extension" ? parseInt(child.attributes.number, 0) : 0;
  elements.map(el => {
    (el.elements || []).map(ch => {
      if (ch.name === "comment") return;
      let attr = ch.attributes;
      if (!attr) return;
      let {name} = attr;
      let member = {
        kind: TYPES.EXTENSION_MEMBER
      };
      if (ch.name === "command") {
        member.kind = TYPES.EXTENSION_MEMBER_COMMAND;
        member.name = attr.name;
        out.push(member);
      }
      else if (ch.name === "type") {
        member.kind = TYPES.EXTENSION_MEMBER_STRUCT;
        member.name = attr.name;
        out.push(member);
      }
      // we only care about enum extensions
      else if (ch.name === "enum") {
        if (attr.dir) member.isNegative = true;
        member.extends = attr.extends;
        member.kind = TYPES.EXTENSION_MEMBER_ENUM;
        if (attr.value) {
          member.name = attr.name;
          member.value = attr.value;
          if (attr.value[0] === `"`) member.isStringValue = true;
          else if (Number.isInteger(parseInt(attr.value))) member.isNumericValue = true;
          else member.isEnumValue = true;
          // reformat string
          if (member.isStringValue && member.value[0] === `"`) {
            member.value = member.value.substr(1, member.value.length - 2);
          }
          out.push(member);
        }
        else if (attr.offset) {
          member.name = attr.name;
          member.extends = attr.extends;
          let extBase = 1000000000;
          let extBlockSize = 1000;
          let offset = parseInt(attr.offset, 0);
          let extNumber = parseInt(attr.extnumber, 0) || baseNum;
          let numValue = extBase + (extNumber - 1) * extBlockSize + offset;
          if (member.isNegative) numValue = -numValue;
          member.value = numValue;
          out.push(member);
        }
        else if (attr.bitpos) {
          member.name = attr.name;
          member.extends = attr.extends;
          let pos = 1 << parseInt(attr.bitpos, 0);
          if (parseInt(attr.bitpos, 0) >= 32) {
            throw new RangeError(`Bit Position out of Range`);
          }
          member.value = formatIntToHex(pos);
          out.push(member);
        }
        else if (attr.alias) {
          let aliasedMember = out.filter(m => m.name === attr.alias)[0];
          member.name = attr.name;
          member.value = attr.value;
          member.extends = attr.extends;
          member.alias = attr.alias;
          member.isAlias = true;
          out.push(member);
          // push enum alias if it doesn't exist yet
          if (aliasedMember) {
            out.push({
              kind: TYPES.EXTENSION_MEMBER_ENUM,
              name: attr.name,
              extends: attr.extends,
              value: aliasedMember.value
            });
          }
        }
        else {
          // ignore
        }
      }
      else {
        throw `Unsupported extension member ${ch.name}`;
      }
    });
  });
  return out;
};

function parseCommandElement(parent) {
  let attr = parent.attributes;
  let {elements} = parent;
  let children = [];
  let out = {
    kind: TYPES.COMMAND,
    children
  };
  if (!elements) return out;
  elements.map((child, index) => {
    switch (child.name) {
      case "command": {
        let cmds = parseCommandMembers(parent, child);
        cmds.map(cmd => {
          children.push(cmd);
        });
      } break;
      default: throw `Unsupported enum member ${child.name}`;
    };
  });
  return out;
};

function parseCommandMembers(parent, child) {
  let {elements} = child;
  let type = null;
  let name = null;
  let cmds = [];
  if (elements) {
    elements.map(el => {
      let kind = (
        el.name === "param" ? TYPES.COMMAND_PARAM :
        el.name === "proto" ? TYPES.COMMAND_PROTO : TYPES.UNKNOWN
      );
      switch (el.name) {
        case "param":
        case "proto": {
          let ast = parseTypeElement(el);
          ast.kind = kind;
          cmds.push(ast);
        } break;
        // ignore
        case "implicitexternsyncparams": break;
        default: throw `Unknown command member type ${el.name}`;
      };
    });
  }
  return cmds;
};

function parseEnumElement(parent) {
  let attr = parent.attributes;
  let {elements} = parent;
  let type = (
    (attr.type === "enum") ? TYPES.ENUM :
    (attr.type === "bitmask") ? TYPES.BITMASK : TYPES.UNKNOWN
  );
  let children = [];
  let out = {
    kind: TYPES.ENUM,
    type,
    name: attr.name,
    children
  };
  registerEnum(out);
  if (!elements) return out;
  elements.map((child, index) => {
    switch (child.name) {
      case "enum": {
        let ast = parseEnumMember(parent, child);
        children.push(ast);
      } break;
      // ignore the following
      case "unused":
      case "comment": break;
      default: throw `Unsupported enum member ${child.name}`;
    };
  });
  return out;
};

function parseEnumMember(parent, child) {
  let childAttr = child.attributes;
  let parentAttr = parent.attributes;
  let value = (
    childAttr.value || childAttr.bitpos || childAttr.alias
  );
  let type = (
    (childAttr.value) ? TYPES.VALUE :
    (childAttr.bitpos) ? TYPES.BITPOS :
    (childAttr.alias) ? TYPES.ALIAS : null
  );
  if (!value) throw `Cannot resolve enum child value of parent ${parentAttr.name}`;

  let parsed = parseInt(value);
  let isFloat = value.indexOf(".") !== -1;
  if (type === "BITPOS") {
    let pos = 1 << parseInt(value, 0);
    value = formatIntToHex(pos);
  }
  if (Number.isNaN(parsed) || isFloat) {
    value = `(int32_t)${value}`;
  }

  let out = {
    kind: TYPES.ENUM_MEMBER,
    type,
    value,
    name: childAttr.name
    //parentName: parentAttr.name
  };
  return out;
};

function parseStructElement(parent) {
  let attr = parent.attributes;
  let {elements} = parent;
  let children = [];
  let out = {
    kind: TYPES.STRUCT,
    name: attr.name,
    needsReflection: false,
    returnedonly: !!attr.returnedonly,
    children
  };
  if (attr.alias) out.alias = attr.alias;
  if (attr.structextends) out.extends = attr.structextends.split(",");
  if (!elements) return out;
  elements.map((child, index) => {
    switch (child.name) {
      case "member": {
        let ast = parseTypeElement(child);
        ast.kind = TYPES.STRUCT_MEMBER;
        children.push(ast);
        if (child.attributes) {
          // custom sType
          if (child.attributes.values) {
            out.sType = child.attributes.values;
          }
        }
      } break;
      // ignore the following
      case "comment": break;
      default: throw `Unsupported struct member ${child.name}`;
    };
  });
  return out;
};

function parseTypeElement(child) {
  let attr = child.attributes || null;
  let {elements} = child;
  let str = [];
  let type = null;
  let name = null;
  elements.map(el => {
    if (el.name === "comment") return;
    switch (el.type) {
      case "text": str.push(el.text.trim()); break;
      case "element": {
        if (el.elements.length !== 1) {
          throw `Cannt parse struct member type with length ${el.elements.length}!`;
        }
        let text = el.elements[0].text.trim();
        if (el.name === "type") type = text;
        if (el.name === "name") name = text;
        str.push(text);
      } break;
      default: throw `Unknown struct member type element ${el.type}`;
    };
  });
  let text = str.join(" ");
  let staticArrayMatch = text.match(/\[([^)]+)\]/);
  let isConstant = !!text.match("const ");
  let dereferenceCount = text.split(/\*/g).length - 1;
  let raw = text.split(" ");
  if (raw.findIndex(s => s.match(":")) > 0) {
    const index = raw.findIndex(s => s.match(":"));
    raw.splice(index, 1);
  }
  if (raw.length > 1 && !staticArrayMatch) raw.pop();
  let rawType = raw.join(" ");
  let isEnumType = enums[type] !== void 0;
  let isStructType = structs[type] !== void 0;
  let isBitmaskType = bitmasks[type] !== void 0;
  let isBaseType = basetypes[type] !== void 0;
  let isHandleType = handles[type] !== void 0;
  let out = {
    text,
    type,
    rawType,
    name,
    isConstant,
    dereferenceCount
  };
  if (isBitmaskType) {
    out.bitmaskType = out.rawType;
    out.rawType = out.rawType.replace(out.type, `int32_t`);
    out.type = `int32_t`;
    out.bitmaskRawType = out.bitmaskType;
    if (bitmasks[type].requires) {
      out.bitmaskType = bitmasks[bitmasks[type].name].name;
    } else {
      out.bitmaskType = bitmasks[type];
    }
    type = out.type;
    out.isBitmaskType = true;
  }
  // note: manual type overwrite!
  if (isEnumType) {
    //out.isEnumType = true;
    out.enumType = out.type;
    out.enumRawType = out.rawType;
    out.rawType = out.rawType.replace(out.type, `int32_t`);
    out.type = `int32_t`;
    type = out.type;
  }
  if (isStructType) {
    out.isStructType = true;
  }
  // note: manual type overwrite!
  if (isBaseType) {
    out.rawType = out.rawType.replace(out.type, basetypes[type]);
    out.baseType = out.type;
    out.type = basetypes[type];
    type = out.type;
  }
  if (isHandleType) {
    out.isHandleType = true;
    out.handleType = handles[type];
  }
  if (attr && attr.hasOwnProperty("len")) {
    let len = attr.len;
    if (len === "null-terminated") {
      out.isString = true;
    } else {
      out.isArray = true;
      out.length = len;
      out.isDynamicArray = true;
      // fix array of strings length property
      if (!!out.length.match("null-terminated")) {
        out.length = out.length.replace(",null-terminated", "");
      }
    }
  }
  else if (staticArrayMatch) {
    let size = staticArrayMatch[1].trim();
    out.isArray = true;
    out.length = size;
    if (enums[size]) out.length = enums[size];
    out.isStaticArray = true;
    out.rawType = text.replace(name + " ", "");
    if (type === "char") out.isString = true;
  }
  if (rawType === "VkBool32") {
    out.isBoolean = true;
  }
  // just a number
  if (isNumber(out.rawType)) out.isNumber = true;
  // a numeric array
  if (out.isArray && isNumber(type)) out.isNumericArray = true;
  // a typed array
  if (out.isNumericArray && !out.isStaticArray) {
    if (isNumericReferenceType(out.rawType)) {
      out.isTypedArray = true;
      out.jsTypedArrayName = getJavaScriptTypedArrayName(out.rawType);
    }
  }
  // void pointer
  if (out.rawType === `void *` || out.rawType === `const void *`) {
    out.isVoidPointer = true;
    out.isContantVoidPointer = out.rawType === `const void *`;
    out.isDynamicVoidPointer = !out.isContantVoidPointer;
    if (!isPNextMember(out)) {
      out.isTypedArray = true;
      out.jsTypedArrayName = getJavaScriptTypedArrayName(out.rawType);
    }
  }
  // handle
  if (
    out.rawType === `HWND` ||
    out.rawType === `HANDLE` ||
    out.rawType === `HINSTANCE` ||
    out.rawType === `const SECURITY_ATTRIBUTES *`
  ) {
    out.isWin32Handle = true;
  }
  // handle reference
  if (out.rawType === `HANDLE *`) {
    out.isWin32HandleReference = true;
  }
  // TODO: For now we just interpret this as raw void pointers
  if (
    (out.rawType === "struct null *") ||
    (out.rawType === "const null *") ||
    (out.rawType === "const struct null *") ||
    (out.rawType === "struct null **")
  ) {
    out.type = "void";
    out.isContantVoidPointer = out.rawType === `const void *`;
    out.isDynamicVoidPointer = !out.isContantVoidPointer;
  }
  // function
  if (out.type.substr(0, 4) === `PFN_`) out.isFunction = true;
  // figure out js relative type
  {
    let jsType = "undefined";
    if (out.isNumber) jsType = "Number";
    if (out.isFunction) jsType = "Function";
    else if (out.isString || out.rawType === "LPCWSTR") jsType = "String";
    else if (out.isTypedArray) jsType = "ArrayBufferView";
    else if (out.isVoidPointer) jsType = "ArrayBuffer";
    else if (out.isArray) jsType = "Array";
    else if (out.isStructType || out.isHandleType) jsType = "Object";
    else if (!out.isConstant && isNumericReferenceType(out.rawType)) jsType = "Object";
    else if (out.isWin32Handle) jsType = "BigInt";
    else if (out.isWin32HandleReference) jsType = "Object";
    out.jsType = jsType;
  }
  return out;
};

function registerStruct(struct) {
  let {name} = struct;
  if (structs[name]) warn(`Struct ${name} already registered!`);
  structs[name] = 1;
};

function registerEnum(enu) {
  let {name} = enu;
  if (enums[name]) warn(`Enum ${name} already registered!`);
  enums[name] = enu.value || 1;
};

function isNumber(type) {
  switch (type) {
    case "int":
    case "float":
    case "size_t":
    case "int8_t":
    case "int32_t":
    case "int64_t":
    case "uint8_t":
    case "uint16_t":
    case "uint32_t":
    case "uint64_t":
    case "DWORD":
      return true;
  };
  return false;
};

function getDocumentationEntryByName(name, docs) {
  for (let ii = 0; ii < docs.length; ++ii) {
    let entry = docs[ii];
    let {description} = entry;
    if (description.name === name) return entry;
    if (entry.equivalents && entry.equivalents.indexOf(name) > -1) return entry;
  };
  return null;
};

function getNodeChildByName(node, name) {
  let children = node.children || node.params || [];
  for (let ii = 0; ii < children.length; ++ii) {
    let child = children[ii];
    if (child.name === name) return child;
  };
  return null;
};

function fillDocumentation(objects, docs) {
  objects.map(object => {
    let doc = getDocumentationEntryByName(object.name, docs);
    if (!doc) {
      // fill with empty documentation information
      object.documentation = { macros: [], category: "", description: "" };
      (object.children || object.params || []).map(child => {
        child.documentation = { macros: [], description: "" };
      });
      return warn(`Missing documentation for ${object.name}`);
    }
    doc.children.map(c => {
      if (!c) return;
      let child = getNodeChildByName(object, c.name);
      if (child) {
        child.documentation = {
          macros: c.macros,
          description: c.description
        };
      }
    });
    object.documentation = {
      macros: [],
      category: doc.category,
      description: doc.description.description
    };
  });
};

export default function({ xmlInput, version, docs } = _) {
  let obj = new xml.xml2js(xmlInput, xmlOpts);
  let out = [];
  // bitmask type links
  if (true) {
    let results = [];
    findXMLElements(obj, { category: "bitmask" }, results);
    results.map((res, i) => {
      let attr = res.attributes;
      if (attr.hasOwnProperty("requires")) {
        res.elements.map(el => {
          if (el.name === "name") {
            bitmasks[el.elements[0].text] = attr.requires;
            bitmasks[attr.requires] = { requires: el.elements[0].text, name: bitmasks[el.elements[0].text] };
          }
        });
      // future reserved
      } else {
        if (res.elements) {
          res.elements.map(el => {
            if (el.name === "name") {
              bitmasks[el.elements[0].text] = el.elements[0].text;
            }
          });
        }
      }
    });
  }
  // basetype definitions
  if (true) {
    let results = [];
    findXMLElements(obj, { category: "basetype" }, results);
    results.map((res, i) => {
      let name = null;
      let type = null;
      res.elements.map(el => {
        if (el.name === "type") type = el.elements[0].text;
        else if (el.name === "name") name = el.elements[0].text;
      });
      basetypes[name] = type;
    });
  }
  // struct definitions
  if (true) {
    let results = [];
    findXMLElements(obj, { category: "struct" }, results);
    results.map(res => {
      registerStruct(res.attributes);
    });
  }
  // union definitions
  if (true) {
    let results = [];
    findXMLElements(obj, { category: "union" }, results);
    results.map(res => {
      registerStruct(res.attributes);
    });
  }
  // handles
  if (true) {
    let results = [];
    findXMLElements(obj, { category: "handle" }, results);
    results.map((res, i) => {
      let name = null;
      let {parent} = res.attributes;
      if (!res.elements) return; // really ignore?
      let isNonDispatchable = res.elements[0].elements[0].text === "VK_DEFINE_NON_DISPATCHABLE_HANDLE";
      res.elements.map(el => {
        if (el.name === "name") name = el.elements[0].text;
      });
      handles[name] = parent || null;
      out.push({
        kind: TYPES.HANDLE,
        name,
        parent: parent || null,
        isNonDispatchable
      });
    });
  }
  // api constants
  if (true) {
    let results = [];
    findXMLElements(obj, { name: "API Constants" }, results);
    let ast = parseElement(results[0]);
    ast.name = "API_Constants";
    ast.children.map(child => {
      if (!enums[child.name]) enums[child.name] = child.value;
    });
    ast.children.push({
      kind: "ENUM_MEMBER",
      type: "VALUE",
      value: "0",
      name: "VK_NULL_HANDLE"
    });
    out.push(ast);
  }
  // platform includes
  {
    let results = [];
    let includes = [];
    findXMLElements(obj, "platforms", results);
    results[0].elements.map(child => {
      let {attributes} = child;
      let {name, protect, comment} = attributes;
      includes.push({
        kind: "PLATFORM_INCLUDE",
        platform: name,
        include: protect,
        description: comment
      });
    });
    includes.map(incl => {
      out.push(incl);
    });
  }
  // enums
  if (true) {
    let results = [];
    findXMLElements(obj, { type: "enum" }, results);
    results.map(res => {
      let ast = parseElement(res);
      out.push(ast);
    });
  }
  // unions
  if (true) {
    let results = [];
    findXMLElements(obj, { category: "union" }, results);
    results.map(res => {
      let ast = parseElement(res);
      ast.isUnionType = true;
      out.push(ast);
    });
  }
  // bitmasks
  if (true) {
    let results = [];
    findXMLElements(obj, { type: "bitmask" }, results);
    results.map(res => {
      let ast = parseElement(res);
      out.push(ast);
    });
  }
  // enum extensions
  if (true) {
    let enums = out.filter(node => node.kind === "ENUM");
    let results = [];
    findXMLElements(obj, "require", results);
    results.map(result => {
      let el = { elements: [result] };
      let extMembers = parseExtensionMembers(null, el);
      extMembers.map(member => {
        if (!member.extends || member.alias) return;
        let enumToExtend = enums.filter(node => node.name === member.extends)[0] || null;
        if (!enumToExtend) {
          throw `Cannot resolve enum to extend '${member.extends}'`;
        }
        let node = {
          kind: TYPES.ENUM_MEMBER,
          type: "VALUE",
          value: "" + member.value,
          name: member.name
        };
        // only push extension if it doesn't exist yet
        if (!enumToExtend.children.filter(child => child.name === member.name)[0]) {
          enumToExtend.children.push(node);
        }
      });
    });
  }
  // process aliased enums
  if (true) {
    let results = [];
    findXMLElements(obj, { category: "enum" }, results);
    let enums = out.filter(node => node.kind === "ENUM");
    results.map(res => {
      const alias = res.attributes.alias;
      // make sure enum alias isn't created yet
      if (alias && !(enums.filter(s => s.name === res.attributes.name)[0])) {
        // resolve the aliased enum
        let aliasedEnum = enums.filter(s => s.name === alias)[0];
        if (!aliasedEnum) return warn(`Cannot resolve enum alias ${alias}`);
        const aliasCopy = Object.assign({}, aliasedEnum);
        aliasCopy.name = res.attributes.name;
        registerEnum(aliasCopy);
        out.push(aliasCopy);
      }
    });
  }
  // process aliased bitmasks
  if (true) {
    let results = [];
    findXMLElements(obj, { category: "bitmask" }, results);
    let elements = out.filter(node => node.kind === "ENUM" && node.type === "BITMASK");
    results.map(res => {
      const alias = res.attributes.alias;
      // make sure bitmask alias isn't created yet
      if (alias && !(elements.filter(s => s.name === res.attributes.name)[0])) {
        // resolve the aliased bitmask
        let normalizedAlias = bitmasks[alias];
        if (!normalizedAlias) {
          return warn(`Cannot resolve normalized bitmask alias ${normalizedAlias}`);
        }
        let aliasedBitmask = elements.filter(s => s.name === normalizedAlias)[0];
        if (!aliasedBitmask) {
          return warn(`Cannot resolve bitmask alias ${alias}`);
        }
        const aliasCopy = Object.assign({}, aliasedBitmask);
        aliasCopy.name = res.attributes.name;
        registerEnum(aliasCopy);
        out.push(aliasCopy);
      }
    });
  }
  // base extensions
  if (true) {
    let results = [];
    findXMLElements(obj, { comment: "Vulkan extension interface definitions" }, results);
    let ast = parseElement(results[0]);
    ast.map(node => {
      out.push(node);
    });
  }
  // structs
  if (true) {
    let results = [];
    findXMLElements(obj, { category: "struct" }, results);
    results.map(res => {
      let ast = parseElement(res);
      out.push(ast);
    });
    let structs = out.filter(node => node.kind === "STRUCT");
    // include struct extensions
    structs.map(struct => {
      // struct extends another struct
      if (struct.extends) {
        struct.extends.map(extensionName => {
          // resolve the struct we want to extend
          let extStruct = structs.filter(s => s.name === extensionName)[0];
          if (extStruct) {
            // add this struct to the to be extended struct
            if (!extStruct.extensions) extStruct.extensions = [];
            if (extStruct.extensions.indexOf(struct.name) <= -1) extStruct.extensions.push(struct.name);
          } else {
            warn(`Cannot resolve struct extensions for ${struct.name} => ${struct.extends}`);
          }
        });
      }
    });
  }
  // calls
  if (true) {
    let results = [];
    let commands = [];
    findXMLElements(obj, "commands", results);
    let nodes = parseElement(results[0]).children;
    // merge cmd protos with cmd params
    let idx = 0;
    let cmd = null;
    while (true) {
      let current = nodes[idx];
      if (current.kind === "COMMAND_PROTO") {
        cmd = current;
        cmd.params = [];
        idx++;
        commands.push(cmd);
        continue;
      }
      if (cmd && current.kind === "COMMAND_PARAM") {
        cmd.params.push(current);
      }
      if (idx++ >= nodes.length - 1) break;
    };
    commands.map(cmd => out.push(cmd));
  }
  // merge aliased structs
  {
    let structs = out.filter(node => node.kind === "STRUCT");
    structs.map(struct => {
      if (struct.alias) {
        let {alias} = struct;
        let aliasedStruct = getNodeByName(alias, structs);
        if (!aliasedStruct) return warn(`Cannot resolve struct alias ${alias}`);
        for (let key in aliasedStruct) {
          if (key === "sType") {
            struct.sType = getAutoStructureType(struct.name);
          }
          else if (key !== "name") {
            struct[key] = aliasedStruct[key];
          }
        };
      }
    });
  }
  // funcpointers
  {
    let results = [];
    findXMLElements(obj, { category: "funcpointer" }, results);
    results.map(res => {
      let ast = parseElement(res);
      if (ast) out.push(ast);
    });
  }

  function deepReflectionTrace(struct) {
    struct.needsReflection = true;
    struct.children.map(member => {
      // these can be ignored
      if (
        member.isNumber ||
        member.isBoolean ||
        member.bitmaskType ||
        member.enumType ||
        isIgnoreableType(member)
      ) return;
      // pnext structs
      if (isPNextMember(member)) {
        let {extensions} = struct;
        if (extensions) {
          extensions.map(extensionName => {
            let struct = getStructByStructName(out, extensionName);
            deepReflectionTrace(struct);
          });
        }
      }
      // struct
      else if (member.isStructType && !member.isArray) {
        let struct = getStructByStructName(out, member.type);
        deepReflectionTrace(struct);
      }
      // array of structs
      else if (member.isStructType && member.isArray) {
        let struct = getStructByStructName(out, member.type);
        deepReflectionTrace(struct);
      }
    });
  };
  // trace deep reflection structures
  {
    let structs = out.filter(node => node.kind === "STRUCT");
    structs.map(struct => {
      if (struct.returnedonly) {
        deepReflectionTrace(struct);
      }
    });
  }
  // trace reflection structures when used in function callbacks
  {
    let fnPptrs = out.filter(node => node.kind === "FUNCTION_POINTER");
    fnPptrs.map(fnPtr => {
      fnPtr.params.map(param => {
        if (param.isStructType) {
          let struct = getStructByStructName(out, param.type);
          deepReflectionTrace(struct);
        }
      });
    });
  }
  // trace members which need to be initialized at instantiation
  // e.g. struct.struct, struct.numericarray
  {
    let structs = out.filter(node => node.kind === "STRUCT");
    structs.map(struct => {
      struct.children.map(member => {
        // struct member
        if (
          !member.isConstant &&
          (member.isStructType || member.isHandleType) &&
          member.dereferenceCount <= 0
        ) member.needsInitializationAtInstantiation = true;
        // numeric array member
        if (
          member.isNumericArray &&
          member.isStaticArray
        ) member.needsInitializationAtInstantiation = true;
      });
    });
  }
  return new Promise(resolve => {
    // put documentation information into generated AST
    if (docs) {
      parseDocumentation(version).then(ast => {
        let enums = out.filter(node => node.kind === "ENUM");
        let structs = out.filter(node => node.kind === "STRUCT");
        let handles = out.filter(node => node.kind === "HANDLE");
        let calls = out.filter(node => node.kind === "COMMAND_PROTO");
        // insert documentation
        fillDocumentation(enums, ast);
        fillDocumentation(structs, ast);
        fillDocumentation(handles, ast);
        fillDocumentation(calls, ast);
        resolve(out);
      });
    } else {
      resolve(out);
    }
  });
};
