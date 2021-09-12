"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EXTRACT_CSS_REGEX = new RegExp(/^(\s*[\.@>][\w0-1-:\s\(\)>\.&]+{(?:(?:.|\n|\r)*?)}(?:\n|\r|})*)/gm);
/**
 * Find closest node at given position
 *
 * @export
 * @param ts
 * @param sourceFile
 * @param position
 * @returns
 */
function findNodeAtPosition(ts, sourceFile, position) {
    function find(node) {
        if (position >= node.getStart(sourceFile) && position <= node.getEnd()) {
            return ts.forEachChild(node, find) || node;
        }
        return;
    }
    return ts.forEachChild(sourceFile, find);
}
exports.findNodeAtPosition = findNodeAtPosition;
/**
 * Check if given node is the call expression with matching identifiers.
 * Main use is the checking is the node is toMatchSnapshot identifier call
 *
 * @export
 * @param ts
 * @param node
 * @param identifiers
 * @returns
 */
function isMatchingCallExpression(ts, node, identifiers) {
    if (!ts.isCallExpression(node)) {
        return false;
    }
    const text = node.expression.getText();
    return identifiers.indexOf(text) !== -1;
}
exports.isMatchingCallExpression = isMatchingCallExpression;
/**
 * Check if given node is identifiers and match any of given identifiers
 *
 * @export
 * @param ts
 * @param node
 * @param identifiers
 * @returns
 */
function isMatchingIdentifier(ts, node, identifiers) {
    if (!ts.isIdentifier(node)) {
        return false;
    }
    return identifiers.indexOf(node.getText()) !== -1;
}
exports.isMatchingIdentifier = isMatchingIdentifier;
/**
 * Resolve block name
 *
 * @param ts
 * @param program
 * @param arg
 * @returns block name or undefined if block name couldn't be resolved
 */
function resolveBlockName(ts, program, arg) {
    if (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg) || ts.isNumericLiteral(arg)) {
        return arg.text;
    }
    else if ((ts.isIdentifier(arg) || ts.isPropertyAccessExpression(arg)) && program) {
        const typeChecker = program.getTypeChecker();
        const type = typeChecker.getTypeAtLocation(arg);
        if (type && (type.getFlags() & ts.TypeFlags.StringLiteral)) {
            return type.value;
        }
    }
    else if (ts.isTemplateExpression(arg) && program) {
        // try to resolve template literal
        let blockName = arg.head.text;
        let allResolved = true;
        const typeChecker = program.getTypeChecker();
        // const type = typeChecker.getTypeAtLocation(arg);
        for (const span of arg.templateSpans) {
            if (ts.isIdentifier(span.expression) || ts.isPropertyAccessExpression(span.expression)) {
                const spanType = typeChecker.getTypeAtLocation(span.expression);
                if (spanType && (spanType.getFlags() & (ts.TypeFlags.StringLiteral | ts.TypeFlags.NumberLiteral))) {
                    const literal = span.literal.text;
                    blockName += spanType.value + literal;
                }
                else {
                    allResolved = false;
                    break;
                }
            }
            else {
                allResolved = false;
                break;
            }
        }
        if (allResolved) {
            return blockName;
        }
    }
    else if (ts.isBinaryExpression(arg)) {
        const left = resolveBlockName(ts, program, arg.left);
        const right = resolveBlockName(ts, program, arg.right);
        if (left && right) {
            return left + right;
        }
    }
    return undefined;
}
/**
 * Return all parent test blocks
 *
 * @export
 * @param ts
 * @param sourceFile
 * @param testBlockIdentifiers
 * @param lookupUntil
 * @returns
 */
function getParentTestBlocks(ts, sourceFile, testBlockIdentifiers, lookupUntil, program) {
    const blocks = [];
    let lastBlockNode;
    function find(node) {
        if (lookupUntil >= node.getStart() && lookupUntil <= node.getEnd()) {
            if (isMatchingCallExpression(ts, node, testBlockIdentifiers) && node.arguments.length >= 1) {
                const arg = node.arguments[0];
                const blockName = resolveBlockName(ts, program, arg);
                if (blockName) {
                    lastBlockNode = node;
                    blocks.push(blockName);
                    ts.forEachChild(node, find);
                }
            }
            else {
                ts.forEachChild(node, find);
            }
        }
    }
    find(sourceFile);
    if (!lastBlockNode) {
        return undefined;
    }
    return {
        blockNames: blocks,
        lastNode: lastBlockNode
    };
}
exports.getParentTestBlocks = getParentTestBlocks;
/**
 * Calculate count of given identifiers in the bloc
 *
 * @export
 * @param ts
 * @param block
 * @param lookupUntil
 * @returns
 */
function getCountOfIdentifiersInBlock(ts, block, identifiers, lookupUntil) {
    let anonymousCalls = 0;
    const namedCalls = {};
    function visit(node) {
        if (ts.isIdentifier(node) && identifiers.indexOf(node.text) !== -1 && lookupUntil >= node.getStart()) {
            if (node.parent && node.parent.parent && ts.isCallExpression(node.parent.parent)) {
                const customName = node.parent.parent.arguments.find(arg => ts.isStringLiteralLike(arg));
                if (customName && ts.isStringLiteralLike(customName)) {
                    const snapshotName = customName.text;
                    namedCalls[snapshotName] = namedCalls[snapshotName] ? namedCalls[snapshotName] + 1 : 1;
                }
                else {
                    anonymousCalls++;
                }
            }
        }
        ts.forEachChild(node, visit);
    }
    ts.forEachChild(block, visit);
    return {
        anonymousCalls,
        namedCalls,
    };
}
exports.getCountOfIdentifiersInBlock = getCountOfIdentifiersInBlock;
/**
 * Parse snapshot-like file and return snapshot definitions
 *
 * @export
 * @param ts
 * @param path
 * @param source
 * @returns
 */
function parseSnapshotFile(ts, path, source) {
    try {
        const file = ts.createSourceFile("temp.ts", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
        const blocks = [];
        const visit = (node) => {
            if (ts.isBinaryExpression(node) &&
                ts.isElementAccessExpression(node.left) &&
                node.left.argumentExpression &&
                (ts.isStringLiteral(node.left.argumentExpression) || ts.isNoSubstitutionTemplateLiteral(node.left.argumentExpression)) &&
                (ts.isStringLiteral(node.right) || ts.isNoSubstitutionTemplateLiteral(node.right))) {
                blocks.push({
                    file: path,
                    name: node.left.argumentExpression.text,
                    snapshot: node.right.text,
                    position: node.getStart(),
                    length: node.getText().length
                });
            }
            else {
                ts.forEachChild(node, visit);
            }
        };
        ts.forEachChild(file, visit);
        return blocks;
    }
    catch (_a) {
        return [];
    }
}
exports.parseSnapshotFile = parseSnapshotFile;
function formatSnapshot(text, extractCss = false) {
    const result = [];
    if (extractCss) {
        const cssRes = text.match(EXTRACT_CSS_REGEX);
        if (cssRes) {
            result.push(({ type: "css", text: cssRes.join("\n").trim() }));
            text = text.replace(EXTRACT_CSS_REGEX, "");
        }
    }
    result.push({ type: "jsx", text: text.trim() });
    return result;
}
exports.formatSnapshot = formatSnapshot;
//# sourceMappingURL=utils.js.map