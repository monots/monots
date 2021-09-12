"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var swc = __importStar(require("@swc/core"));
var fs_1 = __importDefault(require("fs"));
var lodash_clonedeep_1 = __importDefault(require("lodash.clonedeep"));
var lodash_escaperegexp_1 = __importDefault(require("lodash.escaperegexp"));
var path_1 = __importDefault(require("path"));
var pirates_1 = require("pirates");
var source_map_support_1 = __importDefault(require("source-map-support"));
var maps = {};
var transformOpts = {};
var piratesRevert = null;
function installSourceMapSupport() {
    source_map_support_1.default.install({
        handleUncaughtExceptions: false,
        environment: "node",
        retrieveSourceMap: function (source) {
            var map = maps && maps[source];
            if (map) {
                return {
                    url: null,
                    map: map
                };
            }
            else {
                return null;
            }
        }
    });
}
function mtime(filename) {
    return +fs_1.default.statSync(filename).mtime;
}
function compile(code, filename) {
    // merge in base options and resolve all the plugins and presets relative to this file
    var opts = __assign(__assign({ sourceRoot: path_1.default.dirname(filename) }, lodash_clonedeep_1.default(transformOpts)), { filename: filename });
    if (typeof code !== "string") {
        code = code.toString();
    }
    delete opts.only;
    delete opts.ignore;
    var output = swc.transformSync(code, __assign(__assign({}, opts), { sourceMaps: opts.sourceMaps === undefined ? "inline" : opts.sourceMaps }));
    if (output.map) {
        if (Object.keys(maps).length === 0) {
            installSourceMapSupport();
        }
        maps[filename] = output.map;
    }
    return output.code;
}
var compiling = false;
function compileHook(code, filename) {
    if (compiling)
        return code;
    try {
        compiling = true;
        return compile(code, filename);
    }
    finally {
        compiling = false;
    }
}
function hookExtensions(exts) {
    if (piratesRevert)
        piratesRevert();
    piratesRevert = pirates_1.addHook(compileHook, { exts: exts, ignoreNodeModules: true });
}
function revert() {
    if (piratesRevert)
        piratesRevert();
}
exports.revert = revert;
register();
function register(opts) {
    if (opts === void 0) { opts = {}; }
    // Clone to avoid mutating the arguments object with the 'delete's below.
    opts = __assign({}, opts);
    hookExtensions(opts.extensions || swc.DEFAULT_EXTENSIONS);
    delete opts.extensions;
    transformOpts = __assign(__assign({}, opts), { caller: __assign({ name: "@swc/register" }, (opts.caller || {})) });
    var _a = transformOpts.cwd, cwd = _a === void 0 ? "." : _a;
    // Ensure that the working directory is resolved up front so that
    // things don't break if it changes later.
    cwd = transformOpts.cwd = path_1.default.resolve(cwd);
    if (transformOpts.ignore === undefined && transformOpts.only === undefined) {
        transformOpts.only = [
            // Only compile things inside the current working directory.
            new RegExp("^" + lodash_escaperegexp_1.default(cwd), "i")
        ];
        transformOpts.ignore = [
            // Ignore any node_modules inside the current working directory.
            new RegExp("^" +
                lodash_escaperegexp_1.default(cwd) +
                "(?:" +
                path_1.default.sep +
                ".*)?" +
                lodash_escaperegexp_1.default(path_1.default.sep + "node_modules" + path_1.default.sep), "i")
        ];
    }
}
exports.default = register;
