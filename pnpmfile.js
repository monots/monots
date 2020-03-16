const fs = require("fs");

const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
const resolutions = packageJson.resolutions;
console.log(packageJson.resolutions);

module.exports = {
  hooks: {
    readPackage
  }
};

function readPackage (pkg) {
  if (pkg.dependencies) {
    // Automatically use resolutions like YARN
    for(const resolution in resolutions) {
      if(pkg[resolution]) {
        pkg[resolution] = resolutions[resolution];
      }
    }
  }
  return pkg
};
