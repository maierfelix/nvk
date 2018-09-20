import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

let ast = null;

const H_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/enums-h.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

function getEnumType(enu) {
  if (enu.type === "ENUM_STRINGS") return `std::string`;
  return `__int32`;
};

function getEnumMemberValue(member) {
  if (member.isStringValue) return `"${member.value}"`;
  return member.value || member.alias;
};

function getEnumV8Value(enu) {
  if (
    enu.type === "ENUM" ||
    enu.type === "BITMASK" ||
    enu.type === "UNKNOWN"
  ) {
    return `Nan::New(static_cast<__int32>(it->second))`;
  }
  else if (enu.type === "ENUM_STRINGS") {
    return `v8::String::NewFromUtf8(v8::Isolate::GetCurrent(), it->second.c_str())`;
  }
};

export default function(astReference, enums) {
  ast = astReference;
  let vars = {
    enums,
    getEnumType,
    getEnumV8Value,
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
