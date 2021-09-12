"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const nodePath = require("path");
const utils_1 = require("./utils");
/**
 * Simple snapshot source cache
 */
class SnapshotResolver {
    constructor(ts, cacheMap = new Map()) {
        this.ts = ts;
        this.cacheMap = cacheMap;
        this._extensions = [".snap"];
        this._dir = "__snapshots__";
    }
    set extensions(ext) {
        this._extensions = ext;
        this.cacheMap.clear();
    }
    get extensions() {
        return this._extensions;
    }
    set dir(d) {
        this._dir = d;
        this.cacheMap.clear();
    }
    get dir() {
        return this._dir;
    }
    /**
     * Return snapshot definitions for given snapshot file name.
     * May return definitions from cache if snapshot file hasn't been changed
     *
     * @param testFile
     * @returns
     */
    getSnapshotForFile(testFile) {
        const snapshotPath = this.getAllPossiblePathsForFile(testFile).find(path => fs.existsSync(path));
        // if (!fs.existsSync(path)) {
        //     return [];
        // }
        if (!snapshotPath) {
            return;
        }
        try {
            const { mtime } = fs.statSync(snapshotPath);
            const cacheEntry = this.cacheMap.get(snapshotPath);
            if (cacheEntry && cacheEntry.lastModifiedTime === mtime.getTime()) {
                return {
                    file: snapshotPath,
                    definitions: cacheEntry.definitions,
                };
            }
            const source = fs.readFileSync(snapshotPath, "utf8");
            const newEntry = {
                lastModifiedTime: mtime.getTime(),
                definitions: utils_1.parseSnapshotFile(this.ts, snapshotPath, source)
            };
            this.cacheMap.set(snapshotPath, newEntry);
            return {
                file: snapshotPath,
                definitions: newEntry.definitions,
            };
        }
        catch (_a) {
            return undefined;
        }
    }
    /**
     * Return snapshot path for file
     */
    getAllPossiblePathsForFile(filePath) {
        return [
            ...this.extensions.map(ext => nodePath.join(nodePath.dirname(filePath), this.dir, nodePath.basename(filePath) + ext)),
            // include js.${ext} too, refs #11
            ...this.extensions.map(ext => nodePath.join(nodePath.dirname(filePath), this.dir, nodePath.basename(filePath, nodePath.extname(filePath)) + ".js" + ext)),
        ];
    }
}
exports.SnapshotResolver = SnapshotResolver;
//# sourceMappingURL=snapshotcache.js.map