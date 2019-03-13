/**

  Generates C++ binding code for vulkan structs

**/
import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

import {
  warn,
  getNodeByName,
  isPNextMember,
  isIgnoreableType,
  getAutoStructureType,
  getNapiTypedArrayName,
  isReferenceableMember,
  isCurrentPlatformSupportedExtension,
  isFlushableMember,
  isArrayMember,
  isArrayOfObjectsMember,
  isHeaderHeapVector,
  isFillableMember
} from "../utils";

let ast = null;
let currentStruct = null;

const H_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/struct-h.njk`, "utf-8");
const CPP_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/struct-cpp.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

let globalIncludes = [];

function invalidMemberTypeError(member) {
  let expected = member.jsType;
  if (isPNextMember(member)) {
    expected = `[object Object]`;
  }
  else if (expected === "undefined") {
    warn(`Cannot handle member ${member.rawType} in member-type-error`);
  // try to give better hints
  } else {
    if (member.isStructType || member.isHandleType) {
      expected = `[object ${member.type}]`;
    }
    else if (member.isTypedArray) {
      expected = member.jsTypedArrayName;
    }
  }
  return `
    NapiObjectTypeError(value, "${currentStruct.name}.${member.name}", "${expected}");
  `;
};

function invalidMemberArrayLengthError(member) {
  return `Napi::RangeError::New(value.Env(), "Invalid array length, expected array length of '${member.length}' for '${currentStruct.name}.${member.name}'").ThrowAsJavaScriptException();`;
};

function genPersistentArray(member) {
  return `
    // js
    if (value.IsArray()) {
      this->${member.name}.Reset(value.ToObject(), 1);
    } else if (value.IsNull()) {
      this->${member.name}.Reset();
      this->instance.${member.name} = nullptr;
    } else {
      ${invalidMemberTypeError(member)}
      return;
    }
  `;
};

function genPersistentTypedArray(member) {
  let expected = member.jsTypedArrayName;
  return `
    // js
    if (value.IsTypedArray()) {
      if (value.As<Napi::TypedArray>().TypedArrayType() == ${getNapiTypedArrayName(member.jsTypedArrayName)}) {
        this->${member.name}.Reset(value.ToObject(), 1);
      } else {
        ${invalidMemberTypeError(member)}
        return;
      }
    } else if (value.IsNull()) {
      this->${member.name}.Reset();
    } else {
      ${invalidMemberTypeError(member)}
      return;
    }
  `;
};

function getTypedV8Array(member) {
  if (member.enumType || member.bitmaskRawType) {
    let type = member.enumRawType || member.bitmaskRawType;
    return `
  // vulkan
  if (value.IsTypedArray()) {
    this->instance.${member.name} = reinterpret_cast<${type}>(getTypedArrayData<${member.type}>(value, nullptr));
  } else {
    this->instance.${member.name} = nullptr;
  }`;
  } else {
    return `
  // vulkan
  if (value.IsTypedArray()) {
    this->instance.${member.name} = getTypedArrayData<${member.type}>(value, nullptr);
  } else {
    this->instance.${member.name} = nullptr;
  }`;
  }
};

function retUnknown(member) {
  //console.log(member);
  return " ";
};

function processDeconstructionSuppressor(member) {
  if (isReferenceableMember(member)) {
    return  `
    this->${member.name}.SuppressDestruct();`;
  }
  return ``;
};

function processHeaderGetter(struct, member) {
  let {rawType} = member;
  if (member.isStaticArray) {
    // string of chars
    if (member.type === "char") {
      return `
    Napi::ObjectReference ${member.name};
    Napi::Value Get${member.name}(const Napi::CallbackInfo &info);`;
    } else {
      return `
    std::vector<${member.type}>* v${member.name};
    Napi::ObjectReference ${member.name};
    Napi::Value Get${member.name}(const Napi::CallbackInfo &info);`;
    }
  }
  if (member.isArray && (member.isStructType || member.isHandleType)) {
    return `
    std::vector<${member.type}>* v${member.name};
    Napi::ObjectReference ${member.name};
    Napi::Value Get${member.name}(const Napi::CallbackInfo &info);`;
  }
  if (member.isStructType || member.isHandleType) {
    if (member.isStructType || member.isHandleType || member.dereferenceCount > 0) {
      return `
    Napi::ObjectReference ${member.name};
    Napi::Value Get${member.name}(const Napi::CallbackInfo &info);`;
    }
  }
  if (isPNextMember(member)) {
    return `
    Napi::ObjectReference ${member.name};
    Napi::Value Get${member.name}(const Napi::CallbackInfo &info);`;
  }
  if (member.isVoidPointer) {
    return `
    Napi::ObjectReference ${member.name};
    Napi::Value Get${member.name}(const Napi::CallbackInfo &info);`;
  }
  if (member.isWin32Handle) {
    return `
    Napi::Value Get${member.name}(const Napi::CallbackInfo &info);`;
  }
  switch (rawType) {
    case "LPCWSTR":
    case "const char *":
      return `
    Napi::ObjectReference ${member.name};
    Napi::Value Get${member.name}(const Napi::CallbackInfo &info);`;
    case "float *":
    case "int32_t *":
    case "uint8_t *":
    case "uint32_t *":
    case "uint64_t *":
      return `
    Napi::ObjectReference ${member.name};
    Napi::Value Get${member.name}(const Napi::CallbackInfo &info);`;
    case "const char * const*":
      return `
    std::vector<char *>* v${member.name};
    Napi::ObjectReference ${member.name};
    Napi::Value Get${member.name}(const Napi::CallbackInfo &info);`;
    case "const float *":
    case "const int32_t *":
    case "const uint8_t *":
    case "const uint32_t *":
    case "const uint64_t *":
      return `
    Napi::ObjectReference ${member.name};
    Napi::Value Get${member.name}(const Napi::CallbackInfo &info);`;
    case "int":
    case "float":
    case "size_t":
    case "int32_t":
    case "uint8_t":
    case "uint16_t":
    case "uint32_t":
    case "uint64_t":
      return `
    Napi::Value Get${member.name}(const Napi::CallbackInfo &info);`;
    default: {
      warn(`Cannot handle member ${member.rawType} for ${struct.name} in header-getter!`);
      return `
    Napi::Value Get${member.name}(const Napi::CallbackInfo &info);`;
    }
  };
};

function processHeaderSetter(struct, member) {
  let {rawType} = member;
  return `
    void Set${member.name}(const Napi::CallbackInfo &info, const Napi::Value& value);`;
};

function processSourceGetter(struct, member) {
  let {rawType} = member;
  if (member.isBaseType) rawType = member.baseType;
  if (member.isBaseType) {
    if (member.rawType === "VkBool32") {
      return `
  return Napi::Boolean::New(env, this->instance.${member.name});`;
    }
  }
  if (member.isStaticArray && member.isString) {
    return `
  if (this->${member.name}.IsEmpty()) return env.Null();
  return this->${member.name}.Value().ToString();`;
  }
  if (member.isStaticArray) {
    return `
  if (this->${member.name}.IsEmpty()) return env.Null();
  return this->${member.name}.Value().As<Napi::Array>();`;
  }
  if (member.isVoidPointer) {
    return `
  if (this->${member.name}.IsEmpty()) return env.Null();
  return this->${member.name}.Value().As<Napi::Object>();`;
  }
  if (member.isArray && (member.isStructType || member.isHandleType)) {
    return `
  if (this->${member.name}.IsEmpty()) return env.Null();
  return this->${member.name}.Value().As<Napi::Array>();`;
  }
  if (member.isWin32Handle) {
    return `
  return Napi::BigInt::New(env, (int64_t)this->instance.${member.name});`;
  }
  switch (rawType) {
    case "int":
    case "float":
    case "size_t":
    case "int32_t":
    case "uint8_t":
    case "uint16_t":
    case "uint32_t":
    case "uint64_t":
      return `
  return Napi::Number::New(env, this->instance.${member.name});`;
    case "LPCWSTR":
      return `
  if (this->${member.name}.IsEmpty()) return env.Null();
  return this->${member.name}.Value().ToString();`;
    case "const char *":
      return `
  if (this->${member.name}.IsEmpty()) return env.Null();
  return this->${member.name}.Value().ToString();`;
    case "float *":
    case "int32_t *":
    case "uint8_t *":
    case "uint32_t *":
    case "uint64_t *":
    case "const char * const*":
    case "const float *":
    case "const int32_t *":
    case "const uint8_t *":
    case "const uint32_t *":
    case "const uint64_t *":
      return `
  if (this->${member.name}.IsEmpty()) return env.Null();
  return this->${member.name}.Value().As<Napi::TypedArray>();`;
    default: {
      if (member.isStructType || member.isHandleType || isPNextMember(member)) {
        return `
  if (this->${member.name}.IsEmpty()) return env.Null();
  return this->${member.name}.Value().As<Napi::Object>();`;
      }
      warn(`Cannot handle member ${member.rawType} for ${struct.name} in source-getter!`);
      return retUnknown(member);
    } break;
  };
};

function processSourceSetter(struct, member) {
  let {rawType} = member;
  if (member.isBaseType) rawType = member.baseType;
  if (member.isStaticArray) {
    if (!member.hasOwnProperty("length")) {
      warn(`Cannot process static array length ${member.length} in static-array source-setter!`);
    }
    return `
    // js
    if (value.IsArray()) {
      this->${member.name}.Reset(value.ToObject(), 1);
    } else if (value.IsNull()) {
      this->${member.name}.Reset();
    } else {
      ${invalidMemberTypeError(member)}
      return;
    }`;
  }
  if (member.isArray && (member.isStructType || member.isHandleType)) {
    // if a struct/handle is constant (never changed by the vulkan itself) and
    // a reference, then we can just create a copy
    let isReference = member.isConstant && member.dereferenceCount > 0;
    return `
  ${genPersistentArray(member)}
  // vulkan
  if (value.IsArray()) {
    
  } else if (value.IsNull()) {
    this->instance.${member.name} = ${member.isHandleType ? "VK_NULL_HANDLE" : "nullptr"};
  } else {
    ${invalidMemberTypeError(member)}
    return;
  }`;
  }
  if (member.isVoidPointer && !isPNextMember(member)) {
    return `
  if (value.IsArrayBuffer()) {
    Napi::ArrayBuffer buffer = value.As<Napi::ArrayBuffer>();
    this->instance.${member.name} = buffer.Data();
    this->${member.name}.Reset(value.As<Napi::Object>(), 1);
  } else if (value.IsNull()) {
    this->instance.${member.name} = nullptr;
  } else {
    ${invalidMemberTypeError(member)}
    return;
  }`;
  }
  if (member.isWin32Handle) {
    return `
  if (value.IsBigInt()) {
    bool lossless = false;
    this->instance.${member.name} = reinterpret_cast<${member.rawType}>(value.As<Napi::BigInt>().Int64Value(&lossless));
  } else {
    ${invalidMemberTypeError(member)}
    return;
  }`;
  }
  switch (rawType) {
    case "int":
    case "float":
    case "size_t":
    case "int32_t":
    case "uint8_t":
    case "uint32_t":
    case "uint64_t":
      if (member.enumType || member.bitmaskRawType) {
        return `
  if (value.IsNumber()) {
    this->instance.${member.name} = static_cast<${member.enumType || member.bitmaskRawType}>(value.As<Napi::Number>().Int32Value());
  } else {
    ${invalidMemberTypeError(member)}
    return;
  }`;
      } else if (member.isBoolean) { 
        return `
  if (value.IsBoolean() || value.IsNumber()) {
    if (value.IsBoolean()) {
      this->instance.${member.name} = static_cast<${rawType}>(value.As<Napi::Boolean>().Value()) ? VK_TRUE : VK_FALSE;
    } else {
      this->instance.${member.name} = static_cast<${rawType}>(value.As<Napi::Number>().Int32Value()) > 0 ? VK_TRUE : VK_FALSE;
    }
  } else {
    ${invalidMemberTypeError(member)}
    return;
  }`;
      } else if (member.isNumber) {
        return `
  if (value.IsNumber()) {
    this->instance.${member.name} = static_cast<${rawType}>(value.As<Napi::Number>().Int64Value());
  } else {
    ${invalidMemberTypeError(member)}
    return;
  }`;
      } else {
        warn(`Cannot handle member ${member.rawType} for ${struct.name} in source-setter`);
      }
    case "LPCWSTR":
      return `
  if (value.IsString()) {
    this->${member.name}.Reset(value.ToObject(), 1);
    // free previous
    if (this->instance.${member.name}) delete[] this->instance.${member.name};
    this->instance.${member.name} = static_cast<${rawType}>(s2wcs(value.ToString().Utf8Value()));
  } else if (value.IsNull()) {
    this->instance.${member.name} = nullptr;
  } else {
    ${invalidMemberTypeError(member)}
    return;
  }`;
    case "const char *":
      return `
  if (value.IsString()) {
    this->${member.name}.Reset(value.ToObject(), 1);
    // free previous
    if (this->instance.${member.name}) delete[] this->instance.${member.name};
    this->instance.${member.name} = copyV8String(value);
  } else if (value.IsNull()) {
    this->instance.${member.name} = nullptr;
  } else {
    ${invalidMemberTypeError(member)}
    return;
  }`;
    // array of strings
    case "const char * const*":
      return `
  ${genPersistentArray(member)}`;
    case "float *":
    case "int32_t *":
    case "uint8_t *":
    case "uint32_t *":
    case "uint64_t *":
    case "const float *":
    case "const uint8_t *":
    case "const int32_t *":
    case "const uint32_t *":
    case "const uint64_t *":
      return `
  ${genPersistentTypedArray(member)}
  ${getTypedV8Array(member)}`;
    default: {
      let isReference = member.dereferenceCount > 0;
      // initialization
      let initialize = `
      this->${member.name}.Reset(value.ToObject(), 1);
      _${member.type}* inst = Napi::ObjectWrap<_${member.type}>::Unwrap(obj);
      ${member.isStructType ? `inst->flush()` : ``};
      this->instance.${member.name} = ${isReference ? "&" : ""}inst->instance;`;
      // condition to perform initialization
      let validObjectCondition = `obj.InstanceOf(_${member.type}::constructor.Value())`;
      if (member.isStructType || member.isHandleType || isPNextMember(member)) {
        let deinitialize = ``;
        if (isPNextMember(member)) {
          let {extensions} = struct;
          validObjectCondition = `IsValidStructureObject(obj)`;
          initialize = `
      this->${member.name}.Reset(obj, 1);
      this->instance.${member.name} = (${member.rawType}) DynamicObjectUnwrapInstance(obj);
      VkStructureType sType = static_cast<VkStructureType>(((int*)(this->instance.${member.name}))[0]);`;
          if (extensions) {
            initialize += `
      if (`;
            extensions.map((extensionName, index) => {
              let ifAnd = index < extensions.length - 1 ? `&&` : ``;
              let structExt = getNodeByName(extensionName, ast);
              if (!structExt || !structExt.sType) {
                warn(`Cannot resolve struct by extension name '${extensionName}'`);
              }
              initialize += `
        sType != ${structExt.sType} ${ifAnd}`;
            });
            initialize += `
      ) {
        Napi::TypeError::New(env, "Invalid type for '${struct.name}.${member.name}'").ThrowAsJavaScriptException();
      }`;
          } else {
            initialize += `
      Napi::TypeError::New(env, "'${struct.name}.${member.name}' must be 'null'").ThrowAsJavaScriptException();`;
          }
        }
        if (member.isHandleType) {
          deinitialize = `this->instance.${member.name} = VK_NULL_HANDLE;`;
        }
        else if (isReference || isPNextMember(member)) {
          deinitialize = `this->instance.${member.name} = nullptr;`;
        }
        else {
          deinitialize = `memset(&this->instance.${member.name}, 0, sizeof(${member.type}));`;
        }
        return `
  // js
  if (!value.IsNull()) {
    Napi::Object obj = value.As<Napi::Object>();
    if (${validObjectCondition}) {
      ${initialize}
    } else {
      ${invalidMemberTypeError(member)}
      return;
    }
  } else if (value.IsNull()) {
    this->${member.name}.Reset();
    ${deinitialize}
  } else {
    ${invalidMemberTypeError(member)}
    return;
  }`;
      }
      warn(`Cannot handle member ${member.rawType} for ${struct.name} in source-setter!`);
      return retUnknown(member);
    } break;
  };
};

function processFlushSourceSetter(struct, member) {
  if (struct.returnedonly) return ``;
  if (isPNextMember(member)) {
    let {extensions} = struct;
    if (!extensions) return ``;
    let out = `
    Napi::Object obj = value.As<Napi::Object>();
    VkStructureType sType = GetStructureTypeFromObject(obj);`;
    let index = 0;
    extensions.map((extensionName) => {
      let structExt = getNodeByName(extensionName, ast);
      if (!structExt || !structExt.sType) warn(`Cannot resolve struct by extension name '${extensionName}'`);
      if (structExt.extension && !isCurrentPlatformSupportedExtension(structExt.extension.platform)) return;
      out += `
    ${index <= 0 ? "if" : "else if"} (sType == ${structExt.sType}) {
      _${structExt.name}* structExt = Napi::ObjectWrap<_${structExt.name}>::Unwrap(obj);
      if (!structExt->flush()) return false;
    }
      `;
      index++;
    });
    return out;
  }
  if (member.isStaticArray && member.isNumericArray) {
    return `
    if (value.IsArray()) {
      // validate length
      if (value.As<Napi::Array>().Length() != ${member.length}) {
        ${invalidMemberArrayLengthError(member)}
        return false;
      }
      std::vector<${member.type}> array = createArrayOfV8Numbers<${member.type}>(value);
      memcpy(this->instance.${member.name}, array.data(), sizeof(${member.type}) * ${member.length});
    } else if (value.IsNull()) {
      memset(&this->instance.${member.name}, 0, sizeof(${member.type}));
    } else {
      ${invalidMemberTypeError(member)}
      return false;
    }`;
  }
  if (member.isStaticArray && (member.isStructType)) {
    return `
    if (value.IsArray()) {
      Napi::Array array = value.As<Napi::Array>();
      // validate length
      if (array.Length() != ${member.length}) {
        ${invalidMemberArrayLengthError(member)}
        return false;
      }
      std::vector<${member.type}>* data = this->v${member.name};
      data->clear();
      for (unsigned int ii = 0; ii < array.Length(); ++ii) {
        Napi::Object obj = array.Get(ii).As<Napi::Object>();
        if (!(obj.InstanceOf(_${member.type}::constructor.Value()))) {
          ${invalidMemberTypeError(member)}
          return false;
        }
        _${member.type}* result = Napi::ObjectWrap<_${member.type}>::Unwrap(obj);
        if (!result->flush()) return false;
        data->push_back(result->instance);
      };
      memcpy(this->instance.${member.name}, data->data(), sizeof(${member.type}) * ${member.length});
    } else if (value.IsNull()) {
      memset(&this->instance.${member.name}, 0, sizeof(${member.type}));
    } else {
      ${invalidMemberTypeError(member)}
      return false;
    }`;
  }
  if (member.isArray && (member.isStructType || member.isHandleType)) {
    let isReference = member.isConstant && member.dereferenceCount > 0;
    let flusher = member.isStructType ? `if (!result->flush()) return false;` : ``;
      return `
    Napi::Array array = value.As<Napi::Array>();
    // validate length
    if (array.Length() != this->instance.${member.length}) {
      ${invalidMemberArrayLengthError(member)}
      return false;
    }
    std::vector<${member.type}>* data = this->v${member.name};
    data->clear();
    for (unsigned int ii = 0; ii < array.Length(); ++ii) {
      Napi::Object obj = array.Get(ii).As<Napi::Object>();
      if (!(obj.InstanceOf(_${member.type}::constructor.Value()))) {
        ${invalidMemberTypeError(member)}
        return false;
      }
      _${member.type}* result = Napi::ObjectWrap<_${member.type}>::Unwrap(obj);
      ${ flusher }
      data->push_back(result->instance);
    };
    self->instance.${member.name} = data->data();`;
  }
  if (member.isStructType && member.dereferenceCount <= 0 && !member.isConstant) {
    return `
    _${member.type}* result = Napi::ObjectWrap<_${member.type}>::Unwrap(value.As<Napi::Object>());
    if (!result->flush()) return false;
    self->instance.${member.name} = result->instance;`;
  }
  if (member.rawType === "const char * const*") {
    return `
    std::vector<char*>* data = self->v${member.name};
    data->clear();
    Napi::Array array = value.As<Napi::Array>();
    for (unsigned int ii = 0; ii < array.Length(); ++ii) {
      Napi::Value item = array.Get(ii);
      if (!item.IsString()) return false;
      char *copy = copyV8String(item);
      data->push_back(copy);
    };
    self->instance.${member.name} = data->data();`;
  }
  warn(`Cannot process ${struct.name}.${member.name} in flush source-setter!`);
  return ``;
};

function processSourceIncludes(struct) {
  let out = ``;
  let includes = [];
  // TODO
  /*if (struct.extensions) {
    struct.extensions.map(ext => {
      globalIncludes.push({
        name: struct.name,
        include: ext
      });
    });
  }*/
  struct.children.map(child => {
    if (child.isStructType) {
      // dont do cyclic includes
      // this happens when a struct can have a member of its own type
      if (struct.name !== child.type) {
        globalIncludes.push({
          name: struct.name,
          include: child.type
        });
      }
    }
    if (child.isStaticArray && includes.indexOf("string.h") <= -1) {
      out += `\n#include <string.h>`;
      includes.push("string.h");
    }
  });
  out += `\n#include "index.h"`;
  return out;
};

function getHeaderHeapVectorType(member) {
  if (isArrayOfObjectsMember(member)) return member.type;
  else if (member.rawType === "const char * const*") return `char*`;
  else warn(`Cannot process ${member.type} in heap-vector-initializer!`);
  return null;
};

function processHeapVectorAllocator(member) {
  let type = getHeaderHeapVectorType(member);
  return `v${ member.name } = new std::vector<${ type }>;`;
};

function processPersistentDeallocator(member) {
  let out = ``;
  if (isReferenceableMember(member)) {
    out += `
  ${member.name}.Reset();`;
  }
  return out;
};

function processHeapVectorDeallocator(member) {
  let out = ``;
  let type = getHeaderHeapVectorType(member);
  if (member.rawType === "const char * const*") {
    out += `
  for (unsigned int ii = 0; ii < v${ member.name }->size(); ++ii) {
    delete ((char*) v${ member.name }->at(ii));
  };`;
  }
  out += `
  v${ member.name }->clear();
  delete v${ member.name };`;
  return out;
};

function processSourceMemberAccessor(struct, member) {
  let {name} = member;
  if (isFillableMember(struct, member)) {
    return `
  InstanceAccessor(
    "${name}",
    &_${struct.name}::Get${name},
    &_${struct.name}::Set${name},
    napi_enumerable
  ),`;
  } else {
    return `
  InstanceAccessor(
    "${name}",
    &_${struct.name}::Get${name},
    nullptr,
    napi_enumerable
  ),`;
  }
};

function getMemberIndexByName(struct, name) {
  for (let ii = 0; ii < struct.children.length; ++ii) {
    let child = struct.children[ii];
    if (child.name === name) return ii;
  };
  warn(`Failed to resolve member by name ${name}`);
  return null;
};

function processMemberAutosType(struct) {
  let sType = null;
  // these two are to iterate over given sType structs, ignore them
  if (struct.name === `VkBaseInStructure` || struct.name === `VkBaseOutStructure`) {
    return ``;
  }
  let filtered = struct.children.filter(member => member.name === "sType");
  let sTypeMember = null;
  if (filtered.length) sTypeMember = filtered[0];
  if (sTypeMember) sType = struct.sType || getAutoStructureType(struct.name);
  if (sType) return `instance.sType = ${sType};`;
  return ``;
};

export default function(astReference, struct) {
  ast = astReference;
  let {
    name,
    children
  } = struct;
  let vars = {
    struct,
    struct_name: name,
    members: children,
    isArrayMember,
    isArrayOfObjectsMember,
    isFlushableMember,
    isHeaderHeapVector,
    isIgnoreableType,
    isFillableMember,
    processSourceGetter,
    processSourceSetter,
    processHeaderGetter,
    processHeaderSetter,
    processSourceIncludes,
    processMemberAutosType,
    processFlushSourceSetter,
    processSourceMemberAccessor,
    processHeapVectorAllocator,
    processHeapVectorDeallocator,
    processPersistentDeallocator,
    processDeconstructionSuppressor
  };
  let out = {
    header: null,
    source: null,
    includes: globalIncludes
  };
  currentStruct = struct;
  // h
  {
    let template = H_TEMPLATE;
    let output = nunjucks.renderString(template, vars);
    out.header = output;
  }
  // cpp
  {
    let template = CPP_TEMPLATE;
    let output = nunjucks.renderString(template, vars);
    out.source = output;
  }
  return out;
};
