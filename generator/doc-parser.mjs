/**

  Generates a processable list of documentation information from the Vulkan Docs chapters
   - Downloads given release .zip file from Vulkan Docs
   - Generated information gets later inserted into the specification AST

**/
import fs from "fs";
import https from "https";
import yauzl from "yauzl";
import readline from "readline";
import { Transform } from "stream";

import pkg from "../package.json";

import {
  warn,
  getFileNameFromPath
} from "./utils";

const {DOCS_DIR} = pkg.config;

const MACROS = [
  /(can):(\w*)/gm,
  /(cannot):(\w*)/gm,
  /(may):(\w*)/gm,
  /(must):(\w*)/gm,
  /(optional):(\w*)/gm,
  /(required):(\w*)/gm,
  /(should):(\w*)/gm,
  /(flink):(\w+)/gm,
  /(fname):(\w+)/gm,
  /(ftext):([\w\*]+)/gm,
  /(sname):(\w+)/gm,
  /(slink):(\w+)/gm,
  /(stext):([\w\*]+)/gm,
  /(ename):(\w+)/gm,
  /(elink):(\w+)/gm,
  /(etext):([\w\*]+)/gm,
  /(pname):(\w+(\.\w+)*)/gm,
  /(ptext):([\w\*]+(\.[\w\*]+)*)/gm,
  /(dname):(\w+)/gm,
  /(dlink):(\w+)/gm,
  /(tname):(\w+)/gm,
  /(tlink):(\w+)/gm,
  /(basetype):(\w+)/gm,
  /(code):(\w+(\.\w+)*)/gm,
  /(tag):(\w+)/gm,
  /(attr):(\w+)/gm,
  /(undefined):/gm
];

const REPLACEMENTS = [
  {
    replace: /is a pointer to an array/gm,
    with: "is an array"
  },
  {
    replace: /is a pointer to/gm,
    with: "is a reference to"
  },
  {
    replace: /points to a pointer/gm,
    with: "is a reference"
  },
  {
    replace: /pointer/gm,
    with: "reference"
  },
  {
    replace: /points a/gm,
    with: "references a"
  },
  {
    replace: /points/gm,
    with: "reference"
  },
  {
    replace: /NULL-terminated UTF-16 string/gm,
    with: "string"
  },
  {
    replace: /null-terminated UTF-8 string/gm,
    with: "string"
  },
  {
    replace: /an integer/gm,
    with: "a number"
  },
  {
    replace: /an unsigned integer/gm,
    with: "a number"
  },
  {
    replace: /is the unsigned integer size/gm,
    with: "is the size"
  },
  {
    replace: /`NULL`/gm,
    with: "<i>null</i>"
  },
  {
    replace: /NULL/gm,
    with: "<i>null</i>"
  }
];

function isChapterFile(path) {
  path = escapePath(path);
  let includesChapter = path.substr(0, 10);
  return includesChapter === `/chapters/`;
};

function escapePath(path) {
  let fileNameIndex = path.indexOf(`/`);
  return path.substr(fileNameIndex, path.length);
};

function formatDescriptionText(input) {
  input = input.replace(/(?:\r\n|\r|\n)/g, ``);
  input = input.replace(/\s\s+/g, ` `);
  return input;
};

function parseSectionParameter(source) {
  let out = [];
  let rx = /(.*)(pname|ename):([^\s]+)([^*]*)/m;
  let split = source.split(`  *`);
  split.map(str => {
    let match = rx.exec(str);
    if (!match) {
      out.push(null);
      return;
    }
    out.push({
      name: match[3],
      type: match[2],
      description: formatDescriptionText(match[4])
    });
  });
  return out;
};

function parseSectionParameters(text) {
  let out = [];
  let rx = / \*(.*)(pname|ename):([^}]+?)^\s*$/gm;
  let match = null;
  while (match = rx.exec(text)) {
    let p = parseSectionParameter(match[0]);
    out.push(p);
  };
  return out;
};

function parseSectionDescriptions(source) {
  let rx = /(open,refpage|desc|type)=\'([^}]+?)\'/gm;
  let out = {};
  let match = null;
  while (match = rx.exec(source)) {
    if (match[1] === "desc") {
      out.description = match[2];
    }
    else if (match[1] === "open,refpage") {
      out.name = match[2];
    } else {
      out[match[1]] = match[2];
    }
  };
  return out;
};

function parseSectionEquivalents(source) {
  let rx = /.*or the equivalent[^}]+?include::([^}]+?)[^]]\n/gm;
  let out = [];
  let match = null;
  while (match = rx.exec(source)) {
    let equiv = getFileNameFromPath(match[1] || "");
    if (equiv.length) out.push(equiv);
  };
  return out;
};

function parseChapterCategory(source) {
  let rx = /\[\[(.*)\]\].*\n\= (.*)/gm;
  let match = rx.exec(source);
  let out = match ? match[2] : ``;
  return out;
};

function parseChapter(source) {
  let rx = /\[open,refpage([^}]+?)\]\n\--[^]*?\--/gm;
  let out = [];
  let children = [];
  let descriptions = [];
  let equivalents = [];
  let match = null;
  let category = parseChapterCategory(source);
  while (match = rx.exec(source)) {
    let text = match[0];
    let param = parseSectionParameters(text);
    let descr = parseSectionDescriptions(text);
    let equiv = parseSectionEquivalents(text);
    children.push(param);
    descriptions.push(descr);
    equivalents.push(...equiv);
  };
  if (descriptions.length !== children.length) {
    throw `Failed to parse chapter`;
  }
  descriptions.map((description, index) => {
    out.push({
      category,
      description,
      equivalents,
      children: children[index][0] || []
    });
  });
  return out;
};

function clearIfDef(source) {
  let rx = /ifdef([^}]+?)\n([^}]+?)endif([^}]+?)\n?$/gm;
  let match = null;
  while (match = rx.exec(source)) {
    source = source.replace(match[0], match[2]);
  };
  return source;
};

function parseChapterEntry(source) {
  source = clearIfDef(source);
  let chapter = parseChapter(source);
  return chapter;
};

let currentDirectory = ``;

let entries = [];

function getChapterEntryByName(name) {
  for (let ii = 0; ii < entries.length; ++ii) {
    let entry = entries[ii];
    let {description} = entry;
    if (description.name === name) return entry;
  };
  return null;
};

// apply text replacements
function extractDescriptionMacros(desc) {
  let out = [];
  MACROS.map(rx => {
    let match = null;
    while (match = rx.exec(desc)) {
      if (match[0] && match[1] && match[2]) {
        let macro = {
          kind: match[1],
          value: match[2]
        };
        out.push(macro);
        desc = desc.replace(match[0], `{#${out.length - 1}#}`);
      }
    };
  });
  return {
    macros: out,
    description: desc
  };
};

function applyDescriptionReplacements(desc) {
  REPLACEMENTS.map(r => {
    desc = desc.replace(r.replace, r.with);
  });
  return {
    description: desc
  };
};

// apply text replacements
function transformDescription(description) {
  let pass0 = extractDescriptionMacros(description);
  let {macros} = pass0;
  description = pass0.description;
  let pass1 = applyDescriptionReplacements(description);
  description = pass1.description;
  return {
    macros,
    description
  };
};

function transformDescriptions(entries) {
  entries.map(entry => {
    let desc = entry.description;
    let {name, description, type} = desc;
    let result = transformDescription(description);
    desc.description = result.description;
    desc.macros = result.macros;
    switch (type) {
      case "protos":
      case "structs": {
        entry.children.map(c => {
          if (c && c.description) {
            let result = transformDescription(c.description);
            c.description = result.description;
            c.macros = result.macros;
          }
        });
      } break;
      case "handles": {
        // no members
      } break;
      case "enums": break;
      case "flags": break;
    };
  });
};

function parse(version) {
  return new Promise(resolve => {
    yauzl.open(`${DOCS_DIR}/${version}.zip`, { lazyEntries: true }, (err, zip) => {
      if (err) throw err;
      zip.readEntry();
      zip.on("entry", function(entry) {
        // directory
        if (/\/$/.test(entry.fileName)) {
          currentDirectory = escapePath(entry.fileName).substr(10, entry.fileName.length);
          zip.readEntry();
        // file
        } else {
          if (isChapterFile(entry.fileName)) {
            zip.openReadStream(entry, function(err, readStream) {
              if (err) throw err;
              let writeStream = fs.createWriteStream(`${DOCS_DIR}/doc_tmp`);
              writeStream.on("finish", () => {
                let str = fs.readFileSync(`${DOCS_DIR}/doc_tmp`, "utf-8");
                //console.log(entry.fileName+":");
                let chapter = parseChapterEntry(str);
                chapter.fileName = getFileNameFromPath(entry.fileName);
                chapter.directory = (currentDirectory);
                chapter.map(entry => {
                  entries.push(entry);
                });
                fs.unlinkSync(`${DOCS_DIR}/doc_tmp`);
                zip.readEntry();
              });
              readStream.pipe(writeStream);
            });
          } else {
            zip.readEntry();
          }
        }
      });
      zip.on("end", () => {
        transformDescriptions(entries);
        resolve(entries);
      });
    });
  });
};

function download(url, path) {
  return new Promise(resolve => {
    let req = https.get(url, res => {
      if (res.statusCode === 302) {
        let redirectUrl = res.headers.location;
        console.log(`Following redirect:`, redirectUrl);
        download(redirectUrl, path).then(resolve);
        return;
      }
      if (res.statusCode !== 200) {
        req.abort();
        let err = `No documentation file found for version ${version}! `;
        err += `Make sure the documentation got released at: https://github.com/KhronosGroup/Vulkan-Docs/releases`;
        resolve({ error: err, path });
        return;
      }
      let total = res.headers["content-length"];
      if (!total) process.stdout.write("Using chunked transfer.." + "\n\n");
      let current = 0;
      let lastPercent = 0;
      res.on("error", (err) => resolve({ error: err, path }));
      res.on("end", () => {
        if (total) process.stdout.write("100%" + "\n\n");
        else process.stdout.write("Finished downloading!" + "\n\n");
        resolve({ error: null, path });
      });
      if (total) process.stdout.write("0% ");
      res.on("data", function(chunk) {
        current += chunk.length;
        if (total) {
          let percent = Math.round(current * 100 / total);
          if (percent > lastPercent + 9) {
            lastPercent = percent;
            process.stdout.write(percent + "% ");
          }
        } else {
          if (Math.random() < 0.25) {
            readline.clearLine(process.stdout, 0);
            readline.cursorTo(process.stdout, 0);
            process.stdout.write(`Downloaded ${current / 1e3}kB..\n`);
          }
        }
      });
      res.pipe(fs.createWriteStream(path));
    });
  });
};

function downloadDocs(version) {
  let path = `${DOCS_DIR}/${version}.zip`;
  let url = `https://github.com/KhronosGroup/Vulkan-Docs/archive/v${version}.zip`;
  return new Promise(resolve => {
    if (fs.existsSync(path)) return resolve({ error: null, path });
    console.log(`Downloading documentation file for ${version}...`);
    download(url, path).then(resolve);
  });
};

export default function(version) {
  if (typeof version !== "string") throw `No docs version specified!`;
  return new Promise(resolve => {
    downloadDocs(version).then(result => {
      if (result.error) throw result.error;
      let ast = parse(version);
      resolve(ast);
    });
  });
};
