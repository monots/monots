'use strict';

const {
  diff
} = require('jest-diff');

const snapshot = require('jest-snapshot');

const reactSerializer = require('./react-serializer');

const defaultOptions = {
  expand: false,
  colors: false,
  contextLines: -1,
  // Forces to use default from Jest
  stablePatchmarks: false,
  aAnnotation: 'First value',
  bAnnotation: 'Second value'
};
const SNAPSHOT_TITLE = 'Snapshot Diff:\n';

const identity = value => value;

const defaultSerializers = [reactSerializer];
let serializers = defaultSerializers;

const snapshotDiff = (valueA, valueB, options) => {
  let difference;
  const mergedOptions = { ...defaultOptions,
    ...options
  };
  const matchingSerializer = serializers.find(({
    test
  }) => test(valueA) && test(valueB));

  if (matchingSerializer) {
    const {
      print,
      diffOptions
    } = matchingSerializer;
    const serializerOptions = diffOptions ? diffOptions(valueA, valueB) || undefined : undefined;
    difference = diffStrings(print(valueA, identity), print(valueB, identity), { ...mergedOptions,
      ...serializerOptions
    });
  } else {
    difference = diffStrings(valueA, valueB, mergedOptions);
  }

  if (mergedOptions.stablePatchmarks && !mergedOptions.expand) {
    difference = difference.replace(/^@@ -[0-9]+,[0-9]+ \+[0-9]+,[0-9]+ @@$/gm, '@@ --- --- @@');
  }

  return SNAPSHOT_TITLE + difference;
}; // https://github.com/facebook/jest/tree/d81464622dc8857ba995ed04e121af2b3e8e33bc/packages/jest-diff#example-of-options-for-no-colors


const noDiffColors = {
  aColor: identity,
  bColor: identity,
  changeColor: identity,
  commonColor: identity,
  patchColor: identity
};

function diffStrings(valueA, valueB, options) {
  return diff(valueA, valueB, {
    expand: options.expand,
    contextLines: options.contextLines,
    aAnnotation: options.aAnnotation,
    bAnnotation: options.bAnnotation,
    ...(!options.colors ? noDiffColors : {})
  });
}

function toMatchDiffSnapshot(valueA, valueB, options, testName) {
  const difference = snapshotDiff(valueA, valueB, options);
  return snapshot.toMatchSnapshot.call(this, difference, testName || '');
}

function getSnapshotDiffSerializer() {
  return {
    test(value) {
      return typeof value === 'string' && value.indexOf(SNAPSHOT_TITLE) === 0;
    },

    print(value) {
      return value;
    }

  };
}

function setSerializers(customSerializers) {
  serializers = customSerializers;
}

module.exports = snapshotDiff;
module.exports.snapshotDiff = snapshotDiff;
module.exports.toMatchDiffSnapshot = toMatchDiffSnapshot;
module.exports.getSnapshotDiffSerializer = getSnapshotDiffSerializer;
module.exports.setSerializers = setSerializers;
module.exports.defaultSerializers = defaultSerializers;