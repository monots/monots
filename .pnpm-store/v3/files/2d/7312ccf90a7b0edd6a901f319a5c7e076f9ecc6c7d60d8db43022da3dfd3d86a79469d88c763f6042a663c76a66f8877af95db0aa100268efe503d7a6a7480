"use strict";

function _interopDefault(ex) {
  return ex && "object" == typeof ex && "default" in ex ? ex.default : ex;
}

var _regeneratorRuntime = _interopDefault(require("@babel/runtime/regenerator")), _toConsumableArray = _interopDefault(require("@babel/runtime/helpers/toConsumableArray")), _defineProperty = _interopDefault(require("@babel/runtime/helpers/defineProperty")), _asyncToGenerator = _interopDefault(require("@babel/runtime/helpers/asyncToGenerator")), _slicedToArray = _interopDefault(require("@babel/runtime/helpers/slicedToArray")), chalk = _interopDefault(require("chalk")), util = _interopDefault(require("util")), getPackages = require("@manypkg/get-packages"), semver = require("semver"), semver__default = _interopDefault(semver), sembear = require("sembear"), validateNpmPackageName = _interopDefault(require("validate-npm-package-name")), parseGithubUrl = _interopDefault(require("parse-github-url")), path = _interopDefault(require("path")), normalizePath = _interopDefault(require("normalize-path")), _classCallCheck = _interopDefault(require("@babel/runtime/helpers/classCallCheck")), _possibleConstructorReturn = _interopDefault(require("@babel/runtime/helpers/possibleConstructorReturn")), _getPrototypeOf = _interopDefault(require("@babel/runtime/helpers/getPrototypeOf")), _inherits = _interopDefault(require("@babel/runtime/helpers/inherits")), _wrapNativeSuper = _interopDefault(require("@babel/runtime/helpers/wrapNativeSuper")), fs = require("fs-extra"), spawn = _interopDefault(require("spawndamnit")), detectIndent = _interopDefault(require("detect-indent")), getPackageJson = _interopDefault(require("package-json")), pLimit = _interopDefault(require("p-limit"));

function format(args, messageType, scope) {
  var fullPrefix = "☔️ " + {
    error: chalk.red("error"),
    success: chalk.green("success"),
    info: chalk.cyan("info")
  }[messageType] + (void 0 === scope ? "" : " " + scope);
  return fullPrefix + util.format.apply(util, [ "" ].concat(_toConsumableArray(args))).split("\n").join("\n" + fullPrefix + " ");
}

function error(message, scope) {
  console.error(format([ message ], "error", scope));
}

function success(message, scope) {
  console.log(format([ message ], "success", scope));
}

function info(message, scope) {
  console.log(format([ message ], "info", scope));
}

var NORMAL_DEPENDENCY_TYPES = [ "dependencies", "devDependencies", "optionalDependencies" ], DEPENDENCY_TYPES = [ "dependencies", "devDependencies", "optionalDependencies", "peerDependencies" ];

function sortObject(prevObj) {
  var newObj = {}, _iteratorNormalCompletion = !0, _didIteratorError = !1, _iteratorError = void 0;
  try {
    for (var _step, _iterator = Object.keys(prevObj).sort()[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = !0) {
      var _key = _step.value;
      newObj[_key] = prevObj[_key];
    }
  } catch (err) {
    _didIteratorError = !0, _iteratorError = err;
  } finally {
    try {
      _iteratorNormalCompletion || null == _iterator.return || _iterator.return();
    } finally {
      if (_didIteratorError) throw _iteratorError;
    }
  }
  return newObj;
}

function sortDeps(pkg) {
  for (var _i = 0, _DEPENDENCY_TYPES = DEPENDENCY_TYPES; _i < _DEPENDENCY_TYPES.length; _i++) {
    var depType = _DEPENDENCY_TYPES[_i], prevDeps = pkg.packageJson[depType];
    prevDeps && (pkg.packageJson[depType] = sortObject(prevDeps));
  }
}

function weakMemoize(func) {
  var cache = new WeakMap();
  return function(arg) {
    if (cache.has(arg)) return cache.get(arg);
    var ret = func(arg);
    return cache.set(arg, ret), ret;
  };
}

var getHighestExternalRanges = weakMemoize(function(allPackages) {
  var highestExternalRanges = new Map(), _iteratorNormalCompletion2 = !0, _didIteratorError2 = !1, _iteratorError2 = void 0;
  try {
    for (var _step2, _iterator2 = allPackages[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = !0) for (var _step2$value = _slicedToArray(_step2.value, 2), pkg = (_step2$value[0], 
    _step2$value[1]), _i2 = 0, _NORMAL_DEPENDENCY_TY = NORMAL_DEPENDENCY_TYPES; _i2 < _NORMAL_DEPENDENCY_TY.length; _i2++) {
      var depType = _NORMAL_DEPENDENCY_TY[_i2], deps = pkg.packageJson[depType];
      if (deps) for (var depName in deps) if (!allPackages.has(depName)) {
        if (!semver.validRange(deps[depName])) continue;
        var highestExternalRange = highestExternalRanges.get(depName);
        highestExternalRange && sembear.highest([ highestExternalRange, deps[depName] ]) !== deps[depName] || highestExternalRanges.set(depName, deps[depName]);
      }
    }
  } catch (err) {
    _didIteratorError2 = !0, _iteratorError2 = err;
  } finally {
    try {
      _iteratorNormalCompletion2 || null == _iterator2.return || _iterator2.return();
    } finally {
      if (_didIteratorError2) throw _iteratorError2;
    }
  }
  return highestExternalRanges;
});

function versionRangeToRangeType(versionRange) {
  return "^" === versionRange.charAt(0) ? "^" : "~" === versionRange.charAt(0) ? "~" : "";
}

function isArrayEqual(arrA, arrB) {
  for (var i = 0; i < arrA.length; i++) if (arrA[i] !== arrB[i]) return !1;
  return !0;
}

function makeCheck(check) {
  return check;
}

var EXTERNAL_MISMATCH = makeCheck({
  validate: function(workspace, allWorkspace) {
    var errors = [], highestExternalRanges = getHighestExternalRanges(allWorkspace), _iteratorNormalCompletion = !0, _didIteratorError = !1, _iteratorError = void 0;
    try {
      for (var _step, _iterator = NORMAL_DEPENDENCY_TYPES[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = !0) {
        var depType = _step.value, deps = workspace.packageJson[depType];
        if (deps) for (var depName in deps) {
          var range = deps[depName], highestRange = highestExternalRanges.get(depName);
          void 0 !== highestRange && highestRange !== range && semver.validRange(range) && errors.push({
            type: "EXTERNAL_MISMATCH",
            workspace: workspace,
            dependencyName: depName,
            dependencyRange: range,
            highestDependencyRange: highestRange
          });
        }
      }
    } catch (err) {
      _didIteratorError = !0, _iteratorError = err;
    } finally {
      try {
        _iteratorNormalCompletion || null == _iterator.return || _iterator.return();
      } finally {
        if (_didIteratorError) throw _iteratorError;
      }
    }
    return errors;
  },
  fix: function(error) {
    var _iteratorNormalCompletion2 = !0, _didIteratorError2 = !1, _iteratorError2 = void 0;
    try {
      for (var _step2, _iterator2 = NORMAL_DEPENDENCY_TYPES[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = !0) {
        var depType = _step2.value, deps = error.workspace.packageJson[depType];
        deps && deps[error.dependencyName] && (deps[error.dependencyName] = error.highestDependencyRange);
      }
    } catch (err) {
      _didIteratorError2 = !0, _iteratorError2 = err;
    } finally {
      try {
        _iteratorNormalCompletion2 || null == _iterator2.return || _iterator2.return();
      } finally {
        if (_didIteratorError2) throw _iteratorError2;
      }
    }
    return {
      requiresInstall: !0
    };
  },
  print: function(error) {
    return "".concat(error.workspace.packageJson.name, " has a dependency on ").concat(error.dependencyName, "@").concat(error.dependencyRange, " but the highest range in the repo is ").concat(error.highestDependencyRange, ", the range should be set to ").concat(error.highestDependencyRange);
  },
  type: "all"
}), INTERNAL_MISMATCH = makeCheck({
  validate: function(workspace, allWorkspaces) {
    var errors = [], _iteratorNormalCompletion = !0, _didIteratorError = !1, _iteratorError = void 0;
    try {
      for (var _step, _iterator = NORMAL_DEPENDENCY_TYPES[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = !0) {
        var depType = _step.value, deps = workspace.packageJson[depType];
        if (deps) for (var depName in deps) {
          var range = deps[depName], dependencyWorkspace = allWorkspaces.get(depName);
          void 0 === dependencyWorkspace || semver__default.satisfies(dependencyWorkspace.packageJson.version, range) || errors.push({
            type: "INTERNAL_MISMATCH",
            workspace: workspace,
            dependencyWorkspace: dependencyWorkspace,
            dependencyRange: range
          });
        }
      }
    } catch (err) {
      _didIteratorError = !0, _iteratorError = err;
    } finally {
      try {
        _iteratorNormalCompletion || null == _iterator.return || _iterator.return();
      } finally {
        if (_didIteratorError) throw _iteratorError;
      }
    }
    return errors;
  },
  fix: function(error) {
    var _iteratorNormalCompletion2 = !0, _didIteratorError2 = !1, _iteratorError2 = void 0;
    try {
      for (var _step2, _iterator2 = NORMAL_DEPENDENCY_TYPES[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = !0) {
        var depType = _step2.value, deps = error.workspace.packageJson[depType];
        deps && deps[error.dependencyWorkspace.packageJson.name] && (deps[error.dependencyWorkspace.packageJson.name] = versionRangeToRangeType(deps[error.dependencyWorkspace.packageJson.name]) + error.dependencyWorkspace.packageJson.version);
      }
    } catch (err) {
      _didIteratorError2 = !0, _iteratorError2 = err;
    } finally {
      try {
        _iteratorNormalCompletion2 || null == _iterator2.return || _iterator2.return();
      } finally {
        if (_didIteratorError2) throw _iteratorError2;
      }
    }
    return {
      requiresInstall: !0
    };
  },
  print: function(error) {
    return "".concat(error.workspace.packageJson.name, " has a dependency on ").concat(error.dependencyWorkspace.packageJson.name, "@").concat(error.dependencyRange, " but the version of ").concat(error.dependencyWorkspace.packageJson.name, " in the repo is ").concat(error.dependencyWorkspace.packageJson.version, " which is not within range of the depended on version, please update the dependency version");
  },
  type: "all"
}), INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP = makeCheck({
  type: "all",
  validate: function(workspace, allWorkspaces) {
    var errors = [], peerDeps = workspace.packageJson.peerDependencies, devDeps = workspace.packageJson.devDependencies || {};
    if (peerDeps) for (var depName in peerDeps) if (devDeps[depName]) {
      if (semver__default.validRange(devDeps[depName]) && semver__default.validRange(peerDeps[depName]) && !sembear.upperBoundOfRangeAWithinBoundsOfB(devDeps[depName], peerDeps[depName])) {
        var _idealDevVersion = getHighestExternalRanges(allWorkspaces).get(depName);
        void 0 === _idealDevVersion && (_idealDevVersion = peerDeps[depName]), errors.push({
          type: "INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP",
          workspace: workspace,
          dependencyName: depName,
          peerVersion: peerDeps[depName],
          devVersion: devDeps[depName],
          idealDevVersion: _idealDevVersion
        });
      }
    } else {
      var idealDevVersion = getHighestExternalRanges(allWorkspaces).get(depName);
      allWorkspaces.has(depName) ? idealDevVersion = "*" : void 0 === idealDevVersion && (idealDevVersion = peerDeps[depName]), 
      errors.push({
        type: "INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP",
        workspace: workspace,
        peerVersion: peerDeps[depName],
        dependencyName: depName,
        devVersion: null,
        idealDevVersion: idealDevVersion
      });
    }
    return errors;
  },
  fix: function(error) {
    return error.workspace.packageJson.devDependencies || (error.workspace.packageJson.devDependencies = {}), 
    error.workspace.packageJson.devDependencies[error.dependencyName] = error.idealDevVersion, 
    {
      requiresInstall: !0
    };
  },
  print: function(error) {
    return null === error.devVersion ? "".concat(error.workspace.packageJson.name, " has a peerDependency on ").concat(error.dependencyName, " but it is not also specified in devDependencies, please add it there.") : "".concat(error.workspace.packageJson.name, " has a peerDependency on ").concat(error.dependencyName, " but the range specified in devDependency is not greater than or equal to the range specified in peerDependencies");
  }
}), INVALID_PACKAGE_NAME = makeCheck({
  type: "all",
  validate: function(workspace) {
    if (!workspace.packageJson.name) return [ {
      type: "INVALID_PACKAGE_NAME",
      workspace: workspace,
      errors: [ "name cannot be undefined" ]
    } ];
    var validationErrors = validateNpmPackageName(workspace.packageJson.name), errors = [].concat(_toConsumableArray(validationErrors.errors || []), _toConsumableArray(validationErrors.warnings || []));
    return errors.length ? [ {
      type: "INVALID_PACKAGE_NAME",
      workspace: workspace,
      errors: errors
    } ] : [];
  },
  print: function(error) {
    return error.workspace.packageJson.name ? "".concat(error.workspace.packageJson.name, " is an invalid package name for the following reasons:\n").concat(error.errors.join("\n")) : "The package at ".concat(JSON.stringify(error.workspace.dir), " does not have a name");
  }
}), MULTIPLE_DEPENDENCY_TYPES = makeCheck({
  validate: function(workspace, allWorkspaces) {
    var dependencies = new Set(), errors = [];
    if (workspace.packageJson.dependencies) for (var depName in workspace.packageJson.dependencies) dependencies.add(depName);
    var _iteratorNormalCompletion = !0, _didIteratorError = !1, _iteratorError = void 0;
    try {
      for (var _step, _iterator = [ "devDependencies", "optionalDependencies" ][Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = !0) {
        var depType = _step.value, deps = workspace.packageJson[depType];
        if (deps) for (var _depName in deps) dependencies.has(_depName) && errors.push({
          type: "MULTIPLE_DEPENDENCY_TYPES",
          dependencyType: depType,
          dependencyName: _depName,
          workspace: workspace
        });
      }
    } catch (err) {
      _didIteratorError = !0, _iteratorError = err;
    } finally {
      try {
        _iteratorNormalCompletion || null == _iterator.return || _iterator.return();
      } finally {
        if (_didIteratorError) throw _iteratorError;
      }
    }
    return errors;
  },
  type: "all",
  fix: function(error) {
    var deps = error.workspace.packageJson[error.dependencyType];
    return deps && (delete deps[error.dependencyName], 0 === Object.keys(deps).length && delete error.workspace.packageJson[error.dependencyType]), 
    {
      requiresInstall: !0
    };
  },
  print: function(error) {
    return "".concat(error.workspace.packageJson.name, " has a dependency and a ").concat("devDependencies" === error.dependencyType ? "devDependency" : "optionalDependency", " on ").concat(error.dependencyName, ", this is unnecessary, it should be removed from ").concat(error.dependencyType);
  }
});

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(source, !0).forEach(function(key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(source).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}

var ROOT_HAS_DEV_DEPENDENCIES = makeCheck({
  type: "root",
  validate: function(rootWorkspace) {
    return rootWorkspace.packageJson.devDependencies ? [ {
      type: "ROOT_HAS_DEV_DEPENDENCIES",
      workspace: rootWorkspace
    } ] : [];
  },
  fix: function(error) {
    error.workspace.packageJson.dependencies = sortObject(_objectSpread({}, error.workspace.packageJson.devDependencies, {}, error.workspace.packageJson.dependencies)), 
    delete error.workspace.packageJson.devDependencies;
  },
  print: function() {
    return "the root package.json contains ".concat(chalk.yellow("devDependencies"), ", this is disallowed as ").concat(chalk.yellow("devDependencies"), " vs ").concat(chalk.green("dependencies"), " in a private package does not affect anything and creates confusion.");
  }
}), UNSORTED_DEPENDENCIES = makeCheck({
  type: "all",
  validate: function(workspace) {
    var _iteratorNormalCompletion = !0, _didIteratorError = !1, _iteratorError = void 0;
    try {
      for (var _step, _iterator = DEPENDENCY_TYPES[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = !0) {
        var depType = _step.value, deps = workspace.packageJson[depType];
        if (deps && !isArrayEqual(Object.keys(deps), Object.keys(deps).sort())) return [ {
          type: "UNSORTED_DEPENDENCIES",
          workspace: workspace
        } ];
      }
    } catch (err) {
      _didIteratorError = !0, _iteratorError = err;
    } finally {
      try {
        _iteratorNormalCompletion || null == _iterator.return || _iterator.return();
      } finally {
        if (_didIteratorError) throw _iteratorError;
      }
    }
    return [];
  },
  fix: function(error) {
    sortDeps(error.workspace);
  },
  print: function(error) {
    return "".concat(error.workspace.packageJson.name, "'s dependencies are unsorted, this can cause large diffs when packages are added, resulting in dependencies being sorted");
  }
}), INCORRECT_REPOSITORY_FIELD = makeCheck({
  type: "all",
  validate: function(workspace, allWorkspaces, rootWorkspace, options) {
    var rootRepositoryField = rootWorkspace.packageJson.repository;
    if ("string" == typeof rootRepositoryField) {
      var result = parseGithubUrl(rootRepositoryField);
      if (null !== result && ("github.com" === result.host || "dev.azure.com" === result.host)) {
        var baseRepositoryUrl = "";
        if ("github.com" === result.host ? baseRepositoryUrl = "".concat(result.protocol, "//").concat(result.host, "/").concat(result.owner, "/").concat(result.name) : "dev.azure.com" === result.host && (baseRepositoryUrl = "".concat(result.protocol, "//").concat(result.host, "/").concat(result.owner, "/").concat(result.name, "/_git/").concat(result.filepath)), 
        workspace === rootWorkspace) {
          if (rootRepositoryField !== baseRepositoryUrl) return [ {
            type: "INCORRECT_REPOSITORY_FIELD",
            workspace: workspace,
            currentRepositoryField: rootRepositoryField,
            correctRepositoryField: baseRepositoryUrl
          } ];
        } else {
          var _correctRepositoryField = "";
          "github.com" === result.host ? _correctRepositoryField = "".concat(baseRepositoryUrl, "/tree/").concat(options.defaultBranch, "/").concat(normalizePath(path.relative(rootWorkspace.dir, workspace.dir))) : "dev.azure.com" === result.host && (_correctRepositoryField = "".concat(baseRepositoryUrl, "?path=").concat(normalizePath(path.relative(rootWorkspace.dir, workspace.dir)), "&version=GB").concat(options.defaultBranch, "&_a=contents"));
          var currentRepositoryField = workspace.packageJson.repository;
          if (_correctRepositoryField !== currentRepositoryField) return [ {
            type: "INCORRECT_REPOSITORY_FIELD",
            workspace: workspace,
            currentRepositoryField: currentRepositoryField,
            correctRepositoryField: _correctRepositoryField
          } ];
        }
      }
    }
    return [];
  },
  fix: function(error) {
    error.workspace.packageJson.repository = error.correctRepositoryField;
  },
  print: function(error) {
    return void 0 === error.currentRepositoryField ? "".concat(error.workspace.packageJson.name, " does not have a repository field when it should be ").concat(JSON.stringify(error.correctRepositoryField)) : "".concat(error.workspace.packageJson.name, " has a repository field of ").concat(JSON.stringify(error.currentRepositoryField), " when it should be ").concat(JSON.stringify(error.correctRepositoryField));
  }
}), checks = {
  EXTERNAL_MISMATCH: EXTERNAL_MISMATCH,
  INTERNAL_MISMATCH: INTERNAL_MISMATCH,
  INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP: INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP,
  INVALID_PACKAGE_NAME: INVALID_PACKAGE_NAME,
  MULTIPLE_DEPENDENCY_TYPES: MULTIPLE_DEPENDENCY_TYPES,
  ROOT_HAS_DEV_DEPENDENCIES: ROOT_HAS_DEV_DEPENDENCIES,
  UNSORTED_DEPENDENCIES: UNSORTED_DEPENDENCIES,
  INCORRECT_REPOSITORY_FIELD: INCORRECT_REPOSITORY_FIELD
}, ExitError = function(_Error) {
  function ExitError(code) {
    var _this;
    return _classCallCheck(this, ExitError), (_this = _possibleConstructorReturn(this, _getPrototypeOf(ExitError).call(this, "The process should exit with code ".concat(code)))).code = code, 
    _this;
  }
  return _inherits(ExitError, _Error), ExitError;
}(_wrapNativeSuper(Error));

function writePackage(_x) {
  return _writePackage.apply(this, arguments);
}

function _writePackage() {
  return (_writePackage = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(pkg) {
    var pkgRaw, indent;
    return _regeneratorRuntime.wrap(function(_context) {
      for (;;) switch (_context.prev = _context.next) {
       case 0:
        return _context.next = 2, fs.readFile(path.join(pkg.dir, "package.json"), "utf-8");

       case 2:
        return pkgRaw = _context.sent, indent = detectIndent(pkgRaw).indent || "  ", _context.abrupt("return", fs.writeFile(path.join(pkg.dir, "package.json"), JSON.stringify(pkg.packageJson, null, indent) + (pkgRaw.endsWith("\n") ? "\n" : "")));

       case 5:
       case "end":
        return _context.stop();
      }
    }, _callee);
  }))).apply(this, arguments);
}

function install(_x2, _x3) {
  return _install.apply(this, arguments);
}

function _install() {
  return (_install = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(tool, cwd) {
    return _regeneratorRuntime.wrap(function(_context2) {
      for (;;) switch (_context2.prev = _context2.next) {
       case 0:
        return _context2.next = 2, spawn({
          yarn: "yarn",
          pnpm: "pnpm",
          lerna: "lerna",
          root: "yarn",
          bolt: "bolt"
        }[tool], "pnpm" === tool ? [ "install" ] : "lerna" === tool ? [ "bootstrap", "--since", "HEAD" ] : [], {
          cwd: cwd,
          stdio: "inherit"
        });

       case 2:
       case "end":
        return _context2.stop();
      }
    }, _callee2);
  }))).apply(this, arguments);
}

function runCmd(_x, _x2) {
  return _runCmd.apply(this, arguments);
}

function _runCmd() {
  return (_runCmd = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(args, cwd) {
    var _ref, packages, root, exactMatchingPackage, _ref2, code, matchingPackages, _ref3, _code;
    return _regeneratorRuntime.wrap(function(_context) {
      for (;;) switch (_context.prev = _context.next) {
       case 0:
        return _context.next = 2, getPackages.getPackages(cwd);

       case 2:
        if (_ref = _context.sent, packages = _ref.packages, root = _ref.root, !(exactMatchingPackage = packages.find(function(pkg) {
          return pkg.packageJson.name === args[0] || path.relative(root.dir, pkg.dir) === args[0];
        }))) {
          _context.next = 12;
          break;
        }
        return _context.next = 9, spawn("yarn", args.slice(1), {
          cwd: exactMatchingPackage.dir,
          stdio: "inherit"
        });

       case 9:
        throw _ref2 = _context.sent, code = _ref2.code, new ExitError(code);

       case 12:
        if (!((matchingPackages = packages.filter(function(pkg) {
          return pkg.packageJson.name.includes(args[0]) || path.relative(root.dir, pkg.dir).includes(args[0]);
        })).length > 1)) {
          _context.next = 18;
          break;
        }
        throw error('an identifier must only match a single package but "'.concat(args[0], '" matches the following packages: \n').concat(matchingPackages.map(function(x) {
          return x.packageJson.name;
        }).join("\n"))), new ExitError(1);

       case 18:
        if (0 !== matchingPackages.length) {
          _context.next = 23;
          break;
        }
        throw error("No matching packages found"), new ExitError(1);

       case 23:
        return _context.next = 25, spawn("yarn", args.slice(1), {
          cwd: matchingPackages[0].dir,
          stdio: "inherit"
        });

       case 25:
        throw _ref3 = _context.sent, _code = _ref3.code, new ExitError(_code);

       case 28:
       case "end":
        return _context.stop();
      }
    }, _callee);
  }))).apply(this, arguments);
}

function upgradeDependency(_x) {
  return _upgradeDependency.apply(this, arguments);
}

function _upgradeDependency() {
  return (_upgradeDependency = _asyncToGenerator(_regeneratorRuntime.mark(function _callee3(_ref) {
    var _ref2, name, _ref2$, tag, _ref4, packages, tool, root, isScope, newVersion, packagesToUpdate, filteredPackages, rootRequiresUpdate, newVersions;
    return _regeneratorRuntime.wrap(function(_context3) {
      for (;;) switch (_context3.prev = _context3.next) {
       case 0:
        return _ref2 = _slicedToArray(_ref, 2), name = _ref2[0], _ref2$ = _ref2[1], tag = void 0 === _ref2$ ? "latest" : _ref2$, 
        _context3.next = 3, getPackages.getPackages(process.cwd());

       case 3:
        return _ref4 = _context3.sent, packages = _ref4.packages, tool = _ref4.tool, root = _ref4.root, 
        isScope = name.startsWith("@") && !name.includes("/"), newVersion = semver__default.validRange(tag) ? tag : null, 
        packagesToUpdate = new Set(), filteredPackages = packages.filter(function(_ref5) {
          var packageJson = _ref5.packageJson, requiresUpdate = !1;
          return DEPENDENCY_TYPES.forEach(function(t) {
            var deps = packageJson[t];
            deps && Object.keys(deps).forEach(function(pkgName) {
              (isScope && pkgName.startsWith(name) || pkgName === name) && (requiresUpdate = !0, 
              packagesToUpdate.add(pkgName));
            });
          }), requiresUpdate;
        }), rootRequiresUpdate = !1, DEPENDENCY_TYPES.forEach(function(t) {
          var deps = root.packageJson[t];
          deps && (Object.keys(deps).forEach(function(pkgName) {
            (isScope && pkgName.startsWith(name) || pkgName === name) && (rootRequiresUpdate = !0, 
            packagesToUpdate.add(pkgName));
          }), rootRequiresUpdate && filteredPackages.push(root));
        }), _context3.next = 15, Promise.all(_toConsumableArray(packagesToUpdate).map(function() {
          var _ref6 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(pkgName) {
            var info, distTags, version;
            return _regeneratorRuntime.wrap(function(_context2) {
              for (;;) switch (_context2.prev = _context2.next) {
               case 0:
                if (newVersion) {
                  _context2.next = 9;
                  break;
                }
                return _context2.next = 3, getPackageInfo(pkgName);

               case 3:
                return info = _context2.sent, distTags = info["dist-tags"], version = distTags[tag], 
                _context2.abrupt("return", {
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
            }, _callee2);
          }));
          return function(_x2) {
            return _ref6.apply(this, arguments);
          };
        }()));

       case 15:
        return newVersions = _context3.sent, filteredPackages.forEach(function(_ref7) {
          var packageJson = _ref7.packageJson;
          DEPENDENCY_TYPES.forEach(function(t) {
            var deps = packageJson[t];
            deps && newVersions.forEach(function(_ref8) {
              var pkgName = _ref8.pkgName, version = _ref8.version;
              deps[pkgName] && version && (deps[pkgName] = newVersion ? version : "".concat(versionRangeToRangeType(deps[pkgName])).concat(version));
            });
          });
        }), _context3.next = 19, Promise.all(_toConsumableArray(filteredPackages).map(writePackage));

       case 19:
        return _context3.next = 21, install(tool, root.dir);

       case 21:
       case "end":
        return _context3.stop();
      }
    }, _callee3);
  }))).apply(this, arguments);
}

var npmRequestLimit = pLimit(40);

function getPackageInfo(pkgName) {
  return npmRequestLimit(_asyncToGenerator(_regeneratorRuntime.mark(function _callee() {
    var result;
    return _regeneratorRuntime.wrap(function(_context) {
      for (;;) switch (_context.prev = _context.next) {
       case 0:
        return _context.next = 2, getPackageJson(pkgName, {
          allVersions: !0
        });

       case 2:
        return result = _context.sent, _context.abrupt("return", result);

       case 4:
       case "end":
        return _context.stop();
      }
    }, _callee);
  })));
}

var npmLimit = pLimit(40);

function getCorrectRegistry() {
  return "https://registry.yarnpkg.com" === process.env.npm_config_registry ? void 0 : process.env.npm_config_registry;
}

function tagApackage(_x, _x2, _x3) {
  return _tagApackage.apply(this, arguments);
}

function _tagApackage() {
  return (_tagApackage = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(packageJson, tag, otpCode) {
    var envOverride, flags;
    return _regeneratorRuntime.wrap(function(_context) {
      for (;;) switch (_context.prev = _context.next) {
       case 0:
        return envOverride = {
          npm_config_registry: getCorrectRegistry()
        }, flags = [], otpCode && flags.push("--otp", otpCode), _context.next = 5, spawn("npm", [ "dist-tag", "add", "".concat(packageJson.name, "@").concat(packageJson.version), tag ].concat(flags), {
          stdio: "inherit",
          env: Object.assign({}, process.env, envOverride)
        });

       case 5:
        return _context.abrupt("return", _context.sent);

       case 6:
       case "end":
        return _context.stop();
      }
    }, _callee);
  }))).apply(this, arguments);
}

function npmTagAll(_x4) {
  return _npmTagAll.apply(this, arguments);
}

function _npmTagAll() {
  return (_npmTagAll = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(_ref) {
    var _ref2, tag, otp, _ref3, packages;
    return _regeneratorRuntime.wrap(function(_context2) {
      for (;;) switch (_context2.prev = _context2.next) {
       case 0:
        return _ref2 = _slicedToArray(_ref, 3), tag = _ref2[0], _ref2[1], otp = _ref2[2], 
        _context2.next = 3, getPackages.getPackages(process.cwd());

       case 3:
        return _ref3 = _context2.sent, packages = _ref3.packages, _context2.next = 7, Promise.all(packages.filter(function(_ref4) {
          return !0 !== _ref4.packageJson.private;
        }).map(function(_ref5) {
          var packageJson = _ref5.packageJson;
          return npmLimit(function() {
            return tagApackage(packageJson, tag, otp);
          });
        }));

       case 7:
       case "end":
        return _context2.stop();
      }
    }, _callee2);
  }))).apply(this, arguments);
}

function ownKeys$1(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread$1(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys$1(source, !0).forEach(function(key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$1(source).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}

var defaultOptions = {
  defaultBranch: "master"
}, runChecks = function(allWorkspaces, rootWorkspace, shouldFix, options) {
  for (var hasErrored = !1, requiresInstall = !1, ignoredRules = new Set(rootWorkspace.packageJson.manypkg && rootWorkspace.packageJson.manypkg.ignoredRules || []), _i = 0, _Object$entries = Object.entries(checks); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2), ruleName = _Object$entries$_i[0], check = _Object$entries$_i[1];
    if (!ignoredRules.has(ruleName)) {
      if ("all" === check.type) {
        var _iteratorNormalCompletion = !0, _didIteratorError = !1, _iteratorError = void 0;
        try {
          for (var _step, _iterator = allWorkspaces[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = !0) {
            var workspace = _slicedToArray(_step.value, 2)[1], errors = check.validate(workspace, allWorkspaces, rootWorkspace, options);
            if (shouldFix && void 0 !== check.fix) {
              var _iteratorNormalCompletion2 = !0, _didIteratorError2 = !1, _iteratorError2 = void 0;
              try {
                for (var _step2, _iterator2 = errors[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = !0) {
                  var error$1 = _step2.value;
                  (check.fix(error$1, options) || {
                    requiresInstall: !1
                  }).requiresInstall && (requiresInstall = !0);
                }
              } catch (err) {
                _didIteratorError2 = !0, _iteratorError2 = err;
              } finally {
                try {
                  _iteratorNormalCompletion2 || null == _iterator2.return || _iterator2.return();
                } finally {
                  if (_didIteratorError2) throw _iteratorError2;
                }
              }
            } else {
              var _iteratorNormalCompletion3 = !0, _didIteratorError3 = !1, _iteratorError3 = void 0;
              try {
                for (var _step3, _iterator3 = errors[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = !0) {
                  var _error = _step3.value;
                  hasErrored = !0, error(check.print(_error, options));
                }
              } catch (err) {
                _didIteratorError3 = !0, _iteratorError3 = err;
              } finally {
                try {
                  _iteratorNormalCompletion3 || null == _iterator3.return || _iterator3.return();
                } finally {
                  if (_didIteratorError3) throw _iteratorError3;
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError = !0, _iteratorError = err;
        } finally {
          try {
            _iteratorNormalCompletion || null == _iterator.return || _iterator.return();
          } finally {
            if (_didIteratorError) throw _iteratorError;
          }
        }
      }
      if ("root" === check.type) {
        var _errors = check.validate(rootWorkspace, allWorkspaces, rootWorkspace, options);
        if (shouldFix && void 0 !== check.fix) {
          var _iteratorNormalCompletion4 = !0, _didIteratorError4 = !1, _iteratorError4 = void 0;
          try {
            for (var _step4, _iterator4 = _errors[Symbol.iterator](); !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = !0) {
              var _error2 = _step4.value;
              (check.fix(_error2, options) || {
                requiresInstall: !1
              }).requiresInstall && (requiresInstall = !0);
            }
          } catch (err) {
            _didIteratorError4 = !0, _iteratorError4 = err;
          } finally {
            try {
              _iteratorNormalCompletion4 || null == _iterator4.return || _iterator4.return();
            } finally {
              if (_didIteratorError4) throw _iteratorError4;
            }
          }
        } else {
          var _iteratorNormalCompletion5 = !0, _didIteratorError5 = !1, _iteratorError5 = void 0;
          try {
            for (var _step5, _iterator5 = _errors[Symbol.iterator](); !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = !0) {
              var _error3 = _step5.value;
              hasErrored = !0, error(check.print(_error3, options));
            }
          } catch (err) {
            _didIteratorError5 = !0, _iteratorError5 = err;
          } finally {
            try {
              _iteratorNormalCompletion5 || null == _iterator5.return || _iterator5.return();
            } finally {
              if (_didIteratorError5) throw _iteratorError5;
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
}, execLimit = pLimit(4);

function execCmd(_x) {
  return _execCmd.apply(this, arguments);
}

function _execCmd() {
  return (_execCmd = _asyncToGenerator(_regeneratorRuntime.mark(function _callee4(args) {
    var _ref6, packages, highestExitCode;
    return _regeneratorRuntime.wrap(function(_context4) {
      for (;;) switch (_context4.prev = _context4.next) {
       case 0:
        return _context4.next = 2, getPackages.getPackages(process.cwd());

       case 2:
        return _ref6 = _context4.sent, packages = _ref6.packages, highestExitCode = 0, _context4.next = 7, 
        Promise.all(packages.map(function(pkg) {
          return execLimit(_asyncToGenerator(_regeneratorRuntime.mark(function _callee3() {
            var _ref8, code;
            return _regeneratorRuntime.wrap(function(_context3) {
              for (;;) switch (_context3.prev = _context3.next) {
               case 0:
                return _context3.next = 2, spawn(args[0], args.slice(1), {
                  cwd: pkg.dir,
                  stdio: "inherit"
                });

               case 2:
                _ref8 = _context3.sent, code = _ref8.code, highestExitCode = Math.max(code, highestExitCode);

               case 5:
               case "end":
                return _context3.stop();
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
    }, _callee4);
  }))).apply(this, arguments);
}

_asyncToGenerator(_regeneratorRuntime.mark(function _callee2() {
  var things, shouldFix, _ref2, packages, root, tool, options, packagesByName, _runChecks, hasErrored, requiresInstall;
  return _regeneratorRuntime.wrap(function(_context2) {
    for (;;) switch (_context2.prev = _context2.next) {
     case 0:
      if ("exec" !== (things = process.argv.slice(2))[0]) {
        _context2.next = 3;
        break;
      }
      return _context2.abrupt("return", execCmd(things.slice(1)));

     case 3:
      if ("run" !== things[0]) {
        _context2.next = 5;
        break;
      }
      return _context2.abrupt("return", runCmd(things.slice(1), process.cwd()));

     case 5:
      if ("upgrade" !== things[0]) {
        _context2.next = 7;
        break;
      }
      return _context2.abrupt("return", upgradeDependency(things.slice(1)));

     case 7:
      if ("npm-tag" !== things[0]) {
        _context2.next = 9;
        break;
      }
      return _context2.abrupt("return", npmTagAll(things.slice(1)));

     case 9:
      if ("check" === things[0] || "fix" === things[0]) {
        _context2.next = 12;
        break;
      }
      throw error("command ".concat(things[0], " not found, only check, exec, run, upgrade, npm-tag and fix exist")), 
      new ExitError(1);

     case 12:
      return shouldFix = "fix" === things[0], _context2.next = 15, getPackages.getPackages(process.cwd());

     case 15:
      if (_ref2 = _context2.sent, packages = _ref2.packages, root = _ref2.root, tool = _ref2.tool, 
      options = _objectSpread$1({}, defaultOptions, {}, root.packageJson.manypkg), (packagesByName = new Map(packages.map(function(x) {
        return [ x.packageJson.name, x ];
      }))).set(root.packageJson.name, root), _runChecks = runChecks(packagesByName, root, shouldFix, options), 
      hasErrored = _runChecks.hasErrored, requiresInstall = _runChecks.requiresInstall, 
      !shouldFix) {
        _context2.next = 32;
        break;
      }
      return _context2.next = 26, Promise.all(_toConsumableArray(packagesByName).map(function() {
        var _ref4 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(_ref3) {
          var _ref5;
          return _regeneratorRuntime.wrap(function(_context) {
            for (;;) switch (_context.prev = _context.next) {
             case 0:
              _ref5 = _slicedToArray(_ref3, 2), _ref5[0], writePackage(_ref5[1]);

             case 2:
             case "end":
              return _context.stop();
            }
          }, _callee);
        }));
        return function(_x2) {
          return _ref4.apply(this, arguments);
        };
      }()));

     case 26:
      if (!requiresInstall) {
        _context2.next = 29;
        break;
      }
      return _context2.next = 29, install(tool, root.dir);

     case 29:
      success("fixed workspaces!"), _context2.next = 38;
      break;

     case 32:
      if (!hasErrored) {
        _context2.next = 37;
        break;
      }
      throw info("the above errors may be fixable with yarn manypkg fix"), new ExitError(1);

     case 37:
      success("workspaces valid!");

     case 38:
     case "end":
      return _context2.stop();
    }
  }, _callee2);
}))().catch(function(err) {
  err instanceof ExitError ? process.exit(err.code) : (error(err), process.exit(1));
});
