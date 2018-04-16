'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usfmToJSON = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _USFM = require('./USFM');

var USFM = _interopRequireWildcard(_USFM);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var VERSE_SPAN_REGEX = /(^-\d+\s)/; /**
                                     * @description for converting from USFM to json format.  Main method is usfmToJSON()
                                     */

var NUMBER = /(\d+)/;

/**
 * @description - Finds all of the regex matches in a string
 * @param {String} string - the string to find matches in
 * @param {RegExp} regex - the RegExp to find matches with, must use global flag /.../g
 * @param {Boolean} lastLine - true if last line of file
 * @return {Array} - array of results
*/
var getMatches = function getMatches(string, regex, lastLine) {
  var matches = [];
  var match = void 0;
  if (string.match(regex)) {
    // check so you don't get caught in a loop
    while (match = regex.exec(string)) {
      // preserve white space
      var nextChar = null;
      var endPos = match.index + match[0].length;
      if (!lastLine && endPos >= string.length) {
        nextChar = "\n"; // save new line
      } else {
        var char = string[endPos];
        if (char === ' ') {
          nextChar = char; // save space
        }
      }
      if (nextChar) {
        match.nextChar = nextChar;
      }
      matches.push(match);
    }
  }
  return matches;
};

/**
 * @description - Parses the marker that opens and describes content
 * @param {String} markerOpen - the string that contains the marker '\v 1', '\p', ...
 * @return {Object} - the object of tag and number if it exists
*/
var parseMarkerOpen = function parseMarkerOpen(markerOpen) {
  var object = {};
  if (markerOpen) {
    var regex = /(\w+)\s*(\d*)/g;
    var matches = getMatches(markerOpen, regex, true);
    object = {
      tag: matches[0][1],
      number: matches[0][2]
    };
  }
  return object;
};

/**
 * @description - trim a leading space
 * @param {String} text - text to trim
 * @return {String} trimmed string
 */
var removeLeadingSpace = function removeLeadingSpace(text) {
  if (text && text.length > 1 && text[0] === " ") {
    text = text.substr(1);
  }
  return text;
};

/**
 * @description - Parses the word marker into word object
 * @param {object} state - holds parsing state information
 * @param {String} wordContent - the string to find the data/attributes
 * @return {Object} - object of the word attributes
*/
var parseWord = function parseWord(state, wordContent) {
  var object = {};
  var wordParts = wordContent.split('|');
  var word = wordParts[0].trim();
  var attributeContent = wordParts[1];
  object = {
    text: word,
    tag: 'w',
    type: 'word'
  };
  if (state.params["content-source"]) {
    object["content-source"] = state.params["content-source"];
  }
  if (attributeContent) {
    var regex = /[x-]*([\w-]+)=['"](.*?)['"]/g;
    var matches = getMatches(attributeContent, regex, true);
    matches.forEach(function (match) {
      var key = match[1];
      if (key === "strongs") {
        // fix invalid 'strongs' key
        key = "strong";
      }
      if (state.params.map && state.params.map[key]) {
        // see if we should convert this key
        key = state.params.map[key];
      }
      var value = match[2];
      if (state.params.convertToInt && state.params.convertToInt.includes(key)) {
        value = parseInt(value, 10);
      }
      object[key] = value;
    });
  }
  return object;
};

/**
 * @description - make a marker object that contains the text
 * @param {string} text - text to embed in object
 * @return {{content: *}} new text marker
 */
var makeTextMarker = function makeTextMarker(text) {
  return {
    content: text
  };
};

/**
 * @description create marker object from text
 * @param {String} text - text to put in marker
 * @return {object} new marker
 */
var createMarkerFromText = function createMarkerFromText(text) {
  return {
    open: text,
    tag: text
  };
};

/**
 * @description - Parses the line and determines what content is in it
 * @param {String} line - the string to find the markers and content
 * @param {Boolean} lastLine - true if last line of file
 * @return {Array} - array of objects that describe open/close and content
*/
var parseLine = function parseLine(line, lastLine) {
  var array = [];
  if (line.trim() === '') {
    if (!lastLine) {
      var object = makeTextMarker(line + '\n');
      array.push(object);
    }
    return array;
  }
  var regex = /([^\\]+)?\\(\w+\s*\d*)(?!\w)\s*([^\\]+)?(\\\w\*)?/g;
  var matches = getMatches(line, regex, lastLine);
  var lastObject = null;
  if (regex.exec(line)) {
    // normal formatting with marker followed by content
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = (0, _getIterator3.default)(matches), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var match = _step.value;

        var orphan = match[1];
        if (orphan) {
          var _object3 = { content: orphan };
          array.push(_object3);
        }
        var open = match[2] ? match[2].trim() : undefined;
        var content = match[3] || undefined;
        var close = match[4] ? match[4].trim() : undefined;
        var marker = parseMarkerOpen(open);
        var _object2 = {
          open: open,
          tag: marker.tag,
          number: marker.number,
          content: content
        };

        var whiteSpaceInOpen = open !== match[2];
        if (whiteSpaceInOpen && !marker.number) {
          var shouldMatch = '\\' + open + (content ? ' ' + content : "");
          if (removeLeadingSpace(match[0]) !== shouldMatch) {
            // look for dropped inside white space
            var _endPos = match.index + match[0].length;
            var lineLength = line.length;
            var runToEnd = _endPos >= lineLength;
            if (runToEnd) {
              _object2.content = match[2].substr(open.length) + (content || "");
            }
          }
        }

        if (marker.number && !USFM.markerSupportsNumbers(marker.tag)) {
          // this tag doesn't have number, move to content
          delete _object2.number;
          var newContent = void 0;
          var tagPos = match[0].indexOf(marker.tag);
          if (tagPos >= 0) {
            newContent = match[0].substr(tagPos + marker.tag.length + 1);
          } else {
            newContent = marker.number + ' ' + (content || "");
          }
          _object2.content = newContent;
        }
        if (close) {
          array.push(_object2);
          var closeTag = close.substr(1);
          _object2 = createMarkerFromText(closeTag);
        }
        if (match.nextChar) {
          _object2.nextChar = match.nextChar;
        }
        array.push(_object2);
        lastObject = _object2;
      }
      // check for leftover text at end of line
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

    if (matches.length) {
      var lastMatch = matches[matches.length - 1];
      var endPos = lastMatch.index + lastMatch[0].length;
      if (endPos < line.length) {
        var orphanText = line.substr(endPos) + '\n';
        if (lastObject && lastObject.nextChar && lastObject.nextChar === ' ') {
          orphanText = orphanText.substr(1); // remove first space since already handled
        }
        var _object = makeTextMarker(orphanText);
        array.push(_object);
      }
    }
  } else {
    // doesn't have a marker but may have content
    // this is considered an orphaned line
    var _object4 = makeTextMarker(line + '\n');
    array.push(_object4);
  }
  return array;
};

/**
 * get top phrase if doing phrase (milestone)
 * @param {object} state - holds parsing state information
 * @return {object} location to add to phrase or null
 */
var getLastPhrase = function getLastPhrase(state) {
  if (state.phrase !== null) {
    return state.phrase[state.phrase.length - 1];
  }
  return null;
};

/**
 * @description - get location for chapter/verse, if location doesn't exist, create it.
 * @param {object} state - holds parsing state information
 * @return {array} location to place verse content
 */
var getSaveToLocation = function getSaveToLocation(state) {
  var phrase = getLastPhrase(state);
  if (phrase !== null) {
    return phrase;
  }

  if (state.params.chunk) {
    if (!state.verses[state.currentVerse]) {
      state.verses[state.currentVerse] = [];
    }
    return state.verses[state.currentVerse];
  }

  if (!state.currentVerse) {
    state.currentVerse = 'front';
  }
  if (!state.chapters[state.currentChapter][state.currentVerse]) state.chapters[state.currentChapter][state.currentVerse] = [];

  return state.chapters[state.currentChapter][state.currentVerse];
};

/**
 * @description - create a USFM object with fields passed
 * @param {string|null} tag - string to use for tag
 * @param {string|null} number - optional number attribute
 * @param {string} content - optional content (may be saved as content or text depending on tag)
 * @return {{tag: *}} USFM object
 */
var createUsfmObject = function createUsfmObject(tag, number, content) {
  var output = {};
  var contentAttr = void 0;
  if (tag) {
    output.tag = tag;
    if (USFM.MARKER_TYPE[tag]) {
      output.type = USFM.MARKER_TYPE[tag];
    }
    contentAttr = USFM.markContentAsText(tag) ? 'text' : 'content';
  } else {
    // default to text type
    contentAttr = output.type = "text";
  }
  if (number) {
    if (USFM.markerSupportsNumbers(tag)) {
      output.number = number;
    } else {
      // handle rare case that parser places part of content as number
      var newContent = number;
      if (content) {
        newContent += ' ' + content;
      }
      content = newContent;
    }
  }
  if (content) {
    output[contentAttr] = content;
  }
  return output;
};

/**
 * @description push usfm object to array, and concat strings of last array item is also string
 * @param {object} state - holds parsing state information
 * @param {array} saveTo - location to place verse content
 * @param {object|string} usfmObject - object that contains usfm marker, or could be raw text
 */
var pushObject = function pushObject(state, saveTo, usfmObject) {
  if (!Array.isArray(saveTo)) {
    var phrase = getLastPhrase(state);
    if (phrase === null) {
      var isNestedMarker = state.nested.length > 0;
      if (isNestedMarker) {
        // if this marker is nested in another marker, then we need to add to content as string
        var last = state.nested.length - 1;
        var contentAttr = USFM.markContentAsText(usfmObject.tag) ? 'text' : 'content';
        var lastObject = state.nested[last];
        var output = lastObject[contentAttr];
        if (typeof usfmObject === "string") {
          output += usfmObject;
        } else {
          output += '\\' + usfmObject.tag;
          var content = usfmObject.text || usfmObject.content;
          if (content) {
            if (content[0] !== ' ') {
              output += ' ';
            }
            output += content;
          }
        }
        lastObject[contentAttr] = output;
        return;
      }
    } else {
      saveTo = phrase;
    }
  }

  if (typeof usfmObject === "string") {
    // if raw text, convert to object
    if (usfmObject === '') {
      // skip empty strings
      return;
    }
    usfmObject = createUsfmObject(null, null, usfmObject);
  }

  saveTo = Array.isArray(saveTo) ? saveTo : getSaveToLocation(state);
  if (saveTo.length && usfmObject.type === "text") {
    // see if we can append to previous string
    var lastPos = saveTo.length - 1;
    var _lastObject = saveTo[lastPos];
    if (_lastObject.type === "text") {
      _lastObject.text += usfmObject.text;
      return;
    }
  }
  saveTo.push(usfmObject);
};

/**
 * @description test if last character was newline (or return) char
 * @param {String} line - line to test
 * @return {boolean} true if newline
 */
var isLastCharNewLine = function isLastCharNewLine(line) {
  var lastChar = line ? line.substr(line.length - 1) : '';
  var index = ['\n', '\r'].indexOf(lastChar);
  return index >= 0;
};

/**
 * @description test if next to last character is quote
 * @param {String} line - line to test
 * @return {boolean} true if newline
 */
var isNextToLastCharQuote = function isNextToLastCharQuote(line) {
  var nextToLastChar = line && line.length >= 2 ? line.substr(line.length - 2, 1) : '';
  var index = ['"', '“'].indexOf(nextToLastChar);
  return index >= 0;
};

/**
 * @description - remove previous new line from text
 * @param {object} state - holds parsing state information
 * @param {boolean} ignoreQuote - if true then don't remove last new line if preceded by quote.
 */
var removeLastNewLine = function removeLastNewLine(state) {
  var ignoreQuote = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var saveTo = getSaveToLocation(state);
  if (saveTo && saveTo.length) {
    var lastObject = saveTo[saveTo.length - 1];
    if (lastObject.type === 'text') {
      var text = lastObject.text;
      if (isLastCharNewLine(text)) {
        var removeNewLine = !ignoreQuote || !isNextToLastCharQuote(text);
        if (removeNewLine) {
          if (text.length === 1) {
            saveTo.pop();
          } else {
            lastObject.text = text.substr(0, text.length - 1);
          }
        }
      }
    }
  }
};

/**
 * @description - rollback nested to endpoint for this tag
 * @param {object} state - holds parsing state information
 * @param {String} content - usfm marker content
 * @param {String} tag - usfm marker tag
 * @param {string} nextChar - next character after marker
 */
var unPopNestedMarker = function unPopNestedMarker(state, content, tag, nextChar) {
  var extra = content.substr(1); // pull out data after end marker
  if (tag[tag.length - 1] === "*") {
    tag = tag.substr(0, tag.length - 1);
  }
  var found = false;
  for (var j = state.nested.length - 1; j >= 0; j--) {
    var stackTYpe = state.nested[j].tag;
    if (tag === stackTYpe) {
      while (state.nested.length > j) {
        // rollback nested to this point
        state.nested.pop();
      }
      found = true;
      break;
    }
  }
  if (!found) {
    // since nested and not in stack, add end marker to text content
    pushObject(state, null, '\\' + tag + '*');
  }
  if (extra) {
    pushObject(state, null, extra);
  }
  if (nextChar) {
    pushObject(state, null, nextChar);
  }
};

/**
 * @description - save the usfm object to specified place and handle nested data
 * @param {object} state - holds parsing state information
 * @param {String} tag - usfm marker tag
 * @param {object} usfmObject - object that contains usfm marker
 */
var saveUsfmObject = function saveUsfmObject(state, tag, usfmObject) {
  var isNestedMarker = state.nested.length > 0;
  if (isNestedMarker) {
    pushObject(state, null, usfmObject);
  } else {
    // not nested
    var saveTo = getSaveToLocation(state);
    saveTo.push(usfmObject);
    if (USFM.markerRequiresTermination(tag)) {
      // need to handle nested data
      state.nested.push(usfmObject);
    }
  }
};

/**
 * @description normalize the numbers in string by removing leading '0'
 * @param {string} text - number string to normalize
 * @return {string} normalized number string
 */
var stripLeadingZeros = function stripLeadingZeros(text) {
  while (text.length > 1 && text[0] === '0') {
    text = text.substr(1);
  }
  return text;
};

/**
 * @description - adds usfm object to current verse and handles nested USFM objects
 * @param {object} state - holds parsing state information
 * @param {object} usfmObject - object that contains usfm marker
 * @param {String} tag - usfm marker tag
 */
var addToCurrentVerse = function addToCurrentVerse(state, usfmObject) {
  var tag = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  tag = tag || usfmObject.tag;
  if (!tag) {
    pushObject(state, null, usfmObject);
    return;
  }

  var content = usfmObject.content || "";
  var isEndMarker = content && content[0] === "*" || tag[tag.length - 1] === "*";
  if (isEndMarker) {
    // check for end marker
    unPopNestedMarker(state, content, tag, usfmObject.nextChar);
  } else {
    if (usfmObject.nextChar && !usfmObject.close) {
      content += usfmObject.nextChar;
    }
    var output = createUsfmObject(tag, null, content);
    saveUsfmObject(state, tag, output);
  }
};

/**
 * @description - process marker as a verse
 * @param {object} state - holds parsing state information
 * @param {object} marker - marker object containing content
 */
var parseAsVerse = function parseAsVerse(state, marker) {
  state.nested = [];
  marker.content = marker.content || "";
  if (marker.nextChar === "\n") {
    marker.content += marker.nextChar;
  }
  state.currentVerse = stripLeadingZeros(marker.number);

  // check for verse span
  var spanMatch = VERSE_SPAN_REGEX.exec(marker.content);
  if (spanMatch) {
    state.currentVerse += spanMatch[0][0] + stripLeadingZeros(spanMatch[0].substr(1).trim());
    marker.content = marker.content.substr(spanMatch[0].length);
  }

  if (state.params.chunk && !state.onSameChapter) {
    if (state.verses[state.currentVerse]) {
      state.onSameChapter = true;
    } else {
      state.verses[state.currentVerse] = [];
      pushObject(state, null, marker.content);
    }
  } else if (state.chapters[state.currentChapter] && !state.onSameChapter) {
    // if the current chapter exists, not on same chapter, and there is content to store
    if (state.chapters[state.currentChapter][state.currentVerse]) {
      // If the verse already exists, then we are flagging as 'on the same chapter'
      state.onSameChapter = true;
    } else {
      pushObject(state, null, marker.content);
    }
  }
};

/**
 * @description - process marker as text
 * @param {object} state - holds parsing state information
 * @param {object} marker - marker object containing content
 */
var processAsText = function processAsText(state, marker) {
  if (state.currentChapter > 0 && marker.content) {
    addToCurrentVerse(state, marker.content);
  } else if (state.currentChapter === 0 && !state.currentVerse) {
    // if we haven't seen chapter yet, its a header
    pushObject(state, state.headers, createUsfmObject(marker.tag, marker.number, marker.content));
  }
  if (state.params.chunk && state.currentVerse > 0 && marker.content) {
    if (!state.verses[state.currentVerse]) state.verses[state.currentVerse] = [];
    pushObject(state, state.verses[state.currentVerse], marker.content);
  }
};

/**
 * @description - convert marker to text
 * @param {object} marker - object to convert to text
 * @return {string} text representation of marker
 */
var markerToText = function markerToText(marker) {
  var text = '\\' + marker.tag;
  if (marker.number) {
    text += " " + marker.number;
  }
  text += marker.content ? " " + marker.content : "";
  if (marker.nextChar) {
    text += marker.nextChar;
  }
  return text;
};

/**
 * @description - process marker as a chapter
 * @param {object} state - holds parsing state information
 * @param {object} marker - marker object containing content
 */
var processAsChapter = function processAsChapter(state, marker) {
  state.nested = [];
  state.currentChapter = stripLeadingZeros(marker.number);
  state.chapters[state.currentChapter] = {};
  // resetting 'on same chapter' flag
  state.onSameChapter = false;
  state.currentVerse = 0;
};

/**
 * @description - see if verse number in content
 * @param {object} marker - marker object containing content
 */
var extractNumberFromContent = function extractNumberFromContent(marker) {
  var numberMatch = NUMBER.exec(marker.content);
  if (numberMatch) {
    marker.number = numberMatch[0];
    marker.content = marker.content.substr(numberMatch.length);
  }
};

var getVerseObjectsForChapter = function getVerseObjectsForChapter(currentChapter) {
  var outputChapter = {};
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = (0, _getIterator3.default)((0, _keys2.default)(currentChapter)), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var verseNum = _step2.value;

      var verseObjects = currentChapter[verseNum];
      outputChapter[verseNum] = {
        verseObjects: verseObjects
      };
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

  return outputChapter;
};

var getVerseObjectsForBook = function getVerseObjectsForBook(usfmJSON, state) {
  usfmJSON.chapters = {};
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = (0, _getIterator3.default)((0, _keys2.default)(state.chapters)), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var chapterNum = _step3.value;

      var currentChapter = state.chapters[chapterNum];
      usfmJSON.chapters[chapterNum] = getVerseObjectsForChapter(currentChapter);
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
};

/**
 * @description - Parses the usfm string and returns an object
 * @param {String} usfm - the raw usfm string
 * @param {Object} params - extra params to use for chunk parsing. Properties:
 *                    chunk {boolean} - if true then output is just a small piece of book
 *                    content-source {String} - content source attribute to add to word imports
 *                    convertToInt {Array} - attributes to convert to integer
 * @return {Object} - json object that holds the parsed usfm data, headers and chapters
*/
var usfmToJSON = exports.usfmToJSON = function usfmToJSON(usfm) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  USFM.init();
  var lines = usfm.split(/\r?\n/); // get all the lines
  var usfmJSON = {};
  var markers = [];
  var lastLine = lines.length - 1;
  for (var i = 0; i < lines.length; i++) {
    var parsedLine = parseLine(lines[i], i >= lastLine);
    markers = markers.concat(parsedLine);
  }
  var state = {
    currentChapter: 0,
    currentVerse: 0,
    chapters: {},
    verses: {},
    headers: [],
    nested: [],
    phrase: null,
    onSameChapter: false,
    params: params
  };
  for (var _i = 0; _i < markers.length; _i++) {
    var marker = markers[_i];
    switch (marker.tag) {
      case 'c':
        {
          // chapter
          if (!marker.number && marker.content) {
            // if no number, try to find in content
            extractNumberFromContent(marker);
          }
          if (marker.number) {
            processAsChapter(state, marker);
          } else {
            // no chapter number, add as text
            marker.content = markerToText(marker);
            processAsText(state, marker);
          }
          break;
        }
      case 'v':
        {
          // verse
          if (!marker.number && marker.content) {
            // if no number, try to find in content
            extractNumberFromContent(marker);
          }
          if (marker.number) {
            parseAsVerse(state, marker);
          } else {
            // no verse number, add as text
            marker.content = markerToText(marker);
            processAsText(state, marker);
          }
          break;
        }
      case 'k':
      case 'zaln':
        {
          // phrase
          removeLastNewLine(state);
          var phrase = parseWord(state, marker.content); // very similar to word marker, so start with this and modify
          phrase.type = "milestone";
          var milestone = phrase.text.trim();
          if (milestone === '-s') {
            // milestone start
            var saveTo = getSaveToLocation(state);
            phrase.tag = marker.tag;
            delete phrase.text;
            if (state.phrase === null) {
              state.phrase = []; // create new phrase stack
            }
            state.phrase.push([]); // push new empty list onto phrase stack
            phrase.children = getLastPhrase(state); // point to top of phrase stack
            pushObject(state, saveTo, phrase);
          } else if (milestone === '-e') {
            // milestone end
            if (state.phrase.length > 1) {
              state.phrase.pop(); // remove last phrases
            } else {
              state.phrase = null; // stop adding to phrases
            }
            if (_i + 1 < markers.length && markers[_i + 1].content) {
              var content = markers[_i + 1].content;
              var trimLength = 0;
              if (content.substr(0, 2) === "\\*") {
                // check if next marker is part of milestone end
                trimLength = 2;
              }
              if (content[0] === "*") {
                // check if next marker is part of milestone end
                trimLength = 1;
              }
              if (trimLength) {
                if (content.substr(trimLength, 1) === '\n') {
                  trimLength++;
                }
                content = content.substr(trimLength); // remove phrase end marker
                if (content) {
                  markers[_i + 1].content = content;
                } else {
                  // no text after end marker
                  _i++; // skip following text
                }
              }
            }
          }
          break;
        }
      case 'w':
        {
          // word
          removeLastNewLine(state, true);
          var wordObject = parseWord(state, marker.content);
          pushObject(state, null, wordObject);
          if (marker.nextChar) {
            pushObject(state, null, marker.nextChar);
          }
          break;
        }
      case 'w*':
        {
          if (marker.nextChar && marker.nextChar !== ' ') {
            pushObject(state, null, marker.nextChar);
          }
          break;
        }
      case undefined:
        {
          // likely orphaned text for the preceding verse marker
          processAsText(state, marker);
          break;
        }
      default:
        {
          var tag0 = marker.tag ? marker.tag.substr(0, 1) : "";
          if (tag0 === 'v' || tag0 === 'c') {
            // check for mangled verses and chapters
            var number = marker.tag.substr(1);
            var isInt = /^\+?\d+$/.test(number);
            if (isInt) {
              // separate number from tag
              marker.tag = tag0;
              if (marker.number) {
                marker.content = marker.number + (marker.content ? " " + marker.content : "");
              }
              marker.number = number;
              if (tag0 === 'v') {
                parseAsVerse(state, marker);
                marker = null;
              } else if (tag0 === 'c') {
                processAsChapter(state, marker);
                marker = null;
              }
            } else if (marker.tag.length === 1) {
              // convert line to text
              marker.content = markerToText(marker);
              processAsText(state, marker);
              marker = null;
            }
          }
          if (marker) {
            // if not yet processed
            if (state.currentChapter === 0 && !state.currentVerse) {
              // if we haven't seen chapter yet, its a header
              pushObject(state, state.headers, createUsfmObject(marker.tag, marker.number, marker.content));
            } else if (state.currentChapter || state.params.chunk && state.currentVerse) {
              addToCurrentVerse(state, marker);
            }
          }
        }
    }
  }
  usfmJSON.headers = state.headers;
  getVerseObjectsForBook(usfmJSON, state);
  if ((0, _keys2.default)(state.verses).length > 0) {
    usfmJSON.verses = getVerseObjectsForChapter(state.verses);
  }
  return usfmJSON;
};