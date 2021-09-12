"use strict";

function _interopDefault(ex) {
  return ex && "object" == typeof ex && "default" in ex ? ex.default : ex;
}

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var fs = _interopDefault(require("fs-extra")), path = _interopDefault(require("path")), globby = _interopDefault(require("globby")), readYamlFile = _interopDefault(require("read-yaml-file"));

async function getWorkspaces(opts = {}) {
  const cwd = opts.cwd || process.cwd(), tools = opts.tools || [ "yarn", "bolt", "pnpm" ], pkg = await fs.readFile(path.join(cwd, "package.json"), "utf-8").then(JSON.parse);
  let workspaces;
  if (tools.includes("yarn") && pkg.workspaces) Array.isArray(pkg.workspaces) ? workspaces = pkg.workspaces : pkg.workspaces.packages && (workspaces = pkg.workspaces.packages); else if (tools.includes("bolt") && pkg.bolt && pkg.bolt.workspaces) workspaces = pkg.bolt.workspaces; else if (tools.includes("pnpm")) try {
    const manifest = await readYamlFile(path.join(cwd, "pnpm-workspace.yaml"));
    manifest && manifest.packages && (workspaces = manifest.packages);
  } catch (err) {
    if ("ENOENT" !== err.code) throw err;
  }
  if (!workspaces) return tools.includes("root") ? [ {
    config: pkg,
    dir: cwd,
    name: pkg.name
  } ] : null;
  const folders = await globby(workspaces, {
    cwd: cwd,
    onlyDirectories: !0,
    absolute: !0,
    expandDirectories: !1
  });
  let pkgJsonsMissingNameField = [];
  const results = await Promise.all(folders.sort().filter(dir => fs.existsSync(path.join(dir, "package.json"))).map(async dir => fs.readFile(path.join(dir, "package.json"), "utf8").then(contents => {
    const config = JSON.parse(contents);
    return config.name || pkgJsonsMissingNameField.push(path.relative(cwd, path.join(dir, "package.json"))), 
    {
      config: config,
      name: config.name,
      dir: dir
    };
  })));
  if (0 !== pkgJsonsMissingNameField.length) throw pkgJsonsMissingNameField.sort(), 
  new Error(`The following package.jsons are missing the "name" field:\n${pkgJsonsMissingNameField.join("\n")}`);
  return results;
}

exports.default = getWorkspaces;
