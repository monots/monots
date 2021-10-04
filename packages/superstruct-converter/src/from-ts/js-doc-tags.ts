import { getJsDoc } from 'tsutils';
import ts from 'typescript';

const { factory: f } = ts;

/**
 * List of formats that can be translated in struct functions.
 */
const formats = [
  'email' as const,
  'uuid' as const,
  // "uri" as const,
  'url' as const,
  // "date" as const,
  // "date-time" as const,
];

/**
 * JSDoc special tags that can be converted in struct flags.
 */
export interface JSDocTags {
  minimum?: number;
  maximum?: number;
  default?: number | string | boolean;
  minLength?: number;
  maxLength?: number;
  format?: typeof formats[-1];
  pattern?: string;
}

/**
 * Typeguard to filter supported JSDoc tag key.
 *
 * @param tagName
 */
function isJSDocTagKey(tagName: string): tagName is keyof JSDocTags {
  const keys: Array<keyof JSDocTags> = [
    'minimum',
    'maximum',
    'default',
    'minLength',
    'maxLength',
    'format',
    'pattern',
  ];
  return (keys as string[]).includes(tagName);
}

/**
 * Typeguard to filter supported JSDoc format tag values.
 *
 * @param format
 */
function isSupportedFormat(format = ''): format is Required<JSDocTags>['format'] {
  return (formats as string[]).includes(format);
}

/**
 * Return parsed JSTags.
 *
 * @param nodeType
 * @param sourceFile
 * @returns Tags list
 */
export function getJSDocTags(nodeType: ts.Node, sourceFile: ts.SourceFile) {
  const jsDoc = getJsDoc(nodeType, sourceFile);
  const jsDocTags: JSDocTags = {};

  if (jsDoc.length > 0) {
    for (const doc of jsDoc) {
      for (const tag of doc.tags || []) {
        const tagName = tag.tagName.escapedText.toString();

        if (!isJSDocTagKey(tagName) || typeof tag.comment !== 'string') {
          continue;
        }

        switch (tagName) {
          case 'minimum':
          case 'maximum':
          case 'minLength':
          case 'maxLength':
            if (tag.comment && !Number.isNaN(Number.parseInt(tag.comment, 10))) {
              jsDocTags[tagName] = Number.parseInt(tag.comment, 10);
            }

            break;
          case 'pattern':
            if (tag.comment) {
              jsDocTags[tagName] = tag.comment;
            }

            break;
          case 'format':
            if (isSupportedFormat(tag.comment)) {
              jsDocTags[tagName] = tag.comment;
            }

            break;
          case 'default':
            if (
              tag.comment &&
              !tag.comment.includes('"') &&
              !Number.isNaN(Number.parseInt(tag.comment, 10))
            ) {
              // number
              jsDocTags[tagName] = Number.parseInt(tag.comment, 10);
            } else if (tag.comment && ['false', 'true'].includes(tag.comment)) {
              // boolean
              jsDocTags[tagName] = tag.comment === 'true';
            } else if (tag.comment?.startsWith('"') && tag.comment.endsWith('"')) {
              // string with double quotes
              jsDocTags[tagName] = tag.comment.slice(1, -1);
            } else if (tag.comment) {
              // string without quotes
              jsDocTags[tagName] = tag.comment;
            }

            break;
        }
      }
    }
  }

  return jsDocTags;
}

export interface StructProperty {
  identifier: string;
  expressions?: ts.Expression[];
}

/**
 * Convert a set of jsDocTags to struct properties
 *
 * @param jsDocTags
 * @param isOptional
 * @param isPartial
 * @param isRequired
 */
export function jsDocTagToStructProperties(
  jsDocTags: JSDocTags,
  isOptional: boolean,
  isPartial: boolean,
  isRequired: boolean,
) {
  const structProperties: StructProperty[] = [];

  if (jsDocTags.minimum !== undefined) {
    structProperties.push({
      identifier: 'min',
      expressions: [f.createNumericLiteral(jsDocTags.minimum)],
    });
  }

  if (jsDocTags.maximum !== undefined) {
    structProperties.push({
      identifier: 'max',
      expressions: [f.createNumericLiteral(jsDocTags.maximum)],
    });
  }

  if (jsDocTags.minLength !== undefined) {
    structProperties.push({
      identifier: 'min',
      expressions: [f.createNumericLiteral(jsDocTags.minLength)],
    });
  }

  if (jsDocTags.maxLength !== undefined) {
    structProperties.push({
      identifier: 'max',
      expressions: [f.createNumericLiteral(jsDocTags.maxLength)],
    });
  }

  if (jsDocTags.format) {
    structProperties.push({
      identifier: jsDocTags.format,
    });
  }

  if (jsDocTags.pattern) {
    structProperties.push({
      identifier: 'regex',
      expressions: [f.createRegularExpressionLiteral(`/${jsDocTags.pattern}/`)],
    });
  }

  if (isOptional) {
    structProperties.push({
      identifier: 'optional',
    });
  }

  if (isPartial) {
    structProperties.push({
      identifier: 'partial',
    });
  }

  if (isRequired) {
    structProperties.push({
      identifier: 'required',
    });
  }

  if (jsDocTags.default !== undefined) {
    structProperties.push({
      identifier: 'default',
      expressions:
        jsDocTags.default === true
          ? [f.createTrue()]
          : jsDocTags.default === false
          ? [f.createFalse()]
          : typeof jsDocTags.default === 'number'
          ? [f.createNumericLiteral(jsDocTags.default)]
          : [f.createStringLiteral(jsDocTags.default)],
    });
  }

  return structProperties;
}
