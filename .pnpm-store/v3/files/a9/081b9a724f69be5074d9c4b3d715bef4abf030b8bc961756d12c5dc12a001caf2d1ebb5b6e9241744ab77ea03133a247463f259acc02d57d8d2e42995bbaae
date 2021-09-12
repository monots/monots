import fs from 'fs-extra';
import path from 'path';
import globby from 'globby';
import readYamlFile from 'read-yaml-file';

// This is a modified version of the package-getting in bolt
async function getWorkspaces(opts = {}) {
  const cwd = opts.cwd || process.cwd();
  const tools = opts.tools || ["yarn", "bolt", "pnpm"]; // We also support root, but don't do it by default

  const pkg = await fs.readFile(path.join(cwd, "package.json"), "utf-8").then(JSON.parse);
  let workspaces;

  if (tools.includes("yarn") && pkg.workspaces) {
    if (Array.isArray(pkg.workspaces)) {
      workspaces = pkg.workspaces;
    } else if (pkg.workspaces.packages) {
      workspaces = pkg.workspaces.packages;
    }
  } else if (tools.includes("bolt") && pkg.bolt && pkg.bolt.workspaces) {
    workspaces = pkg.bolt.workspaces;
  } else if (tools.includes("pnpm")) {
    try {
      const manifest = await readYamlFile(path.join(cwd, "pnpm-workspace.yaml"));

      if (manifest && manifest.packages) {
        workspaces = manifest.packages;
      }
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }
  }

  if (!workspaces) {
    if (tools.includes("root")) {
      return [{
        config: pkg,
        dir: cwd,
        name: pkg.name
      }];
    }

    return null;
  }

  const folders = await globby(workspaces, {
    cwd,
    onlyDirectories: true,
    absolute: true,
    expandDirectories: false
  });
  let pkgJsonsMissingNameField = [];
  const results = await Promise.all(folders.sort().filter(dir => fs.existsSync(path.join(dir, "package.json"))).map(async dir => fs.readFile(path.join(dir, "package.json"), "utf8").then(contents => {
    const config = JSON.parse(contents);

    if (!config.name) {
      pkgJsonsMissingNameField.push(path.relative(cwd, path.join(dir, "package.json")));
    }

    return {
      config,
      name: config.name,
      dir
    };
  })));

  if (pkgJsonsMissingNameField.length !== 0) {
    pkgJsonsMissingNameField.sort();
    throw new Error(`The following package.jsons are missing the "name" field:\n${pkgJsonsMissingNameField.join("\n")}`);
  }

  return results;
}

export default getWorkspaces;
