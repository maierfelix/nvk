/**

  Generates JS relative list of vulkan enums and bitmasks

**/
import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

let ast = null;

const H_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/enums-h.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

function getEnumType(enu) {
  if (enu.type === "ENUM_STRINGS") return `std::string`;
  return `int32_t`;
};

function getEnumMemberValue(member) {
  if (member.isStringValue) return `"${member.value}"`;
  return member.value || member.alias;
};

function getEnumNapiValue(enu) {
  if (
    enu.type === "ENUM" ||
    enu.type === "BITMASK" ||
    enu.type === "UNKNOWN"
  ) {
    return `Napi::Number::New(env, static_cast<int32_t>(it->second))`;
  }
  else if (enu.type === "ENUM_STRINGS") {
    return `Napi::String::New(env, it->second.c_str())`;
  }
};

export default function(astReference, enums) {
  ast = astReference;
  let vars = {
    enums,
    getEnumType,
    getEnumNapiValue,
    getEnumMemberValue
  };
  let out = {
    source: null
  };
  // h
  {
    let template = H_TEMPLATE;
    let output = nunjucks.renderString(template, vars);
    out.source = output;
  }
  return out;
};
