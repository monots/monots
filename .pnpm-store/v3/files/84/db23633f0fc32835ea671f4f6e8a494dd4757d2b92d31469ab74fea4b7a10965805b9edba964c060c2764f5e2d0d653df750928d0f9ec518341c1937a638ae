"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
/**
 * Try to get snapshot definition for given position in source file
 *
 * @export
 * @param ts
 * @param sourceFile
 * @param position
 * @param snapshotCache
 * @param config
 * @returns
 */
function tryGetSnapshotForPosition(ts, sourceFile, position, snapshotCache, config, program) {
    if (!sourceFile) {
        return;
    }
    try {
        const node = utils_1.findNodeAtPosition(ts, sourceFile, position);
        if (node && utils_1.isMatchingIdentifier(ts, node, config.snapshotCallIdentifiers) && node.parent && node.parent.parent && ts.isCallExpression(node.parent.parent)) {
            // avoid reading snapshot file until there will be real case for snapshot existing, i.e. blockInfo not undefined
            const blockInfo = utils_1.getParentTestBlocks(ts, sourceFile, config.testBlockIdentifiers, node.getStart(sourceFile), program);
            if (blockInfo) {
                const snapshotInfo = snapshotCache.getSnapshotForFile(sourceFile.fileName);
                if (!snapshotInfo || !snapshotInfo.definitions.length) {
                    return;
                }
                const snapshotCallsInBlock = utils_1.getCountOfIdentifiersInBlock(ts, blockInfo.lastNode, config.snapshotCallIdentifiers, node.getStart(sourceFile));
                const customName = node.parent.parent.arguments.find(arg => ts.isStringLiteral(arg));
                // let snapshotName = blockInfo.blockNames.join(" ") + " " + (snapshotCallsInBlock + 1);
                let snapshotName = blockInfo.blockNames.join(" ");
                if (customName) {
                    snapshotName += ": " + customName.text + " " + snapshotCallsInBlock.namedCalls[customName.text];
                }
                else {
                    snapshotName += " " + (snapshotCallsInBlock.anonymousCalls);
                }
                return snapshotInfo.definitions.find(t => t.name === snapshotName);
            }
        }
    }
    catch (_a) {
        /* ignore */
    }
    return undefined;
}
exports.tryGetSnapshotForPosition = tryGetSnapshotForPosition;
//# sourceMappingURL=getsnapshot.js.map