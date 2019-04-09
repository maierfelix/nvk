/**

  Generates a processable AST from vulkan specification files

**/
import xml from "xml-js";
import pkg from "../../package.json";
import parseDocumentation from "../doc-parser";

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
} from "../utils";

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
  ALIAS: uidx++
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
  switch (el.name) {
    case "enums":
      return parseEnumElement(el);
    case "type": {
      return parseStructElement(el);
    }
    case "commands":
      return parseCommandElement(el);
    case "extensions":
      return parseExtensionElement(el);
    default: throw `Unsupported element of type:${el.name}`;
  };
  return null;
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
  let baseNum = parseInt(child.attributes.number, 0);
  elements.map(el => {
    el.elements.map(ch => {
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
          let extBase = 1e9;
          let extBlockSize = 1e3;
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
          member.value = formatIntToHex(pos);
          out.push(member);
        }
        else if (attr.alias) {
          member.name = attr.name;
          member.value = attr.value;
          member.extends = attr.extends;
          member.alias = attr.alias;
          member.isAlias = true;
          out.push(member);
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
    out.rawType === `HINSTANCE`) {
    out.isWin32Handle = true;
  }
  // handle reference
  if (out.rawType === `HANDLE *`) {
    out.isWin32HandleReference = true;
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
    case "uint32_t":
    case "uint64_t":
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
  // extensions
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
      if (struct.extends) {
        struct.extends.map(extensionName => {
          let extStruct = structs.filter(s => s.name === extensionName)[0];
          if (extStruct) {
            if (!extStruct.extensions) extStruct.extensions = [];
            if (extStruct.extensions.indexOf(struct.name) <= -1) extStruct.extensions.push(struct.name);
          } else {
            if (!extStruct) warn(`Cannot resolve struct extensions for ${struct.name} => ${struct.extends}`);
          }
        });
      }
    });
  }
  // unions
  if (true) {
    let results = [];
    findXMLElements(obj, { category: "union" }, results);
    results.map(res => {
      let ast = parseElement(res);
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
    let enums = out.filter(node => node.kind === "ENUM");
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

  function deepReflectionTrace(name) {
    let struct = getStructByStructName(out, name);
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
          struct.needsReflection = true;
          extensions.map(extensionName => {
            deepReflectionTrace(extensionName);
          });
        }
      }
      // string
      else if (member.isString && member.isStaticArray) {
        struct.needsReflection = true;
      }
      // struct
      else if (member.isStructType && !member.isArray) {
        deepReflectionTrace(member.type);
        struct.needsReflection = true;
      }
      // array of numbers
      else if (member.isNumericArray) {
        struct.needsReflection = true;
      }
      // array of structs
      else if (member.isStructType && member.isArray) {
        deepReflectionTrace(member.type);
        struct.needsReflection = true;
      }
      else {
        console.log(`Error: Cannot handle member ${member.name} of type ${member.type} in mutable-struct-reflection!`);
      }
    });
  };

  // trace deep reflection structures
  {
    let calls = out.filter(node => node.kind === "COMMAND_PROTO");
    calls.map(call => {
      let {params} = call;
      params.map(param => {
        if (isIgnoreableType(param)) return;
        if (param.isConstant) return;
        if (param.isStructType && param.dereferenceCount > 0 && !param.isArray) {
          deepReflectionTrace(param.type);
        }
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
