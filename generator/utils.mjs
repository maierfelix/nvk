export function formatVkVersion(version) {
  let split = version.split(".");
  if (split.length > 3) {
    // .0 at version end is ignored, pop it
    if (split[3] === "0") {
      split.pop();
      return split.join(".");
    }
  }
  return version;
};

export function getLunarVkVersion(version) {
  let split = version.split(".");
  if (split.length === 3) {
    // insert a .0 at end
    split.push("0");
    return split.join(".");
  }
  return version;
};
