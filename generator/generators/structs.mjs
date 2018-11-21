import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

let ast = null;
let currentStruct = null;

const H_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/struct-h.njk`, "utf-8");
const CPP_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/struct-cpp.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

let globalIncludes = [];

function invalidMemberTypeError(member) {
  let expected = member.jsType;
  if (expected === "undefined") {
    console.warn(`Cannot handle member ${member.rawType} in member-type-error`);
  // try to give better hints
  } else {
    if (member.isStructType || member.isHandleType) {
      expected = `Object [${member.type}]`;
    }
    else if (member.isTypedArray) {
      expected = member.jsTypedArrayName;
    }
  }
  return `Nan::ThrowTypeError("Expected '${expected}' for '${currentStruct.name}.${member.name}'");`;
};

function invalidMemberArrayLengthError(member) {
  return `Nan::ThrowRangeError("Invalid array length, expected array length of '${member.length}' for '${currentStruct.name}.${member.name}'");`;
};

function genPersistentV8Array(member) {
  return `
    // js
    if (value->IsArray()) {
      self->${member.name}.Reset<v8::Array>(value.As<v8::Array>());
    } else if (value->IsNull()) {
      self->${member.name}.Reset();
      self->instance.${member.name} = nullptr;
    } else {
      return ${invalidMemberTypeError(member)}
    }
  `;
};

function genPersistentV8TypedArray(member) {
  let expected = member.jsTypedArrayName;
  return `
    // js
    if (value->IsArrayBufferView()) {
      if (value->Is${member.jsTypedArrayName}()) {
        self->${member.name}.Reset<v8::Array>(value.As<v8::Array>());
      } else {
        return ${invalidMemberTypeError(member)}
      }
    } else if (value->IsNull()) {
      self->${member.name}.Reset();
    } else {
      return ${invalidMemberTypeError(member)}
    }
  `;
};

function getTypedV8Array(member) {
  if (member.enumType || member.bitmaskType) {
    let type = member.enumRawType || member.bitmaskRawType;
    return `
  // vulkan
  if (value->IsArrayBufferView()) {
    self->instance.${member.name} = reinterpret_cast<${type}>(getTypedArrayData<${member.type}>(Nan::To<v8::Object>(value).ToLocalChecked(), nullptr));
  } else {
    self->instance.${member.name} = nullptr;
  }`;
  } else {
    return `
  // vulkan
  if (value->IsArrayBufferView()) {
    self->instance.${member.name} = getTypedArrayData<${member.type}>(Nan::To<v8::Object>(value).ToLocalChecked(), nullptr);
  } else {
    self->instance.${member.name} = nullptr;
  }`;
  }
};

function retUnknown(member) {
  //console.log(member);
  return " ";
};

function processHeaderGetter(struct, member) {
  let {rawType} = member;
  if (member.isBaseType) rawType = member.baseType;
  if (member.isStaticArray) {
    // string of chars
    if (member.type === "char") {
      return `
    Nan::Persistent<v8::String, v8::CopyablePersistentTraits<v8::String>> ${member.name};
    static NAN_GETTER(Get${member.name});`;
    } else {
      return `
    std::vector<${member.type}>* v${member.name};
    Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> ${member.name};
    static NAN_GETTER(Get${member.name});`;
    }
  }
  if (member.isArray && (member.isStructType || member.isHandleType)) {
    return `
    std::vector<${member.type}>* v${member.name};
    Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> ${member.name};
    static NAN_GETTER(Get${member.name});`;
  }
  if (
    member.isStructType ||
    member.isHandleType ||
    member.isBaseType
  ) {
    if (member.isStructType || member.isHandleType || member.dereferenceCount > 0) {
      return `
      Nan::Persistent<v8::Object, v8::CopyablePersistentTraits<v8::Object>> ${member.name};
      static NAN_GETTER(Get${member.name});`;
    } else {
      return `
      static NAN_GETTER(Get${member.name});`;
    }
  }
  switch (rawType) {
    case "const void *":
      return `
    Nan::Persistent<v8::Object, v8::CopyablePersistentTraits<v8::Object>> ${member.name};
    static NAN_GETTER(Get${member.name});`;
    case "const char *":
      return `
    Nan::Persistent<v8::String, v8::CopyablePersistentTraits<v8::String>> ${member.name};
    static NAN_GETTER(Get${member.name});`;
    case "float *":
    case "int32_t *":
    case "uint8_t *":
    case "uint32_t *":
    case "uint64_t *":
      return `
    Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> ${member.name};
    static NAN_GETTER(Get${member.name});`;
    case "const char * const*":
      return `
    std::vector<char *>* v${member.name};
    Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> ${member.name};
    static NAN_GETTER(Get${member.name});`;
    case "const float *":
    case "const int32_t *":
    case "const uint8_t *":
    case "const uint32_t *":
    case "const uint64_t *":
      return `
    Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> ${member.name};
    static NAN_GETTER(Get${member.name});`;
    case "int":
    case "float":
    case "size_t":
    case "int32_t":
    case "uint8_t":
    case "uint32_t":
    case "uint64_t":
      return `
    static NAN_GETTER(Get${member.name});`;
    default: {
      console.warn(`Cannot handle member ${member.rawType} in header-getter!`);
      return `
    static NAN_GETTER(Get${member.name});`;
    }
  };
};

function processHeaderSetter(struct, member) {
  let {rawType} = member;
  return `
    static NAN_SETTER(Set${member.name});`;
};

function processSourceGetter(struct, member) {
  let {rawType} = member;
  if (member.isBaseType) rawType = member.baseType;
  if (member.isBaseType) {
    if (member.rawType === "VkBool32") {
      return `
  info.GetReturnValue().Set(Nan::New<v8::Boolean>(self->instance.${member.name}));`;
    }
  }
  if (member.isStaticArray) {
    return `
  if (self->${member.name}.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    info.GetReturnValue().Set(Nan::New(self->${member.name}));
  }`;
  }
  if (member.isArray && (member.isStructType || member.isHandleType)) {
    return `
  if (self->${member.name}.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::Object> obj = Nan::New(self->${member.name});
    info.GetReturnValue().Set(obj);
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
      return `
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.${member.name}));`;
    case "const char *":
      return `
  if (self->${member.name}.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::String> str = Nan::New(self->${member.name});
    info.GetReturnValue().Set(str);
  }`;
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
  if (self->${member.name}.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::Object> obj = Nan::New(self->${member.name});
    info.GetReturnValue().Set(obj);
  }`;
    default: {
      if (member.isStructType || member.isHandleType || rawType === "const void *") {
        if (rawType === "const void *") return ``; // TODO
        return `
  if (self->${member.name}.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::Object> obj = Nan::New(self->${member.name});
    info.GetReturnValue().Set(obj);
  }`;
      }
      console.warn(`Cannot handle member ${member.rawType} in source-getter!`);
      return retUnknown(member);
    } break;
  };
};

function processStaticArraySourceSetter(member) {
  // numeric array
  if (member.isNumericArray) {
    if (!member.hasOwnProperty("length")) {
      console.warn(`Cannot process static array length ${member.length} in source-setter`);
    }
    return `
    // js
    if (value->IsArray()) {
      self->${member.name}.Reset<v8::Array>(value.As<v8::Array>());
    } else if (value->IsNull()) {
      self->${member.name}.Reset();
    } else {
      return ${invalidMemberTypeError(member)}
    }
  `;
  }
  // struct array
};

function genPolymorphicSourceSetter(struct, member) {
  let out = ``;
  let {extensions} = struct;
  if (extensions) {
    out += `
    v8::Local<v8::Object> arg = Nan::To<v8::Object>(value).ToLocalChecked();
    v8::String::Utf8Value ctorUtf8(arg->GetConstructorName());
    const char* ctor = *ctorUtf8;
    `;
    extensions.map((extName, index) => {
      out += `${index <= 0 ? "if" : " else if"} (ctor == "${extName}") {
      _${extName}* obj = Nan::ObjectWrap::Unwrap<_${extName}>(Nan::To<v8::Object>(value).ToLocalChecked());
      self->instance.${member.name} = &obj->instance;
    }`;
    });
  } else {
    out += `self->instance.${member.name} = nullptr;`;
  }
  return out;
};

function processSourceSetter(struct, member) {
  let {rawType} = member;
  if (member.isBaseType) rawType = member.baseType;
  if (member.isStaticArray) {
    return processStaticArraySourceSetter(member);
  }
  if (member.isArray && (member.isStructType || member.isHandleType)) {
    // if a struct/handle is constant (never changed by the vulkan itself) and
    // a reference, then we can just create a copy
    let isReference = member.isConstant && member.dereferenceCount > 0;
    return `
  ${genPersistentV8Array(member)}
  // vulkan
  if (value->IsArray()) {
    
  } else if (value->IsNull()) {
    self->instance.${member.name} = ${member.isHandleType ? "VK_NULL_HANDLE" : "nullptr"};
  } else {
    return ${invalidMemberTypeError(member)}
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
      if (member.enumType || member.bitmaskType) {
        return `
  if (value->IsNumber()) {
    self->instance.${member.name} = static_cast<${member.enumType || member.bitmaskType}>(Nan::To<int32_t>(value).FromMaybe(0));
  } else {
    return ${invalidMemberTypeError(member)}
  }`;
      } else if (member.isBoolean) { 
        return `
  if (value->IsBoolean() || value->IsNumber()) {
    self->instance.${member.name} = static_cast<${rawType}>(Nan::To<bool>(value).FromMaybe(false)) ? VK_TRUE : VK_FALSE;
  } else {
    return ${invalidMemberTypeError(member)}
  }`;
      } else if (member.isNumber) {
        return `
  if (value->IsNumber()) {
    self->instance.${member.name} = static_cast<${rawType}>(Nan::To<int64_t>(value).FromMaybe(0));
  } else {
    return ${invalidMemberTypeError(member)}
  }`;
      } else {
        console.warn(`Cannot handle member ${member.rawType} in source-setter`);
      }
    case "const char *":
      return `
  if (value->IsString()) {
    Nan::Persistent<v8::String, v8::CopyablePersistentTraits<v8::String>> str(Nan::To<v8::String>(value).ToLocalChecked());
    self->${member.name} = str;
    // free previous
    if (self->instance.${member.name}) {
      delete[] self->instance.${member.name};
    }
    self->instance.${member.name} = copyV8String(value);
  } else if (value->IsNull()) {
    self->instance.${member.name} = nullptr;
  } else {
    return ${invalidMemberTypeError(member)}
  }`;
    // array of strings
    case "const char * const*":
      return `
  ${genPersistentV8Array(member)}`;
    case "float *":
    case "int32_t *":
    case "uint8_t *":
    case "uint32_t *":
    case "uint64_t *":
      return `
  ${genPersistentV8TypedArray(member)}
  ${getTypedV8Array(member)}`;
    case "const float *":
    case "const int32_t *":
    case "const uint32_t *":
    case "const uint64_t *":
      return `
  ${genPersistentV8TypedArray(member)}
  ${getTypedV8Array(member)}`;
    default: {
      if (member.isStructType || member.isHandleType || rawType === "const void *") {
        let isReference = member.dereferenceCount > 0;
        let deinitialize = ``;
        if (rawType === "const void *") {
          return ``; // TODO
        }
        if (member.isHandleType) {
          deinitialize = `self->instance.${member.name} = VK_NULL_HANDLE;`;
        }
        else if (isReference) {
          deinitialize = `self->instance.${member.name} = nullptr;`;
        }
        else {
          deinitialize = `memset(&self->instance.${member.name}, 0, sizeof(${member.type}));`;
        }
        return `
  // js
  if (!value->IsNull()) {
    v8::Local<v8::Object> obj = Nan::To<v8::Object>(value).ToLocalChecked();
    if (Nan::New(_${member.type}::constructor)->HasInstance(obj)) {
      self->${member.name}.Reset<v8::Object>(value.As<v8::Object>());
      _${member.type}* inst = Nan::ObjectWrap::Unwrap<_${member.type}>(obj);
      ${member.isStructType ? `inst->flush()` : ``};
      self->instance.${member.name} = ${isReference ? "&" : ""}inst->instance;
    } else {
      return ${invalidMemberTypeError(member)}
    }
  } else if (value->IsNull()) {
    self->${member.name}.Reset();
    ${deinitialize}
  } else {
    return ${invalidMemberTypeError(member)}
  }`;
      }
      console.warn(`Cannot handle member ${member.rawType} in source-setter!`);
      return retUnknown(member);
    } break;
  };
};

function processFlushSourceSetter(struct, member) {
  if (struct.returnedonly) return ``;
  if (member.isNumericArray && member.isStaticArray) {
    return `
    if (value->IsArray()) {
      // validate length
      if (v8::Local<v8::Array>::Cast(value)->Length() != ${member.length}) {
        ${invalidMemberArrayLengthError(member)}
        return false;
      }
      std::vector<${member.type}> arr = createArrayOfV8Numbers<${member.type}>(value);
      memcpy(self->instance.${member.name}, arr.data(), sizeof(${member.type}) * ${member.length});
    } else if (value->IsNull()) {
      memset(&self->instance.${member.name}, 0, sizeof(${member.type}));
    } else {
      ${invalidMemberTypeError(member)}
      return false;
    }`;
  }
  else if (member.isArray && !member.isStaticArray && (member.isStructType || member.isHandleType)) {
    let isReference = member.isConstant && member.dereferenceCount > 0;
    let flusher = member.isStructType ? `if (!result->flush()) return false;` : ``;
      return `
    v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(value);
    // validate length
    if (array->Length() != self->instance.${member.length}) {
      ${invalidMemberArrayLengthError(member)}
      return false;
    }
    std::vector<${member.type}>* data = self->v${member.name};
    data->clear();
    for (unsigned int ii = 0; ii < array->Length(); ++ii) {
      v8::Local<v8::Object> obj = Nan::To<v8::Object>(Nan::Get(array, ii).ToLocalChecked()).ToLocalChecked();
      if (!(Nan::New(_${member.type}::constructor)->HasInstance(obj))) {
        ${invalidMemberTypeError(member)}
        return false;
      }
      _${member.type}* result = Nan::ObjectWrap::Unwrap<_${member.type}>(obj);
      ${ flusher }
      data->push_back(result->instance);
    };
    self->instance.${member.name} = data->data();`;
  }
  else if (member.isStructType && member.dereferenceCount <= 0 && !member.isConstant) {
    return `
    _${member.type}* result = Nan::ObjectWrap::Unwrap<_${member.type}>(Nan::To<v8::Object>(value).ToLocalChecked());
    if (!result->flush()) return false;
    self->instance.${member.name} = result->instance;`;
  }
  else if (member.rawType === "const char * const*") {
    return `
    std::vector<char*>* data = self->v${member.name};
    data->clear();
    v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(value);
    for (unsigned int ii = 0; ii < array->Length(); ++ii) {
      v8::Local<v8::Value> item = Nan::Get(array, ii).ToLocalChecked();
      if (!item->IsString()) return false;
      char *copy = copyV8String(item);
      data->push_back(copy);
    };
    self->instance.${member.name} = data->data();`;
  }
  else {
    console.warn(`Cannot process ${struct.name}.${member.name} in flush source-setter!`);
  }
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

function isFlushableMember(member) {
  if (member.isStructType && member.dereferenceCount <= 0 && !member.isConstant) return true;
  return isHeaderHeapVector(member);
};

function isArrayMember(member) {
  return (
    member.isArray ||
    member.isDynamicArray ||
    member.isNumericArray ||
    member.isTypedArray
  );
};

function isArrayOfObjectsMember(member) {
  return (
    (member.isArray) &&
    (member.isStructType || member.isHandleType) ||
    (member.isStaticArray && member.isNumericArray)
  );
};

function isHeaderHeapVector(member) {
  return (
    isArrayOfObjectsMember(member) ||
    member.rawType === "const char * const*"
  );
};

function processHeaderHeapVectorInitializer(member) {
  let type = null;
  if (isArrayOfObjectsMember(member)) {
    type = member.type;
  }
  else if (member.rawType === "const char * const*") {
    type = `char*`;
  }
  else {
    console.warn(`Cannot process ${member.type} in heap-vector-initializer!`);
  }
  return `v${ member.name } = new std::vector<${ type }>;`;
};

function processFlushMemberSetter(struct, member) {
  if (struct.returnedonly) return ``;
  let index = getMemberIndexByName(struct, member.name);
  let out = `
  v8::Local<v8::String> sAccess${index} = Nan::New("${member.name}").ToLocalChecked();
  info.This()->Set(sAccess${index}, info.This()->Get(sAccess${index}));`;
  let {rawType} = member;
  if (rawType === "const void *") return ``;
  if (member.isTypedArray) return ``;
  if (member.isBaseType) rawType = member.baseType;
  if (member.isStaticArray && member.type !== "char") return out;
  if (member.isArray && (member.isStructType || member.isHandleType)) return out;
  if (member.isStructType || member.isHandleType || member.isBaseType || member.dereferenceCount > 0) return out;
  switch (rawType) {
    case "float *":
    case "int32_t *":
    case "uint8_t *":
    case "uint32_t *":
    case "uint64_t *":
    case "const float *":
    case "const int32_t *":
    case "const uint8_t *":
    case "const uint32_t *":
    case "const uint64_t *":
      return out;
    case "int":
    case "float":
    case "size_t":
    case "int32_t":
    case "uint8_t":
    case "uint32_t":
    case "uint64_t":
    case "const char *":
    case "const char * const*":
      return ``;
    default:
      console.warn(`Cannot handle member ${member.rawType} in flush-member!`);
  };
  return ``;
};

function processSourceMemberAccessor(struct, member) {
  let {name} = member;
  if (isStructReturnedOnly(struct)) {
    return `
  SetPrototypeAccessor(proto, Nan::New("${name}").ToLocalChecked(), Get${name}, nullptr, ctor);`;
  } else {
    return `
  SetPrototypeAccessor(proto, Nan::New("${name}").ToLocalChecked(), Get${name}, Set${name}, ctor);`;
  }
};

function getMemberIndexByName(struct, name) {
  for (let ii = 0; ii < struct.children.length; ++ii) {
    let child = struct.children[ii];
    if (child.name === name) return ii;
  };
  console.warn(`Failed to resolve member by name ${name}`);
  return null;
};

function processMemberAutosType(struct) {
  let sType = null;
  let filtered = struct.children.filter(member => member.name === "sType");
  let sTypeMember = null;
  if (filtered.length) sTypeMember = filtered[0];
  if (sTypeMember) sType = struct.sType || structNameToStructType(struct.name);
  if (sType) return `instance.sType = ${sType};`;
  return ``;
};

// shouldnt be necessary, but this method
// auto-generates the sType name by a struct name
function structNameToStructType(name) {
  let out = ``;
  let rx = /(([A-Z][a-z]+)|([A-Z][A-Z]+))/gm;
  let values = [];
  let match = null;
  while ((match = rx.exec(name)) !== null) {
    if (match[0] === `Vk`) out += `VK_STRUCTURE_TYPE_`;
    else {
      values.push(match[0].toUpperCase());
    }
  };
  out += values.join(`_`);
  return out;
};

function ignoreableMember(member) {
  // dont ignore
  if (member.rawType === "const void *" && member.name === "pNext") return false;
  // ignore just for now
  if (member.rawType.substr(0, 4) === "PFN_") return true;
  return (
    member.rawType === "const SECURITY_ATTRIBUTES *" ||
    member.rawType === "struct AHardwareBuffer *" ||
    member.rawType === "void *" ||
    member.rawType === "struct ANativeWindow *" ||
    member.rawType === "MirSurface *" ||
    member.rawType === "MirConnection *" ||
    member.rawType === "struct wl_display *" ||
    member.rawType === "struct wl_surface *" ||
    member.rawType === "Window" ||
    member.rawType === "xcb_connection_t *" ||
    member.rawType === "xcb_window_t" ||
    member.rawType === "Display *" ||
    member.rawType === "HWND" ||
    member.rawType === "HANDLE" ||
    member.rawType === "DWORD" ||
    member.rawType === "LPCWSTR" ||
    member.rawType === "HINSTANCE"
  );
};

function isStructReturnedOnly(struct) {
  return struct.returnedonly;
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
    isStructReturnedOnly,
    ignoreableMember,
    processSourceGetter,
    processSourceSetter,
    processHeaderGetter,
    processHeaderSetter,
    processSourceIncludes,
    processMemberAutosType,
    processFlushMemberSetter,
    processFlushSourceSetter,
    processSourceMemberAccessor,
    processHeaderHeapVectorInitializer
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
