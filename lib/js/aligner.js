'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBlankAlignmentDataForVerse = exports.generateWordBank = exports.generateBlankAlignments = exports.getWordsFromVerseObjects = exports.verseHasAlignments = exports.flattenArray = exports.sortWordObjectsByString = exports.wordObjectArrayFromString = exports.populateOccurrencesInWordObjects = exports.combineVerseArray = exports.getWordText = exports.unmerge = exports.orderAlignments = exports.indexOfMilestone = exports.indexOfFirstMilestone = exports.addVerseObjectToAlignment = exports.merge = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.verseStringWordsContainedInAlignments = verseStringWordsContainedInAlignments;

var _verseObjects = require('./helpers/verseObjects');

var VerseObjectHelpers = _interopRequireWildcard(_verseObjects);

var _array = require('./helpers/array');

var ArrayHelpers = _interopRequireWildcard(_array);

var _stringPunctuationTokenizer = require('string-punctuation-tokenizer');

var _stringPunctuationTokenizer2 = _interopRequireDefault(_stringPunctuationTokenizer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @description pivots alignments into bottomWords/targetLanguage verseObjectArray sorted by verseText
 * @param {Array} alignments - array of aligned word objects {bottomWords, topWords}
 * @param {Array} wordBank - array of topWords
 * @param {String} verseString - The string to base the bottomWords sorting
 * @return {Array} - sorted array of verseObjects to be used for verseText of targetLanguage
 */
var merge = exports.merge = function merge(alignments, wordBank, verseString) {
  var verseObjects = void 0; // array to return
  // get the definitive list of verseObjects from the verse, unaligned but in order
  var unalignedOrdered = VerseObjectHelpers.getOrderedVerseObjectsFromString(verseString);
  // assign verseObjects with unaligned objects to be replaced with aligned ones
  verseObjects = JSON.parse((0, _stringify2.default)(unalignedOrdered));
  // check each word in the verse string is also in the word bank or alignments
  var vereseObjectsNotInAlignmentData = verseStringWordsContainedInAlignments(alignments, wordBank, verseObjects);
  if (vereseObjectsNotInAlignmentData.length > 0) {
    var verseWordsJoined = vereseObjectsNotInAlignmentData.map(function (_ref) {
      var text = _ref.text;
      return text;
    }).join(', ');
    throw { message: 'The words "' + verseWordsJoined + '" from the target language verse are not in the alignment data.', type: 'InvalidatedAlignments' };
  }
  // each wordBank object should result in one verseObject
  wordBank.forEach(function (bottomWord) {
    var verseObject = VerseObjectHelpers.wordVerseObjectFromBottomWord(bottomWord);
    var index = VerseObjectHelpers.indexOfVerseObject(unalignedOrdered, verseObject);
    if (index > -1) verseObjects[index] = verseObject;else {
      throw { message: 'Word: ' + bottomWord.word + ' missing from word bank.', type: 'InvalidatedAlignments' };
    }
  });
  var indicesToDelete = [];
  // each alignment should result in one verseObject
  alignments.forEach(function (alignment) {
    var topWords = alignment.topWords,
        bottomWords = alignment.bottomWords;
    // each bottomWord results in a nested verseObject of tag: w, type: word
    // located inside innermost nested topWord/k verseObject

    var replacements = {};
    bottomWords.forEach(function (bottomWord) {
      var verseObject = VerseObjectHelpers.wordVerseObjectFromBottomWord(bottomWord);
      var index = VerseObjectHelpers.indexOfVerseObject(unalignedOrdered, verseObject);
      if (index === -1) {
        throw { message: "VerseObject not found in verseText while merging:" + (0, _stringify2.default)(verseObject), type: 'InvalidatedAlignments' };
      }
      replacements[index] = verseObject;
    });
    // each topWord results in a nested verseObject of tag: k, type: milestone
    var milestones = topWords.map(function (topWord) {
      return VerseObjectHelpers.milestoneVerseObjectFromTopWord(topWord);
    });
    var indices = (0, _keys2.default)(replacements);
    // group consecutive indexes so that they can be aggregated
    var groupedConsecutiveIndices = ArrayHelpers.groupConsecutiveNumbers(indices);
    // loop through groupedConsecutiveIndices to reduce and place where needed.
    groupedConsecutiveIndices.forEach(function (consecutiveIndices) {
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
      var milestone = VerseObjectHelpers.nestMilestones(milestones);
      // replace the original verseObject from the verse text with the aligned milestone verseObject
      verseObjects[indexToReplace] = milestone;
    });
  });
  // deleteIndices that were queued due to consecutive bottomWords in alignments
  verseObjects = ArrayHelpers.deleteIndices(verseObjects, indicesToDelete);
  return verseObjects;
};

/**
 * Determines if the given verse objects from a string are contained in
 * the given alignments
 *
 * @param {Array} alignments - array of aligned word objects {bottomWords, topWords}
 * @param {Array} wordBank - array of unused topWords for aligning
 * @param {Object} verseObjects - verse objects from verse string to be checked
 * @return {boolean} - returns if the given verse objects from a string are contained in
 * the given alignments
 */
// helpers
function verseStringWordsContainedInAlignments(alignments, wordBank, verseObjects) {
  return verseObjects.filter(function (verseObject) {
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
}

/**
 * @description test to see if this is the same milestone (needed when milestones are not contiguous)
 * @param {Object} a - First milestone to test
 * @param {Object} b - Second milestone to test
 * @return {boolean} true if same milestone
 */
var sameMilestone = function sameMilestone(a, b) {
  var same = a.type === b.type && a.content === b.content && a.occurrence === b.occurrence;
  return same;
};

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

      if (baseMilestone.alignment && sameMilestone(baseMilestone.milestone, newMilestone)) {
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
 * @description adds verse object to alignment
 * @param {Object} verseObject - Verse object to be added
 * @param {Object} alignment - The alignment object that will be added to
 */
var addVerseObjectToAlignment = exports.addVerseObjectToAlignment = function addVerseObjectToAlignment(verseObject, alignment) {
  if (verseObject.type === 'milestone' && verseObject.children.length > 0) {
    var wordObject = VerseObjectHelpers.alignmentObjectFromVerseObject(verseObject);
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
    var _wordObject2 = VerseObjectHelpers.alignmentObjectFromVerseObject(verseObject);
    alignment.bottomWords.push(_wordObject2);
  }
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
  if (typeof alignmentVerse === 'string') {
    alignmentVerse = VerseObjectHelpers.getOrderedVerseObjectsFromString(alignmentVerse);
  } else {
    alignmentVerse = VerseObjectHelpers.getOrderedVerseObjects(alignmentVerse);
  }
  if (Array.isArray(alignmentVerse)) {
    var alignment = [];
    // order alignments
    for (var i = 0; i < alignmentVerse.length; i++) {
      var nextWord = alignmentVerse[i];
      var index = indexOfFirstMilestone(alignmentUnOrdered, nextWord);
      if (index < 0 && nextWord.type === 'word' && i < alignmentVerse.length - 1) {
        var wordAfter = alignmentVerse[i + 1];
        if (wordAfter.type === 'text') {
          // maybe this was punctuation split from word
          nextWord.text += wordAfter.text; // add possible punctuation
          index = indexOfFirstMilestone(alignmentUnOrdered, nextWord); // try again
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
          var wordObject = VerseObjectHelpers.alignmentObjectFromVerseObject(nextWord);
          alignment.push({ topWords: [wordObject], bottomWords: [] });
        }
      }
    }
    if (alignmentUnOrdered.length > 0) {
      alignment = alignment.concat(alignmentUnOrdered);
    }
    return alignment;
  }
  return alignmentUnOrdered;
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
    alignedVerse = VerseObjectHelpers.getWordList(alignedVerse);
  }
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = (0, _getIterator3.default)(verseObjects), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var verseObject = _step3.value;

      var _alignment2 = getAlignmentForMilestone(baseMilestones, verseObject);
      if (!_alignment2) {
        _alignment2 = { topWords: [], bottomWords: [] };
        alignments.push(_alignment2);
        baseMilestones.push({ alignment: _alignment2, milestone: verseObject });
      }
      addVerseObjectToAlignment(verseObject, _alignment2);
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  var alignmentUnOrdered = [];
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = (0, _getIterator3.default)(alignments), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var _alignment = _step4.value;

      if (_alignment.topWords.length > 0) {
        alignmentUnOrdered.push(_alignment);
      } else {
        wordBank = wordBank.concat(_alignment.bottomWords);
      }
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  var alignment = orderAlignments(alignedVerse, alignmentUnOrdered);
  return { alignment: alignment, wordBank: wordBank };
};

/**
 * get text from word type verse object or word object
 * @param {object} wordObject - Word object to get text from
 * @return {string|undefined} text from word object
 */
var getWordText = exports.getWordText = function getWordText(wordObject) {
  if (wordObject && wordObject.type === 'word') {
    return wordObject.text;
  }
  return wordObject ? wordObject.word : undefined;
};

/**
 * Concatenates an array of words into a verse.
 * @param {array} verseArray - array of strings in a verse.
 * @return {string} combined verse
 */
var combineVerseArray = exports.combineVerseArray = function combineVerseArray(verseArray) {
  return verseArray.map(function (o) {
    return getWordText(o);
  }).join(' ');
};

/**
 * create an array of word objects with occurrence(s)
 * @param {String|Array|Object} words - List of words without occurrences
 * @return {Array} - array of wordObjects
 */
var populateOccurrencesInWordObjects = exports.populateOccurrencesInWordObjects = function populateOccurrencesInWordObjects(words) {
  words = VerseObjectHelpers.getWordList(words);
  var index = 0; // only count verseObject words
  return words.map(function (wordObject) {
    var wordText = getWordText(wordObject);
    if (wordText) {
      // if verseObject is word
      wordObject.occurrence = VerseObjectHelpers.getOccurrence(words, index++, wordText);
      wordObject.occurrences = VerseObjectHelpers.getOccurrences(words, wordText);
      return wordObject;
    }
    return null;
  }).filter(function (wordObject) {
    return wordObject !== null;
  });
};

/**
 * @description wordObjectArray via string
 * @param {String} string - The string to search in
 * @return {Array} - array of wordObjects
 */
var wordObjectArrayFromString = exports.wordObjectArrayFromString = function wordObjectArrayFromString(string) {
  var wordObjectArray = _stringPunctuationTokenizer2.default.tokenize(string).map(function (word, index) {
    var occurrence = _stringPunctuationTokenizer2.default.occurrenceInString(string, index, word);
    var occurrences = _stringPunctuationTokenizer2.default.occurrencesInString(string, word);
    return {
      word: word,
      occurrence: occurrence,
      occurrences: occurrences
    };
  });
  return wordObjectArray;
};

/**
 * @description sorts wordObjectArray via string
 * @param {Array} wordObjectArray - array of wordObjects
 * @param {String|Array|Object} stringData - The string to search in
 * @return {Array} - sorted array of wordObjects
 */
var sortWordObjectsByString = exports.sortWordObjectsByString = function sortWordObjectsByString(wordObjectArray, stringData) {
  if (stringData.verseObjects) {
    stringData = populateOccurrencesInWordObjects(stringData.verseObjects);
  } else if (Array.isArray(stringData)) {
    stringData = populateOccurrencesInWordObjects(stringData);
  } else {
    stringData = wordObjectArrayFromString(stringData);
  }
  var _wordObjectArray = wordObjectArray.map(function (wordObject) {
    var word = wordObject.word,
        occurrence = wordObject.occurrence,
        occurrences = wordObject.occurrences;

    var _wordObject = {
      word: word,
      occurrence: occurrence,
      occurrences: occurrences
    };
    var indexInString = stringData.findIndex(function (object) {
      var equal = getWordText(object) === getWordText(_wordObject) && object.occurrence === _wordObject.occurrence && object.occurrences === _wordObject.occurrences;
      return equal;
    });
    wordObject.index = indexInString;
    return wordObject;
  });
  _wordObjectArray = _wordObjectArray.sort(function (a, b) {
    return a.index - b.index;
  });
  _wordObjectArray = _wordObjectArray.map(function (wordObject) {
    delete wordObject.index;
    return wordObject;
  });
  return _wordObjectArray;
};

/**
 * Helper function to flatten a double nested array
 * @param {array} arr - Array to be flattened
 * @return {array} - Flattened array
 */
var flattenArray = exports.flattenArray = function flattenArray(arr) {
  var _ref4;

  return (_ref4 = []).concat.apply(_ref4, (0, _toConsumableArray3.default)(arr));
};

/**
 * Helper method to find if the given alignments object actually
 * has aligned data. If not we do not want to show the reset dialog
 *
 * @param {array} alignments - alignments object with array of top words/bottom words
 * @return {boolean} - Whether or not the verse has alignments
 */
var verseHasAlignments = exports.verseHasAlignments = function verseHasAlignments(_ref5) {
  var alignments = _ref5.alignments;

  if (alignments) {
    return alignments.filter(function (_ref6) {
      var bottomWords = _ref6.bottomWords;

      return bottomWords.length > 0;
    }).length > 0;
  }
};

/**
 * Helper method to grab only verse objects or childen of verse objects but
 * not grab verse objects containing children.
 * i.e. given {a:1, b:{2, children:{2a, 2b}} returns 1, 2a, 2b (skips 2)
 *
 * @param {array} verseObjects - Objects containing data for the words such as
 * occurences, occurence, tag, text and type
 * @return {array} - same format as input, except objects containing childern
 * get flatten to top level
 */
var getWordsFromVerseObjects = exports.getWordsFromVerseObjects = function getWordsFromVerseObjects(verseObjects) {
  var wordObjects = verseObjects.map(function (versebject) {
    if (versebject.children) {
      return getWordsFromVerseObjects(versebject.children);
    }
    return versebject;
  });
  return flattenArray(wordObjects);
};

/**
 * @description - generates the word alignment tool alignmentData from the UGNT verseData
 * @param {String|Array|Object} verseData - array of verseObjects
 * @return {Array} alignmentObjects from verse text
 */
var generateBlankAlignments = exports.generateBlankAlignments = function generateBlankAlignments(verseData) {
  var wordList = VerseObjectHelpers.getWordList(verseData);
  var alignments = wordList.map(function (wordData, index) {
    var word = wordData.word || wordData.text;
    var occurrences = VerseObjectHelpers.getOccurrences(wordList, word);
    var occurrence = VerseObjectHelpers.getOccurrence(wordList, index, word);
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
  var verseWords = VerseObjectHelpers.getWordList(verseData);
  var wordBank = verseWords.map(function (object, index) {
    var word = object.text;
    var occurrences = VerseObjectHelpers.getOccurrences(verseWords, word);
    var occurrence = VerseObjectHelpers.getOccurrence(verseWords, index, word);
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