/**

  Converts documentation and AST data into their relative JS types

**/
import fs from "fs";
import yauzl from "yauzl";
import nunjucks from "nunjucks";
import pkg from "../../package.json";
import parseDocumentation from "../doc-parser";

import {
  warn,
  getNodeByName,
  isIgnoreableType,
  getObjectInstantiationName
} from "../utils";

import {
  JavaScriptType,
  getJavaScriptType
} from "../javascript-type";

let ast = null;
let calls = null;
let enums = null;
let structs = null;
let handles = null;
let includes = null;

let objects = [];

const {DOCS_DIR, TEMPLATE_DIR, LINK_MDN_GOBJECTS} = pkg.config;

const INDEX_TEMPLATE = fs.readFileSync(`${TEMPLATE_DIR}/docs/index.njk`, "utf-8");
const CALLS_TEMPLATE = fs.readFileSync(`${TEMPLATE_DIR}/docs/calls.njk`, "utf-8");
const ENUMS_TEMPLATE = fs.readFileSync(`${TEMPLATE_DIR}/docs/enums.njk`, "utf-8");
const HANDLES_TEMPLATE = fs.readFileSync(`${TEMPLATE_DIR}/docs/handles.njk`, "utf-8");
const STRUCTS_TEMPLATE = fs.readFileSync(`${TEMPLATE_DIR}/docs/structs.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

function getType(object) {
  let folder = getObjectFolder(object);
  let {type, value} = getJavaScriptType(ast, object);
  switch (type) {
    case JavaScriptType.UNKNOWN: {
      return `N/A`;
    }
    case JavaScriptType.NULL: {
      return `null`;
    }
    case JavaScriptType.BOOLEAN: {
      return `Boolean`;
    }
    case JavaScriptType.NUMBER:
    case JavaScriptType.ENUM:
    case JavaScriptType.BITMASK: {
      return `Number`;
    }
    case JavaScriptType.OBJECT: {
      return `<a href="../${folder}/${object.type}.html">${object.type}</a>`;
    }
    case JavaScriptType.STRING: {
      return `String`;
    }
    case JavaScriptType.FUNCTION: {
      return `Function`;
    }
    case JavaScriptType.BIGINT: {
      return `<a href="${LINK_MDN_GOBJECTS}/BigInt">BigInt</a>`;
    }
    case JavaScriptType.OBJECT_INOUT: {
      return `Object.$<vk-property-type type="object">(${value})</vk-property-type>`;
    }
    case JavaScriptType.ARRAY_OF_STRINGS: {
      return `Array<vk-property-type type="string">[String]</vk-property-type>`;
    }
    case JavaScriptType.ARRAY_OF_NUMBERS: {
      return `Array<vk-property-type type="number">[Number]</vk-property-type>`;
    }
    case JavaScriptType.ARRAY_OF_OBJECTS: {
      return `Array<vk-property-type type="object">[<a href="../${folder}/${object.type}.html">${object.type}]</a></vk-property-type>`;
    }
    case JavaScriptType.TYPED_ARRAY: {
      return `<a href="${LINK_MDN_GOBJECTS}/${object.jsTypedArrayName}">${object.jsTypedArrayName}</a>`;
    }
  };
  warn(`Cannot resolve doc type ${type} for ${object.name}`);
  return ``;
};

function getCSSType(member) {
  let {type} = getJavaScriptType(ast, member);
  switch (type) {
    case JavaScriptType.UNKNOWN: return `N/A`;
    case JavaScriptType.OBJECT: return `object`;
    case JavaScriptType.NULL: return `null`;
    case JavaScriptType.STRING: return `string`;
    case JavaScriptType.BOOLEAN: return `boolean`;
    case JavaScriptType.NUMBER: return `number`;
    case JavaScriptType.BIGINT: return `number`;
    case JavaScriptType.ENUM: return `number`;
    case JavaScriptType.BITMASK: return `number`;
    case JavaScriptType.OBJECT_INOUT: return `object`;
    case JavaScriptType.FUNCTION: return `function`;
    case JavaScriptType.ARRAY_OF_STRINGS: return `array`;
    case JavaScriptType.ARRAY_OF_NUMBERS: return `array`;
    case JavaScriptType.ARRAY_OF_OBJECTS: return `array`;
    case JavaScriptType.TYPED_ARRAY: return `typedarray`;
  };
  warn(`Cannot resolve CSS doc type ${type} for ${member.name}`);
  return ``;
};

function getCategories({ calls, structs, handles } = _) {
  let out = [];
  calls.map(call => { if (out.indexOf(call.documentation.category) <= -1) out.push(call.documentation.category); });
  structs.map(struct => { if (out.indexOf(struct.documentation.category) <= -1) out.push(struct.documentation.category); });
  handles.map(handle => { if (out.indexOf(handle.documentation.category) <= -1) out.push(handle.documentation.category); });
  return out;
};

function getObjectsByCategory(category) {
  let out = [];
  // collect objects matching category
  {
    calls.map(call => { if (call.documentation.category === category) out.push(call); });
    structs.map(struct => { if (struct.documentation.category === category) out.push(struct); });
    handles.map(handle => { if (handle.documentation.category === category) out.push(handle); });
  }
  // sort alphabetically
  out = out.sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });
  return out;
};

function getObjectFolder(obj) {
  if (obj.isHandleType) return "handles";
  if (obj.isStructType) return "structs";
  switch (obj.kind) {
    case "STRUCT":
      return "structs";
    case "COMMAND_PROTO":
      return "calls";
    case "HANDLE":
      return "handles";
  };
  return ``;
};

function getObjectLabel(obj) {
  switch (obj.kind) {
    case "STRUCT":
      return "s";
    case "COMMAND_PROTO":
      return "f";
    case "HANDLE":
      return "h";
  };
  return ``;
};

function getCallReturnType(call) {
  let type = call.rawType;
  if (call.enumType) return call.enumType;
  switch (type) {
    case "void":
      return "void";
    case "int8_t":
    case "int16_t":
    case "int32_t":
    case "uint8_t":
    case "uint16_t":
    case "uint32_t":
      return "Number";
    case "uint64_t":
      return "BigInt";
  };
  return `N/A`;
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
      let obj = getNodeByName(value, ast);
      replacement = `<b><a href="../${getObjectFolder(obj)}/${value}.html">${value}</a></b>`;
    } break;
    case "pname":
    case "ename":
    case "elink":
    case "dlink":
    case "tlink":
      replacement = `<b>${value}</b>`;
    break;
    case "etext":
      switch (value) {
        case "SINT":
        case "UINT":
          replacement = `<i>${value}</i>`;
        break;
      };
    break;
    case "code":
      replacement = `<i>${value}</i>`;
    break;
    case "basetype":
      replacement = `<i>${value}</i>`;
    break;
    case "can":
    case "cannot":
    case "may":
    case "must":
    case "should":
    case "optional":
      replacement = `<i>${kind}</i>`;
    break;
    case "required":
    case "undefined":
      replacement = `<b style="text-decoration:underline;">${kind}</b>`;
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
  let {kind, documentation} = obj;
  let description = getMacroExpandedDescription(documentation);
  return description;
};

function getStructMemberStub(struct, member) {
  let instantiationName = getObjectInstantiationName(struct);
  if (member.name === `sType` && struct.sType) {
    return `${instantiationName}.${member.name} = ${struct.sType};`;
  }
  return `${instantiationName}.${member.name} = ;`;
};

function getNavigationHTML() {
  return `
<vk-navigation>
  <vk-search-title>Search</vk-search-title>
  <vk-search>
    <input type="text" id="search" autocomplete="off" />
    <vk-search-results>
      <ol id="search-list">
        <li id="no-search-results">No Results</li>
      </ol>
    </vk-search-results>
  </vk-search>
  <vk-section-title style="margin-top: 1em;">Categories</vk-section-title>
  <vk-categories></vk-categories>
</vk-navigation>
`;
};

function getHeaderHTML() {
  return `
<meta name="viewport" content="width=device-width, initial-scale=1">

<link rel="apple-touch-icon-precomposed" sizes="144x144" href="../../assets/img/favicon-144.png">
<link rel="apple-touch-icon-precomposed" sizes="114x114" href="../../assets/img/favicon-144.png">
<link rel="apple-touch-icon-precomposed" sizes="72x72" href="../../assets/img/favicon-72.png">
<link rel="apple-touch-icon-precomposed" href="../../assets/img/favicon-32.png">
<link rel="shortcut icon" href="../../assets/img/favicon-32.png">

<link rel="stylesheet" href="../../assets/css/vk.css"/>
<link rel="stylesheet" href="../../assets/css/prism.css"/>
`;
};

export default function(astReference, data, version) {
  ast = astReference;
  calls = data.calls;
  enums = data.enums;
  structs = data.structs;
  handles = data.handles;
  includes = data.includes;
  calls.map(call => { objects.push(call); });
  structs.map(struct => { objects.push(struct); });
  handles.map(handle => { objects.push(handle); });
  let categories = getCategories({ calls, structs, handles });
  let defaultFunctions = {
    getType,
    getCSSType,
    getObjectLabel,
    getObjectFolder,
    getCallReturnType,
    getObjectsByCategory,
    getObjectDescription,
    getHeaderHTML,
    getNavigationHTML
  };
  // reserve output dirs
  {
    // docs/x/
    if (!fs.existsSync(`${DOCS_DIR}/${version}`)) fs.mkdirSync(`${DOCS_DIR}/${version}`);
    // docs/x/calls/
    if (!fs.existsSync(`${DOCS_DIR}/${version}/calls`)) fs.mkdirSync(`${DOCS_DIR}/${version}/calls`);
    // docs/x/handles
    if (!fs.existsSync(`${DOCS_DIR}/${version}/handles`)) fs.mkdirSync(`${DOCS_DIR}/${version}/handles`);
    // docs/x/structs
    if (!fs.existsSync(`${DOCS_DIR}/${version}/structs`)) fs.mkdirSync(`${DOCS_DIR}/${version}/structs`);
  }
  // index
  {
    let output = nunjucks.renderString(INDEX_TEMPLATE, {
      objects,
      categories,
      ...defaultFunctions
    });
    fs.writeFileSync(`${DOCS_DIR}/${version}/index.html`, output, `utf-8`);
  }
  // search json
  {
    let out = [];
    objects.map(obj => {
      out.push([
        obj.name,
        getObjectLabel(obj),
        getObjectFolder(obj)
      ]);
    });
    fs.writeFileSync(`${DOCS_DIR}/${version}/search.json`, JSON.stringify(out), `utf-8`);
  }
  // categories json
  {
    let out = [];
    categories.map(name => {
      let category = { category: name, objects: [] };
      let objects = getObjectsByCategory(name);
      objects.map(obj => {
        category.objects.push([
          obj.name,
          getObjectLabel(obj),
          getObjectFolder(obj)
        ]);
      });
      out.push(category);
    });
    fs.writeFileSync(`${DOCS_DIR}/${version}/categories.json`, JSON.stringify(out), `utf-8`);
  }
  // structs
  {
    structs.map(struct => {
      let output = nunjucks.renderString(STRUCTS_TEMPLATE, {
        struct,
        structs,
        objects,
        members: struct.children,
        categories,
        instantiationName: getObjectInstantiationName(struct),
        ...defaultFunctions,
        getStructMemberStub
      });
      fs.writeFileSync(`${DOCS_DIR}/${version}/structs/${struct.name}.html`, output, `utf-8`);
    });
  }
  // handles
  {
    handles.map(handle => {
      let output = nunjucks.renderString(HANDLES_TEMPLATE, {
        handle,
        handles,
        objects,
        members: handle.children,
        categories,
        instantiationName: getObjectInstantiationName(handle),
        ...defaultFunctions
      });
      fs.writeFileSync(`${DOCS_DIR}/${version}/handles/${handle.name}.html`, output, `utf-8`);
    });
  }
  // calls
  {
    calls.map(call => {
      let output = nunjucks.renderString(CALLS_TEMPLATE, {
        call,
        calls,
        objects,
        params: call.params,
        categories,
        ...defaultFunctions
      });
      fs.writeFileSync(`${DOCS_DIR}/${version}/calls/${call.name}.html`, output, `utf-8`);
    });
  }
  return null;
};
