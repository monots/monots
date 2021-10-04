import ts, { factory as f, NodeFlags } from 'typescript';

/**
 * Type hint superstruct to deal with recursive types.
 *
 * https://docs.superstructjs.org/api-reference/utilities#lazy
 */
export function transformRecursiveSchema(
  structImportValue: string,
  structStatement: ts.VariableStatement,
  typeName: string,
): ts.VariableStatement {
  const declaration = structStatement.declarationList.declarations[0];

  if (!declaration?.initializer) {
    throw new Error('Invalid `superstruct` statement');
  }

  return f.createVariableStatement(
    structStatement.modifiers,
    f.createVariableDeclarationList(
      [
        f.createVariableDeclaration(
          declaration.name,
          undefined,
          f.createTypeReferenceNode(`${structImportValue}.Describe`, [
            f.createTypeReferenceNode(typeName),
          ]),
          f.createCallExpression(
            f.createPropertyAccessExpression(
              f.createIdentifier(structImportValue),
              f.createIdentifier('lazy'),
            ),
            undefined,
            [
              f.createArrowFunction(
                undefined,
                undefined,
                [],
                undefined,
                undefined,
                declaration.initializer,
              ),
            ],
          ),
        ),
      ],
      NodeFlags.Const,
    ),
  );
}
