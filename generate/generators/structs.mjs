import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

const H_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/struct-h.njk`, "utf-8");
const CPP_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/struct-cpp.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

let globalIncludes = [];

function genPersistentV8Array(member) {
  return `
    // js
    {
      v8::Handle<v8::Array> arr = v8::Handle<v8::Array>::Cast(value);
      Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> obj(arr);
      self->${member.name} = obj;
    }
  `;
};

function retUnknown(member) {
  //console.log(member);
  return " ";
};

function processHeaderGetter(member) {
  let {rawType} = member;
  if (member.name === "flags") return "";
  if (
    member.isEnumType
  ) {
    return `
    static NAN_GETTER(Get${member.name});`;
  }
  if (member.isArray && (member.isStructType || member.isHandleType)) {
    return `
    Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> ${member.name};
    static NAN_GETTER(Get${member.name});`;
  }
  if (member.isArray && member.isStaticArray) {
    return `
    Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> ${member.name};
    static NAN_GETTER(Get${member.name});`;
  }
  if (
    member.isStructType ||
    member.isHandleType ||
    member.isBitmaskType ||
    member.isBaseType ||
    rawType === "float"
  ) {
    if (member.isStructType || member.isHandleType || member.dereferenceCount > 0) {
      return `
      _${member.type} *${member.name};
      static NAN_GETTER(Get${member.name});`;
    } else {
      return `
      static NAN_GETTER(Get${member.name});`;
    }
  }
  switch (rawType) {
    case "const void *":
      return `
    static NAN_GETTER(Get${member.name});`;
    case "const char *":
      return `
    Nan::Persistent<v8::String, v8::CopyablePersistentTraits<v8::String>> ${member.name};
    static NAN_GETTER(Get${member.name});`;
    case "const char * const*":
    case "const uint32_t *":
    case "const float *":
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
      return retUnknown(member);
    }
  };
};

function processHeaderSetter(member) {
  let {rawType} = member;
  if (member.name === "flags") return "";
  return `
    static NAN_SETTER(Set${member.name});`;
};

function processSourceGetter(member) {
  let {rawType} = member;
  if (member.isBaseType) rawType = member.baseType;
  if (member.isArray && member.isStructType) {
    return `
  if (instance->${member.name} != nullptr) {
    info.GetReturnValue().Set(Nan::New(self->${member.name}));
  } else {
    info.GetReturnValue().SetNull();
  }`;
  }
  switch (rawType) {
    case "int":
    case "float":
    case "size_t":
    case "int32_t":
    case "uint32_t":
    case "uint64_t":
      return `
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->${member.name}));`;
    case "const char *":
    case "const char * const*":
    case "const float *":
    case "const int32_t *":
    case "const uint32_t *":
    case "const uint64_t *":
      return `
  if (instance->${member.name} != nullptr) {
    info.GetReturnValue().Set(Nan::New(self->${member.name}));
  } else {
    info.GetReturnValue().SetNull();
  }`;
    case "const void *":
      return `
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->${member.name}));`;
    default: {
      if (member.isEnumType) {
        return `
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->${member.name}));`;
      }
      else if (member.isStructType || member.isHandleType) {
        let isReference = member.dereferenceCount > 0;
        return `
  if (${isReference ? "instance" : "self"}->${member.name} != nullptr) {
    info.GetReturnValue().Set(self->${member.name}->handle());
  } else {
    info.GetReturnValue().SetNull();
  }`;
      } else if (member.isBitmaskType) {
        return `
  info.GetReturnValue().Set(Nan::New<v8::Number>(static_cast<uint8_t>(self->instance->${member.name})));`;
      }
      console.warn(`Cannot handle member ${member.rawType} in source-getter!`);
      return retUnknown(member);
    } break;
  };
};

function processSourceSetter(member) {
  let {rawType} = member;
  if (member.isBaseType) rawType = member.baseType;
  if (member.isArray && (member.isStructType || member.isHandleType)) {
    return `
  ${genPersistentV8Array(member)}
  // vulkan
  {
    instance->${member.name} = createArrayOfV8Objects<${member.type}, _${member.type}>(value);
  }`;
  }
  switch (rawType) {
    case "int":
    case "float":
    case "size_t":
    case "int32_t":
    case "uint32_t":
    case "uint64_t":
      return `
  self->instance->${member.name} = static_cast<${rawType}>(value->NumberValue());`;
    case "const char *":
      return `
  Nan::Persistent<v8::String, v8::CopyablePersistentTraits<v8::String>> str(Nan::To<v8::String>(value).ToLocalChecked());
  self->${member.name} = str;
  instance->${member.name} = copyV8String(value);`;
    case "const char * const*":
      return `
  ${genPersistentV8Array(member)}
  // vulkan
  {
    instance->${member.name} = createArrayOfV8Strings(value);
  }`;
    case "const float *":
      return `
  ${genPersistentV8Array(member)}
  // vulkan
  {
    instance->${member.name} = createArrayOfV8Floats(value);
  }`;
    case "const int32_t *":
      return `
  ${genPersistentV8Array(member)}
  // vulkan
  {
    instance->${member.name} = createArrayOfV8Int32(value);
  }`;
    case "const uint32_t *":
      return `
  ${genPersistentV8Array(member)}
  // vulkan
  {
    instance->${member.name} = createArrayOfV8Uint32(value);
  }`;
    case "const uint64_t *":
      return `
  ${genPersistentV8Array(member)}
  // vulkan
  {
    instance->${member.name} = createArrayOfV8Uint64(value);
  }`;
    case "const void *":
      return `
  self->instance->${member.name} = static_cast<uint32_t>(value->Uint32Value());`;
    default: {
      if (member.isEnumType) {
        return `
  self->instance->${member.name} = static_cast<${member.rawType}>(value->Uint32Value());`;
      }
      else if (member.isStructType || member.isHandleType) {
        let isReference = member.dereferenceCount > 0;
        return `
  _${member.type}* obj = Nan::ObjectWrap::Unwrap<_${member.type}>(value->ToObject());
  self->${member.name} = obj;
  instance->${member.name} = ${isReference ? "" : "*"}obj->instance;`;
      }
      else if (member.isBitmaskType) {
        return `
  self->instance->${member.name} = static_cast<${member.rawType}>(value->Uint32Value());`;
      }
      console.warn(`Cannot handle member ${member.rawType} in source-setter!`);
      return retUnknown(member);
    } break;
  };
};

function processSourceIncludes(input) {
  input.children.map(child => {
    if (child.isStructType) {
      globalIncludes.push({
        name: input.name,
        include: child.type
      });
    }
  });
  return `\n#include "index.h"`;
};

function processSourceMemberInitializer(member) {
  if (member.dereferenceCount > 0) {
    return `
  instance->${member.name} = nullptr;`;
  }
  return "";
};

function ignoreableMember(member) {
  return (
    member.name === "flags" ||
    member.name === "pNext" ||
    member.rawType === "void *" ||
    member.rawType === "HWND" ||
    member.rawType === "HANDLE" ||
    member.rawType === "DWORD" ||
    member.rawType === "LPCWSTR" ||
    member.rawType === "HINSTANCE"
  );
};

export default function(input) {
  let {
    name,
    children
  } = input;
  let vars = {
    input,
    struct_name: name,
    members: children,
    ignoreableMember,
    processSourceGetter,
    processSourceSetter,
    processHeaderGetter,
    processHeaderSetter,
    processSourceIncludes,
    processSourceMemberInitializer
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
