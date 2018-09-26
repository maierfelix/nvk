export function formatVkVersion(version) {
  let split = version.split(".");
  // we have to trim the last version specificer
  if (split.length > 3) {
    // .0 at version end is ignored
    if (split[3] === "0") {
      split.pop();
      return split.join(".");
    }
  }
  return version;
};

export function getLunarVkVersion(version) {
  let split = version.split(".");
  // we have to trim the last version specificer
  if (split.length === 3) {
    // insert a .0
    split.push("0");
    return split.join(".");
  }
  return version;
};
