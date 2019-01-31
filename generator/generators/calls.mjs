/**

  Generates C++ binding code for vulkan function calls

**/
import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

import {
  warn, error,
  isPNextMember,
  isIgnoreableType
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
        result->${member.name}.Reset<v8::Object>(inst.As<v8::Object>());
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
  let condition = `IsArray`;
  // validate that we got a typed array
  if (param.isTypedArray) condition = `Is${param.jsTypedArrayName}`;
  // fill variable
  out += `
  if (info[${index}]->${condition}()) {\n`;
  // auto flush structs
  if (param.isStructType) {
    out += `
  {
    v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(info[${index}]);
    for (unsigned int ii = 0; ii < array->Length(); ++ii) {
      v8::Local<v8::Value> item = Nan::Get(array, ii).ToLocalChecked();
      _${param.type}* result = Nan::ObjectWrap::Unwrap<_${param.type}>(Nan::To<v8::Object>(item).ToLocalChecked());
      if (!result->flush()) return;
    };
  }`;
  }
  // handle
  if (param.isHandleType) {
    out += `
    v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(info[${index}]);
    std::vector<${param.type}> data(array->Length());
    for (unsigned int ii = 0; ii < array->Length(); ++ii) {
      v8::Local<v8::Value> item = Nan::Get(array, ii).ToLocalChecked();
      _${param.type}* result = Nan::ObjectWrap::Unwrap<_${param.type}>(Nan::To<v8::Object>(item).ToLocalChecked());
      data[ii] = result->instance;
    };
    $p${index} = std::make_shared<std::vector<${param.type}>>(data);`;
  }
  // struct
  else if (param.isStructType) {
    out += `
    v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(info[${index}]);
    std::vector<${param.type}> data(array->Length());
    for (unsigned int ii = 0; ii < array->Length(); ++ii) {
      v8::Local<v8::Value> item = Nan::Get(array, ii).ToLocalChecked();
      _${param.type}* result = Nan::ObjectWrap::Unwrap<_${param.type}>(Nan::To<v8::Object>(item).ToLocalChecked());
      data[ii] = result->instance;
    };
    $p${index} = std::make_shared<std::vector<${param.type}>>(data);`;
  }
  // typed array
  else if (param.isTypedArray) {
    let type = param.baseType || param.type;
    out += `
    ${type}* data = getTypedArrayData<${type}>(Nan::To<v8::Object>(info[${index}]).ToLocalChecked());
    $p${index} = std::make_shared<${type}*>(data);`;
  }
  // enum
  else if (param.enumType) {
    out += `
    v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(info[${index}]);
    ${param.enumType}* arr${index} = new ${param.enumType}[array->Length()];
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
  } else if (!info[${index}]->IsNull()) {
    return Nan::ThrowTypeError("Invalid type for argument ${index + 1} '${param.name}'");
  }\n`;
  return out;
};

function getCallBodyBefore(call) {
  let {params} = call;
  let out = params.map((param, index) => {
    if (isIgnoreableType(param)) return ``;
    let {rawType} = param;
    if (param.isBaseType && param.type !== "VkBool32") rawType = param.baseType;
    // ignore
    if (param.name === "pAllocator") {
      return ``;
    }
    if (param.isStaticArray && param.isNumericArray) {
      return `
    std::shared_ptr<std::vector<${param.type}>> $p${index} = nullptr;
    if (info[${index}]->IsArray()) {
      // validate length
      if (v8::Local<v8::Array>::Cast(info[${index}])->Length() != ${param.length}) {
        return Nan::ThrowTypeError("Invalid array length for argument ${index + 1} '${param.name}'");
      } else {
        std::vector<${param.type}> data = createArrayOfV8Numbers<${param.type}>(info[${index}]);
        $p${index} = std::make_shared<std::vector<${param.type}>>(data);
      }
    } else if (!info[${index}]->IsNull()) {
      return Nan::ThrowTypeError("Invalid type for argument ${index + 1} '${param.name}'");
    }`;
    }
    else if (param.isArray && param.enumType) {
      return getInputArrayBody(param, index);
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
  ${type} $p${index} = static_cast<${type}>(Nan::To<int64_t>(info[${index}]).FromMaybe(0));`;
      }
      case "VkBool32 *":
        return `
  v8::Local<v8::Object> obj${index};
  ${param.type} $p${index};
  if (info[${index}]->IsObject()) {
    obj${index} = Nan::To<v8::Object>(info[${index}]).ToLocalChecked();
    v8::Local<v8::Value> val = obj${index}->Get(Nan::New("$").ToLocalChecked());
    $p${index} = static_cast<${param.type}>(Nan::To<bool>(val).FromMaybe(false));
  } else if (!info[${index}]->IsNull()) {
    Nan::ThrowTypeError("Expected 'Object' or 'null' for argument ${index + 1} '${param.name}'");
  }`;
      case "const char *":
        return `
  ${param.type}* $p${index};
  if (info[${index}]->IsString()) {
    $p${index} = copyV8String(info[${index}]);
  } else if (!info[${index}]->IsNull()) {
    Nan::ThrowTypeError("Expected 'String' or 'null' for argument ${index + 1} '${param.name}'");
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
  v8::Local<v8::Object> obj${index};
  ${param.type} $p${index};
  if (info[${index}]->IsObject()) {
    obj${index} = Nan::To<v8::Object>(info[${index}]).ToLocalChecked();
    v8::Local<v8::Value> val = obj${index}->Get(Nan::New("$").ToLocalChecked());
    $p${index} = static_cast<${param.type}>(Nan::To<int64_t>(val).FromMaybe(0));
  } else if (!info[${index}]->IsNull()) {
    Nan::ThrowTypeError("Expected 'Object' or 'null' for argument ${index + 1} '${param.name}'");
  }`;
        }
      case "void **":
        return `
  v8::Local<v8::Object> obj${index} = Nan::To<v8::Object>(info[${index}]).ToLocalChecked();
  void *$p${index};`;
      case "const void *":
        return `
  ${param.type}* $p${index};
  if (info[${index}]->IsArrayBufferView()) {
    v8::Local<v8::ArrayBufferView> arr = v8::Local<v8::ArrayBufferView>::Cast(Nan::To<v8::Object>(info[${index}]).ToLocalChecked());
    $p${index} = arr->Buffer()->GetContents().Data();
  } else {
    $p${index} = nullptr;
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
  if (info[${index}]->IsObject()) {
    obj${index} = Nan::ObjectWrap::Unwrap<_${param.type}>(Nan::To<v8::Object>(info[${index}]).ToLocalChecked());
    ${ param.isStructType ? `if (!obj${index}->flush()) return;` : `` }
    $p${index} = &obj${index}->instance;
  } else if (info[${index}]->IsNull()){
    $p${index} = ${deinitialize};
  } else {
    Nan::ThrowTypeError("Expected 'Object' or 'null' for argument ${index + 1} '${param.name}'");
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
    ) out += `    info[${index}]->IsNull() ? VK_NULL_HANDLE : *$p${index}${addComma}`;
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
  if (info[${pIndex}]->IsArray()) {
    ${param.type}* $pdata = $p${pIndex}.get()->data();
    v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(info[${pIndex}]);
    for (unsigned int ii = 0; ii < array->Length(); ++ii) {
      v8::Handle<v8::Value> item = Nan::Get(array, ii).ToLocalChecked();
      v8::Local<v8::Object> obj = Nan::To<v8::Object>(item).ToLocalChecked();
      _${param.type}* result = Nan::ObjectWrap::Unwrap<_${param.type}>(obj);
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
  if (info[${pIndex}]->IsArray()) {
    ${param.type}* $pdata = $p${pIndex}.get()->data();
    v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(info[${pIndex}]);
    for (unsigned int ii = 0; ii < array->Length(); ++ii) {
      v8::Handle<v8::Value> item = Nan::Get(array, ii).ToLocalChecked();
      _${param.type}* target = Nan::ObjectWrap::Unwrap<_${param.type}>(Nan::To<v8::Object>(item).ToLocalChecked());
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
  v8::Local<v8::BigInt> ptr${pIndex} = v8::BigInt::New(v8::Isolate::GetCurrent(), (int64_t)$p${pIndex});
  obj${pIndex}->Set(Nan::New("$").ToLocalChecked(), ptr${pIndex});`);
    }
    else {
      // array of numbers or bools
      switch (param.rawType) {
        case "size_t *":
        case "uint64_t *":
        case "const uint64_t *":
          out.push(`
    v8::Local<v8::BigInt> pnum${pIndex} = v8::BigInt::New(v8::Isolate::GetCurrent(), (uint64_t)$p${pIndex});
    obj${pIndex}->Set(Nan::New("$").ToLocalChecked(), pnum${pIndex});`);
          break;
        case "int *":
        case "int32_t *":
        case "uint32_t *":
        case "const int32_t *":
        case "const uint32_t *":
        case "const float *":
          out.push(`
    obj${pIndex}->Set(Nan::New("$").ToLocalChecked(), Nan::New($p${pIndex}));`);
          break;
        case "VkBool32 *":
          out.push(`
    obj${pIndex}->Set(Nan::New("$").ToLocalChecked(), Nan::New($p${pIndex}));`);
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
    v8::Local<v8::String> str${pIndex} = v8::String::NewFromUtf8(v8::Isolate::GetCurrent(), (&${basePath}instance)->${member.name});
    ${basePath}${member.name} = Nan::Persistent<v8::String, v8::CopyablePersistentTraits<v8::String>>(str${pIndex});
  }`);
    }
    // struct
    else if (member.isStructType && !member.isArray) {
      out.push(`
  {
    v8::Local<v8::Function> ctor = Nan::GetFunction(Nan::New(_${member.type}::constructor)).ToLocalChecked();
    v8::Local<v8::Object> inst = Nan::NewInstance(ctor).ToLocalChecked();
    _${member.type}* unwrapped${basePath.length} = Nan::ObjectWrap::Unwrap<_${member.type}>(inst);
    ${basePath}${member.name}.Reset<v8::Object>(inst);
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
    v8::Local<v8::Array> arr${pIndex} = v8::Array::New(v8::Isolate::GetCurrent(), ${member.length});
    // populate array
    for (unsigned int ii = 0; ii < ${member.length}; ++ii) {
      arr${pIndex}->Set(ii, Nan::New((&${basePath}instance)->${member.name}[ii]));
    };
    ${basePath}${member.name}.Reset<v8::Array>(arr${pIndex});
  }`);
    }
    // array of structs
    else if (member.isStructType && member.isArray) {
      // TODO: this only works for primitive-type members
      out.push(`
  {
    // back reflect array
    unsigned int len = ${basePath}instance.${member.dynamicLength};
    v8::Local<v8::Array> arr = v8::Array::New(v8::Isolate::GetCurrent(), len);
    // populate array
    for (unsigned int ii = 0; ii < len; ++ii) {
      v8::Local<v8::Function> ctor = Nan::GetFunction(Nan::New(_${member.type}::constructor)).ToLocalChecked();
      v8::Local<v8::Object> inst = Nan::NewInstance(ctor).ToLocalChecked();
      _${member.type}* unwrapped = Nan::ObjectWrap::Unwrap<_${member.type}>(inst);
      memcpy(&unwrapped->instance, &${basePath}instance.${member.name}[ii], sizeof(${member.type}));
      arr->Set(ii, inst);
    };
    ${basePath}${member.name}.Reset<v8::Array>(arr);
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
