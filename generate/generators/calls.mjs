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

function getInputArrayBody(param, index) {
  let {rawType} = param;
  if (param.isBaseType) rawType = param.baseType;
  let out = ``;
  let isReference = param.dereferenceCount > 0;
  //console.log(`Array of objects param ${rawType}`);
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
  else if (param.isEnumType) {
    // begin
    out += `
    v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(info[${index}]);
    ${rawType} arr${index} = new ${param.type}[array->Length()];
    $p${index} = arr${index};`;
  }
  out += `
  }\n`;
  return out;
};

function getCallBodyBefore(call) {
  let {params} = call;
  let out = params.map((param, index) => {
    let {rawType} = param;
    if (param.isBaseType && param.type !== "VkBool32") rawType = param.baseType;
    // ignore
    if (param.name === "pAllocator") {
      return ``;
    }
    switch (rawType) {
      case "int":
      case "float":
      case "size_t":
      case "int32_t":
      case "uint8_t":
      case "uint32_t":
      case "uint64_t":
        return `
  ${param.type} $p${index} = static_cast<${param.type}>(info[${index}]->NumberValue());`;
      case "VkBool32 *":
        return `
  v8::Local<v8::Object> obj${index} = info[${index}]->ToObject();
  ${param.type} $p${index} = static_cast<${param.type}>(obj${index}->Get(Nan::New("$").ToLocalChecked())->BooleanValue());`;
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
  ${param.type} $p${index} = static_cast<${param.type}>(obj${index}->Get(Nan::New("$").ToLocalChecked())->NumberValue());`;
      case "void *":
      case "const void *":
        console.log(`Void pointer param ${rawType}`);
        return ``;
      default: {
        if (param.isArray && (param.isStructType || param.isHandleType || param.isEnumType)) {
          return getInputArrayBody(param, index);
        }
        else if (param.isStructType || param.isHandleType) {
          //console.log(`Object param ${rawType}`);
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

function getCallBodyInner(call) {
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
      !(param.isStructType || param.isHandleType || param.isEnumType)
    ) byReference = "&";
    out += `    ${byReference}$p${index}${addComma}`;
  });
  return out;
};

function getCallBody(call) {
  let out = ``;
  let vari = ``;
  let before = getCallBodyBefore(call);
  let inner = getCallBodyInner(call);
  let outer = getCallBodyAfter(call);
  out += before;
  if (call.rawType !== "void") {
    vari = `${call.type} out = `;
  }
  out += `
  ${vari}${call.name}(
${inner}
  );`;
  out += outer;
  return out;
};

function instantiateMemberClass(member) {
  return `
  v8::Local<v8::Function> ctor = Nan::GetFunction(Nan::New(_${member.type}::constructor)).ToLocalChecked();
  v8::Local<v8::Object> inst = Nan::NewInstance(ctor).ToLocalChecked();
  _${member.type}* unwrapped = Nan::ObjectWrap::Unwrap<_${member.type}>(inst);`;
};

function getMemberCopyInstructions(struct) {
  let out = ``;
  struct.children.map(member => {
    out += `
      instance->${member.name} = copy->${member.name};`;
    if (member.isStructType || member.isHandleType) {
      out += `
      if (&copy->${member.name} != nullptr) {
        ${instantiateMemberClass(member)}
        result->${member.name} = Nan::Persistent<v8::Object, v8::CopyablePersistentTraits<v8::Object>>(inst);
        unwrapped->instance = copy->${member.name};
      }`;
    }
    else if (member.isArray) {
      // TODO
      console.log(`Error: Member copy instruction for arrays not handled yet!`);
    }
    else if (member.isString) {
      console.log(`Error: Member copy instruction for strings not handled yet!`);
      // TODO
    }
  });
  return out;
};

function getParamIndexByParamName(struct, name) {

};

function getMutableStructReflectInstructions(name, pIndex, basePath, out = []) {
  let struct = getStructByStructName(name);
  //console.log("#####", struct.name, "#####", basePath);
  struct.children.map((member, mIndex) => {
    if (
      (member.isNumber) ||
      (member.isBoolean) ||
      (member.isEnumType) ||
      (member.isBaseType) ||
      (member.isBitmaskType)
    ) return;
    if (member.isString) {
      //console.log(`String at ${mIndex}`);
      out.push(`
  {
    // back reflect string
    v8::Local<v8::String> str${pIndex} = v8::String::NewFromUtf8(v8::Isolate::GetCurrent(), (&${basePath}instance)->${member.name});
    ${basePath}${member.name} = Nan::Persistent<v8::String, v8::CopyablePersistentTraits<v8::String>>(str${pIndex});
  }`);
    }
    // static array of numbers
    else if (member.isNumericArray && member.isStaticArray) {
      //console.log(`${member.type} array of numbers at ${mIndex}`);
      out.push(`
  {
    // back reflect array
    v8::Local<v8::Array> arr${pIndex} = v8::Array::New(v8::Isolate::GetCurrent(), ${member.length});
    // populate array
    for (unsigned int ii = 0; ii < ${member.length}; ++ii) {
      arr${pIndex}->Set(ii, Nan::New((&${basePath}instance)->${member.name}[ii]));
    };
    ${basePath}${member.name} = Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>>(arr${pIndex});
  }`);
    }
    // static array of structs
    else if (member.isStructType && member.isStaticArray) {
      // TODO
      /*out.push(`
  {
    // back reflect array
    v8::Local<v8::Array> arr${pIndex} = v8::Array::New(v8::Isolate::GetCurrent(), ${member.length});
    // populate array
    for (unsigned int ii = 0; ii < ${member.length}; ++ii) {
      //arr${pIndex}->Set(ii, Nan::New((&${basePath}instance)->${member.name}[ii]));
    };
    ${basePath}${member.name} = Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>>(arr${pIndex});
  }`);*/
    }
    else if (member.isStructType) {
      // TODO
      //console.log(`${member.type} struct at ${mIndex}`, member.name);
      out.push(`
  {
    v8::Local<v8::Function> ctor = Nan::GetFunction(Nan::New(_${member.type}::constructor)).ToLocalChecked();
    v8::Local<v8::Object> inst = Nan::NewInstance(ctor).ToLocalChecked();
    _${member.type}* unwrapped${basePath.length} = Nan::ObjectWrap::Unwrap<_${member.type}>(inst);
    obj${pIndex}->${member.name} = Nan::Persistent<v8::Object, v8::CopyablePersistentTraits<v8::Object>>(inst);
    memcpy((&unwrapped${basePath.length}->instance), &${basePath}instance.${member.name}, sizeof(${member.type}));
    ${getMutableStructReflectInstructions(member.type, pIndex, `unwrapped${basePath.length}->`, [])}
  }
      `);
      //out.push(instantiateMemberClass(member));
    }
    else {
      console.log(`Error: Cannot handle param member ${member.name} of type ${member.type}`);
    }
  });
  return out.join("");
};

function getCallBodyAfter(call) {
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
      case "VkBool32 *":
        return `
  obj${index}->Set(Nan::New("$").ToLocalChecked(), Nan::New($p${index}));`;
      /*case "const char *":
      case "const char * const*":
        return ``;*/
      default:
        return ``;
    };
  });
  params.map((param, pIndex) => {
    if (param.isArray && param.isStructType) {
      let struct = getStructByStructName(param.type);
      let memberCopyInstructions = getMemberCopyInstructions(struct);
      out.push(`
  if (info[${pIndex}]->IsArray()) {
    v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(info[${pIndex}]);
    for (unsigned int ii = 0; ii < array->Length(); ++ii) {
      v8::Handle<v8::Value> item = Nan::Get(array, ii).ToLocalChecked();
      v8::Local<v8::Object> obj = item->ToObject();
      _${param.type}* result = Nan::ObjectWrap::Unwrap<_${param.type}>(obj);
      ${param.type} *instance = &result->instance;
      ${param.type} *copy = &$p${pIndex}[ii];
      ${memberCopyInstructions}
    };
  }`);
    // passed in parameter is a struct which gets modified
    // and which we need to back-reflect to v8 manually
    } else if (param.isStructType && !param.isConstant && param.dereferenceCount > 0) {
      let instr = getMutableStructReflectInstructions(param.type, pIndex, `obj${pIndex}->`);
      out.push(instr);
    }
    else if (param.isStructType && !param.isConstant) {
      console.log(`Error: Cannot handle inout struct param ${param.name}`);
    }
    // dynamic array of enums
    else if (param.isDynamicArray && param.isEnumType) {
      out.push(`
  if (info[${pIndex}]->IsArray()) {
    v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(info[${pIndex}]);
    for (unsigned int ii = 0; ii < array->Length(); ++ii) {
      v8::Handle<v8::Value> item = Nan::Get(array, ii).ToLocalChecked();
      array->Set(ii, Nan::New($p${pIndex}[ii]));
    };
  }`);
    }
    else if (param.isStructType && param.isConstant) {
      // can be ignored
    }
    else if (param.isString) {
      // can be ignored
    }
    else if (param.isNumber) {
      // can be ignored
    }
    else {
      // numeric references can be ignored
      switch (param.rawType) {
        case "int *":
        case "size_t *":
        case "uint32_t *":
        case "uint64_t *":
        case "const float *":
        case "const int32_t *":
        case "const uint32_t *":
        case "const uint64_t *":
        case "VkBool32 *":
          break;
        default:
          if (!param.isHandleType) {
            console.log(`Error: Unhandled param ${param.name} of type ${param.type}`);
          }
      };
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
