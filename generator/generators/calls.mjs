/**

  Generates C++ binding code for vulkan function calls

**/
import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

import {
  warn, error,
  isPNextMember,
  isIgnoreableType,
  getNapiTypedArrayName
} from "../utils";

let ast = null;

const CPP_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/calls-cpp.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

function getCallExtension(call) {
  let extensions = ast.filter(node => node.kind === "EXTENSION");
  for (let ii = 0; ii < extensions.length; ++ii) {
    let extension = extensions[ii];
    for (let jj = 0; jj < extension.members.length; ++jj) {
      let member = extension.members[jj];
      if (member.kind === `EXTENSION_MEMBER_COMMAND` && member.name === call.name) {
        return { extension, member };
      }
    };
  };
  return null;
};

function getStructByStructName(name) {
  let structs = ast.filter(node => node.kind === "STRUCT");
  for (let ii = 0; ii < structs.length; ++ii) {
    let struct = structs[ii];
    if (struct.name === name) return struct;
  };
  error(`Cannot resolve struct by name "${name}"`);
  return null;
};

function getHandleByHandleName(name) {
  let handles = ast.filter(node => node.kind === "HANDLE");
  for (let ii = 0; ii < handles.length; ++ii) {
    let handle = handles[ii];
    if (handle.name === name) return handle;
  };
  error(`Cannot resolve handle by name "${name}"`);
  return null;
};

function getParamIndexByParamName(call, name) {
  for (let ii = 0; ii < call.params.length; ++ii) {
    let param = call.params[ii];
    if (param.name === name) return ii;
  };
  error(`Cannot resolve param index by name "${name}"`);
  return null;
};

function getMemberCopyInstructions(struct) {
  let out = ``;
  struct.children.map(member => {
    if (member.isStructType) {
      out += `
      instance->${member.name} = copy->${member.name};`;
      out += `
      if (&copy->${member.name} != nullptr) {
        std::vector<napi_value> args;
        Napi::Object inst = _${member.type}::constructor.New(args);
        _${member.type}* unwrapped = Napi::ObjectWrap<_${member.type}>::Unwrap(inst);
        result->${member.name}.Reset(inst);
        unwrapped->instance = copy->${member.name};
      }`;
    }
    else if (member.isHandleType) {
      // can be ignored
    }
    else if (member.isString) {
      out += `
      {
        Napi::String str = Napi::String::New(env, copy->${member.name});
        result->${member.name}.Reset(str.ToObject());
        strcpy(const_cast<char *>(instance->${member.name}), copy->${member.name});
      }`;
    }
    else if (member.isArray) {
      // TODO
      console.log(`Error: Member copy instruction for arrays not handled yet!`);
    }
    else if (member.isNumber || member.bitmaskType || member.enumType) {
      out += `
      instance->${member.name} = copy->${member.name};`;
    }
    else if (member.type === "void") {
      // ???
    }
    else {
      warn(`Cannot handle ${member.type} in get-member-copy-instruction!`);
    }
  });
  return out;
};

function getInputArrayBody(param, index) {
  let {rawType} = param;
  if (param.isBaseType) rawType = param.baseType;
  let out = ``;
  let {isConstant} = param;
  if (param.dereferenceCount <= 0) warn(`Cannot handle non-reference item in input-array-body!`);
  // create variable
  {
    let varType = param.enumType || param.baseType || param.type;
    if (param.isTypedArray) {
      out += `
  std::shared_ptr<${param.type}*> $p${index} = nullptr;\n`;
    }
    else if (param.isHandleType || param.isStructType) {
      out += `
  std::shared_ptr<std::vector<${varType}>> $p${index} = nullptr;\n`;
    }
    else if (param.enumType) {
      out += `
  ${varType} *$p${index} = nullptr;\n`;
    }
    else {
      warn(`Cannot handle param intializer ${rawType} in input-array-body!`);
    }
  }
  // fill variable
  let condition = `IsArray()`;
  // validate that we got a typed array
  if (param.isTypedArray) condition = `IsTypedArray()`;
  // fill variable
  out += `
  if (info[${index}].${condition}) {\n`;
  // auto flush structs
  if (param.isStructType) {
    out += `
  {
    Napi::Array array = info[${index}].As<Napi::Array>();
    for (unsigned int ii = 0; ii < array.Length(); ++ii) {
      Napi::Value item = array.Get(ii);
      Napi::Object obj = item.As<Napi::Object>();
      _${param.type}* result = Napi::ObjectWrap<_${param.type}>::Unwrap(obj);
      if (!result->flush()) return env.Undefined();
    };
  }`;
  }
  // handle
  if (param.isHandleType) {
    out += `
    Napi::Array array = info[${index}].As<Napi::Array>();
    std::vector<${param.type}> data(array.Length());
    for (unsigned int ii = 0; ii < array.Length(); ++ii) {
      Napi::Value item = array.Get(ii);
      Napi::Object obj = item.As<Napi::Object>();
      _${param.type}* result = Napi::ObjectWrap<_${param.type}>::Unwrap(obj);
      data[ii] = result->instance;
    };
    $p${index} = std::make_shared<std::vector<${param.type}>>(data);`;
  }
  // struct
  else if (param.isStructType) {
    out += `
    Napi::Array array = info[${index}].As<Napi::Array>();
    std::vector<${param.type}> data(array.Length());
    for (unsigned int ii = 0; ii < array.Length(); ++ii) {
      Napi::Value item = array.Get(ii);
      Napi::Object obj = item.As<Napi::Object>();
      _${param.type}* result = Napi::ObjectWrap<_${param.type}>::Unwrap(obj);
      data[ii] = result->instance;
    };
    $p${index} = std::make_shared<std::vector<${param.type}>>(data);`;
  }
  // typed array
  else if (param.isTypedArray) {
    let type = param.baseType || param.type;
    out += `
    if (info[${index}].As<Napi::TypedArray>().TypedArrayType() != ${getNapiTypedArrayName(param.jsTypedArrayName)}) {
      Napi::TypeError::New(env, "Invalid type for argument ${index + 1} '${param.name}'").ThrowAsJavaScriptException();
      return env.Undefined();
    }
    ${type}* data = getTypedArrayData<${type}>(info[${index}]);
    $p${index} = std::make_shared<${type}*>(data);`;
  }
  // enum
  else if (param.enumType) {
    out += `
    Napi::Array array = info[${index}].As<Napi::Array>();
    ${param.enumType}* arr${index} = new ${param.enumType}[array.Length()];
    $p${index} = arr${index};`;
  }
  // numbers
  else if (param.isNumericArray && isConstant) {
    let type = param.baseType || param.type;
    out += `
    std::vector<${type}> data = createArrayOfV8Numbers<${type}>(info[${index}]);
    $p${index} = std::make_shared<std::vector<${type}>>(data);`;
  }
  else {
    warn(`Cannot handle param ${rawType} in input-array-body!`);
  }
  out += `
  } else if (!info[${index}].IsNull()) {
    Napi::TypeError::New(env, "Invalid type for argument ${index + 1} '${param.name}'").ThrowAsJavaScriptException();
    return env.Undefined();
  }\n`;
  return out;
};

function getCallBodyBefore(call) {
  let {params} = call;
  let out = params.map((param, index) => {
    if (param.isVoidPointer) {
      return `
  ${param.type}* $p${index};
  if (info[${index}].IsArrayBuffer()) {
    Napi::ArrayBuffer buf = info[${index}].As<Napi::ArrayBuffer>();
    $p${index} = buf.Data();
  } else if (!info[${index}].IsNull()) {
    Napi::TypeError::New(env, "Expected '${param.jsTypedArrayName}' or 'null' for argument ${index + 1} '${param.name}'").ThrowAsJavaScriptException();
    return env.Undefined();
  }`;
    }
    if (isIgnoreableType(param)) return ``;
    let {rawType} = param;
    // ignore
    if (param.name === "pAllocator") {
      return ``;
    }
    if (param.isStaticArray && param.isNumericArray) {
      return `
    std::shared_ptr<std::vector<${param.type}>> $p${index} = nullptr;
    if (info[${index}].IsArray()) {
      // validate length
      if (info[${index}].As<Napi::Array>().Length() != ${param.length}) {
        Napi::RangeError::New(env, "Invalid array length for argument ${index + 1} '${param.name}'").ThrowAsJavaScriptException();
        return env.Undefined();
      } else {
        std::vector<${param.type}> data = createArrayOfV8Numbers<${param.type}>(info[${index}]);
        $p${index} = std::make_shared<std::vector<${param.type}>>(data);
      }
    } else if (!info[${index}].IsNull()) {
      Napi::TypeError::New(env, "Invalid type for argument ${index + 1} '${param.name}'").ThrowAsJavaScriptException();
      return env.Undefined();
    }`;
    }
    else if (param.isArray && param.enumType) {
      return getInputArrayBody(param, index);
    }
    if (param.baseType === "VkBool32" && param.dereferenceCount > 0) {
      return `
    Napi::Object obj${index};
    ${param.type} $p${index};
    if (info[${index}].IsObject()) {
      obj${index} = info[${index}].As<Napi::Object>();
      if (!obj${index}.Has("$")) {
        Napi::Error::New(env, "Missing Object property '$' for argument ${index + 1}").ThrowAsJavaScriptException();
        return env.Undefined();
      }
      Napi::Value val = obj${index}.Get("$");
      $p${index} = static_cast<${param.type}>(val.As<Napi::Boolean>().Value());
    } else if (!info[${index}].IsNull()) {
      Napi::TypeError::New(env, "Expected 'Object' or 'null' for argument ${index + 1} '${param.name}'").ThrowAsJavaScriptException();
      return env.Undefined();
    }`;
    }
    switch (rawType) {
      case "int":
      case "float":
      case "size_t":
      case "int32_t":
      case "uint32_t":
      case "uint64_t": {
        let type = param.enumType || param.type;
        return `
  ${type} $p${index} = static_cast<${type}>(info[${index}].As<Napi::Number>().Int64Value());`;
      }
      case "const char *":
        return `
  ${param.type}* $p${index};
  if (info[${index}].IsString()) {
    $p${index} = copyV8String(info[${index}]);
  } else if (!info[${index}].IsNull()) {
    Napi::TypeError::New(env, "Expected 'String' or 'null' for argument ${index + 1} '${param.name}'").ThrowAsJavaScriptException();
    return env.Undefined();
  }`;
        return ``;
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
  Napi::Object obj${index};
  ${param.type} $p${index};
  if (info[${index}].IsObject()) {
    obj${index} = info[${index}].As<Napi::Object>();
    if (!obj${index}.Has("$")) {
      Napi::Error::New(env, "Missing Object property '$' for argument ${index + 1}").ThrowAsJavaScriptException();
      return env.Undefined();
    }
    Napi::Value val = obj${index}.Get("$");
    $p${index} = static_cast<${param.type}>(val.As<Napi::Number>().Int64Value());
  } else if (!info[${index}].IsNull()) {
    Napi::TypeError::New(env, "Expected 'Object' or 'null' for argument ${index + 1} '${param.name}'").ThrowAsJavaScriptException();
    return env.Undefined();
  }`;
        }
      case "void **":
        return `
  Napi::Object obj${index} = info[${index}].As<Napi::Object>();
  void *$p${index};`;
      case "const void *":
        return `
  ${param.type}* $p${index};
  if (info[${index}].IsTypedArray()) {
    $p${index} = value.As<Napi::TypedArray>().ArrayBuffer().Data();
  } else if (!info[${index}].IsNull()) {
    Napi::TypeError::New(env, "Expected '${param.jsTypedArrayName}' or 'null' for argument ${index + 1} '${param.name}'").ThrowAsJavaScriptException();
    return env.Undefined();
  }`;
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
            else warn(`Cannot handle param reference deinitializer!`);
          } else {
            if (param.isHandleType) deinitialize = `VK_NULL_HANDLE`;
            else warn(`Cannot handle param deinitializer!`);
          }
          return `
  _${param.type}* obj${index};
  ${param.type} *$p${index};
  if (info[${index}].IsObject()) {
    Napi::Object obj = info[${index}].As<Napi::Object>();
    if (!(obj.InstanceOf(_${param.type}::constructor.Value()))) {
      NapiObjectTypeError(info[${index}], "argument ${index + 1}", "[object ${param.type}]");
      return env.Undefined();
    }
    obj${index} = Napi::ObjectWrap<_${param.type}>::Unwrap(obj);
    ${ param.isStructType ? `if (!obj${index}->flush()) return env.Undefined();` : `` }
    $p${index} = &obj${index}->instance;
  } else if (info[${index}].IsNull()) {
    $p${index} = ${deinitialize};
  } else {
    Napi::TypeError::New(env, "Expected 'Object' or 'null' for argument ${index + 1} '${param.name}'").ThrowAsJavaScriptException();
  }`;
        }
        warn(`Cannot handle param ${rawType} in call-body-before!`);
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
    if (param.isVoidPointer) {
      out += `    info[${index}].IsNull() ? nullptr : $p${index}${addComma}`;
      return;
    }
    if (isIgnoreableType(param)) {
      out += `nullptr${addComma}`;
      return;
    }
    if (param.name === "pAllocator") {
      out += `    nullptr${addComma}`;
      return;
    }
    else if (
      param.isStaticArray &&
      param.isNumericArray
    ) out += `    $p${index} ? $p${index}.get()->data() : nullptr${addComma}`;
    else if (
      param.isTypedArray && param.enumType
    ) {
      out += `    $p${index} ? (${param.enumType} *) *$p${index}.get() : nullptr${addComma}`;
    }
    else if (
      param.isTypedArray
    ) {
      out += `    $p${index} ? *$p${index}.get() : nullptr${addComma}`;
    }
    else if (
      param.isArray &&
      (param.isHandleType || param.isStructType)
    ) {
      out += `    $p${index} ? (${param.rawType}) $p${index}.get()->data() : nullptr${addComma}`;
    }
    else if (
      param.rawType === `const void *`
    ) out += `    $p${index}${addComma}`;
    // if handle is null then use VK_NULL_HANDLE
    else if (
      !param.isConstant &&
      param.isHandleType &&
      param.dereferenceCount <= 0
    ) out += `    info[${index}].IsNull() ? VK_NULL_HANDLE : *$p${index}${addComma}`;
    else if (
      param.dereferenceCount <= 0 &&
      (param.isStructType || param.isHandleType)
    ) out += `    *$p${index}${addComma}`;
    else if (
      param.isString &&
      param.dereferenceCount > 0
    ) out += `    $p${index}${addComma}`;
    else if (
      param.isNumber &&
      param.isBitmaskType
    ) out += `    static_cast<${param.bitmaskRawType}>($p${index})${addComma}`;
    else if (
      param.isBitmaskType &&
      param.dereferenceCount > 0
    ) out += `    reinterpret_cast<${param.bitmaskRawType}>(&$p${index})${addComma}`;
    else if (
      param.dereferenceCount > 0 &&
      !(param.isStructType || param.isHandleType || param.enumType)
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
function getCallBodyAfter(call) {
  let out = [];
  let {params} = call;
  params.map((param, pIndex) => {
    if (isIgnoreableType(param)) return;
    let isReference = param.dereferenceCount > 0;
    let isConstant = param.isConstant;
    if (isConstant) return;
    // array of structs
    if (param.isArray && param.isStructType) {
      let struct = getStructByStructName(param.type);
      let memberCopyInstructions = getMemberCopyInstructions(struct);
      out.push(`
  if (info[${pIndex}].IsArray()) {
    ${param.type}* $pdata = $p${pIndex}.get()->data();
    Napi::Array array = info[${pIndex}].As<Napi::Array>();
    for (unsigned int ii = 0; ii < array.Length(); ++ii) {
      Napi::Value item = array.Get(ii);
      Napi::Object obj = item.As<Napi::Object>();
      _${param.type}* result = Napi::ObjectWrap<_${param.type}>::Unwrap(obj);
      ${param.type} *instance = &result->instance;
      ${param.type} *copy = &$pdata[ii];
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
    else if (param.isTypedArray && param.enumType) {
      // no reflection needed
    }
    // array of handles
    else if (param.isArray && param.isHandleType) {
      out.push(`
  if (info[${pIndex}].IsArray()) {
    ${param.type}* $pdata = $p${pIndex}.get()->data();
    Napi::Array array = info[${pIndex}].As<Napi::Array>();
    for (unsigned int ii = 0; ii < array.Length(); ++ii) {
      Napi::Value item = array.Get(ii);
      Napi::Object obj = item.As<Napi::Object>();
      _${param.type}* target = Napi::ObjectWrap<_${param.type}>::Unwrap(obj);
      target->instance = $pdata[ii];
    };
  }`);
    }
    // typed array
    else if (param.isTypedArray && !param.isConstant) {
      // no reflection needed
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
  Napi::BigInt ptr${pIndex} = Napi::BigInt::New(env, (int64_t)$p${pIndex});
  obj${pIndex}.Set("$", ptr${pIndex});`);
    }
    else {
      // array of numbers or bools
      switch (param.rawType) {
        case "size_t *":
        case "uint64_t *":
        case "const uint64_t *":
          out.push(`
    Napi::BigInt pnum${pIndex} = Napi::BigInt::New(env, (uint64_t)$p${pIndex});
    obj${pIndex}.Set("$", pnum${pIndex});`);
          break;
        case "int *":
        case "int32_t *":
        case "uint32_t *":
        case "const int32_t *":
        case "const uint32_t *":
        case "const float *":
          out.push(`
    obj${pIndex}.Set("$", $p${pIndex});`);
          break;
        case "VkBool32 *":
          out.push(`
    obj${pIndex}.Set("$", $p${pIndex});`);
          break;
        default:
          warn(`Cannot handle ${param.type} in call-body-after!`);
      };
    }
  });
  return out.join("");
};

function getCallProcedure(call) {
  let out = ``;
  let callee = call.name;
  let inner = getCallBodyInner(call);
  let ext = getCallExtension(call);
  if (ext) {
    callee = `$${call.name}`;
  }
  if (call.rawType !== "void") {
    out += `
  ${call.type} out = `;
  } else {
    out += `\n`;
  }
  out += `${callee}(
${inner}
  );`;
  return out;
};

function getCallBody(call) {
  let out = ``;
  let vari = ``;
  let before = getCallBodyBefore(call);
  let outer = getCallBodyAfter(call);
  out += before;
  out += getCallProcedure(call);
  out += outer;
  return out;
};

/**
 * This is a fairly complex function
 * It recursively back-reflects a struct and all its members
 */
function getMutableStructReflectInstructions(name, pIndex, basePath, out = []) {
  let struct = getStructByStructName(name);
  // go through each struct member and manually back-reflect it
  struct.children.map((member, mIndex) => {
    // these can be ignored
    if (
      member.isNumber ||
      member.isBoolean ||
      member.isBaseType ||
      member.bitmaskType ||
      member.enumType ||
      isIgnoreableType(member)
    ) return;
    // TODO: validate that this works
    // pNext structure could have needs for deep reflection
    if (isPNextMember(member)) {
      // idea:
      // read sType using: ((int*)(self->instance.pNext))[0]);
      // and recursively reflect based on AST node.extensions[sType]
      return;
    }
    // string
    if (member.isString && member.isStaticArray) {
      out.push(`
  {
    // back reflect string
    Napi::String str${pIndex} = Napi::String::New(env, (&${basePath}instance)->${member.name});
    ${basePath}${member.name}.Reset(str${pIndex}.ToObject());
  }`);
    }
    // struct
    else if (member.isStructType && !member.isArray) {
      out.push(`
  {
    std::vector<napi_value> args;
    Napi::Object inst = _${member.type}::constructor.New(args);
    _${member.type}* unwrapped${basePath.length} = Napi::ObjectWrap<_${member.type}>::Unwrap(inst);
    ${basePath}${member.name}.Reset(inst);
    memcpy((&unwrapped${basePath.length}->instance), &${basePath}instance.${member.name}, sizeof(${member.type}));
    ${getMutableStructReflectInstructions(member.type, pIndex, `unwrapped${basePath.length}->`, [])}
  }
      `);
    }
    // array of numbers
    else if (member.isNumericArray) {
      out.push(`
  {
    // back reflect array
    Napi::Array arr${pIndex} = Napi::Array::New(env, ${member.length});
    // populate array
    for (unsigned int ii = 0; ii < ${member.length}; ++ii) {
      arr${pIndex}.Set(ii, Napi::Number::New(env, (&${basePath}instance)->${member.name}[ii]));
    };
    ${basePath}${member.name}.Reset(arr${pIndex}.ToObject());
  }`);
    }
    // array of structs
    else if (member.isStructType && member.isArray) {
      // TODO: this only works for primitive-type members
      out.push(`
  {
    // back reflect array
    unsigned int len = ${basePath}instance.${member.dynamicLength};
    Napi::Array arr = Napi::Array::New(env, len);
    // populate array
    for (unsigned int ii = 0; ii < len; ++ii) {
      std::vector<napi_value> args;
      Napi::Object inst = _${member.type}::constructor.New(args);
      _${member.type}* unwrapped = Napi::ObjectWrap<_${member.type}>::Unwrap(inst);
      memcpy(&unwrapped->instance, &${basePath}instance.${member.name}[ii], sizeof(${member.type}));
      arr.Set(ii, inst);
    };
    ${basePath}${member.name}.Reset(arr.ToObject());
  }`);
    }
    else {
      console.log(`Error: Cannot handle member ${member.name} of type ${member.type} in mutable-struct-reflection!`);
    }
  });
  return out.join("");
};

function getCallReturn(call) {
  let {rawType} = call;
  switch (rawType) {
    case "void":
      return `
  return env.Undefined();
  `;
    case "VkBool32":
      return `
  return Napi::Boolean::New(env, !!out);
  `;
    case "int8_t":
    case "int16_t":
    case "int32_t":
    case "uint8_t":
    case "uint16_t":
    case "uint32_t":
      return `
  return Napi::Number::New(env, static_cast<int32_t>(out));
  `;
    case "uint64_t":
      return `
  return Napi::BigInt::New(env, static_cast<int64_t>(out));
  `;
    default: {
      //console.warn(`Cannot handle ${rawType} in call-return!`);
    }
  };
  if (call.enumType) {
    return `
  return Napi::Number::New(env, static_cast<int32_t>(out));
  `;
  }
  return `
  return Napi::Number::New(env, 0);
  `;
};

function getCallObjectUpdate(call) {
  switch (call.name) {
    case "vkCreateDevice": {
      let index = getParamIndexByParamName(call, "pDevice");
      return `
  vkUseDevice(obj${index}->instance);`;
    }
    case "vkCreateInstance": {
      let index = getParamIndexByParamName(call, "pInstance");
      return `
  vkUseInstance(obj${index}->instance);`;
    }
  };
  return ``;
};

function getCallProcAddrDeclarations(calls) {
  let out = ``;
  calls.map(call => {
    let ext = getCallExtension(call);
    if (ext) {
      let {extension} = ext;
      if (extension.type === "device" || extension.type === "instance") {
        out += `
PFN_${call.name} $${call.name} = nullptr;`;
      }
    }
  });
  return out;
};

function getCallProcAddrInitializers(calls, type) {
  let out = ``;
  calls.map(call => {
    let ext = getCallExtension(call);
    if (ext) {
      let {extension} = ext;
      if (extension.type === type) {
        if (extension.type === "device") {
          out += `
  $${call.name} = (PFN_${call.name}) vkGetDeviceProcAddr(currentDevice, "${call.name}");`;
        }
        else if (extension.type === "instance") {
          out += `
  $${call.name} = (PFN_${call.name}) vkGetInstanceProcAddr(currentInstance, "${call.name}");`;
        }
      }
    }
  });
  return out;
};

export default function(astReference, calls) {
  ast = astReference;
  let vars = {
    calls,
    getCallBody,
    getCallReturn,
    getCallObjectUpdate,
    getCallProcAddrDeclarations,
    getCallProcAddrInitializers
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
