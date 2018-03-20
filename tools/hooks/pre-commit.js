// Check if benchmark dependencies have explicit versions
const semver = require("semver");
const { EOL } = require("os");

const { dependencies } = require("../../package.json");
const { targetList } = require("../../src/cli-flags-helper");

// babel -> @babel/standalone
targetList.delete("babel");
targetList.add("@babel/standalone");

const invalid = [];
targetList.forEach(dependency => {
  const version = dependencies[dependency];
  if (!semver.valid(version)) {
    invalid.push({ dependency, version });
  }
});

if (invalid.length) {
  console.error(
    `ERROR: Benchmark dependencies must have explicit versions.${EOL}`
  );
  console.error(`Invalid dependencies:`);
  invalid.forEach(({ dependency, version }) => {
    console.error(`- ${dependency}: ${version}`);
  });

  process.exit(1);
}
