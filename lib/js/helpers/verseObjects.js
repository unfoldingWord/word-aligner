'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getWordList = exports.getWordListForVerse = exports.getWordListFromVerseObjectArray = exports.mergeVerseData = exports.extractWordsFromVerseObject = exports.indexOfVerseObject = exports.alignmentObjectFromVerseObject = exports.milestoneVerseObjectFromTopWord = exports.wordVerseObjectFromBottomWord = exports.nestMilestones = exports.getOrderedVerseObjectsFromString = exports.getOrderedVerseObjects = exports.getOccurrences = exports.getOccurrence = undefined;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _usfmJs = require('usfm-js');

var _usfmJs2 = _interopRequireDefault(_usfmJs);

var _stringPunctuationTokenizer = require('string-punctuation-tokenizer');

var _stringPunctuationTokenizer2 = _interopRequireDefault(_stringPunctuationTokenizer);

var _aligner = require('../aligner.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Gets the occurrence of a subString in words by counting up to subString index
 * @param {String|Array} words - word list or string to search
 * @param {Number} currentWordIndex - index of desired word in words
 * @param {String} subString - The sub string to search for
 * @return {Integer} - the occurrence of the word at currentWordIndex
 */
var getOccurrence = exports.getOccurrence = function getOccurrence(words, currentWordIndex, subString) {
  if (typeof words === 'string') {
    return _stringPunctuationTokenizer2.default.occurrenceInString(words, currentWordIndex, subString);
  }

  var occurrence = 0;
  if (Array.isArray(words)) {
    for (var i = 0; i <= currentWordIndex; i++) {
      if ((0, _aligner.getWordText)(words[i]) === subString) occurrence++;
    }
  }
  return occurrence;
};

/**
 * Function that count occurrences of a substring in words
 * @param {String|Array} words - word list or string to search
 * @param {String} subString - The sub string to search for
 * @return {Integer} - the count of the occurrences
 */
var getOccurrences = exports.getOccurrences = function getOccurrences(words, subString) {
  if (typeof words === 'string') {
    return _stringPunctuationTokenizer2.default.occurrencesInString(words, subString);
  }

  var occurrences = 0;
  if (Array.isArray(words)) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = (0, _getIterator3.default)(words), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var word = _step.value;

        if ((0, _aligner.getWordText)(word) === subString) occurrences++;
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
  }
  return occurrences;
};

/**
 * @description verseObjects with occurrences from verseObjects
 * @param {Array} verseObjects - Word list to add occurrence(s) to
 * @return {Array} - verseObjects with occurrences
 */
var getOrderedVerseObjects = exports.getOrderedVerseObjects = function getOrderedVerseObjects(verseObjects) {
  var _verseObjects = JSON.parse((0, _stringify2.default)(verseObjects)); // clone data before modifying
  _verseObjects.forEach(function (verseObject, i) {
    if (verseObject.type === 'word') {
      verseObject.occurrence = getOccurrence(_verseObjects, i, verseObject.text);
      verseObject.occurrences = getOccurrences(_verseObjects, verseObject.text);
    }
  });
  return _verseObjects;
};
/**
 * @description verseObjects with occurrences via string
 * @param {String} string - The string to search in
 * @returns {Array} - verseObjects with occurrences
 */

var getOrderedVerseObjectsFromString = exports.getOrderedVerseObjectsFromString = function getOrderedVerseObjectsFromString(string) {
  if (!string) return [];
  var verseObjects = [];
  // convert string using usfm to JSON
  var _verseObjects = _usfmJs2.default.toJSON('\\v 1 ' + string, { chunk: true }).verses["1"].verseObjects;
  var _verseObjectsWithTextString = _verseObjects.map(function (verseObject) {
    return verseObject.text;
  }).filter(function (text) {
    return text;
  }).join(' ');
  var nonWordVerseObjectCount = 0;
  _verseObjects.forEach(function (_verseObject) {
    if (_verseObject.text) {
      _stringPunctuationTokenizer2.default.tokenizeWithPunctuation(_verseObject.text).forEach(function (text) {
        var verseObject = void 0;
        if (_stringPunctuationTokenizer2.default.word.test(text)) {
          // if the text has word characters, its a word object
          var wordIndex = verseObjects.length - nonWordVerseObjectCount;
          var occurrence = _stringPunctuationTokenizer2.default.occurrenceInString(_verseObjectsWithTextString, wordIndex, text);
          var occurrences = _stringPunctuationTokenizer2.default.occurrencesInString(_verseObjectsWithTextString, text);
          if (occurrence > occurrences) occurrence = occurrences;
          verseObject = {
            tag: "w",
            type: "word",
            text: text,
            occurrence: occurrence,
            occurrences: occurrences
          };
        } else {
          // the text does not have word characters
          nonWordVerseObjectCount++;
          verseObject = {
            type: "text",
            text: text
          };
        }
        verseObjects.push(verseObject);
      });
    } else {
      verseObjects.push(_verseObject);
    }
  });
  return verseObjects;
};

/**
 * @description Nests the milestons so that the first is the root and each after is nested
 * @param {Array} milestones - an array of milestone objects
 * @return {Object} - the nested milestone
 */
var nestMilestones = exports.nestMilestones = function nestMilestones(milestones) {
  var _milestones = JSON.parse((0, _stringify2.default)(milestones));
  var milestone = void 0;
  _milestones.reverse();
  _milestones.forEach(function (_milestone) {
    if (milestone) {
      // if the milestone was already there
      _milestone.children = [milestone]; // nest the existing milestone as children
      milestone = _milestone; // replace the milestone with this one
    } else {
      // if this is the first milestone, populate it
      milestone = _milestone;
    }
    // next loop will use the resulting milestone to nest until no more milestones
  });
  return milestone;
};

/**
 * @description Converts a bottomWord to a verseObject of tag: w, type: word
 * @param {Object} bottomWord - a wordObject to convert
 * @param {string} textKey - key of the text in the bottom word object
 * @return {Object} - a verseObject of tag: w, type: word
 */
var wordVerseObjectFromBottomWord = exports.wordVerseObjectFromBottomWord = function wordVerseObjectFromBottomWord(bottomWord) {
  var textKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'word';
  return {
    tag: "w",
    type: "word",
    text: bottomWord[textKey],
    occurrence: bottomWord.occurrence,
    occurrences: bottomWord.occurrences
  };
};

/**
 * @description Converts a topWord to a verseObject of tag: w, type: word
 * @param {Object} topWord - a wordObject to convert
 * @return {Object} - a verseObject of tag: w, type: word
 */
var milestoneVerseObjectFromTopWord = exports.milestoneVerseObjectFromTopWord = function milestoneVerseObjectFromTopWord(topWord) {
  var verseObject = JSON.parse((0, _stringify2.default)(topWord));
  verseObject.tag = "zaln";
  verseObject.type = "milestone";
  verseObject.content = topWord.word;
  delete verseObject.word;
  delete verseObject.tw;
  return verseObject;
};

/**
 * @description Converts a verseObject of tag: w, type: word into an alignmentObject
 * @param {Object} verseObject - a wordObject to convert
 * @return {Object} - an alignmentObject
 */
var alignmentObjectFromVerseObject = exports.alignmentObjectFromVerseObject = function alignmentObjectFromVerseObject(verseObject) {
  var wordObject = JSON.parse((0, _stringify2.default)(verseObject));
  wordObject.word = wordObject.text || wordObject.content;
  delete wordObject.content;
  delete wordObject.text;
  delete wordObject.tag;
  delete wordObject.type;
  delete wordObject.children;
  return wordObject;
};

/**
 * @description Returns index of the verseObject in the verseObjects (ignores occurrences since that can be off)
 * @param {Array} verseObjects - array of the verseObjects to search in
 * @param {Object} verseObject - verseObject to search for
 * @return {Int} - the index of the verseObject
 */
var indexOfVerseObject = exports.indexOfVerseObject = function indexOfVerseObject(verseObjects, verseObject) {
  return verseObjects.findIndex(function (_verseObject) {
    return _verseObject.text === verseObject.text && _verseObject.occurrence === verseObject.occurrence && _verseObject.type === verseObject.type && _verseObject.tag === verseObject.tag;
  });
};

/**
 * extracts word objects from verse object. If verseObject is word type, return that in array, else if it is a
 * milestone, then add words found in children to word array.  If no words found return empty array.
 * @param {object} verseObject - verse objects to have words extracted from
 * @return {Array} words found
 */
var extractWordsFromVerseObject = exports.extractWordsFromVerseObject = function extractWordsFromVerseObject(verseObject) {
  var words = [];
  if ((typeof verseObject === 'undefined' ? 'undefined' : (0, _typeof3.default)(verseObject)) === 'object') {
    if (verseObject.word || verseObject.type === 'word') {
      words.push(verseObject);
    } else if (verseObject.type === 'milestone' && verseObject.children) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = (0, _getIterator3.default)(verseObject.children), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var child = _step2.value;

          var childWords = extractWordsFromVerseObject(child);
          words = words.concat(childWords);
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
    }
  }
  return words;
};

/**
 * @description merge verse data into a string
 * @param {Object|Array} verseData - verse objects to be merged
 * @param {array} filter - Optional filter to get a specific type of word object type.
 * @return {String} - the merged verse object string
 */
var mergeVerseData = exports.mergeVerseData = function mergeVerseData(verseData, filter) {
  if (verseData.verseObjects) {
    verseData = verseData.verseObjects;
  }
  var verseArray = [];
  verseData.forEach(function (part) {
    if (typeof part === 'string') {
      verseArray.push(part);
    }
    var words = [part];
    if (part.type === 'milestone') {
      words = extractWordsFromVerseObject(part);
    }
    words.forEach(function (word) {
      if (!filter || word.text && word.type && filter.includes(word.type)) {
        verseArray.push(word.text);
      }
    });
  });
  var verseText = '';
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = (0, _getIterator3.default)(verseArray), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var verse = _step3.value;

      if (verse) {
        if (verseText && verseText[verseText.length - 1] !== '\n') {
          verseText += ' ';
        }
        verseText += verse;
      }
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

  return verseText;
};

/**
 * extract list of word objects from array of verseObjects (will also search children of milestones).
 * @param {Array} verseObjects - verse objects to search for word list from
 * @return {Array} - words found
 */
var getWordListFromVerseObjectArray = exports.getWordListFromVerseObjectArray = function getWordListFromVerseObjectArray(verseObjects) {
  var wordList = [];
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = (0, _getIterator3.default)(verseObjects), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var verseObject = _step4.value;

      var words = extractWordsFromVerseObject(verseObject);
      wordList = wordList.concat(words);
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

  return wordList;
};

var addContentAttributeToChildren = function addContentAttributeToChildren(childrens, parentObject, grandParentObject) {
  return childrens.map(function (child) {
    if (child.children) {
      child = addContentAttributeToChildren(child.children, child, parentObject);
    } else if (!child.content && parentObject.content) {
      var childrenContent = [parentObject];
      if (grandParentObject) childrenContent.push(grandParentObject);
      child.content = childrenContent;
    }
    return child;
  });
};

/**
 * @description flatten verse objects from nested format to flat array
 * @param {array} verse - source array of nested verseObjects
 * @param {array} words - output array that will be filled with flattened verseObjects
 */
var flattenVerseObjects = function flattenVerseObjects(verse, words) {
  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = (0, _getIterator3.default)(verse), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var object = _step5.value;

      if (object) {
        if (object.type === 'word') {
          object.strong = object.strong || object.strongs;
          words.push(object);
        } else if (object.type === 'milestone') {
          // get children of milestone
          // add content attibute to children
          var newObject = addContentAttributeToChildren(object.children, object);
          flattenVerseObjects(newObject, words);
        } else {
          words.push(object);
        }
      }
    }
  } catch (err) {
    _didIteratorError5 = true;
    _iteratorError5 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion5 && _iterator5.return) {
        _iterator5.return();
      }
    } finally {
      if (_didIteratorError5) {
        throw _iteratorError5;
      }
    }
  }
};

/**
 * @description returns a flat array of VerseObjects (currently needed for rendering UGNT since words may be nested in milestones)
 * @param {Object|Array} verse - verseObjects that need to be flattened.
 * @return {array} wordlist - flat array of VerseObjects
 */
var getWordListForVerse = exports.getWordListForVerse = function getWordListForVerse(verse) {
  var words = [];
  if (verse.verseObjects) {
    flattenVerseObjects(verse.verseObjects, words);
  } else {
    // already a flat word list
    words = verse;
  }
  return words;
};

/** Method to filter usfm markers from a string or verseObjects array
 * @param {String|Array|Object} verseObjects - The string to remove markers from
 * @return {Array} - Array without usfm markers
 */
var getWordList = exports.getWordList = function getWordList(verseObjects) {
  var wordList = [];
  if (typeof verseObjects === 'string') {
    verseObjects = getOrderedVerseObjectsFromString(verseObjects);
  }
  if (verseObjects && verseObjects.verseObjects) {
    verseObjects = verseObjects.verseObjects;
  }

  if (verseObjects) {
    wordList = getWordListFromVerseObjectArray(verseObjects);
  }
  return wordList;
};