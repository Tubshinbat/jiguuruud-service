exports.valueRequired = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "null" ||
    value === "undefined"
  ) {
    return false;
  } else {
    return true;
  }
};
