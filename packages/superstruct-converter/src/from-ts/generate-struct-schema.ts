/* eslint-disable unicorn/no-array-reduce */
import { camelCase, lowerCase } from 'case-anything';
import { uniq } from 'lodash-es';
import assert from 'node:assert';
import ts, { factory as f } from 'typescript';

import { getJSDocTags, JSDocTags, jsDocTagToStructProperties, StructProperty } from './js-doc-tags';

export interface GenerateStructSchemaProps {
  /**
   * Name of the exported variable
   */
  varName: string;

  /**
   * Interface or type node
   */
  node: ts.InterfaceDeclaration | ts.TypeAliasDeclaration | ts.EnumDeclaration;

  /**
   * Zod import value.
   *
   * @default 's'
   */
  structImportValue?: string;

  /**
   * Source file
   */
  sourceFile: ts.SourceFile;

  /**
   * Getter for schema dependencies (Type reference inside type)
   *
   * @default (identifierName) => camelCase(`${identifierName}Schema`)
   */
  getDependencyName?: (identifierName: string) => string;
}

/**
 * Generate struct schema declaration
 *
 * ```ts
 * export const ${varName} = ${structImportValue}.object(…)
 * ```
 */
export function generateStructSchemaVariableStatement({
  node,
  sourceFile,
  varName,
  structImportValue = 's',
  getDependencyName = (identifierName) => camelCase(`${identifierName}Schema`),
}: GenerateStructSchemaProps) {
  let schema: ts.CallExpression | ts.Identifier | undefined;
  const dependencies: string[] = [];
  let requiresImport = false;

  if (ts.isInterfaceDeclaration(node)) {
    let baseSchema: string | undefined;

    if (node.typeParameters) {
      throw new Error('Interfaces with generics are not supported!');
    }

    if (node.heritageClauses) {
      const [heritageClause] = node.heritageClauses;

      if (!heritageClause || node.heritageClauses.length > 1 || heritageClause?.types.length) {
        throw new Error('Only interface with single `extends T` are not supported!');
      }

      const type = heritageClause.types[0];
      const identifierName = type?.expression.getText(sourceFile);
      assert(identifierName);
      baseSchema = getDependencyName(identifierName);
    }

    schema = buildStructObject({
      typeNode: node,
      sourceFile,
      z: structImportValue,
      dependencies,
      getDependencyName,
      baseSchema,
    });
  }

  if (ts.isTypeAliasDeclaration(node)) {
    if (node.typeParameters) {
      throw new Error('Type with generics are not supported!');
    }

    schema = buildStructPrimitive({
      s: structImportValue,
      typeNode: node.type,
      isOptional: false,
      jsDocTags: {},
      sourceFile,
      dependencies,
      getDependencyName,
    });
  }

  if (ts.isEnumDeclaration(node)) {
    schema = buildStructSchema(structImportValue, 'nativeEnum', [node.name]);
    requiresImport = true;
  }

  return {
    dependencies: uniq(dependencies),
    statement: f.createVariableStatement(
      node.modifiers,
      f.createVariableDeclarationList(
        [f.createVariableDeclaration(f.createIdentifier(varName), undefined, undefined, schema)],
        ts.NodeFlags.Const,
      ),
    ),
    requiresImport,
  };
}

function buildZodProperties({
  members,
  structImportValue: s,
  sourceFile,
  dependencies,
  getDependencyName,
}: {
  members: ts.NodeArray<ts.TypeElement> | ts.PropertySignature[];
  structImportValue: string;
  sourceFile: ts.SourceFile;
  dependencies: string[];
  getDependencyName: (identifierName: string) => string;
}) {
  const properties = new Map<ts.Identifier | ts.StringLiteral, ts.CallExpression | ts.Identifier>();

  for (const member of members) {
    if (
      !ts.isPropertySignature(member) ||
      !member.type ||
      !(ts.isIdentifier(member.name) || ts.isStringLiteral(member.name))
    ) {
      continue;
    }

    const isOptional = Boolean(member.questionToken);
    const jsDocTags = getJSDocTags(member, sourceFile);

    properties.set(
      member.name,
      buildStructPrimitive({
        s: s,
        typeNode: member.type,
        isOptional,
        jsDocTags,
        sourceFile,
        dependencies,
        getDependencyName,
      }),
    );
  }

  return properties;
}

function buildStructPrimitive({
  s,
  typeNode,
  isOptional,
  isPartial,
  isRequired,
  jsDocTags,
  sourceFile,
  dependencies,
  getDependencyName,
}: {
  s: string;
  typeNode: ts.TypeNode;
  isOptional: boolean;
  isPartial?: boolean;
  isRequired?: boolean;
  jsDocTags: JSDocTags;
  sourceFile: ts.SourceFile;
  dependencies: string[];
  getDependencyName: (identifierName: string) => string;
}): ts.CallExpression | ts.Identifier {
  const structProperties = jsDocTagToStructProperties(
    jsDocTags,
    isOptional,
    Boolean(isPartial),
    Boolean(isRequired),
  );

  if (ts.isParenthesizedTypeNode(typeNode)) {
    return buildStructPrimitive({
      s: s,
      typeNode: typeNode.type,
      isOptional,
      jsDocTags,
      sourceFile,
      dependencies,
      getDependencyName,
    });
  }

  if (ts.isTypeReferenceNode(typeNode) && ts.isIdentifier(typeNode.typeName)) {
    const identifierName = typeNode.typeName.text;

    // Deal with `Array<>` syntax
    if (identifierName === 'Array' && typeNode.typeArguments) {
      assert(typeNode.typeArguments[0]);
      return buildStructPrimitive({
        s: s,
        typeNode: f.createArrayTypeNode(typeNode.typeArguments[0]),
        isOptional,
        jsDocTags: {},
        sourceFile,
        dependencies,
        getDependencyName,
      });
    }

    // Deal with `Partial<>` syntax
    if (identifierName === 'Partial' && typeNode.typeArguments) {
      assert(typeNode.typeArguments[0]);
      return buildStructPrimitive({
        s: s,
        typeNode: typeNode.typeArguments[0],
        isOptional,
        jsDocTags,
        sourceFile,
        isPartial: true,
        dependencies,
        getDependencyName,
      });
    }

    // Deal with `Required<>` syntax
    if (identifierName === 'Required' && typeNode.typeArguments) {
      const childTypeNode = typeNode.typeArguments[0];
      assert(childTypeNode);

      return buildStructPrimitive({
        s,
        typeNode: childTypeNode,
        isOptional,
        jsDocTags,
        sourceFile,
        isRequired: true,
        dependencies,
        getDependencyName,
      });
    }

    // Deal with `Readonly<>` syntax
    if (identifierName === 'Readonly' && typeNode.typeArguments) {
      const childTypeNode = typeNode.typeArguments[0];
      assert(childTypeNode);
      return buildStructPrimitive({
        s,
        typeNode: childTypeNode,
        isOptional,
        jsDocTags,
        sourceFile,
        dependencies,
        getDependencyName,
      });
    }

    // Deal with `Record<>` syntax
    if (identifierName === 'Record' && typeNode.typeArguments) {
      const typeArgument = typeNode.typeArguments[0];

      if (typeNode.typeArguments.length !== 2) {
        throw new Error(
          `Record<${typeArgument?.getText(sourceFile)}, …> must have two type arguments.`,
        );
      }

      const childTypeNode = typeNode.typeArguments[1];
      assert(childTypeNode);
      return buildStructSchema(
        s,
        'record',
        [
          buildStructPrimitive({
            s,
            typeNode: childTypeNode,
            isOptional,
            jsDocTags,
            sourceFile,
            isPartial: false,
            dependencies,
            getDependencyName,
          }),
        ],
        structProperties,
      );
    }

    // Deal with `Date`
    if (identifierName === 'Date') {
      return buildStructSchema(s, 'date', [], structProperties);
    }

    // Deal with `Promise<>` syntax
    if (identifierName === 'Promise' && typeNode.typeArguments) {
      return buildStructSchema(
        s,
        'promise',
        typeNode.typeArguments.map((i) =>
          buildStructPrimitive({
            s: s,
            typeNode: i,
            isOptional: false,
            jsDocTags,
            sourceFile,
            dependencies,
            getDependencyName,
          }),
        ),
        structProperties,
      );
    }

    // Deal with `Omit<>` & `Pick<>` syntax
    if (['Omit', 'Pick'].includes(identifierName) && typeNode.typeArguments) {
      const [originalType, keys] = typeNode.typeArguments;
      assert(keys);
      let parameters: ts.ObjectLiteralExpression | undefined;

      if (ts.isLiteralTypeNode(keys)) {
        parameters = f.createObjectLiteralExpression([
          f.createPropertyAssignment(keys.literal.getText(sourceFile), f.createTrue()),
        ]);
      }

      if (ts.isUnionTypeNode(keys)) {
        parameters = f.createObjectLiteralExpression(
          keys.types.map((type) => {
            if (!ts.isLiteralTypeNode(type)) {
              throw new Error(
                `${identifierName}<T, K> unknown syntax: (${
                  ts.SyntaxKind[type.kind]
                } as K union part not supported)`,
              );
            }

            return f.createPropertyAssignment(type.literal.getText(sourceFile), f.createTrue());
          }),
        );
      }

      if (!parameters) {
        throw new Error(
          `${identifierName}<T, K> unknown syntax: (${
            ts.SyntaxKind[keys?.kind ?? 0]
          } as K not supported)`,
        );
      }

      assert(originalType);

      return f.createCallExpression(
        f.createPropertyAccessExpression(
          buildStructPrimitive({
            s: s,
            typeNode: originalType,
            isOptional: false,
            jsDocTags: {},
            sourceFile,
            dependencies,
            getDependencyName,
          }),
          f.createIdentifier(lowerCase(identifierName)),
        ),
        undefined,
        [parameters],
      );
    }

    const dependencyName = getDependencyName(identifierName);
    dependencies.push(dependencyName);
    const structSchema: ts.Identifier | ts.CallExpression = f.createIdentifier(dependencyName);
    return withStructProperties(structSchema, structProperties);
  }

  if (ts.isUnionTypeNode(typeNode)) {
    const values = typeNode.types.map((i) =>
      buildStructPrimitive({
        s: s,
        typeNode: i,
        isOptional: false,
        jsDocTags: {},
        sourceFile,
        dependencies,
        getDependencyName,
      }),
    );

    // type A = | 'b' is a valid typescript definintion
    // Zod does not allow `z.union(['b']), so we have to return just the value
    if (values.length === 1) {
      assert(values[0]);
      return values[0];
    }

    return buildStructSchema(
      s,
      'union',
      [f.createArrayLiteralExpression(values)],
      structProperties,
    );
  }

  if (ts.isTupleTypeNode(typeNode)) {
    const values = typeNode.elements.map((i) =>
      buildStructPrimitive({
        s: s,
        typeNode: ts.isNamedTupleMember(i) ? i.type : i,
        isOptional: false,
        jsDocTags: {},
        sourceFile,
        dependencies,
        getDependencyName,
      }),
    );
    return buildStructSchema(
      s,
      'tuple',
      [f.createArrayLiteralExpression(values)],
      structProperties,
    );
  }

  if (ts.isLiteralTypeNode(typeNode)) {
    if (ts.isStringLiteral(typeNode.literal)) {
      return buildStructSchema(
        s,
        'literal',
        [f.createStringLiteral(typeNode.literal.text)],
        structProperties,
      );
    }

    if (ts.isNumericLiteral(typeNode.literal)) {
      return buildStructSchema(
        s,
        'literal',
        [f.createNumericLiteral(typeNode.literal.text)],
        structProperties,
      );
    }

    if (typeNode.literal.kind === ts.SyntaxKind.TrueKeyword) {
      return buildStructSchema(s, 'literal', [f.createTrue()], structProperties);
    }

    if (typeNode.literal.kind === ts.SyntaxKind.FalseKeyword) {
      return buildStructSchema(s, 'literal', [f.createFalse()], structProperties);
    }
  }

  // Deal with enums used as literals
  if (
    ts.isTypeReferenceNode(typeNode) &&
    ts.isQualifiedName(typeNode.typeName) &&
    ts.isIdentifier(typeNode.typeName.left)
  ) {
    return buildStructSchema(
      s,
      'literal',
      [f.createPropertyAccessExpression(typeNode.typeName.left, typeNode.typeName.right)],
      structProperties,
    );
  }

  if (ts.isArrayTypeNode(typeNode)) {
    return buildStructSchema(
      s,
      'array',
      [
        buildStructPrimitive({
          s: s,
          typeNode: typeNode.elementType,
          isOptional: false,
          jsDocTags: {},
          sourceFile,
          dependencies,
          getDependencyName,
        }),
      ],
      structProperties,
    );
  }

  if (ts.isTypeLiteralNode(typeNode)) {
    return withStructProperties(
      buildStructObject({
        typeNode,
        z: s,
        sourceFile,
        dependencies,
        getDependencyName,
      }),
      structProperties,
    );
  }

  if (ts.isIntersectionTypeNode(typeNode)) {
    const [base, ...rest] = typeNode.types;
    assert(base);
    const basePrimitive = buildStructPrimitive({
      s: s,
      typeNode: base,
      isOptional: false,
      jsDocTags: {},
      sourceFile,
      dependencies,
      getDependencyName,
    });

    return rest.reduce(
      (intersectionSchema, node) =>
        f.createCallExpression(
          f.createPropertyAccessExpression(intersectionSchema, f.createIdentifier('and')),
          undefined,
          [
            buildStructPrimitive({
              s: s,
              typeNode: node,
              isOptional: false,
              jsDocTags: {},
              sourceFile,
              dependencies,
              getDependencyName,
            }),
          ],
        ),
      basePrimitive,
    );
  }

  if (ts.isLiteralTypeNode(typeNode)) {
    return buildStructSchema(s, typeNode.literal.getText(sourceFile), [], structProperties);
  }

  if (ts.isFunctionTypeNode(typeNode)) {
    return buildStructSchema(
      s,
      'function',
      [],
      [
        {
          identifier: 'args',
          expressions: typeNode.parameters.map((p) =>
            buildStructPrimitive({
              s: s,
              typeNode: p.type || f.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
              jsDocTags,
              sourceFile,
              dependencies,
              getDependencyName,
              isOptional: false,
            }),
          ),
        },
        {
          identifier: 'returns',
          expressions: [
            buildStructPrimitive({
              s: s,
              typeNode: typeNode.type,
              jsDocTags,
              sourceFile,
              dependencies,
              getDependencyName,
              isOptional: false,
            }),
          ],
        },
        ...structProperties,
      ],
    );
  }

  switch (typeNode.kind) {
    case ts.SyntaxKind.StringKeyword:
      return buildStructSchema(s, 'string', [], structProperties);
    case ts.SyntaxKind.BooleanKeyword:
      return buildStructSchema(s, 'boolean', [], structProperties);
    case ts.SyntaxKind.UndefinedKeyword:
      return buildStructSchema(s, 'undefined', [], structProperties);
    case ts.SyntaxKind.NumberKeyword:
      return buildStructSchema(s, 'number', [], structProperties);
    case ts.SyntaxKind.AnyKeyword:
      return buildStructSchema(s, 'any', [], structProperties);
    case ts.SyntaxKind.BigIntKeyword:
      return buildStructSchema(s, 'bigint', [], structProperties);
    case ts.SyntaxKind.VoidKeyword:
      return buildStructSchema(s, 'void', [], structProperties);
    case ts.SyntaxKind.NeverKeyword:
      return buildStructSchema(s, 'never', [], structProperties);
  }

  // eslint-disable-next-line no-console
  console.warn(
    ` »   Warning: '${ts.SyntaxKind[typeNode.kind]}' is not supported, fallback into 's.any()'`,
  );
  return buildStructSchema(s, 'any', [], structProperties);
}

/**
 * Build a struct schema.
 *
 * @param s Struct namespace
 * @param callName struct function
 * @param args Args to add to the main struct call, if any
 * @param properties An array of flags that should be added as extra property calls such as optional to add .optional()
 */
function buildStructSchema(
  s: string,
  callName: string,
  args?: ts.Expression[],
  properties?: StructProperty[],
) {
  const structCall = f.createCallExpression(
    f.createPropertyAccessExpression(f.createIdentifier(s), f.createIdentifier(callName)),
    undefined,
    args,
  );
  return withStructProperties(structCall, properties);
}

/**
 * Apply superstruct properties to an expression (as `optional()`)
 *
 * @param expression
 * @param properties
 */
function withStructProperties(expression: ts.Expression, properties: StructProperty[] = []) {
  return properties.reduce(
    (expressionWithProperties, property) =>
      f.createCallExpression(
        f.createPropertyAccessExpression(
          expressionWithProperties,
          f.createIdentifier(property.identifier),
        ),
        undefined,
        property.expressions ? property.expressions : undefined,
      ),
    expression,
  ) as ts.CallExpression;
}

/**
 * Build z.object (with support of index signature)
 */
function buildStructObject({
  typeNode,
  z,
  dependencies,
  sourceFile,
  getDependencyName,
  baseSchema,
}: {
  typeNode: ts.TypeLiteralNode | ts.InterfaceDeclaration;
  z: string;
  dependencies: string[];
  sourceFile: ts.SourceFile;
  getDependencyName: Required<GenerateStructSchemaProps>['getDependencyName'];
  baseSchema?: string;
}) {
  const { properties, indexSignature } = typeNode.members.reduce<{
    properties: ts.PropertySignature[];
    indexSignature?: ts.IndexSignatureDeclaration;
  }>(
    (mem, member) => {
      if (ts.isIndexSignatureDeclaration(member)) {
        return {
          ...mem,
          indexSignature: member,
        };
      }

      if (ts.isPropertySignature(member)) {
        return {
          ...mem,
          properties: [...mem.properties, member],
        };
      }

      return mem;
    },
    { properties: [] },
  );

  let objectSchema: ts.CallExpression | undefined;

  if (properties.length > 0) {
    const parsedProperties = buildZodProperties({
      members: properties,
      structImportValue: z,
      sourceFile,
      dependencies,
      getDependencyName,
    });

    objectSchema = buildStructSchema(baseSchema || z, baseSchema ? 'extend' : 'object', [
      f.createObjectLiteralExpression(
        [...parsedProperties.entries()].map(([key, tsCall]) => {
          return f.createPropertyAssignment(key, tsCall);
        }),
        true,
      ),
    ]);
  }

  if (indexSignature) {
    if (baseSchema) {
      throw new Error('interface with `extends` and index signature are not supported!');
    }

    const indexSignatureSchema = buildStructSchema(z, 'record', [
      // Index signature type can't be optional or have validators.
      buildStructPrimitive({
        s: z,
        typeNode: indexSignature.type,
        isOptional: false,
        jsDocTags: {},
        sourceFile,
        dependencies,
        getDependencyName,
      }),
    ]);

    if (objectSchema) {
      return f.createCallExpression(
        f.createPropertyAccessExpression(indexSignatureSchema, f.createIdentifier('and')),
        undefined,
        [objectSchema],
      );
    }

    return indexSignatureSchema;
  } else if (objectSchema) {
    return objectSchema;
  }

  return buildStructSchema(z, 'object', [f.createObjectLiteralExpression()]);
}
