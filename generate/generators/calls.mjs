import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

let ast = null;

const CPP_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/calls-cpp.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

function getStructByStructName(name) {
  let structs = ast.filter(node => node.kind === "STRUCT");
  for (let ii = 0; ii < structs.length; ++ii) {
    let struct = structs[ii];
    if (struct.name === name) return struct;
  };
  console.error(`Cannot resolve struct by name "${name}"`);
  return null;
};

function getParamRefValue(param, index) {
  let {rawType} = param;
  if (param.isBaseType) rawType = param.baseType;
  switch (rawType) {
    case "int":
    case "float":
    case "size_t":
    case "int32_t":
    case "uint32_t":
    case "uint64_t":
      return `static_cast<${param.type}>(info[${index}]->NumberValue())`;
    case "int *":
    case "size_t *":
    case "uint32_t *":
    case "uint64_t *":
    case "const int32_t *":
    case "const uint32_t *":
    case "const uint64_t *":
    case "const float *":
      return `static_cast<${param.type}>(obj${index}->Get(Nan::New("$").ToLocalChecked())->NumberValue())`;
    /*case "const char *":
    case "const char * const*":
      return ``;*/
    default:
      console.error(`Cannot get param reference value from type ${rawType}`);
  };
};

function getObjectParam(param, index) {
  let {rawType} = param;
  if (param.isBaseType) rawType = param.baseType;
  let out = ``;
  let isReference = param.dereferenceCount > 0;
  console.log(`Array of objects param ${rawType}`);
  out += `
  ${param.type} ${isReference ? "*" : ""}$p${index} = nullptr;\n`;
  out += `
  if (info[${index}]->IsArray()) {\n`;
  if (param.isHandleType) {
    out += `
    $p${index} = createArrayOfV8Objects<${param.type}, _${param.type}>(info[${index}]);`;
  }
  else if (param.isStructType) {
    out += `
    $p${index} = copyArrayOfV8Objects<${param.type}, _${param.type}>(info[${index}]);`;
  }
  out += `
  }\n`;
  return out;
};

function getOuterCallParams(call) {
  let {params} = call;
  let out = params.map((param, index) => {
    let {rawType} = param;
    if (param.isBaseType) rawType = param.baseType;
    // ignore
    if (param.name === "pAllocator") {
      return ``;
    }
    switch (rawType) {
      case "int":
      case "float":
      case "size_t":
      case "int32_t":
      case "uint32_t":
      case "uint64_t":
        return `
  ${param.type} $p${index} = ${getParamRefValue(param, index)};`;
      case "int *":
      case "size_t *":
      case "uint32_t *":
      case "uint64_t *":
      case "const char *":
      case "const char * const*":
      case "const float *":
      case "const int32_t *":
      case "const uint32_t *":
      case "const uint64_t *":
        return `
  v8::Local<v8::Object> obj${index} = info[${index}]->ToObject();
  ${param.type} $p${index} = ${getParamRefValue(param, index)};
  `;
      case "void *":
      case "const void *":
        console.log(`Void pointer param ${rawType}`);
        return ``;
      default: {
        if (param.isArray && (param.isStructType || param.isHandleType)) {
          return getObjectParam(param, index);
        }
        if (param.isEnumType) {
          console.log(`Enum param ${rawType}`);
          return ``;
        }
        else if (param.isStructType || param.isHandleType) {
          console.log(`Object param ${rawType}`);
          let isReference = param.dereferenceCount > 0;
          return `
  _${param.type}* obj${index} = Nan::ObjectWrap::Unwrap<_${param.type}>(info[${index}]->ToObject());
  ${param.type} *$p${index} = &obj${index}->instance;`;
        } else if (param.isBitmaskType) {
          console.log(`Bitmask param ${rawType}`);
          return ``;
        }
        console.warn(`Cannot handle param ${rawType} in source-getter!`);
        console.log(param);
        return ``;
      } break;
    };
  });
  return out.join("\n");
};

function getInnerCallParams(call) {
  let out = ``;
  let {params} = call;
  params.map((param, index) => {
    let addComma = index < params.length - 1 ? ",\n" : "";
    let byReference = "";
    if (param.name === "pAllocator") {
      out += `    nullptr${addComma}`;
      return;
    }
    if (
      (param.isStructType || param.isHandleType) &&
      param.dereferenceCount <= 0
    ) byReference = "*";
    else if (
      param.dereferenceCount > 0 &&
      !(param.isStructType || param.isHandleType)
    ) byReference = "&";
    out += `    ${byReference}$p${index}${addComma}`;
  });
  return out;
};

function getCallBody(call) {
  let out = ``;
  let vari = ``;
  let paramsOuter = getOuterCallParams(call);
  let paramsInner = getInnerCallParams(call);
  out += paramsOuter;
  if (call.rawType !== "void") {
    vari = `${call.type} out = `;
  }
  out += `
  ${vari}${call.name}(
${paramsInner}
  );`;
  out += getSubsequentCallBody(call);
  return out;
};

function getSubsequentCallBody(call) {
  let {params} = call;
  let out = params.map((param, index) => {
    let {rawType} = param;
    switch (rawType) {
      case "int *":
      case "size_t *":
      case "uint32_t *":
      case "uint64_t *":
      case "const int32_t *":
      case "const uint32_t *":
      case "const uint64_t *":
      case "const float *":
        return `
  obj${index}->Set(Nan::New("$").ToLocalChecked(), Nan::New($p${index}));`;
      /*case "const char *":
      case "const char * const*":
        return ``;*/
      default:
        return ``;
    };
  });
  params.map((param, index) => {
    if (param.isArray && param.isStructType) {
      let struct = getStructByStructName(param.type);
      let memberCopyInstructions = ``;
      struct.children.map(member => {
        memberCopyInstructions += `
      instance->${member.name} = copy->${member.name};`;
        if (member.isArray || member.isStructType || member.isHandleType) {
          // TODO
        }
        else if (member.isString) {
          // TODO
        }
      });
      out.push(`
  if (info[${index}]->IsArray()) {
    v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(info[${index}]);
    for (unsigned int ii = 0; ii < array->Length(); ++ii) {
      v8::Handle<v8::Value> item = Nan::Get(array, ii).ToLocalChecked();
      _${param.type}* result = Nan::ObjectWrap::Unwrap<_${param.type}>(item->ToObject());
      ${param.type} *instance = &result->instance;
      ${param.type} *copy = &$p${index}[ii];
      ${memberCopyInstructions}
    };
  }`);
    }
  });
  return out.join("");
};

function getCallReturn(call) {
  let {rawType} = call;
  switch (rawType) {
    case "void":
      return `
  info.GetReturnValue().SetUndefined();
  `;
    case "VkBool32":
      return `
  info.GetReturnValue().Set(Nan::New(!!out));
  `;
    case "VkResult":
      return `info.GetReturnValue().Set(Nan::New(static_cast<int32_t>(out)));`;
    default: {
      //console.warn(`Cannot handle ${rawType} in call-return!`);
    }
  };
  return `info.GetReturnValue().Set(Nan::New(0));`;
};

export default function(astReference, calls) {
  ast = astReference;
  let vars = {
    calls,
    getCallBody,
    getCallReturn
  };
  let out = {
    source: null
  };
  // cpp
  {
    let template = CPP_TEMPLATE;
    let output = nunjucks.renderString(template, vars);
    out.source = output;
  }
  return out;
};
