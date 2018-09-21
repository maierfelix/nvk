import xml from "xml-js";
import pkg from "../../package.json";

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
  ENUM_STRING: uidx++,
  COMMAND: uidx++,
  COMMAND_MEMBER: uidx++,
  COMMAND_PARAM: uidx++,
  COMMAND_PROTO: uidx++,
  EXTENSION: uidx++,
  EXTENSION_MEMBER: uidx++,
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
      if (
        (ch.name === "comment") ||
        (ch.name === "command")
      ) return;
      //console.log(ch);
      let attr = ch.attributes;
      if (!attr) return;
      let {name} = attr;
      let member = {
        kind: TYPES.EXTENSION_MEMBER
      };
      if (attr.dir) member.isNegative = true;
      if (ch.name === "type") {
        // ignore
      }
      // we only care about enum extensions
      else if (ch.name === "enum") {
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
          member.value = `0x` + pos.toString(16);
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
    value = `0x` + pos.toString(16);
  }
  if (Number.isNaN(parsed) || isFloat) {
    value = `(__int32)${value}`;
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
  //registerStruct(out);
  if (!elements) return out;
  elements.map((child, index) => {
    switch (child.name) {
      case "member": {
        let ast = parseTypeElement(child);
        ast.kind = TYPES.STRUCT_MEMBER;
        children.push(ast);
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
  if (isBitmaskType) {
    out.bitmaskType = out.rawType;
    out.bitmaskRawType = out.bitmaskType;
    out.rawType = out.rawType.replace(out.type, `int32_t`);
    out.type = `int32_t`;
    type = out.type;
    out.isBitmaskType = true;
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
  return out;
};

function registerStruct(struct) {
  let {name} = struct;
  if (structs[name]) console.warn(`Struct ${name} already registered!`);
  structs[name] = 1;
};

function registerEnum(enu) {
  let {name} = enu;
  if (enums[name]) console.warn(`Enum ${name} already registered!`);
  enums[name] = enu.value || 1;
};

function isNumber(type) {
  switch (type) {
    case "int":
    case "float":
    case "size_t":
    case "int32_t":
    case "uint8_t":
    case "uint32_t":
    case "uint64_t":
      return true;
  };
  return false;
};

export default function(xmlInput) {
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
            bitmasks[attr.requires] = el.elements[0].text;
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
  if (true) {
    let results = [];
    findXMLElements(obj, { type: "enum" }, results);
    results.map(res => {
      let ast = parseElement(res);
      out.push(ast);
    });
  }
  if (true) {
    let results = [];
    findXMLElements(obj, { comment: "Vulkan extension interface definitions" }, results);
    let ast = parseElement(results[0]);
    ast.map(node => {
      out.push(node);
    });
  }
  if (true) {
    let results = [];
    findXMLElements(obj, { category: "struct" }, results);
    results.map(res => {
      let ast = parseElement(res);
      out.push(ast);
    });
  }
  if (true) {
    let results = [];
    findXMLElements(obj, { category: "union" }, results);
    results.map(res => {
      let ast = parseElement(res);
      out.push(ast);
    });
  }
  if (true) {
    let results = [];
    findXMLElements(obj, { type: "bitmask" }, results);
    results.map(res => {
      let ast = parseElement(res);
      out.push(ast);
    });
  }
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
  return out;
};
