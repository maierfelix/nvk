import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

const CPP_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/calls-cpp.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

function getCallBody(call) {
  let {params} = call;
  let out = params.map(param => {
    let {rawType} = param;
    if (param.isBaseType) rawType = param.baseType;
    if (param.isArray && param.isStructType) {
      return ``;
    }
    switch (rawType) {
      case "int":
      case "float":
      case "size_t":
      case "int32_t":
      case "uint32_t":
      case "uint64_t":
        return ``;
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
        return ``;
      case "void *":
      case "const void *":
        return ``;
      default: {
        if (param.isEnumType) {
          return ``;
        }
        else if (param.isStructType || param.isHandleType) {
          return ``;
        } else if (param.isBitmaskType) {
          return ``;
        }
        //console.warn(`Cannot handle param ${param.rawType} in source-getter!`);
        //console.log(param);
        return ``;
      } break;
    };
  });
  return out.join("\n");
};

function getCallReturn(call) {
  return `info.GetReturnValue().Set(Nan::New(0));`;
};

export default function(calls) {
  let vars = {
    calls,
    getCallBody,
    getCallReturn
  };
  let out = {
    header: null,
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
