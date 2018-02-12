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
  "prepack",
  "prettier",
  "source-map",
  "typescript",
  "uglify-es",
  "uglify-js"
]);

function getOnlyFlag(argv) {
  if (process.argv.indexOf("--only") != -1) {
    return process.argv[process.argv.indexOf("--only") + 1];
  }
}

module.exports = {
  getTarget: function() {
    let onlyArg = getOnlyFlag();
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
