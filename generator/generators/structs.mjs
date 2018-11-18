import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

let ast = null;

const H_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/struct-h.njk`, "utf-8");
const CPP_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/struct-cpp.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

let globalIncludes = [];

function genPersistentV8Array(member) {
  return `
    // js
    if (value->IsArray() || value->IsArrayBufferView()) {
      v8::Handle<v8::Array> arr = v8::Handle<v8::Array>::Cast(value);
      Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> obj(arr);
      self->${member.name} = obj;
    } else {
      if (!self->${member.name}.IsEmpty()) self->${member.name}.Empty();
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
    Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> ${member.name};
    static NAN_GETTER(Get${member.name});`;
    }
  }
  if (member.isArray && (member.isStructType || member.isHandleType)) {
    return `
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
        let isReference = member.dereferenceCount > 0;
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
  // char array
  if (member.type === "char") {
    return `
  Nan::Persistent<v8::String, v8::CopyablePersistentTraits<v8::String>> str(Nan::To<v8::String>(value).ToLocalChecked());
  self->${member.name} = str;
  strcpy(self->instance.${member.name}, copyV8String(value));`;
  }
  // numeric array
  else if (member.isNumericArray) {
    return `
  ${genPersistentV8Array(member)}
  // vulkan
  if (!(value->IsNull())) {
    memcpy(self->instance.${member.name}, createArrayOfV8Numbers<${member.type}>(value), sizeof(${member.type}) * ${member.length});
  } else {
    memset(&self->instance.${member.name}, 0, sizeof(${member.type}));
  }`;
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
    let fn = isReference ? "copyArrayOfV8Objects" : "createArrayOfV8Objects";
    return `
  ${genPersistentV8Array(member)}
  // vulkan
  if (!(value->IsNull())) {
    self->instance.${member.name} = ${fn}<${member.type}, _${member.type}>(value);
  } else {
    self->instance.${member.name} = ${member.isHandleType ? "VK_NULL_HANDLE" : "nullptr"};
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
  self->instance.${member.name} = static_cast<${member.enumType || member.bitmaskType}>(Nan::To<int32_t>(value).FromMaybe(0));`;
      } else {
        return `
  self->instance.${member.name} = static_cast<${rawType}>(Nan::To<int64_t>(value).FromMaybe(0));`;
      }
    case "const char *":
      return `
  if (value->IsString()) {
    Nan::Persistent<v8::String, v8::CopyablePersistentTraits<v8::String>> str(Nan::To<v8::String>(value).ToLocalChecked());
    self->${member.name} = str;
    self->instance.${member.name} = copyV8String(value);
  } else {
    self->instance.${member.name} = nullptr;
  }`;
    case "const char * const*":
      return `
  ${genPersistentV8Array(member)}
  // vulkan
  if (value->IsArray()) {
    self->instance.${member.name} = createArrayOfV8Strings(value);
  } else {
    self->instance.${member.name} = nullptr;
  }`;
    case "float *":
    case "int32_t *":
    case "uint8_t *":
    case "uint32_t *":
    case "uint64_t *":
      return `
  ${genPersistentV8Array(member)}
  ${getTypedV8Array(member)}`;
    case "const float *":
    case "const int32_t *":
    case "const uint32_t *":
    case "const uint64_t *":
      return `
  ${genPersistentV8Array(member)}
  ${getTypedV8Array(member)}`;
    default: {
      if (member.isStructType || member.isHandleType || rawType === "const void *") {
        let isReference = member.dereferenceCount > 0;
        let deinitialize = ``;
        if (rawType === "const void *") {
          return ``; // TODO
          return `
  // js
  if (!(value->IsNull())) {
    Nan::Persistent<v8::Object, v8::CopyablePersistentTraits<v8::Object>> obj(Nan::To<v8::Object>(value).ToLocalChecked());
    self->${member.name} = obj;
  }
  // vulkan
  if (!(value->IsNull())) {
    ${genPolymorphicSourceSetter(struct, member)}
  } else {
    self->instance.${member.name} = nullptr;
  }`;
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
  if (!(value->IsNull())) {
    Nan::Persistent<v8::Object, v8::CopyablePersistentTraits<v8::Object>> obj(Nan::To<v8::Object>(value).ToLocalChecked());
    self->${member.name} = obj;
  } else {
    //self->${member.name} = Nan::Persistent<v8::Object, v8::CopyablePersistentTraits<v8::Object>>(Nan::Null());
  }
  // vulkan
  if (!(value->IsNull())) {
    _${member.type}* obj = Nan::ObjectWrap::Unwrap<_${member.type}>(Nan::To<v8::Object>(value).ToLocalChecked());
    self->instance.${member.name} = ${isReference ? "&" : ""}obj->instance;
  } else {
    ${deinitialize}
  }`;
      }
      console.warn(`Cannot handle member ${member.rawType} in source-setter!`);
      return retUnknown(member);
    } break;
  };
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
    isStructReturnedOnly,
    ignoreableMember,
    processSourceGetter,
    processSourceSetter,
    processHeaderGetter,
    processHeaderSetter,
    processSourceIncludes,
    processMemberAutosType,
    processSourceMemberAccessor
  };
  let out = {
    header: null,
    source: null,
    includes: globalIncludes
  };
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
