'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBlankAlignmentDataForVerse = exports.generateWordBank = exports.generateBlankAlignments = exports.verseHasAlignments = exports.unmerge = exports.addVerseObjectToAlignment = exports.orderAlignments = exports.indexOfMilestone = exports.indexOfFirstMilestone = exports.merge = exports.hasAlignments = undefined;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.verseStringWordsContainedInAlignments = verseStringWordsContainedInAlignments;

var _verseObjects = require('./utils/verseObjects');

var VerseObjectUtils = _interopRequireWildcard(_verseObjects);

var _array = require('./utils/array');

var ArrayUtils = _interopRequireWildcard(_array);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * check if there were any alignments
 * @param {Array} alignments - alginments to be checked
 * @return {boolean} true if an alignment was found
 */
/**
 *
 * @file   Contains the logic for aligning words.
 * @author unfoldingWord
 */

// helpers
var hasAlignments = exports.hasAlignments = function hasAlignments(alignments) {
  var indexFirstAlignment = alignments.findIndex(function (alignment) {
    return alignment.bottomWords.length > 0;
  });
  return indexFirstAlignment >= 0;
};

/**
 * @description pivots alignments into bottomWords/targetLanguage verseObjectArray sorted by verseText
 * @param {Array} alignments - array of aligned word objects {bottomWords, topWords}
 * @param {Array} wordBank - array of topWords
 * @param {String} verseString - The string to base the bottomWords sorting
 * @param {Boolean} useVerseText - if true, then return parsed verse text if unaligned verse has changed, otherwise return null
 * @return {Array} - sorted array of verseObjects to be used for verseText of targetLanguage
 */
var merge = exports.merge = function merge(alignments, wordBank, verseString) {
  var useVerseText = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  // get the definitive list of verseObjects from the verse, unaligned but in order
  var _VerseObjectUtils$get = VerseObjectUtils.getOrderedVerseObjectsFromString(verseString),
      unalignedOrdered = _VerseObjectUtils$get.newVerseObjects,
      wordMap = _VerseObjectUtils$get.wordMap;
  // assign verseObjects with unaligned objects to be replaced with aligned ones
  // check each word in the verse string is also in the word bank or alignments


  var verseObjectsNotInAlignmentData = verseStringWordsContainedInAlignments(alignments, wordBank, wordMap);
  if (verseObjectsNotInAlignmentData.length > 0) {
    if (hasAlignments(alignments)) {
      // if verse has some alignments
      var verseWordsJoined = verseObjectsNotInAlignmentData.map(function (_ref) {
        var text = _ref.text;
        return text;
      }).join(', ');
      throw {
        message: 'The words "' + verseWordsJoined + '" from the target language verse are not in the alignment data.',
        type: 'InvalidatedAlignments'
      };
    } else {
      // if verse had no alignments
      return useVerseText ? unalignedOrdered : null; // use parsed verse text
    }
  }
  // each wordBank object should result in one verseObject
  var wbLen = wordBank.length;
  for (var i = 0; i < wbLen; i++) {
    var bottomWord = wordBank[i];
    var verseObject = VerseObjectUtils.wordVerseObjectFromBottomWord(bottomWord);
    var index = VerseObjectUtils.indexOfVerseObject(wordMap, verseObject);
    if (index > -1) {
      var location = wordMap[index];
      location.array[location.pos] = verseObject;
    } else if (hasAlignments(alignments)) {
      // if verse has some alignments
      throw { message: 'Word "' + bottomWord.word + '" is in wordBank, but missing from target language verse.', type: 'InvalidatedAlignments' };
    } else {
      // if verse had no alignments
      return useVerseText ? unalignedOrdered : null; // use parsed verse text
    }
  }
  var indicesToDelete = [];
  // each alignment should result in one verseObject
  var aLen = alignments.length;

  var _loop = function _loop(_i) {
    var alignment = alignments[_i];
    var topWords = alignment.topWords,
        bottomWords = alignment.bottomWords;
    // each bottomWord results in a nested verseObject of tag: w, type: word
    // located inside innermost nested topWord/k verseObject

    var replacements = {};
    var bwLen = bottomWords.length;
    for (var j = 0; j < bwLen; j++) {
      var _bottomWord = bottomWords[j];
      var _verseObject2 = VerseObjectUtils.wordVerseObjectFromBottomWord(_bottomWord);
      var _index = VerseObjectUtils.indexOfVerseObject(wordMap, _verseObject2);
      if (_index === -1) {
        throw { message: "VerseObject not found in verseText while merging:" + (0, _stringify2.default)(_verseObject2), type: 'InvalidatedAlignments' };
      }
      replacements[_index] = _verseObject2;
    }
    // each topWord results in a nested verseObject of tag: k, type: milestone
    var milestones = topWords.map(function (topWord) {
      return VerseObjectUtils.milestoneVerseObjectFromTopWord(topWord);
    });
    var indices = (0, _keys2.default)(replacements);
    // group consecutive indexes so that they can be aggregated
    var groupedConsecutiveIndices = ArrayUtils.groupConsecutiveNumbers(indices, wordMap);
    // loop through groupedConsecutiveIndices to reduce and place where needed.
    var gLen = groupedConsecutiveIndices.length;
    for (var _j = 0; _j < gLen; _j++) {
      var consecutiveIndices = groupedConsecutiveIndices[_j];
      // map the consecutiveIndices to replacement verseObjects
      var replacementVerseObjects = consecutiveIndices.map(function (index) {
        return replacements[index];
      });
      // remove and use the first index in group to place the aligned verseObject milestone later
      var indexToReplace = consecutiveIndices.shift();
      // the rest of the consecutiveIndices need to be queued to be deleted later after shift
      indicesToDelete = indicesToDelete.concat(consecutiveIndices);
      // place the replacementVerseObjects in the last milestone as children
      milestones[milestones.length - 1].children = replacementVerseObjects;
      // nest the milestones so that the first is the parent and each subsequent is nested
      var milestone = VerseObjectUtils.nestMilestones(milestones);
      // replace the original verseObject from the verse text with the aligned milestone verseObject
      var _location = wordMap[indexToReplace];
      _location.array[_location.pos] = milestone;
    }
  };

  for (var _i = 0; _i < aLen; _i++) {
    _loop(_i);
  }
  // deleteIndices that were queued due to consecutive bottomWords in alignments
  var verseObjects = ArrayUtils.deleteIndices(unalignedOrdered, indicesToDelete, wordMap);
  return verseObjects;
};

/**
 * Determines if the given verse objects from a string are contained in
 * the given alignments
 *
 * @param {Array} alignments - array of aligned word objects {bottomWords, topWords}
 * @param {Array} wordBank - array of unused topWords for aligning
 * @param {Array} wordMap - ordered map of word locations in verseObjects
 * @return {Array} - returns array of word verse objects from a string that are not contained in
 *                      the given alignments
 */
function verseStringWordsContainedInAlignments(alignments, wordBank, wordMap) {
  var unalignedMap = wordMap.filter(function (wordItem) {
    var verseObject = wordItem.array[wordItem.pos];
    var checkIfWordMatches = function checkIfWordMatches(verseObject) {
      return function (_ref2) {
        var word = _ref2.word,
            occurrence = _ref2.occurrence,
            occurrences = _ref2.occurrences;

        var verseObjectWord = verseObject.text;
        var verseObjectOccurrence = verseObject.occurrence;
        var verseObjectOccurrences = verseObject.occurrences;
        return word === verseObjectWord && occurrence === verseObjectOccurrence && occurrences === verseObjectOccurrences;
      };
    };
    if (verseObject.type !== 'word') return false;
    var wordCheckerFunction = checkIfWordMatches(verseObject);
    var containedInWordBank = Boolean(wordBank.find(wordCheckerFunction));
    var containedInAlignments = Boolean(alignments.find(function (_ref3) {
      var bottomWords = _ref3.bottomWords;

      return Boolean(bottomWords.find(wordCheckerFunction));
    }));
    return !containedInWordBank && !containedInAlignments;
  });
  return unalignedMap.map(function (location) {
    return location.array[location.pos];
  });
}

/**
 * @description find the alignment to use for this milestone.  If milestone has already been given an alignment, then
 *                use that one.  Otherwise return null.  This is needed because milestones are not always
 *                contiguous.
 * @param {Array} baseMilestones - already found base milestones.
 * @param {Object} newMilestone - milestone not yet given an alignment
 * @return {Object} previous Alignment if found - else null.
 */
var getAlignmentForMilestone = function getAlignmentForMilestone(baseMilestones, newMilestone) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = (0, _getIterator3.default)(baseMilestones), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var baseMilestone = _step.value;

      if (baseMilestone.alignment && VerseObjectUtils.sameMilestone(baseMilestone.milestone, newMilestone)) {
        return baseMilestone.alignment;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return null;
};

/**
 * compare occurrences of a and b, and handle conversion to int if necessary
 * @param {Object} a - first occurrences value
 * @param {Object} b - second occurrence value
 * @return {boolean} - if they are the same or not
 */
var compareOccurrences = function compareOccurrences(a, b) {
  var sameOccurrence = a.occurrence === b.occurrence;
  if (!sameOccurrence && a.occurrence && b.occurrence) {
    if ((0, _typeof3.default)(a.occurrence) !== (0, _typeof3.default)(b.occurrence)) {
      // one may be string and the other an int
      var occurrence1 = typeof a.occurrence === 'string' ? parseInt(a.occurrence, 10) : a.occurrence;
      var occurrence2 = typeof b.occurrence === 'string' ? parseInt(b.occurrence, 10) : b.occurrence;
      sameOccurrence = occurrence1 === occurrence2 && occurrence1 !== 0;
    }
  }
  return sameOccurrence;
};

/**
 * @description returns index of the verseObject in the alignments first milestone (ignores occurrences since that can be off)
 * @param {Array} alignments - array of the alignments to search in
 * @param {Object} verseObject - verseObject to search for
 * @return {Int} - the index of the verseObject
 */
var indexOfFirstMilestone = exports.indexOfFirstMilestone = function indexOfFirstMilestone(alignments, verseObject) {
  var index = -1;
  if (verseObject.type === 'word') {
    index = alignments.findIndex(function (alignment) {
      if (alignment.topWords.length > 0) {
        var _verseObject = alignment.topWords[0];
        if (_verseObject.word === verseObject.text) {
          return compareOccurrences(_verseObject, verseObject);
        }
      }
      return false;
    });
  }
  return index;
};

/**
 * @description returns index of the verseObject in the alignments milestone (ignores occurrences since that can be off)
 * @param {Array} alignments - array of the alignments to search in
 * @param {Object} verseObject - verseObject to search for
 * @return {Int} - the index of the verseObject
 */
var indexOfMilestone = exports.indexOfMilestone = function indexOfMilestone(alignments, verseObject) {
  var index = -1;
  if (verseObject.type === 'word') {
    index = alignments.findIndex(function (alignment) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = (0, _getIterator3.default)(alignment.topWords), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _verseObject = _step2.value;

          if (_verseObject.word === verseObject.text) {
            return compareOccurrences(_verseObject, verseObject);
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return false;
    });
  }
  return index;
};

/**
 * @description uses the alignedVerseString to order alignments
 * @param {String|Array} alignmentVerse - optional alignment verse
 * @param {Array} alignmentUnOrdered - alignments to order
 * @return {Array} ordered alignments if alignment string given, else unordered alignments
 */
var orderAlignments = exports.orderAlignments = function orderAlignments(alignmentVerse, alignmentUnOrdered) {
  var orderedObjects = null;
  if (typeof alignmentVerse === 'string') {
    orderedObjects = VerseObjectUtils.getOrderedVerseObjectsFromString(alignmentVerse);
  } else {
    orderedObjects = VerseObjectUtils.getOrderedVerseObjects(alignmentVerse);
  }
  var wordMap = orderedObjects.wordMap;
  if (Array.isArray(wordMap)) {
    var alignment = [];
    // order alignments
    for (var i = 0; i < wordMap.length; i++) {
      var location = wordMap[i];
      var nextWord = location.array[location.pos];
      var index = indexOfFirstMilestone(alignmentUnOrdered, nextWord);
      if (index < 0 && nextWord.type === 'word' && i < wordMap.length - 1) {
        var verseObjectAfter = location.array[location.pos + 1];
        if (verseObjectAfter.type === 'text') {
          // maybe this was punctuation split from word
          var originalText = nextWord.text;
          nextWord.text += verseObjectAfter.text; // add possible punctuation
          index = indexOfFirstMilestone(alignmentUnOrdered, nextWord); // try again
          if (index < 0) {
            nextWord.text = originalText; // restore original text if not a match
          }
        }
      }
      if (index >= 0) {
        alignment.push(alignmentUnOrdered[index]);
        alignmentUnOrdered.splice(index, 1); // remove item
      } else if (nextWord.type === 'word') {
        // if not found, may be either an unaligned topWord or merged topWord
        index = indexOfMilestone(alignmentUnOrdered, nextWord);
        if (index < 0) {
          // if not found in unordered list, try already ordered
          index = indexOfMilestone(alignment, nextWord);
        }
        if (index < 0) {
          // if still not found in topWords, it's an unaligned topWord
          var wordObject = VerseObjectUtils.alignmentObjectFromVerseObject(nextWord);
          alignment.push({ topWords: [wordObject], bottomWords: [] });
        }
      }
    }
    if (alignmentUnOrdered.length > 0) {
      alignment.push.apply(alignment, alignmentUnOrdered); // fast concat
    }
    return alignment;
  }
  return alignmentUnOrdered;
};

/**
 * @description adds verse object to alignment
 * @param {Object} verseObject - The verse obejct to add to alignmer
 * @param {Object} alignment - pre-existing alignments
 */
var addVerseObjectToAlignment = exports.addVerseObjectToAlignment = function addVerseObjectToAlignment(verseObject, alignment) {
  if (verseObject.type === 'milestone' && verseObject.children.length > 0) {
    var wordObject = VerseObjectUtils.alignmentObjectFromVerseObject(verseObject);
    var duplicate = alignment.topWords.find(function (obj) {
      return obj.word === wordObject.word && obj.occurrence === wordObject.occurrence;
    });
    if (!duplicate) {
      alignment.topWords.push(wordObject);
    }
    verseObject.children.forEach(function (_verseObject) {
      addVerseObjectToAlignment(_verseObject, alignment);
    });
  } else if (verseObject.type === 'word' && !verseObject.children) {
    var _wordObject = VerseObjectUtils.alignmentObjectFromVerseObject(verseObject);
    alignment.bottomWords.push(_wordObject);
  }
};

/**
 * extracts alignment from verse object and adds to baseMilestones and alignments
 * @param {Array} baseMilestones - array of milestones found
 * @param {Object} verseObject - to add to arrays
 * @param {Array} alignments - array of alignments found
 */
var addAlignment = function addAlignment(baseMilestones, verseObject, alignments) {
  var alignment = getAlignmentForMilestone(baseMilestones, verseObject);
  if (!alignment) {
    alignment = { topWords: [], bottomWords: [] };
    alignments.push(alignment);
    baseMilestones.push({ alignment: alignment, milestone: verseObject });
  }
  addVerseObjectToAlignment(verseObject, alignment);
  if (verseObject.children && verseObject.type !== "milestone") {
    var length = verseObject.children.length;
    for (var i = 0; i < length; i++) {
      addAlignment(baseMilestones, verseObject.children[i], alignments);
    }
  }
};

/**
 * @description pivots alignments into bottomWords/targetLanguage verseObjectArray sorted by verseText
 * @param {Array} verseObjects - array of aligned verseObjects [{milestone children={verseObject}}, ...]
 * @param {Array|Object|String} alignedVerse - optional verse to use for ordering alignments
 * @return {Object} - object of alignments (array of alignments) and wordbank (array of unused words)
 */
var unmerge = exports.unmerge = function unmerge(verseObjects, alignedVerse) {
  var baseMilestones = [];
  var wordBank = [];
  var alignments = [];
  if (verseObjects && verseObjects.verseObjects) {
    verseObjects = verseObjects.verseObjects;
  }
  if (typeof alignedVerse !== 'string') {
    alignedVerse = VerseObjectUtils.getWordList(alignedVerse);
  }
  var len = verseObjects.length;
  for (var i = 0; i < len; i++) {
    var verseObject = verseObjects[i];
    addAlignment(baseMilestones, verseObject, alignments);
  }
  var alignmentUnOrdered = [];
  len = alignments.length;
  for (var _i2 = 0; _i2 < len; _i2++) {
    var _alignment = alignments[_i2];
    if (_alignment.topWords.length > 0) {
      alignmentUnOrdered.push(_alignment);
    } else {
      wordBank = wordBank.concat(_alignment.bottomWords);
    }
  }
  var alignment = orderAlignments(alignedVerse, alignmentUnOrdered);
  return { alignment: alignment, wordBank: wordBank };
};

/**
 * Helper method to find if the given alignments object actually
 * has aligned data. If not we do not want to show the reset dialog
 *
 * @param {array} alignments - alignments object with array of top words/bottom words
 * @return {boolean} - Whether or not the verse has alignments
 */
var verseHasAlignments = exports.verseHasAlignments = function verseHasAlignments(_ref4) {
  var alignments = _ref4.alignments;

  if (alignments) {
    return alignments.filter(function (_ref5) {
      var bottomWords = _ref5.bottomWords;

      return bottomWords.length > 0;
    }).length > 0;
  }
};

/**
 * @description - generates the word alignment tool alignmentData from the UGNT verseData
 * @param {String|Array|Object} verseData - array of verseObjects
 * @return {Array} alignmentObjects from verse text
 */
var generateBlankAlignments = exports.generateBlankAlignments = function generateBlankAlignments(verseData) {
  var wordList = VerseObjectUtils.getWordList(verseData);
  var alignments = wordList.map(function (wordData, index) {
    var word = wordData.word || wordData.text;
    var occurrences = VerseObjectUtils.getOccurrences(wordList, word);
    var occurrence = VerseObjectUtils.getOccurrence(wordList, index, word);
    var alignment = {
      topWords: [{
        word: word,
        strong: wordData.strong || wordData.strongs,
        lemma: wordData.lemma,
        morph: wordData.morph,
        occurrence: occurrence,
        occurrences: occurrences
      }],
      bottomWords: []
    };
    return alignment;
  });
  return alignments;
};

/**
 * @description - generates the word alignment tool word bank from targetLanguage verse
 * @param {String|Array|Object} verseData - string of the verseText in the targetLanguage
 * @return {Array} alignmentObjects from verse text
 */
var generateWordBank = exports.generateWordBank = function generateWordBank(verseData) {
  var verseWords = VerseObjectUtils.getWordList(verseData);
  var wordBank = verseWords.map(function (object, index) {
    var word = object.text;
    var occurrences = VerseObjectUtils.getOccurrences(verseWords, word);
    var occurrence = VerseObjectUtils.getOccurrence(verseWords, index, word);
    return {
      word: word,
      occurrence: occurrence,
      occurrences: occurrences
    };
  });
  return wordBank;
};

/**
 * Wrapper method for resetting alignments in verse to being blank alignments
 * i.e. (all words in word bank and not joined with alignments data)
 * Note: This method does not overwrite any data
 * @param {string} ugntVerse - Array of verse objects containing ugnt words
 * @param {string} targetLanguageVerse - Current target language string from the bibles reducer
 * @return {{alignments, wordBank}} - Reset alignments data
 */
var getBlankAlignmentDataForVerse = exports.getBlankAlignmentDataForVerse = function getBlankAlignmentDataForVerse(ugntVerse, targetLanguageVerse) {
  var alignments = generateBlankAlignments(ugntVerse);
  var wordBank = generateWordBank(targetLanguageVerse);
  return { alignments: alignments, wordBank: wordBank };
};