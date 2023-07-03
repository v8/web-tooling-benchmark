// Check if benchmark dependencies have explicit versions
const semver = require("semver");
const { EOL } = require("os");

const { dependencies } = require("../../package.json");
const { targetList } = require("../../src/cli-flags-helper");

// babel -> @babel/standalone
targetList.delete("babel");
targetList.add("@babel/standalone");

// babylon -> @babel/parser
targetList.delete("babylon");
targetList.add("@babel/parser");

// acorn requires acorn-walk
targetList.add("acorn-walk");

// postcss requires autoprefixer and postcss-nested
targetList.add("autoprefixer");
targetList.add("postcss-nested");

const invalid = [...targetList].reduce((list, dependency) => {
  const version = dependencies[dependency];
  if (!semver.valid(version)) {
    list.push({ dependency, version });
  }
  return list;
}, []);


if (invalid.length > 0) {
  console.error(
    `ERROR: Benchmark dependencies must have explicit versions.${EOL}`
  );
  console.error(`Invalid dependencies:`);
  invalid.forEach(({ dependency, version }) => {
    console.error(`- ${dependency}: ${version}`);
  });

  process.exit(1);
}
