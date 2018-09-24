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

function getHandleByHandleName(name) {
  let handles = ast.filter(node => node.kind === "HANDLE");
  for (let ii = 0; ii < handles.length; ++ii) {
    let handle = handles[ii];
    if (handle.name === name) return handle;
  };
  console.error(`Cannot resolve handle by name "${name}"`);
  return null;
};

function getParamIndexByParamName(struct, name) {
  for (let ii = 0; ii < struct.children.length; ++ii) {
    let child = struct.children[ii];
    if (child.name === name) return ii;
  };
  console.error(`Cannot resolve param index by name "${name}"`);
  return null;
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
    if (member.isStructType) {
      out += `
      instance->${member.name} = copy->${member.name};`;
      out += `
      if (&copy->${member.name} != nullptr) {
        ${instantiateMemberClass(member)}
        result->${member.name} = Nan::Persistent<v8::Object, v8::CopyablePersistentTraits<v8::Object>>(inst);
        unwrapped->instance = copy->${member.name};
      }`;
    }
    else if (member.isHandleType) {
      // can be ignored
    }
    else if (member.isString) {
      out += `
      {
        std::string stri(copy->${member.name});
        v8::Local<v8::String> strv8 = v8::String::NewFromUtf8(v8::Isolate::GetCurrent(), stri.c_str());
        Nan::Persistent<v8::String, v8::CopyablePersistentTraits<v8::String>> str(Nan::To<v8::String>(strv8).ToLocalChecked());
        result->${member.name} = str;
        strcpy(instance->${member.name}, copy->${member.name});
      }`;
    }
    else if (member.isArray) {
      // TODO
      console.log(`Error: Member copy instruction for arrays not handled yet!`);
    }
    else if (member.isNumber || member.bitmaskType || member.enumType) {
      // can be ignored
    }
    else if (member.type === "void") {
      // ???
    }
    else {
      console.warn(`Cannot handle ${member.type} in get-member-copy-instruction!`);
    }
  });
  return out;
};

function getInputArrayBody(param, index) {
  let {rawType} = param;
  if (param.isBaseType) rawType = param.baseType;
  let out = ``;
  let {isConstant} = param;
  let isReference = param.dereferenceCount > 0;
  if (!isReference) console.warn(`Cannot handle non-reference item in input-array-body!`);
  out += `
  ${param.enumType || param.baseType || param.type} ${isReference ? "*" : ""}$p${index} = nullptr;\n`;
  out += `
  if (info[${index}]->IsArray()) {\n`;
  // handle
  if (param.isHandleType) {
    let handle = getHandleByHandleName(param.type);
    let parentHandle = getHandleByHandleName(param.handleType);
    // handle might not be just a pointer and encodes data directly
    if (handle.isNonDispatchable) {
      out += `
    $p${index} = createArrayOfV8Handles<${param.type}, _${param.type}>(info[${index}]);`;
    // handle pointer with reference into vulkan
    } else if (parentHandle.isNonDispatchable) {
      out += `
    $p${index} = createArrayOfV8Handles<${param.type}, _${param.type}>(info[${index}]);`;
    // parent handle is non dispatchable..is this correct ???
    } else {
      out += `
    $p${index} = createArrayOfV8Objects<${param.type}, _${param.type}>(info[${index}]);`;
    }
  }
  // struct which gets filled by vulkan
  else if (param.isStructType && !isConstant) {
    out += `
    $p${index} = copyArrayOfV8Objects<${param.type}, _${param.type}>(info[${index}]);`;
  }
  // just a struct
  else if (param.isStructType && isConstant) {
    out += `
    $p${index} = copyArrayOfV8Objects<${param.type}, _${param.type}>(info[${index}]);`;
  }
  // enum
  else if (param.enumType) {
    out += `
    v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(info[${index}]);
    ${param.enumRawType} arr${index} = new ${param.enumType}[array->Length()];
    $p${index} = arr${index};`;
  }
  // basetypes
  else if (param.isNumericArray && param.baseType && isConstant && isReference) {
    out += `
    $p${index} = createArrayOfV8Numbers<${param.baseType}>(info[${index}]);`;
  }
  // numbers
  else if (param.isNumericArray && isConstant && isReference) {
    out += `
    $p${index} = createArrayOfV8Numbers<${param.type}>(info[${index}]);`;
  }
  else {
    console.warn(`Cannot handle param ${rawType} in input-array-body!`);
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
      case "uint32_t":
      case "uint64_t": {
        let type = param.enumType || param.type;
        let val = `NumberValue`;
        if (param.enumType) val = `Uint32Value`;
        return `
  ${type} $p${index} = static_cast<${type}>(info[${index}]->${val}());`;
      }
      case "VkBool32 *":
        return `
  v8::Local<v8::Object> obj${index};
  ${param.type} $p${index};
  if (!(info[${index}]->IsNull())) {
    obj${index} = info[${index}]->ToObject();
    $p${index} = static_cast<${param.type}>(obj${index}->Get(Nan::New("$").ToLocalChecked())->BooleanValue());
  } else {

  }`;
      case "int *":
      case "size_t *":
      case "int32_t *":
      case "uint32_t *":
      case "uint64_t *":
      case "const float *":
      case "const int32_t *":
      case "const uint32_t *":
      case "const uint64_t *":
        if (param.isArray) {
          return getInputArrayBody(param, index);
        } else {
          return `
  v8::Local<v8::Object> obj${index};
  ${param.type} $p${index};
  if (!(info[${index}]->IsNull())) {
    obj${index} = info[${index}]->ToObject();
    $p${index} = static_cast<${param.type}>(obj${index}->Get(Nan::New("$").ToLocalChecked())->NumberValue());
  }`;
        }
      case "void **":
        return `
  v8::Local<v8::Object> obj${index} = info[${index}]->ToObject();
  void *$p${index};`;
      case "void *":
      case "const void *":
        console.log(`Cannot handle void pointer param ${rawType}`);
        return ``;
      default: {
        // array of structs or handles
        if (param.isArray && (param.isStructType || param.isHandleType)) {
          return getInputArrayBody(param, index);
        }
        // struct or handle
        else if (param.isStructType || param.isHandleType) {
          let isReference = param.dereferenceCount > 0;
          let deinitialize = ``;
          // create deinitializer
          if (isReference) {
            if (param.isStructType) deinitialize = `nullptr`;
            else if (param.isHandleType) deinitialize = `VK_NULL_HANDLE`;
            else console.warn(`Cannot handle param reference deinitializer!`);
          } else {
            if (param.isHandleType) deinitialize = `VK_NULL_HANDLE`;
            else console.warn(`Cannot handle param deinitializer!`);
          }
          //console.log(!!param.isStructType, !!param.isHandleType, isReference);
          return `
  _${param.type}* obj${index};
  ${param.type} *$p${index};
  if (!(info[${index}]->IsNull())) {
    obj${index} = Nan::ObjectWrap::Unwrap<_${param.type}>(info[${index}]->ToObject());
    $p${index} = &obj${index}->instance;
  } else {
    $p${index} = ${deinitialize};
  }`;
        }
        console.warn(`Cannot handle param ${rawType} in call-body-before!`);
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
    // if handle is null then use VK_NULL_HANDLE
    else if (
      !param.isConstant &&
      param.isHandleType &&
      param.dereferenceCount <= 0
    ) out += `    info[${index}]->IsNull() ? VK_NULL_HANDLE : *$p${index}${addComma}`;
    else if (
      param.dereferenceCount <= 0 &&
      (param.isStructType || param.isHandleType)
    ) out += `    *$p${index}${addComma}`;
    else if (
      param.dereferenceCount > 0 &&
      !(param.isStructType || param.isHandleType || param.enumType || param.isNumericArray)
    ) out += `    &$p${index}${addComma}`;
    else {
      out += `    $p${index}${addComma}`;
    }
  });
  return out;
};

/**
 * Reads back copied content
 */
function getCallBodyAfter(params) {
  let out = [];
  params.map((param, pIndex) => {
    let isReference = param.dereferenceCount > 0;
    let isConstant = param.isConstant;
    if (isConstant) return;
    // array of structs
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
    // passed in parameter is a struct which gets filled by vulkan
    // and which we need to back-reflect to v8 manually
    } else if (param.isStructType && isReference) {
      let instr = getMutableStructReflectInstructions(param.type, pIndex, `obj${pIndex}->`);
      out.push(instr);
    }
    // array of enums
    else if (param.isArray && param.enumType) {
      out.push(`
  if (info[${pIndex}]->IsArray()) {
    v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(info[${pIndex}]);
    for (unsigned int ii = 0; ii < array->Length(); ++ii) {
      v8::Handle<v8::Value> item = Nan::Get(array, ii).ToLocalChecked();
      array->Set(ii, Nan::New($p${pIndex}[ii]));
    };
  }`);
    }
    // array of handles
    else if (param.isArray && param.isHandleType) {
      let handle = getHandleByHandleName(param.type);
      let parentHandle = getHandleByHandleName(param.handleType);
      if (handle.isNonDispatchable || parentHandle.isNonDispatchable) {
        out.push(`
  if (info[${pIndex}]->IsArray()) {
    v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(info[${pIndex}]);
    for (unsigned int ii = 0; ii < array->Length(); ++ii) {
      v8::Handle<v8::Value> item = Nan::Get(array, ii).ToLocalChecked();
      _${param.type}* target = Nan::ObjectWrap::Unwrap<_${param.type}>(item->ToObject());
      target->instance = $p${pIndex}[ii];
    };
    delete[] $p${pIndex};
  }`);
      }
    }
    else if (param.isStructType) {
      // no reflection needed
    }
    else if (param.isString) {
      // no reflection needed
    }
    else if (param.isNumber) {
      // no reflection needed
    }
    else if (param.enumType) {
      // no reflection needed
    }
    else if (param.isHandleType) {
      // no reflection needed
    }
    else if (param.rawType === "void **") {
      /*out.push(`
  v8::Local<v8::ArrayBuffer> arr = v8::ArrayBuffer::New(
    v8::Isolate::GetCurrent(),
    $p${pIndex},
    static_cast<size_t>($p3)
  );
  obj${pIndex}->Set(Nan::New("$").ToLocalChecked(), arr);`);*/
      out.push(`
  v8::Local<v8::BigInt> ptr${pIndex} = v8::BigInt::New(v8::Isolate::GetCurrent(), (int64_t)$p${pIndex});
  obj${pIndex}->Set(Nan::New("$").ToLocalChecked(), ptr${pIndex});`);
    }
    else {
      // array of numbers or bools
      switch (param.rawType) {
        case "int *":
        case "size_t *":
        case "int32_t *":
        case "uint32_t *":
        case "uint64_t *":
        case "const int32_t *":
        case "const uint32_t *":
        case "const uint64_t *":
        case "const float *":
        case "VkBool32 *":
          out.push(`
    obj${pIndex}->Set(Nan::New("$").ToLocalChecked(), Nan::New($p${pIndex}));`);
          break;
        default:
          console.warn(`Cannot handle ${param.type} in call-body-after!`);
      };
    }
  });
  return out.join("");
};

function getCallBody(call) {
  let out = ``;
  let vari = ``;
  let before = getCallBodyBefore(call);
  let inner = getCallBodyInner(call);
  let outer = getCallBodyAfter(call.params);
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

/**
 * This is a fairly complex function
 * It recursively back-reflects a struct and all its members
 */
function getMutableStructReflectInstructions(name, pIndex, basePath, out = []) {
  let struct = getStructByStructName(name);
  // go through each struct meber and manually back-reflect it
  struct.children.map((member, mIndex) => {
    // these can be ignored
    if (
      member.isNumber ||
      member.isBoolean ||
      member.isEnumType ||
      member.isBaseType ||
      member.bitmaskType ||
      member.enumType
    ) return;
    // raw string
    if (member.isString && member.isStaticArray) {
      out.push(`
  {
    // back reflect string
    v8::Local<v8::String> str${pIndex} = v8::String::NewFromUtf8(v8::Isolate::GetCurrent(), (&${basePath}instance)->${member.name});
    ${basePath}${member.name} = Nan::Persistent<v8::String, v8::CopyablePersistentTraits<v8::String>>(str${pIndex});
  }`);
    }
    // array of numbers
    else if (member.isNumericArray) {
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
    // raw struct
    else if (member.isStructType && !member.isArray) {
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
    }
    // array of structs
    else if (member.isStructType && member.isArray) {
      out.push(`
  {
    // back reflect array
    unsigned int len = obj${pIndex}->instance.${member.dynamicLength};
    v8::Local<v8::Array> arr = v8::Array::New(v8::Isolate::GetCurrent(), len);
    // populate array
    for (unsigned int ii = 0; ii < len; ++ii) {
      v8::Local<v8::Function> ctor = Nan::GetFunction(Nan::New(_${member.type}::constructor)).ToLocalChecked();
      v8::Local<v8::Object> inst = Nan::NewInstance(ctor).ToLocalChecked();
      _${member.type}* unwrapped = Nan::ObjectWrap::Unwrap<_${member.type}>(inst);
      memcpy(&unwrapped->instance, &obj1->instance.${member.name}[ii], sizeof(${member.type}));
      arr->Set(ii, inst);
    };
    obj${pIndex}->${member.name} = Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>>(arr);
  }`);
    }
    else {
      console.log(`Error: Cannot handle param member ${member.name} of type ${member.type}`);
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
    default: {
      //console.warn(`Cannot handle ${rawType} in call-return!`);
    }
  };
  if (call.enumType) {
    return `info.GetReturnValue().Set(Nan::New(static_cast<int32_t>(out)));`;
  }
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
