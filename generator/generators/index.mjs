/**

  Generates C++ link code

**/
import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

import {
  warn,
  getSortedIncludes,
  getPlatformRelevantIncludes
} from "../utils.mjs";

import {
  JavaScriptType,
  getJavaScriptType
} from "../javascript-type.mjs";

let ast = null;

const H_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/index-h.njk`, "utf-8");
const CPP_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/index-cpp.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

function processCallbackReturn(func) {
  let jsType = getJavaScriptType(ast, func);
  let {type} = jsType;
  if (type === JavaScriptType.BOOLEAN) {
    return `if (!(ret.IsBoolean())) {
    Napi::TypeError::New(env, "Expected 'Boolean' as the Return Value of Callback '${func.name}'").ThrowAsJavaScriptException();
    return false;
  }
  return ret.As<Napi::Boolean>().Value();`;
  }
  else if (jsType.isArrayBuffer) {
    return `if (!(ret.IsArrayBuffer())) {
    Napi::TypeError::New(env, "Expected 'ArrayBuffer' as the Return Value of Callback '${func.name}'").ThrowAsJavaScriptException();
    return nullptr;
  }
  Napi::ArrayBuffer buffer = ret.As<Napi::ArrayBuffer>();
  return reinterpret_cast<void*>(buffer.Data());`;
  }
  else if (type === JavaScriptType.UNDEFINED) {
    // can be ignored
  }
  else {
    warn(`Cannot process Callback Return type '${func.rawType}'`);
  }
  return ``;
};

function processCallbackParameter(func, param) {
  let jsType = getJavaScriptType(ast, param);
  let {type} = jsType;
  if (type === JavaScriptType.NUMBER) {
    return `
  args.push_back(Napi::Number::New(env, static_cast<uint32_t>(${param.name})).As<Napi::Value>());`;
  }
  else if (type === JavaScriptType.BIGINT) {
    return `
  args.push_back(Napi::BigInt::New(env, static_cast<uint64_t>(${param.name})).As<Napi::Value>());`;
  }
  else if (type === JavaScriptType.OBJECT) {
    return `
  {
    Napi::Object module = proxy->module.Value();
    Napi::Function ctor = module.Get("${param.type}").As<Napi::Function>();
    Napi::Object arg = Napi::Object::New(env);
    void* addr = const_cast<void*>(reinterpret_cast<const void*>(${param.name}));
    arg.Set("$memoryOffset", Napi::Number::New(env, 0).As<Napi::Value>());
    arg.Set("$memoryBuffer", Napi::ArrayBuffer::New(env, addr, sizeof(${param.type})).As<Napi::Value>());
    Napi::Object object = ctor.New({ arg });
    object.Get("reflect").As<Napi::Function>().Call({ object.Get("memoryAddress") });
    args.push_back(object.As<Napi::Value>());
  }`;
  }
  // pUserData is only used by nvk for now
  else if (jsType.isArrayBuffer && param.name === "pUserData") {
    return `
  args.push_back(env.Null().As<Napi::Value>());`;
  }
  else if (jsType.isArrayBuffer) {
    // we skip to find a 'size' parameter for the function 'vkFreeFunction'
    // as this function doesn't require one
    // as manual memory management is expected to be done by the user,
    // the user will likely free memory just by retrieving the passed ArrayBuffer's memory address,
    // and then resolve the length of the ArrayBuffer with his custom allocator
    if (func.name !== "vkFreeFunction") {
      // make sure that a 'size' parameter is defined
      let sizeParam = func.params.find(p => p.name === "size");
      if (!sizeParam) warn(`Cannot find 'size' parameter for Callback parameter '${param.name}'`);
      return `
  args.push_back(Napi::ArrayBuffer::New(env, ${param.name}, size).As<Napi::Value>());`;
    } else {
      // we send the user the address of the to-be-freed memory as a BigInt
      return `
  args.push_back(Napi::BigInt::New(env, reinterpret_cast<uint64_t>(${param.name})).As<Napi::Value>());`;
    }
  }
  else if (type === JavaScriptType.STRING) {
    return `
  args.push_back(Napi::String::New(env, ${param.name}).As<Napi::Value>());`;
  }
  else {
    warn(`Cannot process type '${jsType.toString()}' of '${func.name}':'${param.name}'`);
  }
  return ``;
};

function processCallbackParameters(func) {
  let out = ``;
  let {params} = func;
  params.map(param => {
    out += processCallbackParameter(func, param);
  });
  return out;
};

export default function(astReference, includes, calls, includeMemoryLayouts) {
  ast = astReference;
  if (includeMemoryLayouts) {
    warn(`Including memoryLayouts in build for later bootstrapping..`);
  } else {
    warn(`Excluding memoryLayouts from build, to reduce package size. Make sure that the module got recompiled, before publishing!`);
  }
  let functionPointers = astReference.filter(node => node.kind === "FUNCTION_POINTER");
  let vars = {
    calls,
    includes,
    functionPointers,
    getPlatformRelevantIncludes: () => {
      return getPlatformRelevantIncludes(ast);
    },
    processCallbackReturn,
    processCallbackParameters,
    includeMemoryLayouts
  };
  let out = {
    header: null,
    source: null
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
