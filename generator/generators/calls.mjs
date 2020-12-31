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
  getAutoStructureType,
  getNapiTypedArrayName,
  getStructByStructName,
  getHandleByHandleName
} from "../utils.mjs";

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

function getParamByParamName(call, name) {
  for (let ii = 0; ii < call.params.length; ++ii) {
    let param = call.params[ii];
    if (param.name === name) return param;
  };
  warn(`Cannot resolve param by name "${name}"`);
  return null;
};

function getParamIndexByParamName(call, name) {
  for (let ii = 0; ii < call.params.length; ++ii) {
    let param = call.params[ii];
    if (param.name === name) return ii;
  };
  return -1;
};

function getInputArrayBody(call, param, index) {
  let {rawType} = param;
  let out = ``;
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
    else if (param.dereferenceCount === 2 && param.isNumericArray) {
      out += `
  std::shared_ptr<std::vector<${varType}*>> $p${index} = nullptr;\n`;
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
  if (param.length) {
    if (param.isHandleType || param.isStructType) {
      let lengthIndex = getParamIndexByParamName(call, param.length);
      if (!param.length.match("->") && lengthIndex > -1) {
        let lengthParam = getParamByParamName(call, param.length);
        if (lengthParam.dereferenceCount > 0) {
          out += `
    // validate length
    {
      uint32_t expectedLength = info[${lengthIndex}].As<Napi::Object>().Get("$").As<Napi::Number>().Uint32Value();
      if (info[${index}].As<Napi::Array>().Length() != expectedLength) {
        Napi::RangeError::New(env, "Invalid array length for argument ${index + 1} '${param.name}' in '${call.name}'").ThrowAsJavaScriptException();
        return env.Undefined();
      }
    }`;
        } else if (lengthParam.isNumber && lengthParam.type === "uint32_t") {
          out += `
    // validate length
    if (info[${index}].As<Napi::Array>().Length() != info[${lengthIndex}].As<Napi::Number>().Uint32Value()) {
      Napi::RangeError::New(env, "Invalid array length for argument ${index + 1} '${param.name}' in '${call.name}'").ThrowAsJavaScriptException();
      return env.Undefined();
    }`;
        } else {
          warn(`Cannot handle param length validation for ${call.name}.${param.name} (${param.length})`);
        }
      // length gets read from structure
      } else if (param.length.match("::")) {
        let normalizedName = param.length.split("::")[0];
        let structureMemberName = param.length.split("::")[1];
        let lengthIndex = getParamIndexByParamName(call, normalizedName);
        out += `
    // validate length
    if ($p${lengthIndex} != nullptr && info[${index}].As<Napi::Array>().Length() != $p${lengthIndex}->${structureMemberName}) {
      Napi::RangeError::New(env, "Invalid array length for argument ${lengthIndex + 1} '${param.length.replace("::", ".")}' in '${call.name}'").ThrowAsJavaScriptException();
      return env.Undefined();
    }`;
      }
      // length get read from other param
      else if (call.params.filter(p => p.name === param.length.split("->")[0])[0]) {
        let readParam = call.params.filter(p => p.name === param.length.split("->")[0])[0];
        // we only support structs for now
        if (!readParam.isStructType) {
          warn(`Cannot handle non-struct param length validation for ${call.name}.${param.name} (${param.length})`);
        }
        let paramName = param.length.split("->")[0];
        let memberName = param.length.split("->")[1];
        let lengthIndex = getParamIndexByParamName(call, paramName);
        out += `
    // validate length
    if ($p${lengthIndex} != nullptr && info[${index}].As<Napi::Array>().Length() != $p${lengthIndex}->${memberName}) {
      Napi::RangeError::New(env, "666 Invalid array length for argument ${lengthIndex + 1} '${param.length}' in '${call.name}'").ThrowAsJavaScriptException();
      return env.Undefined();
    }`;
      }
      else {
        warn(`Cannot handle param length validation for ${call.name}.${param.name} (${param.length})`);
      }
    }
  }
  // handle
  if (param.isHandleType) {
    out += `
    Napi::Array array = info[${index}].As<Napi::Array>();
    std::vector<${param.type}> data(array.Length());
    for (unsigned int ii = 0; ii < array.Length(); ++ii) {
      Napi::Value item = array.Get(ii);
      Napi::Object obj = item.As<Napi::Object>();
      if ((obj.Get("constructor").As<Napi::Object>().Get("name").As<Napi::String>().Utf8Value()) != "${param.type}") {
        NapiObjectTypeError(info[0], "argument ${index + 1}", "${param.type}");
        return env.Undefined();
      }
      ${param.type}* instance = reinterpret_cast<${param.type}*>(obj.Get("memoryBuffer").As<Napi::ArrayBuffer>().Data());
      data[ii] = *instance;
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
      if ((obj.Get("constructor").As<Napi::Object>().Get("name").As<Napi::String>().Utf8Value()) != "${param.type}") {
        NapiObjectTypeError(info[${index}], "argument ${index + 1}", "${param.type}");
        return env.Undefined();
      }
      Napi::Value flushCall = obj.Get("flush").As<Napi::Function>().Call(obj, {  });
      if (!(flushCall.As<Napi::Boolean>().Value())) return env.Undefined();
      ${param.type}* instance = reinterpret_cast<${param.type}*>(obj.Get("memoryBuffer").As<Napi::ArrayBuffer>().Data());
      data[ii] = *instance;
    };
    $p${index} = std::make_shared<std::vector<${param.type}>>(data);`;
  }
  // typed array
  else if (param.isTypedArray) {
    let type = param.baseType || param.type;
    let lengthIndex = getParamIndexByParamName(call, param.length);
    out += `
    if (info[${index}].As<Napi::TypedArray>().TypedArrayType() != ${getNapiTypedArrayName(param.jsTypedArrayName)}) {
      Napi::TypeError::New(env, "Invalid type for argument ${index + 1} '${param.name}' in '${call.name}'").ThrowAsJavaScriptException();
      return env.Undefined();
    }`;
    out += `
    if (info[${index}].As<Napi::TypedArray>().ElementLength() != $p${lengthIndex}) {
      Napi::RangeError::New(env, "Invalid array length for argument ${index + 1} '${param.name}' in '${call.name}'").ThrowAsJavaScriptException();
      return env.Undefined();
    }`;
    out += `
    ${type}* data = getTypedArrayData<${type}>(info[${index}]);
    $p${index} = std::make_shared<${type}*>(data);`;
  }
  // array of array of numbers
  else if (param.dereferenceCount === 2 && param.isNumericArray) {
    if (param.type !== "uint32_t") {
      warn(`Cannot handle array of array of numbers type '${param.type}'`);
    }
    out += `
    Napi::Array array = info[${index}].As<Napi::Array>();
    std::vector<${param.type}*> data(array.Length());
    for (unsigned int ii = 0; ii < array.Length(); ++ii) {
      Napi::Value item = array.Get(ii);
      Napi::Array innerArray = item.As<Napi::Array>();
      ${param.type}* innerData = new ${param.type}[innerArray.Length()];
      for (unsigned int ii = 0; ii < innerArray.Length(); ++ii) {
        Napi::Value item = innerArray.Get(ii);
        uint32_t value = item.As<Napi::Number>().Uint32Value();
        innerData[ii] = value;
      }
      data.push_back(innerData);
    };
    $p${index} = std::make_shared<std::vector<${param.type}*>>(data);`;
  }
  else {
    warn(`Cannot handle param ${rawType} in input-array-body!`);
  }
  out += `
  } else if (!info[${index}].IsNull()) {
    Napi::TypeError::New(env, "Invalid type for argument ${index + 1} '${param.name}' in '${call.name}'").ThrowAsJavaScriptException();
    return env.Undefined();
  }\n`;
  return out;
};

function getCallBodyBefore(call) {
  let {params} = call;
  let out = params.map((param, index) => {
    if (param.isVoidPointer) {
      return `
  ${param.type}* $p${index} = nullptr;
  if (info[${index}].IsArrayBuffer()) {
    Napi::ArrayBuffer buf = info[${index}].As<Napi::ArrayBuffer>();
    $p${index} = buf.Data();
  } else if (!info[${index}].IsNull()) {
    Napi::TypeError::New(env, "Expected '${param.jsTypedArrayName}' or 'null' for argument ${index + 1} '${param.name}' in '${call.name}'").ThrowAsJavaScriptException();
    return env.Undefined();
  }`;
    }
    if (param.isWin32Handle) {
      return `
  bool lossless${index} = false;
  if (!info[${index}].IsBigInt() && !info[${index}].IsNumber()) {
    Napi::TypeError::New(env, "Expected 'BigInt' or 'Number' for argument ${index + 1} '${param.name}' in '${call.name}'").ThrowAsJavaScriptException();
    return env.Undefined();
  }
  ${param.type} $p${index} = 0;
  if (info[${index}].IsBigInt()) {
    $p${index} = reinterpret_cast<${param.type}>(info[${index}].As<Napi::BigInt>().Int64Value(&lossless${index}));
  } else {
    $p${index} = reinterpret_cast<${param.type}>(info[${index}].As<Napi::Number>().Int64Value());
  }`;
    }
    if (param.isWin32HandleReference) {
      return `
  Napi::Object obj${index};
  ${param.type}* $p${index} = nullptr;
  if (info[${index}].IsObject()) {
    obj${index} = info[${index}].As<Napi::Object>();
    if (!obj${index}.Has("$")) {
      Napi::Error::New(env, "Missing Object property '$' for argument ${index + 1} '${param.name}' in '${call.name}'").ThrowAsJavaScriptException();
      return env.Undefined();
    }
    if (!(obj${index}.Get("$").IsBigInt())) {
      Napi::TypeError::New(env, "Expected 'BigInt' for Object property '$' ${index + 1} '${param.name}' in '${call.name}'").ThrowAsJavaScriptException();
      return env.Undefined();
    }
    Napi::Value val = obj${index}.Get("$");
    bool lossless = false;
    $p${index} = reinterpret_cast<${param.type}*>(val.As<Napi::BigInt>().Int64Value(&lossless));
  } else if (!info[${index}].IsNull()) {
    Napi::TypeError::New(env, "Expected 'Object' or 'null' for argument ${index + 1} '${param.name}' in '${call.name}'").ThrowAsJavaScriptException();
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
        Napi::RangeError::New(env, "Invalid array length for argument ${index + 1} '${param.name}' in '${call.name}'").ThrowAsJavaScriptException();
        return env.Undefined();
      }
      std::vector<${param.type}> data = createArrayOfV8Numbers<${param.type}>(info[${index}]);
      $p${index} = std::make_shared<std::vector<${param.type}>>(data);
    } else if (!info[${index}].IsNull()) {
      Napi::TypeError::New(env, "Invalid type for argument ${index + 1} '${param.name}' in '${call.name}'").ThrowAsJavaScriptException();
      return env.Undefined();
    }`;
    }
    else if (param.isArray && param.enumType) {
      return getInputArrayBody(call, param, index);
    }
    if (param.baseType === "VkBool32" && param.dereferenceCount > 0) {
      return `
    Napi::Object obj${index};
    ${param.type} $p${index} = 0;
    if (info[${index}].IsObject()) {
      obj${index} = info[${index}].As<Napi::Object>();
      if (!obj${index}.Has("$")) {
        Napi::Error::New(env, "Missing Object property '$' for argument ${index + 1} '${param.name}' in '${call.name}'").ThrowAsJavaScriptException();
        return env.Undefined();
      }
      if (!(obj${index}.Get("$").IsBoolean())) {
        Napi::TypeError::New(env, "Expected 'Boolean' for Object property '$' ${index + 1} '${param.name}' in '${call.name}'").ThrowAsJavaScriptException();
        return env.Undefined();
      }
      Napi::Value val = obj${index}.Get("$");
      $p${index} = static_cast<${param.type}>(val.As<Napi::Boolean>().Value());
    } else if (!info[${index}].IsNull()) {
      Napi::TypeError::New(env, "Expected 'Object' or 'null' for argument ${index + 1} '${param.name}' in '${call.name}'").ThrowAsJavaScriptException();
      return env.Undefined();
    }`;
    }
    else if (param.baseType === "VkBool32") {
      let type = param.enumType || param.type;
      return `
  if (!info[${index}].IsBoolean() && !info[${index}].IsNumber()) {
    Napi::TypeError::New(env, "Expected 'Boolean' or 'Number' for argument ${index + 1} '${param.name}' in '${call.name}'").ThrowAsJavaScriptException();
    return env.Undefined();
  }
  ${type} $p${index} = static_cast<${type}>(info[${index}].IsBoolean() ? info[${index}].As<Napi::Boolean>().Value() : info[${index}].As<Napi::Number>().Int32Value());`;
    }
    switch (rawType) {
      case "size_t":
      case "double":
      case "int64_t":
      case "uint64_t": {
        let type = param.enumType || param.type;
        return `
  bool lossless${index};
  if (!info[${index}].IsBigInt() && !info[${index}].IsNumber()) {
    Napi::TypeError::New(env, "Expected 'BigInt' or 'Number' for argument ${index + 1} '${param.name}' in '${call.name}'").ThrowAsJavaScriptException();
    return env.Undefined();
  }
  ${type} $p${index} = 0;
  if (info[${index}].IsBigInt()) {
    $p${index} = static_cast<${type}>(info[${index}].As<Napi::BigInt>().Int64Value(&lossless${index}));
  } else {
    $p${index} = static_cast<${type}>(info[${index}].As<Napi::Number>().Int64Value());
  }`;
      }
      case "int":
      case "float":
      case "int8_t":
      case "int16_t":
      case "int32_t":
      case "uint8_t":
      case "uint16_t":
      case "uint32_t": {
        let type = param.enumType || param.type;
        return `
  if (!info[${index}].IsNumber()) {
    Napi::TypeError::New(env, "Expected 'Number' for argument ${index + 1} '${param.name}' in '${call.name}'").ThrowAsJavaScriptException();
    return env.Undefined();
  }
  ${type} $p${index} = static_cast<${type}>(info[${index}].As<Napi::Number>().Int64Value());`;
      }
      case "const char *":
        return `
  ${param.type}* $p${index} = nullptr;
  if (info[${index}].IsString()) {
    $p${index} = copyV8String(info[${index}]);
  } else if (!info[${index}].IsNull()) {
    Napi::TypeError::New(env, "Expected 'String' or 'null' for argument ${index + 1} '${param.name}' in '${call.name}'").ThrowAsJavaScriptException();
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
      case "const uint32_t * const*":
        if (param.isArray) {
          return getInputArrayBody(call, param, index);
        } else {
          return `
  Napi::Object obj${index};
  ${param.type} $p${index} = 0;
  if (info[${index}].IsObject()) {
    obj${index} = info[${index}].As<Napi::Object>();
    if (!obj${index}.Has("$")) {
      Napi::Error::New(env, "Missing Object property '$' for argument ${index + 1} '${param.name}' in '${call.name}'").ThrowAsJavaScriptException();
      return env.Undefined();
    }
    Napi::Value val = obj${index}.Get("$");
    ${
      param.type === "size_t *" ? `bool lossless; $p${index} = static_cast<${param.type}>(val.As<Napi::BigInt}>().Int64Value(&lossless));` : ``
    }
    ${
      param.type !== "size_t *" ? `$p${index} = static_cast<${param.type}>(val.As<Napi::Number>().Int64Value());` : ``
    }
  } else if (!info[${index}].IsNull()) {
    Napi::TypeError::New(env, "Expected 'Object' or 'null' for argument ${index + 1} '${param.name}' in '${call.name}'").ThrowAsJavaScriptException();
    return env.Undefined();
  }`;
        }
      case "void **":
        return `
  Napi::Object obj${index} = info[${index}].As<Napi::Object>();
  void *$p${index} = nullptr;`;
      default: {
        // array of structs or handles
        if (param.isArray && (param.isStructType || param.isHandleType)) {
          return getInputArrayBody(call, param, index);
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
          if (param.isStructType) {
            let isInvalidStype = "";
            if (!getStructByStructName(ast, param.type).sType) {
              isInvalidStype = `(obj.Get("constructor").As<Napi::Object>().Get("name").As<Napi::String>().Utf8Value()) != "${param.type}"`;
            } else {
              isInvalidStype = `GetStructureTypeFromObject(obj) != ${getAutoStructureType(param.type)}`;
            }
            return `
  Napi::Object obj${index};
  ${param.type} *$p${index} = nullptr;
  if (info[${index}].IsObject()) {
    Napi::Object obj = info[${index}].As<Napi::Object>();
    if (${isInvalidStype}) {
      NapiObjectTypeError(info[${index}], "argument ${index + 1}", "${param.type}");
      return env.Undefined();
    }
    obj${index} = obj;
    Napi::Value flushCall = obj.Get("flush").As<Napi::Function>().Call(obj, {  });
    if (!(flushCall.As<Napi::Boolean>().Value())) return env.Undefined();
    ${param.type}* instance = reinterpret_cast<${param.type}*>(obj.Get("memoryBuffer").As<Napi::ArrayBuffer>().Data());
    $p${index} = instance;
  } else if (info[${index}].IsNull()) {
    $p${index} = ${deinitialize};
  } else {
    Napi::TypeError::New(env, "Expected '${param.type}' or 'null' for argument ${index + 1} '${param.name}' in '${call.name}'").ThrowAsJavaScriptException();
    return env.Undefined();
  }`;
          }
          else if (param.isHandleType) {
            return `
  Napi::Object obj${index};
  ${param.type} *$p${index} = nullptr;
  if (info[${index}].IsObject()) {
    Napi::Object obj = info[${index}].As<Napi::Object>();
    if ((obj.Get("constructor").As<Napi::Object>().Get("name").As<Napi::String>().Utf8Value()) != "${param.type}") {
      NapiObjectTypeError(info[${index}], "argument ${index + 1}", "${param.type}");
      return env.Undefined();
    }
    obj${index} = obj;
    ${param.type}* instance = reinterpret_cast<${param.type}*>(obj.Get("memoryBuffer").As<Napi::ArrayBuffer>().Data());
    $p${index} = instance;
  } else if (info[${index}].IsNull()) {
    $p${index} = ${deinitialize};
  } else {
    Napi::TypeError::New(env, "Expected '${param.type}' or 'null' for argument ${index + 1} '${param.name}' in '${call.name}'").ThrowAsJavaScriptException();
    return env.Undefined();
  }`;
          }
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
    if (param.isWin32HandleReference) {
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
    // array of array of numbers
    else if (
      param.dereferenceCount === 2 &&
      param.isNumericArray
    ) {
      out += `    $p${index} ? $p${index}.get()->data() : nullptr${addComma}`;
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
    else if (
      param.dereferenceCount > 0 &&
      (param.enumType)
    ) out += `    reinterpret_cast<${param.enumRawType}>(&$p${index}${addComma})`;
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
    let {isConstant} = param;
    // array of array of numbers
    if (param.dereferenceCount === 2 && param.isNumericArray) {
      out.push(`
  if (info[${pIndex}].IsArray()) {
    // free data
    for (unsigned int ii = 0; ii < $p${pIndex}.get()->size(); ++ii) {
      delete $p${pIndex}.get()->data()[ii];
    }
  }`);
    }
    else if (param.isString) {
      // no reflection needed
      out.push(`
  if ($p${pIndex}) delete[] $p${pIndex};`);
    }
    if (isConstant) return;
    // array of structs
    if (param.isArray && param.isStructType) {
      let struct = getStructByStructName(ast, param.type);
        out.push(`
  if (info[${pIndex}].IsArray()) {
    ${param.type}* $pdata = $p${pIndex}.get()->data();
    Napi::Array array = info[${pIndex}].As<Napi::Array>();
    for (unsigned int ii = 0; ii < array.Length(); ++ii) {
      Napi::Value item = array.Get(ii);
      Napi::Object obj = item.As<Napi::Object>();
      // reflect call
      Napi::BigInt memoryAddress = Napi::BigInt::New(env, reinterpret_cast<int64_t>(&$pdata[ii]));
      obj.Get("reflect").As<Napi::Function>().Call(obj, { memoryAddress });
    };
  }`);
    }
    // passed in parameter is a struct which gets filled by vulkan
    // and which we need to back-reflect to v8 manually
    else if (param.isStructType && isReference) {
      let struct = getStructByStructName(ast, param.type);
        out.push(`
  if (info[${pIndex}].IsObject()) {
     Napi::Object obj = info[${pIndex}].As<Napi::Object>();
    // reflect call
    Napi::BigInt memoryAddress = Napi::BigInt::New(env, reinterpret_cast<int64_t>($p${pIndex}));
    obj.Get("reflect").As<Napi::Function>().Call(obj, { memoryAddress });
  }`);
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

      // reflect call
      Napi::BigInt memoryAddress = Napi::BigInt::New(env, reinterpret_cast<int64_t>(&$pdata[ii]));
      obj.Get("reflect").As<Napi::Function>().Call(obj, { memoryAddress });
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
    else if (param.isNumber) {
      // no reflection needed
    }
    else if (param.enumType) {
      
    }
    else if (param.isHandleType) {
      // no reflection needed
    }
    else if (param.isWin32Handle) {
      // no reflection needed
    }
    else if (param.isWin32HandleReference) {
      out.push(`
  Napi::BigInt ptr${pIndex} = Napi::BigInt::New(env, (int64_t)$p${pIndex});
  if (info[${pIndex}].IsObject()) obj${pIndex}.Set("$", ptr${pIndex});`);
    }
    else if (param.rawType === "void **") {
      out.push(`
  Napi::BigInt ptr${pIndex} = Napi::BigInt::New(env, (int64_t)$p${pIndex});
  if (info[${pIndex}].IsObject()) obj${pIndex}.Set("$", ptr${pIndex});`);
    }
    else {
      // array of numbers or bools
      switch (param.rawType) {
        case "size_t *":
        case "uint64_t *":
        case "const uint64_t *":
          out.push(`
    Napi::BigInt pnum${pIndex} = Napi::BigInt::New(env, (uint64_t)$p${pIndex});
    if (info[${pIndex}].IsObject()) obj${pIndex}.Set("$", pnum${pIndex});`);
          break;
        case "int *":
        case "int32_t *":
        case "uint32_t *":
        case "const int32_t *":
        case "const uint32_t *":
        case "const float *":
          out.push(`
    if (info[${pIndex}].IsObject()) obj${pIndex}.Set("$", $p${pIndex});`);
          break;
        case "VkBool32 *":
          out.push(`
    if (info[${pIndex}].IsObject()) obj${pIndex}.Set("$", $p${pIndex});`);
          break;
        default:
          warn(`Cannot handle ${param.rawType} in call-body-after!`);
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
      if (index <= -1) warn(`Cannot resolve param index by name "${name}"`);
      return `
  vkUseDevice(*$p${index});`;
    }
    case "vkCreateInstance": {
      let index = getParamIndexByParamName(call, "pInstance");
      if (index <= -1) warn(`Cannot resolve param index by name "${name}"`);
      return `
  if (out == VK_SUCCESS) vkUseInstance(*$p${index});`;
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
static PFN_${call.name} $${call.name} = nullptr;`;
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
