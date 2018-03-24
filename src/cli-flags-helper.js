const targetList = new Set([
  "acorn",
  "babel",
  "babylon",
  "buble",
  "chai",
  "coffeescript",
  "espree",
  "esprima",
  "jshint",
  "lebab",
  "postcss",
  "prepack",
  "prettier",
  "source-map",
  "typescript",
  "uglify-es",
  "uglify-js"
]);

function getOnlyFlag() {
  const onlyIndex = process.argv.indexOf("--only");
  if (onlyIndex != -1) {
    return process.argv[onlyIndex + 1];
  }
}

module.exports = {
  getTarget: () => {
    const onlyArg = getOnlyFlag();
    if (targetList.has(onlyArg)) {
      return [onlyArg];
    } else if (typeof ONLY != "undefined" && targetList.has(ONLY)) {
      return [ONLY];
    } else {
      return [...targetList];
    }
  },
  targetList: targetList
};
