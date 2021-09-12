"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var semver = require("semver");

function hasUpperBound(range) {
  return !!(range = new semver.Range(range)) && range.set.every(function(subset) {
    return subset.some(function(comparator) {
      return comparator.operator.match(/^</) || "" === comparator.operator && "" !== comparator.value;
    });
  });
}

function upperBound(range) {
  return hasUpperBound(range = new semver.Range(range)) ? range.set.map(function(subset) {
    return subset.filter(function(comparator) {
      return /^</.test(comparator.operator) || "" === comparator.operator && "" !== comparator.value;
    });
  }).map(function(subset) {
    return subset.sort(function(a, b) {
      return semver.compare(a.semver, b.semver);
    })[0];
  }).sort(function(a, b) {
    return semver.rcompare(a.semver, b.semver);
  }).slice(0, 1).map(function(comparator) {
    return "" === comparator.operator ? "<=" + comparator.value : comparator.value;
  })[0] : null;
}

function hasLowerBound(range) {
  return !!(range = new semver.Range(range)) && range.set.every(function(subset) {
    return subset.some(function(comparator) {
      return comparator.operator.match(/^>/) || "" === comparator.operator && "" !== comparator.value;
    });
  });
}

function lowerBound(range) {
  return hasLowerBound(range = new semver.Range(range)) ? range.set.map(function(subset) {
    return subset.filter(function(comparator) {
      return /^>/.test(comparator.operator) || "" === comparator.operator && "" !== comparator.value;
    });
  }).map(function(subset) {
    return subset.sort(function(a, b) {
      return semver.compare(a.semver, b.semver);
    })[0];
  }).sort(function(a, b) {
    return semver.compare(a.semver, b.semver);
  }).slice(0, 1).map(function(comparator) {
    return "" === comparator.operator ? ">=" + comparator.value : comparator.value;
  })[0] : "0.0.0";
}

function getBoundsForRange(range) {
  return new semver.Range(range).set.map(function(comparatorSet) {
    var comparatorSetString = comparatorSet.map(function(x) {
      return x.value;
    }).join(" ");
    return {
      upperBound: upperBound(comparatorSetString),
      lowerBound: lowerBound(comparatorSetString)
    };
  });
}

function upperBoundOfRangeAWithinBoundsOfB(devDepRange, peerDepRange) {
  var devDepRangeBounds = getBoundsForRange(devDepRange);
  return getBoundsForRange(peerDepRange).some(function(peerDepRangeBound) {
    return devDepRangeBounds.some(function(devDepRangeBound) {
      return compareBounds(devDepRangeBound.upperBound, peerDepRangeBound.lowerBound) >= 0 && compareBounds(peerDepRangeBound.upperBound, devDepRangeBound.lowerBound) >= 0;
    });
  });
}

function compareBounds(boundA, boundB) {
  if (null === boundA && null === boundB) return 0;
  if (null === boundA) return 1;
  if (null === boundB) return -1;
  var compA = new semver.Comparator(boundA), compB = new semver.Comparator(boundB), versionComparison = semver.compare(compA.semver, compB.semver);
  return 0 !== versionComparison ? versionComparison : compA.operator === compB.operator ? 0 : /=/.test(compA.operator) ? 1 : -1;
}

function contains(rawRangeA, rawRangeB) {
  var rangeABounds = getBoundsForRange(rawRangeA);
  return getBoundsForRange(rawRangeB).every(function(bBounds) {
    return rangeABounds.some(function(aBounds) {
      var isInUpperBound = compareBounds(aBounds.upperBound, bBounds.upperBound) >= 0, isInLowerBound = compareBounds(aBounds.lowerBound, bBounds.lowerBound) <= 0;
      return isInUpperBound && isInLowerBound;
    });
  });
}

function highest(rawRanges) {
  var rangesWithBounds = rawRanges.map(function(rawRange) {
    return {
      range: rawRange,
      upperBound: upperBound(rawRange),
      lowerBound: lowerBound(rawRange)
    };
  });
  rangesWithBounds.sort(function(a, b) {
    var compA = new semver.Comparator(a.lowerBound), compB = new semver.Comparator(b.lowerBound);
    return semver.eq(compA.semver, compB.semver) ? compA.operator === compB.operator ? 0 : /=/.test(compA.operator) ? 1 : -1 : semver.compare(compA.semver, compB.semver);
  });
  var highestLowerBound = rangesWithBounds[rangesWithBounds.length - 1].lowerBound, rangesWithHighestLowerBound = rangesWithBounds.filter(function(x) {
    return x.lowerBound === highestLowerBound;
  });
  if (1 === rangesWithHighestLowerBound.length) return rangesWithHighestLowerBound[0].range;
  rangesWithHighestLowerBound.sort(function(a, b) {
    if (null === a.upperBound && null === b.upperBound) return 0;
    if (null === a.upperBound) return 1;
    if (null === b.upperBound) return -1;
    var compA = new semver.Comparator(a.upperBound), compB = new semver.Comparator(b.upperBound);
    return semver.eq(compA.semver, compB.semver) ? compA.operator === compB.operator ? 0 : /=/.test(compA.operator) ? 1 : -1 : semver.compare(compA.semver, compB.semver);
  });
  var highestUpperBound = rangesWithHighestLowerBound[rangesWithHighestLowerBound.length - 1].upperBound;
  return rangesWithHighestLowerBound.filter(function(x) {
    return x.upperBound === highestUpperBound;
  }).map(function(x) {
    return x.range;
  }).sort()[0];
}

exports.compareBounds = compareBounds, exports.contains = contains, exports.highest = highest, 
exports.upperBoundOfRangeAWithinBoundsOfB = upperBoundOfRangeAWithinBoundsOfB;
