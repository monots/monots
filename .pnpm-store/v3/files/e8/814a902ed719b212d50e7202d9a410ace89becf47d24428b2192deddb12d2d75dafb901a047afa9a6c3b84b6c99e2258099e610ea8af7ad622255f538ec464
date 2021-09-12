import _regeneratorRuntime from '@babel/runtime/regenerator';
import _toConsumableArray from '@babel/runtime/helpers/esm/toConsumableArray';
import _defineProperty from '@babel/runtime/helpers/esm/defineProperty';
import _asyncToGenerator from '@babel/runtime/helpers/esm/asyncToGenerator';
import _slicedToArray from '@babel/runtime/helpers/esm/slicedToArray';
import chalk from 'chalk';
import util from 'util';
import { getPackages } from '@manypkg/get-packages';
import semver__default, { validRange } from 'semver';
import { highest, upperBoundOfRangeAWithinBoundsOfB } from 'sembear';
import validateNpmPackageName from 'validate-npm-package-name';
import parseGithubUrl from 'parse-github-url';
import path from 'path';
import normalizePath from 'normalize-path';
import _classCallCheck from '@babel/runtime/helpers/esm/classCallCheck';
import _possibleConstructorReturn from '@babel/runtime/helpers/esm/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/esm/getPrototypeOf';
import _inherits from '@babel/runtime/helpers/esm/inherits';
import _wrapNativeSuper from '@babel/runtime/helpers/esm/wrapNativeSuper';
import { readFile, writeFile } from 'fs-extra';
import spawn from 'spawndamnit';
import detectIndent from 'detect-indent';
import getPackageJson from 'package-json';
import pLimit from 'p-limit';

function format(args, messageType, scope) {
  var prefix = {
    error: chalk.red("error"),
    success: chalk.green("success"),
    info: chalk.cyan("info")
  }[messageType];
  var fullPrefix = "☔️ " + prefix + (scope === undefined ? "" : " " + scope);
  return fullPrefix + util.format.apply(util, [""].concat(_toConsumableArray(args))).split("\n").join("\n" + fullPrefix + " ");
}
function error(message, scope) {
  console.error(format([message], "error", scope));
}
function success(message, scope) {
  console.log(format([message], "success", scope));
}
function info(message, scope) {
  console.log(format([message], "info", scope));
}

var NORMAL_DEPENDENCY_TYPES = ["dependencies", "devDependencies", "optionalDependencies"];
var DEPENDENCY_TYPES = ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"];
function sortObject(prevObj) {
  var newObj = {};
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = Object.keys(prevObj).sort()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _key = _step.value;
      newObj[_key] = prevObj[_key];
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return newObj;
}
function sortDeps(pkg) {
  for (var _i = 0, _DEPENDENCY_TYPES = DEPENDENCY_TYPES; _i < _DEPENDENCY_TYPES.length; _i++) {
    var depType = _DEPENDENCY_TYPES[_i];
    var prevDeps = pkg.packageJson[depType];

    if (prevDeps) {
      pkg.packageJson[depType] = sortObject(prevDeps);
    }
  }
} // export type Package = Package;

function weakMemoize(func) {
  var cache = new WeakMap(); // @ts-ignore

  return function (arg) {
    if (cache.has(arg)) {
      // $FlowFixMe
      return cache.get(arg);
    }

    var ret = func(arg);
    cache.set(arg, ret);
    return ret;
  };
}

var getHighestExternalRanges = weakMemoize(function getHighestVersions(allPackages) {
  var highestExternalRanges = new Map();
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = allPackages[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _step2$value = _slicedToArray(_step2.value, 2),
          pkgName = _step2$value[0],
          pkg = _step2$value[1];

      for (var _i2 = 0, _NORMAL_DEPENDENCY_TY = NORMAL_DEPENDENCY_TYPES; _i2 < _NORMAL_DEPENDENCY_TY.length; _i2++) {
        var depType = _NORMAL_DEPENDENCY_TY[_i2];
        var deps = pkg.packageJson[depType];

        if (deps) {
          for (var depName in deps) {
            if (!allPackages.has(depName)) {
              if (!validRange(deps[depName])) {
                continue;
              }

              var highestExternalRange = highestExternalRanges.get(depName);

              if (!highestExternalRange || highest([highestExternalRange, deps[depName]]) === deps[depName]) {
                highestExternalRanges.set(depName, deps[depName]);
              }
            }
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
        _iterator2["return"]();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return highestExternalRanges;
});
function versionRangeToRangeType(versionRange) {
  if (versionRange.charAt(0) === "^") return "^";
  if (versionRange.charAt(0) === "~") return "~";
  return "";
}
function isArrayEqual(arrA, arrB) {
  for (var i = 0; i < arrA.length; i++) {
    if (arrA[i] !== arrB[i]) {
      return false;
    }
  }

  return true;
}

function makeCheck(check) {
  return check;
}

var EXTERNAL_MISMATCH = makeCheck({
  validate: function validate(workspace, allWorkspace) {
    var errors = [];
    var highestExternalRanges = getHighestExternalRanges(allWorkspace);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = NORMAL_DEPENDENCY_TYPES[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var depType = _step.value;
        var deps = workspace.packageJson[depType];

        if (deps) {
          for (var depName in deps) {
            var range = deps[depName];
            var highestRange = highestExternalRanges.get(depName);

            if (highestRange !== undefined && highestRange !== range && validRange(range)) {
              errors.push({
                type: "EXTERNAL_MISMATCH",
                workspace: workspace,
                dependencyName: depName,
                dependencyRange: range,
                highestDependencyRange: highestRange
              });
            }
          }
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return errors;
  },
  fix: function fix(error) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = NORMAL_DEPENDENCY_TYPES[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var depType = _step2.value;
        var deps = error.workspace.packageJson[depType];

        if (deps && deps[error.dependencyName]) {
          deps[error.dependencyName] = error.highestDependencyRange;
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
          _iterator2["return"]();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return {
      requiresInstall: true
    };
  },
  print: function print(error) {
    return "".concat(error.workspace.packageJson.name, " has a dependency on ").concat(error.dependencyName, "@").concat(error.dependencyRange, " but the highest range in the repo is ").concat(error.highestDependencyRange, ", the range should be set to ").concat(error.highestDependencyRange);
  },
  type: "all"
});

var INTERNAL_MISMATCH = makeCheck({
  validate: function validate(workspace, allWorkspaces) {
    var errors = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = NORMAL_DEPENDENCY_TYPES[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var depType = _step.value;
        var deps = workspace.packageJson[depType];

        if (deps) {
          for (var depName in deps) {
            var range = deps[depName];
            var dependencyWorkspace = allWorkspaces.get(depName);

            if (dependencyWorkspace !== undefined && !semver__default.satisfies(dependencyWorkspace.packageJson.version, range)) {
              errors.push({
                type: "INTERNAL_MISMATCH",
                workspace: workspace,
                dependencyWorkspace: dependencyWorkspace,
                dependencyRange: range
              });
            }
          }
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return errors;
  },
  fix: function fix(error) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = NORMAL_DEPENDENCY_TYPES[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var depType = _step2.value;
        var deps = error.workspace.packageJson[depType];

        if (deps && deps[error.dependencyWorkspace.packageJson.name]) {
          deps[error.dependencyWorkspace.packageJson.name] = versionRangeToRangeType(deps[error.dependencyWorkspace.packageJson.name]) + error.dependencyWorkspace.packageJson.version;
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
          _iterator2["return"]();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return {
      requiresInstall: true
    };
  },
  print: function print(error) {
    return "".concat(error.workspace.packageJson.name, " has a dependency on ").concat(error.dependencyWorkspace.packageJson.name, "@").concat(error.dependencyRange, " but the version of ").concat(error.dependencyWorkspace.packageJson.name, " in the repo is ").concat(error.dependencyWorkspace.packageJson.version, " which is not within range of the depended on version, please update the dependency version");
  },
  type: "all"
});

var INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP = makeCheck({
  type: "all",
  validate: function validate(workspace, allWorkspaces) {
    var errors = [];
    var peerDeps = workspace.packageJson.peerDependencies;
    var devDeps = workspace.packageJson.devDependencies || {};

    if (peerDeps) {
      for (var depName in peerDeps) {
        if (!devDeps[depName]) {
          var highestRanges = getHighestExternalRanges(allWorkspaces);
          var idealDevVersion = highestRanges.get(depName);
          var isInternalDependency = allWorkspaces.has(depName);

          if (isInternalDependency) {
            idealDevVersion = "*";
          } else if (idealDevVersion === undefined) {
            idealDevVersion = peerDeps[depName];
          }

          errors.push({
            type: "INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP",
            workspace: workspace,
            peerVersion: peerDeps[depName],
            dependencyName: depName,
            devVersion: null,
            idealDevVersion: idealDevVersion
          });
        } else if (semver__default.validRange(devDeps[depName]) && // TODO: we should probably error when a peer dep has an invalid range (in a seperate rule)
        // (also would be good to do a bit more validation instead of just ignoring invalid ranges for normal dep types)
        semver__default.validRange(peerDeps[depName]) && !upperBoundOfRangeAWithinBoundsOfB(devDeps[depName], peerDeps[depName])) {
          var _highestRanges = getHighestExternalRanges(allWorkspaces);

          var _idealDevVersion = _highestRanges.get(depName);

          if (_idealDevVersion === undefined) {
            _idealDevVersion = peerDeps[depName];
          }

          errors.push({
            type: "INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP",
            workspace: workspace,
            dependencyName: depName,
            peerVersion: peerDeps[depName],
            devVersion: devDeps[depName],
            idealDevVersion: _idealDevVersion
          });
        }
      }
    }

    return errors;
  },
  fix: function fix(error) {
    if (!error.workspace.packageJson.devDependencies) {
      error.workspace.packageJson.devDependencies = {};
    }

    error.workspace.packageJson.devDependencies[error.dependencyName] = error.idealDevVersion;
    return {
      requiresInstall: true
    };
  },
  print: function print(error) {
    if (error.devVersion === null) {
      return "".concat(error.workspace.packageJson.name, " has a peerDependency on ").concat(error.dependencyName, " but it is not also specified in devDependencies, please add it there.");
    }

    return "".concat(error.workspace.packageJson.name, " has a peerDependency on ").concat(error.dependencyName, " but the range specified in devDependency is not greater than or equal to the range specified in peerDependencies");
  }
});

var INVALID_PACKAGE_NAME = makeCheck({
  type: "all",
  validate: function validate(workspace) {
    if (!workspace.packageJson.name) {
      return [{
        type: "INVALID_PACKAGE_NAME",
        workspace: workspace,
        errors: ["name cannot be undefined"]
      }];
    }

    var validationErrors = validateNpmPackageName(workspace.packageJson.name);
    var errors = [].concat(_toConsumableArray(validationErrors.errors || []), _toConsumableArray(validationErrors.warnings || []));

    if (errors.length) {
      return [{
        type: "INVALID_PACKAGE_NAME",
        workspace: workspace,
        errors: errors
      }];
    }

    return [];
  },
  print: function print(error) {
    if (!error.workspace.packageJson.name) {
      return "The package at ".concat(JSON.stringify(error.workspace.dir), " does not have a name");
    }

    return "".concat(error.workspace.packageJson.name, " is an invalid package name for the following reasons:\n").concat(error.errors.join("\n"));
  }
});

var MULTIPLE_DEPENDENCY_TYPES = makeCheck({
  validate: function validate(workspace, allWorkspaces) {
    var dependencies = new Set();
    var errors = [];

    if (workspace.packageJson.dependencies) {
      for (var depName in workspace.packageJson.dependencies) {
        dependencies.add(depName);
      }
    }

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = ["devDependencies", "optionalDependencies"][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var depType = _step.value;
        var deps = workspace.packageJson[depType];

        if (deps) {
          for (var _depName in deps) {
            if (dependencies.has(_depName)) {
              errors.push({
                type: "MULTIPLE_DEPENDENCY_TYPES",
                dependencyType: depType,
                dependencyName: _depName,
                workspace: workspace
              });
            }
          }
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return errors;
  },
  type: "all",
  fix: function fix(error) {
    var deps = error.workspace.packageJson[error.dependencyType];

    if (deps) {
      delete deps[error.dependencyName];

      if (Object.keys(deps).length === 0) {
        delete error.workspace.packageJson[error.dependencyType];
      }
    }

    return {
      requiresInstall: true
    };
  },
  print: function print(error) {
    return "".concat(error.workspace.packageJson.name, " has a dependency and a ").concat(error.dependencyType === "devDependencies" ? "devDependency" : "optionalDependency", " on ").concat(error.dependencyName, ", this is unnecessary, it should be removed from ").concat(error.dependencyType);
  }
});

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
var ROOT_HAS_DEV_DEPENDENCIES = makeCheck({
  type: "root",
  validate: function validate(rootWorkspace) {
    if (rootWorkspace.packageJson.devDependencies) {
      return [{
        type: "ROOT_HAS_DEV_DEPENDENCIES",
        workspace: rootWorkspace
      }];
    }

    return [];
  },
  fix: function fix(error) {
    error.workspace.packageJson.dependencies = sortObject(_objectSpread({}, error.workspace.packageJson.devDependencies, {}, error.workspace.packageJson.dependencies));
    delete error.workspace.packageJson.devDependencies;
  },
  print: function print() {
    return "the root package.json contains ".concat(chalk.yellow("devDependencies"), ", this is disallowed as ").concat(chalk.yellow("devDependencies"), " vs ").concat(chalk.green("dependencies"), " in a private package does not affect anything and creates confusion.");
  }
});

var UNSORTED_DEPENDENCIES = makeCheck({
  type: "all",
  validate: function validate(workspace) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = DEPENDENCY_TYPES[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var depType = _step.value;
        var deps = workspace.packageJson[depType];

        if (deps && !isArrayEqual(Object.keys(deps), Object.keys(deps).sort())) {
          return [{
            type: "UNSORTED_DEPENDENCIES",
            workspace: workspace
          }];
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return [];
  },
  fix: function fix(error) {
    sortDeps(error.workspace);
  },
  print: function print(error) {
    return "".concat(error.workspace.packageJson.name, "'s dependencies are unsorted, this can cause large diffs when packages are added, resulting in dependencies being sorted");
  }
});

var INCORRECT_REPOSITORY_FIELD = makeCheck({
  type: "all",
  validate: function validate(workspace, allWorkspaces, rootWorkspace, options) {
    var rootRepositoryField = rootWorkspace.packageJson.repository;

    if (typeof rootRepositoryField === "string") {
      var result = parseGithubUrl(rootRepositoryField);

      if (result !== null && (result.host === "github.com" || result.host === "dev.azure.com")) {
        var baseRepositoryUrl = "";

        if (result.host === "github.com") {
          baseRepositoryUrl = "".concat(result.protocol, "//").concat(result.host, "/").concat(result.owner, "/").concat(result.name);
        } else if (result.host === "dev.azure.com") {
          baseRepositoryUrl = "".concat(result.protocol, "//").concat(result.host, "/").concat(result.owner, "/").concat(result.name, "/_git/").concat(result.filepath);
        }

        if (workspace === rootWorkspace) {
          var correctRepositoryField = baseRepositoryUrl;

          if (rootRepositoryField !== correctRepositoryField) {
            return [{
              type: "INCORRECT_REPOSITORY_FIELD",
              workspace: workspace,
              currentRepositoryField: rootRepositoryField,
              correctRepositoryField: correctRepositoryField
            }];
          }
        } else {
          var _correctRepositoryField = "";

          if (result.host === "github.com") {
            _correctRepositoryField = "".concat(baseRepositoryUrl, "/tree/").concat(options.defaultBranch, "/").concat(normalizePath(path.relative(rootWorkspace.dir, workspace.dir)));
          } else if (result.host === "dev.azure.com") {
            _correctRepositoryField = "".concat(baseRepositoryUrl, "?path=").concat(normalizePath(path.relative(rootWorkspace.dir, workspace.dir)), "&version=GB").concat(options.defaultBranch, "&_a=contents");
          }

          var currentRepositoryField = workspace.packageJson.repository;

          if (_correctRepositoryField !== currentRepositoryField) {
            return [{
              type: "INCORRECT_REPOSITORY_FIELD",
              workspace: workspace,
              currentRepositoryField: currentRepositoryField,
              correctRepositoryField: _correctRepositoryField
            }];
          }
        }
      }
    }

    return [];
  },
  fix: function fix(error) {
    error.workspace.packageJson.repository = error.correctRepositoryField;
  },
  print: function print(error) {
    if (error.currentRepositoryField === undefined) {
      return "".concat(error.workspace.packageJson.name, " does not have a repository field when it should be ").concat(JSON.stringify(error.correctRepositoryField));
    }

    return "".concat(error.workspace.packageJson.name, " has a repository field of ").concat(JSON.stringify(error.currentRepositoryField), " when it should be ").concat(JSON.stringify(error.correctRepositoryField));
  }
});

var checks = {
  EXTERNAL_MISMATCH: EXTERNAL_MISMATCH,
  INTERNAL_MISMATCH: INTERNAL_MISMATCH,
  INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP: INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP,
  INVALID_PACKAGE_NAME: INVALID_PACKAGE_NAME,
  MULTIPLE_DEPENDENCY_TYPES: MULTIPLE_DEPENDENCY_TYPES,
  ROOT_HAS_DEV_DEPENDENCIES: ROOT_HAS_DEV_DEPENDENCIES,
  UNSORTED_DEPENDENCIES: UNSORTED_DEPENDENCIES,
  INCORRECT_REPOSITORY_FIELD: INCORRECT_REPOSITORY_FIELD
};

var ExitError =
/*#__PURE__*/
function (_Error) {
  _inherits(ExitError, _Error);

  function ExitError(code) {
    var _this;

    _classCallCheck(this, ExitError);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ExitError).call(this, "The process should exit with code ".concat(code)));
    _this.code = code;
    return _this;
  }

  return ExitError;
}(_wrapNativeSuper(Error));

function writePackage(_x) {
  return _writePackage.apply(this, arguments);
}

function _writePackage() {
  _writePackage = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(pkg) {
    var pkgRaw, indent;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return readFile(path.join(pkg.dir, "package.json"), "utf-8");

          case 2:
            pkgRaw = _context.sent;
            indent = detectIndent(pkgRaw).indent || "  ";
            return _context.abrupt("return", writeFile(path.join(pkg.dir, "package.json"), JSON.stringify(pkg.packageJson, null, indent) + (pkgRaw.endsWith("\n") ? "\n" : "")));

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _writePackage.apply(this, arguments);
}

function install(_x2, _x3) {
  return _install.apply(this, arguments);
}

function _install() {
  _install = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee2(tool, cwd) {
    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return spawn({
              yarn: "yarn",
              pnpm: "pnpm",
              lerna: "lerna",
              root: "yarn",
              bolt: "bolt"
            }[tool], tool === "pnpm" ? ["install"] : tool === "lerna" ? ["bootstrap", "--since", "HEAD"] : [], {
              cwd: cwd,
              stdio: "inherit"
            });

          case 2:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _install.apply(this, arguments);
}

function runCmd(_x, _x2) {
  return _runCmd.apply(this, arguments);
}

function _runCmd() {
  _runCmd = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(args, cwd) {
    var _ref, packages, root, exactMatchingPackage, _ref2, code, matchingPackages, _ref3, _code;

    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return getPackages(cwd);

          case 2:
            _ref = _context.sent;
            packages = _ref.packages;
            root = _ref.root;
            exactMatchingPackage = packages.find(function (pkg) {
              return pkg.packageJson.name === args[0] || path.relative(root.dir, pkg.dir) === args[0];
            });

            if (!exactMatchingPackage) {
              _context.next = 12;
              break;
            }

            _context.next = 9;
            return spawn("yarn", args.slice(1), {
              cwd: exactMatchingPackage.dir,
              stdio: "inherit"
            });

          case 9:
            _ref2 = _context.sent;
            code = _ref2.code;
            throw new ExitError(code);

          case 12:
            matchingPackages = packages.filter(function (pkg) {
              return pkg.packageJson.name.includes(args[0]) || path.relative(root.dir, pkg.dir).includes(args[0]);
            });

            if (!(matchingPackages.length > 1)) {
              _context.next = 18;
              break;
            }

            error("an identifier must only match a single package but \"".concat(args[0], "\" matches the following packages: \n").concat(matchingPackages.map(function (x) {
              return x.packageJson.name;
            }).join("\n")));
            throw new ExitError(1);

          case 18:
            if (!(matchingPackages.length === 0)) {
              _context.next = 23;
              break;
            }

            error("No matching packages found");
            throw new ExitError(1);

          case 23:
            _context.next = 25;
            return spawn("yarn", args.slice(1), {
              cwd: matchingPackages[0].dir,
              stdio: "inherit"
            });

          case 25:
            _ref3 = _context.sent;
            _code = _ref3.code;
            throw new ExitError(_code);

          case 28:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _runCmd.apply(this, arguments);
}

function upgradeDependency(_x) {
  return _upgradeDependency.apply(this, arguments);
}

function _upgradeDependency() {
  _upgradeDependency = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee3(_ref) {
    var _ref2, name, _ref2$, tag, _ref4, packages, tool, root, isScope, newVersion, packagesToUpdate, filteredPackages, rootRequiresUpdate, newVersions;

    return _regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _ref2 = _slicedToArray(_ref, 2), name = _ref2[0], _ref2$ = _ref2[1], tag = _ref2$ === void 0 ? "latest" : _ref2$;
            _context3.next = 3;
            return getPackages(process.cwd());

          case 3:
            _ref4 = _context3.sent;
            packages = _ref4.packages;
            tool = _ref4.tool;
            root = _ref4.root;
            isScope = name.startsWith("@") && !name.includes("/");
            newVersion = semver__default.validRange(tag) ? tag : null;
            packagesToUpdate = new Set();
            filteredPackages = packages.filter(function (_ref5) {
              var packageJson = _ref5.packageJson;
              var requiresUpdate = false;
              DEPENDENCY_TYPES.forEach(function (t) {
                var deps = packageJson[t];
                if (!deps) return;
                var packageNames = Object.keys(deps);
                packageNames.forEach(function (pkgName) {
                  if (isScope && pkgName.startsWith(name) || pkgName === name) {
                    requiresUpdate = true;
                    packagesToUpdate.add(pkgName);
                  }
                });
              });
              return requiresUpdate;
            });
            rootRequiresUpdate = false;
            DEPENDENCY_TYPES.forEach(function (t) {
              var deps = root.packageJson[t];
              if (!deps) return;
              var packageNames = Object.keys(deps);
              packageNames.forEach(function (pkgName) {
                if (isScope && pkgName.startsWith(name) || pkgName === name) {
                  rootRequiresUpdate = true;
                  packagesToUpdate.add(pkgName);
                }
              });

              if (rootRequiresUpdate) {
                filteredPackages.push(root);
              }
            });
            _context3.next = 15;
            return Promise.all(_toConsumableArray(packagesToUpdate).map(
            /*#__PURE__*/
            function () {
              var _ref6 = _asyncToGenerator(
              /*#__PURE__*/
              _regeneratorRuntime.mark(function _callee2(pkgName) {
                var info, distTags, version;
                return _regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        if (newVersion) {
                          _context2.next = 9;
                          break;
                        }

                        _context2.next = 3;
                        return getPackageInfo(pkgName);

                      case 3:
                        info = _context2.sent;
                        distTags = info["dist-tags"];
                        version = distTags[tag];
                        return _context2.abrupt("return", {
                          pkgName: pkgName,
                          version: version
                        });

                      case 9:
                        return _context2.abrupt("return", {
                          pkgName: pkgName,
                          version: newVersion
                        });

                      case 10:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2);
              }));

              return function (_x2) {
                return _ref6.apply(this, arguments);
              };
            }()));

          case 15:
            newVersions = _context3.sent;
            filteredPackages.forEach(function (_ref7) {
              var packageJson = _ref7.packageJson;
              DEPENDENCY_TYPES.forEach(function (t) {
                var deps = packageJson[t];

                if (deps) {
                  newVersions.forEach(function (_ref8) {
                    var pkgName = _ref8.pkgName,
                        version = _ref8.version;

                    if (deps[pkgName] && version) {
                      if (!newVersion) {
                        deps[pkgName] = "".concat(versionRangeToRangeType(deps[pkgName])).concat(version);
                      } else {
                        deps[pkgName] = version;
                      }
                    }
                  });
                }
              });
            });
            _context3.next = 19;
            return Promise.all(_toConsumableArray(filteredPackages).map(writePackage));

          case 19:
            _context3.next = 21;
            return install(tool, root.dir);

          case 21:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _upgradeDependency.apply(this, arguments);
}

var npmRequestLimit = pLimit(40);
function getPackageInfo(pkgName) {
  return npmRequestLimit(
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee() {
    var result;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return getPackageJson(pkgName, {
              allVersions: true
            });

          case 2:
            result = _context.sent;
            return _context.abrupt("return", result);

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  })));
}

var npmLimit = pLimit(40);

function getCorrectRegistry() {
  var registry = process.env.npm_config_registry === "https://registry.yarnpkg.com" ? undefined : process.env.npm_config_registry;
  return registry;
}

function tagApackage(_x, _x2, _x3) {
  return _tagApackage.apply(this, arguments);
}

function _tagApackage() {
  _tagApackage = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(packageJson, tag, otpCode) {
    var envOverride, flags;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // Due to a super annoying issue in yarn, we have to manually override this env variable
            // See: https://github.com/yarnpkg/yarn/issues/2935#issuecomment-355292633
            envOverride = {
              npm_config_registry: getCorrectRegistry()
            };
            flags = [];

            if (otpCode) {
              flags.push("--otp", otpCode);
            }

            _context.next = 5;
            return spawn("npm", ["dist-tag", "add", "".concat(packageJson.name, "@").concat(packageJson.version), tag].concat(flags), {
              stdio: "inherit",
              env: Object.assign({}, process.env, envOverride)
            });

          case 5:
            return _context.abrupt("return", _context.sent);

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _tagApackage.apply(this, arguments);
}

function npmTagAll(_x4) {
  return _npmTagAll.apply(this, arguments);
}

function _npmTagAll() {
  _npmTagAll = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee2(_ref) {
    var _ref2, tag, _, otp, _ref3, packages;

    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _ref2 = _slicedToArray(_ref, 3), tag = _ref2[0], _ = _ref2[1], otp = _ref2[2];
            _context2.next = 3;
            return getPackages(process.cwd());

          case 3:
            _ref3 = _context2.sent;
            packages = _ref3.packages;
            _context2.next = 7;
            return Promise.all(packages.filter(function (_ref4) {
              var packageJson = _ref4.packageJson;
              return packageJson["private"] !== true;
            }).map(function (_ref5) {
              var packageJson = _ref5.packageJson;
              return npmLimit(function () {
                return tagApackage(packageJson, tag, otp);
              });
            }));

          case 7:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _npmTagAll.apply(this, arguments);
}

function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$1(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$1(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
var defaultOptions = {
  defaultBranch: "master"
};

var runChecks = function runChecks(allWorkspaces, rootWorkspace, shouldFix, options) {
  var hasErrored = false;
  var requiresInstall = false;
  var ignoredRules = new Set(rootWorkspace.packageJson.manypkg && rootWorkspace.packageJson.manypkg.ignoredRules || []);

  for (var _i = 0, _Object$entries = Object.entries(checks); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        ruleName = _Object$entries$_i[0],
        check = _Object$entries$_i[1];

    if (ignoredRules.has(ruleName)) {
      continue;
    }

    if (check.type === "all") {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = allWorkspaces[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = _slicedToArray(_step.value, 2),
              workspace = _step$value[1];

          var errors = check.validate(workspace, allWorkspaces, rootWorkspace, options);

          if (shouldFix && check.fix !== undefined) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = errors[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var error$1 = _step2.value;
                var output = check.fix(error$1, options) || {
                  requiresInstall: false
                };

                if (output.requiresInstall) {
                  requiresInstall = true;
                }
              }
            } catch (err) {
              _didIteratorError2 = true;
              _iteratorError2 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                  _iterator2["return"]();
                }
              } finally {
                if (_didIteratorError2) {
                  throw _iteratorError2;
                }
              }
            }
          } else {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
              for (var _iterator3 = errors[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var _error = _step3.value;
                hasErrored = true;
                error(check.print(_error, options));
              }
            } catch (err) {
              _didIteratorError3 = true;
              _iteratorError3 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
                  _iterator3["return"]();
                }
              } finally {
                if (_didIteratorError3) {
                  throw _iteratorError3;
                }
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }

    if (check.type === "root") {
      var _errors = check.validate(rootWorkspace, allWorkspaces, rootWorkspace, options);

      if (shouldFix && check.fix !== undefined) {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = _errors[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _error2 = _step4.value;

            var _output = check.fix(_error2, options) || {
              requiresInstall: false
            };

            if (_output.requiresInstall) {
              requiresInstall = true;
            }
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
              _iterator4["return"]();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      } else {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = _errors[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var _error3 = _step5.value;
            hasErrored = true;
            error(check.print(_error3, options));
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
              _iterator5["return"]();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }
      }
    }
  }

  return {
    requiresInstall: requiresInstall,
    hasErrored: hasErrored
  };
};

var execLimit = pLimit(4);

function execCmd(_x) {
  return _execCmd.apply(this, arguments);
}

function _execCmd() {
  _execCmd = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee4(args) {
    var _ref6, packages, highestExitCode;

    return _regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return getPackages(process.cwd());

          case 2:
            _ref6 = _context4.sent;
            packages = _ref6.packages;
            highestExitCode = 0;
            _context4.next = 7;
            return Promise.all(packages.map(function (pkg) {
              return execLimit(
              /*#__PURE__*/
              _asyncToGenerator(
              /*#__PURE__*/
              _regeneratorRuntime.mark(function _callee3() {
                var _ref8, code;

                return _regeneratorRuntime.wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        _context3.next = 2;
                        return spawn(args[0], args.slice(1), {
                          cwd: pkg.dir,
                          stdio: "inherit"
                        });

                      case 2:
                        _ref8 = _context3.sent;
                        code = _ref8.code;
                        highestExitCode = Math.max(code, highestExitCode);

                      case 5:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3);
              })));
            }));

          case 7:
            throw new ExitError(highestExitCode);

          case 8:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _execCmd.apply(this, arguments);
}

_asyncToGenerator(
/*#__PURE__*/
_regeneratorRuntime.mark(function _callee2() {
  var things, shouldFix, _ref2, packages, root, tool, options, packagesByName, _runChecks, hasErrored, requiresInstall;

  return _regeneratorRuntime.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          things = process.argv.slice(2);

          if (!(things[0] === "exec")) {
            _context2.next = 3;
            break;
          }

          return _context2.abrupt("return", execCmd(things.slice(1)));

        case 3:
          if (!(things[0] === "run")) {
            _context2.next = 5;
            break;
          }

          return _context2.abrupt("return", runCmd(things.slice(1), process.cwd()));

        case 5:
          if (!(things[0] === "upgrade")) {
            _context2.next = 7;
            break;
          }

          return _context2.abrupt("return", upgradeDependency(things.slice(1)));

        case 7:
          if (!(things[0] === "npm-tag")) {
            _context2.next = 9;
            break;
          }

          return _context2.abrupt("return", npmTagAll(things.slice(1)));

        case 9:
          if (!(things[0] !== "check" && things[0] !== "fix")) {
            _context2.next = 12;
            break;
          }

          error("command ".concat(things[0], " not found, only check, exec, run, upgrade, npm-tag and fix exist"));
          throw new ExitError(1);

        case 12:
          shouldFix = things[0] === "fix";
          _context2.next = 15;
          return getPackages(process.cwd());

        case 15:
          _ref2 = _context2.sent;
          packages = _ref2.packages;
          root = _ref2.root;
          tool = _ref2.tool;
          options = _objectSpread$1({}, defaultOptions, {}, root.packageJson.manypkg);
          packagesByName = new Map(packages.map(function (x) {
            return [x.packageJson.name, x];
          }));
          packagesByName.set(root.packageJson.name, root);
          _runChecks = runChecks(packagesByName, root, shouldFix, options), hasErrored = _runChecks.hasErrored, requiresInstall = _runChecks.requiresInstall;

          if (!shouldFix) {
            _context2.next = 32;
            break;
          }

          _context2.next = 26;
          return Promise.all(_toConsumableArray(packagesByName).map(
          /*#__PURE__*/
          function () {
            var _ref4 = _asyncToGenerator(
            /*#__PURE__*/
            _regeneratorRuntime.mark(function _callee(_ref3) {
              var _ref5, pkgName, workspace;

              return _regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      _ref5 = _slicedToArray(_ref3, 2), pkgName = _ref5[0], workspace = _ref5[1];
                      writePackage(workspace);

                    case 2:
                    case "end":
                      return _context.stop();
                  }
                }
              }, _callee);
            }));

            return function (_x2) {
              return _ref4.apply(this, arguments);
            };
          }()));

        case 26:
          if (!requiresInstall) {
            _context2.next = 29;
            break;
          }

          _context2.next = 29;
          return install(tool, root.dir);

        case 29:
          success("fixed workspaces!");
          _context2.next = 38;
          break;

        case 32:
          if (!hasErrored) {
            _context2.next = 37;
            break;
          }

          info("the above errors may be fixable with yarn manypkg fix");
          throw new ExitError(1);

        case 37:
          success("workspaces valid!");

        case 38:
        case "end":
          return _context2.stop();
      }
    }
  }, _callee2);
}))()["catch"](function (err) {
  if (err instanceof ExitError) {
    process.exit(err.code);
  } else {
    error(err);
    process.exit(1);
  }
});
