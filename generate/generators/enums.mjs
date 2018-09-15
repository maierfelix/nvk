import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

let ast = null;

const H_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/enums-h.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

function getEnumType(enu) {
  if (enu.type === "UNKNOWN") return `__int32`;
  return `unsigned __int8`;
};

function getEnumMemberValue(member) {
  let parsed = parseInt(member.value);
  let isFloat = member.value.indexOf(".") !== -1;
  if (member.type === "BITPOS") {
    let pos = 1 << parseInt(member.value, 0);
    return `0x` + pos.toString(16);
  }
  if (Number.isNaN(parsed) || isFloat) {
    return `(__int32)${member.value}`;
  }
  return member.value;
};

export default function(astReference, enums) {
  ast = astReference;
  let vars = {
    enums,
    getEnumType,
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
